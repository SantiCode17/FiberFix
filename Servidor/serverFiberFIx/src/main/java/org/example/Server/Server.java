package org.example.Server;

import org.example.DAO.TecnicoDAO;
import org.example.DAO.TicketDAO;
import org.example.DTO.Tecnico;
import org.example.DTO.Ticket;

import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.Scanner;

public class Server {

    public static void main(String[] args) {
        // Si se pasa "server" como argumento, iniciar el servidor directamente
        if (args.length > 0 && args[0].equals("server")) {
            servidor();
            return;
        }
        
        Scanner sc = new Scanner(System.in);
        String opcion = "0";
        while (!opcion.equals("3")){
            opcion = menuPrincipal();
            switch (opcion){
                case "1":
                    servidor();
                    break;
                case "2":
                    String opcion2 = "0";
                    while (!opcion2.equals("8")){
                        opcion2=menuAdministracion();
                        switch (opcion2){
                            case "1":
                                TecnicoDAO.obtenerTecnicos().forEach(t -> t.mostrar());
                                break;
                            case "2":
                                String usuario;
                                do {
                                    System.out.print("Ingrese el usuario: ");
                                    usuario = sc.nextLine();
                                    if (TecnicoDAO.comprobarTecnico(usuario)){
                                        System.out.println("El técnico ya existe");
                                    }
                                }while (TecnicoDAO.comprobarTecnico(usuario));

                                System.out.print("Introduzca la contraseña: ");
                                String contra = sc.nextLine();

                                System.out.print("Introduzca el nombre: ");
                                String nombre = sc.nextLine();

                                System.out.print("Introduzca el apellido: ");
                                String apellido = sc.nextLine();

                                Tecnico tecnico = new Tecnico(usuario, contra, nombre, apellido);

                                if (TecnicoDAO.insertarTecnico(tecnico)){
                                    System.out.println("El técnico se ha insertado correctamente");
                                } else {
                                    System.out.println("El técnico no se ha insertado");
                                }
                                break;
                            case "3":
                                System.out.println("Gestión de clientes deshabilitada.");
                                break;
                            case "4":
                                System.out.println("Gestión de clientes deshabilitada.");
                                break;
                            case "5":
                                TicketDAO.obtenerTickets().forEach(t -> t.mostrar());
                                break;
                            case "6":
                                String idString;
                                do {
                                    System.out.print("Ingrese el número del ticket: ");
                                    idString = sc.nextLine();
                                    if (!idString.matches("\\d+")){
                                        System.out.println("Introduce un número entero");
                                    } else if (TicketDAO.comprobarTicket(Integer.parseInt(idString))){
                                        System.out.println("El ticket ya existe");
                                    }
                                }while ((!idString.matches("\\d+"))||(TicketDAO.comprobarTicket(Integer.parseInt(idString))));
                                System.out.print("Introduzca una descripción del ticket: ");
                                String descripcion = sc.nextLine();

                                String usuarioTecnico;
                                do {
                                    System.out.print("Ingrese el usuario del técnico: ");
                                    usuarioTecnico = sc.nextLine();
                                    if (!TecnicoDAO.comprobarTecnico(usuarioTecnico)){
                                        System.out.println("El técnico no existe");
                                    }
                                }while (!TecnicoDAO.comprobarTecnico(usuarioTecnico));

                                int idTecnico = TecnicoDAO.getIdTecnico(usuarioTecnico);

                                String dniTicket;
                                do{
                                    System.out.print("Ingrese el dni del cliente: ");
                                    dniTicket = sc.nextLine();
                                }while (!dniTicket.matches(".*"));

                                Ticket ticket = new Ticket(idTecnico, descripcion, idTecnico, dniTicket);

                                if (TicketDAO.crearTicket(ticket)){
                                    System.out.println("El ticket se ha insertado correctamente");
                                } else {
                                    System.out.println("El ticket no se ha insertado");
                                }

                                break;
                            case "7":
                                String idStringTicket;
                                do {
                                    System.out.print("Ingrese el número del ticket: ");
                                    idStringTicket = sc.nextLine();
                                    if (!idStringTicket.matches("\\d+")){
                                        System.out.println("Introduce un número entero");
                                    } else if (!TicketDAO.comprobarTicket(Integer.parseInt(idStringTicket))){
                                        System.out.println("El ticket no existe");
                                    }
                                }while ((!idStringTicket.matches("\\d+"))||(!TicketDAO.comprobarTicket(Integer.parseInt(idStringTicket))));

                                if (TicketDAO.eliminarTicket(Integer.parseInt(idStringTicket))){
                                    System.out.println("El ticket se ha eliminado correctamente");
                                } else {
                                    System.out.println("El ticket no se ha eliminado");
                                }

                                break;
                            case "8":
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
        System.out.println("║ " + ROJO    + "8️⃣  Volver atrás          " + AZUL + "         ║");
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
