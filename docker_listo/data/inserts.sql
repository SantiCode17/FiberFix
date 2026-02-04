USE FiberFix;

-- INSERTS para la tabla Tecnico
INSERT INTO Tecnico (usuario, contrasenya, nombre, apellido) VALUES
('TEC001', '1234', 'Daniel', 'Sebastia'),
('jgarcia', 'pass1234', 'Juan', 'Garcia'),
('mperez', 'secure456', 'Maria', 'Perez'),
('dobles', '1801', 'Santiago', 'Sanchez');

-- INSERTS para la tabla Ticket
INSERT INTO Ticket (numero_ticket, estado, descripcion, fecha_creacion, fecha_inicio, fecha_cierre, id_tecnico) VALUES
(1001, 'Pendiente', 'Instalación de fibra óptica nueva', '2026-01-19 08:00:00', NULL, NULL, 1),
(1002, 'Pendiente', 'Reparar conexión intermitente', '2026-01-19 09:15:00', NULL, NULL, 1),
(1003, 'Pendiente', 'Reparar fibra óptica caída', '2026-01-14 08:00:00', NULL, NULL, 2),
(1004, 'Pendiente', 'Instalación de nuevo router', '2026-01-13 09:00:00', '2026-01-13 09:30:00', NULL, 3),
(1005, 'Terminado', 'Revisión mensual de conexión', '2026-01-12 13:00:00', '2026-01-12 14:00:00', '2026-01-12 16:00:00', 2);

-- INSERTS para la tabla Posicion_Tecnico
INSERT INTO Posicion_Tecnico (latitud, longitud, fecha_hora, id_tecnico, id_ticket) VALUES
(39.469907, -0.376288, '2026-01-19 08:30:00', 1, 1),
(39.470125, -0.377450, '2026-01-19 09:45:00', 1, 2),
(40.416775, -3.703790, '2026-01-14 10:15:00', 2, 3),
(41.385064, 2.173404, '2026-01-13 09:45:00', 3, 4),
(40.417000, -3.704000, '2026-01-12 14:30:00', 2, 5);
