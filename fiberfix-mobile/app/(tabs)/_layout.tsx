import { IconSymbol } from '@/components/ui/icon-symbol';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
          height: 100,
          paddingTop: 15,
        },
        tabBarActiveTintColor: '#FF6D00',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: { fontWeight: '900', fontSize: 10, textTransform: 'uppercase', marginBottom: 15 }
      }}>
      <Tabs.Screen name="index" options={{ title: 'Tarea', tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} /> }} />
      <Tabs.Screen name="explore" options={{ title: 'Historial', tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock.fill" color={color} /> }} />
    </Tabs>
  );
}