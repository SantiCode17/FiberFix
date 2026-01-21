import { Slot } from 'expo-router';
import React from 'react';
import './global.css';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
      <Slot/>
  );
}