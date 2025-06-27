import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import AdoptButton from './AdoptButton';
import DogInfo from './DogInfo';

interface DogItem {
    id: string;
    imageUrl: string;
    breed: string;
    age: number;
    name: string;
    gender: 'Macho' | 'Fêmea';
}

interface DogCardProps {
    dog: DogItem;
    isFavorite: boolean;
    onToggleFavorite: () => void;
    onAdopt: () => void;
}

export default function DogCard({
    dog,
    isFavorite,
    onToggleFavorite,
    onAdopt,
}: DogCardProps) {
    const theme = useTheme();

    return (
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Image source={{ uri: dog.imageUrl }} style={styles.image} />

            <DogInfo
                name={dog.name}
                breed={dog.breed}
                age={dog.age}
                gender={dog.gender}
            />

            <View style={styles.actions}>
                <TouchableOpacity style={styles.iconButton} onPress={onToggleFavorite}>
                    <MaterialIcons
                        name={isFavorite ? 'star' : 'star-border'}
                        size={24}
                        color={isFavorite ? 'yellow' : '#26b8b5'}
                    />
                </TouchableOpacity>

                <AdoptButton onPress={onAdopt} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
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
    actions: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: '100%',
        marginLeft: 12,
    },
    iconButton: {
        padding: 4,
    },
});
