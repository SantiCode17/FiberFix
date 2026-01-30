import React, { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { IconSymbol } from './ui/icon-symbol';

interface ImageData {
  id: number;
  nombre: string;
  tipo: string;
  tamaño: number;
  descripcion?: string | null;
  fecha: string;
  uri?: string; // Data URI o URL base64
}

interface ImageGalleryProps {
  images: ImageData[];
  isLoading?: boolean;
  onDownloadImage?: (imageId: number) => Promise<string>;
}

const { width } = Dimensions.get('window');

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  isLoading = false,
  onDownloadImage,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageData, setImageData] = useState<{ [key: number]: string }>({});
  const [loadingImageId, setLoadingImageId] = useState<number | null>(null);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);

  const handleLoadImage = async (imageId: number) => {
    if (imageData[imageId] || !onDownloadImage) return;

    setLoadingImageId(imageId);
    try {
      const dataUri = await onDownloadImage(imageId);
      setImageData((prev) => ({ ...prev, [imageId]: dataUri }));
    } catch (error) {
      console.error('Error descargando imagen:', error);
    } finally {
      setLoadingImageId(null);
    }
  };

  // Prefetch: descargar automáticamente las imágenes cuando cambian
  React.useEffect(() => {
    if (!onDownloadImage || !images || images.length === 0) return;
    // Descargar en segundo plano todas las imágenes que no estén en cache
    images.forEach((img) => {
      if (!imageData[img.id]) {
        // No await para no bloquear la UI; handleLoadImage gestiona su propio estado
        void handleLoadImage(img.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, onDownloadImage]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <View className="flex-row justify-center items-center py-8">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!images || images.length === 0) {
    return (
      <View className="py-8 px-4 items-center">
        <IconSymbol name="photo" size={40} color="#9CA3AF" />
        <Text className="text-gray-500 mt-2 text-center">No hay imágenes disponibles</Text>
      </View>
    );
  }

  const currentImage = images[currentIndex];
  const currentImageData = imageData[currentImage.id];

  return (
    <View className="space-y-4">
      {/* Carrusel principal */}
      <View className="bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
        {currentImageData ? (
          <TouchableOpacity onPress={() => setFullscreenVisible(true)}>
            <Image
              source={{ uri: currentImageData }}
              style={{
                width: width - 32,
                height: 300,
                resizeMode: 'contain',
                backgroundColor: '#000',
              }}
            />
          </TouchableOpacity>
        ) : (
          <View style={{ width: width - 32, height: 300 }} className="bg-gray-200 justify-center items-center">
            {loadingImageId === currentImage.id ? (
              <ActivityIndicator size="large" color="#3B82F6" />
            ) : (
              <TouchableOpacity
                onPress={() => handleLoadImage(currentImage.id)}
                className="items-center"
              >
                <IconSymbol name="arrow.down.circle" size={48} color="#3B82F6" />
                <Text className="text-blue-500 mt-2 font-semibold">Cargando imágenes</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Información de la imagen actual */}
      <View className="bg-white p-4 rounded-lg border border-gray-200">
        <Text className="font-bold text-lg text-gray-800 mb-2">{currentImage.nombre}</Text>
        <View className="space-y-2">
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-600 text-sm">Tamaño:</Text>
            <Text className="text-gray-800 font-semibold text-sm">
              {formatFileSize(currentImage.tamaño)}
            </Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-600 text-sm">Tipo:</Text>
            <Text className="text-gray-800 font-semibold text-sm">{currentImage.tipo}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-600 text-sm">Cargada:</Text>
            <Text className="text-gray-800 font-semibold text-sm">
              {formatDate(currentImage.fecha)}
            </Text>
          </View>
          {currentImage.descripcion && (
            <View className="mt-2 pt-2 border-t border-gray-300">
              <Text className="text-gray-600 text-xs mb-1">Descripción:</Text>
              <Text className="text-gray-700 text-sm italic">{currentImage.descripcion}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Controles de navegación */}
      {images.length > 1 && (
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            onPress={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
            disabled={images.length <= 1}
            className={`p-3 rounded-lg ${
              images.length <= 1 ? 'bg-gray-300' : 'bg-blue-500'
            }`}
          >
            <IconSymbol name="chevron.left" size={24} color="white" />
          </TouchableOpacity>

          <View className="flex-row items-center space-x-2">
            {images.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full ${
                  index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </View>

          <TouchableOpacity
            onPress={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
            disabled={images.length <= 1}
            className={`p-3 rounded-lg ${
              images.length <= 1 ? 'bg-gray-300' : 'bg-blue-500'
            }`}
          >
            <IconSymbol name="chevron.right" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* Contador */}
      <View className="items-center">
        <Text className="text-gray-600 text-sm">
          Imagen {currentIndex + 1} de {images.length}
        </Text>
      </View>

      {/* Vista de miniaturas */}
      {images.length > 1 && (
        <View className="mt-4">
          <Text className="text-gray-700 font-semibold mb-2">Miniaturas:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-2">
            {images.map((image, index) => (
              <TouchableOpacity
                key={image.id}
                onPress={() => setCurrentIndex(index)}
                className={`rounded-lg overflow-hidden border-2 ${
                  index === currentIndex ? 'border-blue-500' : 'border-gray-300'
                }`}
              >
                {imageData[image.id] ? (
                  <Image
                    source={{ uri: imageData[image.id] }}
                    style={{ width: 60, height: 60, resizeMode: 'cover' }}
                  />
                ) : (
                  <View className="w-16 h-16 bg-gray-200 justify-center items-center">
                    <IconSymbol name="photo" size={20} color="#9CA3AF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Modal de pantalla completa */}
      <Modal
        visible={fullscreenVisible}
        transparent={true}
        onRequestClose={() => setFullscreenVisible(false)}
      >
        <View className="flex-1 bg-black justify-center items-center">
          <TouchableOpacity
            onPress={() => setFullscreenVisible(false)}
            className="absolute top-10 right-6 z-10"
          >
            <IconSymbol name="xmark.circle.fill" size={32} color="white" />
          </TouchableOpacity>

          {currentImageData && (
            <Image
              source={{ uri: currentImageData }}
              style={{
                width: width,
                height: '100%',
                resizeMode: 'contain',
              }}
            />
          )}
        </View>
      </Modal>
    </View>
  );
};
