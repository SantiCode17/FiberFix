import { LocationInfo } from '@/components/LocationInfo';
import { useLocation } from '@/hooks/useLocation';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

export default function App() {

  // EVIDENCIA 2: GEOLOCALIZACIÓN

  const { location, errorMsg, loading } = useLocation();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>FiberFix - App Técnico</Text>
        {errorMsg && <Text>{errorMsg}</Text>}
        {loading && <Text>Obteniendo ubicación...</Text>}
        {location && <LocationInfo location={location}/>}
    </View>
  )
}