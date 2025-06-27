import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

interface DogInfoProps {
    name: string;
    breed: string;
    age: number;
    gender: string;
}

export default function DogInfo({ name, breed, age, gender }: DogInfoProps) {
    const theme = useTheme();

    return (
        <View style={styles.infoContainer}>
            <Text style={[styles.name, { color: theme.colors.onSurface }]}>Nome: {name}</Text>
            <Text style={[styles.detail, { color: theme.colors.onSurface }]}>Raça: {breed}</Text>
            <Text style={[styles.detail, { color: theme.colors.onSurface }]}>Idade: {age} anos</Text>
            <Text style={[styles.detail, { color: theme.colors.onSurface }]}>Sexo: {gender}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    infoContainer: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    detail: {
        fontSize: 14,
    },
});
