import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface CustomAlertProps {
  title: string;
  message: string;
  buttons: { text: string; onPress: () => void; style?: 'cancel' | 'default' }[];
}

const CustomAlert: React.FC<CustomAlertProps> = ({ title, message, buttons }) => {
  const [visible, setVisible] = React.useState(true);

  const handlePress = (onPress: () => void) => {
    setVisible(false);
    onPress();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={() => setVisible(false)}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        <View className="bg-white w-full rounded-[40px] p-8 shadow-2xl">
          <Text className="text-fiber-blue text-xl font-black mb-4">{title}</Text>
          <Text className="text-gray-600 text-sm mb-6">{message}</Text>
          <View className="flex-row justify-end gap-4">
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handlePress(button.onPress)}
                className={`px-4 py-2 rounded-lg ${
                  button.style === 'cancel' ? 'bg-gray-200' : 'bg-fiber-blue'
                }`}
              >
                <Text
                  className={`font-bold ${
                    button.style === 'cancel' ? 'text-gray-600' : 'text-white'
                  }`}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;