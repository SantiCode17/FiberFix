package org.example.DTO;

import static org.junit.jupiter.api.Assertions.*;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;

class ImagenTest {

    @Test
    // Verifica constructor completo y getters basicos
    void constructorCompletoAsignaCampos() {
        LocalDateTime fecha = LocalDateTime.of(2026, 2, 2, 9, 0);
        Imagen img = new Imagen(1, 10, "foto.jpg", "image/jpeg", 1234L, "desc", fecha);

        assertEquals(1, img.getId());
        assertEquals(10, img.getIdTicket());
        assertEquals("foto.jpg", img.getNombreArchivo());
        assertEquals("image/jpeg", img.getTipoMime());
        assertEquals(1234L, img.getTamanoByte());
        assertEquals("desc", img.getDescripcion());
        assertEquals(fecha, img.getFechaCarga());
    }

    @Test
    // Verifica constructor sin id y fecha de carga no nula
    void constructorSinIdAsignaFechaCarga() {
        Imagen img = new Imagen(10, "foto.jpg", "image/jpeg", 1234L, null);

        assertEquals(10, img.getIdTicket());
        assertNotNull(img.getFechaCarga());
        assertNull(img.getDescripcion());
    }

    @Test
    // Comprueba setters principales
    void settersActualizanCampos() {
        Imagen img = new Imagen(10, "foto.jpg", "image/jpeg", 1234L, "desc");
        LocalDateTime nueva = LocalDateTime.of(2026, 2, 2, 10, 0);

        img.setId(7);
        img.setNombreArchivo("otra.png");
        img.setTipoMime("image/png");
        img.setTamanoByte(2048L);
        img.setDescripcion("nueva");
        img.setFechaCarga(nueva);

        assertEquals(7, img.getId());
        assertEquals("otra.png", img.getNombreArchivo());
        assertEquals("image/png", img.getTipoMime());
        assertEquals(2048L, img.getTamanoByte());
        assertEquals("nueva", img.getDescripcion());
        assertEquals(nueva, img.getFechaCarga());
    }

    @Test
    // Captura salida de mostrar() y valida texto basico
    void mostrarImprimeDatosBasicos() {
        Imagen img = new Imagen(1, 10, "foto.jpg", "image/jpeg", 1024L, null,
                LocalDateTime.of(2026, 2, 2, 9, 0));

        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        PrintStream original = System.out;
        System.setOut(new PrintStream(buffer));
        try {
            img.mostrar();
        } finally {
            System.setOut(original);
        }

        String salida = buffer.toString();
        assertTrue(salida.contains("IMAGEN"));
        assertTrue(salida.contains("foto.jpg"));
        assertTrue(salida.contains("Tamaño:"));
        assertTrue(salida.contains("KB"));
        assertTrue(salida.contains("Sin descripción"));
    }

    @Test
    // toString incluye campos clave
    void toStringIncluyeCampos() {
        Imagen img = new Imagen(1, 10, "foto.jpg", "image/jpeg", 100L, "desc",
                LocalDateTime.of(2026, 2, 2, 9, 0));

        String texto = img.toString();

        assertTrue(texto.contains("id=1"));
        assertTrue(texto.contains("idTicket=10"));
        assertTrue(texto.contains("foto.jpg"));
    }
}
