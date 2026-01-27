package org.example.DTO;

public class Cliente {
    private String dni;
    private String nombre;
    private String apellido;
    private String direccionInstalacion;
    private String telefono;

    public Cliente(String dni, String apellido, String nombre, String direccionInstalacion, String telefono) {
        this.dni = dni;
        this.apellido = apellido;
        this.nombre = nombre;
        this.direccionInstalacion = direccionInstalacion;
        this.telefono = telefono;
    }

    public String getDni() {
        return dni;
    }

    public void setDni(String dni) {
        this.dni = dni;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDireccionInstalacion() {
        return direccionInstalacion;
    }

    public void setDireccionInstalacion(String direccionInstalacion) {
        this.direccionInstalacion = direccionInstalacion;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public void mostrar() {
        final String RESET = "\u001B[0m";
        final String CYAN = "\u001B[36m";
        final String VERDE = "\u001B[32m";
        final String AZUL = "\u001B[34m";
        final String AMARILLO = "\u001B[33m";
        final String GRIS = "\u001B[90m";

        System.out.println(
                CYAN + "[Cliente] " + RESET +
                        "DNI: " + GRIS + dni + RESET +
                        " | Nombre: " + VERDE + nombre + " " + apellido + RESET +
                        " | Dirección: " + AZUL + direccionInstalacion + RESET +
                        " | Tel: " + AMARILLO + telefono + RESET
        );
    }


}
