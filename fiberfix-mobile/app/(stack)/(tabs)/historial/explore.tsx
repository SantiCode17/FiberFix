import { IconSymbol } from '@/components/ui/icon-symbol';
import { useUser } from '@/context/UserContext';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import TcpSocket from 'react-native-tcp-socket';

// Definimos el Ticket
type Ticket = {
  id: number;
  numero_ticket: number;
  estado: 'Pendiente' | 'En Proceso' | 'Terminado' | 'Cancelado';
  motivo?: 'Cliente Ausente' | 'Instalación Rota' | 'Falta Material' | 'Sin Acceso' | 'Perro Suelto' | 'Otros' | null;
  descripcion?: string | null;
  fecha_creacion: string;
  fecha_inicio?: string | null;
  fecha_cierre?: string | null;
  direccion?: string;
  latitud?: number;
  longitud?: number;
};

export default function ExploreScreen() {
  const { userId } = useUser();
  const [historyData, setHistoryData] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const loadHistory = () => {
    const SERVER_IP = process.env.EXPO_PUBLIC_SERVER_IP;
    const SERVER_PORT = Number(process.env.EXPO_PUBLIC_SERVER_PORT);

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

      try{
        const tickets: Ticket[] = JSON.parse(text);
        setHistoryData(tickets);
      }catch (error) {
        Alert.alert('Error', 'El servidor no ha devuelto un JSON válido.\nMira la consola.');
        console.error('JSON inválido:', error);
      } finally {
        cliente.end();
      }
    });

    cliente.on('error', () => {
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    });
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <View className="flex-1 bg-white">
      <View className="bg-fiber-blue pt-16 pb-12 px-8 rounded-b-[40px] shadow-lg mb-6">
        <Text className="text-white text-4xl font-black tracking-tighter">HISTORIAL</Text>
        <Text className="text-fiber-orange text-[10px] font-bold tracking-[0.4em] uppercase">Registro de Operaciones</Text>
      </View>

      <ScrollView className="flex-1 px-6">
        {historyData.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => setSelectedTicket(item)}
            activeOpacity={0.7}
            className="bg-white rounded-3xl p-6 mb-4 shadow-sm border border-gray-100 flex-row items-center"
          >
            <View className={`h-12 w-12 rounded-2xl items-center justify-center mr-4 ${
              item.estado === 'Terminado' ? 'bg-green-50' :
              item.estado === 'Cancelado' ? 'bg-red-50' :
              'bg-yellow-50'
            }`}>
              <IconSymbol
                name={item.estado === 'Terminado' ? "checkmark.circle.fill" : "exclamationmark.triangle.fill"}
                size={24}
                color={item.estado === 'Terminado' ? "#22C55E" : "#DC2626"}
              />
            </View>
            <View className="flex-1">
              <Text className="text-fiber-dark font-black text-xl tracking-tight">#{item.numero_ticket}</Text>
              <Text className="text-gray-400 text-xs font-bold uppercase">{item.fecha_creacion}</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#CBD5E1" />
          </TouchableOpacity>
        ))}
        <View className="h-20" />
      </ScrollView>

      {/* MODAL DE DETALLE DE TICKET */}
      <Modal
        animationType="fade"
        transparent
        visible={!!selectedTicket}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white w-full rounded-[40px] p-8 shadow-2xl">
            {selectedTicket && (
              <>
                <View className="flex-row justify-between items-start mb-6">
                  <View>
                    <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Detalle del Ticket</Text>
                    <Text className="text-fiber-blue text-4xl font-black tracking-tighter">#{selectedTicket.numero_ticket}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedTicket(null)} className="bg-gray-100 p-2 rounded-full">
                    <IconSymbol name="close" size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {/* Estado */}
                <View className={`self-start px-4 py-2 rounded-full mb-8 ${selectedTicket.estado === 'Terminado' ? 'bg-green-100' : 'bg-red-100'}`}>
                  <Text className={`font-black text-xs ${selectedTicket.estado === 'Terminado' ? 'text-green-700' : 'text-red-700'}`}>
                    {selectedTicket.estado}
                  </Text>
                </View>

                {/* Info Grid */}
                <View className="flex-row flex-wrap gap-y-6 mb-8">
                  <View className="w-1/2 pr-2">
                    <View className="flex-row items-center mb-1">
                      <IconSymbol name="calendar" size={16} color="#94A3B8" />
                      <Text className="text-gray-400 font-bold text-[10px] uppercase ml-1">Fecha</Text>
                    </View>
                    <Text className="text-fiber-dark font-bold text-sm">{selectedTicket.fecha_creacion}</Text>
                  </View>

                  <View className="w-1/2 pl-2">
                    <View className="flex-row items-center mb-1">
                      <IconSymbol name="clock.fill" size={16} color="#94A3B8" />
                      <Text className="text-gray-400 font-bold text-[10px] uppercase ml-1">Horario</Text>
                    </View>
                    <Text className="text-fiber-dark font-bold text-sm">{selectedTicket.fecha_inicio} - {selectedTicket.fecha_cierre}</Text>
                  </View>

                  <View className="w-full">
                    <View className="flex-row items-center mb-1">
                      <IconSymbol name="location.fill" size={16} color="#94A3B8" />
                      <Text className="text-gray-400 font-bold text-[10px] uppercase ml-1">Ubicación</Text>
                    </View>
                    {selectedTicket.latitud && selectedTicket.longitud ? (
                      <Text className="text-gray-400 text-xs mt-1 font-mono">
                        {selectedTicket.latitud.toFixed(5)}, {selectedTicket.longitud.toFixed(5)}
                      </Text>
                    ) : (
                      <Text className="text-gray-400 text-xs mt-1 italic">
                        Ubicación no registrada
                      </Text>
                    )}
                  </View>
                </View>

                {/* Notas */}
                <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <Text className="text-gray-400 font-bold text-[10px] uppercase mb-2">Notas / Incidencias</Text>
                  <Text className="text-fiber-blue font-medium italic">"{selectedTicket.descripcion}"</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
