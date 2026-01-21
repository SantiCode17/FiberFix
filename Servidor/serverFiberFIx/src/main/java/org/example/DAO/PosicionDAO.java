package org.example.DAO;

import org.example.Server.Log;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class PosicionDAO {

    public static void guardarPosicion(
            int idTecnico,
            int ticket,
            double lat,
            double lon
    ) {

        String sql = """
            INSERT INTO Posicion_Tecnico (latitud, longitud, id_tecnico, id_ticket)
            SELECT ?, ?, id, ?
            FROM Tecnico
            WHERE usuario = ?
        """;

        try (
                Connection con = ConexionBD.getConnection();
                PreparedStatement ps = con.prepareStatement(sql)
        ) {
            ps.setDouble(1, lat);
            ps.setDouble(2, lon);
            ps.setInt(3, idTecnico);
            ps.setInt(4, ticket);

            ps.executeUpdate();

        } catch (SQLException e) {
            Log.escribirLog(e.getMessage());
        }
    }
}
