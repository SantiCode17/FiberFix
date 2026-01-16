 
#!/bin/bash

# Ir al directorio del .yml
cd mysql-rds

# Levantar contenedor en segundo plano
docker-compose up -d

# Esperar 5 segundos para que MySQL arranque
echo "Esperando a que MySQL inicie..."
sleep 5

# Cargar schema
echo "Cargando schema..."
docker exec -i add-dbms mysql -u root -pdbrootpass < ../data/database.sql

# Cargar datos
echo "Cargando inserts..."
docker exec -i add-dbms mysql -u root -pdbrootpass < ../data/inserts.sql

echo "Base de datos lista."
