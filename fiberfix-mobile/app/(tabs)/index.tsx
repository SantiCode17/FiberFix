import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';


export default function App() {

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrormsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // Pedir permisos
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrormsg('Permiso de ubicación denegado');
        return;
      }

      // Obtener ubicación actual
      let loc = await Location.getCurrentPositionAsync({});
      /*
        let loc = {º
        coords: {
          latitude: 40.4168,
          longitude: -3.7038,
        },
      };*/
      setLocation(loc as Location.LocationObject);
    })();
  }, [])

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>FiberFix - App Técnico</Text>

      {errorMsg && <Text>{errorMsg}</Text>}

      {location && (
        <>
          <Text>Latitud: {location.coords.latitude}</Text>
          <Text>Longitud: {location.coords.longitude}</Text>
        </>
      )}

      {!location && !errorMsg && (
        <Text>Obteniendo ubicación...</Text>
      )}
    </View>
  )
}