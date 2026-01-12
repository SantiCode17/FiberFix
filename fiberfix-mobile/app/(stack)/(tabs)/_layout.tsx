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
      <Tabs.Screen name='home/index' options={{ title: 'Home' }} />
      <Tabs.Screen name='historial/explore' options={{ title: 'Historial' }} />
    </Tabs>
  );
}