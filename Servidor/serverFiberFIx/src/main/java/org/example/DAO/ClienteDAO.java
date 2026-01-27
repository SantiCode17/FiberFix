package org.example.DAO;

import org.example.DTO.Cliente;
import org.example.DTO.Tecnico;
import org.example.Server.Log;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;

public class ClienteDAO {
    public static ArrayList<Cliente> obtenerCLientes(){
        String sql = "SELECT * FROM Cliente";

        ArrayList<Cliente> clientes = new ArrayList<>();

        try{
            Statement statement = ConexionBD.getConnection().createStatement();
            ResultSet resultSet = statement.executeQuery(sql);

            while (resultSet.next()){
                clientes.add(new Cliente(resultSet.getString(1),resultSet.getString(2),resultSet.getString(3),resultSet.getString(4),resultSet.getString(5)));
            }

            statement.close();
            resultSet.close();

        } catch (SQLException e) {
            Log.escribirLog("Error al cargar clientes: "+e.getMessage());
            throw new RuntimeException(e);
        }

        return clientes;
    }

    public static boolean insertarCliente(Cliente cliente){
        String sql = "INSERT INTO Cliente VALUES (?,?,?,?,?);";

        try{
            PreparedStatement preparedStatement = ConexionBD.getConnection().prepareStatement(sql);
            preparedStatement.setString(1,cliente.getDni());
            preparedStatement.setString(2, cliente.getNombre());
            preparedStatement.setString(3,cliente.getApellido());
            preparedStatement.setString(4, cliente.getDireccionInstalacion());
            preparedStatement.setString(5, cliente.getTelefono());

            int resultado = preparedStatement.executeUpdate();

            return resultado==1;

        } catch (SQLException e) {
            Log.escribirLog("Error al crear cliente: "+e.getMessage());
            throw new RuntimeException(e);
        }
    }


    public static boolean comprobarCliente(String dni) {
        String sql = "SELECT * FROM Cliente WHERE dni=?";
        try{
            PreparedStatement preparedStatement = ConexionBD.getConnection().prepareStatement(sql);
            preparedStatement.setString(1,dni);
            ResultSet resultSet = preparedStatement.executeQuery();
            return resultSet.next();
        } catch (SQLException e) {
            Log.escribirLog("Error al comprobar cliente: "+e.getMessage());
            throw new RuntimeException(e);
        }
    }
}
