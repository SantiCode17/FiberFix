package org.example.DAO;

import org.example.DTO.Tecnico;
import org.example.Server.Log;

import java.sql.*;
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
        String sql = "INSERT INTO Tecnico (usuario,contrasenya,nombre,apellido) VALUES (?,?,?,?);";

        try{
            PreparedStatement preparedStatement = ConexionBD.getConnection().prepareStatement(sql);
            preparedStatement.setString(1,tecnico.getUsuario());
            preparedStatement.setString(2, tecnico.getContrasenya());
            preparedStatement.setString(3,tecnico.getNombre());
            preparedStatement.setString(4, tecnico.getApellido());

            int resultado = preparedStatement.executeUpdate();

            return resultado==1;

        } catch (SQLException e) {
            Log.escribirLog("Error al crear técnico: "+e.getMessage());
            throw new RuntimeException(e);
        }
    }

    public static ArrayList<Tecnico> obtenerTecnicos(){
        String sql = "SELECT * FROM Tecnico";

        ArrayList<Tecnico> tecnicos = new ArrayList<>();

        try{
            Statement statement = ConexionBD.getConnection().createStatement();
            ResultSet resultSet = statement.executeQuery(sql);

            while (resultSet.next()){
                tecnicos.add(new Tecnico(resultSet.getInt(1),resultSet.getString(2),resultSet.getString(3),resultSet.getString(4),resultSet.getString(5)));
            }

            statement.close();
            resultSet.close();

        } catch (SQLException e) {
            Log.escribirLog("Error al cargar técnicos: "+e.getMessage());
            throw new RuntimeException(e);
        }

        return tecnicos;
    }

    public static boolean comprobarTecnico(String usuario){
        String sql = "SELECT * FROM Tecnico WHERE usuario = ?";
        try{
            PreparedStatement preparedStatement = ConexionBD.getConnection().prepareStatement(sql);
            preparedStatement.setString(1, usuario);
            ResultSet resultSet = preparedStatement.executeQuery();

            return resultSet.next();

        } catch (SQLException e) {
            Log.escribirLog("Error al comprobar tecnico: "+e.getMessage());
            throw new RuntimeException(e);
        }
    }

    public static int getIdTecnico(String usuario){
        String sql = "SELECT id FROM Tecnico WHERE usuario = ?";
        try{
            PreparedStatement preparedStatement = ConexionBD.getConnection().prepareStatement(sql);
            preparedStatement.setString(1, usuario);
            ResultSet resultSet = preparedStatement.executeQuery();

            resultSet.next();
            return resultSet.getInt(1);

        } catch (SQLException e) {
            Log.escribirLog("Error al comprobar tecnico: "+e.getMessage());
            throw new RuntimeException(e);
        }
    }
}
