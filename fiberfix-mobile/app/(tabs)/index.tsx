import { LocationInfo } from '@/components/LocationInfo';
import { useLocation } from '@/hooks/useLocation';
import { IconSymbol } from '@/components/ui/icon-symbol';
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

export default function TicketScreen() {

  const isConnected = true;
  const [ticketNumber, setTicketNumber] = useState('');
  const [isWorking, setIsWorking] = useState(false);

  // EVIDENCIA 2
  const { location, errorMsg, loading } = useLocation();

  const handleAction = () => {
    if (!isWorking && ticketNumber.trim()) {
      setIsWorking(true);
      Keyboard.dismiss();
    } else if (isWorking) {
      setIsWorking(false);
      setTicketNumber('');
    }
  };

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
              onPress={handleAction}
              disabled={isWorking || !ticketNumber}
              className={`flex-1 h-24 rounded-[30px] flex-row items-center justify-center ${
                !isWorking && ticketNumber ? 'bg-fiber-orange' : 'bg-gray-200'
              }`}
            >
              <Text className="font-black text-xl text-white">Empezar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAction}
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
