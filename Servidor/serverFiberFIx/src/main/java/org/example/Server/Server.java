package org.example.Server;

import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.Scanner;

public class Server {


    public static void main(String[] args) {
        String opcion = "0";
        while (!opcion.equals("3")){
            opcion = menuPrincipal();
            switch (opcion){
                case "1":
                    servidor();
                    break;
                case "2":
                    String opcion2 = "0";
                    while (!opcion2.equals("9")){
                        opcion2=menuAdministracion();
                        switch (opcion2){
                            case "1":
                                break;
                            case "2":
                                break;
                            case "3":
                                break;
                            case "4":
                                break;
                            case "5":
                                break;
                            case "6":
                                break;
                            case "7":
                                break;
                            case "8":
                                break;
                            case "9":
                                System.out.println("Volviendo...");
                                break;
                            default:
                                System.out.println("Opción incorrecta");
                        }
                    }
                    break;
                case "3":
                    System.out.println("Saliendo");
                    break;
                default:
                    System.out.println("Opción incorrecta");
            }
        }
    }

    public static String menuPrincipal() {
        Scanner sc = new Scanner(System.in);

        // Colores ANSI
        final String RESET = "\u001B[0m";
        final String AZUL = "\u001B[34m";
        final String VERDE = "\u001B[32m";
        final String AMARILLO = "\u001B[33m";
        final String ROJO = "\u001B[31m";

        System.out.println(AZUL + "╔══════════════════════════════╗");
        System.out.println("║        MENÚ PRINCIPAL        ║");
        System.out.println("╠══════════════════════════════╣");
        System.out.println("║ " + VERDE   + "1️⃣  Iniciar el servidor      " + AZUL + "║");
        System.out.println("║ " + AMARILLO+ "2️⃣  Menú de administración   " + AZUL + "║");
        System.out.println("║ " + ROJO    + "3️⃣  Salir                    " + AZUL + "║");
        System.out.println("╚══════════════════════════════╝" + RESET);

        System.out.print("👉 Seleccione una opción: ");
        return sc.nextLine();
    }


    public static String menuAdministracion() {
        Scanner sc = new Scanner(System.in);

        // Colores ANSI
        final String RESET = "\u001B[0m";
        final String AZUL = "\u001B[34m";
        final String VERDE = "\u001B[32m";
        final String AMARILLO = "\u001B[33m";
        final String CIAN = "\u001B[36m";
        final String ROJO = "\u001B[31m";

        System.out.println(AZUL + "╔════════════════════════════════════╗");
        System.out.println("║      MENÚ DE ADMINISTRACIÓN        ║");
        System.out.println("╠════════════════════════════════════╣");
        System.out.println("║ " + VERDE   + "1️⃣  Mostrar técnicos          " + AZUL + "     ║");
        System.out.println("║ " + VERDE   + "2️⃣  Crear técnico             " + AZUL + "     ║");
        System.out.println("║ " + AMARILLO+ "3️⃣  Ver clientes              " + AZUL + "     ║");
        System.out.println("║ " + AMARILLO+ "4️⃣  Crear cliente             " + AZUL + "     ║");
        System.out.println("║ " + CIAN    + "5️⃣  Ver tickets               " + AZUL + "     ║");
        System.out.println("║ " + CIAN    + "6️⃣  Crear ticket              " + AZUL + "     ║");
        System.out.println("║ " + ROJO    + "7️⃣  Eliminar ticket           " + AZUL + "     ║");
        System.out.println("║ " + ROJO    + "8️⃣  Modificar ticket          " + AZUL + "     ║");
        System.out.println("║ " + ROJO    + "9️⃣  Volver atrás              " + AZUL + "     ║");
        System.out.println("╚════════════════════════════════════╝" + RESET);

        System.out.print("👉 Seleccione una opción: ");
        return sc.nextLine();
    }

    public static void servidor(){
        // Colores ANSI
        final String RESET = "\u001B[0m";
        final String AZUL = "\u001B[34m";
        final String VERDE = "\u001B[32m";
        final String AMARILLO = "\u001B[33m";
        final String ROJO = "\u001B[31m";
        final String CIAN = "\u001B[36m";

        System.out.println(CIAN +
                "╔════════════════════════════════════╗\n" +
                "║           SERVIDOR INICIADO        ║\n" +
                "╚════════════════════════════════════╝" +
                RESET
        );

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

            System.out.println(VERDE + "✔ Puerto cargado correctamente: " + puerto + RESET);

        } catch (FileNotFoundException e) {
            System.out.println(ROJO + "✖ No se encontró server.properties" + RESET);
            Log.escribirLog(e.getMessage());
        } catch (IOException e) {
            System.out.println(ROJO + "✖ Error al leer el fichero de configuración" + RESET);
            Log.escribirLog(e.getMessage());
        }

        try (ServerSocket serverSocket = new ServerSocket(puerto)) {

            System.out.println(AMARILLO + "⏳ Servidor escuchando en el puerto " + puerto + "..." + RESET);
            System.out.println(AZUL + "🔌 Esperando conexiones de clientes\n" + RESET);

            int numCliente = 1;
            while (true) {
                // Espera a que un cliente se conecte
                Socket cliente = serverSocket.accept();
                System.out.println(
                        VERDE + "🟢 Cliente conectado: " +
                                cliente.getInetAddress() + RESET
                );

                // Crear un hilo para atender al cliente
                Thread hilo = new Thread(new Cliente(cliente),"Cliente "+numCliente);
                numCliente++;
                hilo.start();
            }

        } catch (IOException e) {
            System.out.println(ROJO + "✖ Error al iniciar el servidor en el puerto " + puerto + RESET);
            Log.escribirLog(e.getMessage());
        }
    }


}
