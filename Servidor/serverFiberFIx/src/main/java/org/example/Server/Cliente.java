package org.example.Server;

import org.example.DAO.PosicionDAO;
import org.example.DAO.TecnicoDAO;
import org.example.DAO.TicketDAO;

import java.io.*;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class Cliente implements Runnable {

    Socket socket;

    public Cliente(Socket socket) {
        this.socket = socket;
    }

    @Override
    public void run() {
        try (
                BufferedReader entrada = new BufferedReader(
                        new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
                PrintWriter salida = new PrintWriter(
                        new OutputStreamWriter(socket.getOutputStream(), StandardCharsets.UTF_8), true);
        ) {
            String mensaje = entrada.readLine();
            if (mensaje == null) return;

            System.out.println("Cliente dice: " + mensaje);

            String[] partes = mensaje.split("\\|");
            String accion = partes[0];

            switch (accion) {
                case "LOGIN":
                    manejarLogin(partes, salida);
                    break;
                case "START":
                    manejarStart(partes, salida);
                    break;
                case "FINISH":
                    manejarFinish(partes, salida);
                    break;
                case "INCIDENT":
                    manejarIncident(partes, salida);
                    break;
                case "HISTORY":
                    manejarHistory(partes, salida);
                    break;
                default:
                    salida.println("ERROR_UNKNOWN_ACTION");
            }
        } catch (Exception e) {
            Log.escribirLog(e.getMessage());
        } finally {
            try {
                socket.close();
            } catch (IOException e) {
                Log.escribirLog(e.getMessage());
            }
        }
    }

    public void manejarLogin(String[] partes, PrintWriter salida) {
        if (partes.length != 3) {
            salida.println("LOGIN_ERROR");
            return;
        }

        boolean ok = TecnicoDAO.loginCorrecto(partes[1], partes[2]);
        salida.println(ok ? "LOGIN_OK" : "LOGIN_ERROR");
        System.out.println(ok ? "LOGIN_OK" : "LOGIN_ERROR");
    }

    public void manejarStart (String[] partes, PrintWriter salida) {
        try{
            String usuario = partes[1];
            int numTicket = Integer.parseInt(partes[2]);
            double lat = Double.parseDouble(partes[3]);
            double lon = Double.parseDouble(partes[4]);
            LocalDateTime fecha = LocalDateTime.parse(partes[5], DateTimeFormatter.ISO_DATE_TIME);

            int ok = TicketDAO.iniciarTicket(usuario, numTicket, fecha, lat, lon);
            String respuesta;
            if (ok == 1) {
                respuesta = "START_OK";
            } else if (ok == 0) {
                respuesta = "START_OK_EXISTENTE";
            } else if (ok == 2) {
                respuesta = "START_ERROR_FINALIZADO";
            } else {
                respuesta = "START_ERROR";
            }

            salida.println(respuesta);
            System.out.println(respuesta);
        }catch (Exception e){
            salida.println("START_ERROR");
        }
    }

    public void manejarFinish(String[] partes, PrintWriter salida) {
        try{
            String usuario = partes[1];
            int numTicket = Integer.parseInt(partes[2]);
            LocalDateTime fecha = LocalDateTime.parse(partes[3], DateTimeFormatter.ISO_DATE_TIME);

            boolean ok = TicketDAO.finalizarTicket(usuario, numTicket, fecha);
            salida.println(ok ? "FINISH_OK" : "FINISH_ERROR");
            System.out.println(ok ? "FINISH_OK" : "FINISH_ERROR");

        }catch (Exception e){
            salida.println("FINISH_ERROR");
        }
    }

    public void manejarIncident(String[] partes, PrintWriter salida) {
        try{
            String usuario = partes[1];
            int numTicket = Integer.parseInt(partes[2]);
            String motivo = partes[3];
            String nota = partes[4];

            boolean ok = TicketDAO.registrarIncidencia(usuario, numTicket, motivo, nota);
            salida.println(ok ? "INCIDENT_OK" : "INCIDENT_ERROR");
            System.out.println(ok ? "INCIDENT_OK" : "INCIDENT_ERROR");
        }catch (Exception e){
            salida.println("INCIDENT_ERROR");
        }
    }

    public void manejarHistory(String[] partes, PrintWriter salida){
        if (partes.length != 2) {
            salida.println("HISTORY_ERROR");
            return;
        }

        String usuario = partes[1];

        String json = TicketDAO.obtenerHistorial(usuario);
        salida.println(json);
    }
}
