package org.example.DTO;

import java.time.LocalDateTime;

public class Ticket {
    private int id;
    private Estado estado;
    private String motivo;
    private String descripcion;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaCierre;
    private LocalDateTime fechaUltimaEdicion;
    private int id_tecnico;
    private String dni;

    public Ticket(Estado estado, String descripcion, LocalDateTime fechaCreacion, LocalDateTime fechaInicio, LocalDateTime fechaCierre, String dni, int id_tecnico) {
        this.estado = estado;
        this.descripcion = descripcion;
        this.fechaCreacion = fechaCreacion;
        this.fechaInicio = fechaInicio;
        this.fechaCierre = fechaCierre;
        this.dni = dni;
        this.id_tecnico = id_tecnico;
    }

    public Ticket(int id, Estado estado, LocalDateTime fechaCreacion, String descripcion, LocalDateTime fechaInicio, LocalDateTime fechaCierre, int id_tecnico, String dni) {
        this.id = id;
        this.estado = estado;
        this.fechaCreacion = fechaCreacion;
        this.descripcion = descripcion;
        this.fechaInicio = fechaInicio;
        this.fechaCierre = fechaCierre;
        this.id_tecnico = id_tecnico;
        this.dni = dni;
    }

    public Ticket(int id, String descripcion, LocalDateTime fechaInicio, LocalDateTime fechaCierre, int id_tecnico, String dni) {
        this.id = id;
        this.descripcion = descripcion;
        this.fechaInicio = fechaInicio;
        this.fechaCierre = fechaCierre;
        this.id_tecnico = id_tecnico;
        this.dni = dni;
        this.estado = Estado.PENDIENTE;
        this.fechaCreacion = LocalDateTime.now();
    }

    public Ticket(String descripcion, LocalDateTime fechaInicio, LocalDateTime fechaCierre, int id_tecnico, String dni) {
        this.descripcion = descripcion;
        this.fechaInicio = fechaInicio;
        this.fechaCierre = fechaCierre;
        this.id_tecnico = id_tecnico;
        this.dni = dni;
        this.estado = Estado.PENDIENTE;
        this.fechaCreacion = LocalDateTime.now();
    }

    public Ticket(int id, Estado estado, String descripcion, LocalDateTime fechaCreacion, LocalDateTime fechaInicio, int id_tecnico, String dni) {
        this.id = id;
        this.estado = estado;
        this.descripcion = descripcion;
        this.fechaCreacion = fechaCreacion;
        this.fechaInicio = fechaInicio;
        this.id_tecnico = id_tecnico;
        this.dni = dni;
    }

    public Ticket(int id, String descripcion,  int id_tecnico, String dni) {
        this.id = id;
        this.descripcion = descripcion;
        this.fechaCreacion = LocalDateTime.now();
        this.id_tecnico = id_tecnico;
        this.dni = dni;
    }

    public int getId() {
        return id;
    }

    public Estado getEstado() {
        return estado;
    }

    public void setEstado(Estado estado) {
        this.estado = estado;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDateTime getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDateTime fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDateTime getFechaCierre() {
        return fechaCierre;
    }

    public void setFechaCierre(LocalDateTime fechaCierre) {
        this.fechaCierre = fechaCierre;
    }

    public int getId_tecnico() {
        return id_tecnico;
    }

    public void setId_tecnico(int id_tecnico) {
        this.id_tecnico = id_tecnico;
    }

    public String getDni() {
        return dni;
    }

    public void setDni(String dni) {
        this.dni = dni;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public LocalDateTime getFechaUltimaEdicion() {
        return fechaUltimaEdicion;
    }

    public void setFechaUltimaEdicion(LocalDateTime fechaUltimaEdicion) {
        this.fechaUltimaEdicion = fechaUltimaEdicion;
    }

    public void mostrar() {
        final String RESET = "\u001B[0m";
        final String AZUL = "\u001B[34m";
        final String VERDE = "\u001B[32m";
        final String AMARILLO = "\u001B[33m";
        final String ROJO = "\u001B[31m";
        final String CYAN = "\u001B[36m";

        String colorEstado;
        switch (estado) {
            case PENDIENTE -> colorEstado = AMARILLO;
            case ENPROCESO -> colorEstado = AZUL;
            case TERMINADO -> colorEstado = VERDE;
            default -> colorEstado = RESET;
        }

        String inicio = (fechaInicio != null) ? fechaInicio.toString() : "Sin definir";
        String cierre = (fechaCierre != null) ? fechaCierre.toString() : "Sin definir";

        System.out.println(
                CYAN + "[Ticket #" + id + "] " + RESET +
                        "Estado: " + colorEstado + estado + RESET +
                        " | Desc: " + descripcion +
                        " | Técnico: " + id_tecnico +
                        " | DNI: " + ROJO + dni + RESET +
                        " | Inicio: " + inicio +
                        " | Cierre: " + cierre
        );
    }
}
