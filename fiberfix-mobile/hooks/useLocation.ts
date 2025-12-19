import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export function useLocation() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrormsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            // Pedir permisos
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrormsg('Permiso de ubicación denegado');
                setLoading(false);
                return;
            }

            // Obtener ubicación actual
            //let loc = await Location.getCurrentPositionAsync({});

            let loc = {
                coords: {
                latitude: 40.4168,
                longitude: -3.7038,
                },
            };

            setLocation(loc as Location.LocationObject);
            setLoading(false);
        })();
    }, []);

    return { location, errorMsg, loading };
}