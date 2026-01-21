import { IconSymbol } from '@/components/ui/icon-symbol';
import { MOTIVOS_PREDEFINIDOS } from '@/types/motivo';
import React, { useEffect, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import TcpSocket from 'react-native-tcp-socket';

// Tipo de dato mejorado
type Ticket = {
  id: number;
  numero_ticket: number;
  estado: 'Pendiente' | 'En Proceso' | 'Terminado' | 'Cancelado' | 'Borrado';
  motivo: string | null;
  descripcion: string | null;
  fecha_creacion: string;
  fecha_inicio: string | null;
  fecha_cierre: string | null;
};

const SERVER_IP = '192.168.1.146';
const SERVER_PORT = 5000;
const userId = 'TEC001'; // Debería venir del contexto de usuario autenticado

export default function ExploreScreen() {
  // Estados principales
  const [historyData, setHistoryData] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);
  
  // Campos temporales de edición
  const [editMotivo, setEditMotivo] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editCustomMotivo, setEditCustomMotivo] = useState('');

  // Cargar historial al iniciar
  useEffect(() => {
    loadHistory();
  }, []);

  // Limpiar mensaje de estado
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const loadHistory = () => {
    setIsLoading(true);
    const mensaje = `HISTORY|${userId}`;
    
    try {
      const cliente = TcpSocket.createConnection({ host: SERVER_IP, port: SERVER_PORT }, () => {
        cliente.write(mensaje + '\n');
      });
      
      cliente.on('data', (data) => {
        try {
          const jsonStr = data.toString().trim();
          const tickets = JSON.parse(jsonStr);
          setHistoryData(tickets.filter((t: Ticket) => t.estado !== 'Borrado'));
          setIsLoading(false);
        } catch (e) {
          console.error('Error parsing history:', e);
          setIsLoading(false);
        }
        cliente.end();
      });
      
      cliente.on('error', () => {
        setStatusMessage({ text: "ERROR AL CARGAR HISTORIAL", type: 'error' });
        setIsLoading(false);
      });
    } catch (error) {
      setStatusMessage({ text: "ERROR DE CONEXIÓN", type: 'error' });
      setIsLoading(false);
    }
  };

  // Abrir detalle del ticket
  const openDetail = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsEditing(false);
    setEditMotivo(ticket.motivo || '');
    setEditDescripcion(ticket.descripcion || '');
    setEditCustomMotivo('');
  };

  // Guardar cambios editados
  const saveChanges = () => {
    if (!selectedTicket) return;

    let finalMotivo = editMotivo;

    // Si es motivo personalizado
    if (editMotivo === 'Otros' && editCustomMotivo.trim()) {
      finalMotivo = editCustomMotivo.trim();
    } else if (editMotivo === 'Otros' && !editCustomMotivo.trim()) {
      Alert.alert("Falta información", "Por favor, escribe un título personalizado.");
      return;
    }

    const mensaje = `EDIT|${userId}|${selectedTicket.id}|${finalMotivo}|${editDescripcion}`;
    
    try {
      const cliente = TcpSocket.createConnection({ host: SERVER_IP, port: SERVER_PORT }, () => {
        cliente.write(mensaje + '\n');
      });
      
      cliente.on('data', (data) => {
        const response = data.toString().trim();
        if (response === 'EDIT_OK') {
          setStatusMessage({ text: "TICKET ACTUALIZADO", type: 'success' });
          setIsEditing(false);
          setSelectedTicket(null);
          loadHistory(); // Recargar historial
        } else {
          setStatusMessage({ text: "ERROR AL EDITAR TICKET", type: 'error' });
        }
        cliente.end();
      });
      
      cliente.on('error', () => {
        setStatusMessage({ text: "ERROR DE ENVÍO", type: 'error' });
      });
    } catch (error) {
      setStatusMessage({ text: "ERROR DE CONEXIÓN", type: 'error' });
    }
  };

  // Borrar ticket
  const deleteTicket = () => {
    if (!selectedTicket) return;

    const confirmMessage = selectedTicket.estado === 'Cancelado' 
      ? "¿Borrar este ticket que aún está sin completar?" 
      : "¿Estás seguro de que deseas borrar este ticket?";

    Alert.alert(
      "Eliminar Ticket",
      confirmMessage,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            const mensaje = `DELETE|${userId}|${selectedTicket.id}`;
            
            try {
              const cliente = TcpSocket.createConnection({ host: SERVER_IP, port: SERVER_PORT }, () => {
                cliente.write(mensaje + '\n');
              });
              
              cliente.on('data', (data) => {
                const response = data.toString().trim();
                if (response === 'DELETE_OK') {
                  setStatusMessage({ text: "TICKET ELIMINADO", type: 'success' });
                  setSelectedTicket(null);
                  loadHistory();
                } else {
                  setStatusMessage({ text: "ERROR AL ELIMINAR", type: 'error' });
                }
                cliente.end();
              });
              
              cliente.on('error', () => {
                setStatusMessage({ text: "ERROR DE ENVÍO", type: 'error' });
              });
            } catch (error) {
              setStatusMessage({ text: "ERROR DE CONEXIÓN", type: 'error' });
            }
          }
        }
      ]
    );
  };

  // Reanudar ticket
  const resumeTicket = () => {
    if (!selectedTicket) return;

    Alert.alert(
      "Reanudar Ticket",
      "¿Deseas reanudar este ticket para intentarlo de nuevo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Reanudar",
          onPress: () => {
            const mensaje = `RESUME|${userId}|${selectedTicket.id}`;
            
            try {
              const cliente = TcpSocket.createConnection({ host: SERVER_IP, port: SERVER_PORT }, () => {
                cliente.write(mensaje + '\n');
              });
              
              cliente.on('data', (data) => {
                const response = data.toString().trim();
                if (response === 'RESUME_OK') {
                  setStatusMessage({ text: "TICKET REANUDADO", type: 'success' });
                  setSelectedTicket(null);
                  loadHistory();
                } else {
                  setStatusMessage({ text: "ERROR AL REANUDAR", type: 'error' });
                }
                cliente.end();
              });
              
              cliente.on('error', () => {
                setStatusMessage({ text: "ERROR DE ENVÍO", type: 'error' });
              });
            } catch (error) {
              setStatusMessage({ text: "ERROR DE CONEXIÓN", type: 'error' });
            }
          }
        }
      ]
    );
  };

  // Obtener color según estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Terminado': return { bg: 'bg-green-50', icon: 'checkmark.circle.fill', color: '#22C55E' };
      case 'Cancelado': return { bg: 'bg-red-50', icon: 'exclamationmark.triangle.fill', color: '#DC2626' };
      case 'Pendiente': return { bg: 'bg-yellow-50', icon: 'clock.fill', color: '#F59E0B' };
      case 'En Proceso': return { bg: 'bg-blue-50', icon: 'play.fill', color: '#3B82F6' };
      default: return { bg: 'bg-gray-50', icon: 'doc.text.fill', color: '#6B7280' };
    }
  };

  const estadoColor = selectedTicket ? getEstadoColor(selectedTicket.estado) : { bg: 'bg-gray-50', icon: 'doc.text.fill', color: '#6B7280' };

  return (
    <View className="flex-1 bg-white">
      <View className="absolute inset-0 flex-row flex-wrap opacity-5">
        {[...Array(100)].map((_, i) => <View key={i} className="w-20 h-20 border border-gray-400" />)}
      </View>

      {/* CABECERA */}
      <View className="bg-fiber-blue pt-16 pb-12 px-8 rounded-b-[40px] shadow-lg mb-6 relative z-10">
        <Text className="text-white text-4xl font-black tracking-tighter">HISTORIAL</Text>
        <Text className="text-fiber-orange text-[10px] font-bold tracking-[0.4em] uppercase">Registro de Operaciones</Text>
      </View>

      {/* Mensaje de estado */}
      {statusMessage && (
        <View className={`mx-6 mb-4 flex-row items-center px-4 py-3 rounded-2xl ${
          statusMessage.type === 'error' ? 'bg-red-100' : statusMessage.type === 'warning' ? 'bg-yellow-100' : 'bg-green-100'
        }`}>
          <IconSymbol 
            name={statusMessage.type === 'error' ? "exclamationmark.triangle.fill" : "checkmark.circle.fill"} 
            size={18} 
            color={statusMessage.type === 'error' ? '#DC2626' : statusMessage.type === 'warning' ? '#D97706' : '#22C55E'} 
          />
          <Text className={`ml-3 font-bold text-sm ${
            statusMessage.type === 'error' ? 'text-red-700' : statusMessage.type === 'warning' ? 'text-yellow-700' : 'text-green-700'
          }`}>{statusMessage.text}</Text>
        </View>
      )}

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-400 font-bold">Cargando historial...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {historyData.length === 0 ? (
            <View className="flex-1 justify-center items-center py-16">
              <IconSymbol name="doc.text" size={48} color="#CBD5E1" />
              <Text className="text-gray-400 font-bold mt-4">No hay tickets registrados</Text>
            </View>
          ) : (
            historyData.map((item) => {
              const color = getEstadoColor(item.estado);
              return (
                <TouchableOpacity 
                  key={item.id} 
                  onPress={() => openDetail(item)}
                  activeOpacity={0.7}
                  className="bg-white rounded-3xl p-6 mb-4 shadow-sm border border-gray-100 flex-row items-center"
                >
                  <View className={`h-12 w-12 rounded-2xl items-center justify-center mr-4 ${color.bg}`}>
                    <IconSymbol 
                      name={color.icon as any}
                      size={24} 
                      color={color.color} 
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-fiber-dark font-black text-xl tracking-tight">#{item.numero_ticket}</Text>
                    <Text className="text-gray-400 text-xs font-bold uppercase">{item.motivo || item.estado}</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color="#CBD5E1" />
                </TouchableOpacity>
              );
            })
          )}
          <View className="h-20" />
        </ScrollView>
      )}

      {/* OVERLAY DE DETALLE / EDICIÓN */}
      {selectedTicket && (
        <View className="absolute inset-0 z-50">
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={() => setSelectedTicket(null)}
            className="absolute inset-0 bg-black/60"
          />
          
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1 justify-end"
          >
            <View className="bg-white rounded-t-[40px] h-[92%] shadow-2xl overflow-hidden">
              
              {/* Header Detalle */}
              <View className="px-8 pt-6 pb-4 border-b border-gray-100 bg-white z-10 flex-row justify-between items-center">
                <View>
                  <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                    {isEditing ? "EDITANDO TICKET" : "DETALLE TICKET"}
                  </Text>
                  <Text className="text-fiber-blue text-3xl font-black tracking-tighter">#{selectedTicket.numero_ticket}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedTicket(null)} className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                  <IconSymbol name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView className="flex-1 px-8 pt-6" contentContainerStyle={{ paddingBottom: 240 }}>
                
                {/* Estado Badge */}
                <View className={`flex-row items-center px-4 py-3 rounded-2xl mb-6 ${estadoColor.bg}`}>
                  <IconSymbol 
                    name={estadoColor.icon as any}
                    size={18} 
                    color={estadoColor.color} 
                  />
                  <Text className="ml-2 font-bold text-sm" style={{ color: estadoColor.color }}>
                    {selectedTicket.estado}
                  </Text>
                </View>

                {/* 1. TÍTULO / MOTIVO */}
                <Text className="text-gray-400 font-bold text-xs uppercase mb-3">1. Motivo / Título</Text>
                {isEditing ? (
                  <View>
                    <View className="flex-row flex-wrap gap-2 mb-4">
                      {MOTIVOS_PREDEFINIDOS.map((motivo) => (
                        <TouchableOpacity
                          key={motivo}
                          onPress={() => {
                            setEditMotivo(editMotivo === motivo ? '' : motivo);
                            if (editMotivo !== motivo) {
                              setEditCustomMotivo('');
                            }
                          }}
                          className={`px-3 py-2 rounded-lg border ${
                            editMotivo === motivo 
                              ? 'bg-fiber-blue border-fiber-blue' 
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <Text className={`font-bold text-xs ${
                            editMotivo === motivo ? 'text-white' : 'text-gray-600'
                          }`}>
                            {motivo}
                          </Text>
                        </TouchableOpacity>
                      ))}
                      
                      <TouchableOpacity
                        onPress={() => {
                          setEditMotivo(editMotivo === 'Otros' ? '' : 'Otros');
                          if (editMotivo !== 'Otros') {
                            setEditCustomMotivo('');
                          }
                        }}
                        className={`px-3 py-2 rounded-lg border ${
                          editMotivo === 'Otros' 
                            ? 'bg-purple-500 border-purple-500' 
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <Text className={`font-bold text-xs ${
                          editMotivo === 'Otros' ? 'text-white' : 'text-gray-600'
                        }`}>
                          Otros
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {editMotivo === 'Otros' && (
                      <TextInput 
                        value={editCustomMotivo}
                        onChangeText={setEditCustomMotivo}
                        className="bg-purple-50 p-4 rounded-xl text-lg font-bold text-fiber-dark border border-purple-200 mb-6"
                        placeholder="Especifica el motivo..."
                      />
                    )}

                    {editMotivo && editMotivo !== 'Otros' && (
                      <Text className="text-fiber-dark text-xl font-black mb-6">{editMotivo}</Text>
                    )}
                  </View>
                ) : (
                  <Text className="text-fiber-dark text-2xl font-black mb-6">{selectedTicket.motivo || 'Sin motivo especificado'}</Text>
                )}

                {/* 2. DESCRIPCIÓN */}
                <Text className="text-gray-400 font-bold text-xs uppercase mb-3">2. Descripción</Text>
                {isEditing ? (
                  <TextInput 
                    value={editDescripcion}
                    onChangeText={setEditDescripcion}
                    multiline
                    className="bg-gray-50 p-4 rounded-xl text-base font-medium text-fiber-dark border border-gray-200 h-40 mb-6 align-top"
                    placeholder="Escribe la descripción..."
                  />
                ) : (
                  <View className="bg-gray-50 p-6 rounded-3xl mb-6">
                    <Text className="text-fiber-dark text-lg font-medium leading-6">
                      {selectedTicket.descripcion || 'Sin descripción'}
                    </Text>
                  </View>
                )}

                {/* 3. IMÁGENES */}
                <Text className="text-gray-400 font-bold text-xs uppercase mb-3">3. Evidencia Visual</Text>
                <View className="border-2 border-dashed border-gray-200 rounded-3xl h-40 items-center justify-center bg-gray-50 mb-8">
                  <IconSymbol name="archivebox.fill" size={40} color="#CBD5E1" />
                  <Text className="text-gray-400 font-bold mt-2 uppercase text-xs">Sin imágenes</Text>
                </View>

                {/* Auditoría */}
                <View className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <Text className="text-fiber-blue font-bold text-xs uppercase mb-2">Información de Auditoría</Text>
                  <Text className="text-gray-600 text-xs">
                    Creado: {new Date(selectedTicket.fecha_creacion).toLocaleString()}
                  </Text>
                  {selectedTicket.fecha_inicio && (
                    <Text className="text-gray-600 text-xs">
                      Iniciado: {new Date(selectedTicket.fecha_inicio).toLocaleString()}
                    </Text>
                  )}
                </View>

              </ScrollView>

              {/* Footer con botones */}
              <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-6">
                {!isEditing ? (
                  <View className="gap-3">
                    <TouchableOpacity 
                      onPress={() => setIsEditing(true)} 
                      className="h-14 bg-fiber-blue rounded-2xl flex-row items-center justify-center border-b-4 border-blue-900"
                    >
                      <IconSymbol name="pencil" size={20} color="white" />
                      <Text className="text-white font-black ml-2 uppercase">Editar Ticket</Text>
                    </TouchableOpacity>

                    {selectedTicket.estado === 'Cancelado' && (
                      <TouchableOpacity 
                        onPress={resumeTicket} 
                        className="h-14 bg-green-500 rounded-2xl flex-row items-center justify-center border-b-4 border-green-700"
                      >
                        <IconSymbol name="play.fill" size={20} color="white" />
                        <Text className="text-white font-black ml-2 uppercase">Reanudar Ticket</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity 
                      onPress={deleteTicket} 
                      className="h-14 bg-red-600 rounded-2xl flex-row items-center justify-center border-b-4 border-red-800"
                    >
                      <IconSymbol name="trash" size={20} color="white" />
                      <Text className="text-white font-black ml-2 uppercase">Eliminar Ticket</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="gap-3">
                    <TouchableOpacity 
                      onPress={saveChanges} 
                      className="h-14 bg-green-500 rounded-2xl flex-row items-center justify-center border-b-4 border-green-700"
                    >
                      <IconSymbol name="checkmark.circle.fill" size={20} color="white" />
                      <Text className="text-white font-black ml-2 uppercase">Guardar Cambios</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      onPress={() => setIsEditing(false)} 
                      className="h-14 bg-gray-200 rounded-2xl flex-row items-center justify-center border-b-4 border-gray-300"
                    >
                      <IconSymbol name="xmark.circle.fill" size={20} color="#6B7280" />
                      <Text className="text-gray-600 font-black ml-2 uppercase">Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}
    </View>
  );
}
