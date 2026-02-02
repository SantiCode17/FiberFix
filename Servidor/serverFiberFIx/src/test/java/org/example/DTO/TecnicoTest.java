package org.example.DTO;

import static org.junit.jupiter.api.Assertions.*;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import org.junit.jupiter.api.Test;

class TecnicoTest {

    @Test
    // Verifica constructor completo y getters
    void constructorCompletoAsignaCampos() {
        Tecnico t = new Tecnico(1, "user", "pass", "Nombre", "Apellido");

        assertEquals(1, t.getId());
        assertEquals("user", t.getUsuario());
        assertEquals("pass", t.getContrasenya());
        assertEquals("Nombre", t.getNombre());
        assertEquals("Apellido", t.getApellido());
    }

    @Test
    // Comprueba setters de usuario, contrasenya, nombre y apellido
    void settersActualizanCampos() {
        Tecnico t = new Tecnico("user", "pass", "Nombre", "Apellido");

        t.setUsuario("u2");
        t.setContrasenya("p2");
        t.setNombre("N2");
        t.setApellido("A2");

        assertEquals("u2", t.getUsuario());
        assertEquals("p2", t.getContrasenya());
        assertEquals("N2", t.getNombre());
        assertEquals("A2", t.getApellido());
    }

    @Test
    // Captura System.out para validar que mostrar() imprime datos basicos
    void mostrarImprimeDatosBasicos() {
        Tecnico t = new Tecnico(1, "user", "pass", "Nombre", "Apellido");

        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        PrintStream original = System.out;
        System.setOut(new PrintStream(buffer));
        try {
            t.mostrar();
        } finally {
            System.setOut(original);
        }

        String salida = buffer.toString();
        assertTrue(salida.contains("Usuario:"));
        assertTrue(salida.contains("Nombre:"));
    }
}
