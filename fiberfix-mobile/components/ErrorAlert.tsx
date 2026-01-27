import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import { IconSymbol } from './ui/icon-symbol';

export type ErrorType = 'error' | 'warning' | 'success' | 'info' | 'gps' | 'network' | 'server';

interface ErrorMessage {
  type: ErrorType;
  title: string;
  message: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ErrorAlertProps {
  error: ErrorMessage | null;
  onDismiss: () => void;
}

/**
 * Componente centralizado para mostrar errores y mensajes
 * con diseño profesional y clara comunicación al usuario
 */
export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onDismiss }) => {
  const [visible, setVisible] = useState(!!error);
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    if (error) {
      setVisible(true);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  }, [error]);

  const getErrorConfig = (type: ErrorType) => {
    const configs: Record<ErrorType, { icon: any; color: string; bg: string; textColor: string }> = {
      error: { icon: 'xmark.circle.fill', color: '#DC2626', bg: '#FEE2E2', textColor: '#7F1D1D' },
      warning: { icon: 'exclamationmark.triangle.fill', color: '#D97706', bg: '#FEF3C7', textColor: '#78350F' },
      success: { icon: 'checkmark.circle.fill', color: '#22C55E', bg: '#DCFCE7', textColor: '#15803D' },
      info: { icon: 'info.circle.fill', color: '#3B82F6', bg: '#DBEAFE', textColor: '#1E40AF' },
      gps: { icon: 'location.slash.fill', color: '#F59E0B', bg: '#FEF3C7', textColor: '#78350F' },
      network: { icon: 'wifi.slash', color: '#EF4444', bg: '#FEE2E2', textColor: '#7F1D1D' },
      server: { icon: 'server.rack', color: '#8B5CF6', bg: '#F3E8FF', textColor: '#5B21B6' },
    };
    return configs[type] || configs.error;
  };

  if (!error || !visible) return null;

  const config = getErrorConfig(error.type);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {
      setVisible(false);
      onDismiss();
    }}>
      <View className="flex-1 bg-black/50 justify-center items-center p-6">
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
          }}
          className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl overflow-hidden"
        >
          {/* Barra de color superior */}
          <View style={{ backgroundColor: config.color }} className="absolute top-0 left-0 right-0 h-1" />

          {/* Icono y Título */}
          <View className="items-center mb-6">
            <View style={{ backgroundColor: config.bg }} className="w-16 h-16 rounded-full items-center justify-center mb-4">
              <IconSymbol name={config.icon} size={32} color={config.color} />
            </View>
            <Text style={{ color: config.color }} className="text-2xl font-black uppercase tracking-tight text-center">
              {error.title}
            </Text>
          </View>

          {/* Mensaje detallado */}
          <Text className="text-gray-600 text-center text-base mb-8 leading-6">
            {error.message}
          </Text>

          {/* Acciones */}
          <View className="gap-3">
            {error.action && (
              <TouchableOpacity
                onPress={() => {
                  error.action?.onPress();
                  setVisible(false);
                  onDismiss();
                }}
                style={{ backgroundColor: config.color }}
                className="h-14 rounded-2xl items-center justify-center active:opacity-80"
              >
                <Text className="text-white font-black uppercase text-sm tracking-widest">
                  {error.action.label}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => {
                setVisible(false);
                onDismiss();
              }}
              className="h-14 rounded-2xl border-2 border-gray-200 items-center justify-center active:bg-gray-50"
            >
              <Text className="text-gray-700 font-black uppercase text-sm tracking-widest">
                Entendido
              </Text>
            </TouchableOpacity>
          </View>

          {/* Detalles técnicos (small text) */}
          <Text className="text-xs text-gray-400 mt-6 text-center">
            Si el problema persiste, contacta con soporte
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
};

/**
 * Hook para manejar errores de manera centralizada
 */
export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorMessage | null>(null);

  const showError = (type: ErrorType, title: string, message: string, action?: { label: string; onPress: () => void }) => {
    setError({ type, title, message, action });
  };

  const showGpsError = (message: string = 'Tu ubicación GPS no está disponible. Verifica que el GPS esté activado.') => {
    showError('gps', 'Sin Ubicación GPS', message);
  };

  const showNetworkError = (message: string = 'No hay conexión de red. Verifica tu conexión a internet.') => {
    showError('network', 'Sin Conexión', message);
  };

  const showServerError = (message: string = 'No se puede conectar con el servidor. Verifica la IP y puerto.', action?: any) => {
    showError('server', 'Error del Servidor', message, action);
  };

  const showValidationError = (message: string) => {
    showError('error', 'Datos Incompletos', message);
  };

  const showSuccess = (title: string = 'Éxito', message: string = 'Operación realizada correctamente.') => {
    showError('success', title, message);
  };

  const dismissError = () => {
    setError(null);
  };

  return {
    error,
    showError,
    showGpsError,
    showNetworkError,
    showServerError,
    showValidationError,
    showSuccess,
    dismissError,
    isError: error !== null,
  };
};
