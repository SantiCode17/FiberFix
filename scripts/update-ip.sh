#!/bin/bash
# Script para actualizar la IP local en el archivo .env de fiberfix-mobile

ENV_FILE="$(dirname "$0")/../fiberfix-mobile/.env"

# Detectar la IP local (excluyendo loopback y docker)
LOCAL_IP=$(hostname -I | awk '{print $1}')

if [[ -z "$LOCAL_IP" ]]; then
  echo "No se pudo detectar la IP local."
  exit 1
fi

# Actualizar la variable EXPO_PUBLIC_SERVER_IP en el .env
if grep -q '^EXPO_PUBLIC_SERVER_IP=' "$ENV_FILE"; then
  sed -i "s/^EXPO_PUBLIC_SERVER_IP=.*/EXPO_PUBLIC_SERVER_IP=$LOCAL_IP/" "$ENV_FILE"
  echo "IP actualizada a $LOCAL_IP en $ENV_FILE"
else
  echo "EXPO_PUBLIC_SERVER_IP=$LOCAL_IP" >> "$ENV_FILE"
  echo "Variable agregada y actualizada a $LOCAL_IP en $ENV_FILE"
fi
