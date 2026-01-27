package org.example.DTO;

public class Tecnico {
    private int id;
    private String usuario;
    private String contrasenya;
    private String nombre;
    private String apellido;

    public Tecnico(String usuario, String contrasenya, String nombre, String apellido) {
        this.usuario = usuario;
        this.contrasenya = contrasenya;
        this.nombre = nombre;
        this.apellido = apellido;
    }

    public Tecnico(int id, String usuario, String contrasenya, String nombre, String apellido) {
        this.id = id;
        this.usuario = usuario;
        this.contrasenya = contrasenya;
        this.nombre = nombre;
        this.apellido = apellido;
    }

    public int getId() {
        return id;
    }

    public String getUsuario() {
        return usuario;
    }

    public String getContrasenya() {
        return contrasenya;
    }

    public String getNombre() {
        return nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setUsuario(String usuario) {
        this.usuario = usuario;
    }

    public void setContrasenya(String contrasenya) {
        this.contrasenya = contrasenya;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public void mostrar() {
        final String RESET = "\u001B[0m";
        final String AZUL = "\u001B[34m";
        final String VERDE = "\u001B[32m";
        final String AMARILLO = "\u001B[33m";
        final String ROJO = "\u001B[31m";
        final String CYAN = "\u001B[36m";
        final String GRIS = "\u001B[90m";

        System.out.println(
                CYAN + "[Técnico #" + id + "] " + RESET +
                        "Usuario: " + AZUL + usuario + RESET +
                        " | Nombre: " + VERDE + nombre + " " + apellido + RESET +
                        " | Pass: " + GRIS + contrasenya + RESET
        );
    }

}
