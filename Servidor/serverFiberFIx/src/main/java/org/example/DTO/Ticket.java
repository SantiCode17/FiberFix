package org.example.DTO;

import java.time.LocalDateTime;

public class Ticket {
    private int id;
    private Estado estado;
    private String descripcion;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaCierre;
    private int id_tecnico;
    private String dni;

    public Ticket(Estado estado, String descripcion, int id, LocalDateTime fechaCreacion, LocalDateTime fechaInicio, LocalDateTime fechaCierre, String dni, int id_tecnico) {
        this.estado = estado;
        this.descripcion = descripcion;
        this.id = id;
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
}
