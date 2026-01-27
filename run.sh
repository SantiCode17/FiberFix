#!/bin/bash

# 🚀 FIBERFIX - EJECUTAR LA APP (Corre esto cada vez)

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() { echo -e "\n${BLUE}╔════════════════════════════════════════════════════════╗${NC}\n${BLUE}║ 🚀 INICIANDO FIBERFIX${NC}\n${BLUE}╚════════════════════════════════════════════════════════╝${NC}\n"; }
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_info() { echo -e "${CYAN}➜${NC} $1"; }

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

print_header

# 1. Verificar Docker
print_info "Verificando Docker..."
if ! docker ps &>/dev/null; then
    print_error "Docker no está corriendo"
    exit 1
fi
print_success "Docker está corriendo"

# 2. Iniciar MySQL si no está corriendo
if docker ps | grep -q "add-dbms"; then
    print_success "MySQL ya está corriendo"
else
    print_info "Iniciando MySQL..."
    docker run -d --name add-dbms --network edu-shared \
      -e MYSQL_ROOT_PASSWORD=dbrootpass -e MYSQL_DATABASE=FiberFix \
      -e MYSQL_USER=fiberfix -e MYSQL_PASSWORD=fiberfix123 \
      -p 33006:3306 -v mysql_fiberfix:/var/lib/mysql mysql:8.0 > /dev/null
    
    for i in {1..30}; do
        if docker exec add-dbms mysql -u root -pdbrootpass -e "SELECT 1" &>/dev/null; then
            break
        fi
        echo -n "."
        sleep 1
    done
    echo ""
    print_success "MySQL iniciado"
fi

# 3. Iniciar Servidor Java
print_info "Compilando servidor Java (si es necesario)..."
cd "$PROJECT_ROOT/Servidor/serverFiberFIx"
mvn clean package -q -DskipTests 2>/dev/null

# Copiar server.properties a la raíz para que lo encuentre el JAR
cp server.properties "$PROJECT_ROOT/"

print_info "Iniciando servidor en puerto 5000..."
cd "$PROJECT_ROOT"
java -jar Servidor/serverFiberFIx/target/serverFiberFIx.jar > /tmp/fiberfix-server.log 2>&1 &
SERVER_PID=$!

print_info "Esperando a que el servidor esté listo..."
for i in {1..30}; do
    if ! kill -0 $SERVER_PID 2>/dev/null; then
        print_error "El servidor se detuvo"
        cat /tmp/fiberfix-server.log
        exit 1
    fi
    # Verificar si el servidor está escuchando en el puerto
    if ss -tuln 2>/dev/null | grep -q ":5000 " || lsof -i :5000 2>/dev/null | grep -q java; then
        break
    fi
    echo -n "."
    sleep 1
done
echo ""

if ! kill -0 $SERVER_PID 2>/dev/null; then
    print_error "El servidor se detuvo"
    cat /tmp/fiberfix-server.log
    exit 1
fi
print_success "Servidor Java iniciado"

# 4. Iniciar App Móvil
print_info "Iniciando app móvil..."
cd "$PROJECT_ROOT/fiberfix-mobile"

if [ ! -d "node_modules" ]; then
    print_info "Instalando dependencias de npm..."
    npm install --quiet 2>/dev/null
fi

echo -e "\n${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Escanea el código QR con tu dispositivo           ${NC}"
echo -e "${CYAN}  o presiona 'w' para abrir en web                   ${NC}"
echo -e "${CYAN}  Presiona 'Ctrl+C' para detener                     ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}\n"

npm start

# Limpieza
kill $SERVER_PID 2>/dev/null || true
print_success "FiberFix cerrado"
