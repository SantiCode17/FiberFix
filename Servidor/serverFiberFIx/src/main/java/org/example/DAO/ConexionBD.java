package org.example.DAO;

import java.sql.*;
import java.util.Locale;

public class ConexionBD {

    private static Connection conn = null;

    private static final String driver="com.mysql.cj.jdbc.Driver";
    private static final String url="jdbc:mysql://localhost:";

    private ConexionBD(String user, String pass, String port) {
        String fullUrl=url+port+"/FiberFix";
        try{
            Class.forName(driver);
            conn= DriverManager.getConnection(fullUrl,user,pass);
        } catch (ClassNotFoundException | SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public static Connection getConnection(String user, String pass, String port){
        if (conn==null){
            new ConexionBD(user,pass,port);
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
