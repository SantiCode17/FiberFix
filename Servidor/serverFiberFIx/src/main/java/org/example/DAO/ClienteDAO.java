package org.example.DAO;

import org.example.DTO.Cliente;
import org.example.Server.Log;

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
            Log.escribirLog("Error al cargar clientes: "+e);
            throw new RuntimeException(e);
        }

        return clientes;
    }
}
