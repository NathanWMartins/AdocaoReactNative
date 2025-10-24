import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Modal,
} from 'react-native';
import { useTheme, Snackbar } from 'react-native-paper';
import {
    getDoc,
    doc,
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    deleteDoc,
} from 'firebase/firestore';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { deleteUser, signOut } from 'firebase/auth';
import Header from '../components/Header';
import { useThemeContext } from '../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { auth, db } from '../firebaseConfig';

export default function EditProfile({ navigation }) {
    const theme = useTheme();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [reason, setReason] = useState('');
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);
    const { toggleTheme, isDarkTheme } = useThemeContext();
    const [dogImage, setDogImage] = useState('');

    useEffect(() => {
        const carregarDados = async () => {
            const user = auth.currentUser;
            if (user) {
                const docRef = doc(db, 'usuarios', user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setName(data.nome || '');
                    setPhone(data.telefone || '');
                    setEmail(user.email || '');
                    setAddress(data.endereco || '');
                    setCity(data.cidade || '');
                    setState(data.estado || '');
                    setReason(data.motivo || '');

                }
            }
        };

        carregarDados();
    }, []);

    useEffect(() => {
        fetchRandomDog();
    }, []);

    const fetchRandomDog = async () => {
        try {
            const response = await axios.get('https://dog.ceo/api/breeds/image/random');
            setDogImage(response.data.message);
        } catch (error) {
            console.error('Erro ao buscar imagem do cachorro:', error);
        }
    };

    const handleSave = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            await updateDoc(doc(db, 'usuarios', user.uid), {
                nome: name,
                telefone: phone,
                endereco: address,
                cidade: city,
                estado: state,
                motivo: reason,
            });
            setSnackbarMessage('Dados salvos com sucesso.');
            setSnackbarVisible(true);
        } catch (error) {
            console.error('Erro ao salvar:', error.message);
        }
    };

    const handleDelete = async () => {
        try {
            setLoadingDelete(true);
            const user = auth.currentUser;
            if (!user) {
                alert('Nenhum usuário autenticado.');
                setLoadingDelete(false);
                setConfirmVisible(false);
                return;
            }

            const uid = user.uid;

            const favQuery = query(collection(db, 'favorites'), where('uid', '==', uid));
            const favSnapshot = await getDocs(favQuery);
            const favDeletions = favSnapshot.docs.map((docFav) => deleteDoc(doc(db, 'favorites', docFav.id)));
            await Promise.all(favDeletions);

            const adoptedQuery = query(collection(db, 'adotados'), where('uid', '==', uid));
            const adoptedSnapshot = await getDocs(adoptedQuery);
            const adoptedDeletions = adoptedSnapshot.docs.map((docAdopted) => deleteDoc(doc(db, 'adopteds', docAdopted.id)));
            await Promise.all(adoptedDeletions);

            await deleteDoc(doc(db, 'usuarios', uid));

            await deleteUser(user);

            setLoadingDelete(false);
            setConfirmVisible(false);
            setSnackbarVisible(true);

            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            console.error('Erro ao excluir conta:', error);
            alert('Não foi possível excluir a conta. Faça login novamente e tente.');
            setLoadingDelete(false);
            setConfirmVisible(false);
        }
    };

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
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={{
                    padding: 20,
                    paddingBottom: 70,
                    maxWidth: 800,
                    alignSelf: 'center',
                    width: '100%',
                }}>
                    <Text style={[styles.title, { color: theme.colors.onBackground }]}>
                        Editar Perfil
                    </Text>

                    <View style={styles.row}>
                        <View style={styles.column}>
                            <View style={[styles.inputContainer, {
                                borderColor: theme.colors.outline,
                                backgroundColor: theme.colors.surface
                            }]}>
                                <Icon name="account" size={20} color={theme.colors.outline} style={styles.icon} />
                                <TextInput
                                    style={[styles.input, { color: theme.colors.onSurface }]}
                                    placeholder="Nome"
                                    placeholderTextColor={theme.colors.outline}
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                        </View>

                        <View style={styles.column}>
                            <View style={[styles.inputContainer, {
                                borderColor: theme.colors.outline,
                                backgroundColor: theme.colors.surfaceVariant,
                            }]}>
                                <Icon name="email" size={20} color={theme.colors.outline} style={styles.icon} />
                                <TextInput
                                    style={[styles.input, { color: theme.colors.onSurface }]}
                                    placeholder="E-mail"
                                    placeholderTextColor={theme.colors.outline}
                                    value={email}
                                    editable={false}
                                />
                            </View>
                        </View>

                        <View style={styles.column}>
                            <View style={[styles.inputContainer, {
                                borderColor: theme.colors.outline,
                                backgroundColor: theme.colors.surface
                            }]}>
                                <Icon name="phone" size={20} color={theme.colors.outline} style={styles.icon} />
                                <TextInput
                                    style={[styles.input, { color: theme.colors.onSurface }]}
                                    placeholder="Telefone"
                                    placeholderTextColor={theme.colors.outline}
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.column}>
                            <View style={[styles.inputContainer, {
                                borderColor: theme.colors.outline,
                                backgroundColor: theme.colors.surface
                            }]}>
                                <Icon name="map-marker" size={20} color={theme.colors.outline} style={styles.icon} />
                                <TextInput
                                    style={[styles.input, { color: theme.colors.onSurface }]}
                                    placeholder="Cidade"
                                    placeholderTextColor={theme.colors.outline}
                                    value={city}
                                    onChangeText={setCity}
                                />
                            </View>
                        </View>

                        <View style={styles.column}>
                            <View style={[styles.inputContainer, {
                                borderColor: theme.colors.outline,
                                backgroundColor: theme.colors.surface
                            }]}>
                                <Icon name="home" size={20} color={theme.colors.outline} style={styles.icon} />
                                <TextInput
                                    style={[styles.input, { color: theme.colors.onSurface }]}
                                    placeholder="Endereço"
                                    placeholderTextColor={theme.colors.outline}
                                    value={address}
                                    onChangeText={setAddress}
                                />
                            </View>
                        </View>

                        <View style={styles.column}>
                            <View style={[styles.inputContainer, {
                                borderColor: theme.colors.outline,
                                backgroundColor: theme.colors.surface
                            }]}>
                                <Icon name="earth" size={20} color={theme.colors.outline} style={styles.icon} />
                                <TextInput
                                    style={[styles.input, { color: theme.colors.onSurface }]}
                                    placeholder="Estado"
                                    placeholderTextColor={theme.colors.outline}
                                    value={state}
                                    onChangeText={setState}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={[styles.inputContainer, {
                        borderColor: theme.colors.outline,
                        backgroundColor: theme.colors.surface,
                        marginBottom: 16,
                    }]}>
                        <Icon name="heart" size={20} color={theme.colors.outline} style={styles.icon} />
                        <TextInput
                            style={[styles.textArea, { color: theme.colors.onSurface }]}
                            placeholder="Por que você quer adotar um cão?"
                            placeholderTextColor={theme.colors.outline}
                            value={reason}
                            onChangeText={setReason}
                            multiline
                        />
                    </View>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: '#26b8b5', flex: 1 }]}
                            onPress={handleSave}
                        >
                            <Icon name="check" size={20} color="#fff" style={styles.buttonIcon} />
                            <Text style={styles.buttonText}>Salvar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.button,
                                {
                                    backgroundColor: theme.colors.surface,
                                    borderWidth: 1,
                                    borderColor: theme.colors.outline,
                                    flex: 1,
                                },
                            ]}
                            onPress={() => navigation.goBack()}
                        >
                            <Icon name="close" size={20} color={theme.colors.onSurface} style={styles.buttonIcon} />
                            <Text style={[styles.buttonText, { color: theme.colors.onSurface }]}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.deleteButton, { flex: 1 }]}
                            onPress={handleDelete}
                            disabled={loadingDelete}
                        >
                            <Icon name="delete" size={20} color="white" style={styles.buttonIcon} />
                            <Text style={styles.deleteButtonText}>
                                {loadingDelete ? 'Excluindo...' : 'Excluir'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                <Snackbar
                    visible={snackbarVisible}
                    onDismiss={() => setSnackbarVisible(false)}
                    duration={3000}
                    style={{ marginBottom: 20 }}
                >
                    {snackbarMessage}
                </Snackbar>
            </KeyboardAvoidingView>
        </>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    column: {
        flex: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
    },
    icon: {
        padding: 12,
        paddingLeft: 16,
    },
    input: {
        flex: 1,
        height: 52,
        paddingHorizontal: 12,
        fontSize: 15,
        borderWidth: 0,
    },
    textArea: {
        flex: 1,
        height: 100,
        paddingHorizontal: 12,
        paddingTop: 12,
        fontSize: 15,
        borderWidth: 0,
        textAlignVertical: 'top',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    button: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },
    deleteButton: {
        backgroundColor: 'red',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    deleteButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 24,
    }
});
