# FiberFix – Sistema de cierre automático de trabajos

Proyecto académico desarrollado para el cliente **FiberFix (Instalaciones Técnicas)**, una subcontrata de instalaciones de fibra óptica con técnicos en la calle.

El objetivo del sistema es **automatizar el cierre de partes de trabajo** mediante el envío de la ubicación del técnico, reduciendo errores administrativos y acelerando la facturación.

---

## Objetivo del proyecto

Permitir que un técnico cierre un ticket de trabajo enviando:
- Su identificador
- El identificador del ticket
- Su ubicación GPS
- La fecha y hora del cierre

El sistema valida y registra esta información en un servidor central.

---

## Arquitectura general

- **App móvil (React Native)**  
  Aplicación sencilla usada por los técnicos para enviar su ubicación y cerrar trabajos.

- **Servidor (Java)**  
  Servidor multihilo que recibe los datos de los técnicos mediante sockets TCP.

- **Base de datos (MySQL)**  
  Almacena técnicos, tickets y registros de cierre.

---

## Flujo básico del sistema

1. El técnico abre la aplicación móvil
2. Introduce su ID y el ID del ticket
3. Pulsa el botón "Cerrar trabajo"
4. La app obtiene la ubicación GPS
5. Se envían los datos al servidor
6. El servidor registra el cierre del ticket

---

## Formato del mensaje (provisional)

Los datos se envían como texto plano:
ID_TECNICO|ID_TICKET|LATITUD|LONGITUD|TIMESTAMP
Ejemplo:
TEC123|TICK987|39.4699|-0.3763|2025-12-16T10:45:00

---

## Equipo

Proyecto realizado por un equipo de 4 personas como parte de un trabajo académico:
CARLOS FERNÁNDEZ HERVÁS
ANDREI FELIPE STAICU
MARÍA JURADO IBÁÑEZ
SANTIAGO SÁNCHEZ MARCH

---

## Tecnologías

- Java
- React Native
- MySQL
- Git / GitHub
