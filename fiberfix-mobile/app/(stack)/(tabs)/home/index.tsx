import { LocationInfo } from '@/components/LocationInfo';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ErrorAlert, useErrorHandler } from '@/components/ErrorAlert';
import { ImagePickerComponent } from '@/components/ImagePickerComponent';
import { useLocation } from '@/hooks/useLocation';
import { MOTIVOS_PREDEFINIDOS } from '@/types/motivo';
import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
} from 'react-native';
import TcpSocket from 'react-native-tcp-socket';
import Constants from 'expo-constants';

interface ImageAttachment {
  uri: string;
  name: string;
  size: number;
  type: string;
}

export default function TicketScreen() {
  const userId = 'TEC001';
  const [ticketNumber, setTicketNumber] = useState('');
  const [isWorking, setIsWorking] = useState(false);
  const [sending, setSending] = useState(false);

  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentReason, setIncidentReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [incidentNote, setIncidentNote] = useState('');
  const [selectedImages, setSelectedImages] = useState<ImageAttachment[]>([]);

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

  const SERVER_IP = Constants.expoConfig?.extra?.EXPO_PUBLIC_SERVER_IP || '192.168.1.146';
  const SERVER_PORT = Constants.expoConfig?.extra?.EXPO_PUBLIC_SERVER_PORT || 5000;

  const QUICK_REASONS = MOTIVOS_PREDEFINIDOS;

  useEffect(() => {
    if (error?.type === 'success') {
      const timer = setTimeout(() => dismissError(), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleStart = () => {
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
  };

  const handleFinish = async () => {
    if (!location) {
      showGpsError('No se puede obtener tu ubicación GPS. Por favor, verifica que el GPS esté habilitado.');
      return;
    }

    setSending(true);

    try {
      const message = `FINISH|${userId}|${ticketNumber}|${new Date().toISOString()}`;
      await sendViaSocket(message);

      showSuccess('¡Trabajo Completado!', 'El ticket se ha finalizado correctamente');
      setIsWorking(false);
      setTicketNumber('');
    } catch (err: any) {
      showServerError('No se pudo finalizar el ticket. ' + (err.message || 'Verifica la conexión al servidor.'));
    } finally {
      setSending(false);
    }
  };

  const openIncidentModal = () => {
    if (!location) {
      showGpsError('No se puede reportar una incidencia sin GPS. Por favor, espera a que tu ubicación esté disponible.');
      return;
    }

    setIncidentReason('');
    setCustomReason('');
    setIncidentNote('');
    setSelectedImages([]);
    setShowIncidentModal(true);
  };

  const submitIncident = async () => {
    if (!incidentReason && !incidentNote.trim()) {
      showValidationError('Por favor, selecciona un motivo o escribe una descripción de la incidencia.');
      return;
    }

    let finalReason = incidentReason;

    if (incidentReason === 'Otros') {
      if (!customReason.trim()) {
        showValidationError('Por favor, escribe un título para la incidencia personalizada.');
        return;
      }
      finalReason = customReason.trim();
    }

    setSending(true);

    try {
      const incidenciaMsg = `INCIDENT|${userId}|${ticketNumber}|${finalReason}|${incidentNote || 'Sin descripción'}`;
      await sendViaSocket(incidenciaMsg);

      showSuccess('¡Incidencia Registrada!', 'El reporte se ha enviado correctamente');
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
                className={`flex-row items-center px-4 py-2 rounded-2xl border ${
                  isOnline ? 'bg-green-500/20 border-green-400' : 'bg-red-500/20 border-red-400'
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
                <TextInput
                  className="text-7xl font-black text-center text-fiber-orange"
                  style={{ padding: 0, margin: 0, includeFontPadding: false }}
                  placeholder="000"
                  placeholderTextColor="#F1F5F9"
                  value={ticketNumber}
                  onChangeText={setTicketNumber}
                  keyboardType="numeric"
                  editable={!isWorking}
                  maxLength={6}
                />
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
                  className={`flex-row items-center px-6 py-3 rounded-2xl ${
                    error.type === 'error'
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
                    className={`font-bold text-sm ml-2 ${
                      error.type === 'error' ? 'text-red-700' : error.type === 'warning' ? 'text-yellow-700' : 'text-blue-700'
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
                className={`flex-1 h-20 rounded-[25px] flex-row items-center justify-center border-b-4 ${
                  !isWorking && ticketNumber ? 'bg-fiber-orange border-orange-900' : 'bg-gray-200 border-gray-300'
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
                className={`flex-1 h-20 rounded-[25px] flex-row items-center justify-center border-b-4 ${
                  isWorking && !sending ? 'bg-fiber-blue border-blue-900' : 'bg-gray-200 border-gray-300'
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
                  <IconSymbol name="xmark" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={{ paddingBottom: 140, paddingTop: 20 }}
                showsVerticalScrollIndicator={false}
              >
                <Text className="text-fiber-blue font-black text-sm uppercase mb-3">
                  1. Motivo Principal
                </Text>
                <View className="flex-row flex-wrap gap-2 mb-8">
                  {QUICK_REASONS.map((reason) => (
                    <TouchableOpacity
                      key={reason}
                      onPress={() => {
                        setIncidentReason(reason === incidentReason ? '' : reason);
                        if (reason !== 'Otros') {
                          setCustomReason('');
                        }
                      }}
                      activeOpacity={0.7}
                      className={`px-4 py-3 rounded-xl border ${
                        incidentReason === reason ? 'bg-red-500 border-red-500 shadow-md' : 'bg-white border-gray-200'
                      }`}
                    >
                      <Text className={`font-bold text-xs uppercase ${incidentReason === reason ? 'text-white' : 'text-gray-500'}`}>
                        {reason}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  <TouchableOpacity
                    key="Otros"
                    onPress={() => {
                      setIncidentReason(incidentReason === 'Otros' ? '' : 'Otros');
                      if (incidentReason !== 'Otros') {
                        setCustomReason('');
                      }
                    }}
                    activeOpacity={0.7}
                    className={`px-4 py-3 rounded-xl border ${
                      incidentReason === 'Otros' ? 'bg-purple-500 border-purple-500 shadow-md' : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text className={`font-bold text-xs uppercase ${incidentReason === 'Otros' ? 'text-white' : 'text-gray-500'}`}>
                      Otros
                    </Text>
                  </TouchableOpacity>
                </View>

                {incidentReason === 'Otros' && (
                  <View className="mb-8 p-4 bg-purple-50 rounded-2xl border-2 border-purple-200">
                    <Text className="text-fiber-blue font-black text-xs uppercase mb-3">
                      Título Personalizado
                    </Text>
                    <TextInput
                      className="bg-white rounded-2xl px-4 py-3 text-fiber-dark font-medium border-2 border-purple-200 text-base"
                      placeholder="Describe el tipo de incidencia..."
                      placeholderTextColor="#CBD5E1"
                      value={customReason}
                      onChangeText={setCustomReason}
                    />
                  </View>
                )}

                <Text className="text-fiber-blue font-black text-sm uppercase mb-3">
                  2. Descripción Detallada
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
                  onPress={submitIncident}
                  disabled={(!incidentReason && !incidentNote) || sending}
                  className={`h-20 rounded-[25px] flex-row items-center justify-center border-b-4 ${
                    (incidentReason || incidentNote) && !sending ? 'bg-red-600 border-red-800' : 'bg-gray-200 border-gray-300'
                  }`}
                >
                  {sending ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className={`font-black text-xl uppercase tracking-tighter ${(incidentReason || incidentNote) ? 'text-white' : 'text-gray-400'}`}>
                      Registrar Incidencia
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}

      <ErrorAlert error={error} onDismiss={dismissError} />
    </View>
  );
}
