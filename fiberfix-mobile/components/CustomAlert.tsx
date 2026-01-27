import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface CustomAlertProps {
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  title,
  message,
  confirmText,
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  showCancelButton = true,
}) => {
  const [visible, setVisible] = React.useState(true);

  const handleClose = () => {
    setVisible(false);
    if (onCancel) onCancel();
  };

  const handleConfirm = () => {
    setVisible(false);
    onConfirm();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
        <View className="w-4/5 bg-white rounded-lg p-6">
          <Text className="text-lg font-bold mb-4">{title}</Text>
          <Text className="text-gray-700 mb-6">{message}</Text>
          <View className="flex-row justify-end">
            {showCancelButton && (
              <TouchableOpacity
                onPress={handleClose}
                className="px-4 py-2 bg-gray-300 rounded-md mr-2"
              >
                <Text className="text-gray-800">{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleConfirm}
              className="px-4 py-2 bg-green-500 rounded-md"
            >
              <Text className="text-white">{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;
