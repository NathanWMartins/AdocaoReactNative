import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    ListRenderItem,
    StyleSheet,
} from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { Menu, useTheme, Snackbar } from 'react-native-paper';
import { useThemeContext } from '../contexts/ThemeContext';
import { auth, db } from '../firebaseConfig';
import { addDoc, collection, setDoc, doc, getDoc, deleteDoc, getDocs, where, query } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { incrementarAdotados } from '../redux/contadorSlice';
import DogCard from '../components/HomeDogCard';
import UserMenu from '../components/UserMenu';
import BreedFilter from '../components/BreedFilter';
import LoadingIndicator from '../components/LoadingIndicator';

interface DogItem {
    id: string;
    imageUrl: string;
    breed: string;
    age: number;
    name: string;
    gender: 'Macho' | 'Fêmea';
}

export default function Home({ navigation }) {
    const [dogs, setDogs] = useState<DogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [menuVisible, setMenuVisible] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [allDogs, setAllDogs] = useState<DogItem[]>([]);
    const [selectedBreed, setSelectedBreed] = useState<string | null>(null);
    const [availableBreeds, setAvailableBreeds] = useState<string[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const { toggleTheme, isDarkTheme } = useThemeContext();
    const theme = useTheme();
    const dispatch = useDispatch();

    useEffect(() => {
        fetchDogs();
    }, []);

    const fetchDogs = async () => {
        try {
            setLoading(true);

            const user = auth.currentUser;
            if (!user) return;

            // Buscar raças disponíveis
            const breedsRes = await axios.get('https://dog.ceo/api/breeds/list/all');
            const breeds = Object.keys(breedsRes.data.message);
            setAvailableBreeds(breeds);

            // Buscar dogs já adotados pelo usuário
            const adotadosSnapshot = await getDocs(
                query(collection(db, 'adotados'), where('uid', '==', user.uid))
            );
            const adotadosIds = adotadosSnapshot.docs.map(doc => doc.data().dogId);

            const dogsArray: DogItem[] = [];

            // Gerar 30 cães aleatórios
            for (let i = 0; i < 30; i++) {
                const randomBreed = breeds[Math.floor(Math.random() * breeds.length)];
                const imgRes = await axios.get(`https://dog.ceo/api/breed/${randomBreed}/images/random`);

                const dog: DogItem = {
                    id: `${sanitizeId(imgRes.data.message)}-${i}`,
                    imageUrl: imgRes.data.message,
                    breed: randomBreed,
                    age: Math.floor(Math.random() * 9) + 2,
                    name: generateRandomName(),
                    gender: getRandomGender(),
                };

                // Pula se já está adotado
                if (adotadosIds.includes(dog.id)) continue;

                // Salva no Firestore se ainda não existir
                const dogRef = doc(db, 'cachorros', dog.id);
                const docSnap = await getDoc(dogRef);
                if (!docSnap.exists()) {
                    await setDoc(dogRef, {
                        breed: dog.breed,
                        age: dog.age,
                        imageUrl: dog.imageUrl,
                        name: dog.name,
                        gender: dog.gender,
                        createdAt: new Date(),
                    });
                }

                dogsArray.push(dog);
            }

            setAllDogs(dogsArray);
            setDogs(dogsArray);
        } catch (err) {
            console.error('Erro ao buscar cães:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDogsByBreed = async (breed: string) => {
        try {
            setLoading(true);

            const user = auth.currentUser;
            if (!user) return;

            // Buscar dogs já adotados pelo usuário
            const adotadosSnapshot = await getDocs(
                query(collection(db, 'adotados'), where('uid', '==', user.uid))
            );
            const adotadosIds = adotadosSnapshot.docs.map(doc => doc.data().dogId);

            const dogsArray: DogItem[] = [];

            for (let i = 0; i < 5; i++) {
                const imgRes = await axios.get(`https://dog.ceo/api/breed/${breed}/images/random`);

                const dog: DogItem = {
                    id: `${sanitizeId(imgRes.data.message)}-${i}`,
                    imageUrl: imgRes.data.message,
                    breed: breed,
                    age: Math.floor(Math.random() * 9) + 2,
                    name: generateRandomName(),
                    gender: getRandomGender(),
                };

                // ⚠️ Ignora se já foi adotado
                if (adotadosIds.includes(dog.id)) continue;

                const dogRef = doc(db, 'cachorros', dog.id);
                const docSnap = await getDoc(dogRef);
                if (!docSnap.exists()) {
                    await setDoc(dogRef, {
                        breed: dog.breed,
                        age: dog.age,
                        imageUrl: dog.imageUrl,
                        name: dog.name,
                        gender: dog.gender,
                        createdAt: new Date(),
                    });
                }

                dogsArray.push(dog);
            }

            setDogs(dogsArray);
        } catch (err) {
            console.error('Erro ao buscar cães por raça:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdotar = async (dog: DogItem) => {
        const user = auth.currentUser;
        if (!user) {
            alert('Você precisa estar logado para adotar um cão.');
            return;
        }

        try {
            const dogId = dog.id;

            //Verifica se já está nos favoritos
            const q = query(
                collection(db, 'favorites'),
                where('uid', '==', user.uid),
                where('dogId', '==', dogId)
            );
            const querySnapshot = await getDocs(q);

            //Remove dos favoritos se necessário
            querySnapshot.forEach(async (docFav) => {
                await deleteDoc(doc(db, 'favorites', docFav.id));
            });

            //Adiciona à coleção 'adotados'
            await addDoc(collection(db, 'adotados'), {
                uid: user.uid,
                dogId: dogId,
                adoptedAt: new Date(),
            });

            //Remove localmente da lista
            setDogs((prev) => prev.filter((item) => item.id !== dogId));
            setAllDogs((prev) => prev.filter((item) => item.id !== dogId));
            setFavoriteIds((prev) => prev.filter((id) => id !== dogId));

            //Atualiza Redux
            dispatch(incrementarAdotados());

            //Feedback
            setSnackbarMessage('Cachorro adotado com sucesso!');
            setSnackbarVisible(true);
        } catch (error) {
            console.error('Erro ao adotar:', error);
            alert('Erro ao tentar adotar o cachorro.');
        }
    };

    const toggleFavorito = async (dog: DogItem) => {
        const user = auth.currentUser;
        if (!user) {
            alert('Você precisa estar logado para favoritar um cão.');
            return;
        }

        try {
            const dogId = dog.id;

            if (favoriteIds.includes(dogId)) {
                // Remover dos favoritos
                const q = query(
                    collection(db, 'favorites'),
                    where('uid', '==', user.uid),
                    where('dogId', '==', dogId)
                );
                const querySnapshot = await getDocs(q);

                querySnapshot.forEach(async (docFav) => {
                    await deleteDoc(doc(db, 'favorites', docFav.id));
                });

                setFavoriteIds((prev) => prev.filter((id) => id !== dogId));
                setSnackbarMessage('Removido dos favoritos!');
            } else {
                // Adicionar aos favoritos
                await addDoc(collection(db, 'favorites'), {
                    uid: user.uid,
                    dogId: dogId,
                    timestamp: new Date(),
                });
                setFavoriteIds((prev) => [...prev, dogId]);
                setSnackbarMessage('Adicionado aos favoritos!');
            }

            setSnackbarVisible(true);
        } catch (error) {
            console.error('Erro ao alterar favorito:', error);
            alert('Erro ao alterar favorito.');
        }
    };

    const sanitizeId = (url: string) => {
        return url.replace(/[^a-zA-Z0-9]/g, '-');
    };

    const generateRandomName = () => {
        const names = ['Luna', 'Thor', 'Bella', 'Max', 'Mel', 'Bob', 'Nina', 'Luke',
            'Maya', 'Spike', 'Paçoca', 'Pepita', 'Pandora', 'Piti', 'Omelete', 'Barbie', 'Princesa'];
        return names[Math.floor(Math.random() * names.length)];
    };

    const getRandomGender = (): 'Macho' | 'Fêmea' => (Math.random() < 0.5 ? 'Macho' : 'Fêmea');

    const logout = async () => {
        try {
            await signOut(auth);
            navigation.replace('Login');
        } catch (error) {
            console.error('Erro ao sair:', error);
            alert('Erro ao sair da conta.');
        }
    };

    const renderItem: ListRenderItem<DogItem> = ({ item }) => (
        <DogCard
            dog={item}
            isFavorite={favoriteIds.includes(item.id)}
            onToggleFavorite={() => toggleFavorito(item)}
            onAdopt={() => handleAdotar(item)}
        />
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.onBackground }]}>🐶 Cães para Adoção</Text>

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

            <View style={{ marginBottom: 16 }}>
                <BreedFilter
                    breeds={availableBreeds}
                    selectedBreed={selectedBreed}
                    onSelect={(breed) => {
                        setSelectedBreed(breed);
                        fetchDogsByBreed(breed);
                    }}
                    onClear={() => {
                        setSelectedBreed(null);
                        setDogs(allDogs);
                    }}
                />
            </View>


            {loading ? (
                <LoadingIndicator />
            ) : (
                <FlatList
                    data={dogs}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                />
            )}
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
            >
                {snackbarMessage}
            </Snackbar>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
        paddingHorizontal: 16,
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
    list: {
        gap: 16,
    },
});
