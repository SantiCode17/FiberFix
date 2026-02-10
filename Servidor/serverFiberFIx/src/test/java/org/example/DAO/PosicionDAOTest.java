package org.example.DAO;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;

class PosicionDAOTest {

    @Test
    // Valida que se preparan los parametros y se ejecuta el INSERT
    void guardarPosicionEjecutaInsertConParametros() throws Exception {
        Connection con = mock(Connection.class);
        PreparedStatement ps = mock(PreparedStatement.class);

        when(con.prepareStatement(anyString())).thenReturn(ps);

        try (MockedStatic<ConexionBD> mocked = Mockito.mockStatic(ConexionBD.class)) {
            mocked.when(ConexionBD::getConnection).thenReturn(con);

            PosicionDAO.guardarPosicion(5, 10, 40.1, -3.2);

            verify(ps).setDouble(1, 40.1);
            verify(ps).setDouble(2, -3.2);
            verify(ps).setInt(3, 5);
            verify(ps).setInt(4, 10);
            verify(ps).executeUpdate();
        }
    }

    @Test
    // Comprueba que una SQLException no propaga excepcion
    void guardarPosicionNoLanzaExcepcionSiHaySQLException() throws Exception {
        Connection con = mock(Connection.class);
        when(con.prepareStatement(anyString())).thenThrow(new SQLException("boom"));

        try (MockedStatic<ConexionBD> mocked = Mockito.mockStatic(ConexionBD.class)) {
            mocked.when(ConexionBD::getConnection).thenReturn(con);

            assertDoesNotThrow(() -> PosicionDAO.guardarPosicion(5, 10, 40.1, -3.2));
        }
    }
}
