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

## Flujo de trabajo recomendado

Este repositorio **ya existe en remoto**, por lo que el primer paso siempre será clonarlo. Todo el desarrollo se hace siguiendo un flujo basado en ramas `feature` y `release`.

---

### 0. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd FiberFix
```

---

### 1. Mantener el repositorio local actualizado

Antes de empezar cualquier tarea, asegúrate de tener la rama `feature` actualizada:

```bash
git fetch origin
git checkout feature
git pull origin feature
```

---

### 2. Crear una rama para una tarea

Cada desarrollador debe crear **su propia rama** a partir de `feature`. Siempre una rama por tarea.

```bash
git checkout feature
git checkout -b feature-nombre-tarea
```
---

### 3. Programar y guardar cambios

Durante el desarrollo, guarda los cambios con commits pequeños y descriptivos:

```bash
git status
git add .
git commit -m "Descripción clara del cambio"
```

---

### 4. Integrar cambios en `feature` (sin subir tu rama al remoto)

Las ramas de tarea **NO se suben al repositorio remoto**. Todo el proceso se hace por consola y solo se sube `feature`.

1. Asegúrate de tener `feature` actualizada:

```bash
git checkout feature
git pull origin feature
```

2. Vuelve a tu rama y rebasea (opcional pero recomendado):

```bash
git checkout feature-nombre-tarea
git rebase feature
```

3. Fusiona tu rama en `feature`:

```bash
git checkout feature
git merge feature-nombre-tarea
````

---

### 5. Subir cambios a remoto y limpiar ramas

1. Subir **solo la rama `feature`** al repositorio remoto:

```bash
git push origin feature
````

2. Eliminar la rama local de la tarea (una vez integrado):

```bash
git branch -d feature-nombre-tarea
```

> De esta forma, el repositorio remoto solo contiene ramas principales (`feature`, `release`, etc.)

---

## Buenas prácticas

- Una rama por tarea
- Cada desarrollador trabaja en su propia rama
- Commits pequeños y claros
- Mantener `feature` actualizada frecuentemente
- No forzar pushes (`--force`)
- No trabajar directamente sobre `feature` ni `release`

---

## Comandos útiles

```bash
git branch            # ver ramas locales
git branch -a         # ver ramas locales y remotas
git checkout nombre   # cambiar de rama
git log --oneline     # ver historial compacto
git status            # ver estado actual
````
