USE FiberFix;

-- INSERTS para la tabla Tecnico
INSERT INTO Tecnico (usuario, contrasenya, nombre, apellido) VALUES
('jgarcia', 'pass1234', 'Juan', 'Garcia'),
('mperez', 'secure456', 'Maria', 'Perez');

-- INSERTS para la tabla Cliente
INSERT INTO Cliente (dni, nombre, apellido, direccion_instalacion, telefono) VALUES
('12345678A', 'Carlos', 'Lopez', 'Calle Mayor 12, Madrid', '+34123456789'),
('87654321B', 'Ana', 'Martinez', 'Avenida del Sol 45, Barcelona', '+34987654321');

-- INSERTS para la tabla Ticket
INSERT INTO Ticket (estado, descripcion, fecha_inicio, fecha_cierre, id_tecnico, dni_cliente) VALUES
('Pendiente', 'Reparar fibra óptica caída', NULL, NULL, 1, '12345678A'),
('En Proceso', 'Instalación de nuevo router', '2026-01-13 09:30:00', NULL, 2, '87654321B'),
('Terminado', 'Revisión mensual de conexión', '2026-01-12 14:00:00', '2026-01-12 16:00:00', 1, '12345678A');

-- INSERTS para la tabla Posicion_Tecnico
INSERT INTO Posicion_Tecnico (latitud, longitud, fecha_hora, id_tecnico, id_ticket) VALUES
(40.416775, -3.703790, '2026-01-14 10:15:00', 1, 1),
(41.385064, 2.173404, '2026-01-13 09:45:00', 2, 2),
(40.417000, -3.704000, '2026-01-12 14:30:00', 1, 3);
