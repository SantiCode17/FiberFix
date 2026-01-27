/**
 * Utilidades para comunicación con el servidor vía TCP sockets
 * Maneja protocolos de texto y datos binarios
 */

import TcpSocket from 'react-native-tcp-socket';

export interface ImageAttachment {
  uri: string;
  name: string;
  size: number;
  type: string;
}

/**
 * Enviar una incidencia con imágenes al servidor
 * 
 * Protocolo:
 * 1. Enviar encabezado: INCIDENT_WITH_IMAGES|usuario|numeroTicket|motivo|descripcion|numImágenes
 * 2. Para cada imagen:
 *    - Enviar metadatos: nombreArchivo|tipoMime|tamaño
 *    - Enviar datos binarios de la imagen
 * 3. Recibir respuesta: INCIDENT_WITH_IMAGES_OK o INCIDENT_WITH_IMAGES_ERROR
 */
export const sendIncidentWithImages = (
  serverIP: string,
  serverPort: number,
  usuario: string,
  numeroTicket: number,
  motivo: string,
  descripcion: string,
  imagenes: ImageAttachment[],
  timeoutMs: number = 30000
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const cliente = TcpSocket.createConnection(
      { host: serverIP, port: serverPort },
      () => {
        console.log('Conectado al servidor');
      }
    );

    let responseReceived = false;
    const timeout = setTimeout(() => {
      if (!responseReceived) {
        cliente.destroy();
        reject(new Error('Timeout enviando incidencia con imágenes'));
      }
    }, timeoutMs);

    cliente.on('error', (error) => {
      clearTimeout(timeout);
      console.error('Error en socket:', error);
      reject(error);
    });

    cliente.on('data', (data) => {
      clearTimeout(timeout);
      responseReceived = true;

      const respuesta = data.toString().trim();
      console.log('Respuesta del servidor:', respuesta);

      cliente.destroy();

      if (respuesta === 'INCIDENT_WITH_IMAGES_OK') {
        resolve(true);
      } else {
        reject(new Error(`Respuesta inesperada: ${respuesta}`));
      }
    });

    cliente.on('connect', async () => {
      try {
        // 1. Enviar encabezado
        const headerMessage = `INCIDENT_WITH_IMAGES|${usuario}|${numeroTicket}|${motivo}|${descripcion}|${imagenes.length}\n`;
        cliente.write(Buffer.from(headerMessage, 'utf8'));

        // 2. Enviar cada imagen
        for (const imagen of imagenes) {
          // Leer el archivo como buffer
          const fileBuffer = await readFileAsBuffer(imagen.uri);

          // Enviar metadatos
          const metadataLine = `${imagen.name}|${imagen.type}|${fileBuffer.length}\n`;
          cliente.write(Buffer.from(metadataLine, 'utf8'));

          // Enviar datos binarios
          cliente.write(fileBuffer);
        }

        console.log('Incidencia con', imagenes.length, 'imágenes enviada');
      } catch (error) {
        clearTimeout(timeout);
        cliente.destroy();
        reject(error);
      }
    });
  });
};

/**
 * Enviar una incidencia simple sin imágenes
 * 
 * Protocolo: INCIDENT|usuario|numeroTicket|motivo|descripcion
 */
export const sendIncident = (
  serverIP: string,
  serverPort: number,
  usuario: string,
  numeroTicket: number,
  motivo: string,
  descripcion: string,
  timeoutMs: number = 10000
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const cliente = TcpSocket.createConnection(
      { host: serverIP, port: serverPort },
      () => {
        console.log('Conectado al servidor');
      }
    );

    let responseReceived = false;
    const timeout = setTimeout(() => {
      if (!responseReceived) {
        cliente.destroy();
        reject(new Error('Timeout enviando incidencia'));
      }
    }, timeoutMs);

    cliente.on('error', (error) => {
      clearTimeout(timeout);
      console.error('Error en socket:', error);
      reject(error);
    });

    cliente.on('data', (data) => {
      clearTimeout(timeout);
      responseReceived = true;

      const respuesta = data.toString().trim();
      console.log('Respuesta del servidor:', respuesta);

      cliente.destroy();

      if (respuesta === 'INCIDENT_OK') {
        resolve(true);
      } else {
        reject(new Error(`Respuesta inesperada: ${respuesta}`));
      }
    });

    cliente.on('connect', () => {
      const message = `INCIDENT|${usuario}|${numeroTicket}|${motivo}|${descripcion}\n`;
      cliente.write(Buffer.from(message, 'utf8'));
      console.log('Incidencia sin imágenes enviada');
    });
  });
};

/**
 * Obtener detalles de un ticket incluyendo metadatos de imágenes
 * 
 * Protocolo: TICKET_DETAIL|usuario|idTicket
 * Respuesta: JSON con ticket e imágenes
 */
export const getTicketDetail = (
  serverIP: string,
  serverPort: number,
  usuario: string,
  idTicket: number,
  timeoutMs: number = 10000
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const cliente = TcpSocket.createConnection(
      { host: serverIP, port: serverPort },
      () => {
        console.log('Conectado al servidor');
      }
    );

    let responseReceived = false;
    let responseData = '';

    const timeout = setTimeout(() => {
      if (!responseReceived) {
        cliente.destroy();
        reject(new Error('Timeout obteniendo detalle de ticket'));
      }
    }, timeoutMs);

    cliente.on('error', (error) => {
      clearTimeout(timeout);
      console.error('Error en socket:', error);
      reject(error);
    });

    cliente.on('data', (data) => {
      responseData += data.toString();

      // Intentar parsear como JSON
      try {
        const json = JSON.parse(responseData.trim());
        clearTimeout(timeout);
        responseReceived = true;
        cliente.destroy();
        resolve(json);
      } catch (e) {
        // Aún no tenemos el JSON completo
      }
    });

    cliente.on('connect', () => {
      const message = `TICKET_DETAIL|${usuario}|${idTicket}\n`;
      cliente.write(Buffer.from(message, 'utf8'));
      console.log('Solicitud de detalle de ticket enviada');
    });
  });
};

/**
 * Obtener datos binarios de una imagen
 * 
 * Protocolo: IMAGE_DATA|usuario|idImagen
 * Respuesta: JSON con metadatos seguido de datos binarios
 */
export const getImageData = (
  serverIP: string,
  serverPort: number,
  usuario: string,
  idImagen: number,
  timeoutMs: number = 15000
): Promise<{ metadata: any; imageBuffer: Buffer }> => {
  return new Promise((resolve, reject) => {
    const cliente = TcpSocket.createConnection(
      { host: serverIP, port: serverPort },
      () => {
        console.log('Conectado al servidor');
      }
    );

    let metadataReceived = false;
    let metadata: any = null;
    let dataSize = 0;
    let imageBuffer: Buffer | null = null;
    let allData = Buffer.alloc(0);

    const timeout = setTimeout(() => {
      cliente.destroy();
      reject(new Error('Timeout obteniendo imagen'));
    }, timeoutMs);

    cliente.on('error', (error) => {
      clearTimeout(timeout);
      console.error('Error en socket:', error);
      reject(error);
    });

    cliente.on('data', (data) => {
      allData = Buffer.concat([allData, Buffer.from(data as any)]);

      if (!metadataReceived) {
        // Buscar fin de la línea JSON
        const newlineIndex = allData.indexOf('\n');
        if (newlineIndex !== -1) {
          try {
            const metadataString = allData.slice(0, newlineIndex).toString();
            metadata = JSON.parse(metadataString);
            metadataReceived = true;
            allData = allData.slice(newlineIndex + 1);
          } catch (e) {
            clearTimeout(timeout);
            cliente.destroy();
            reject(new Error('Error parseando metadatos de imagen'));
            return;
          }
        }
      }

      if (metadataReceived && !imageBuffer) {
        // Esperar a recibir el tamaño (4 bytes) y luego la imagen
        if (allData.length >= 4 && dataSize === 0) {
          dataSize = allData.readUInt32BE(0);
          allData = allData.slice(4);
        }

        if (dataSize > 0 && allData.length >= dataSize) {
          imageBuffer = allData.slice(0, dataSize);
          clearTimeout(timeout);
          cliente.destroy();
          resolve({ metadata, imageBuffer });
        }
      }
    });

    cliente.on('connect', () => {
      const message = `IMAGE_DATA|${usuario}|${idImagen}\n`;
      cliente.write(Buffer.from(message, 'utf8'));
      console.log('Solicitud de imagen enviada');
    });
  });
};

/**
 * Editar un ticket (motivo y descripción)
 * 
 * Protocolo: EDIT|usuario|idTicket|motivo|descripcion
 */
export const editTicket = (
  serverIP: string,
  serverPort: number,
  usuario: string,
  idTicket: number,
  motivo: string,
  descripcion: string,
  timeoutMs: number = 10000
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const cliente = TcpSocket.createConnection(
      { host: serverIP, port: serverPort },
      () => {
        console.log('Conectado al servidor');
      }
    );

    let responseReceived = false;
    const timeout = setTimeout(() => {
      if (!responseReceived) {
        cliente.destroy();
        reject(new Error('Timeout editando ticket'));
      }
    }, timeoutMs);

    cliente.on('error', (error) => {
      clearTimeout(timeout);
      console.error('Error en socket:', error);
      reject(error);
    });

    cliente.on('data', (data) => {
      clearTimeout(timeout);
      responseReceived = true;

      const respuesta = data.toString().trim();
      console.log('Respuesta del servidor:', respuesta);

      cliente.destroy();

      if (respuesta === 'EDIT_OK') {
        resolve(true);
      } else {
        reject(new Error(`Respuesta inesperada: ${respuesta}`));
      }
    });

    cliente.on('connect', () => {
      const message = `EDIT|${usuario}|${idTicket}|${motivo}|${descripcion}\n`;
      cliente.write(Buffer.from(message, 'utf8'));
      console.log('Solicitud de edición enviada');
    });
  });
};

/**
 * Eliminar un ticket (borrado lógico)
 * 
 * Protocolo: DELETE|usuario|idTicket
 */
export const deleteTicket = (
  serverIP: string,
  serverPort: number,
  usuario: string,
  idTicket: number,
  timeoutMs: number = 10000
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const cliente = TcpSocket.createConnection(
      { host: serverIP, port: serverPort },
      () => {
        console.log('Conectado al servidor');
      }
    );

    let responseReceived = false;
    const timeout = setTimeout(() => {
      if (!responseReceived) {
        cliente.destroy();
        reject(new Error('Timeout eliminando ticket'));
      }
    }, timeoutMs);

    cliente.on('error', (error) => {
      clearTimeout(timeout);
      console.error('Error en socket:', error);
      reject(error);
    });

    cliente.on('data', (data) => {
      clearTimeout(timeout);
      responseReceived = true;

      const respuesta = data.toString().trim();
      console.log('Respuesta del servidor:', respuesta);

      cliente.destroy();

      if (respuesta === 'DELETE_OK') {
        resolve(true);
      } else {
        reject(new Error(`Respuesta inesperada: ${respuesta}`));
      }
    });

    cliente.on('connect', () => {
      const message = `DELETE|${usuario}|${idTicket}\n`;
      cliente.write(Buffer.from(message, 'utf8'));
      console.log('Solicitud de eliminación enviada');
    });
  });
};

/**
 * Reanudar un ticket cancelado
 * 
 * Protocolo: RESUME|usuario|idTicket
 */
export const resumeTicket = (
  serverIP: string,
  serverPort: number,
  usuario: string,
  idTicket: number,
  timeoutMs: number = 10000
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const cliente = TcpSocket.createConnection(
      { host: serverIP, port: serverPort },
      () => {
        console.log('Conectado al servidor');
      }
    );

    let responseReceived = false;
    const timeout = setTimeout(() => {
      if (!responseReceived) {
        cliente.destroy();
        reject(new Error('Timeout reanudando ticket'));
      }
    }, timeoutMs);

    cliente.on('error', (error) => {
      clearTimeout(timeout);
      console.error('Error en socket:', error);
      reject(error);
    });

    cliente.on('data', (data) => {
      clearTimeout(timeout);
      responseReceived = true;

      const respuesta = data.toString().trim();
      console.log('Respuesta del servidor:', respuesta);

      cliente.destroy();

      if (respuesta === 'RESUME_OK') {
        resolve(true);
      } else {
        reject(new Error(`Respuesta inesperada: ${respuesta}`));
      }
    });

    cliente.on('connect', () => {
      const message = `RESUME|${usuario}|${idTicket}\n`;
      cliente.write(Buffer.from(message, 'utf8'));
      console.log('Solicitud de reanudación enviada');
    });
  });
};

/**
 * Leer archivo como Buffer (para imágenes)
 * NOTA: Implementación pendiente - requiere react-native-fs o similar
 */
async function readFileAsBuffer(fileUri: string): Promise<Buffer> {
  // TODO: Implementar usando react-native-fs
  // const RNFetchBlob = require('rn-fetch-blob').default;
  // const base64 = await RNFetchBlob.fs.readFile(fileUri, 'base64');
  // return Buffer.from(base64, 'base64');

  console.warn('readFileAsBuffer no está implementado aún');
  return Buffer.alloc(0);
}

/**
 * Convertir Buffer a URI de datos para mostrar en imagen
 */
export const bufferToDataUri = (buffer: Buffer, mimeType: string = 'image/jpeg'): string => {
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
};

/**
 * Convertir objeto JSON a búfer para envío
 */
export const objectToBuffer = (obj: any): Buffer => {
  return Buffer.from(JSON.stringify(obj), 'utf8');
};

/**
 * Convertir búfer a objeto JSON
 */
export const bufferToObject = (buffer: Buffer): any => {
  return JSON.parse(buffer.toString('utf8'));
};
