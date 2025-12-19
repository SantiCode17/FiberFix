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
}
