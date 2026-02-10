package org.example.DAO;

import org.example.Server.Log;

import java.io.FileInputStream;
import java.sql.*;
import java.util.Properties;

public class ConexionBD {

    private static Connection conn = null;

    private static final String driver="com.mysql.cj.jdbc.Driver";
    private static final String url = "jdbc:mysql://%s:%s/FiberFix";

    private ConexionBD(String host, String port, String user, String pass) {
        String fullUrl = String.format(url, host, port); // Inserta el host y el puerto en la URL

        try{
            Class.forName(driver);
            conn= DriverManager.getConnection(fullUrl, user, pass);
            Log.escribirLog("Conexión exitosa a la base de datos: " + fullUrl);
        } catch (ClassNotFoundException | SQLException e) {
            Log.escribirLog("Error al conectar con la base de datos: " + e.getMessage());
            throw new RuntimeException("Error al conectar con la base de datos: " + e.getMessage(), e);
        }
    }

    public static Connection getConnection(){
        try{
            if (conn==null || conn.isClosed()){
                Log.escribirLog("Conexión cerrada o nula detectada. Reintentando conexión...");
                Properties props = new Properties();
                props.load(new FileInputStream("server.properties"));

                String host = props.getProperty("BBDD-HOST");
                String port = props.getProperty("BBDD-PORT");
                String user = props.getProperty("BBDD-USER");
                String pass = props.getProperty("BBDD-PASS");

                String fullUrl = String.format(url, host, port);
                conn = DriverManager.getConnection(fullUrl, user, pass);
                Log.escribirLog("Conexión reestablecida a la base de datos: " + fullUrl);

            }
        } catch (Exception e){
            Log.escribirLog("Error al (re)inicializar la conexión con la base de datos: " + e.getMessage());
            throw new RuntimeException("Error al (re)inicializar la conexión con la base de datos", e);
        }
        return conn;
    }

    public static void closeConnection(){
        try{
            if (conn != null){
                conn.close();
            }
        } catch(SQLException e){
            e.printStackTrace();
        }
    }
}
