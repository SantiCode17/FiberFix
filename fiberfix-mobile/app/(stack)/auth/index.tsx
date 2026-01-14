import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import TcpSocket from 'react-native-tcp-socket';

export default function LoginScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  // Estado para Feedback Visual
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  const sendLoginBySocket = (
    user: string,
    pass: string,
    onSuccess: () => void,
    onError: () => void
  ) => {
    const SERVER_IP = process.env.EXPO_PUBLIC_SERVER_IP;
    const SERVER_PORT = Number(process.env.EXPO_PUBLIC_SERVER_PORT);

    try {
      const client = TcpSocket.createConnection(
       { host: SERVER_IP, port: SERVER_PORT },
      () => {
        client.write(`LOGIN|${user}|${pass}\n`);
      });

      client.on('data', (data) => {
        const response = data.toString().trim();
        if (response.startsWith('LOGIN_OK')) {
          onSuccess();
        } else {
          onError();
        }
        client.end();
      });

      client.on('error', onError)

    } catch (error) {
      onError();
    }
  };

  const handleLogin = () => {
    if (!userId || !password) {
      setStatusMessage({ text: 'Introduce usuario y contraseña.', type: 'error' });
      return;
    }

    sendLoginBySocket(
      userId,
      password,
      () => {
        setStatusMessage({ text: 'Login correcto', type: 'success' });
        router.replace('/home');
      }, () => {
        setStatusMessage({ text: 'Credenciales incorrectas.', type: 'error' });
      }
    )
  };

    return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-fiber-blue justify-center">
        
        <View className="absolute inset-0 flex-row flex-wrap opacity-[0.03]">
          {[...Array(100)].map((_, i) => (
            <View key={i} className="w-24 h-24 border border-white" />
          ))}
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="p-6 z-10"
        >
          {/* LOGO */}
          <View className="items-center mb-12">
            <Text className="text-white text-6xl font-black tracking-tighter italic">
              FIBER<Text className="text-fiber-orange">FIX</Text>
            </Text>
            <View className="h-2 w-24 bg-fiber-orange mt-4 rounded-full" />
            <Text className="text-blue-200 text-sm font-bold tracking-[0.5em] uppercase mt-6">
              Acceso de Operarios
            </Text>
          </View>

          {/* TARJETA DE ACCESO */}
          <View className="bg-white rounded-[40px] p-10 shadow-2xl border-4 border-white/10">
            
            {/* Input ID */}
            <View className="mb-6">
              <Text className="text-fiber-blue font-black text-xs uppercase tracking-widest mb-3 ml-2">
                ID de Operario
              </Text>
              <View className="flex-row items-center bg-gray-50 rounded-[20px] border-2 border-gray-100 px-4 h-16">
                <IconSymbol name="house.fill" size={24} color="#64748B" />
                <TextInput
                  className="flex-1 ml-4 text-xl font-bold text-fiber-dark"
                  placeholder="Ej: TEC-001"
                  placeholderTextColor="#CBD5E1"
                  value={userId}
                  onChangeText={setUserId}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Input Contraseña */}
            <View className="mb-10">
              <Text className="text-fiber-blue font-black text-xs uppercase tracking-widest mb-3 ml-2">
                Contraseña
              </Text>
              <View className="flex-row items-center bg-gray-50 rounded-[20px] border-2 border-gray-100 px-4 h-16">
                <IconSymbol name="doc.text.fill" size={24} color="#64748B" />
                <TextInput
                  className="flex-1 ml-4 text-xl font-bold text-fiber-dark"
                  placeholder="••••••••"
                  placeholderTextColor="#CBD5E1"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={true}
                />
              </View>
            </View>

            {/* Botón Entrar */}
            <TouchableOpacity 
              onPress={handleLogin}
              activeOpacity={0.8}
              className="bg-fiber-orange h-20 rounded-[25px] flex-row items-center justify-center border-b-8 border-[#CC5500] shadow-lg shadow-orange-500/30"
            >
              <Text className="text-white font-black text-2xl uppercase tracking-tighter">
                Entrar al Sistema
              </Text>
            </TouchableOpacity>

          </View>
        </KeyboardAvoidingView>

        {/* Footer */}
        <View className="absolute bottom-10 left-0 right-0 items-center">
          <Text className="text-white/30 font-bold text-[10px] uppercase tracking-widest">
            FiberFix Secure OS v2.0
          </Text>
        </View>

      </View>
    </TouchableWithoutFeedback>
  );
}