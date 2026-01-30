import CustomAlert from "@/components/CustomAlert";
import { ErrorAlert, ErrorMessage } from "@/components/ErrorAlert";
import { ImageGallery } from "@/components/ImageGallery";
import { ImagePickerComponent } from "@/components/ImagePickerComponent";
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useUser } from '@/context/UserContext';
import { useKeepAwakeOnScreen } from '@/hooks/useKeepAwakeOnScreen';
import { MOTIVOS_CON_OTROS } from '@/types/motivo';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import TcpSocket from 'react-native-tcp-socket';

// Tipo de dato mejorado
type ImageMetadata = {
  id: number;
  nombre: string;
  tipo: string;
  tamaño: number;
  descripcion?: string | null;
  fecha: string;
};

type Ticket = {
  id: number;
  numero_ticket: number;
  estado: 'Pendiente' | 'En Proceso' | 'Terminado' | 'Cancelado' | 'Borrado';
  motivo?: string | null;
  descripcion?: string | null;
  fecha_creacion: string;
  fecha_inicio?: string | null;
  fecha_cierre?: string | null;
  direccion?: string;
  latitud?: number;
  longitud?: number;
  imagenes?: ImageMetadata[];
};

export default function ExploreScreen() {
  useKeepAwakeOnScreen();
  const [showBubble, setShowBubble] = useState(false);
  const { userId } = useUser();
  const params = useLocalSearchParams();
  const router = useRouter();
  const SERVER_IP = process.env.EXPO_PUBLIC_SERVER_IP;
  const SERVER_PORT = Number(process.env.EXPO_PUBLIC_SERVER_PORT);

  // Estados principales
  const [historyData, setHistoryData] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Campos temporales de edición
  const [editMotivo, setEditMotivo] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editCustomMotivo, setEditCustomMotivo] = useState('');
  // Nuevas imágenes seleccionadas durante la edición (no las ya asociadas en el servidor)
  const [editNewImages, setEditNewImages] = useState<{ uri: string; name: string; size: number; type: string }[]>([]);

  // Campos de buscador y fitlrado
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | Ticket['estado']>('Todos');
  const [sortOrder, setSortOrder] = useState<'reciente' | 'antiguo'>('reciente');
  const [activeTab, setActiveTab] = useState<'detalle' | 'otro'>('otro');

  // Estado para el CustomAlert
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [customAlertConfig, setCustomAlertConfig] = useState({
    title: '',
    message: '',
    confirmText: '',
    cancelText: '',
    onConfirm: () => { },
  });

  const [resumeTicketError, setResumeTicketError] = useState<ErrorMessage | null>(null);

  /*Filtrador de ticket*/
  const filteredHistory = historyData
    .filter((ticket) => {
      //Busca por numero de ticket, descripcion o direccion
      const query = searchQuery.toLowerCase();
      const matchesSearch = (
        ticket.numero_ticket.toString().includes(query) ||
        ticket.descripcion?.toLowerCase().includes(query) ||
        ticket.direccion?.toLowerCase().includes(query)
      );
      const matchesStatus = statusFilter === 'Todos' || ticket.estado === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      //Ordena por fecha
      const dateA = new Date(a.fecha_creacion).getTime();
      const dateB = new Date(b.fecha_creacion).getTime();
      return sortOrder === 'reciente' ? dateB - dateA : dateA - dateB;
    });

  // Recargar historial al enfocar pantalla
  useFocusEffect(
    React.useCallback(() => {
      loadHistory();
    }, [])
  );

  // Abrir detalle de ticket desde parámetro de navegación
  useEffect(() => {
    if (params.openTicket && historyData.length > 0) {
      const ticketToOpen = historyData.find((t) => t.numero_ticket.toString() === params.openTicket);
      if (ticketToOpen) {
        openDetail(ticketToOpen);
        // Limpiar el parámetro después de abrir el modal para evitar que se abra de nuevo
        router.setParams({ openTicket: undefined });
      }
    }
  }, [params.openTicket, historyData]);

  // Limpiar mensaje de estado
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const loadHistory = () => {
    setIsLoading(true);

    try {
      const cliente = TcpSocket.createConnection({ host: SERVER_IP, port: SERVER_PORT }, () => {
        if (userId) {
          cliente.write(`HISTORY|${userId}\n`); // Enviar el ID dinámico del usuario autenticado
        } else {
          Alert.alert('Error', 'No se pudo obtener el ID del usuario.');
          cliente.end();
        }

      });

      cliente.on('data', (data) => {
        const text = data.toString().trim();
        console.log('Respuesta servidor:', text);

        try {
          const jsonStr = data.toString().trim();
          const tickets = JSON.parse(jsonStr);
          setHistoryData(tickets.filter((t: Ticket) => t.estado !== 'Borrado'));
          setIsLoading(false);
        } catch (e) {
          console.error('Error parsing history:', e);
          setIsLoading(false);
        }
        cliente.end();
      });

      cliente.on('error', () => {
        setStatusMessage({ text: "ERROR AL CARGAR HISTORIAL", type: 'error' });
        setIsLoading(false);
      });
    } catch (error) {
      setStatusMessage({ text: "ERROR DE CONEXIÓN", type: 'error' });
      setIsLoading(false);
    }
  };

  // Enviar imágenes nuevas y asociarlas al ticket existente usando protocolo INCIDENT_WITH_IMAGES
  const sendImagesToTicket = (numeroTicket: number, images: { uri: string; name: string; size: number; type: string }[]) => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        // Preparar imágenes como base64
        const imagenData: { name: string; type: string; size: number; base64: string }[] = [];
        for (const img of images) {
          const base64 = await (FileSystem as any).readAsStringAsync(img.uri, { encoding: 'base64' });
          imagenData.push({ name: img.name, type: img.type, size: img.size, base64 });
        }

        let writeCompleted = false;

        const cliente = TcpSocket.createConnection({ host: SERVER_IP, port: SERVER_PORT }, async () => {
          try {
            // Construir payload usando nuevas líneas simples (coincide con sendIncidentWithImages)
            let payload = '';
            payload += `INCIDENT_WITH_IMAGES|${userId}|${numeroTicket}|EDIT_ADD_IMAGES|Añadiendo imágenes|${imagenData.length}\n`;

            for (const img of imagenData) {
              payload += `${img.name}|${img.type}|${img.size}\n`;
              payload += `${img.base64}\n`;
            }

            // Helper para escribir esperando al callback (evita cerrar antes de que se drene)
            const writeAsync = (data: string, timeoutMs = 120000) => new Promise<void>((res, rej) => {
              let finished = false;
              const timer = setTimeout(() => {
                if (finished) return;
                finished = true;
                rej(new Error('Timeout al escribir en socket'));
              }, timeoutMs);

              try {
                cliente.write(data, undefined, () => {
                  if (finished) return;
                  finished = true;
                  clearTimeout(timer);
                  res();
                });
              } catch (e) {
                if (finished) return;
                finished = true;
                clearTimeout(timer);
                rej(e as Error);
              }
            });

            // Enviar y esperar a que la escritura se complete antes de procesar la respuesta
            await writeAsync(payload, 120000);
            // marcar que todo se envió para poder procesar la respuesta
            // (no cerramos el socket aquí; lo hará el handler de 'data')
            writeCompleted = true;
          } catch (err) {
            cliente.destroy();
            reject(err);
          }
        });

        let responseReceived = false;
        const timeout = setTimeout(() => {
          if (!responseReceived) {
            try { cliente.destroy(); } catch (e) {}
            reject(new Error('Timeout al subir imágenes'));
          }
        }, 60000);

        // Ignorar respuestas hasta que la escritura haya finalizado.
        // Usamos la bandera `writeCompleted` declarada arriba para saber si la escritura ya terminó.
        // Establecer un listener para 'close' y 'end' para limpiar tiempo si el servidor cierra sin responder
        cliente.on('close', () => {
          // no hacer nada aquí; si no recibimos respuesta será tratado por el timeout
        });

        cliente.on('data', (data) => {
          if (!writeCompleted) return; // esperar a que la escritura complete
          responseReceived = true;
          clearTimeout(timeout);
          const resp = data.toString().trim();
          console.log('[sendImagesToTicket] respuesta servidor:', resp);
          try { cliente.end(); } catch (e) {}
          if (resp && resp.includes('OK')) resolve();
          else reject(new Error('Respuesta inesperada: ' + resp));
        });

        cliente.on('error', (err) => {
          clearTimeout(timeout);
          cliente.destroy();
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  };

  // Abrir detalle del ticket
  const openDetail = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsEditing(false);
    setEditMotivo(ticket.motivo || '');
    setEditDescripcion(ticket.descripcion || '');
    setEditCustomMotivo('');
  };

  // Guardar cambios editados
  const saveChanges = () => {
    if (!selectedTicket) return;

    let finalMotivo = editMotivo;

    // Si es motivo personalizado
    if (editMotivo === 'Otros' && editCustomMotivo.trim()) {
      finalMotivo = editCustomMotivo.trim();
    } else if (editMotivo === 'Otros' && !editCustomMotivo.trim()) {
      Alert.alert("Falta información", "Por favor, escribe un título personalizado.");
      return;
    }

    const mensaje = `EDIT|${userId}|${selectedTicket.id}|${finalMotivo}|${editDescripcion}`;

    try {
      const cliente = TcpSocket.createConnection({ host: SERVER_IP, port: SERVER_PORT }, () => {
        cliente.write(mensaje + '\n');
      });

      cliente.on('data', async (data) => {
        const response = data.toString().trim();
        if (response === 'EDIT_OK') {
          try {
            if (editNewImages.length > 0 && selectedTicket) {
              setStatusMessage({ text: 'Subiendo imágenes...', type: 'warning' });
              await sendImagesToTicket(selectedTicket.numero_ticket, editNewImages);
              setEditNewImages([]);
            }
            setStatusMessage({ text: 'TICKET ACTUALIZADO', type: 'success' });
            setIsEditing(false);
            setSelectedTicket(null);
            loadHistory();
          } catch (err) {
            setStatusMessage({ text: 'ERROR AL SUBIR IMÁGENES', type: 'error' });
          }
        } else {
          setStatusMessage({ text: 'ERROR AL EDITAR TICKET', type: 'error' });
        }
        cliente.end();
      });

      cliente.on('error', () => {
        setStatusMessage({ text: "ERROR DE ENVÍO", type: 'error' });
      });
    } catch (error) {
      setStatusMessage({ text: "ERROR DE CONEXIÓN", type: 'error' });
    }
  };

  // Borrar ticket
  const deleteTicket = () => {
    if (!selectedTicket) return;

    setResumeTicketError({
      type: "warning",
      title: "Eliminar Ticket",
      message: "¿Estás seguro de que deseas eliminar este ticket? Esta acción no se puede deshacer.",
      action: {
        label: "Eliminar",
        onPress: () => {
          const mensaje = `DELETE|${userId}|${selectedTicket.id}`;

          try {
            const cliente = TcpSocket.createConnection({ host: SERVER_IP, port: SERVER_PORT }, () => {
              cliente.write(mensaje + '\n');
            });

            cliente.on('data', (data) => {
              const response = data.toString().trim();
              if (response === 'DELETE_OK') {
                setStatusMessage({ text: "TICKET ELIMINADO", type: 'success' });
                setSelectedTicket(null);
                loadHistory();
              } else if (response === 'DELETE_ERROR_TERMINADO') {
                setResumeTicketError({
                  type: "error",
                  title: "No se puede borrar el ticket",
                  message: "Este ticket está en estado 'Terminado' y no puede ser eliminado.",
                  action: {
                    label: "Entendido",
                    onPress: () => setResumeTicketError(null),
                  },
                });
              } else {
                setStatusMessage({ text: "ERROR AL ELIMINAR", type: 'error' });
              }
              cliente.end();
            });

            cliente.on('error', () => {
              setStatusMessage({ text: "ERROR DE ENVÍO", type: 'error' });
            });
          } catch (error) {
            setStatusMessage({ text: "ERROR DE CONEXIÓN", type: 'error' });
          }

          setResumeTicketError(null);
        },
      },
    });
  };

  // Reanudar ticket
  const resumeTicket = () => {
    if (!selectedTicket) return;

    setResumeTicketError({
      type: "info",
      title: "Reanudar Ticket",
      message: "¿Deseas reanudar este ticket para continuar trabajando?",
      action: {
        label: "Reanudar",
        onPress: () => {
          setSelectedTicket(null);
          router.replace({
            pathname: '/home',
            params: {
              resumeTicket: selectedTicket.numero_ticket.toString()
            }
          });
          setResumeTicketError(null);
        },
      },
    });
  };

  // Obtener color según estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Terminado': return { bg: 'bg-green-50', icon: 'checkmark.circle.fill', color: '#22C55E' };
      case 'Cancelado': return { bg: 'bg-red-50', icon: 'exclamationmark.triangle.fill', color: '#DC2626' };
      case 'Pendiente': return { bg: 'bg-yellow-50', icon: 'clock.fill', color: '#F59E0B' };
      case 'En Proceso': return { bg: 'bg-blue-50', icon: 'play.fill', color: '#3B82F6' };
      default: return { bg: 'bg-gray-50', icon: 'doc.text.fill', color: '#6B7280' };
    }
  };

  const estadoColor = selectedTicket ? getEstadoColor(selectedTicket.estado) : { bg: 'bg-gray-50', icon: 'doc.text.fill', color: '#6B7280' };

  // Define the function at the top level of the component
  const handleSortOrderChange = (order: 'reciente' | 'antiguo') => {
    setSortOrder(order);
  };

  /**
   * Descarga una imagen específica del servidor
   * Usa el protocolo IMAGE_DATA|usuario|idImagen
   * Retorna una Data URI que puede ser usada directamente en Image
   */
  const downloadImage = async (imageId: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!TcpSocket) {
        reject(new Error('Socket TCP no disponible'));
        return;
      }

      try {
        const cliente = TcpSocket.createConnection(
          { host: SERVER_IP, port: SERVER_PORT },
          () => {
            cliente.write(`IMAGE_DATA|${userId}|${imageId}\n`);
          }
        );

        let metadataReceived = false;
        const dataChunks: string[] = [];
        let totalData = '';

        const timeout = setTimeout(() => {
          cliente.end();
          reject(new Error('Timeout descargando imagen'));
        }, 30000);

        cliente.on('data', (data: any) => {
          try {
            const dataStr = typeof data === 'string' ? data : data.toString('utf8');
            totalData += dataStr;
            
            // Intentar separar metadatos y datos base64
            if (!metadataReceived) {
              const lines = totalData.split('\n');
              
              if (lines.length >= 1) {
                try {
                  // Intenta parsear la primera línea como JSON
                  const firstLine = lines[0].trim();
                  if (firstLine.startsWith('{')) {
                    JSON.parse(firstLine);
                    metadataReceived = true;
                    
                    // Si hay más líneas, la segunda es el base64
                    if (lines.length >= 2) {
                      const base64Str = lines[1].trim();
                      if (base64Str && !base64Str.includes('ERROR')) {
                        dataChunks.push(base64Str);
                      }
                    }
                  }
                } catch (e) {
                  // Aún no tenemos JSON válido completo
                }
              }
            } else {
              // Ya recibimos metadatos, acumular base64
              const lines = totalData.split('\n');
              if (lines.length >= 2) {
                const base64Str = lines[1].trim();
                if (base64Str) {
                  dataChunks.push(base64Str);
                }
              }
            }
          } catch (error) {
            console.error('Error procesando datos:', error);
          }
        });

        cliente.on('close', () => {
          clearTimeout(timeout);

          if (totalData && totalData.length > 0) {
            try {
              const lines = totalData.split('\n').map((l) => l.trim()).filter(Boolean);

              // Si la primera línea es JSON, la segunda suele ser el base64
              let base64 = '';
              if (lines.length >= 2 && lines[0].startsWith('{')) {
                base64 = lines[1];
              } else {
                // Intentar extraer un token base64 largo en cualquier parte del payload
                const match = totalData.match(/[A-Za-z0-9+/=]{100,}/);
                if (match) base64 = match[0];
                else if (lines.length >= 1) base64 = lines[0];
              }

              if (base64 && !base64.includes('ERROR')) {
                const dataUri = `data:image/jpeg;base64,${base64}`;
                resolve(dataUri);
              } else {
                // Fallback: si hay contenido no-error, usarlo tal cual
                const cleaned = totalData.trim();
                if (cleaned && !cleaned.includes('ERROR')) {
                  resolve(`data:image/jpeg;base64,${cleaned}`);
                } else {
                  reject(new Error('No se recibieron datos válidos de imagen'));
                }
              }
            } catch (error) {
              reject(new Error('Error procesando respuesta'));
            }
          } else {
            reject(new Error('No se recibieron datos de imagen'));
          }
        });

        cliente.on('error', (err: any) => {
          clearTimeout(timeout);
          reject(new Error('Error de conexión: ' + (err?.message || 'Desconocido')));
        });
      } catch (err) {
        reject(new Error('No se pudo conectar: ' + (err as any)?.message));
      }
    });
  };

  return (
    <View className="flex-1 bg-white">

      {/* BACKGROUND DECORATIVO */}
      <View className="absolute inset-0 flex-row flex-wrap opacity-5">
        {[...Array(100)].map((_, i) => (
          <View key={i} className="w-20 h-20 border border-gray-400" />
        ))}
      </View>

      {/* CABECERA */}
      <View className="bg-fiber-blue pt-16 pb-12 px-8 rounded-b-[40px] shadow-lg mb-6 relative z-10">
        <Text className="text-white text-4xl font-black tracking-tighter">HISTORIAL</Text>
        <Text className="text-fiber-orange text-[10px] font-bold tracking-[0.4em] uppercase">Registro de Operaciones</Text>
      </View>

      {/* MENSAJE DE ESTADO */}
      {statusMessage && (
        <View
          className={`mx-6 mb-4 flex-row items-center px-4 py-3 rounded-2xl ${statusMessage.type === 'error'
            ? 'bg-red-100'
            : statusMessage.type === 'warning'
              ? 'bg-yellow-100'
              : 'bg-green-100'
            }`}
        >
          <IconSymbol
            name={
              statusMessage.type === 'error'
                ? 'exclamationmark.triangle.fill'
                : 'checkmark.circle.fill'
            }
            size={18}
            color={
              statusMessage.type === 'error'
                ? '#DC2626'
                : statusMessage.type === 'warning'
                  ? '#D97706'
                  : '#22C55E'
            }
          />
          <Text
            className={`ml-3 font-bold text-sm ${statusMessage.type === 'error'
              ? 'text-red-700'
              : statusMessage.type === 'warning'
                ? 'text-yellow-700'
                : 'text-green-700'
              }`}
          >
            {statusMessage.text}
          </Text>
        </View>
      )}

      {/* BUSCADOR */}
      <View className="px-6 mb-4">
        <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
          <IconSymbol name="search" size={20} color="#94A3B8" />
          <TextInput
            placeholder="Buscar ticket"
            placeholderTextColor="#94A3B8"
            className="flex-1 ml-3 text-fiber-dark font-semibold"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={20} color="#CBD5E1" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* FILTROS DE ESTADO */}
      <View className="mb-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24 }}
        >
          {(['Todos', 'Terminado', 'Cancelado', 'Pendiente', 'En Proceso'] as const).map((status) => (
            <TouchableOpacity
              key={status}
              onPress={() => setStatusFilter(status)}
              className={`px-6 py-3 rounded-full mr-3 border ${statusFilter === status ? 'bg-fiber-blue' : 'bg-white'}`}
            >
              <Text className={`text-sm font-bold ${statusFilter === status ? 'text-white' : 'text-black'}`}>{status}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ORDENAR POR FECHA */}
      <View className="px-6 mb-4 ml-5 flex-row items-center">
        <Text className="text-xs font-bold items-center uppercase text-gray-400 mr-3">Ordenar por fecha:</Text>
        <TouchableOpacity
          onPress={() => setSortOrder('reciente')}
          className={`flex-row items-center px-5 py-3 rounded-full border mr-2 ${sortOrder === 'reciente' ? 'bg-fiber-blue' : 'bg-gray-50'}`}
        >
          <Text className={`${sortOrder === 'reciente' ? 'text-white' : 'text-black'}`}>Reciente</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSortOrder('antiguo')}
          className={`flex-row items-center px-5 py-3 rounded-full border ${sortOrder === 'antiguo' ? 'bg-fiber-blue' : 'bg-gray-50'}`}
        >
          <Text className={`${sortOrder === 'antiguo' ? 'text-white' : 'text-black'}`}>Antiguo</Text>
        </TouchableOpacity>
      </View>

      {/* LISTADO */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-400 font-bold">Cargando historial...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {filteredHistory.length === 0 ? (
            <View className="flex-1 justify-center items-center py-16">
              <IconSymbol name="doc.text" size={48} color="#CBD5E1" />
              <Text className="text-gray-400 font-bold mt-4">No hay tickets que coincidan con los filtros</Text>
            </View>
          ) : (
            filteredHistory.map((item) => {
              const color = getEstadoColor(item.estado);
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => openDetail(item)}
                  activeOpacity={0.7}
                  className="bg-white rounded-3xl p-6 mb-4 shadow-sm border border-gray-100 flex-row items-center"
                >
                  <View className={`h-12 w-12 rounded-2xl items-center justify-center mr-4 ${color.bg}`}>
                    <IconSymbol
                      name={color.icon as any}
                      size={24}
                      color={color.color}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-fiber-dark font-black text-xl tracking-tight">#{item.numero_ticket}</Text>
                    <Text className="text-gray-400 text-xs font-bold uppercase">{item.motivo || item.estado}</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color="#CBD5E1" />
                </TouchableOpacity>
              );
            })
          )}
          <View className="h-20" />
        </ScrollView>
      )}

      {selectedTicket && (
        <View className="absolute inset-0 z-50">

          {/* FONDO OSCURO */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              setSelectedTicket(null);
              setIsEditing(false);
            }}
            className="absolute inset-0 bg-black/60"
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1 justify-end"
          >
            <View className="bg-white rounded-t-[40px] h-[92%] shadow-2xl overflow-hidden">

              {/* HEADER */}
              <View className="px-8 pt-6 pb-4 border-b border-gray-100 flex-row justify-between items-center">
                <View>
                  <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                    {isEditing ? 'EDITANDO TICKET' : 'DETALLE TICKET'}
                  </Text>
                  <Text className="text-fiber-blue text-3xl font-black tracking-tighter">
                    #{selectedTicket.numero_ticket}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    setSelectedTicket(null);
                    setIsEditing(false);
                  }}
                  className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                >
                  <IconSymbol name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* CONTENIDO */}
              <ScrollView
                className="flex-1 px-8 pt-6"
                contentContainerStyle={{ paddingBottom: 240 }}
                showsVerticalScrollIndicator={false}
              >

                {/* ESTADO */}
                <View className={`flex-row items-center px-4 py-3 rounded-2xl mb-6 ${estadoColor.bg}`}>
                  <IconSymbol name={estadoColor.icon as any} size={18} color={estadoColor.color} />
                  <Text className="ml-2 font-bold text-sm" style={{ color: estadoColor.color }}>
                    {selectedTicket.estado}
                  </Text>
                </View>

                {/* MOTIVO */}
                <Text className="text-gray-400 font-bold text-xs uppercase mb-3">
                  1. Motivo / Título *
                </Text>

                {isEditing ? (
                  <>
                    <View className="flex-row flex-wrap gap-2 mb-4">
                      {MOTIVOS_CON_OTROS.map((motivo) => (
                        <TouchableOpacity
                          key={motivo}
                          onPress={() => {
                            setEditMotivo(editMotivo === motivo ? '' : motivo);
                            if (motivo !== 'Otros') setEditCustomMotivo('');
                          }}
                          className={`px-3 py-2 rounded-lg border ${editMotivo === motivo
                            ? 'bg-fiber-blue border-fiber-blue'
                            : 'bg-white border-gray-200'
                            }`}
                        >
                          <Text
                            className={`font-bold text-md ${editMotivo === motivo ? 'text-white' : 'text-gray-600'
                              }`}
                          >
                            {motivo}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {editMotivo === 'Otros' && (
                      <View className="mb-8 p-4 bg-orange-50 rounded-2xl border-2 border-orange-200">
                        <Text className="text-fiber-blue font-black text-xs uppercase mb-3">
                          Añade un motivo
                        </Text>

                        <TextInput
                          value={editCustomMotivo}
                          onChangeText={setEditCustomMotivo}
                          placeholder="Especifica el motivo..."
                          placeholderTextColor="#aebdcfff"
                          className="bg-white rounded-2xl px-4 py-3 text-fiber-dark font-medium border-2 border-orange-200 text-base"
                        />
                      </View>
                    )}
                  </>
                ) : (
                  <Text className="text-fiber-dark text-2xl font-black mb-6">
                    {selectedTicket.motivo || 'Sin motivo'}
                  </Text>
                )}

                {/* DESCRIPCIÓN */}
                <Text className="text-gray-400 font-bold text-xs uppercase mb-3">
                  2. Descripción *
                </Text>

                {isEditing ? (
                  <TextInput
                    value={editDescripcion}
                    onChangeText={setEditDescripcion}
                    multiline
                    className="bg-gray-50 px-3 rounded-xl text-base font-medium text-black border border-gray-200 h-20 mb-6"
                    placeholder="Escribe la descripción..."
                    placeholderTextColor="#aebdcfff"
                  />
                ) : (
                  <View className="bg-gray-50 px-4 py-3 rb mb-6">
                    <Text className="text-black text-lg font-medium leading-6">
                      {selectedTicket.descripcion || 'Sin descripción'}
                    </Text>
                  </View>
                )}

                {/* IMÁGENES */}
                <Text className="text-gray-400 font-bold text-xs uppercase mb-3">
                  3. Evidencia visual
                </Text>
                {isEditing ? (
                  <>
                    {selectedTicket?.imagenes && selectedTicket.imagenes.length > 0 && (
                      <View className="mb-4">
                        <ImageGallery
                          images={selectedTicket.imagenes}
                          isLoading={false}
                          onDownloadImage={(imageId) => downloadImage(imageId)}
                        />
                      </View>
                    )}

                    <ImagePickerComponent
                      onImagesSelected={(imgs) => setEditNewImages(imgs.map(i => ({ uri: i.uri, name: i.name, size: i.size, type: i.type })))}
                      maxImages={5}
                      maxSizePerImage={5 * 1024 * 1024}
                    />
                  </>
                ) : selectedTicket.imagenes && selectedTicket.imagenes.length > 0 ? (
                  <View className="mb-8">
                    <ImageGallery
                      images={selectedTicket.imagenes}
                      isLoading={false}
                      onDownloadImage={(imageId) => downloadImage(imageId)}
                    />
                  </View>
                ) : (
                  <View className="border-2 border-dashed border-gray-200 rounded-3xl h-40 items-center justify-center bg-gray-50 mb-8">
                    <IconSymbol name="archivebox.fill" size={40} color="#CBD5E1" />
                    <Text className="text-gray-400 font-bold mt-2 uppercase text-xs">
                      Sin imágenes
                    </Text>
                  </View>
                )}

              </ScrollView>

              {/* FOOTER */}
              <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-6">
                {!isEditing ? (
                  <View className="gap-3">
                    <TouchableOpacity
                      onPress={() => setIsEditing(true)}
                      className="h-14 bg-fiber-blue rounded-2xl flex-row items-center justify-center"
                    >
                      <IconSymbol name="pencil" size={20} color="white" />
                      <Text className="text-white font-black ml-2 uppercase">
                        Editar Ticket
                      </Text>
                    </TouchableOpacity>

                    {(selectedTicket.estado === 'Cancelado' || selectedTicket.estado === 'Pendiente') && (
                      <TouchableOpacity
                        onPress={resumeTicket}
                        className="h-14 bg-green-500 rounded-2xl flex-row items-center justify-center"
                      >
                        <IconSymbol name="play.fill" size={20} color="white" />
                        <Text className="text-white font-black ml-2 uppercase">
                          Reanudar Ticket
                        </Text>
                      </TouchableOpacity>
                    )}

                    {selectedTicket.estado !== 'Terminado' && (
                      <TouchableOpacity
                        onPress={deleteTicket}
                        className="h-14 bg-red-600 rounded-2xl flex-row items-center justify-center"
                      >
                        <IconSymbol name="trash" size={20} color="white" />
                        <Text className="text-white font-black ml-2 uppercase">
                          Eliminar Ticket
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <View className="gap-3">
                    <TouchableOpacity
                      onPress={() => {
                        if (editMotivo && editDescripcion.trim()) {
                          saveChanges();
                        } else {
                          setShowBubble(true);
                          setTimeout(() => setShowBubble(false), 2500);
                        }
                      }}
                      className={`h-14 rounded-2xl flex-row items-center justify-center ${editMotivo && editDescripcion.trim() ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <IconSymbol name="checkmark.circle.fill" size={20} color={editMotivo && editDescripcion.trim() ? 'white' : '#6B7280'} />
                      <Text className={`font-black ml-2 uppercase ${editMotivo && editDescripcion.trim() ? 'text-white' : 'text-gray-500'}`}>
                        Guardar Cambios
                      </Text>
                    </TouchableOpacity>
                    {showBubble && (
                      <View className="absolute left-0 right-0 bottom-40 mx-6 px-4 py-3 bg-red-100 border border-red-300 rounded-2xl flex-row items-center justify-center z-50">
                        <IconSymbol name="exclamationmark.triangle.fill" size={18} color="#DC2626" />
                        <Text className="ml-2 text-red-700 font-bold text-sm">Debes rellenar todos los campos obligatorios</Text>
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={() => setIsEditing(false)}
                      className="h-14 bg-gray-200 rounded-2xl flex-row items-center justify-center"
                    >
                      <IconSymbol name="xmark.circle.fill" size={20} color="#6B7280" />
                      <Text className="text-gray-600 font-black ml-2 uppercase">
                        Cancelar
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

            </View>
          </KeyboardAvoidingView>
        </View>
      )}

      {/* Alerta personalizada */}
      {customAlertVisible && (
        <CustomAlert
          title={customAlertConfig.title}
          message={customAlertConfig.message}
          confirmText={customAlertConfig.confirmText}
          cancelText={customAlertConfig.cancelText}
          onConfirm={() => {
            customAlertConfig.onConfirm();
            setCustomAlertVisible(false);
          }}
          onCancel={() => setCustomAlertVisible(false)}
        />
      )}

      <ErrorAlert
        error={resumeTicketError}
        onDismiss={() => setResumeTicketError(null)}
      />
    </View>
  );
}