package org.example.DTO;

import static org.junit.jupiter.api.Assertions.*;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;

class TicketTest {

    @Test
    // Comprueba que el constructor asigna estado, descripcion, fechas y tecnico
    void constructorConValoresAsignados() {
        LocalDateTime now = LocalDateTime.now();
        Ticket t = new Ticket(Estado.ENPROCESO, "Desc", now, now, null, "12345678A", 7);

        assertEquals(Estado.ENPROCESO, t.getEstado());
        assertEquals("Desc", t.getDescripcion());
        assertEquals(now, t.getFechaCreacion());
        assertEquals(7, t.getId_tecnico());
        assertEquals("12345678A", t.getDni());
    }

    @Test
    // Verifica el constructor con estado por defecto
    void constructorPorDefectoAsignaEstadoPendienteYFechaCreacion() {
        Ticket t = new Ticket("Desc", null, null, 3, "11111111B");

        assertEquals(Estado.PENDIENTE, t.getEstado());
        assertNotNull(t.getFechaCreacion());
    }

    @Test
    // Comprueba que setters de estado y descripcion actualizan los campos
    void settersActualizanCampos() {
        Ticket t = new Ticket(1, "Desc", 2, "00000000C");

        t.setEstado(Estado.TERMINADO);
        t.setDescripcion("Nueva");

        assertEquals(Estado.TERMINADO, t.getEstado());
        assertEquals("Nueva", t.getDescripcion());
    }

    @Test
    // Valida setters y getters de fechas de inicio y cierre
    void gettersSettersDeFechasFuncionan() {
        Ticket t = new Ticket("Desc", null, null, 3, "11111111B");
        LocalDateTime inicio = LocalDateTime.of(2026, 2, 2, 10, 15);
        LocalDateTime cierre = LocalDateTime.of(2026, 2, 2, 11, 30);

        t.setFechaInicio(inicio);
        t.setFechaCierre(cierre);

        assertEquals(inicio, t.getFechaInicio());
        assertEquals(cierre, t.getFechaCierre());
    }

    @Test
    // Comprueba motivo y fecha de ultima edicion
    void settersDeMotivoYUltimaEdicionFuncionan() {
        Ticket t = new Ticket("Desc", null, null, 3, "11111111B");
        LocalDateTime edicion = LocalDateTime.of(2026, 2, 2, 12, 0);

        t.setMotivo("Corte de fibra");
        t.setFechaUltimaEdicion(edicion);

        assertEquals("Corte de fibra", t.getMotivo());
        assertEquals(edicion, t.getFechaUltimaEdicion());
    }

    @Test
    // Verifica constructor con id y estado y sus campos asociados
    void constructorConIdYEstadoMantieneCampos() {
        LocalDateTime creacion = LocalDateTime.of(2026, 2, 2, 9, 0);
        LocalDateTime inicio = LocalDateTime.of(2026, 2, 2, 9, 30);

        Ticket t = new Ticket(10, Estado.ENPROCESO, "Desc", creacion, inicio, 5, "99999999Z");

        assertEquals(10, t.getId());
        assertEquals(Estado.ENPROCESO, t.getEstado());
        assertEquals("Desc", t.getDescripcion());
        assertEquals(creacion, t.getFechaCreacion());
        assertEquals(inicio, t.getFechaInicio());
        assertEquals(5, t.getId_tecnico());
        assertEquals("99999999Z", t.getDni());
    }

    @Test
    // Captura System.out para validar que mostrar() imprime datos basicos
    void mostrarImprimeDatosBasicos() {
        Ticket t = new Ticket(1, Estado.PENDIENTE, LocalDateTime.of(2026, 2, 2, 8, 0),
                "Desc", null, null, 4, "12345678A");

        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        PrintStream original = System.out;
        System.setOut(new PrintStream(buffer));
        try {
            t.mostrar();
        } finally {
            System.setOut(original);
        }

        String salida = buffer.toString();
        assertTrue(salida.contains("Ticket #"));
        assertTrue(salida.contains("Desc"));
        assertTrue(salida.contains("Técnico"));
    }
}
