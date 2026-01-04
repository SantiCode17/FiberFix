import * as Location from 'expo-location';
import { Text, View } from 'react-native';

interface Props {
    location: Location.LocationObject;
}

export function LocationInfo({ location }: Props) {
    return (
        <View className="mt-1">
            <Text className="text-[10px] text-fiber-blue/80">Lat: {location.coords.latitude.toFixed(5)}</Text>
            <Text className="text-[10px] text-fiber-blue/80">Lon: {location.coords.longitude.toFixed(5)}</Text>
        </View>
    );
}