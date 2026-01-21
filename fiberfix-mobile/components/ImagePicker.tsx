import React, { useState } from 'react';
import {
  Alert,
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface ImagePickerComponentProps {
  onImageSelected: (uri: string | null) => void;
  hasImage: boolean;
}

/**
 * Componente para seleccionar imágenes desde cámara o galería
 * En versión actual es visual-only (no se envía al servidor)
 * Futuras versiones pueden implementar carga a servidor
 */
export const ImagePickerComponent: React.FC<ImagePickerComponentProps> = ({
  onImageSelected,
  hasImage,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      const libraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus.status !== 'granted' || libraryStatus.status !== 'granted') {
        Alert.alert(
          'Permiso denegado',
          'Necesitamos acceso a la cámara y galería para esta función.'
        );
        return false;
      }
    }
    return true;
  };

  const pickFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo capturar la foto');
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = () => {
    onImageSelected(null);
  };

  if (isLoading) {
    return (
      <View className="border-2 border-dashed border-gray-200 rounded-3xl h-32 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#002F6C" />
      </View>
    );
  }

  if (hasImage) {
    return (
      <View className="gap-2">
        <View className="border-2 border-green-500 rounded-3xl h-32 items-center justify-center bg-green-50">
          <View className="bg-green-100 p-3 rounded-full mb-2">
            <IconSymbol name="checkmark.circle.fill" size={32} color="#22C55E" />
          </View>
          <Text className="text-green-700 font-bold text-sm uppercase">FOTO ADJUNTA</Text>
        </View>
        <TouchableOpacity
          onPress={removeImage}
          className="bg-red-50 border border-red-200 rounded-2xl p-3 flex-row items-center justify-center"
        >
          <IconSymbol name="trash" size={18} color="#DC2626" />
          <Text className="text-red-600 font-bold ml-2 text-sm uppercase">Eliminar Foto</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="gap-2">
      <TouchableOpacity
        onPress={takePhoto}
        className="border-2 border-dashed border-blue-300 rounded-3xl h-14 items-center justify-center bg-blue-50 flex-row"
      >
        <IconSymbol name="camera.fill" size={20} color="#3B82F6" />
        <Text className="text-blue-600 font-bold ml-2 text-xs uppercase">Tomar Foto</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={pickFromGallery}
        className="border-2 border-dashed border-gray-300 rounded-3xl h-14 items-center justify-center bg-gray-50 flex-row"
      >
        <IconSymbol name="photo.fill" size={20} color="#6B7280" />
        <Text className="text-gray-600 font-bold ml-2 text-xs uppercase">Seleccionar de Galería</Text>
      </TouchableOpacity>
    </View>
  );
};
