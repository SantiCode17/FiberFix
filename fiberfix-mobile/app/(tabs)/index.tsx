import { LocationInfo } from '@/components/LocationInfo';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useLocation } from '@/hooks/useLocation';
import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import TcpSocket from 'react-native-tcp-socket';

export default function TicketScreen() {
  const isConnected = true;
  const [ticketNumber, setTicketNumber] = useState('');
  const [isWorking, setIsWorking] = useState(false);
  
  // Estado para Feedback Visual
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  const { location } = useLocation();

  // Autolimpieza del mensaje
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

  const handleFinish = () => {
    const parte = buildWorkReport();
    if (!parte) {
      setStatusMessage({ text: "ERROR: SIN SEÑAL GPS", type: 'error' });
      return;
    }
    sendBySocket(parte);
  };

  const sendBySocket = (message: string) => {
    const SERVER_IP = '192.168.1.146'; // Asegúrate de que esta IP es la de tu PC actual
    const SERVER_PORT = 5000;

    try {
      const cliente = TcpSocket.createConnection({
        host: SERVER_IP,
        port: SERVER_PORT
      }, () => {
        cliente.write(message + '\n');
      });

      cliente.on('data', () => {
        setStatusMessage({ text: "TODO REALIZADO CON ÉXITO", type: 'success' });
        setIsWorking(false);
        setTicketNumber('');
        cliente.end();
      });

      cliente.on('error', () => {
        setStatusMessage({ text: "ERROR: FALLO DE ENVÍO", type: 'error' });
      });

    } catch (error) {
      setStatusMessage({ text: "ERROR: NO HAY CONEXIÓN", type: 'error' });
    }
  };

  const buildWorkReport = () => {
    if (!location) return null;
    return `TEC001|${ticketNumber}|${location.coords.latitude}|${location.coords.longitude}|${new Date().toISOString()}`;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-white">

        {/* Fondo Técnico */}
        <View className="absolute inset-0 flex-row flex-wrap opacity-5">
          {[...Array(100)].map((_, i) => (
            <View key={i} className="w-20 h-20 border border-gray-400" />
          ))}
        </View>

        {/* Cabecera */}
        <View className="bg-fiber-blue pt-16 pb-12 px-8 rounded-b-[40px] shadow-lg">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-white text-4xl font-black tracking-tighter">
                FIBER<Text className="text-fiber-orange">FIX</Text>
              </Text>
              <Text className="text-white/40 text-[10px] font-bold tracking-[0.4em] uppercase">
                Operations Control
              </Text>
            </View>

            <View className={`flex-row items-center px-4 py-2 rounded-2xl border ${isConnected ? 'bg-status-success/10 border-status-success' : 'bg-status-error/10 border-status-error'}`}>
              <View className={`w-2.5 h-2.5 rounded-full mr-2 ${isConnected ? 'bg-status-success' : 'bg-status-error'}`} />
              <Text className={`font-black text-[10px] tracking-widest ${isConnected ? 'text-status-success' : 'text-status-error'}`}>
                {isConnected ? 'ONLINE' : 'OFFLINE'}
              </Text>
            </View>
          </View>
        </View>

        {/* Cuerpo Principal */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-center px-8"
          style={{ marginTop: -20 }}
        >
          <View className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-2xl">
            <View className="items-center mb-8">
              <View className={`p-5 rounded-3xl ${isWorking ? 'bg-green-50' : 'bg-orange-50'}`}>
                <IconSymbol
                  name="doc.text.fill"
                  size={42}
                  color={isWorking ? '#22C55E' : '#FF6D00'}
                />
              </View>
            </View>

            <View className="mb-8">
              <Text className="text-fiber-blue font-black text-center text-xs uppercase tracking-[0.3em] mb-4">
                Nº Ticket Trabajo
              </Text>
              
              {/* INPUT CORREGIDO: padding 0 y textAlign center para evitar desplazamiento */}
              <TextInput
                className={`text-7xl font-black ${isWorking ? 'text-fiber-blue' : 'text-fiber-orange'}`}
                style={{ textAlign: 'center', padding: 0, margin: 0 }}
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

            <View className="flex-row items-center justify-center bg-gray-50 py-4 px-6 rounded-2xl border border-gray-100">
              <IconSymbol name="mappin.and.ellipse" size={20} color="#002F6C" />
              <View className="ml-3">
                <Text className="text-fiber-blue font-black text-[10px] uppercase tracking-widest">
                  {location ? "GPS ACTIVO" : "UBICACIÓN EN ESPERA"}
                </Text>
                {location && <LocationInfo location={location} />}
              </View>
            </View>
          </View>

          {/* Zona de Notificación (Respetando el espacio visual) */}
          <View className="h-20 justify-center items-center mt-4">
            {statusMessage && (
              <View className={`flex-row items-center px-6 py-3 rounded-2xl ${
                statusMessage.type === 'success' ? 'bg-status-success/10' : 'bg-status-error/10'
              }`}>
                <IconSymbol 
                  name={statusMessage.type === 'success' ? "checkmark.circle.fill" : "exclamationmark.triangle.fill"} 
                  size={20} 
                  color={statusMessage.type === 'success' ? '#22C55E' : '#D50000'} 
                />
                <Text className={`font-black text-sm ml-2 ${
                  statusMessage.type === 'success' ? 'text-status-success' : 'text-status-error'
                }`}>
                  {statusMessage.text}
                </Text>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>

        {/* Botones de Acción */}
        <View className="px-8 pb-12 pt-4">
          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={handleStart}
              disabled={isWorking || !ticketNumber}
              className={`flex-1 h-24 rounded-[30px] flex-row items-center justify-center border-b-8 border-black/10 ${
                !isWorking && ticketNumber ? 'bg-fiber-orange' : 'bg-gray-200'
              }`}
            >
              <IconSymbol name="play.fill" size={24} color={!isWorking && ticketNumber ? 'white' : '#94A3B8'} />
              <Text className={`font-black text-xl ml-2 ${!isWorking && ticketNumber ? 'text-white' : 'text-gray-400'}`}>Empezar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleFinish}
              disabled={!isWorking}
              className={`flex-1 h-24 rounded-[30px] flex-row items-center justify-center border-b-8 border-black/10 ${
                isWorking ? 'bg-fiber-blue' : 'bg-gray-200'
              }`}
            >
              <IconSymbol name="stop.fill" size={24} color={isWorking ? 'white' : '#94A3B8'} />
              <Text className={`font-black text-xl ml-2 ${isWorking ? 'text-white' : 'text-gray-400'}`}>Finalizar</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </TouchableWithoutFeedback>
  );
}