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

---

# Guía básica de uso de Git para el proyecto

## Ramas del proyecto

* **main**: base del proyecto (documentación, configuración inicial)
* **feature**: integración de nuevas funcionalidades
* **release**: preparación para testing
* **production**: código en producción

**Nunca se programa directamente en `main`, `release` o `production`.**

---

## Flujo de trabajo recomendado

### 1. Actualizar repositorio local

```bash
git fetch origin
git pull origin feature
```

---

### 2. Crear una rama para una tarea

Siempre desde `feature`:

```bash
git checkout feature
git checkout -b feature-nombre-tarea
```

Ejemplos:

* `feature-login`
* `feature-expo-gps`
* `feature-socket-reconnect`

---

### 3. Programar y guardar cambios

```bash
git status
git add .
git commit -m "Descripción clara del cambio"
```

---

### 4. Subir la rama al repositorio remoto

```bash
git push origin feature-nombre-tarea
```

---

### 5. Finalizar una tarea

1. Crear Pull Request:

   * **Origen**: `feature-nombre-tarea`
   * **Destino**: `feature`

2. Tras el merge, borrar la rama:

```bash
git branch -d feature-nombre-tarea
git push origin --delete feature-nombre-tarea
```

---

## Buenas prácticas

* Una rama por tarea
* Commits pequeños y claros
* Actualizar `feature` frecuentemente
* No forzar pushes (`--force`)

---

## Comandos útiles

```bash
git branch            # ver ramas locales
git branch -a         # ver ramas locales y remotas
git checkout nombre   # cambiar de rama
git log --oneline     # ver historial compacto
git status            # ver estado actual
```

