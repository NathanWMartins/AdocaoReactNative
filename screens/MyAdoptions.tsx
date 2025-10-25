import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
} from 'react-native';
import { Snackbar, useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useThemeContext } from '../contexts/ThemeContext';
import { signOut } from 'firebase/auth';
import { useDispatch, useSelector } from 'react-redux';
import { decrementarAdotados, setAdotados } from '../redux/contadorSlice';
import type { RootState } from '../redux/store';
import { useFocusEffect } from '@react-navigation/native';
import LoadingIndicator from '../components/LoadingIndicator';
import Header from '../components/Header';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface AdoptionItem {
    id: string;
    dogId: string;
    imageUrl: string;
    breed: string;
    age: number;
    name: string;
    gender: string;
    adoptedAt: Date;
}

export default function MyAdoptions({ navigation }) {
    const [adoptions, setAdoptions] = useState<AdoptionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedDog, setSelectedDog] = useState<AdoptionItem | null>(null);
    const [editingName, setEditingName] = useState('');
    const dispatch = useDispatch();
    const theme = useTheme();
    const { toggleTheme, isDarkTheme } = useThemeContext();
    const adotados = useSelector((state: RootState) => state.contador.adotados);

    useFocusEffect(
        useCallback(() => {
            fetchAdoptions();
        }, [])
    );

    const fetchAdoptions = async () => {
        const user = auth.currentUser;
        if (!user) return;

        setLoading(true);
        try {
            const q = query(collection(db, 'adotados'), where('uid', '==', user.uid));
            const querySnapshot = await getDocs(q);

            const data: AdoptionItem[] = [];

            for (const docSnap of querySnapshot.docs) {
                const adoption = docSnap.data();
                const dogRef = doc(db, 'cachorros', adoption.dogId);
                const dogSnap = await getDoc(dogRef);

                if (dogSnap.exists()) {
                    const dogData = dogSnap.data();

                    data.push({
                        id: docSnap.id,
                        dogId: adoption.dogId,
                        imageUrl: dogData.imageUrl,
                        breed: dogData.breed,
                        age: dogData.age,
                        name: dogData.name,
                        gender: dogData.gender,
                        adoptedAt: adoption.adoptedAt?.toDate ? adoption.adoptedAt.toDate() : new Date(),
                    });
                }
            }

            setAdoptions(data);
            dispatch(setAdotados(data.length));
        } catch (error) {
            console.error('Erro ao buscar adoções:', error);
        } finally {
            setLoading(false);
        }
    };

    const cancelarAdocao = async () => {
        if (!selectedDog) return;
        try {
            await deleteDoc(doc(db, 'adotados', selectedDog.id));
            setAdoptions((prev) => prev.filter((item) => item.id !== selectedDog.id));
            setSnackbarMessage('Adoção cancelada');
            dispatch(decrementarAdotados());
        } catch (error) {
            console.error('Erro ao cancelar adoção:', error);
            setSnackbarMessage('Erro ao cancelar adoção');
        } finally {
            setModalVisible(false);
            setSnackbarVisible(true);
            setSelectedDog(null);
        }
    };

    const salvarNome = async () => {
        if (!selectedDog) return;
        try {
            const dogRef = doc(db, 'cachorros', selectedDog.dogId);
            await updateDoc(dogRef, { name: editingName });
            setAdoptions((prev) =>
                prev.map((dog) =>
                    dog.dogId === selectedDog.dogId ? { ...dog, name: editingName } : dog
                )
            );
            setSnackbarMessage('Nome atualizado com sucesso');
        } catch (error) {
            console.error('Erro ao atualizar nome:', error);
            setSnackbarMessage('Erro ao atualizar nome');
        } finally {
            setSnackbarVisible(true);
            setEditModalVisible(false);
            setSelectedDog(null);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const renderItem = ({ item }: { item: AdoptionItem }) => (
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                    <Icon name="dog" size={16} color={theme.colors.onSurface} />
                    <Text style={[styles.breed, { color: theme.colors.onSurface, marginLeft: 8 }]}>Nome: {item.name}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Icon name="gender-male-female" size={16} color={theme.colors.onSurface} />
                    <Text style={[styles.detail, { color: theme.colors.onSurface, marginLeft: 8 }]}>Sexo: {item.gender}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Icon name="paw" size={16} color={theme.colors.onSurface} />
                    <Text style={[styles.detail, { color: theme.colors.onSurface, marginLeft: 8 }]}>Raça: {item.breed}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Icon name="cake" size={16} color={theme.colors.onSurface} />
                    <Text style={[styles.detail, { color: theme.colors.onSurface, marginLeft: 8 }]}>Idade: {item.age} anos</Text>
                </View>

                <View style={styles.infoRow}>
                    <Icon name="calendar" size={16} color={theme.colors.onSurface} />
                    <Text style={[styles.detail, { color: theme.colors.onSurface, marginLeft: 8 }]}>Adotado em: {formatDate(item.adoptedAt)}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Icon name="check-circle" size={16} color="#26b8b5" />
                    <Text style={[styles.label, { color: '#26b8b5', marginLeft: 8 }]}>Adotado, cachorro a sua espera</Text>
                </View>

                <View style={styles.infoRow}>
                    <Icon name="phone" size={16} color={theme.colors.primary} />
                    <Text style={[styles.callInfo, { color: theme.colors.primary, marginLeft: 8 }]}>
                        Ligue ou mande mensagem para (48) 99999-8888 para marcar o encontro
                    </Text>
                </View>
            </View>
            <View>
                <TouchableOpacity onPress={() => { setSelectedDog(item); setEditingName(item.name); setEditModalVisible(true); }}>
                    <MaterialIcons name="edit" size={24} color={'#26b8b5'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setSelectedDog(item); setModalVisible(true); }}>
                    <MaterialIcons name="close" size={28} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>
        </View>
    );


    const logout = async () => {
        try {
            await signOut(auth);
            navigation.replace('Login');
        } catch (error) {
            console.error('Erro ao sair:', error);
            alert('Erro ao sair da conta.');
        }
    };

    return (
        <>
            <Header
                title="AdoCão"
                menuVisible={menuVisible}
                onToggleMenu={() => setMenuVisible(true)}
                onDismissMenu={() => setMenuVisible(false)}
                onEditProfile={() => navigation.navigate('Edit')}
                onFavorites={() => navigation.navigate('Favorites')}
                onAdopteds={() => navigation.navigate('Adopteds')}
                onToggleTheme={toggleTheme}
                isDarkTheme={isDarkTheme}
                onLogout={logout}
            />
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.colors.onBackground }]}>Meus Adotados</Text>
                </View>

                <Text style={{ color: theme.colors.onBackground, fontSize: 16, marginTop: 4 }}>
                    Total de adotados: {adotados}
                </Text>

                {loading ? (
                    <LoadingIndicator />
                ) : (
                    <FlatList
                        data={adoptions}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}

                <Modal visible={modalVisible} transparent animationType="fade">
                    <View style={styles.modalBackground}>
                        <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
                            {selectedDog && (
                                <>
                                    <Image source={{ uri: selectedDog.imageUrl }} style={styles.modalImage} />
                                    <Text style={[styles.modalText, { color: theme.colors.onSurface }]}>Você vai mesmo me abandonar?😭</Text>
                                    <View style={styles.modalButtons}>
                                        <TouchableOpacity
                                            style={[styles.modalButton, { backgroundColor: theme.colors.error }]}
                                            onPress={() => setModalVisible(false)}
                                        >
                                            <Text style={styles.buttonText}>Cancelar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.modalButton, { backgroundColor: '#ccc' }]}
                                            onPress={cancelarAdocao}
                                        >
                                            <Text style={styles.buttonText}>Adeus</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </View>
                    </View>
                </Modal>

                <Modal visible={editModalVisible} transparent animationType="fade">
                    <View style={styles.modalBackground}>
                        <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
                            {selectedDog && (
                                <>
                                    <Text style={[styles.modalText, { color: theme.colors.onSurface }]}>Editar nome de {selectedDog.name}</Text>
                                    <TextInput
                                        value={editingName}
                                        onChangeText={setEditingName}
                                        placeholder="Novo nome"
                                        style={{ width: '100%', padding: 8, borderColor: '#ccc', borderWidth: 1, marginBottom: 16, borderRadius: 6, color: theme.colors.onSurface }}
                                    />
                                    <View style={styles.modalButtons}>
                                        <TouchableOpacity
                                            style={[styles.modalButton, { backgroundColor: theme.colors.error }]}
                                            onPress={() => setEditModalVisible(false)}
                                        >
                                            <Text style={styles.buttonText}>Cancelar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                                            onPress={salvarNome}
                                        >
                                            <Text style={styles.buttonText}>Salvar</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </View>
                    </View>
                </Modal>

                <Snackbar
                    visible={snackbarVisible}
                    onDismiss={() => setSnackbarVisible(false)}
                    duration={3000}
                >
                    {snackbarMessage}
                </Snackbar>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
        paddingHorizontal: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    card: {
        flexDirection: 'row',
        borderRadius: 12,
        marginVertical: 8,
        padding: 8,
        alignItems: 'center',
        elevation: 2,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    infoContainer: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    breed: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    detail: {
        fontSize: 14,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 6,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: 300,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    modalImage: {
        width: 150,
        height: 150,
        borderRadius: 8,
        marginBottom: 16,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 16,
        textAlign: 'center',
        fontWeight: '600',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    callInfo: {
        fontSize: 13,
        marginTop: 4,
        fontWeight: 'bold',
    },
});
