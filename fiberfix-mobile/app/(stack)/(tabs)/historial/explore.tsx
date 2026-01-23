import {IconSymbol} from '@/components/ui/icon-symbol';
import {useUser} from '@/context/UserContext';
import {useFocusEffect} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import TcpSocket from 'react-native-tcp-socket';

// Definimos el Ticket
type Ticket = {
    id: number;
    numero_ticket: number;
    estado: 'Pendiente' | 'En Proceso' | 'Terminado' | 'Cancelado';
    motivo?: 'Cliente Ausente' | 'Instalación Rota' | 'Falta Material' | 'Sin Acceso' | 'Perro Suelto' | 'Otros' | null;
    descripcion?: string | null;
    fecha_creacion: string;
    fecha_inicio?: string | null;
    fecha_cierre?: string | null;
    direccion?: string;
    latitud?: number;
    longitud?: number;
};

const MOCK_TICKETS: Ticket[] = [
    {
        id: 1,
        numero_ticket: 12345,
        estado: 'Terminado',
        descripcion: 'Instalación de fibra óptica exitosa. Se verificó la conexión y velocidad con el cliente.',
        fecha_creacion: '2023-10-25',
        fecha_inicio: '10:00',
        fecha_cierre: '12:30',
        direccion: 'Calle Gran Vía 22, Madrid',
        latitud: 40.4197,
        longitud: -3.7011
    },
    {
        id: 2,
        numero_ticket: 12346,
        estado: 'Cancelado',
        motivo: 'Cliente Ausente',
        descripcion: 'Se acudió al domicilio pero nadie contestó. Se intentó llamar por teléfono sin respuesta.',
        fecha_creacion: '2023-10-26',
        fecha_inicio: '16:00',
        fecha_cierre: '16:20',
        direccion: 'Paseo de la Castellana 100, Madrid'
    },
    {
        id: 3,
        numero_ticket: 12347,
        estado: 'En Proceso',
        descripcion: 'Avería en la caja de terminal óptica exterior. Requiere escalera.',
        fecha_creacion: '2023-10-27',
        fecha_inicio: '09:15',
        direccion: 'Calle de Alcalá 45, Madrid'
    },
    {
        id: 4,
        numero_ticket: 12348,
        estado: 'Pendiente',
        descripcion: 'Sustitución de router antiguo por avería eléctrica.',
        fecha_creacion: '2023-10-28',
        direccion: 'Calle de Atocha 12, Madrid'
    }
];

export default function ExploreScreen() {
    //const {userId} = useUser();

    const [historyData, setHistoryData] = useState<Ticket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

    //Barra de busqueda
    const [searchQuery, setSearchQuery] = useState('');

    //Filtros de estado
    const [statusFilter, setStatusFilter] = useState<'Todos' | Ticket['estado']>('Todos');


    //Orden de tickets por fecha
    const [sortOrder, setSortOrder] = useState<'reciente' | 'antiguo'>('reciente');


    /*Filtrador de ticket*/
    const filteredHistory = historyData.filter((ticket) => {

        //Busca por numero de ticket, descripcion o direccion
        const query = searchQuery.toLowerCase();
        const matchesSearch = (
            ticket.numero_ticket.toString().includes(query) ||
            ticket.descripcion?.toLowerCase().includes(query) ||
            ticket.direccion?.toLowerCase().includes(query)
        );
        const matchesStatus = statusFilter === 'Todos' || ticket.estado === statusFilter;

        return matchesSearch && matchesStatus;
    }).sort((a, b) => {

        //Ordena por fecha
        const dateA = new Date(a.fecha_creacion).getTime();
        const dateB = new Date(b.fecha_creacion).getTime();
        return sortOrder === 'reciente' ? dateB - dateA : dateA - dateB;
    });

    const loadHistory = () => {
        // LOCAL: Usar tickets de prueba
        setHistoryData(MOCK_TICKETS);

        /*
        // CÓDIGO ORIGINAL COMENTADO PARA USO LOCAL
        const SERVER_IP = process.env.EXPO_PUBLIC_SERVER_IP;
        const SERVER_PORT = Number(process.env.EXPO_PUBLIC_SERVER_PORT);

        const cliente = TcpSocket.createConnection({host: SERVER_IP, port: SERVER_PORT}, () => {
            if (userId) {
                cliente.write(`HISTORY|${userId}\n`); // Enviar el ID dinámico del usuario autenticado
            } else {
                Alert.alert('Error', 'No se pudo obtener el ID del usuario.');
                cliente.end();
            }
        });

        cliente.on('data', (data) => {
            const text = data.toString().trim();
            console.log('Respuesta servidor:', text);

            try {
                const tickets: Ticket[] = JSON.parse(text);
                setHistoryData(tickets);
            } catch (error) {
                Alert.alert('Error', 'El servidor no ha devuelto un JSON válido.\nMira la consola.');
                console.error('JSON inválido:', error);
            } finally {
                cliente.end();
            }
        });

        cliente.on('error', () => {
            Alert.alert('Error', 'No se pudo conectar con el servidor');
        });
        */
    };

    useEffect(() => {
        loadHistory();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            loadHistory();
        }, [])
    );

    return (
        <View className="flex-1 bg-white">
            <View className="bg-fiber-blue pt-16 pb-12 px-8 rounded-b-[40px] shadow-lg mb-6">
                <Text className="text-white text-4xl font-black tracking-tighter">HISTORIAL</Text>
                <Text className="text-fiber-orange text-[10px] font-bold tracking-[0.4em] uppercase">Registro de
                    Operaciones</Text>
            </View>

            {/* BUSCADOR */}
            <View className="px-6 mb-4">
                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                    <IconSymbol name="magnifyingglass" size={20} color="#94A3B8"/>
                    <TextInput
                        placeholder="Buscar ticket"
                        placeholderTextColor="#94A3B8"
                        className="flex-1 ml-3 text-fiber-dark font-semibold"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <IconSymbol name="xmark.circle.fill" size={20} color="#CBD5E1"/>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* FILTROS DE ESTADO DE TICKEt*/}
            <View className="mb-4">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{paddingHorizontal: 24}}
                >
                    {/*Todos los estados de los tiquets*/}
                    {/*Se mapean y se crean un boton*/}
                    {(['Todos', 'Terminado', 'Cancelado', 'Pendiente', 'En Proceso'] as const).map((status) => (
                        <TouchableOpacity
                            key={status}
                            onPress={() => setStatusFilter(status)}
                            className={`px-6 py-3 rounded-full mr-3 border ${
                                statusFilter === status
                                    ? 'bg-fiber-blue '
                                    : 'bg-white '
                            }`}
                        >
                            <Text
                                className={`text-sm font-bold ${
                                    statusFilter === status ? 'text-white' : 'text-black'}`}>
                                {status === 'Todos' ? 'Todos' : status}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* ORDENAR POR FECHA */}
            <View className="px-6 mb-4 ml-5 flex-row items-center">
                <Text className="text-xs font-bold items-center uppercase text-gray-400 mr-3">Ordenar por fecha:</Text>
                <TouchableOpacity
                    onPress={() => setSortOrder('reciente')}
                    className={`flex-row items-center px-5 py-3 rounded-full border mr-2 ${sortOrder === 'reciente' ? 'bg-fiber-blue' : 'bg-gray-50'}`}
                >
                    <Text
                        className={`ml-2 text-sm font-bold ${sortOrder === 'reciente' ? 'text-white' : 'text-black'}`}>Reciente</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setSortOrder('antiguo')}
                    className={`flex-row items-center  px-5 py-3 rounded-full border ${sortOrder === 'antiguo' ? 'bg-fiber-blue' : 'bg-gray-50'}`}
                >
                    <Text
                        className={`ml-2 text-sm font-bold ${sortOrder === 'antiguo' ? 'text-white' : 'text-black'}`}>Antiguo</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6">
                {filteredHistory.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        onPress={() => setSelectedTicket(item)}
                        activeOpacity={0.7}
                        className="bg-white rounded-3xl p-6 mb-4 shadow-sm border border-gray-100 flex-row items-center"
                    >
                        <View className={`h-12 w-12 rounded-2xl items-center justify-center mr-4 ${
                            item.estado === 'Terminado' ? 'bg-green-50' :
                                item.estado === 'Cancelado' ? 'bg-red-50' :
                                    'bg-yellow-50'
                        }`}>
                            <IconSymbol
                                name={item.estado === 'Terminado' ? "checkmark.circle.fill" : "exclamationmark.triangle.fill"}
                                size={24}
                                color={item.estado === 'Terminado' ? "#22C55E" : "#DC2626"}
                            />
                        </View>
                        <View className="flex-1">
                            <Text
                                className="text-fiber-dark font-black text-xl tracking-tight">#{item.numero_ticket}</Text>
                            <Text className="text-gray-400 text-xs font-bold uppercase">{item.fecha_creacion}</Text>
                        </View>
                        <IconSymbol name="chevron.right" size={20} color="#CBD5E1"/>
                    </TouchableOpacity>
                ))}
                <View className="h-20"/>
            </ScrollView>

            {/* MODAL DE DETALLE DE TICKET */}
            <Modal
                animationType="fade"
                transparent
                visible={!!selectedTicket}
            >
                <View className="flex-1 justify-center items-center bg-black/50 px-6">
                    <View className="bg-white w-full rounded-[40px] p-8 shadow-2xl">
                        {selectedTicket && (
                            <>
                                <View className="flex-row justify-between items-start mb-6">
                                    <View>
                                        <Text
                                            className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Detalle
                                            del Ticket</Text>
                                        <Text
                                            className="text-fiber-blue text-4xl font-black tracking-tighter">#{selectedTicket.numero_ticket}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => setSelectedTicket(null)}
                                                      className="bg-gray-100 p-2 rounded-full">
                                        <IconSymbol name="close" size={20} color="#64748B"/>
                                    </TouchableOpacity>
                                </View>

                                {/* Estado */}
                                <View
                                    className={`self-start px-4 py-2 rounded-full mb-8 ${selectedTicket.estado === 'Terminado' ? 'bg-green-100' : 'bg-red-100'}`}>
                                    <Text
                                        className={`font-black text-xs ${selectedTicket.estado === 'Terminado' ? 'text-green-700' : 'text-red-700'}`}>
                                        {selectedTicket.estado}
                                    </Text>
                                </View>

                                {/* Info Grid */}
                                <View className="flex-row flex-wrap gap-y-6 mb-8">
                                    <View className="w-1/2 pr-2">
                                        <View className="flex-row items-center mb-1">
                                            <IconSymbol name="calendar" size={16} color="#94A3B8"/>
                                            <Text
                                                className="text-gray-400 font-bold text-[10px] uppercase ml-1">Fecha</Text>
                                        </View>
                                        <Text
                                            className="text-fiber-dark font-bold text-sm">{selectedTicket.fecha_creacion}</Text>
                                    </View>

                                    <View className="w-1/2 pl-2">
                                        <View className="flex-row items-center mb-1">
                                            <IconSymbol name="clock.fill" size={16} color="#94A3B8"/>
                                            <Text
                                                className="text-gray-400 font-bold text-[10px] uppercase ml-1">Horario</Text>
                                        </View>
                                        <Text
                                            className="text-fiber-dark font-bold text-sm">{selectedTicket.fecha_inicio} - {selectedTicket.fecha_cierre}</Text>
                                    </View>

                                    <View className="w-full">
                                        <View className="flex-row items-center mb-1">
                                            <IconSymbol name="location.fill" size={16} color="#94A3B8"/>
                                            <Text
                                                className="text-gray-400 font-bold text-[10px] uppercase ml-1">Ubicación</Text>
                                        </View>
                                        {selectedTicket.latitud && selectedTicket.longitud ? (
                                            <Text className="text-gray-400 text-xs mt-1 font-mono">
                                                {selectedTicket.latitud}, {selectedTicket.longitud}
                                            </Text>
                                        ) : (
                                            <Text className="text-gray-400 text-xs mt-1 italic">
                                                Ubicación no registrada
                                            </Text>
                                        )}
                                    </View>
                                </View>

                                {/* Notas */}
                                <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <Text className="text-gray-400 font-bold text-[10px] uppercase mb-2">Notas /
                                        Incidencias</Text>
                                    <Text
                                        className="text-fiber-blue font-medium italic">{selectedTicket.descripcion}</Text>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}
