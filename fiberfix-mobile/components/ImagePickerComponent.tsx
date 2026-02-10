import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePickerLib from 'expo-image-picker';
import { IconSymbol } from './ui/icon-symbol';

interface ImageAttachment {
  uri: string;
  name: string;
  size: number;
  type: string;
}

interface ImagePickerComponentProps {
  onImagesSelected: (images: ImageAttachment[]) => void;
  maxImages?: number;
  maxSizePerImage?: number; // en bytes
}

/**
 * Componente para seleccionar imágenes desde galería o cámara
 * Maneja múltiples imágenes, validación de tamaño y tipo
 */
export const ImagePickerComponent: React.FC<ImagePickerComponentProps> = ({
  onImagesSelected,
  maxImages = 5,
  maxSizePerImage = 5 * 1024 * 1024, // 5 MB por defecto
}) => {
  const [selectedImages, setSelectedImages] = useState<ImageAttachment[]>([]);
  const [loading, setLoading] = useState(false);

  const requestPermissions = async () => {
    const cameraStatus = await ImagePickerLib.requestCameraPermissionsAsync();
    const galleryStatus = await ImagePickerLib.requestMediaLibraryPermissionsAsync();
    return cameraStatus.granted && galleryStatus.granted;
  };

  const pickImageFromGallery = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permiso Denegado',
          'Se requieren permisos de acceso a la galería para continuar.'
        );
        return;
      }

      const result = await ImagePickerLib.launchImageLibraryAsync({
        mediaTypes: ImagePickerLib.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled) {
        handleSelectedImages(result.assets);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo acceder a la galería');
    }
  };

  const takeCameraPhoto = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permiso Denegado',
          'Se requieren permisos de cámara para continuar.'
        );
        return;
      }

      const result = await ImagePickerLib.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled) {
        handleSelectedImages(result.assets);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo acceder a la cámara');
    }
  };

  const handleSelectedImages = async (assets: any[]) => {
    setLoading(true);
    try {
      const newImages: ImageAttachment[] = [];

      for (const asset of assets) {
        // Verificar que no se exceda el límite
        if (selectedImages.length + newImages.length >= maxImages) {
          Alert.alert(
            'Límite de imágenes',
            `Solo puedes adjuntar máximo ${maxImages} imágenes`
          );
          break;
        }

        // Obtener información del archivo
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const size = blob.size;

        // Validar tamaño
        if (size > maxSizePerImage) {
          Alert.alert(
            'Archivo muy grande',
            `La imagen "${asset.uri.split('/').pop()}" excede ${(maxSizePerImage / 1024 / 1024).toFixed(1)}MB`
          );
          continue;
        }

        // Obtener nombre del archivo
        const filename = asset.uri.split('/').pop() || `image_${Date.now()}.jpg`;

        newImages.push({
          uri: asset.uri,
          name: filename,
          size: size,
          type: 'image/jpeg',
        });
      }

      if (newImages.length > 0) {
        const updatedImages = [...selectedImages, ...newImages];
        setSelectedImages(updatedImages);
        onImagesSelected(updatedImages);
      }
    } catch (error) {
      Alert.alert('Error', 'Error al procesar las imágenes');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
    onImagesSelected(updatedImages);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <View className="w-full">
      {/* Botones de selección */}
      <View className="flex-row gap-3 mb-6">
        <TouchableOpacity
          onPress={pickImageFromGallery}
          disabled={loading || selectedImages.length >= maxImages}
          activeOpacity={0.7}
          className={`flex-1 p-4 rounded-2xl border-2 flex-row items-center justify-center ${
            loading || selectedImages.length >= maxImages
              ? 'border-gray-200 bg-gray-50'
              : 'border-blue-200 bg-blue-50'
          }`}
        >
          <IconSymbol
            name="image"
            size={20}
            color={loading || selectedImages.length >= maxImages ? '#CBD5E1' : '#3B82F6'}
          />
          <Text
            className={`font-bold text-xs uppercase ml-2 ${
              loading || selectedImages.length >= maxImages
                ? 'text-gray-400'
                : 'text-blue-600'
            }`}
          >
            Galería
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={takeCameraPhoto}
          disabled={loading || selectedImages.length >= maxImages}
          activeOpacity={0.7}
          className={`flex-1 p-4 rounded-2xl border-2 flex-row items-center justify-center ${
            loading || selectedImages.length >= maxImages
              ? 'border-gray-200 bg-gray-50'
              : 'border-orange-200 bg-orange-50'
          }`}
        >
          <IconSymbol
            name="camera"
            size={20}
            color={loading || selectedImages.length >= maxImages ? '#CBD5E1' : '#F97316'}
          />
          <Text
            className={`font-bold text-xs uppercase ml-2 ${
              loading || selectedImages.length >= maxImages
                ? 'text-gray-400'
                : 'text-orange-600'
            }`}
          >
            Cámara
          </Text>
        </TouchableOpacity>
      </View>

      {/* Indicador de carga */}
      {loading && (
        <View className="h-20 items-center justify-center mb-6">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 text-sm mt-2">Procesando imágenes...</Text>
        </View>
      )}

      {/* Galería de imágenes seleccionadas */}
      {selectedImages.length > 0 && (
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-fiber-blue font-black text-sm uppercase">
              Imágenes Adjuntas ({selectedImages.length}/{maxImages})
            </Text>
            {selectedImages.length > 0 && (
              <View className="bg-blue-100 px-3 py-1 rounded-full">
                <Text className="text-blue-700 font-bold text-xs">
                  {formatFileSize(selectedImages.reduce((sum, img) => sum + img.size, 0))}
                </Text>
              </View>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="gap-4 -mx-2 px-2 pt-5"
          >
            {selectedImages.map((image, index) => (
              <View key={index} className="relative mr-4 mb-4">
                <Image
                  source={{ uri: image.uri }}
                  className="w-24 h-24 rounded-2xl"
                />
                <TouchableOpacity
                  onPress={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full w-8 h-8 items-center justify-center shadow-md"
                >
                  <IconSymbol name="close" size={16} color="white" />
                </TouchableOpacity>
                <View className="absolute bottom-1 left-1 right-1 bg-black/60 rounded-lg p-1">
                  <Text className="text-white text-xs font-bold text-center truncate">
                    {formatFileSize(image.size)}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Estado vacío */}
      {selectedImages.length === 0 && !loading && (
        <View className="bg-gray-50 rounded-2xl p-8 items-center border-2 border-dashed border-gray-200">
          <View className="bg-gray-200 p-4 rounded-full mb-4">
            <IconSymbol name="photo.stack" size={32} color="#94A3B8" />
          </View>
          <Text className="text-gray-600 font-bold text-center text-sm">
            Adjunta fotos de evidencias para documentar la incidencia
          </Text>
          <Text className="text-gray-400 text-xs text-center mt-2">
            Máximo {maxImages} imágenes de {(maxSizePerImage / 1024 / 1024).toFixed(1)}MB cada una
          </Text>
        </View>
      )}
    </View>
  );
};
