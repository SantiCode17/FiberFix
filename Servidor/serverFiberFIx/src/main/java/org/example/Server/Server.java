package org.example.Server;

import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;

public class Server {


    public static void main(String[] args) {
        System.out.println("Servidor iniciado...");

        //Leer puerto de fichero
        int puerto = 0;

        try {
            BufferedReader br = new BufferedReader(new FileReader("server.properties"));
            String linea;
            while ((linea = br.readLine()) != null){
                if (linea.contains("SERVER-PORT")){
                    puerto = Integer.parseInt(linea.split(":")[1]);
                }
            }

        } catch (FileNotFoundException e) {
            throw new RuntimeException(e);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        try (ServerSocket serverSocket = new ServerSocket(puerto)) {

            while (true) {
                // Espera a que un cliente se conecte
                Socket cliente = serverSocket.accept();
                System.out.println("Cliente conectado: " + cliente.getInetAddress());

                // Crear un hilo para atender al cliente
                Thread hilo = new Thread(new Cliente(cliente));
                hilo.start();

            }

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}
