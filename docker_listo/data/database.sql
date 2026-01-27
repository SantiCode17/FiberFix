DROP SCHEMA IF EXISTS FiberFix;
CREATE SCHEMA FiberFix;
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

/*Tabla para almacenar imágenes adjuntas a los tickets*/
CREATE TABLE Imagen_Ticket
(
    id              INT PRIMARY KEY AUTO_INCREMENT,
    /*Datos de la imagen en formato Base64 o binario*/
    datos_imagen    LONGBLOB NOT NULL,
    /*Nombre original del archivo*/
    nombre_archivo  VARCHAR(255) NOT NULL,
    /*Tipo MIME (image/jpeg, image/png, etc)*/
    tipo_mime       VARCHAR(50) NOT NULL DEFAULT 'image/jpeg',
    /*Tamaño en bytes*/
    tamaño_bytes    INT NOT NULL,
    /*Fecha de carga*/
    fecha_carga     DATETIME DEFAULT CURRENT_TIMESTAMP,
    /*Descripción opcional de la imagen*/
    descripcion     VARCHAR(255) NULL,
    /*Relaciona la imagen con el ticket*/
    id_ticket       INT NOT NULL,
    FOREIGN KEY (id_ticket) REFERENCES Ticket (id) ON DELETE CASCADE
);

/*Tabla para registrar cambios/auditoría de tickets*/
CREATE TABLE Auditoria_Ticket
(
    id              INT PRIMARY KEY AUTO_INCREMENT,
    /*Qué acción se realizó*/
    accion          VARCHAR(50) NOT NULL,
    /*Detalles de la acción*/
    descripcion     VARCHAR(500) NULL,
    /*Quién realizó la acción*/
    id_tecnico      INT NOT NULL,
    /*Ticket afectado*/
    id_ticket       INT NOT NULL,
    /*Cuándo*/
    fecha_accion    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_ticket) REFERENCES Ticket (id) ON DELETE CASCADE,
    FOREIGN KEY (id_tecnico) REFERENCES Tecnico (id)
);
