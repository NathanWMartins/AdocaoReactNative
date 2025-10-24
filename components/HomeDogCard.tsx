import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

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
    const [isHovered, setIsHovered] = useState(false);

    const cardStyle = {
        ...styles.card,
        backgroundColor: theme.colors.surface,
        transform: [{ scale: isHovered ? 1.02 : 1 }],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: isHovered ? 4 : 2 },
        shadowOpacity: isHovered ? 0.25 : 0.1,
        shadowRadius: isHovered ? 8 : 4,
        elevation: isHovered ? 8 : 3,
    };

    const favoriteButtonStyle = {
        ...styles.favoriteButton,
        backgroundColor: isHovered ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)',
    };

    const adoptButtonStyle = {
        ...styles.adoptButton,
        backgroundColor: theme.colors.primary,
        transform: [{ scale: isHovered ? 1.05 : 1 }],
    };

    return (
        <View 
            style={cardStyle}
            {...(Platform.OS === 'web' ? {
                onMouseEnter: () => setIsHovered(true),
                onMouseLeave: () => setIsHovered(false),
            } : {})}
        >
            <View style={styles.imageContainer}>
                <Image source={{ uri: dog.imageUrl }} style={styles.image} />
                <TouchableOpacity 
                    style={favoriteButtonStyle} 
                    onPress={onToggleFavorite}
                >
                    <MaterialIcons
                        name={isFavorite ? 'favorite' : 'favorite-border'}
                        size={20}
                        color={isFavorite ? '#ff4757' : '#fff'}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.infoContainer}>
                <Text style={[styles.name, { color: theme.colors.onSurface }]}>
                    {dog.name}
                </Text>
                <Text style={[styles.breed, { color: theme.colors.onSurface }]}>
                    {dog.breed}
                </Text>
                <View style={styles.details}>
                    <Text style={[styles.detail, { color: theme.colors.onSurface }]}>
                        {dog.age} anos
                    </Text>
                    <Text style={[styles.detail, { color: theme.colors.onSurface }]}>
                        {dog.gender}
                    </Text>
                </View>
            </View>

            <TouchableOpacity 
                style={adoptButtonStyle} 
                onPress={onAdopt}
            >
                <Text style={styles.adoptButtonText}>Adotar</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 220,
        borderRadius: 12,
        padding: 12,
        margin: 6,
        elevation: 3,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        alignItems: 'center',
    },
    imageContainer: {
        position: 'relative',
        marginBottom: 8,
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 8,
    },
    favoriteButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContainer: {
        alignItems: 'center',
        marginBottom: 8,
        width: '100%',
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        textAlign: 'center',
    },
    breed: {
        fontSize: 12,
        marginBottom: 4,
        textAlign: 'center',
        opacity: 0.8,
    },
    details: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    detail: {
        fontSize: 11,
        opacity: 0.7,
    },
    adoptButton: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 6,
        width: '100%',
        alignItems: 'center',
    },
    adoptButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
});