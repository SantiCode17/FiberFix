import { LocationInfo } from '@/components/LocationInfo';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useLocation } from '@/hooks/useLocation';
import { MOTIVOS_PREDEFINIDOS } from '@/types/motivo';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import TcpSocket from 'react-native-tcp-socket';

export default function TicketScreen() {

  //const { userId } = useUser();
  const userId = 'TEC001'; // 
  
  const [ticketNumber, setTicketNumber] = useState('');
  const [isWorking, setIsWorking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);
  
  // --- ESTADOS PARA MODAL INCIDENCIA ---
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentReason, setIncidentReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [incidentNote, setIncidentNote] = useState('');
  const [attachedImage, setAttachedImage] = useState<boolean>(false);

  const { location } = useLocation();
  const isOnline = !!location; 

  // Usar los motivos predefinidos del tipo
  const QUICK_REASONS = MOTIVOS_PREDEFINIDOS;

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const handleStart = () => {
    if (ticketNumber.trim()) {
      setIsWorking(true);
      setStatusMessage(null);
      Keyboard.dismiss();
    }
  };

  const openIncidentModal = () => {
    setIncidentReason(''); 
    setCustomReason('');
    setIncidentNote('');
    setAttachedImage(false);
    setShowIncidentModal(true);
  };

  const toggleAttachment = () => {
    setAttachedImage(!attachedImage);
  };

  const submitIncident = () => {
    if (!incidentReason && !incidentNote.trim()) {
      Alert.alert("Faltan datos", "Selecciona un motivo o escribe una descripción.");
      return;
    }
    
    let finalReason = incidentReason;
    
    // Si el motivo es "Otros" y hay un título personalizado, usarlo
    if (incidentReason === 'Otros' && customReason.trim()) {
      finalReason = customReason.trim();
    } else if (incidentReason === 'Otros' && !customReason.trim()) {
      Alert.alert("Falta información", "Por favor, escribe un título para la incidencia personalizada.");
      return;
    }

    // Enviar incidencia al servidor
    const incidenciaMsg = `INCIDENT|${userId}|${ticketNumber}|${finalReason}|${incidentNote || 'Sin descripción adicional'}`;
    sendIncidentBySocket(incidenciaMsg);
  };

  const sendIncidentBySocket = (message: string) => {
    const SERVER_IP = '192.168.1.146'; 
    const SERVER_PORT = 5000;

    if (!TcpSocket) return;

    try {
      const cliente = TcpSocket.createConnection({ host: SERVER_IP, port: SERVER_PORT }, () => {
        cliente.write(message + '\n');
      });
      cliente.on('data', (data) => {
        const response = data.toString().trim();
        if (response === 'INCIDENT_OK') {
          setStatusMessage({ text: "INCIDENCIA REGISTRADA", type: 'warning' });
          setShowIncidentModal(false);
          setIsWorking(false);
          setTicketNumber('');
          setIncidentReason('');
          setCustomReason('');
          setIncidentNote('');
          setAttachedImage(false);
        } else {
          setStatusMessage({ text: "ERROR AL REGISTRAR INCIDENCIA", type: 'error' });
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

  const handleFinish = () => {
    const parte = buildWorkReport();
    if (!parte) {
      setStatusMessage({ text: "ERROR: GPS NO DISPONIBLE", type: 'error' });
      return;
    }
    sendBySocket(parte);
  };

  const sendBySocket = (message: string) => {
    const SERVER_IP = '192.168.1.146'; 
    const SERVER_PORT = 5000;

    if (!TcpSocket) return;

    try {
      const cliente = TcpSocket.createConnection({ host: SERVER_IP, port: SERVER_PORT }, () => {
        cliente.write(message + '\n');
      });
      cliente.on('data', () => {
        setStatusMessage({ text: "TRABAJO FINALIZADO", type: 'success' });
        setIsWorking(false);
        setTicketNumber('');
        cliente.end();
      });
      cliente.on('error', () => { setStatusMessage({ text: "ERROR DE ENVÍO", type: 'error' }); });
    } catch (error) { setStatusMessage({ text: "ERROR DE CONEXIÓN", type: 'error' }); }
  };

  const buildWorkReport = () => {
    if (!location) {
      return null;
    }
    const lat = location.coords.latitude || 0;
    const lon = location.coords.longitude || 0;
    if (lat === 0 && lon === 0) return null;
    return `TEC001|${ticketNumber}|${lat}|${lon}|${new Date().toISOString()}`;
  }

  return (
    <View className="flex-1 bg-white relative"> 
      {/* "relative" es importante para que el overlay funcione */}
      
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
          {/* Fondo Técnico */}
          <View className="absolute inset-0 flex-row flex-wrap opacity-5">
            {[...Array(100)].map((_, i) => <View key={i} className="w-20 h-20 border border-gray-400" />)}
          </View>

          {/* CABECERA */}
          <View className="bg-fiber-blue pt-16 pb-12 px-8 rounded-b-[40px] shadow-lg z-0">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-white text-4xl font-black tracking-tighter">FIBER<Text className="text-fiber-orange">FIX</Text></Text>
                <Text className="text-white/40 text-[10px] font-bold tracking-[0.4em] uppercase">Operations Control</Text>
              </View>
              <View className={`flex-row items-center px-4 py-2 rounded-2xl border ${isOnline ? 'bg-status-success/10 border-status-success' : 'bg-red-500/20 border-red-500'}`}>
                <View className={`w-2.5 h-2.5 rounded-full mr-2 ${isOnline ? 'bg-status-success' : 'bg-red-500'}`} />
                <Text className={`font-black text-[10px] tracking-widest ${isOnline ? 'text-status-success' : 'text-red-300'}`}>
                  {isOnline ? 'ONLINE' : 'SIN GPS'}
                </Text>
              </View>
            </View>
          </View>

          {/* CUERPO TICKET */}
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 justify-center px-8" style={{ marginTop: -20 }}>
            <View className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-2xl">
              <View className="items-center mb-6">
                <View className={`p-5 rounded-3xl ${isWorking ? 'bg-green-50' : 'bg-orange-50'}`}>
                  <IconSymbol name="doc.text.fill" size={42} color={isWorking ? '#22C55E' : '#FF6D00'} />
                </View>
              </View>
              <View className="mb-6 w-full">
                <Text className="text-fiber-blue font-black text-center text-xs uppercase tracking-[0.3em] mb-4">Nº Ticket Trabajo</Text>
                <TextInput
                  className={`text-7xl font-black ${isWorking ? 'text-fiber-blue' : 'text-fiber-orange'}`}
                  style={{ textAlign: 'center', padding: 0, margin: 0, includeFontPadding: false }}
                  placeholder="000"
                  placeholderTextColor="#F1F5F9"
                  value={ticketNumber}
                  onChangeText={setTicketNumber}
                  keyboardType="numeric"
                  editable={!isWorking}
                  maxLength={6}
                />
                <View className="h-1.5 w-24 bg-fiber-orange/20 rounded-full self-center mt-2" />
              </View>
              <View className="flex-row items-center justify-center bg-gray-50 py-3 px-6 rounded-2xl border border-gray-100">
                <IconSymbol name="mappin.and.ellipse" size={20} color="#002F6C" />
                <View className="ml-3">
                  <Text className="text-fiber-blue font-black text-[10px] uppercase tracking-widest">{isOnline ? "GPS ACTIVO" : "BUSCANDO SATÉLITES..."}</Text>
                  {location && <LocationInfo location={location} />}
                </View>
              </View>
            </View>

            {/* Feedback Message */}
            <View className="h-16 justify-center items-center mt-4">
              {statusMessage && (
                <View className={`flex-row items-center px-6 py-3 rounded-2xl ${
                  statusMessage.type === 'error' ? 'bg-red-100' : statusMessage.type === 'warning' ? 'bg-yellow-100' : 'bg-green-100'
                }`}>
                  <IconSymbol 
                    name={statusMessage.type === 'error' ? "exclamationmark.triangle.fill" : "checkmark.circle.fill"} 
                    size={20} 
                    color={statusMessage.type === 'error' ? '#DC2626' : statusMessage.type === 'warning' ? '#D97706' : '#22C55E'} 
                  />
                  <Text className={`font-black text-sm ml-2 ${
                    statusMessage.type === 'error' ? 'text-red-700' : statusMessage.type === 'warning' ? 'text-yellow-700' : 'text-green-700'
                  }`}>{statusMessage.text}</Text>
                </View>
              )}
            </View>
          </KeyboardAvoidingView>

          {/* BOTONES PRINCIPALES */}
          <View className="px-8 pb-8">
            <View className="flex-row gap-4 mb-4">
              <TouchableOpacity onPress={handleStart} disabled={isWorking || !ticketNumber} className={`flex-1 h-20 rounded-[25px] flex-row items-center justify-center border-b-4 border-black/10 ${!isWorking && ticketNumber ? 'bg-fiber-orange' : 'bg-gray-200'}`}>
                <IconSymbol name="play.fill" size={24} color={!isWorking && ticketNumber ? 'white' : '#94A3B8'} />
                <Text className={`font-black text-lg ml-2 ${!isWorking && ticketNumber ? 'text-white' : 'text-gray-400'}`}>Empezar</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleFinish} disabled={!isWorking} className={`flex-1 h-20 rounded-[25px] flex-row items-center justify-center border-b-4 border-black/10 ${isWorking ? 'bg-fiber-blue' : 'bg-gray-200'}`}>
                <IconSymbol name="stop.fill" size={24} color={isWorking ? 'white' : '#94A3B8'} />
                <Text className={`font-black text-lg ml-2 ${isWorking ? 'text-white' : 'text-gray-400'}`}>Finalizar</Text>
              </TouchableOpacity>
            </View>

            {isWorking && (
              <TouchableOpacity 
                onPress={openIncidentModal} 
                className="h-14 rounded-2xl flex-row items-center justify-center border border-red-200 bg-red-50 active:bg-red-100"
              >
                <IconSymbol name="exclamationmark.triangle.fill" size={20} color="#DC2626" />
                <Text className="text-red-600 font-bold uppercase text-xs tracking-widest ml-2">Reportar Incidencia</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>

      {/* ============================================================
          OVERLAY DE INCIDENCIA (FIX: YA NO ES UN MODAL NATIVO)
          ============================================================ */}
      {showIncidentModal && (
        <View className="absolute inset-0 z-50">
          {/* Fondo Oscuro con Blur simulado */}
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={() => setShowIncidentModal(false)}
            className="absolute inset-0 bg-black/60"
          />
          
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1 justify-end"
          >
            <View className="bg-white rounded-t-[40px] h-[92%] shadow-2xl overflow-hidden">
              
              {/* Header */}
              <View className="px-8 pt-6 pb-4 border-b border-gray-100 bg-white z-10 flex-row justify-between items-center">
                <View>
                  <Text className="text-fiber-blue text-3xl font-black tracking-tighter">INCIDENCIA</Text>
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
                className="flex-1 px-8" 
                contentContainerStyle={{ paddingBottom: 120, paddingTop: 20 }}
                showsVerticalScrollIndicator={false}
              >
                
                {/* 1. ETIQUETAS RÁPIDAS (Tags) */}
                <Text className="text-fiber-blue font-black text-sm uppercase mb-3">1. Motivo Principal</Text>
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
                        incidentReason === reason 
                          ? 'bg-red-500 border-red-500 shadow-md' 
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <Text className={`font-bold text-xs uppercase ${
                        incidentReason === reason ? 'text-white' : 'text-gray-500'
                      }`}>
                        {reason}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  
                  {/* Botón "Otros" especial */}
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
                      incidentReason === 'Otros' 
                        ? 'bg-purple-500 border-purple-500 shadow-md' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text className={`font-bold text-xs uppercase ${
                      incidentReason === 'Otros' ? 'text-white' : 'text-gray-500'
                    }`}>
                      Otros
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Campo para título personalizado si se selecciona "Otros" */}
                {incidentReason === 'Otros' && (
                  <View className="mb-8 p-4 bg-purple-50 rounded-2xl border-2 border-purple-200">
                    <Text className="text-fiber-blue font-black text-xs uppercase mb-3">Título Personalizado</Text>
                    <TextInput 
                      className="bg-white rounded-2xl px-4 py-3 text-fiber-dark font-medium border-2 border-purple-200 text-base"
                      placeholder="Describe el tipo de incidencia..."
                      placeholderTextColor="#CBD5E1"
                      value={customReason}
                      onChangeText={setCustomReason}
                    />
                  </View>
                )}

                {/* 2. DESCRIPCIÓN */}
                <Text className="text-fiber-blue font-black text-sm uppercase mb-3">2. Descripción Detallada</Text>
                <TextInput 
                  className="bg-gray-50 rounded-3xl p-6 text-fiber-dark h-56 mb-8 font-medium align-top border-2 border-gray-100 text-lg shadow-inner"
                  placeholder="Escribe aquí los detalles del problema..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  value={incidentNote}
                  onChangeText={setIncidentNote}
                />

                {/* 3. ARCHIVOS */}
                <Text className="text-fiber-blue font-black text-sm uppercase mb-3">3. Evidencia Visual</Text>
                <TouchableOpacity 
                  onPress={toggleAttachment}
                  activeOpacity={0.8}
                  className={`border-2 border-dashed rounded-3xl h-32 items-center justify-center mb-8 ${
                    attachedImage ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'
                  }`}
                >
                  {attachedImage ? (
                    <View className="items-center">
                      <View className="bg-green-100 p-3 rounded-full mb-2">
                        <IconSymbol name="checkmark.circle.fill" size={32} color="#22C55E" />
                      </View>
                      <Text className="text-green-700 font-bold text-sm uppercase">FOTO ADJUNTA</Text>
                    </View>
                  ) : (
                    <View className="items-center">
                      <IconSymbol name="archivebox.fill" size={32} color="#CBD5E1" />
                      <Text className="text-gray-400 font-bold text-sm uppercase mt-2">SUBIR FOTO</Text>
                    </View>
                  )}
                </TouchableOpacity>

              </ScrollView>

              {/* Footer Fijo */}
              <View className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100">
                <TouchableOpacity 
                  onPress={submitIncident}
                  className={`h-20 rounded-[25px] flex-row items-center justify-center border-b-8 ${
                    (incidentReason || incidentNote) ? 'bg-red-600 border-red-800' : 'bg-gray-200 border-gray-300'
                  }`}
                  disabled={!incidentReason && !incidentNote}
                >
                  <Text className={`font-black text-xl uppercase tracking-tighter ${
                    (incidentReason || incidentNote) ? 'text-white' : 'text-gray-400'
                  }`}>
                    Registrar Incidencia
                  </Text>
                </TouchableOpacity>
              </View>

            </View>
          </KeyboardAvoidingView>
        </View>
      )}
    </View>
  );
}