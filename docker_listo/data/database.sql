CREATE schema FiberFix;
USE FiberFix;



CREATE TABLE Tecnico
(
    id          INT PRIMARY KEY AUTO_INCREMENT,
    /*La cerda de la carla queria contraseñas unicas , el unique hace eso mismo*/
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

    /*POngo varchar porque se especidifa el prefijo, el +34 */
    telefono              VARCHAR(15)  NOT NULL


);



CREATE TABLE Ticket
(
    id             INT PRIMARY KEY AUTO_INCREMENT,

    /*Enumeracion de estados, si no hay un estado asignado, por defecto es Pendiente*/
    estado         ENUM ('Pendiente', 'En Proceso', 'Terminado', 'Cancelado') NOT NULL DEFAULT 'Pendiente',

    descripcion    VARCHAR(200)                                               NOT NULL,

    /*Esto pilla la fecha en la que se crea el ticket*/
    fecha_creacion DATETIME                                                            DEFAULT CURRENT_TIMESTAMP,

    /*Fecha en la que se inicia el ticket*/
    fecha_inicio   DATETIME                                                   NULL,

    /*Fehca en la que se completa el ticket*/
    fecha_cierre   DATETIME                                                   NULL,

    id_tecnico     INT,
    dni_cliente    VARCHAR(9),

    FOREIGN KEY (id_tecnico) REFERENCES Tecnico (id),
    FOREIGN KEY (dni_cliente) REFERENCES Cliente (dni)
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
    id_tecnico INT,
    id_ticket  INT,
    FOREIGN KEY (id_ticket) REFERENCES Ticket (id),
    FOREIGN KEY (id_tecnico) REFERENCES Tecnico (id)
);


