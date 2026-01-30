import { ErrorAlert, ErrorMessage, useErrorHandler } from '@/components/ErrorAlert';
import { ImagePickerComponent } from '@/components/ImagePickerComponent';
import { LocationInfo } from '@/components/LocationInfo';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useUser } from '@/context/UserContext';
import { useLocation } from '@/hooks/useLocation';
import { MOTIVOS_PREDEFINIDOS } from '@/types/motivo';
import * as FileSystem from 'expo-file-system/legacy';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import TcpSocket from 'react-native-tcp-socket';

interface ImageAttachment {
  uri: string;
  name: string;
  size: number;
  type: string;
}

export default function TicketScreen() {
  const [showSuccessBubble, setShowSuccessBubble] = useState<{ message: string } | null>(null);
  const [showIncidentBubble, setShowIncidentBubble] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userId } = useUser();
  const [ticketNumber, setTicketNumber] = useState('');
  const [isWorking, setIsWorking] = useState(false);
  const [sending, setSending] = useState(false);

  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentReason, setIncidentReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [incidentNote, setIncidentNote] = useState('');
  const [selectedImages, setSelectedImages] = useState<ImageAttachment[]>([]);
  const [existingTicketError, setExistingTicketError] = useState<ErrorMessage | null>(null);
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Pendiente' | 'En Proceso' | 'Terminado' | 'Cancelado'>('Todos');

  const {
    error,
    dismissError,
    showGpsError,
    showValidationError,
    showSuccess,
    showServerError,
  } = useErrorHandler();

  const { location } = useLocation();
  const isOnline = !!location;

  const SERVER_IP = process.env.EXPO_PUBLIC_SERVER_IP;
  const SERVER_PORT = Number(process.env.EXPO_PUBLIC_SERVER_PORT);

  const QUICK_REASONS = MOTIVOS_PREDEFINIDOS;

  useEffect(() => {
    if (error?.type === 'success') {
      const timer = setTimeout(() => dismissError(), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Detectar si se está reanudando un ticket desde el historial
  useEffect(() => {
    if (params.resumeTicket) {
      setTicketNumber(params.resumeTicket as string);
      setIsWorking(true);
      // Limpiar el parámetro
      router.setParams({ resumeTicket: undefined });
    }
  }, [params.resumeTicket]);

  function handleStart() {
    if (!ticketNumber.trim()) {
      showValidationError('Por favor, introduce un número de ticket válido');
      return;
    }

    if (!location) {
      showGpsError('Tu ubicación GPS no está disponible aún. Por favor, espera a que el GPS se estabilice.');
      return;
    }

    setIsWorking(true);
    dismissError();
    Keyboard.dismiss();

    // Enviar mensaje START al servidor para crear el ticket
    setSending(true);
    const message = `START|${userId}|${ticketNumber}|${location?.coords.latitude}|${location?.coords.longitude}|${formatDate(new Date())}`;

    function formatDate(date: Date): string {
      return date.toISOString();
    }

    sendViaSocketWithResponse(message)
      .then((response) => {
        if (response === 'START_OK') {
          setShowSuccessBubble({ message: '¡Ticket creado correctamente!' });
          setTimeout(() => setShowSuccessBubble(null), 2500);
        } else if (response === 'START_OK_EXISTENTE') {
          setExistingTicketError({
            type: 'info',
            title: 'Ticket existente',
            message: 'El ticket ya existe. ¿Deseas ir a los detalles o cancelar?',
            action: {
              label: 'Ir a detalles',
              onPress: () => {
                setExistingTicketError(null);
                // Navegar al historial con el parámetro del ticket para que se abra automáticamente
                router.push({
                  pathname: '/historial/explore',
                  params: { openTicket: ticketNumber }
                });
              },
            },
          });
        } else if (response === 'START_ERROR_FINALIZADO') {
          setExistingTicketError({
            type: 'info',
            title: 'Ticket ya finalizado',
            message: 'El ticket ya ha sido finalizado. ¿Deseas ir a los detalles o cancelar?',
            action: {
              label: 'Ir a detalles',
              onPress: () => {
                setExistingTicketError(null);
                // Navegar al historial con el parámetro del ticket para que se abra automáticamente
                router.push({
                  pathname: '/historial/explore',
                  params: { openTicket: ticketNumber }
                });
              },
            },
          });
        } else {
          setIsWorking(false);
          showServerError('No se pudo crear el ticket. Respuesta inesperada del servidor.');
        }
      })
      .catch((err: any) => {
        setIsWorking(false);
        showServerError('No se pudo crear el ticket. ' + (err.message || 'Verifica la conexión al servidor.'));
      })
      .finally(() => {
        setSending(false);
      });
  }

  // Enviar mensaje y obtener la respuesta textual del servidor
  function sendViaSocketWithResponse(message: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!TcpSocket) {
        reject(new Error('Socket TCP no disponible'));
        return;
      }

      try {
        const cliente = TcpSocket.createConnection(
          { host: SERVER_IP, port: SERVER_PORT },
          () => {
            cliente.write(message + '\n');
          }
        );

        let responseReceived = false;

        const timeout = setTimeout(() => {
          if (!responseReceived) {
            cliente.end();
            reject(new Error('Timeout de conexión al servidor'));
          }
        }, 10000);

        cliente.on('data', (data) => {
          clearTimeout(timeout);
          responseReceived = true;

          const response = data.toString().trim();
          cliente.end();
          resolve(response);
        });

        cliente.on('error', (err) => {
          clearTimeout(timeout);
          cliente.end();
          reject(new Error('Error de conexión: ' + (err as any).message));
        });
      } catch (err) {
        reject(new Error('No se pudo conectar: ' + (err as any).message));
      }
    });
  }

  const handleFinish = async () => {
    if (!location) {
      showGpsError('No se puede obtener tu ubicación GPS. Por favor, verifica que el GPS esté habilitado.');
      return;
    }

    setSending(true);

    try {
      const message = `FINISH|${userId}|${ticketNumber}|${new Date().toISOString()}`;
      await sendViaSocket(message);

      setShowSuccessBubble({ message: '¡Ticket finalizado correctamente!' });
      setTimeout(() => setShowSuccessBubble(null), 2500);
      setIsWorking(false);
      setTicketNumber('');
    } catch (err: any) {
      showServerError('No se pudo finalizar el ticket. ' + (err.message || 'Verifica la conexión al servidor.'));
    } finally {
      setSending(false);
    }
  };
  {/* ...existing code... */ }

  const openIncidentModal = () => {
    if (!location) {
      showGpsError('No se puede reportar una incidencia sin GPS. Por favor, espera a que tu ubicación esté disponible.');
      return;
    }

    setIncidentReason('Inaccesible'); // Motivo por defecto
    setCustomReason('');
    setIncidentNote('');
    setSelectedImages([]);
    setShowIncidentModal(true);
  };

  const submitIncident = async () => {
    if (!incidentReason || !incidentNote.trim()) {
      setShowIncidentBubble(true);
      setTimeout(() => setShowIncidentBubble(false), 2500);
      return;
    }

    let finalReason = incidentReason; // Use the selected chip as the main reason

    if (incidentReason === 'Otros') {
      if (!customReason.trim()) {
        showValidationError('Por favor, escribe un título para la incidencia personalizada.');
        return;
      }
      finalReason = customReason.trim();
    }

    setSending(true);

    try {
      // Si hay imágenes, usar el nuevo protocolo INCIDENT_WITH_IMAGES
      if (selectedImages.length > 0) {
        await sendIncidentWithImages(finalReason, incidentNote);
      } else {
        // Si no hay imágenes, usar el protocolo antiguo
        const incidenciaMsg = `INCIDENT|${userId}|${ticketNumber}|${finalReason}|${incidentNote || 'Sin descripción'}`;
        await sendViaSocket(incidenciaMsg);
      }

      showSuccess('¡Incidencia Registrada!', 'El reporte se ha enviado correctamente con ' + selectedImages.length + (selectedImages.length === 1 ? ' imagen' : ' imágenes'));
      setShowIncidentModal(false);
      setIsWorking(false);
      setTicketNumber('');
      setIncidentReason('');
      setCustomReason('');
      setIncidentNote('');
      setSelectedImages([]);
    } catch (err: any) {
      showServerError('Error al registrar la incidencia. ' + (err.message || 'Intenta de nuevo.'));
    } finally {
      setSending(false);
    }
  };

  /**
   * Envía una incidencia con imágenes usando el protocolo INCIDENT_WITH_IMAGES
   * Protocolo: INCIDENT_WITH_IMAGES|usuario|numeroTicket|motivo|descripcion|numImágenes
   * Seguido de datos binarios de imágenes
   */
  const sendIncidentWithImages = async (motivo: string, descripcion: string): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      if (!TcpSocket) {
        reject(new Error('Socket TCP no disponible'));
        return;
      }

      try {
        // Convertir imágenes a datos base64 usando expo-file-system
        const imagenData: { uri: string; base64: string; name: string; type: string; size: number }[] = [];

        for (const image of selectedImages) {
          try {
            const uri = image.uri;
            // Leer archivo local directamente como base64 (maneja file:// y content://)
            // Algunos paquetes de `expo-file-system` no exponen `EncodingType` en los tipos,
            // así que llamamos con un cast a `any` y usamos la cadena 'base64' en tiempo de ejecución.
            const base64String = await (FileSystem as any).readAsStringAsync(uri, { encoding: 'base64' });

            imagenData.push({
              uri,
              base64: base64String,
              name: image.name,
              type: image.type,
              size: image.size,
            });
          } catch (error) {
            console.error('Error procesando imagen:', error);
            throw new Error('No se pudo procesar la imagen ' + image.name);
          }
        }

        // Conectar y enviar
        let sentAll = false;
        const cliente = TcpSocket.createConnection(
          { host: SERVER_IP, port: SERVER_PORT },
          async () => {
            try {
              // Sanitizar texto para evitar romper el protocolo (pipes o saltos de línea)
              const safeMotivo = motivo.replace(/\|/g, ' ').replace(/\r?\n/g, ' ');
              const safeDescripcion = descripcion.replace(/\|/g, ' ').replace(/\r?\n/g, ' ');

              // Helper para escribir en socket usando siempre el callback
              const writeAsync = (data: string, timeoutMs = 10000) => new Promise<void>((res, rej) => {
                let finished = false;
                const timer = setTimeout(() => {
                  if (!finished) {
                    finished = true;
                    rej(new Error('Timeout al escribir en socket'));
                  }
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

              // Construir un solo payload que contenga header, metadatos y Base64
              // Esto evita fragmentación por múltiples writes y asegura que el servidor reciba todo de una vez.
              let payload = '';
              payload += `INCIDENT_WITH_IMAGES|${userId}|${ticketNumber}|${safeMotivo}|${safeDescripcion}|${imagenData.length}\n`;

              for (const img of imagenData) {
                // Dependiendo de lo que el servidor espere, dejamos una línea vacía entre metadatos y base64
                payload += `${img.name}|${img.type}|${img.size}\n`;
                payload += `${img.base64}\n`;
              }
              // Depuración removida: payload preparado

              // Enviar todo el payload en una sola escritura (dar más tiempo para grandes transferencias)
              await writeAsync(payload, 120000);
              // Marcar que todo fue enviado para empezar a procesar la respuesta del servidor
              sentAll = true;
            } catch (error) {
              cliente.end();
              reject(error);
            }
          }
        );

        // Debug: monitorizar cierre/fin del socket
        cliente.on('close', (hadError?: boolean) => {
          // socket closed
        });

        let responseReceived = false;

        const timeout = setTimeout(() => {
          if (!responseReceived) {
            cliente.end();
            reject(new Error('Timeout de conexión al servidor'));
          }
        }, 30000); // 30 segundos de timeout para transferencia de imágenes

        cliente.on('data', (data) => {
          // Ignorar respuestas hasta que hayamos enviado todo el payload
          if (!sentAll) return;

          clearTimeout(timeout);
          responseReceived = true;

          const response = data.toString().trim();

          if (response === 'INCIDENT_WITH_IMAGES_OK') {
            cliente.end();
            resolve();
          } else {
            cliente.end();
            reject(new Error('Error del servidor: ' + response));
          }
        });

        cliente.on('error', (err) => {
          clearTimeout(timeout);
          cliente.end();
          reject(new Error('Error de conexión: ' + (err as any).message));
        });
      } catch (err) {
        reject(new Error('No se pudo conectar: ' + (err as any).message));
      }
    });
  };

  const sendViaSocket = (message: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!TcpSocket) {
        reject(new Error('Socket TCP no disponible'));
        return;
      }

      try {
        const cliente = TcpSocket.createConnection(
          { host: SERVER_IP, port: SERVER_PORT },
          () => {
            cliente.write(message + '\n');
          }
        );

        let responseReceived = false;

        const timeout = setTimeout(() => {
          if (!responseReceived) {
            cliente.end();
            reject(new Error('Timeout de conexión al servidor'));
          }
        }, 10000);

        cliente.on('data', (data) => {
          clearTimeout(timeout);
          responseReceived = true;

          const response = data.toString().trim();

          if (
            response === 'INCIDENT_OK' ||
            response === 'FINISH_OK' ||
            response === 'START_OK'
          ) {
            cliente.end();
            resolve();
          } else {
            cliente.end();
            reject(new Error('Respuesta inesperada del servidor'));
          }
        });

        cliente.on('error', (err) => {
          clearTimeout(timeout);
          cliente.end();
          reject(new Error('Error de conexión: ' + (err as any).message));
        });
      } catch (err) {
        reject(new Error('No se pudo conectar: ' + (err as any).message));
      }
    });
  };

  const [ticketInputFocused, setTicketInputFocused] = useState(false);

  return (
    <View className="flex-1 bg-white relative">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
          <View className="absolute inset-0 opacity-5">
            {[...Array(100)].map((_, i) => (
              <View key={i} className="w-20 h-20 border border-gray-400" />
            ))}
          </View>

          <View className="bg-fiber-blue pt-12 pb-8 px-6 rounded-b-[40px] shadow-lg z-10">
            <View className="flex-row justify-between items-start">
              <View>
                <Text className="text-white text-4xl font-black tracking-tighter leading-tight">
                  FIBER<Text className="text-fiber-orange">FIX</Text>
                </Text>
                <Text className="text-white/50 text-xs font-bold tracking-[0.3em] uppercase mt-1">
                  Operations Control
                </Text>
              </View>

              <View
                className={`flex-row items-center px-4 py-2 rounded-2xl border ${isOnline ? 'bg-green-500/20 border-green-400' : 'bg-red-500/20 border-red-400'
                  }`}
              >
                <View className={`w-2.5 h-2.5 rounded-full mr-2 ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
                <Text className={`font-black text-[10px] tracking-widest ${isOnline ? 'text-green-200' : 'text-red-200'}`}>
                  {isOnline ? 'ONLINE' : 'SIN GPS'}
                </Text>
              </View>
            </View>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1 justify-center px-6"
            style={{ marginTop: -20 }}
          >
            <View className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-2xl">
              <View className="items-center mb-6">
                <View className={`p-5 rounded-3xl ${isWorking ? 'bg-green-50' : 'bg-orange-50'}`}>
                  <IconSymbol name="doc.text.fill" size={42} color={isWorking ? '#22C55E' : '#FF6D00'} />
                </View>
              </View>

              <View className="mb-8">
                <Text className="text-fiber-blue font-black text-center text-xs uppercase tracking-[0.3em] mb-4">
                  Nº Ticket Trabajo
                </Text>
                <View style={{ height: 64, justifyContent: 'center', position: 'relative' }}>
                  <TextInput
                    className="text-7xl font-black text-center text-fiber-orange"
                    style={{ padding: 0, margin: 0, includeFontPadding: false, minHeight: 64, textAlignVertical: 'center' }}
                    value={ticketNumber}
                    onChangeText={setTicketNumber}
                    keyboardType="numeric"
                    editable={!isWorking}
                    maxLength={6}
                    onFocus={() => setTicketInputFocused(true)}
                    onBlur={() => setTicketInputFocused(false)}
                  />
                  {(!ticketNumber && !ticketInputFocused) && (
                    <Text
                      className="text-7xl font-black text-center text-fiber-orange"
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        color: '#F1F5F9',
                        pointerEvents: 'none',
                        minHeight: 64,
                        textAlignVertical: 'center',
                        top: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      000
                    </Text>
                  )}
                </View>
                <View className="h-1.5 w-24 bg-fiber-orange/20 rounded-full self-center mt-3" />
              </View>

              <View className="flex-row items-center justify-center bg-gray-50 py-3 px-6 rounded-2xl border border-gray-100 mb-4">
                <IconSymbol
                  name={isOnline ? 'mappin.and.ellipse' : 'location.slash.fill'}
                  size={20}
                  color={isOnline ? '#002F6C' : '#DC2626'}
                />
                <View className="ml-3 flex-1">
                  <Text className="text-fiber-blue font-black text-[10px] uppercase tracking-widest">
                    {isOnline ? 'GPS ACTIVO' : 'BUSCANDO SATÉLITES...'}
                  </Text>
                  {location && <LocationInfo location={location} />}
                </View>
              </View>
            </View>

            <View className="h-16 justify-center items-center mt-4">
              {error && error.type !== 'success' && (
                <View
                  className={`flex-row items-center px-6 py-3 rounded-2xl ${error.type === 'error'
                    ? 'bg-red-100'
                    : error.type === 'warning'
                      ? 'bg-yellow-100'
                      : 'bg-blue-100'
                    }`}
                >
                  <IconSymbol
                    name={
                      error.type === 'error'
                        ? 'exclamationmark.triangle.fill'
                        : error.type === 'warning'
                          ? 'exclamationmark.circle.fill'
                          : 'info.circle.fill'
                    }
                    size={20}
                    color={error.type === 'error' ? '#DC2626' : error.type === 'warning' ? '#D97706' : '#3B82F6'}
                  />
                  <Text
                    className={`font-bold text-sm ml-2 ${error.type === 'error' ? 'text-red-700' : error.type === 'warning' ? 'text-yellow-700' : 'text-blue-700'
                      }`}
                  >
                    {error.title}
                  </Text>
                </View>
              )}

              {sending && (
                <View className="flex-row items-center gap-3">
                  <ActivityIndicator size="large" color="#002F6C" />
                  <Text className="text-fiber-blue font-bold">Enviando...</Text>
                </View>
              )}
            </View>
          </KeyboardAvoidingView>

          <View className="px-6 pb-8">
            <View className="flex-row gap-4 mb-4">
              <TouchableOpacity
                onPress={handleStart}
                disabled={isWorking || !ticketNumber}
                className={`flex-1 h-20 rounded-[25px] flex-row items-center justify-center border-b-4 ${!isWorking && ticketNumber ? 'bg-fiber-orange border-orange-900' : 'bg-gray-200 border-gray-300'
                  }`}
              >
                <IconSymbol name="play.fill" size={24} color={!isWorking && ticketNumber ? 'white' : '#94A3B8'} />
                <Text className={`font-black text-lg ml-2 ${!isWorking && ticketNumber ? 'text-white' : 'text-gray-400'}`}>
                  Empezar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleFinish}
                disabled={!isWorking || sending}
                className={`flex-1 h-20 rounded-[25px] flex-row items-center justify-center border-b-4 ${isWorking && !sending ? 'bg-fiber-blue border-blue-900' : 'bg-gray-200 border-gray-300'
                  }`}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <IconSymbol name="stop.fill" size={24} color={isWorking ? 'white' : '#94A3B8'} />
                    <Text className={`font-black text-lg ml-2 ${isWorking ? 'text-white' : 'text-gray-400'}`}>
                      Finalizar
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {isWorking && (
              <TouchableOpacity
                onPress={openIncidentModal}
                activeOpacity={0.8}
                className="h-14 rounded-2xl flex-row items-center justify-center border border-red-200 bg-red-50 active:bg-red-100 shadow-md"
              >
                <IconSymbol name="exclamationmark.triangle.fill" size={20} color="#DC2626" />
                <Text className="text-red-600 font-black uppercase text-xs tracking-widest ml-2">
                  Reportar Incidencia
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>

      {showIncidentModal && (
        <View className="absolute inset-0 z-50">
          {showIncidentBubble && (
            <View className="absolute left-0 right-0 bottom-32 mx-6 px-4 py-3 bg-red-100 border border-red-300 rounded-2xl flex-row items-center justify-center z-50">
              <IconSymbol name="exclamationmark.triangle.fill" size={18} color="#DC2626" />
              <Text className="ml-2 text-red-700 font-bold text-sm">Debes rellenar todos los campos obligatorios</Text>
            </View>
          )}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowIncidentModal(false)}
            className="absolute inset-0 bg-black/60"
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1 justify-end"
          >
            <View className="bg-white rounded-t-[40px] h-[92%] shadow-2xl overflow-hidden flex flex-col">
              <View className="px-6 pt-6 pb-4 border-b border-gray-100 bg-white z-10 flex-row justify-between items-center">
                <View>
                  <Text className="text-fiber-blue text-3xl font-black tracking-tighter">
                    INCIDENCIA
                  </Text>
                  <Text className="text-red-500 text-sm font-bold uppercase tracking-widest">
                    Ticket #{ticketNumber || '---'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowIncidentModal(false)}
                  className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                >
                  <IconSymbol name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={{ paddingBottom: 140, paddingTop: 20 }}
                showsVerticalScrollIndicator={false}
              >
                <Text className="text-fiber-blue font-black text-sm uppercase mb-3">
                  1. Motivo Principal *
                </Text>
                <View className="flex-row flex-wrap gap-2 mb-8">
                  {(['Inaccesible', 'Perro suelto', 'Sin repuestos', 'Factores ambientales', 'Otros'] as const).map((status) => (
                    <TouchableOpacity
                      key={status}
                      onPress={() => setIncidentReason(status)}
                      className={`px-6 py-3 rounded-full mr-3 border ${incidentReason === status ? 'bg-fiber-blue border-fiber-blue' : 'bg-white border-gray-200'}`}
                    >
                      <Text className={`text-sm font-bold ${incidentReason === status ? 'text-white' : 'text-black'}`}>{status}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {incidentReason === 'Otros' && (
                  <View className="mb-8 p-4 bg-orange-50 rounded-2xl border-2 border-orange-200">
                    <Text className="text-fiber-blue font-black text-xs uppercase mb-3">
                      Título Personalizado
                    </Text>
                    <TextInput
                      className="bg-white rounded-2xl px-4 py-3 text-fiber-dark font-medium border-2 border-orange-200 text-base"
                      placeholder="Describe el tipo de incidencia..."
                      placeholderTextColor="#CBD5E1"
                      value={customReason}
                      onChangeText={setCustomReason}
                    />
                  </View>
                )}

                <Text className="text-fiber-blue font-black text-sm uppercase mb-3">
                  2. Descripción Detallada *
                </Text>
                <TextInput
                  className="bg-gray-50 rounded-3xl p-6 text-fiber-dark h-40 mb-8 font-medium text-lg border-2 border-gray-100"
                  placeholder="Escribe aquí los detalles del problema..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  value={incidentNote}
                  onChangeText={setIncidentNote}
                  textAlignVertical="top"
                />

                <Text className="text-fiber-blue font-black text-sm uppercase mb-3">
                  3. Evidencia Visual (Opcional)
                </Text>
                <ImagePickerComponent
                  onImagesSelected={setSelectedImages}
                  maxImages={5}
                  maxSizePerImage={5 * 1024 * 1024}
                />
              </ScrollView>

              <View className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100">
                <TouchableOpacity
                  onPress={() => {
                    if (sending) return;
                    if (!incidentReason || !incidentNote.trim() || (incidentReason === 'Otros' && !customReason.trim())) {
                      setShowIncidentBubble(true);
                      setTimeout(() => setShowIncidentBubble(false), 2500);
                      return;
                    }
                    submitIncident();
                  }}
                  className={`h-20 rounded-[25px] flex-row items-center justify-center border-b-4 ${incidentReason && incidentNote.trim() && (!sending) && (incidentReason !== 'Otros' || customReason.trim()) ? 'bg-red-600 border-red-800' : 'bg-gray-200 border-gray-300'}`}
                >
                  {sending ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className={`font-black text-xl uppercase tracking-tighter ${incidentReason && incidentNote.trim() && !sending ? 'text-white' : 'text-gray-400'}`}>
                      Registrar Incidencia
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}

      {/* ALERTA DE ÉXITO GLOBAL - SIEMPRE AL FINAL PARA ESTAR SOBRE TODO */}
      {showSuccessBubble && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom:
              showSuccessBubble.message === '¡Ticket creado correctamente!'
                ? 210
                : 160,
            zIndex: 9999,
            elevation: 50,
            alignItems: 'center',
          }}
          pointerEvents="box-none"
        >
          <View
            className="px-4 py-3 bg-green-100 border border-green-300 rounded-2xl flex-row items-center justify-center"
            style={{ maxWidth: 340, minWidth: 200, width: 'auto', alignSelf: 'center', shadowColor: '#22C55E', shadowOpacity: 0.12, shadowRadius: 8 }}
          >
            <IconSymbol name="checkmark.circle.fill" size={18} color="#22C55E" />
            <Text className="ml-2 text-green-700 font-bold text-sm text-center">{showSuccessBubble.message}</Text>
          </View>
        </View>
      )}

      <ErrorAlert
        error={existingTicketError}
        onDismiss={() => {
          setExistingTicketError(null);
          setTicketNumber('');
          setIsWorking(false);
        }}
      />
    </View>
  );
}