CREATE schema FiberFix;
USE FiberFix;

CREATE TABLE Tecnico
(
    id          INT PRIMARY KEY AUTO_INCREMENT,
    usuario     VARCHAR(50)  NOT NULL UNIQUE,
    contrasenya VARCHAR(100) NOT NULL,
    nombre      VARCHAR(50)  NOT NULL,
    apellido    VARCHAR(50)  NOT NULL
);

CREATE TABLE Cliente
(
    dni                   VARCHAR(9) PRIMARY KEY,
    nombre                VARCHAR(50)  NOT NULL,
    apellido              VARCHAR(50)  NOT NULL,
    direccion_instalacion VARCHAR(100) NOT NULL,
    telefono              VARCHAR(15)  NOT NULL
);

CREATE TABLE Ticket
(
    id              INT PRIMARY KEY AUTO_INCREMENT,
    numero_ticket   INT NOT NULL,
    /*Enumeracion de estados, si no hay un estado asignado, por defecto es Pendiente*/
    estado          ENUM ('Pendiente', 'En Proceso', 'Terminado', 'Cancelado', 'Borrado') NOT NULL DEFAULT 'Pendiente',
    /*Motivo de la incidencia o etiqueta - ahora es VARCHAR para permitir valores personalizados*/
    motivo          VARCHAR(100)    NULL,
    descripcion     VARCHAR(500)    NULL,
    /*Fecha en la que se crea el ticket*/
    fecha_creacion  DATETIME    DEFAULT CURRENT_TIMESTAMP,
    /*Fecha en la que se inicia el ticket*/
    fecha_inicio    DATETIME    NULL,
    /*Fecha en la que se completa el ticket*/
    fecha_cierre    DATETIME    NULL,
    /*Fecha de última edición (para auditoría)*/
    fecha_ultima_edicion DATETIME NULL,
    /*Imagen adjunta - LONGBLOB para almacenar datos binarios*/
    imagen          LONGBLOB    NULL,
    id_tecnico      INT NOT NULL,
    dni_cliente     VARCHAR(9),

    FOREIGN KEY (id_tecnico) REFERENCES Tecnico (id),
    FOREIGN KEY (dni_cliente) REFERENCES Cliente (dni),
    UNIQUE (numero_ticket, id_tecnico)
);

CREATE TABLE Posicion_Tecnico
(
    id         INT PRIMARY KEY AUTO_INCREMENT,
    /*Las coordenadas*/
    latitud    DECIMAL(9, 6) NOT NULL,
    longitud   DECIMAL(9, 6) NOT NULL,
    /*Fecha y hora en la que se recoge la ubicacion*/
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    /*Relaciona al tecnico con el ticket*/
    id_tecnico INT NOT NULL,
    id_ticket  INT NOT NULL,
    FOREIGN KEY (id_ticket) REFERENCES Ticket (id),
    FOREIGN KEY (id_tecnico) REFERENCES Tecnico (id)
);
