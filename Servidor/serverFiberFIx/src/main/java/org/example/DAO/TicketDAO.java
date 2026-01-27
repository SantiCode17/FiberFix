package org.example.DAO;

import org.example.DTO.Cliente;
import org.example.DTO.Estado;
import org.example.DTO.Ticket;
import org.example.Server.Log;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;

public class TicketDAO {
    // Sacar el idTecnico para las consultas
    private static int obtenerIdTecnico(String usuario) throws SQLException {
        String sql = "SELECT id FROM Tecnico WHERE usuario = ?";

        Connection con = ConexionBD.getConnection();
        PreparedStatement ps = con.prepareStatement(sql);
        ps.setString(1, usuario);

        ResultSet rs = ps.executeQuery();

        if (rs.next()) {
            return rs.getInt("id");
        } else {
            throw new SQLException("Técnico no encontrado");
        }
    }

    // Comprobar si el Ticket ya existe
    private static boolean existeTicket(int numeroTicket, int idTecnico) throws SQLException {
        String sql = """
            SELECT * FROM Ticket
            WHERE numero_ticket = ? AND id_tecnico = ?
        """;

        Connection con = ConexionBD.getConnection();
        PreparedStatement ps = con.prepareStatement(sql);
        ps.setInt(1, numeroTicket);
        ps.setInt(2, idTecnico);

        ResultSet rs = ps.executeQuery();
        return rs.next();
    }

    private static String obtenerEstadoTicket(int numeroTicket, int idTecnico) throws SQLException {
        String sql = "SELECT estado FROM Ticket WHERE numero_ticket = ? AND id_tecnico = ?";

        Connection con = ConexionBD.getConnection();
        PreparedStatement ps = con.prepareStatement(sql);
        ps.setInt(1, numeroTicket);
        ps.setInt(2, idTecnico);

        ResultSet rs = ps.executeQuery();
        if (rs.next()) {
            return rs.getString("estado");
        }
        return null;
    }

    // Crear un Ticket
    public static int iniciarTicket(
            String usuario,
            int numeroTicket,
            LocalDateTime fechaInicio,
            double lat,
            double lon
    ) {
        try {
            int idTecnico = obtenerIdTecnico(usuario); // Sacamos su id

            if (existeTicket(numeroTicket, idTecnico)) {
                String estado = obtenerEstadoTicket(numeroTicket, idTecnico);
                if ("Terminado".equalsIgnoreCase(estado)) {
                    Log.escribirLog("Ticket ya finalizado: " + numeroTicket);
                    return 2; // Codigo para ticket ya finalizado
                }
                Log.escribirLog("Ticket ya existe: " + numeroTicket);
                return 0; // El ticket ya existe
            }

            // Crear el ticket
            String sql = """
                INSERT INTO Ticket (numero_ticket, estado, fecha_inicio, id_tecnico)
                VALUES (?, 'Pendiente', ?, ?)
            """;

            Connection con = ConexionBD.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, numeroTicket);
            ps.setTimestamp(2, Timestamp.valueOf(fechaInicio));
            ps.setInt(3, idTecnico);

            ps.executeUpdate();

            // Guardar Posicion
            PosicionDAO.guardarPosicion(idTecnico, numeroTicket, lat, lon);
            Log.escribirLog("Ticket creado correctamente: " + numeroTicket);
            return 1;
        } catch (SQLException e) {
            Log.escribirLog("Error iniciar ticket: " + e.getMessage());
            return -1;
        } catch (Exception e) {
            Log.escribirLog("Error inesperado al iniciar ticket: " + e.getMessage());
            return -1;
        }
    }

    // Finalizar un Ticket
    public static boolean finalizarTicket(
            String usuario,
            int numeroTicket,
            LocalDateTime fechaFin
    ) {
        try {
            int idTecnico = obtenerIdTecnico(usuario);

            String sql = """
                UPDATE Ticket SET estado = 'Terminado', fecha_cierre = ?
                WHERE numero_ticket = ? AND id_tecnico = ?
            """;

            Connection con = ConexionBD.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setTimestamp(1, Timestamp.valueOf(fechaFin));
            ps.setInt(2, numeroTicket);
            ps.setInt(3, idTecnico);

            return ps.executeUpdate() == 1;

        } catch (Exception e) {
            Log.escribirLog("Error finalizar ticket: " + e.getMessage());
            return false;
        }
    }

    // Registrar una incidencia en un Ticket
    public static boolean registrarIncidencia(
            String usuario,
            int numeroTicket,
            String motivo,
            String descripcion
    ) {
        try {
            int idTecnico = obtenerIdTecnico(usuario);

            String sql = """
                UPDATE Ticket SET estado = 'Cancelado', motivo = ?, descripcion = ?
                WHERE numero_ticket = ?
                  AND id_tecnico = ?
            """;

            Connection con = ConexionBD.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setString(1, motivo);
            ps.setString(2, descripcion);
            ps.setInt(3, numeroTicket);
            ps.setInt(4, idTecnico);

            return ps.executeUpdate() == 1;

        } catch (Exception e) {
            Log.escribirLog("Error incidencia: " + e.getMessage());
            return false;
        }
    }

    // Recuperar historial de Técnico
    public static String obtenerHistorial(String usuario) {
        StringBuilder json = new StringBuilder();
        json.append("[");

        String sql = """
                SELECT t.id, t.numero_ticket, t.estado, t.motivo, t.descripcion, t.fecha_creacion, t.fecha_inicio, t.fecha_cierre
                FROM Ticket t
                JOIN Tecnico te ON t.id_tecnico = te.id
                WHERE te.usuario = ?
                ORDER BY t.fecha_creacion DESC
                """;

        try (
                Connection con = ConexionBD.getConnection();
                PreparedStatement ps = con.prepareStatement(sql);
        ){
            ps.setString(1, usuario);
            ResultSet rs = ps.executeQuery();

            boolean primero = true;

            while (rs.next()) {
                if (!primero) json.append(",");
                primero = false;

                json.append("{")
                        .append("\"id\":").append(rs.getInt("id")).append(",")
                        .append("\"numero_ticket\":").append(rs.getInt("numero_ticket")).append(",")
                        .append("\"estado\":\"").append(rs.getString("estado")).append("\",")
                        .append("\"motivo\":").append(
                                rs.getString("motivo") == null
                                        ? "null"
                                        : "\"" + rs.getString("motivo") + "\""
                        ).append(",")
                        .append("\"descripcion\":").append(
                                rs.getString("descripcion") == null
                                        ? "null"
                                        : "\"" + rs.getString("descripcion") + "\""
                        ).append(",")
                        .append("\"fecha_creacion\":\"").append(rs.getString("fecha_creacion")).append("\",")
                        .append("\"fecha_inicio\":").append(
                                rs.getString("fecha_inicio") == null
                                        ? "null"
                                        : "\"" + rs.getString("fecha_inicio") + "\""
                        ).append(",")
                        .append("\"fecha_cierre\":").append(
                                rs.getString("fecha_cierre") == null
                                        ? "null"
                                        : "\"" + rs.getString("fecha_cierre") + "\""
                        )
                        .append("}");
            }

            json.append("]");
            return json.toString();

        } catch (Exception e) {
            Log.escribirLog("Error HISTORY: " + e.getMessage());
            return "[]";
        }
    }

    /**
     * Editar un ticket existente (motivo y descripción)
     * Solo el técnico propietario del ticket puede editarlo
     */
    public static boolean editarTicket(
            String usuario,
            int idTicket,
            String motivo,
            String descripcion
    ) {
        try {
            int idTecnico = obtenerIdTecnico(usuario);

            String sql = """
                UPDATE Ticket 
                SET motivo = ?, descripcion = ?, fecha_ultima_edicion = NOW()
                WHERE id = ? AND id_tecnico = ?
            """;

            Connection con = ConexionBD.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setString(1, motivo);
            ps.setString(2, descripcion);
            ps.setInt(3, idTicket);
            ps.setInt(4, idTecnico);

            boolean resultado = ps.executeUpdate() == 1;
            if (resultado) {
                Log.escribirLog("Ticket " + idTicket + " editado por técnico " + usuario);
            }
            return resultado;

        } catch (Exception e) {
            Log.escribirLog("Error editando ticket: " + e.getMessage());
            return false;
        }
    }

    /**
     * Marcar un ticket como borrado (borrado lógico)
     * Códigos:
     *  1 = OK
     *  2 = ERROR_TERMINADO
     * -1 = ERROR (no existe o no pertenece al técnico)
     *  0 = ERROR (otro imprevisto / excepción)
     */
    public static int marcarComoBorrado(
            String usuario,
            int idTicket
    ) {
        try {
            int idTecnico = obtenerIdTecnico(usuario);

            // Primero verificar que el ticket pertenece al técnico y obtener su estado
            String sqlVerificar = """
                    SELECT estado FROM Ticket
                    WHERE id = ? AND id_tecnico = ?
                """;

            Connection con = ConexionBD.getConnection();
            PreparedStatement psVerificar = con.prepareStatement(sqlVerificar);
            psVerificar.setInt(1, idTicket);
            psVerificar.setInt(2, idTecnico);

            ResultSet rs = psVerificar.executeQuery();
            if (!rs.next()) {
                Log.escribirLog("DELETE: Ticket no existe o no pertenece al técnico. usuario=" + usuario + ", idTicket=" + idTicket);
                return -1;
            }

            String estado = rs.getString("estado");

            // Caso especial: ticket terminado
            if ("Terminado".equalsIgnoreCase(estado)) {
                Log.escribirLog("DELETE: Intento de borrar ticket terminado. idTicket=" + idTicket + ", usuario=" + usuario);
                return 2;
            }

            // Solo se pueden borrar tickets pendientes o cancelados
            if (!estado.equalsIgnoreCase("Pendiente") && !estado.equalsIgnoreCase("Cancelado")) {
                Log.escribirLog("DELETE: Intento de borrar ticket en estado no borrable: " + estado + " (idTicket=" + idTicket + ")");
                return -1;
            }

            // Marcar como borrado
            String sql = """
                    UPDATE Ticket
                    SET estado = 'Borrado', fecha_ultima_edicion = NOW()
                    WHERE id = ? AND id_tecnico = ?
                """;

            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, idTicket);
            ps.setInt(2, idTecnico);

            boolean resultado = ps.executeUpdate() == 1;
            if (resultado) {
                Log.escribirLog("Ticket " + idTicket + " marcado como borrado por técnico " + usuario);
                return 1;
            }
            return -1;

        } catch (Exception e) {
            Log.escribirLog("Error borrando ticket: " + e.getMessage());
            return 0;
        }
    }

    /**
     * Reanudar un ticket que estaba en estado Cancelado
     * Vuelve a estado Pendiente
     */
    public static boolean reanudarTicket(
            String usuario,
            int idTicket
    ) {
        try {
            int idTecnico = obtenerIdTecnico(usuario);

            String sql = """
                UPDATE Ticket 
                SET estado = 'Pendiente', fecha_ultima_edicion = NOW()
                WHERE id = ? AND id_tecnico = ? AND estado = 'Cancelado'
            """;

            Connection con = ConexionBD.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, idTicket);
            ps.setInt(2, idTecnico);

            boolean resultado = ps.executeUpdate() == 1;
            if (resultado) {
                Log.escribirLog("Ticket " + idTicket + " reanudado por técnico " + usuario);
            } else {
                Log.escribirLog("No se pudo reanudar ticket " + idTicket + " - puede que no esté en estado Cancelado");
            }
            return resultado;

        } catch (Exception e) {
            Log.escribirLog("Error reanudando ticket: " + e.getMessage());
            return false;
        }
    }

    /**
     * Obtener el ID de un ticket por su número
     * Usado para guardar imágenes y auditoría
     *
     * @param numeroTicket Número del ticket
     * @param idTecnico ID del técnico propietario
     * @return ID del ticket, -1 si no existe
     */
    public static int obtenerIdTicket(int numeroTicket, int idTecnico) {
        String sql = "SELECT id FROM Ticket WHERE numero_ticket = ? AND id_tecnico = ?";

        try (Connection con = ConexionBD.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, numeroTicket);
            ps.setInt(2, idTecnico);

            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return rs.getInt("id");
            }

        } catch (SQLException e) {
            Log.escribirLog("Error obteniendo ID de ticket: " + e.getMessage());
        }
        return -1;
    }

    /**
     * Obtener detalles completos de un ticket (incluyendo imágenes)
     *
     * @param usuario Usuario (técnico)
     * @param idTicket ID del ticket
     * @return String JSON con detalles del ticket e imágenes
     */
    public static String obtenerDetalleTicket(String usuario, int idTicket) {
        try {
            int idTecnico = obtenerIdTecnico(usuario);

            String sql = """
                SELECT id, numero_ticket, estado, motivo, descripcion, 
                       fecha_creacion, fecha_inicio, fecha_cierre, fecha_ultima_edicion
                FROM Ticket
                WHERE id = ? AND id_tecnico = ?
            """;

            Connection con = ConexionBD.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, idTicket);
            ps.setInt(2, idTecnico);

            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                StringBuilder json = new StringBuilder();
                json.append("{")
                        .append("\"id\":").append(rs.getInt("id")).append(",")
                        .append("\"numero_ticket\":").append(rs.getInt("numero_ticket")).append(",")
                        .append("\"estado\":\"").append(rs.getString("estado")).append("\",")
                        .append("\"motivo\":").append(
                                rs.getString("motivo") == null ? "null" : "\"" + rs.getString("motivo") + "\""
                        ).append(",")
                        .append("\"descripcion\":").append(
                                rs.getString("descripcion") == null ? "null" : "\"" + rs.getString("descripcion") + "\""
                        ).append(",")
                        .append("\"fecha_creacion\":\"").append(rs.getString("fecha_creacion")).append("\",")
                        .append("\"fecha_inicio\":").append(
                                rs.getString("fecha_inicio") == null ? "null" : "\"" + rs.getString("fecha_inicio") + "\""
                        ).append(",")
                        .append("\"fecha_cierre\":").append(
                                rs.getString("fecha_cierre") == null ? "null" : "\"" + rs.getString("fecha_cierre") + "\""
                        ).append(",")
                        .append("\"fecha_ultima_edicion\":").append(
                                rs.getString("fecha_ultima_edicion") == null ? "null" : "\"" + rs.getString("fecha_ultima_edicion") + "\""
                        ).append(",")
                        .append("\"imagenes\":").append(ImagenDAO.obtenerImagenes(idTicket))
                        .append("}");

                return json.toString();
            }

        } catch (SQLException e) {
            Log.escribirLog("Error obteniendo detalle de ticket: " + e.getMessage());
        }
        return null;
    }

    /**
     * Registrar una incidencia con imágenes (versión mejorada)
     * Guarda la incidencia y todas las imágenes asociadas en una transacción
     *
     * @param usuario Usuario (técnico)
     * @param numeroTicket Número del ticket
     * @param motivo Motivo de la incidencia
     * @param descripcion Descripción de la incidencia
     * @param imagenes Array de byte arrays con datos de imágenes
     * @param nombreArchivos Array de nombres de archivos
     * @param tiposMime Array de tipos MIME
     * @param tamaños Array de tamaños en bytes
     * @return true si se guardó correctamente (incluyendo todas las imágenes)
     */
    public static boolean registrarIncidenciaConImagenes(
            String usuario,
            int numeroTicket,
            String motivo,
            String descripcion,
            byte[][] imagenes,
            String[] nombreArchivos,
            String[] tiposMime,
            long[] tamaños
    ) {
        Connection con = null;
        try {
            int idTecnico = obtenerIdTecnico(usuario);
            int idTicket = obtenerIdTicket(numeroTicket, idTecnico);

            if (idTicket == -1) {
                Log.escribirLog("Error: Ticket " + numeroTicket + " no encontrado para usuario " + usuario);
                return false;
            }

            // Desactivar auto-commit para transacción
            con = ConexionBD.getConnection();
            con.setAutoCommit(false);

            // 1. Actualizar el estado del ticket
            String sqlTicket = """
                UPDATE Ticket SET estado = 'Cancelado', motivo = ?, descripcion = ?
                WHERE id = ? AND id_tecnico = ?
            """;

            PreparedStatement psTicket = con.prepareStatement(sqlTicket);
            psTicket.setString(1, motivo);
            psTicket.setString(2, descripcion);
            psTicket.setInt(3, idTicket);
            psTicket.setInt(4, idTecnico);

            if (psTicket.executeUpdate() != 1) {
                con.rollback();
                Log.escribirLog("Error: No se pudo actualizar el ticket " + numeroTicket);
                return false;
            }

            // 2. Guardar imágenes si existen
            if (imagenes != null && imagenes.length > 0) {
                for (int i = 0; i < imagenes.length; i++) {
                    if (!ImagenDAO.guardarImagen(
                            idTicket,
                            imagenes[i],
                            nombreArchivos != null && i < nombreArchivos.length ? nombreArchivos[i] : "imagen_" + i,
                            tiposMime != null && i < tiposMime.length ? tiposMime[i] : "image/jpeg",
                            tamaños != null && i < tamaños.length ? tamaños[i] : imagenes[i].length,
                            null
                    )) {
                        con.rollback();
                        Log.escribirLog("Error: Falló al guardar imagen " + i + " para ticket " + numeroTicket);
                        return false;
                    }
                }
            }

            // 3. Registrar en auditoría
            String sqlAuditoria = """
                INSERT INTO Auditoria_Ticket (id_ticket, id_tecnico, accion, descripcion)
                VALUES (?, ?, ?, ?)
            """;

            PreparedStatement psAuditoria = con.prepareStatement(sqlAuditoria);
            psAuditoria.setInt(1, idTicket);
            psAuditoria.setInt(2, idTecnico);
            psAuditoria.setString(3, "INCIDENCIA_REGISTRADA");
            psAuditoria.setString(4, motivo + " - " + descripcion);
            psAuditoria.executeUpdate();

            // Confirmar transacción
            con.commit();
            Log.escribirLog("Incidencia registrada correctamente para ticket " + numeroTicket 
                    + " con " + (imagenes != null ? imagenes.length : 0) + " imágenes");
            return true;

        } catch (SQLException e) {
            try {
                if (con != null) {
                    con.rollback();
                    Log.escribirLog("Transacción revertida por error: " + e.getMessage());
                }
            } catch (SQLException rollbackEx) {
                Log.escribirLog("Error al revertir transacción: " + rollbackEx.getMessage());
            }
            Log.escribirLog("Error registrando incidencia con imágenes: " + e.getMessage());
            return false;
        } finally {
            if (con != null) {
                try {
                    con.setAutoCommit(true);
                } catch (SQLException e) {
                    Log.escribirLog("Error reseteando autoCommit: " + e.getMessage());
                }
                try {
                    con.close();
                } catch (SQLException e) {
                    Log.escribirLog("Error cerrando conexión: " + e.getMessage());
                }
            }
        }
    }
    public static ArrayList<Ticket> obtenerTickets(){
        String sql = "SELECT * FROM Ticket";

        ArrayList<Ticket> tickets = new ArrayList<>();

        try{
            Statement statement = ConexionBD.getConnection().createStatement();
            ResultSet resultSet = statement.executeQuery(sql);

            while (resultSet.next()){
                Estado estado=Estado.CANCELADO;
                switch (resultSet.getString(3)){
                    case "Pendiente":
                        estado=Estado.PENDIENTE;
                        break;
                    case "En Proceso":
                        estado=Estado.ENPROCESO;
                        break;
                    case "Terminado":
                        estado=Estado.TERMINADO;
                        break;
                }
                Timestamp tsInicio = resultSet.getTimestamp(7);
                Timestamp tsCierre = resultSet.getTimestamp(8);

                tickets.add(new Ticket(
                        resultSet.getInt(1),
                        estado,
                        resultSet.getTimestamp(6).toLocalDateTime(),
                        resultSet.getString(5),
                        tsInicio != null ? tsInicio.toLocalDateTime() : null,
                        tsCierre != null ? tsCierre.toLocalDateTime() : null,
                        resultSet.getInt(9),
                        resultSet.getString(10)
                ));
            }

            statement.close();
            resultSet.close();

        } catch (SQLException e) {
            Log.escribirLog("Error al cargar tickets: "+e);
            throw new RuntimeException(e);
        }

        return tickets;
    }


    public static boolean crearTicket(Ticket ticket){
        String sql = "INSERT INTO Ticket (numero_ticket,estado,descripcion,fecha_creacion,id_tecnico,dni_cliente) VALUES (?,'Pendiente',?,?,?,?);";
        try{
            PreparedStatement preparedStatement = ConexionBD.getConnection().prepareStatement(sql);
            preparedStatement.setInt(1,ticket.getId());
            preparedStatement.setString(2, ticket.getDescripcion());
            // Convertir LocalDateTime a Timestamp
            preparedStatement.setTimestamp(3, java.sql.Timestamp.valueOf(ticket.getFechaCreacion()));
            preparedStatement.setInt(4, ticket.getId_tecnico());
            preparedStatement.setString(5, ticket.getDni());

            int filas = preparedStatement.executeUpdate();
            return filas == 1;
        } catch (SQLException e) {
            Log.escribirLog("Error al crear ticket: "+e.getMessage());
            throw new RuntimeException(e);
        }
    }

    public static boolean comprobarTicket(int id){
        String sql = "SELECT * FROM Ticket WHERE numero_ticket = ?";

        try{
          PreparedStatement preparedStatement = ConexionBD.getConnection().prepareStatement(sql);
          preparedStatement.setInt(1, id);
          ResultSet resultSet = preparedStatement.executeQuery();
          return resultSet.next();

        } catch (SQLException e) {
            Log.escribirLog("Error al comprobar ticket: "+e.getMessage());
            throw new RuntimeException(e);
        }

    }

    public static boolean eliminarTicket(int numero_ticket){
        String sql = "DELETE FROM Ticket WHERE numero_ticket = ?";

        try{
            PreparedStatement preparedStatement = ConexionBD.getConnection().prepareStatement(sql);
            preparedStatement.setInt(1,numero_ticket);
            int filas = preparedStatement.executeUpdate();
            return filas == 1;
        } catch (SQLException e) {
            Log.escribirLog("Error al eliminar ticket: "+e.getMessage());
            throw new RuntimeException(e);
        }

    }
}
