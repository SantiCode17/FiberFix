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
                    return 2; // Codigo para ticket ya finalizado
                }
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
            return 1;
        } catch (SQLException e) {
            Log.escribirLog("Error iniciar ticket: " + e.getMessage());
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
