package org.example.DAO;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;

class ImagenDAOTest {

    @Test
    // Devuelve false si los datos de imagen son null o vacios
    void guardarImagenDevuelveFalseSiDatosVacios() {
        assertFalse(ImagenDAO.guardarImagen(1, null, "a.jpg", "image/jpeg", 10, null));
        assertFalse(ImagenDAO.guardarImagen(1, new byte[0], "a.jpg", "image/jpeg", 0, null));
    }

    @Test
    // Devuelve false si el tamaño es mas de 5MB
    void guardarImagenDevuelveFalseSiEsMuyGrande() {
        byte[] datos = new byte[(5 * 1024 * 1024) + 1];
        assertFalse(ImagenDAO.guardarImagen(1, datos, "a.jpg", "image/jpeg", datos.length, null));
    }

    @Test
    // Devuelve false si el tipo MIME no es de imagen
    void guardarImagenDevuelveFalseSiMimeNoEsImagen() {
        byte[] datos = new byte[10];
        assertFalse(ImagenDAO.guardarImagen(1, datos, "a.txt", "text/plain", datos.length, null));
    }

    @Test
    // Guarda imagen cuando executeUpdate devuelve 1
    void guardarImagenDevuelveTrueCuandoInserta() throws Exception {
        Connection con = mock(Connection.class);
        PreparedStatement ps = mock(PreparedStatement.class);

        when(con.prepareStatement(anyString())).thenReturn(ps);
        when(ps.executeUpdate()).thenReturn(1);

        byte[] datos = new byte[] {1, 2, 3};

        try (MockedStatic<ConexionBD> mocked = Mockito.mockStatic(ConexionBD.class)) {
            mocked.when(ConexionBD::getConnection).thenReturn(con);

            assertTrue(ImagenDAO.guardarImagen(1, datos, "a.jpg", "image/jpeg", datos.length, null));
            verify(ps).setInt(1, 1);
            verify(ps).setBytes(2, datos);
            verify(ps).setString(3, "a.jpg");
            verify(ps).setString(4, "image/jpeg");
            verify(ps).setLong(5, datos.length);
            verify(ps).setString(6, "");
        }
    }

    @Test
    // obtenerImagenes devuelve [] si hay SQLException
    void obtenerImagenesDevuelveVacioSiHayError() throws Exception {
        Connection con = mock(Connection.class);
        when(con.prepareStatement(anyString())).thenThrow(new SQLException("boom"));

        try (MockedStatic<ConexionBD> mocked = Mockito.mockStatic(ConexionBD.class)) {
            mocked.when(ConexionBD::getConnection).thenReturn(con);

            assertEquals("[]", ImagenDAO.obtenerImagenes(5));
        }
    }

    @Test
    // obtenerImagenes crea JSON con dos elementos
    void obtenerImagenesDevuelveJsonConDatos() throws Exception {
        Connection con = mock(Connection.class);
        PreparedStatement ps = mock(PreparedStatement.class);
        ResultSet rs = mock(ResultSet.class);

        when(con.prepareStatement(anyString())).thenReturn(ps);
        when(ps.executeQuery()).thenReturn(rs);
        when(rs.next()).thenReturn(true, true, false);
        when(rs.getInt("id")).thenReturn(1, 2);
        when(rs.getString("nombre_archivo")).thenReturn("a.jpg", "b.png");
        when(rs.getString("tipo_mime")).thenReturn("image/jpeg", "image/png");
        when(rs.getLong("tamano_bytes")).thenReturn(10L, 20L);
        when(rs.getString("descripcion")).thenReturn("d1", "");
        when(rs.getString("fecha_carga")).thenReturn("2026-02-02", "2026-02-03");

        try (MockedStatic<ConexionBD> mocked = Mockito.mockStatic(ConexionBD.class)) {
            mocked.when(ConexionBD::getConnection).thenReturn(con);

            String json = ImagenDAO.obtenerImagenes(5);

            assertTrue(json.startsWith("["));
            assertTrue(json.contains("\"nombre\":\"a.jpg\""));
            assertTrue(json.contains("\"nombre\":\"b.png\""));
        }
    }

    @Test
    // obtenerDatosImagen devuelve bytes cuando hay fila
    void obtenerDatosImagenDevuelveBytesSiExiste() throws Exception {
        Connection con = mock(Connection.class);
        PreparedStatement ps = mock(PreparedStatement.class);
        ResultSet rs = mock(ResultSet.class);

        when(con.prepareStatement(anyString())).thenReturn(ps);
        when(ps.executeQuery()).thenReturn(rs);
        when(rs.next()).thenReturn(true);
        when(rs.getBytes("datos_imagen")).thenReturn(new byte[] {9, 8});

        try (MockedStatic<ConexionBD> mocked = Mockito.mockStatic(ConexionBD.class)) {
            mocked.when(ConexionBD::getConnection).thenReturn(con);

            assertArrayEquals(new byte[] {9, 8}, ImagenDAO.obtenerDatosImagen(3));
        }
    }

    @Test
    // eliminarImagen devuelve true cuando borra una fila
    void eliminarImagenDevuelveTrueCuandoElimina() throws Exception {
        Connection con = mock(Connection.class);
        PreparedStatement ps = mock(PreparedStatement.class);

        when(con.prepareStatement(anyString())).thenReturn(ps);
        when(ps.executeUpdate()).thenReturn(1);

        try (MockedStatic<ConexionBD> mocked = Mockito.mockStatic(ConexionBD.class)) {
            mocked.when(ConexionBD::getConnection).thenReturn(con);

            assertTrue(ImagenDAO.eliminarImagen(7));
            verify(ps).setInt(1, 7);
        }
    }

    @Test
    // eliminarImagenesTicket devuelve el numero de filas afectadas
    void eliminarImagenesTicketDevuelveConteo() throws Exception {
        Connection con = mock(Connection.class);
        PreparedStatement ps = mock(PreparedStatement.class);

        when(con.prepareStatement(anyString())).thenReturn(ps);
        when(ps.executeUpdate()).thenReturn(3);

        try (MockedStatic<ConexionBD> mocked = Mockito.mockStatic(ConexionBD.class)) {
            mocked.when(ConexionBD::getConnection).thenReturn(con);

            assertEquals(3, ImagenDAO.eliminarImagenesTicket(9));
            verify(ps).setInt(1, 9);
        }
    }

    @Test
    // contarImagenes devuelve el COUNT(*) de la consulta
    void contarImagenesDevuelveCantidad() throws Exception {
        Connection con = mock(Connection.class);
        PreparedStatement ps = mock(PreparedStatement.class);
        ResultSet rs = mock(ResultSet.class);

        when(con.prepareStatement(anyString())).thenReturn(ps);
        when(ps.executeQuery()).thenReturn(rs);
        when(rs.next()).thenReturn(true);
        when(rs.getInt("cantidad")).thenReturn(4);

        try (MockedStatic<ConexionBD> mocked = Mockito.mockStatic(ConexionBD.class)) {
            mocked.when(ConexionBD::getConnection).thenReturn(con);

            assertEquals(4, ImagenDAO.contarImágenes(12));
        }
    }

    @Test
    // actualizarDescripcion devuelve true cuando actualiza una fila
    void actualizarDescripcionDevuelveTrueCuandoActualiza() throws Exception {
        Connection con = mock(Connection.class);
        PreparedStatement ps = mock(PreparedStatement.class);

        when(con.prepareStatement(anyString())).thenReturn(ps);
        when(ps.executeUpdate()).thenReturn(1);

        try (MockedStatic<ConexionBD> mocked = Mockito.mockStatic(ConexionBD.class)) {
            mocked.when(ConexionBD::getConnection).thenReturn(con);

            assertTrue(ImagenDAO.actualizarDescripcion(5, "nueva"));
            verify(ps).setString(1, "nueva");
            verify(ps).setInt(2, 5);
        }
    }
}
