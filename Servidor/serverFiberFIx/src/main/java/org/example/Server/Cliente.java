package org.example.Server;

import org.example.DAO.*;

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
        PrintWriter salida = null;
        try (
                BufferedReader entrada = new BufferedReader(
                        new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
                InputStream inputStream = socket.getInputStream();
                OutputStream outputStream = socket.getOutputStream();
        ) {
            salida = new PrintWriter(
                    new OutputStreamWriter(socket.getOutputStream(), StandardCharsets.UTF_8), true);
            String mensaje = entrada.readLine();
            if (mensaje == null) return;

            System.out.println(Thread.currentThread().getName()+" dice: " + mensaje);

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
                case "INCIDENT_WITH_IMAGES":
                    manejarIncidentConImagenes(salida, entrada, mensaje);
                    break;
                case "HISTORY":
                    manejarHistory(partes, salida);
                    break;
                case "TICKET_DETAIL":
                    manejarTicketDetail(partes, salida);
                    break;
                case "IMAGE_DATA":
                    manejarImageData(partes, salida, outputStream);
                    break;
                case "EDIT":
                    manejarEdit(partes, salida);
                    break;
                case "DELETE":
                    manejarDelete(partes, salida);
                    break;
                case "RESUME":
                    manejarResume(partes, salida);
                    break;
                default:
                    salida.println("ERROR_UNKNOWN_ACTION");
            }
        } catch (Exception e) {
            Log.escribirLog(e.getMessage());
            if (salida != null) {
                salida.println("SERVER_ERROR");
            }
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
            salida.flush();
            return;
        }

        boolean ok = TecnicoDAO.loginCorrecto(partes[1], partes[2]);
        salida.println(ok ? "LOGIN_OK" : "LOGIN_ERROR");
        salida.flush();
        System.out.println(ok ? "LOGIN_OK" : "LOGIN_ERROR");
    }

    public void manejarStart (String[] partes, PrintWriter salida) {
        try {
            Log.escribirLog("Procesando mensaje START: " + String.join("|", partes));

            String usuario = partes[1];
            int numTicket = Integer.parseInt(partes[2]);
            double lat = Double.parseDouble(partes[3]);
            double lon = Double.parseDouble(partes[4]);
            LocalDateTime fecha = LocalDateTime.parse(partes[5], DateTimeFormatter.ISO_DATE_TIME);

            Log.escribirLog("Datos extraídos: usuario=" + usuario + ", numTicket=" + numTicket + ", lat=" + lat + ", lon=" + lon + ", fecha=" + fecha);

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

            Log.escribirLog("Respuesta generada: " + respuesta);
            System.out.println(respuesta);
            salida.println(respuesta);
        } catch (Exception e) {
            System.out.println("[START] EXCEPCIÓN");
            Log.escribirLog("Error en manejarStart: " + e.getMessage());
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
            Log.escribirLog("Error en manejarIncident: " + e.getMessage());
            salida.println("INCIDENT_ERROR");
        }
    }

    /**
     * Maneja incidencias con imágenes
     * Protocolo:
     *   1. INCIDENT_WITH_IMAGES|usuario|numeroTicket|motivo|descripcion|numImágenes
     *   2. Para cada imagen: nombreArchivo|tipoMime|tamaño
     *   3. Para cada imagen: datosBase64 (en una línea)
     */
    public void manejarIncidentConImagenes(PrintWriter salida, BufferedReader br, String headerLine) {
        try {
            // Ya tenemos el encabezado leído
            if (headerLine == null) {
                salida.println("INCIDENT_WITH_IMAGES_ERROR");
                return;
            }

            String[] partes = headerLine.split("\\|");
            if (partes.length < 6) {
                Log.escribirLog("Error: formato incorrecto. Recibido: " + headerLine);
                salida.println("INCIDENT_WITH_IMAGES_ERROR");
                return;
            }

            String usuario = partes[1];
            int numeroTicket = Integer.parseInt(partes[2]);
            String motivo = partes[3];
            String descripcion = partes[4];
            int numImagenes = Integer.parseInt(partes[5]);

            Log.escribirLog("Procesando incidencia con imágenes: usuario=" + usuario + ", ticket=" + numeroTicket + ", imágenes=" + numImagenes);

            // Validar número de imágenes
            if (numImagenes < 0 || numImagenes > 5) {
                salida.println("INCIDENT_WITH_IMAGES_ERROR");
                return;
            }

            byte[][] datosImagenes = new byte[numImagenes][];
            String[] nombresArchivos = new String[numImagenes];
            String[] tiposMime = new String[numImagenes];
            long[] tamaños = new long[numImagenes];

            // Leer datos de imágenes (en base64)
            for (int i = 0; i < numImagenes; i++) {
                // Leer metadatos: nombreArchivo|tipoMime|tamaño
                String metadataLine = br.readLine();
                if (metadataLine == null) {
                    salida.println("INCIDENT_WITH_IMAGES_ERROR");
                    return;
                }

                String[] metadata = metadataLine.split("\\|");
                if (metadata.length != 3) {
                    salida.println("INCIDENT_WITH_IMAGES_ERROR");
                    return;
                }

                nombresArchivos[i] = metadata[0];
                tiposMime[i] = metadata[1];
                long tamanoByte = Long.parseLong(metadata[2]);
                tamaños[i] = tamanoByte;

                // Validaciones
                if (tamanoByte > 5 * 1024 * 1024) { // 5MB max
                    Log.escribirLog("Imagen demasiado grande: " + tamanoByte + " bytes");
                    salida.println("INCIDENT_WITH_IMAGES_ERROR");
                    return;
                }

                if (!tiposMime[i].startsWith("image/")) {
                    Log.escribirLog("Tipo MIME no permitido: " + tiposMime[i]);
                    salida.println("INCIDENT_WITH_IMAGES_ERROR");
                    return;
                }

                // Leer datos en base64 (una línea por imagen)
                String base64Line = br.readLine();
                if (base64Line == null || base64Line.isEmpty()) {
                    Log.escribirLog("Error leyendo datos base64 de imagen " + i);
                    salida.println("INCIDENT_WITH_IMAGES_ERROR");
                    return;
                }

                try {
                    // Decodificar base64 a bytes binarios
                    datosImagenes[i] = java.util.Base64.getDecoder().decode(base64Line);
                    
                    // Validar que el tamaño decodificado sea correcto
                    if (datosImagenes[i].length > 5 * 1024 * 1024) {
                        Log.escribirLog("Imagen decodificada demasiado grande: " + datosImagenes[i].length + " bytes");
                        salida.println("INCIDENT_WITH_IMAGES_ERROR");
                        return;
                    }
                } catch (IllegalArgumentException e) {
                    Log.escribirLog("Error decodificando base64 de imagen " + i + ": " + e.getMessage());
                    salida.println("INCIDENT_WITH_IMAGES_ERROR");
                    return;
                }
            }

            // Guardar incidencia con imágenes (con transacción)
            boolean ok = TicketDAO.registrarIncidenciaConImagenes(
                    usuario,
                    numeroTicket,
                    motivo,
                    descripcion,
                    datosImagenes,
                    nombresArchivos,
                    tiposMime,
                    tamaños
            );

            if (ok) {
                salida.println("INCIDENT_WITH_IMAGES_OK");
                System.out.println("INCIDENT_WITH_IMAGES_OK");
            } else {
                salida.println("INCIDENT_WITH_IMAGES_ERROR");
                System.out.println("INCIDENT_WITH_IMAGES_ERROR");
            }

        } catch (Exception e) {
            Log.escribirLog("Error en manejarIncidentConImagenes: " + e.getMessage());
            e.printStackTrace();
            salida.println("INCIDENT_WITH_IMAGES_ERROR");
        }
    }

    /**
     * Obtener detalle de un ticket con imágenes
     * Protocolo: TICKET_DETAIL|usuario|idTicket
     */
    public void manejarTicketDetail(String[] partes, PrintWriter salida) {
        try {
            if (partes.length != 3) {
                salida.println("TICKET_DETAIL_ERROR");
                return;
            }

            String usuario = partes[1];
            int idTicket = Integer.parseInt(partes[2]);

            String json = TicketDAO.obtenerDetalleTicket(usuario, idTicket);
            if (json != null) {
                salida.println(json);
            } else {
                salida.println("TICKET_DETAIL_ERROR");
            }

        } catch (Exception e) {
            Log.escribirLog("Error en manejarTicketDetail: " + e.getMessage());
            salida.println("TICKET_DETAIL_ERROR");
        }
    }

    /**
     * Obtener datos binarios de una imagen
     * Protocolo: IMAGE_DATA|usuario|idImagen
     * Respuesta: JSON metadatos + base64 de imagen o IMAGE_DATA_ERROR
     */
    public void manejarImageData(String[] partes, PrintWriter salida, OutputStream outputStream) {
        try {
            if (partes.length != 3) {
                salida.println("IMAGE_DATA_ERROR");
                return;
            }

            int idImagen = Integer.parseInt(partes[2]);
            byte[] datos = ImagenDAO.obtenerDatosImagen(idImagen);

            if (datos != null) {
                // Enviar metadatos primero
                String metadata = ImagenDAO.obtenerMetadatosImagen(idImagen);
                salida.println(metadata);

                // Luego enviar datos binarios convertidos a base64
                String base64Data = java.util.Base64.getEncoder().encodeToString(datos);
                salida.println(base64Data);
                salida.flush();
            } else {
                salida.println("IMAGE_DATA_ERROR");
            }

        } catch (Exception e) {
            Log.escribirLog("Error en manejarImageData: " + e.getMessage());
            salida.println("IMAGE_DATA_ERROR");
        }
    }

    public void manejarHistory(String[] partes, PrintWriter salida){
        if (partes.length != 2) {
            salida.println("HISTORY_ERROR");
            System.out.println("HISTORY_ERROR");
            return;
        }

        String usuario = partes[1];

        try {
            String json = TicketDAO.obtenerHistorial(usuario);

            // Si hay respuesta (aunque sea "[]"), lo consideramos OK.
            if (json != null) {
                salida.println(json);
                System.out.println("HISTORY_OK");
            } else {
                salida.println("HISTORY_ERROR");
                System.out.println("HISTORY_ERROR");
            }
        } catch (Exception e) {
            Log.escribirLog("Error en manejarHistory: " + e.getMessage());
            salida.println("HISTORY_ERROR");
            System.out.println("HISTORY_ERROR");
        }
    }

    /**
     * Maneja la edición de un ticket
     * Formato: EDIT|usuario|idTicket|motivo|descripcion
     */
    public void manejarEdit(String[] partes, PrintWriter salida) {
        try{
            if (partes.length < 5) {
                salida.println("EDIT_ERROR");
                return;
            }

            String usuario = partes[1];
            int idTicket = Integer.parseInt(partes[2]);
            String motivo = partes[3];
            String descripcion = partes[4];

            boolean ok = TicketDAO.editarTicket(usuario, idTicket, motivo, descripcion);
            salida.println(ok ? "EDIT_OK" : "EDIT_ERROR");
            System.out.println(ok ? "EDIT_OK" : "EDIT_ERROR");

        }catch (Exception e){
            Log.escribirLog("Error en manejarEdit: " + e.getMessage());
            salida.println("EDIT_ERROR");
        }
    }

    /**
     * Maneja la eliminación (borrado lógico) de un ticket
     * Formato: DELETE|usuario|idTicket
     */
    public void manejarDelete(String[] partes, PrintWriter salida) {
        try{
            if (partes.length != 3) {
                salida.println("DELETE_ERROR");
                return;
            }

            String usuario = partes[1];
            int idTicket = Integer.parseInt(partes[2]);
            int code = TicketDAO.marcarComoBorrado(usuario, idTicket);

            String respuesta;
            if (code == 1) {
                respuesta = "DELETE_OK";
            } else if (code == 2) {
                respuesta = "DELETE_ERROR_TERMINADO";
            } else {
                respuesta = "DELETE_ERROR";
            }

            salida.println(respuesta);
            System.out.println(respuesta);

        }catch (Exception e){
            Log.escribirLog("Error en manejarDelete: " + e.getMessage());
            salida.println("DELETE_ERROR");
        }

    }

    /**
     * Maneja la reanudación de un ticket en estado Cancelado
     * Formato: RESUME|usuario|idTicket
     */
    public void manejarResume(String[] partes, PrintWriter salida) {
        try{
            if (partes.length != 3) {
                salida.println("RESUME_ERROR");
                return;
            }

            String usuario = partes[1];
            int idTicket = Integer.parseInt(partes[2]);

            boolean ok = TicketDAO.reanudarTicket(usuario, idTicket);
            salida.println(ok ? "RESUME_OK" : "RESUME_ERROR");
            System.out.println(ok ? "RESUME_OK" : "RESUME_ERROR");

        }catch (Exception e){
            Log.escribirLog("Error en manejarResume: " + e.getMessage());
            salida.println("RESUME_ERROR");
        }
    }
}
