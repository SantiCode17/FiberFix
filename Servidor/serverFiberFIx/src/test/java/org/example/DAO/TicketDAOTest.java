package org.example.DAO;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import org.example.DTO.Estado;
import org.example.DTO.Ticket;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;

class TicketDAOTest {

    @Test
    // comprobarTicket devuelve true cuando hay fila
    void comprobarTicketDevuelveTrueCuandoExiste() throws Exception {
        Connection con = mock(Connection.class);
        PreparedStatement ps = mock(PreparedStatement.class);
        ResultSet rs = mock(ResultSet.class);

        when(con.prepareStatement(anyString())).thenReturn(ps);
        when(ps.executeQuery()).thenReturn(rs);
        when(rs.next()).thenReturn(true);

        try (MockedStatic<ConexionBD> mocked = Mockito.mockStatic(ConexionBD.class)) {
            mocked.when(ConexionBD::getConnection).thenReturn(con);

            assertTrue(TicketDAO.comprobarTicket(10));
            verify(ps).setInt(1, 10);
        }
    }

    @Test
    // comprobarTicket lanza RuntimeException en caso de SQLException
    void comprobarTicketLanzaRuntimeExceptionSiHaySQLException() throws Exception {
        Connection con = mock(Connection.class);
        when(con.prepareStatement(anyString())).thenThrow(new SQLException("boom"));

        try (MockedStatic<ConexionBD> mocked = Mockito.mockStatic(ConexionBD.class)) {
            mocked.when(ConexionBD::getConnection).thenReturn(con);

            assertThrows(RuntimeException.class, () -> TicketDAO.comprobarTicket(10));
        }
    }

    @Test
    // crearTicket devuelve true cuando inserta una fila
    void crearTicketDevuelveTrueCuandoInserta() throws Exception {
        Connection con = mock(Connection.class);
        PreparedStatement ps = mock(PreparedStatement.class);

        when(con.prepareStatement(anyString())).thenReturn(ps);
        when(ps.executeUpdate()).thenReturn(1);

        Ticket ticket = new Ticket(10, "Desc", 3, "12345678A");

        try (MockedStatic<ConexionBD> mocked = Mockito.mockStatic(ConexionBD.class)) {
            mocked.when(ConexionBD::getConnection).thenReturn(con);

            assertTrue(TicketDAO.crearTicket(ticket));
            verify(ps).setInt(1, 10);
            verify(ps).setString(2, "Desc");
            verify(ps).setTimestamp(eq(3), any(Timestamp.class));
            verify(ps).setInt(4, 3);
            verify(ps).setString(5, "12345678A");
        }
    }

    @Test
    // eliminarTicket devuelve false cuando no borra filas
    void eliminarTicketDevuelveFalseSiNoBorra() throws Exception {
        Connection con = mock(Connection.class);
        PreparedStatement ps = mock(PreparedStatement.class);

        when(con.prepareStatement(anyString())).thenReturn(ps);
        when(ps.executeUpdate()).thenReturn(0);

        try (MockedStatic<ConexionBD> mocked = Mockito.mockStatic(ConexionBD.class)) {
            mocked.when(ConexionBD::getConnection).thenReturn(con);

            assertFalse(TicketDAO.eliminarTicket(22));
            verify(ps).setInt(1, 22);
        }
    }

    @Test
    // obtenerIdTicket devuelve el id cuando hay fila
    void obtenerIdTicketDevuelveIdCuandoExiste() throws Exception {
        Connection con = mock(Connection.class);
        PreparedStatement ps = mock(PreparedStatement.class);
        ResultSet rs = mock(ResultSet.class);

        when(con.prepareStatement(anyString())).thenReturn(ps);
        when(ps.executeQuery()).thenReturn(rs);
        when(rs.next()).thenReturn(true);
        when(rs.getInt("id")).thenReturn(7);

        try (MockedStatic<ConexionBD> mocked = Mockito.mockStatic(ConexionBD.class)) {
            mocked.when(ConexionBD::getConnection).thenReturn(con);

            assertEquals(7, TicketDAO.obtenerIdTicket(100, 5));
            verify(ps).setInt(1, 100);
            verify(ps).setInt(2, 5);
        }
    }

    @Test
    // obtenerIdTicket devuelve -1 cuando no hay fila
    void obtenerIdTicketDevuelveMenosUnoSiNoExiste() throws Exception {
        Connection con = mock(Connection.class);
        PreparedStatement ps = mock(PreparedStatement.class);
        ResultSet rs = mock(ResultSet.class);

        when(con.prepareStatement(anyString())).thenReturn(ps);
        when(ps.executeQuery()).thenReturn(rs);
        when(rs.next()).thenReturn(false);

        try (MockedStatic<ConexionBD> mocked = Mockito.mockStatic(ConexionBD.class)) {
            mocked.when(ConexionBD::getConnection).thenReturn(con);

            assertEquals(-1, TicketDAO.obtenerIdTicket(100, 5));
        }
    }

    @Test
    // obtenerTickets mapea estados y campos basicos
    void obtenerTicketsDevuelveListaConDatos() throws Exception {
        Connection con = mock(Connection.class);
        Statement st = mock(Statement.class);
        ResultSet rs = mock(ResultSet.class);

        when(con.createStatement()).thenReturn(st);
        when(st.executeQuery(anyString())).thenReturn(rs);
        when(rs.next()).thenReturn(true, true, false);

        when(rs.getInt(1)).thenReturn(1, 2);
        when(rs.getString(3)).thenReturn("Pendiente", "Terminado");
        when(rs.getTimestamp(6)).thenReturn(Timestamp.valueOf(LocalDateTime.of(2026, 2, 2, 9, 0)));
        when(rs.getString(5)).thenReturn("Desc1", "Desc2");
        when(rs.getTimestamp(7)).thenReturn(Timestamp.valueOf(LocalDateTime.of(2026, 2, 2, 9, 30)), null);
        when(rs.getTimestamp(8)).thenReturn(null, Timestamp.valueOf(LocalDateTime.of(2026, 2, 2, 10, 0)));
        when(rs.getInt(9)).thenReturn(3, 4);
        when(rs.getString(10)).thenReturn("11111111A", "22222222B");

        try (MockedStatic<ConexionBD> mocked = Mockito.mockStatic(ConexionBD.class)) {
            mocked.when(ConexionBD::getConnection).thenReturn(con);

            ArrayList<Ticket> lista = TicketDAO.obtenerTickets();

            assertEquals(2, lista.size());
            assertEquals(Estado.PENDIENTE, lista.get(0).getEstado());
            assertEquals("Desc2", lista.get(1).getDescripcion());
            assertEquals("22222222B", lista.get(1).getDni());
        }
    }
}
