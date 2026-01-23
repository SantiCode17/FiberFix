package org.example.DAO;

import org.example.DTO.Tecnico;
import org.example.Server.Log;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

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
            Log.escribirLog("Error Login: " +e.getMessage());
            return false;
        }
    }

    public static boolean insertarTecnico(Tecnico tecnico){
        String sql = "INSERT INTO Tecnico (usuario,contrasenya,nombre,apellido) VALUES ?,?,?,?";

        try{
            PreparedStatement preparedStatement = ConexionBD.getConnection().prepareStatement(sql);
            preparedStatement.setString(1,tecnico.getUsuario());
            preparedStatement.setString(2, tecnico.getContrasenya());
            preparedStatement.setString(3,tecnico.getNombre());
            preparedStatement.setString(4, tecnico.getApellido());

            int resultado = preparedStatement.executeUpdate();

            return resultado==1;

        } catch (SQLException e) {
            Log.escribirLog("Error al crear técnico: "+e);
            throw new RuntimeException(e);
        }
    }
}
