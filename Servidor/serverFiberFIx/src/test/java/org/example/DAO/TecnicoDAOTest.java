package org.example.DAO;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import org.example.DTO.Tecnico;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;

class TecnicoDAOTest {

    @Test
    // Valida login correcto cuando el SELECT devuelve una fila
    void loginCorrectoDevuelveTrueCuandoExisteUsuario() throws Exception {
        Connection con = mock(Connection.class);
        PreparedStatement ps = mock(PreparedStatement.class);
        ResultSet rs = mock(ResultSet.class);

        when(con.prepareStatement(anyString())).thenReturn(ps);
        when(ps.executeQuery()).thenReturn(rs);
        when(rs.next()).thenReturn(true);

        try (MockedStatic<ConexionBD> mocked = Mockito.mockStatic(ConexionBD.class)) {
            mocked.when(ConexionBD::getConnection).thenReturn(con);

            boolean ok = TecnicoDAO.loginCorrecto("user", "pass");

            assertTrue(ok);
            verify(ps).setString(1, "user");
            verify(ps).setString(2, "pass");
        }
    }

    @Test
    // Devuelve false cuando el usuario no existe
    void loginCorrectoDevuelveFalseCuandoNoExisteUsuario() throws Exception {
        Connection con = mock(Connection.class);
        PreparedStatement ps = mock(PreparedStatement.class);
        ResultSet rs = mock(ResultSet.class);

        when(con.prepareStatement(anyString())).thenReturn(ps);
        when(ps.executeQuery()).thenReturn(rs);
        when(rs.next()).thenReturn(false);

        try (MockedStatic<ConexionBD> mocked = Mockito.mockStatic(ConexionBD.class)) {
            mocked.when(ConexionBD::getConnection).thenReturn(con);

            boolean ok = TecnicoDAO.loginCorrecto("user", "pass");

            assertFalse(ok);
        }
    }

    @Test
    // En caso de SQLException, login debe responder false
    void loginCorrectoDevuelveFalseSiHaySQLException() throws Exception {
        Connection con = mock(Connection.class);
        when(con.prepareStatement(anyString())).thenThrow(new SQLException("boom"));

        try (MockedStatic<ConexionBD> mocked = Mockito.mockStatic(ConexionBD.class)) {
            mocked.when(ConexionBD::getConnection).thenReturn(con);

            boolean ok = TecnicoDAO.loginCorrecto("user", "pass");

            assertFalse(ok);
        }
    }

    @Test
    // Insercion bien cuando executeUpdate devuelve 1.
    void insertarTecnicoDevuelveTrueCuandoInsertaUnaFila() throws Exception {
        Connection con = mock(Connection.class);
        PreparedStatement ps = mock(PreparedStatement.class);
        when(con.prepareStatement(anyString())).thenReturn(ps);
        when(ps.executeUpdate()).thenReturn(1);

        try (MockedStatic<ConexionBD> mocked = Mockito.mockStatic(ConexionBD.class)) {
            mocked.when(ConexionBD::getConnection).thenReturn(con);

            Tecnico tecnico = new Tecnico("user", "pass", "Nombre", "Apellido");
            boolean ok = TecnicoDAO.insertarTecnico(tecnico);

            assertTrue(ok);
            verify(ps).setString(1, "user");
            verify(ps).setString(2, "pass");
            verify(ps).setString(3, "Nombre");
            verify(ps).setString(4, "Apellido");
        }
    }

    @Test
    //  DA RuntimeException si falla la preparacion del statement
    void insertarTecnicoLanzaRuntimeExceptionSiHaySQLException() throws Exception {
        Connection con = mock(Connection.class);
        when(con.prepareStatement(anyString())).thenThrow(new SQLException("boom"));

        try (MockedStatic<ConexionBD> mocked = Mockito.mockStatic(ConexionBD.class)) {
            mocked.when(ConexionBD::getConnection).thenReturn(con);

            Tecnico tecnico = new Tecnico("user", "pass", "Nombre", "Apellido");
            assertThrows(RuntimeException.class, () -> TecnicoDAO.insertarTecnico(tecnico));
        }
    }

    @Test
    // Devuelve lista con el numero esperado de tecnicos y datos basicos
    void obtenerTecnicosDevuelveListaConDatos() throws Exception {
        Connection con = mock(Connection.class);
        Statement st = mock(Statement.class);
        ResultSet rs = mock(ResultSet.class);

        when(con.createStatement()).thenReturn(st);
        when(st.executeQuery(anyString())).thenReturn(rs);
        when(rs.next()).thenReturn(true, true, false);
        when(rs.getInt(1)).thenReturn(1, 2);
        when(rs.getString(2)).thenReturn("u1", "u2");
        when(rs.getString(3)).thenReturn("p1", "p2");
        when(rs.getString(4)).thenReturn("n1", "n2");
        when(rs.getString(5)).thenReturn("a1", "a2");

        try (MockedStatic<ConexionBD> mocked = Mockito.mockStatic(ConexionBD.class)) {
            mocked.when(ConexionBD::getConnection).thenReturn(con);

            ArrayList<Tecnico> lista = TecnicoDAO.obtenerTecnicos();

            assertEquals(2, lista.size());
            assertEquals("u1", lista.get(0).getUsuario());
            assertEquals("u2", lista.get(1).getUsuario());
        }
    }

    @Test
    // Comprueba que existe tecnico cuando el ResultSet tiene fila
    void comprobarTecnicoDevuelveTrueCuandoExiste() throws Exception {
        Connection con = mock(Connection.class);
        PreparedStatement ps = mock(PreparedStatement.class);
        ResultSet rs = mock(ResultSet.class);

        when(con.prepareStatement(anyString())).thenReturn(ps);
        when(ps.executeQuery()).thenReturn(rs);
        when(rs.next()).thenReturn(true);

        try (MockedStatic<ConexionBD> mocked = Mockito.mockStatic(ConexionBD.class)) {
            mocked.when(ConexionBD::getConnection).thenReturn(con);

            assertTrue(TecnicoDAO.comprobarTecnico("user"));
        }
    }

    @Test
    // Devuelve el id cuando la consulta devuelve una fila.
    void getIdTecnicoDevuelveIdCuandoExiste() throws Exception {
        Connection con = mock(Connection.class);
        PreparedStatement ps = mock(PreparedStatement.class);
        ResultSet rs = mock(ResultSet.class);

        when(con.prepareStatement(anyString())).thenReturn(ps);
        when(ps.executeQuery()).thenReturn(rs);
        when(rs.next()).thenReturn(true);
        when(rs.getInt(1)).thenReturn(7);

        try (MockedStatic<ConexionBD> mocked = Mockito.mockStatic(ConexionBD.class)) {
            mocked.when(ConexionBD::getConnection).thenReturn(con);

            assertEquals(7, TecnicoDAO.getIdTecnico("user"));
        }
    }
}
