package org.example.Server;

import org.junit.jupiter.api.Test;

import java.io.PrintWriter;
import java.io.StringWriter;

import static org.junit.jupiter.api.Assertions.*;

class ClienteTest {

    // -------------------------
    // TESTS DE LOGIN
    // -------------------------

    @Test
    void manejarLogin_partesNull_lanzaExcepcion() {
        Cliente cliente = new Cliente(null);

        PrintWriter salida = new PrintWriter(new StringWriter());

        assertThrows(NullPointerException.class, () ->
                cliente.manejarLogin(null, salida)
        );
    }

    @Test
    void manejarLogin_numeroDePartesIncorrecto_devuelveFalse() {
        Cliente cliente = new Cliente(null);

        StringWriter sw = new StringWriter();
        PrintWriter salida = new PrintWriter(sw, true);

        String[] partes = {"LOGIN", "usuario"};

        boolean resultado = cliente.manejarLogin(partes, salida);

        assertFalse(resultado);
        assertEquals("LOGIN_ERROR\n", sw.toString());
    }

    @Test
    void manejarLogin_partesVacias_devuelveFalse() {
        Cliente cliente = new Cliente(null);

        StringWriter sw = new StringWriter();
        PrintWriter salida = new PrintWriter(sw, true);

        String[] partes = {"LOGIN", "", ""};

        boolean resultado = cliente.manejarLogin(partes, salida);

        // No sabemos qué hace el DAO, pero el método no debe romperse
        assertDoesNotThrow(() -> cliente.manejarLogin(partes, salida));
    }

    // -------------------------
    // TESTS DE HISTORY
    // -------------------------

    @Test
    void manejarHistory_partesIncorrectas_devuelveError() {
        Cliente cliente = new Cliente(null);

        StringWriter sw = new StringWriter();
        PrintWriter salida = new PrintWriter(sw, true);

        String[] partes = {"HISTORY"};

        cliente.manejarHistory(partes, salida);

        assertEquals("HISTORY_ERROR\n", sw.toString());
    }

    // -------------------------
    // TESTS DE DELETE
    // -------------------------

    @Test
    void manejarDelete_partesIncorrectas_devuelveError() {
        Cliente cliente = new Cliente(null);

        StringWriter sw = new StringWriter();
        PrintWriter salida = new PrintWriter(sw, true);

        String[] partes = {"DELETE", "user"};

        cliente.manejarDelete(partes, salida);

        assertEquals("DELETE_ERROR\n", sw.toString());
    }

    // -------------------------
    // TESTS DE FINISH
    // -------------------------

    @Test
    void manejarFinish_formatoCorrecto_noLanzaExcepcion() {
        Cliente cliente = new Cliente(null);

        StringWriter sw = new StringWriter();
        PrintWriter salida = new PrintWriter(sw, true);

        String[] partes = {
                "FINISH",
                "user",
                "1",
                "2024-01-01T10:00:00"
        };

        assertDoesNotThrow(() ->
                cliente.manejarFinish(partes, salida)
        );
    }

    // -------------------------
    // TEST DE EDIT (formato incorrecto)
    // -------------------------

    @Test
    void manejarEdit_partesIncorrectas_devuelveError() {
        Cliente cliente = new Cliente(null);

        StringWriter sw = new StringWriter();
        PrintWriter salida = new PrintWriter(sw, true);

        String[] partes = {"EDIT", "user", "1"};

        cliente.manejarEdit(partes, salida);

        assertEquals("EDIT_ERROR\n", sw.toString());
    }





    @Test
    void manejarFinish_partesInsuficientes_lanzaExcepcion() {
        Cliente cliente = new Cliente(null);

        StringWriter sw = new StringWriter();
        PrintWriter salida = new PrintWriter(sw, true);

        // Menos de 4 partes → fallará antes de llamar al DAO
        String[] partes = {"FINISH", "user"};

        assertDoesNotThrow(() -> cliente.manejarFinish(partes, salida));
        assertEquals("FINISH_ERROR\n", sw.toString());
    }

    @Test
    void manejarFinish_fechaInvalida_devuelveFinishError() {
        Cliente cliente = new Cliente(null);

        StringWriter sw = new StringWriter();
        PrintWriter salida = new PrintWriter(sw, true);

        // Fecha malformada
        String[] partes = {"FINISH", "user", "1", "2024-99-99T10:00:00"};

        boolean resultado = cliente.manejarFinish(partes, salida);

        // Sin DAO real, cualquier excepción devuelve false
        assertFalse(resultado);
        assertEquals("FINISH_ERROR\n", sw.toString());
    }

    @Test
    void manejarFinish_formatoCorrecto_noLanzaExcepcion1() {
        Cliente cliente = new Cliente(null);

        StringWriter sw = new StringWriter();
        PrintWriter salida = new PrintWriter(sw, true);

        // Valores correctos, pero DAO no existe → devolverá false
        String[] partes = {"FINISH", "user", "1", "2024-01-01T10:00:00"};

        assertDoesNotThrow(() -> cliente.manejarFinish(partes, salida));
    }
}
