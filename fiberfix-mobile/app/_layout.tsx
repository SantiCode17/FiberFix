import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import './global.css';

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#002F6C' }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="light" />
    </View>
  );
}