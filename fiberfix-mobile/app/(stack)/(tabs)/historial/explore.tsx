
import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import { Text, View } from 'react-native';

export default function ExploreScreen() {
  return (
    <View className="flex-1 bg-white">
      {/* FONDO TÉCNICO */}
      <View className="absolute inset-0 flex-row flex-wrap opacity-5">
        {[...Array(100)].map((_, i) => (
          <View key={i} className="w-20 h-20 border border-gray-400" />
        ))}
      </View>

      <View className="bg-fiber-blue pt-16 pb-12 px-8 rounded-b-[40px] shadow-lg">
        <View>
            <Text className="text-white text-4xl font-black tracking-tighter">HISTORIAL</Text>
            <Text className="text-fiber-orange text-[10px] font-bold tracking-[0.4em] uppercase">Registro de Operaciones</Text>
        </View>
      </View>

      <View className="flex-1 items-center justify-center px-10">
        <View className="bg-white w-full rounded-[40px] p-10 items-center shadow-xl border border-fiber-border">
          <View className="bg-fiber-blue/5 p-8 rounded-full mb-6">
            <IconSymbol name="archivebox.fill" size={48} color="#002F6C" />
          </View>
          <Text className="text-2xl font-black text-fiber-blue mb-2 text-center">ARCHIVO DE LOGS</Text>
          <Text className="text-gray-400 text-center font-bold text-[10px] uppercase tracking-widest leading-5">
            Módulo disponible en el Sprint 2 para la auditoría de rutas y tickets.
          </Text>
        </View>
      </View>
    </View>
  );
}
