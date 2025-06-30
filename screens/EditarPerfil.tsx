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
import { auth, db } from '../firebaseConfig';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { deleteUser } from 'firebase/auth';

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

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 80 }}>
                <Text style={[styles.title, { color: theme.colors.onBackground }]}>
                    Editar Perfil
                </Text>

                <TextInput
                    style={[styles.input, { color: theme.colors.onSurface, borderColor: theme.colors.outline }]}
                    placeholder="Nome"
                    placeholderTextColor={theme.colors.outline}
                    value={name}
                    onChangeText={setName}
                />

                <TextInput
                    style={[
                        styles.input,
                        {
                            color: theme.colors.onSurface,
                            borderColor: theme.colors.outline,
                            backgroundColor: theme.colors.surfaceVariant,
                        },
                    ]}
                    placeholder="E-mail"
                    placeholderTextColor={theme.colors.outline}
                    value={email}
                    editable={false}
                />

                <TextInput
                    style={[styles.input, { color: theme.colors.onSurface, borderColor: theme.colors.outline }]}
                    placeholder="Telefone"
                    placeholderTextColor={theme.colors.outline}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                />

                <TextInput
                    style={[styles.input, { color: theme.colors.onSurface, borderColor: theme.colors.outline }]}
                    placeholder="Endereço"
                    placeholderTextColor={theme.colors.outline}
                    value={address}
                    onChangeText={setAddress}
                />

                <TextInput
                    style={[styles.input, { color: theme.colors.onSurface, borderColor: theme.colors.outline }]}
                    placeholder="Cidade"
                    placeholderTextColor={theme.colors.outline}
                    value={city}
                    onChangeText={setCity}
                />

                <TextInput
                    style={[styles.input, { color: theme.colors.onSurface, borderColor: theme.colors.outline }]}
                    placeholder="Estado"
                    placeholderTextColor={theme.colors.outline}
                    value={state}
                    onChangeText={setState}
                />

                <TextInput
                    style={[styles.input, {
                        height: 100,
                        color: theme.colors.onSurface,
                        borderColor: theme.colors.outline,
                        textAlignVertical: 'top',
                    }]}
                    placeholder="Por que você quer adotar um cão?"
                    placeholderTextColor={theme.colors.outline}
                    value={reason}
                    onChangeText={setReason}
                    multiline
                />

                <View style={styles.buttonGroup}>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#26b8b5' }]}
                        onPress={handleSave}
                    >
                        <Text style={styles.buttonText}>Salvar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.button,
                            {
                                backgroundColor: theme.colors.surface,
                                borderWidth: 1,
                                borderColor: theme.colors.outline,
                            },
                        ]}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={[styles.buttonText, { color: theme.colors.onSurface }]}>Cancelar</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.deleteButton]}
                    onPress={() => setConfirmVisible(true)}
                    disabled={loadingDelete}
                >
                    <Text style={styles.deleteButtonText}>
                        {loadingDelete ? 'Excluindo...' : 'Excluir Conta'}
                    </Text>
                </TouchableOpacity>

                <Modal visible={confirmVisible} transparent animationType="fade">
                    <View style={styles.modalBackground}>
                        <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
                            <Text style={{ fontSize: 18, marginBottom: 20 }}>
                                Tem certeza que deseja excluir sua conta?
                            </Text>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <TouchableOpacity
                                    onPress={() => setConfirmVisible(false)}
                                    style={[styles.modalButton, { backgroundColor: theme.colors.backdrop }]}
                                    disabled={loadingDelete}
                                >
                                    <Text>Cancelar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleDelete}
                                    style={[styles.modalButton, { backgroundColor: 'red' }]}
                                    disabled={loadingDelete}
                                >
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>
                                        {loadingDelete ? 'Excluindo...' : 'Excluir'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                <Snackbar
                    visible={snackbarVisible}
                    onDismiss={() => setSnackbarVisible(false)}
                    duration={3000}
                    action={{
                        label: 'OK',
                    }}
                >
                    {snackbarMessage}
                </Snackbar>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    input: {
        height: 56,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    buttonGroup: {
        marginTop: 16,
        gap: 12,
    },
    button: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    deleteButton: {
        marginTop: 30,
        backgroundColor: 'red',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        width: '80%',
        padding: 20,
        borderRadius: 10,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 10,
        marginHorizontal: 5,
        borderRadius: 8,
        alignItems: 'center',
    },
});
