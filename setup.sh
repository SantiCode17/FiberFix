#!/bin/bash

# 🚀 FIBERFIX - SETUP (Ejecuta esto UNA SOLA VEZ)

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() { echo -e "\n${BLUE}╔════════════════════════════════════════════════════════╗${NC}\n${BLUE}║ 🚀 CONFIGURANDO FIBERFIX${NC}\n${BLUE}╚════════════════════════════════════════════════════════╝${NC}\n"; }
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_info() { echo -e "${CYAN}➜${NC} $1"; }

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

print_header

# 1. Verificar Docker
print_info "Verificando Docker..."
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado: https://www.docker.com"
    exit 1
fi
if ! docker ps &>/dev/null; then
    print_error "Docker no está corriendo"
    exit 1
fi
print_success "Docker está corriendo"

# 2. Crear red de Docker
print_info "Creando red Docker..."
docker network create edu-shared 2>/dev/null || true
print_success "Red Docker lista"

# 3. Iniciar MySQL
print_info "Iniciando MySQL..."
docker rm -f add-dbms 2>/dev/null || true
docker run -d --name add-dbms --network edu-shared \
  -e MYSQL_ROOT_PASSWORD=dbrootpass -e MYSQL_DATABASE=FiberFix \
  -e MYSQL_USER=fiberfix -e MYSQL_PASSWORD=fiberfix123 \
  -p 33006:3306 -v mysql_fiberfix:/var/lib/mysql mysql:8.0 > /dev/null

print_info "Esperando MySQL..."
for i in {1..30}; do
    if docker exec add-dbms mysql -u root -pdbrootpass -e "SELECT 1" &>/dev/null; then
        break
    fi
    echo -n "."
    sleep 1
done
echo ""
print_success "MySQL está listo"

# 4. Cargar base de datos
print_info "Cargando base de datos..."
docker exec -i add-dbms mysql -u root -pdbrootpass FiberFix < "$PROJECT_ROOT/docker_listo/data/database.sql" 2>/dev/null
docker exec -i add-dbms mysql -u root -pdbrootpass FiberFix < "$PROJECT_ROOT/docker_listo/data/inserts.sql" 2>/dev/null
print_success "Base de datos configurada"

# 5. Obtener IP local
LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "127.0.0.1")
print_success "IP detectada: $LOCAL_IP"

# 6. Crear .env de la app móvil
cat > "$PROJECT_ROOT/fiberfix-mobile/.env" << EOF
EXPO_PUBLIC_SERVER_IP=$LOCAL_IP
EXPO_PUBLIC_SERVER_PORT=5000
EOF
print_success "App móvil configurada"

# 7. Crear server.properties
cat > "$PROJECT_ROOT/Servidor/serverFiberFIx/server.properties" << EOF
SERVER-PORT:5000
BBDD-USER:root
BBDD-PASS:dbrootpass
BBDD-HOST:localhost
BBDD-PORT:33006
EOF
# Copiar a la raíz también para que esté disponible cuando se ejecute el JAR
cp "$PROJECT_ROOT/Servidor/serverFiberFIx/server.properties" "$PROJECT_ROOT/"
print_success "Servidor configurado"

# 8. Compilar servidor Java
if command -v mvn &> /dev/null; then
    print_info "Compilando servidor Java..."
    cd "$PROJECT_ROOT/Servidor/serverFiberFIx"
    mvn clean package -q -DskipTests 2>/dev/null
    print_success "Servidor compilado"
fi

# 9. Instalar dependencias móviles
if command -v npm &> /dev/null; then
    print_info "Instalando dependencias móviles..."
    cd "$PROJECT_ROOT/fiberfix-mobile"
    npm install 2>/dev/null
    print_success "Dependencias instaladas"
fi

echo -e "\n${GREEN}✨ Setup completado!${NC}\nAhora ejecuta: ${CYAN}./run.sh${NC}\n"
