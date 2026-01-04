import { LocationInfo } from '@/components/LocationInfo';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useLocation } from '@/hooks/useLocation';
import React, { useState } from 'react';
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

  // EVIDENCIA 2
  const { location, errorMsg, loading } = useLocation();

  const handleStart = () => {
    if (ticketNumber.trim()) {
      setIsWorking(true);
      Keyboard.dismiss();
    }

    console.log('Trabajo iniciado para el ticket:', ticketNumber);
  };

  const handleFinish = () => {
    // Envío al servidor    
    const parte = buildWorkReport();

    if (!parte) {
      console.log('No se pudo construir el parte de trabajo')
      return;
    }

    console.log('Parte de trabajo:', parte);
    sendBySocket(parte);

    setIsWorking(false);
    setTicketNumber('');
  };

  const sendBySocket = (message: string) => {
    const SERVER_IP = '192.168.1.146';
    const SERVER_PORT = 5000;

    if (!TcpSocket || !TcpSocket.createConnection) {
      console.log('TcpSocket no está disponible.');
      return;
    }

    console.log('Intentando conectar al servidor');

    try {
      const cliente = TcpSocket.createConnection({
        host: SERVER_IP,
        port: SERVER_PORT,
      }, () => {
        console.log('Conectado al servidor TCP');
        cliente.write(message + '\n');
        cliente.end();
      });

      cliente.on('data', (data) => {
        console.log('Respuesta del servidor:', data.toString());
      });

      cliente.on('error', (error) => {
        console.log('Error en la conexión TCP:', error);
      });

      cliente.on('close', () => {
        console.log('Conexión TCP cerrada');
      });

    } catch (error) {
      console.error('Error al crear la conexión:', error);
    }
  };

  const buildWorkReport = () => {
    if (!location) return null;

    const idTecnico = 'TEC001';
    const idTicket = ticketNumber;
    const lat = location.coords.latitude;
    const lon = location.coords.longitude;
    const timestamp = new Date().toISOString();

    return `${idTecnico}|${idTicket}|${lat}|${lon}|${timestamp}`;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-white">

        {/* DEBUG GPS */}
        {errorMsg && <Text className="text-red-500 text-center">{errorMsg}</Text>}
        {loading && <Text className="text-center">Obteniendo ubicación...</Text>}

        {/* FONDO */}
        <View className="absolute inset-0 flex-row flex-wrap opacity-5">
          {[...Array(100)].map((_, i) => (
            <View key={i} className="w-20 h-20 border border-gray-400" />
          ))}
        </View>

        {/* CABECERA */}
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

            <View className="flex-row items-center px-4 py-2 rounded-2xl bg-white/10 border border-white/20">
              <View className={`w-2.5 h-2.5 rounded-full mr-2 ${isConnected ? 'bg-status-success' : 'bg-status-error'}`} />
              <Text className="text-white font-black text-[10px] tracking-widest">
                {isConnected ? 'ONLINE' : 'OFFLINE'}
              </Text>
            </View>
          </View>
        </View>

        {/* CUERPO */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-center px-8"
          style={{ marginTop: -20 }}
        >
          <View className="bg-white rounded-[40px] p-10 border border-fiber-border shadow-2xl">
            <View className="items-center mb-8">
              <View className={`p-5 rounded-full ${isWorking ? 'bg-green-100' : 'bg-orange-100'}`}>
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
              <TextInput
                className={`text-7xl font-black text-center p-2 ${isWorking ? 'text-fiber-blue' : 'text-fiber-orange'}`}
                placeholder="000"
                placeholderTextColor="#F1F5F9"
                value={ticketNumber}
                onChangeText={setTicketNumber}
                keyboardType="numeric"
                editable={!isWorking}
                maxLength={6}
                textAlign="center"
              />
            </View>

            <View className="flex-row items-center justify-center bg-fiber-gray py-4 px-6 rounded-2xl border border-fiber-border">
              <IconSymbol name="mappin.and.ellipse" size={20} color="#002F6C" />
              <View className="ml-3">
                <Text className="text-fiber-blue font-black text-[10px] uppercase tracking-widest">
                  {location ? "GPS ACTIVO" : "UBICACIÓN EN ESPERA"}
                </Text>
                {location && <LocationInfo location={location} />}
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* BOTONES */}
        <View className="px-8 pb-12 pt-4">
          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={handleStart}
              disabled={isWorking || !ticketNumber}
              className={`flex-1 h-24 rounded-[30px] flex-row items-center justify-center ${
                !isWorking && ticketNumber ? 'bg-fiber-orange' : 'bg-gray-200'
              }`}
            >
              <Text className="font-black text-xl text-white">Empezar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleFinish}
              disabled={!isWorking}
              className={`flex-1 h-24 rounded-[30px] flex-row items-center justify-center ${
                isWorking ? 'bg-fiber-blue' : 'bg-gray-200'
              }`}
            >
              <Text className="font-black text-xl text-white">Finalizar</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </TouchableWithoutFeedback>
  );
}
