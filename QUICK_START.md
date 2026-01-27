# 🚀 QUICK START - FiberFix

## 2 pasos, listo.

### Paso 1: Setup (una sola vez)

```bash
chmod +x setup.sh run.sh
./setup.sh
```

### Paso 2: Ejecutar

```bash
./run.sh
```

**Eso es todo.** El servidor Java se inicia en puerto 5000, MySQL en Docker, y se abre Expo automáticamente.

---

## Credenciales de Prueba

| Usuario | Contraseña |
|---------|-----------|
| `TEC001` | `1234` |
| `jgarcia` | `pass1234` |
| `mperez` | `secure456` |
| `dobles` | `1801` |

---

## Problemas?

**Docker no está corriendo:** Abre Docker Desktop.

**Puerto 5000 en uso:** Cambia el puerto en `Servidor/serverFiberFIx/server.properties`

**MySQL no inicia:** Ejecuta `docker rm -f add-dbms` y vuelve a correr `./setup.sh`
