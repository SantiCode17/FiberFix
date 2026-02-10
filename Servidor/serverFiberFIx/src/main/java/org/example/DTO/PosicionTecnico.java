package org.example.DTO;

import java.sql.*;
import java.util.Locale;


public class PosicionTecnico {
    private int id;
    private double latitud;
    private double longitud;
    private Timestamp fechaHora;
    private int idTecnico;
    private int idTicket;


    public PosicionTecnico(double latitud, double longitud, Timestamp fechaHora, int idTecnico, int idTicket) {
        this.latitud = latitud;
        this.longitud = longitud;
        this.fechaHora = fechaHora;
        this.idTecnico = idTecnico;
        this.idTicket = idTicket;
    }


    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public double getLatitud() {
        return latitud;
    }

    public void setLatitud(double latitud) {
        this.latitud = latitud;
    }

    public double getLongitud() {
        return longitud;
    }

    public void setLongitud(double longitud) {
        this.longitud = longitud;
    }

    public Timestamp getFechaHora() {
        return fechaHora;
    }

    public void setFechaHora(Timestamp fechaHora) {
        this.fechaHora = fechaHora;
    }

    public int getIdTecnico() {
        return idTecnico;
    }

    public void setIdTecnico(int idTecnico) {
        this.idTecnico = idTecnico;
    }

    public int getIdTicket() {
        return idTicket;
    }

    public void setIdTicket(int idTicket) {
        this.idTicket = idTicket;
    }
}