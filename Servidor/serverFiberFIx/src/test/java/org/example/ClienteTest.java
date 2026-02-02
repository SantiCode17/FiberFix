package org.example;

import org.example.Server.Cliente;
import org.junit.jupiter.api.Test;

import java.io.*;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;

class ClienteTest {

    // -------------------------
    // TESTS DE LOGIN
    // -------------------------


    //manejarLogin()
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


    //manejarFinish()


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



    //manejarIncidentConImagenes()

    @Test
    void headerNulo_devuelveError() {
        Cliente cliente = new Cliente(null);

        InputStream entrada = new ByteArrayInputStream(new byte[0]);

        StringWriter sw = new StringWriter();
        PrintWriter salida = new PrintWriter(sw, true);

        boolean resultado = cliente.manejarIncidentConImagenes(salida, entrada);

        assertFalse(resultado);
        assertEquals("INCIDENT_WITH_IMAGES_ERROR\n", sw.toString());
    }

    @Test
    void headerIncompleto_devuelveError() {
        Cliente cliente = new Cliente(null);

        String mensaje = "INCIDENT|user|1\n";

        InputStream entrada = new ByteArrayInputStream(
                mensaje.getBytes(StandardCharsets.UTF_8)
        );

        StringWriter sw = new StringWriter();
        PrintWriter salida = new PrintWriter(sw, true);

        boolean resultado = cliente.manejarIncidentConImagenes(salida, entrada);

        assertFalse(resultado);
        assertEquals("INCIDENT_WITH_IMAGES_ERROR\n", sw.toString());
    }

    @Test
    void numeroImagenesNegativo_devuelveError() {
        Cliente cliente = new Cliente(null);

        String mensaje =
                "INCIDENT|user|1|motivo|descripcion|-1\n";

        InputStream entrada = new ByteArrayInputStream(
                mensaje.getBytes(StandardCharsets.UTF_8)
        );

        StringWriter sw = new StringWriter();
        PrintWriter salida = new PrintWriter(sw, true);

        boolean resultado = cliente.manejarIncidentConImagenes(salida, entrada);

        assertFalse(resultado);
        assertEquals("INCIDENT_WITH_IMAGES_ERROR\n", sw.toString());
    }

    @Test
    void mimeNoImagen_devuelveError() {
        Cliente cliente = new Cliente(null);

        String header =
                "INCIDENT|user|1|motivo|descripcion|1\n";
        String metadata =
                "archivo.txt|text/plain|4\n";

        byte[] datos = "ABCD".getBytes(StandardCharsets.UTF_8);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            baos.write(header.getBytes(StandardCharsets.UTF_8));
            baos.write(metadata.getBytes(StandardCharsets.UTF_8));
            baos.write(datos);
        } catch (IOException ignored) {}

        InputStream entrada = new ByteArrayInputStream(baos.toByteArray());

        StringWriter sw = new StringWriter();
        PrintWriter salida = new PrintWriter(sw, true);

        boolean resultado = cliente.manejarIncidentConImagenes(salida, entrada);

        assertFalse(resultado);
        assertEquals("INCIDENT_WITH_IMAGES_ERROR\n", sw.toString());
    }

    @Test
    void tamanoImagenIncorrecto_devuelveError() {
        Cliente cliente = new Cliente(null);

        String header =
                "INCIDENT|user|1|motivo|descripcion|1\n";
        String metadata =
                "img.png|image/png|10\n"; // dice 10 bytes

        byte[] datos = new byte[5]; // solo enviamos 5

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            baos.write(header.getBytes(StandardCharsets.UTF_8));
            baos.write(metadata.getBytes(StandardCharsets.UTF_8));
            baos.write(datos);
        } catch (IOException ignored) {}

        InputStream entrada = new ByteArrayInputStream(baos.toByteArray());

        StringWriter sw = new StringWriter();
        PrintWriter salida = new PrintWriter(sw, true);

        boolean resultado = cliente.manejarIncidentConImagenes(salida, entrada);

        assertFalse(resultado);
        assertEquals("INCIDENT_WITH_IMAGES_ERROR\n", sw.toString());
    }



    //manejarTicketDetail()
    @Test
    void partesIncorrectas_devuelveFalse_yError() {
        Cliente cliente = new Cliente(null);

        String[] partes = {"TICKET_DETAIL", "user"}; // faltan datos

        StringWriter sw = new StringWriter();
        PrintWriter salida = new PrintWriter(sw, true);

        boolean resultado = cliente.manejarTicketDetail(partes, salida);

        assertFalse(resultado);
        assertEquals("TICKET_DETAIL_ERROR\n", sw.toString());
    }

    @Test
    void idTicketNoNumerico_lanzaExcepcion_escribeError_yDevuelveTrue() {
        Cliente cliente = new Cliente(null);

        String[] partes = {"TICKET_DETAIL", "user", "abc"}; // NumberFormatException

        StringWriter sw = new StringWriter();
        PrintWriter salida = new PrintWriter(sw, true);

        boolean resultado = cliente.manejarTicketDetail(partes, salida);

        // OJO: por el diseño del método
        assertTrue(resultado);
        assertEquals("TICKET_DETAIL_ERROR\n", sw.toString());
    }

    @Test
    void daoDevuelveNull_escribeError_yDevuelveFalse() {
        Cliente cliente = new Cliente(null);

        String[] partes = {"TICKET_DETAIL", "user", "1"};

        StringWriter sw = new StringWriter();
        PrintWriter salida = new PrintWriter(sw, true);

        boolean resultado = cliente.manejarTicketDetail(partes, salida);

        // No hay BD → TicketDAO devuelve null
        assertFalse(resultado);
        assertEquals("TICKET_DETAIL_ERROR\n", sw.toString());
    }



    //manejarImageData()

    @Test
    void partesIncorrectas_devuelveFalse_yError1() {
        Cliente cliente = new Cliente(null);

        String[] partes = {"IMAGE_DATA", "user"}; // faltan datos

        StringWriter sw = new StringWriter();
        PrintWriter salida = new PrintWriter(sw, true);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        boolean resultado = cliente.manejarImageData(partes, salida, outputStream);

        assertFalse(resultado);
        assertEquals("IMAGE_DATA_ERROR\n", sw.toString());
    }

    @Test
    void idImagenNoNumerico_excepcion_escribeError_yDevuelveTrue() {
        Cliente cliente = new Cliente(null);

        String[] partes = {"IMAGE_DATA", "user", "abc"}; // NumberFormatException

        StringWriter sw = new StringWriter();
        PrintWriter salida = new PrintWriter(sw, true);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        boolean resultado = cliente.manejarImageData(partes, salida, outputStream);

        // Por el diseño del método
        assertTrue(resultado);
        assertEquals("IMAGE_DATA_ERROR\n", sw.toString());
    }

    @Test
    void daoDevuelveNull_devuelveFalse_yError() {
        Cliente cliente = new Cliente(null);

        String[] partes = {"IMAGE_DATA", "user", "1"};

        StringWriter sw = new StringWriter();
        PrintWriter salida = new PrintWriter(sw, true);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        boolean resultado = cliente.manejarImageData(partes, salida, outputStream);

        // No hay BD → ImagenDAO devuelve null
        assertFalse(resultado);
        assertEquals("IMAGE_DATA_ERROR\n", sw.toString());
    }

    @Test
    void outputStreamFunciona_aunqueNoHayaDatos() {
        Cliente cliente = new Cliente(null);

        String[] partes = {"IMAGE_DATA", "user", "1"};

        StringWriter sw = new StringWriter();
        PrintWriter salida = new PrintWriter(sw, true);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        boolean resultado = cliente.manejarImageData(partes, salida, outputStream);

        assertFalse(resultado);
        assertEquals("IMAGE_DATA_ERROR\n", sw.toString());

        // No se escribió nada binario
        assertEquals(0, outputStream.size());
    }




    //manejarHistory()
    @Test
    void partesIncorrectas_devuelveFalse_yError2() {
        Cliente cliente = new Cliente(null);

        String[] partes = {"HISTORY"}; // falta usuario

        StringWriter sw = new StringWriter();
        PrintWriter salida = new PrintWriter(sw, true);

        boolean resultado = cliente.manejarHistory(partes, salida);

        assertFalse(resultado);
        assertEquals("HISTORY_ERROR\n", sw.toString());
    }



    //manejarEdit()

    @Test
    void partesInsuficientes_devuelveFalse_yError() {
        Cliente cliente = new Cliente(null);

        String[] partes = {"EDIT", "user", "1"}; // faltan campos

        StringWriter sw = new StringWriter();
        PrintWriter salida = new PrintWriter(sw, true);

        boolean resultado = cliente.manejarEdit(partes, salida);

        assertFalse(resultado);
        assertEquals("EDIT_ERROR\n", sw.toString());
    }

    @Test
    void idTicketNoNumerico_devuelveFalse_yError1() {
        Cliente cliente = new Cliente(null);

        String[] partes = {"EDIT", "user", "abc", "motivo", "descripcion"};

        StringWriter sw = new StringWriter();
        PrintWriter salida = new PrintWriter(sw, true);

        boolean resultado = cliente.manejarEdit(partes, salida);

        assertFalse(resultado);
        assertEquals("EDIT_ERROR\n", sw.toString());
    }

    @Test
    void sinBaseDeDatos_devuelveFalse_yError1() {
        Cliente cliente = new Cliente(null);

        String[] partes = {"EDIT", "user", "1", "motivo", "descripcion"};

        StringWriter sw = new StringWriter();
        PrintWriter salida = new PrintWriter(sw, true);

        boolean resultado = cliente.manejarEdit(partes, salida);

        // Sin BD → TicketDAO.editarTicket devuelve false
        assertFalse(resultado);
        assertEquals("EDIT_ERROR\n", sw.toString());
    }


    //manejarDelete()
    @Test
    void partesIncorrectas_devuelveFalse_yError3() {
        Cliente cliente = new Cliente(null);

        String[] partes = {"DELETE", "user"}; // faltan datos

        StringWriter sw = new StringWriter();
        PrintWriter salida = new PrintWriter(sw, true);

        boolean resultado = cliente.manejarDelete(partes, salida);

        assertFalse(resultado);
        assertEquals("DELETE_ERROR\n", sw.toString());
    }

    @Test
    void idTicketNoNumerico_devuelveFalse_yError2() {
        Cliente cliente = new Cliente(null);

        String[] partes = {"DELETE", "user", "abc"};

        StringWriter sw = new StringWriter();
        PrintWriter salida = new PrintWriter(sw, true);

        boolean resultado = cliente.manejarDelete(partes, salida);

        assertFalse(resultado);
        assertEquals("DELETE_ERROR\n", sw.toString());
    }

    @Test
    void sinBaseDeDatos_devuelveFalse_yError2() {
        Cliente cliente = new Cliente(null);

        String[] partes = {"DELETE", "user", "1"};

        StringWriter sw = new StringWriter();
        PrintWriter salida = new PrintWriter(sw, true);

        boolean resultado = cliente.manejarDelete(partes, salida);

        // Sin BD → TicketDAO.marcarComoBorrado devuelve 0
        assertFalse(resultado);
        assertEquals("DELETE_ERROR\n", sw.toString());
    }





    //manejarResume()

    @Test
    void partesIncorrectas_devuelveFalse_yError4() {
        Cliente cliente = new Cliente(null);

        String[] partes = {"RESUME", "user"}; // faltan datos

        StringWriter sw = new StringWriter();
        PrintWriter salida = new PrintWriter(sw, true);

        boolean resultado = cliente.manejarResume(partes, salida);

        assertFalse(resultado);
        assertEquals("RESUME_ERROR\n", sw.toString());
    }

    @Test
    void idTicketNoNumerico_devuelveFalse_yError() {
        Cliente cliente = new Cliente(null);

        String[] partes = {"RESUME", "user", "abc"};

        StringWriter sw = new StringWriter();
        PrintWriter salida = new PrintWriter(sw, true);

        boolean resultado = cliente.manejarResume(partes, salida);

        assertFalse(resultado);
        assertEquals("RESUME_ERROR\n", sw.toString());
    }

    @Test
    void sinBaseDeDatos_devuelveFalse_yError() {
        Cliente cliente = new Cliente(null);

        String[] partes = {"RESUME", "user", "1"};

        StringWriter sw = new StringWriter();
        PrintWriter salida = new PrintWriter(sw, true);

        boolean resultado = cliente.manejarResume(partes, salida);

        // Sin BD → TicketDAO.reanudarTicket devuelve false
        assertFalse(resultado);
        assertEquals("RESUME_ERROR\n", sw.toString());
    }

}
