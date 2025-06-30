import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Snackbar, useTheme } from 'react-native-paper';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs, query, where, deleteDoc, doc, addDoc, getDoc } from 'firebase/firestore';
import { useThemeContext } from '../contexts/ThemeContext';
import { signOut } from 'firebase/auth';
import { RootState } from '../redux/store';
import { useSelector } from 'react-redux';
import { decrementarFavoritos, incrementarAdotados, setFavoritos } from '../redux/contadorSlice';
import { useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import AdoptButton from '../components/AdoptButton';
import UserMenu from '../components/UserMenu';
import LoadingIndicator from '../components/LoadingIndicator';

interface FavoriteItem {
    id: string;
    dogId: string;
    imageUrl: string;
    breed: string;
    name: string;
    gender: string;
    age: number;
}

export default function MyFavorites({ navigation }) {
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);
    const theme = useTheme();
    const { toggleTheme, isDarkTheme } = useThemeContext();
    const dispatch = useDispatch();
    const favoritos = useSelector((state: RootState) => state.contador.favoritos);

    const fetchFavorites = async () => {
        const user = auth.currentUser;
        if (!user) return;

        setLoading(true);
        try {
            const q = query(collection(db, 'favorites'), where('uid', '==', user.uid));
            const querySnapshot = await getDocs(q);

            const data: FavoriteItem[] = [];

            for (const docSnap of querySnapshot.docs) {
                const favorite = docSnap.data();
                const dogId = favorite.dogId;

                const dogRef = doc(db, 'cachorros', dogId);
                const dogSnap = await getDoc(dogRef);

                if (dogSnap.exists()) {
                    const dogData = dogSnap.data();

                    data.push({
                        id: docSnap.id,
                        imageUrl: dogData.imageUrl,
                        breed: dogData.breed,
                        dogId,
                        name: dogData.name,
                        gender: dogData.gender,
                        age: dogData.age,
                    });
                }
            }
            setFavorites(data);
            dispatch(setFavoritos(data.length));
        } catch (error) {
            console.error('Erro ao buscar favoritos:', error);
        } finally {
            setLoading(false);
        }
    };

    const removerFavorito = async (itemId: string) => {
        try {
            await deleteDoc(doc(db, 'favorites', itemId));
            setFavorites((prev) => prev.filter((item) => item.id !== itemId));
            dispatch(decrementarFavoritos());
            setSnackbarMessage('Removido dos favoritos!');
            setSnackbarVisible(true);
        } catch (error) {
            console.error('Erro ao remover favorito:', error);
        }
    };

    const adotarCachorro = async (dog: FavoriteItem) => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            // Busca os dados do perfil
            const docRef = doc(db, 'usuarios', user.uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                setSnackbarMessage('Erro ao buscar dados do perfil.');
                setSnackbarVisible(true);
                return;
            }

            const dados = docSnap.data();
            const camposObrigatorios = ['nome', 'telefone', 'endereco', 'cidade', 'estado', 'motivo'];
            const camposFaltando = camposObrigatorios.filter(campo => !dados[campo]);

            if (camposFaltando.length > 0) {
                setSnackbarMessage('Preencha todos os dados do perfil antes de adotar um cachorro.');
                setSnackbarVisible(true);
                return;
            }

            // Prossegue com a adoção
            await deleteDoc(doc(db, 'favorites', dog.id));

            await addDoc(collection(db, 'adotados'), {
                uid: user.uid,
                dogId: dog.dogId,
                adoptedAt: new Date(),
            });

            setFavorites((prev) => prev.filter((item) => item.id !== dog.id));
            dispatch(incrementarAdotados());
            setSnackbarMessage('Adoção registrada com sucesso!');
            setSnackbarVisible(true);
        } catch (error) {
            console.error('Erro ao registrar adoção:', error);
            setSnackbarMessage('Erro ao registrar adoção');
            setSnackbarVisible(true);
        }
    };


    useFocusEffect(
        useCallback(() => {
            fetchFavorites();
        }, [])
    );


    const renderItem = ({ item }: { item: FavoriteItem }) => (
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <View style={styles.infoContainer}>
                <Text style={[styles.name, { color: theme.colors.onSurface }]}>Nome: {item.name}</Text>
                <Text style={[styles.breed, { color: theme.colors.onSurface }]}>Raça: {item.breed}</Text>
                <Text style={[styles.detail, { color: theme.colors.onSurface }]}>Idade: {item.age} anos</Text>
                <Text style={[styles.detail, { color: theme.colors.onSurface }]}>Sexo: {item.gender}</Text>
                <View style={styles.buttons}>
                    <AdoptButton onPress={() => adotarCachorro(item)} />

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#ccc' }]}
                        onPress={() => removerFavorito(item.id)}
                    >
                        <Text style={styles.buttonText}>Remover</Text>
                    </TouchableOpacity>
                </View>
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
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.onBackground }]}>🐾 Meus Favoritos</Text>
                <UserMenu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    onToggleVisible={() => setMenuVisible(true)}
                    onEditProfile={() => navigation.navigate('Edit')}
                    onFavorites={() => navigation.navigate('Favorites')}
                    onAdopteds={() => navigation.navigate('Adopteds')}
                    onToggleTheme={toggleTheme}
                    isDarkTheme={isDarkTheme}
                    onLogout={logout}
                />
            </View>

            <Text style={{ color: theme.colors.onBackground, fontSize: 16, marginTop: 4 }}>
                Total de Favoritos: {favoritos}
            </Text>

            {loading ? (
                <LoadingIndicator />
            ) : (
                <FlatList
                    data={favorites}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                style={{ marginBottom: 20 }}
            >
                {snackbarMessage}
            </Snackbar>

        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    container: {
        flex: 1,
        padding: 16,
        paddingTop: 50,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    card: {
        flexDirection: 'row',
        marginBottom: 16,
        borderRadius: 12,
        padding: 10,
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
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    breed: {
        fontSize: 15,
        marginBottom: 4,
    },
    detail: {
        fontSize: 14,
        marginBottom: 2,
    },
    buttons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    button: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
