import * as Location from 'expo-location';
import { Text, View } from 'react-native';

interface Props {
    location: Location.LocationObject;
}

export function LocationInfo({ location }: Props) {
    return (
        <View>
            <Text>Latitud: {location.coords.latitude}</Text>
            <Text>Longitud: {location.coords.longitude}</Text>
        </View>
    );
}