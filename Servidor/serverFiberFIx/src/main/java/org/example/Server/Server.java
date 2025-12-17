package org.example.Server;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;

public class Server {
    private static final int PUERTO = 5000;

    public static void main(String[] args) {
        System.out.println("Servidor iniciado...");

        try (ServerSocket serverSocket = new ServerSocket(PUERTO)) {

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
