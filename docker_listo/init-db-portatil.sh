 
#!/bin/bash

# Ir al directorio del .yml
cd mysql-rds

# Levantar contenedor en segundo plano
sudo docker compose up -d

# Esperar 5 segundos para que MySQL arranque
echo "Esperando a que MySQL inicie..."
sleep 3

# Cargar schema
echo "Cargando schema..."
sudo docker exec -i add-dbms mysql -u root -pdbrootpass < ../data/database.sql

# Cargar datos
echo "Cargando inserts..."
sudo docker exec -i add-dbms mysql -u root -pdbrootpass < ../data/inserts.sql

echo "Base de datos lista."
