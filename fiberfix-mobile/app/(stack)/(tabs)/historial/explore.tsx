import { IconSymbol } from '@/components/ui/icon-symbol';
import React, { useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

// Definimos el tipo de Ticket para TypeScript
type Ticket = {
  id: string;
  status: 'COMPLETADO' | 'INCIDENCIA';
  date: string;
  start: string;
  end: string;
  address: string;
  coords: string;
  notes?: string;
};

export default function ExploreScreen() {
  // Estado para el ticket seleccionado (Modal)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const historyData: Ticket[] = [
    { id: '253425', status: 'COMPLETADO', date: '16 ENE 2026', start: '11:30', end: '12:15', address: 'C/ Gran Vía 23, Madrid', coords: '40.416, -3.703', notes: 'Instalación router 5G correcta.' },
    { id: '253420', status: 'INCIDENCIA', date: '16 ENE 2026', start: '09:00', end: '09:10', address: 'Av. América 10, Madrid', coords: '40.430, -3.670', notes: 'Cliente no se encuentra en domicilio.' },
    { id: '253418', status: 'COMPLETADO', date: '15 ENE 2026', start: '16:45', end: '17:30', address: 'Plaza España 5, Madrid', coords: '40.423, -3.712', notes: 'Cambio de cableado exterior.' },
  ];

  return (
    <View className="flex-1 bg-white">
      <View className="absolute inset-0 flex-row flex-wrap opacity-5">
        {[...Array(100)].map((_, i) => <View key={i} className="w-20 h-20 border border-gray-400" />)}
      </View>

      <View className="bg-fiber-blue pt-16 pb-12 px-8 rounded-b-[40px] shadow-lg mb-6">
        <Text className="text-white text-4xl font-black tracking-tighter">HISTORIAL</Text>
        <Text className="text-fiber-orange text-[10px] font-bold tracking-[0.4em] uppercase">Registro de Operaciones</Text>
      </View>

      <ScrollView className="flex-1 px-6">
        {historyData.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            onPress={() => setSelectedTicket(item)}
            activeOpacity={0.7}
            className="bg-white rounded-3xl p-6 mb-4 shadow-sm border border-gray-100 flex-row items-center"
          >
            <View className={`h-12 w-12 rounded-2xl items-center justify-center mr-4 ${item.status === 'COMPLETADO' ? 'bg-green-50' : 'bg-red-50'}`}>
              <IconSymbol 
                name={item.status === 'COMPLETADO' ? "checkmark.circle.fill" : "exclamationmark.triangle.fill"} 
                size={24} 
                color={item.status === 'COMPLETADO' ? "#22C55E" : "#DC2626"} 
              />
            </View>
            <View className="flex-1">
              <Text className="text-fiber-dark font-black text-xl tracking-tight">#{item.id}</Text>
              <Text className="text-gray-400 text-xs font-bold uppercase">{item.date}</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color="#CBD5E1" />
          </TouchableOpacity>
        ))}
        <View className="h-20" /> 
      </ScrollView>

      {/* MODAL DE DETALLE DE TICKET */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={!!selectedTicket}
        onRequestClose={() => setSelectedTicket(null)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white w-full rounded-[40px] p-8 shadow-2xl">
            {selectedTicket && (
              <>
                <View className="flex-row justify-between items-start mb-6">
                  <View>
                    <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Detalle del Ticket</Text>
                    <Text className="text-fiber-blue text-4xl font-black tracking-tighter">#{selectedTicket.id}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedTicket(null)} className="bg-gray-100 p-2 rounded-full">
                    <IconSymbol name="close" size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {/* Estado */}
                <View className={`self-start px-4 py-2 rounded-full mb-8 ${selectedTicket.status === 'COMPLETADO' ? 'bg-green-100' : 'bg-red-100'}`}>
                   <Text className={`font-black text-xs ${selectedTicket.status === 'COMPLETADO' ? 'text-green-700' : 'text-red-700'}`}>
                     {selectedTicket.status}
                   </Text>
                </View>

                {/* Info Grid */}
                <View className="flex-row flex-wrap gap-y-6 mb-8">
                  <View className="w-1/2 pr-2">
                    <View className="flex-row items-center mb-1">
                      <IconSymbol name="calendar" size={16} color="#94A3B8" />
                      <Text className="text-gray-400 font-bold text-[10px] uppercase ml-1">Fecha</Text>
                    </View>
                    <Text className="text-fiber-dark font-bold text-sm">{selectedTicket.date}</Text>
                  </View>
                  
                  <View className="w-1/2 pl-2">
                     <View className="flex-row items-center mb-1">
                      <IconSymbol name="clock.fill" size={16} color="#94A3B8" />
                      <Text className="text-gray-400 font-bold text-[10px] uppercase ml-1">Horario</Text>
                    </View>
                    <Text className="text-fiber-dark font-bold text-sm">{selectedTicket.start} - {selectedTicket.end}</Text>
                  </View>

                  <View className="w-full">
                     <View className="flex-row items-center mb-1">
                      <IconSymbol name="location.fill" size={16} color="#94A3B8" />
                      <Text className="text-gray-400 font-bold text-[10px] uppercase ml-1">Ubicación</Text>
                    </View>
                    <Text className="text-fiber-dark font-bold text-sm">{selectedTicket.address}</Text>
                    <Text className="text-gray-400 text-xs mt-1 font-mono">{selectedTicket.coords}</Text>
                  </View>
                </View>

                {/* Notas */}
                <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                   <Text className="text-gray-400 font-bold text-[10px] uppercase mb-2">Notas / Incidencias</Text>
                   <Text className="text-fiber-blue font-medium italic">"{selectedTicket.notes}"</Text>
                </View>

              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}