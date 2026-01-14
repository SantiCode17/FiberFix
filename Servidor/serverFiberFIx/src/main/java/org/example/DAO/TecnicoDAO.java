package org.example.DAO;

import org.example.Server.Log;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class TecnicoDAO {

    public static boolean loginCorrecto(String usuario, String pass) {
        String sql = "SELECT id FROM Tecnico WHERE usuario = ? AND contrasenya = ?";

        try (
                Connection con = ConexionBD.getConnection();
                PreparedStatement ps = con.prepareStatement(sql)
        ) {
            ps.setString(1, usuario);
            ps.setString(2, pass);

            ResultSet rs = ps.executeQuery();
            return rs.next();

        } catch (SQLException e) {
            Log.escribirLog(e.getMessage());
            return false;
        }
    }
}
