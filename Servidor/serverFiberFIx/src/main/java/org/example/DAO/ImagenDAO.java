package org.example.DAO;

import org.example.Server.Log;

import java.sql.*;

/**
 * DAO para gestionar las imágenes asociadas a los tickets
 * Maneja el almacenamiento, recuperación y eliminación de imágenes
 */
public class ImagenDAO {

    /**
     * Guardar una imagen asociada a un ticket
     *
     * @param idTicket ID del ticket
     * @param datosImagen Datos binarios de la imagen (BLOB)
     * @param nombreArchivo Nombre original del archivo
     * @param tipoMime Tipo MIME de la imagen (ej: image/jpeg)
     * @param tamanoByte Tamaño en bytes de la imagen
     * @param descripcion Descripción opcional de la imagen
     * @return true si se guardó correctamente, false en caso contrario
     */
    public static boolean guardarImagen(
            int idTicket,
            byte[] datosImagen,
            String nombreArchivo,
            String tipoMime,
            long tamanoByte,
            String descripcion
    ) {
        try {
            // Validaciones básicas
            if (datosImagen == null || datosImagen.length == 0) {
                Log.escribirLog("Error: Datos de imagen vacíos para ticket " + idTicket);
                return false;
            }

            if (datosImagen.length > 5 * 1024 * 1024) { // 5MB
                Log.escribirLog("Error: Imagen muy grande (" + tamanoByte + " bytes) para ticket " + idTicket);
                return false;
            }

            // Validar tipos MIME permitidos
            if (!tipoMime.startsWith("image/")) {
                Log.escribirLog("Error: Tipo MIME no permitido: " + tipoMime);
                return false;
            }

            String sql = """
                INSERT INTO Imagen_Ticket 
                (id_ticket, datos_imagen, nombre_archivo, tipo_mime, tamaño_bytes, descripcion)
                VALUES (?, ?, ?, ?, ?, ?)
            """;

            Connection con = ConexionBD.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, idTicket);
            ps.setBytes(2, datosImagen);
            ps.setString(3, nombreArchivo);
            ps.setString(4, tipoMime);
            ps.setLong(5, tamanoByte);
            ps.setString(6, descripcion != null ? descripcion : "");

            int resultado = ps.executeUpdate();
            if (resultado == 1) {
                Log.escribirLog("Imagen guardada para ticket " + idTicket + " (" + nombreArchivo + ")");
                return true;
            }

        } catch (SQLException e) {
            Log.escribirLog("Error guardando imagen: " + e.getMessage());
        }
        return false;
    }

    /**
     * Obtener las imágenes de un ticket
     * Devuelve un JSON con metadatos de las imágenes (sin los datos binarios)
     *
     * @param idTicket ID del ticket
     * @return String JSON con información de las imágenes
     */
    public static String obtenerImagenes(int idTicket) {
        StringBuilder json = new StringBuilder();
        json.append("[");

        String sql = """
            SELECT id, nombre_archivo, tipo_mime, tamaño_bytes, descripcion, fecha_carga
            FROM Imagen_Ticket
            WHERE id_ticket = ?
            ORDER BY fecha_carga DESC
        """;

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, idTicket);
            ResultSet rs = ps.executeQuery();

            boolean primero = true;
            while (rs.next()) {
                if (!primero) json.append(",");
                primero = false;

                json.append("{")
                        .append("\"id\":").append(rs.getInt("id")).append(",")
                        .append("\"nombre\":\"").append(rs.getString("nombre_archivo")).append("\",")
                        .append("\"tipo\":\"").append(rs.getString("tipo_mime")).append("\",")
                        .append("\"tamaño\":").append(rs.getLong("tamaño_bytes")).append(",")
                        .append("\"descripcion\":").append(
                                rs.getString("descripcion") == null || rs.getString("descripcion").isEmpty()
                                        ? "null"
                                        : "\"" + rs.getString("descripcion") + "\""
                        ).append(",")
                        .append("\"fecha\":\"").append(rs.getString("fecha_carga")).append("\"")
                        .append("}");
            }

            json.append("]");
            return json.toString();

        } catch (SQLException e) {
            Log.escribirLog("Error obteniendo imágenes del ticket " + idTicket + ": " + e.getMessage());
            return "[]";
        }
    }

    /**
     * Obtener los datos binarios de una imagen específica
     *
     * @param idImagen ID de la imagen
     * @return byte[] con los datos de la imagen, null si no existe
     */
    public static byte[] obtenerDatosImagen(int idImagen) {
        String sql = "SELECT datos_imagen FROM Imagen_Ticket WHERE id = ?";

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, idImagen);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return rs.getBytes("datos_imagen");
            }

        } catch (SQLException e) {
            Log.escribirLog("Error obteniendo datos de imagen: " + e.getMessage());
        }
        return null;
    }

    /**
     * Obtener metadatos de una imagen sin los datos binarios
     *
     * @param idImagen ID de la imagen
     * @return String JSON con metadatos
     */
    public static String obtenerMetadatosImagen(int idImagen) {
        String sql = """
            SELECT id, id_ticket, nombre_archivo, tipo_mime, tamaño_bytes, descripcion, fecha_carga
            FROM Imagen_Ticket
            WHERE id = ?
        """;

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, idImagen);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return "{" +
                        "\"id\":" + rs.getInt("id") + "," +
                        "\"id_ticket\":" + rs.getInt("id_ticket") + "," +
                        "\"nombre\":\"" + rs.getString("nombre_archivo") + "\"," +
                        "\"tipo\":\"" + rs.getString("tipo_mime") + "\"," +
                        "\"tamaño\":" + rs.getLong("tamaño_bytes") + "," +
                        "\"descripcion\":" + (rs.getString("descripcion") == null ? "null" : "\"" + rs.getString("descripcion") + "\"") + "," +
                        "\"fecha\":\"" + rs.getString("fecha_carga") + "\"" +
                        "}";
            }

        } catch (SQLException e) {
            Log.escribirLog("Error obteniendo metadatos de imagen: " + e.getMessage());
        }
        return null;
    }

    /**
     * Eliminar una imagen específica
     * Nota: El constraint ON DELETE CASCADE eliminará automáticamente las imágenes
     * cuando se elimine el ticket asociado
     *
     * @param idImagen ID de la imagen a eliminar
     * @return true si se eliminó correctamente
     */
    public static boolean eliminarImagen(int idImagen) {
        String sql = "DELETE FROM Imagen_Ticket WHERE id = ?";

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, idImagen);
            int resultado = ps.executeUpdate();

            if (resultado == 1) {
                Log.escribirLog("Imagen " + idImagen + " eliminada correctamente");
                return true;
            }

        } catch (SQLException e) {
            Log.escribirLog("Error eliminando imagen: " + e.getMessage());
        }
        return false;
    }

    /**
     * Eliminar todas las imágenes de un ticket
     * Útil al borrar un ticket completo
     *
     * @param idTicket ID del ticket
     * @return Número de imágenes eliminadas
     */
    public static int eliminarImagenesTicket(int idTicket) {
        String sql = "DELETE FROM Imagen_Ticket WHERE id_ticket = ?";

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, idTicket);
            int resultado = ps.executeUpdate();

            if (resultado > 0) {
                Log.escribirLog(resultado + " imágenes eliminadas del ticket " + idTicket);
            }
            return resultado;

        } catch (SQLException e) {
            Log.escribirLog("Error eliminando imágenes del ticket: " + e.getMessage());
        }
        return 0;
    }

    /**
     * Obtener el contador de imágenes para un ticket
     *
     * @param idTicket ID del ticket
     * @return Número de imágenes asociadas
     */
    public static int contarImágenes(int idTicket) {
        String sql = "SELECT COUNT(*) as cantidad FROM Imagen_Ticket WHERE id_ticket = ?";

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, idTicket);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return rs.getInt("cantidad");
            }

        } catch (SQLException e) {
            Log.escribirLog("Error contando imágenes: " + e.getMessage());
        }
        return 0;
    }

    /**
     * Actualizar la descripción de una imagen
     *
     * @param idImagen ID de la imagen
     * @param descripcion Nueva descripción
     * @return true si se actualizó correctamente
     */
    public static boolean actualizarDescripcion(int idImagen, String descripcion) {
        String sql = "UPDATE Imagen_Ticket SET descripcion = ? WHERE id = ?";

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, descripcion);
            ps.setInt(2, idImagen);

            return ps.executeUpdate() == 1;

        } catch (SQLException e) {
            Log.escribirLog("Error actualizando descripción de imagen: " + e.getMessage());
        }
        return false;
    }
}
