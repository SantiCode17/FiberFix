package org.example.Server;

import org.example.DAO.PosicionDAO;
import org.example.DAO.TecnicoDAO;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

public class Cliente implements Runnable{

    Socket socket;

    public Cliente(Socket socket) {
        this.socket = socket;
    }

    @Override
    public void run() {
        try (
                BufferedReader entrada = new BufferedReader(
                        new InputStreamReader(socket.getInputStream()));
                PrintWriter salida = new PrintWriter(
                        socket.getOutputStream(), true)
        ) {
            String mensaje = entrada.readLine();
            System.out.println("Cliente dice: " + mensaje);

            if (mensaje != null && mensaje.startsWith("LOGIN|")) {
                String[] partes = mensaje.split("\\|");
                String usuario = partes[1];
                String pass = partes[2];

                boolean valido = TecnicoDAO.loginCorrecto(usuario, pass);

                if (valido) {
                    System.out.println("LOGIN_OK");
                    salida.println("LOGIN_OK");
                } else {
                    System.out.println("LOGIN_ERROR");
                    salida.println("LOGIN_ERROR");
                }
            } else {
                salida.println("ERROR_FORMATO");
            }

        } catch (Exception e) {
            Log.escribirLog(e.getMessage());
        } finally {
            try {
                socket.close();
                System.out.println("Cliente desconectado");
            } catch (IOException e) {
                Log.escribirLog(e.getMessage());
            }
        }
    }

    public void procesarLogin(String mensaje, PrintWriter salida) {
        try {
            String[] partes = mensaje.split("\\|");
            String usuario = partes[1];
            String pass = partes[2];

            if (TecnicoDAO.loginCorrecto(usuario, pass)){
                salida.println("LOGIN_OK");
            }else{
                salida.println("LOGIN_FAIL");
            }
        }catch (Exception e){
            Log.escribirLog(e.getMessage());
            salida.println("LOGIN_FAIL");
        }
    }

    public void procesarParteTrabajo(String mensaje, PrintWriter salida) {
        try{
            String[] partes = mensaje.split("\\|");

            String tecnico = partes[0];
            int ticket = Integer.parseInt(partes[1]);
            double lat = Double.parseDouble(partes[2]);
            double lon = Double.parseDouble(partes[3]);

            PosicionDAO.guardarPosicion(tecnico,ticket,lat,lon);

            salida.println("OK");
        }catch (Exception e){
            Log.escribirLog(e.getMessage());
            salida.println("ERROR");
        }
    }
}
