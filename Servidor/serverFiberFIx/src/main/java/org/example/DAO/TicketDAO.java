package org.example.DAO;

import org.example.DTO.Estado;
import org.example.DTO.Ticket;
import org.example.Server.Log;

import java.sql.*;
import java.time.LocalDateTime;

public class TicketDAO {
    public static boolean comprobarTicket(int id){
        try{
            Statement statement = ConexionBD.getConnection().createStatement();
            ResultSet resultSet = statement.executeQuery("SELECT * FROM Ticket WHERE id = "+id+";");


            return (resultSet.next());

        } catch (SQLException e) {
            Log.escribirLog("Error al comprobar ticket: "+e);
            throw new RuntimeException(e);
        }
    }

    public static boolean crearTicket(Ticket ticket){
        try{
            if (comprobarTicket(ticket.getId())){
                return false;
            }


            PreparedStatement statement = ConexionBD.getConnection().prepareStatement("INSERT INTO Ticket (id,estado,descripcion,fecha_creacion,fecha_inicio,id_tecnico,dni_cliente) VALUES (?,?,?,?,?,?,?)");
            statement.setInt(1,ticket.getId());
            statement.setString(2,ticket.getEstado().toString());
            statement.setString(3,ticket.getDescripcion());
            statement.setTimestamp(4, Timestamp.valueOf(ticket.getFechaCreacion()));
            statement.setTimestamp(5, Timestamp.valueOf(ticket.getFechaInicio()));
            statement.setInt(6, ticket.getId_tecnico());
            statement.setString(7, ticket.getDni());

            int insert = statement.executeUpdate();

            if (insert==1){
                return true;
            } else {
                return false;
            }


        } catch (SQLException e) {
            Log.escribirLog("Error al crear el ticket "+e);
            throw new RuntimeException(e);
        }
    }
}
