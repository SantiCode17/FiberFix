package org.example.DTO;

import java.time.LocalDateTime;

/**
 * DTO que representa una imagen asociada a un ticket
 * Contiene metadatos pero no los datos binarios de la imagen
 */
public class Imagen {
    private int id;
    private int idTicket;
    private String nombreArchivo;
    private String tipoMime;
    private long tamanoByte;
    private String descripcion;
    private LocalDateTime fechaCarga;

    /**
     * Constructor con todos los parámetros
     */
    public Imagen(
            int id,
            int idTicket,
            String nombreArchivo,
            String tipoMime,
            long tamanoByte,
            String descripcion,
            LocalDateTime fechaCarga
    ) {
        this.id = id;
        this.idTicket = idTicket;
        this.nombreArchivo = nombreArchivo;
        this.tipoMime = tipoMime;
        this.tamanoByte = tamanoByte;
        this.descripcion = descripcion;
        this.fechaCarga = fechaCarga;
    }

    /**
     * Constructor sin ID (para inserción)
     */
    public Imagen(
            int idTicket,
            String nombreArchivo,
            String tipoMime,
            long tamanoByte,
            String descripcion
    ) {
        this.idTicket = idTicket;
        this.nombreArchivo = nombreArchivo;
        this.tipoMime = tipoMime;
        this.tamanoByte = tamanoByte;
        this.descripcion = descripcion;
        this.fechaCarga = LocalDateTime.now();
    }

    // ==================== GETTERS Y SETTERS ====================

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getIdTicket() {
        return idTicket;
    }

    public void setIdTicket(int idTicket) {
        this.idTicket = idTicket;
    }

    public String getNombreArchivo() {
        return nombreArchivo;
    }

    public void setNombreArchivo(String nombreArchivo) {
        this.nombreArchivo = nombreArchivo;
    }

    public String getTipoMime() {
        return tipoMime;
    }

    public void setTipoMime(String tipoMime) {
        this.tipoMime = tipoMime;
    }

    public long getTamanoByte() {
        return tamanoByte;
    }

    public void setTamanoByte(long tamanoByte) {
        this.tamanoByte = tamanoByte;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public LocalDateTime getFechaCarga() {
        return fechaCarga;
    }

    public void setFechaCarga(LocalDateTime fechaCarga) {
        this.fechaCarga = fechaCarga;
    }

    /**
     * Método para mostrar información de la imagen
     */
    public void mostrar() {
        System.out.println("\n=== IMAGEN ===");
        System.out.println("ID: " + id);
        System.out.println("Ticket ID: " + idTicket);
        System.out.println("Nombre: " + nombreArchivo);
        System.out.println("Tipo MIME: " + tipoMime);
        System.out.println("Tamaño: " + formatearTamaño(tamanoByte));
        System.out.println("Descripción: " + (descripcion != null ? descripcion : "Sin descripción"));
        System.out.println("Fecha de carga: " + fechaCarga);
    }

    /**
     * Formatea el tamaño en bytes a unidad legible
     */
    private String formatearTamaño(long bytes) {
        if (bytes <= 0) return "0 B";
        final String[] units = new String[]{"B", "KB", "MB", "GB", "TB"};
        int digitGroups = (int) (Math.log10(bytes) / Math.log10(1024));
        return String.format("%.2f %s", bytes / Math.pow(1024, digitGroups), units[digitGroups]);
    }

    @Override
    public String toString() {
        return "Imagen{" +
                "id=" + id +
                ", idTicket=" + idTicket +
                ", nombreArchivo='" + nombreArchivo + '\'' +
                ", tipoMime='" + tipoMime + '\'' +
                ", tamanoByte=" + tamanoByte +
                ", descripcion='" + descripcion + '\'' +
                ", fechaCarga=" + fechaCarga +
                '}';
    }
}
