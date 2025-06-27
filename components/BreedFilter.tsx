import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'react-native-paper';

interface BreedFilterProps {
    breeds: string[];
    selectedBreed: string | null;
    onSelect: (breed: string) => void;
    onClear: () => void;
}

export default function BreedFilter({
    breeds,
    selectedBreed,
    onSelect,
    onClear,
}: BreedFilterProps) {
    const theme = useTheme();

    return (
        <View style={{ marginBottom: 16 }}>
            <Text style={{ color: theme.colors.onBackground, fontWeight: 'bold' }}>
                Filtrar por raça:
            </Text>

            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={breeds}
                keyExtractor={(item) => item}
                contentContainerStyle={{ marginTop: 8 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => onSelect(item)}
                        style={{
                            backgroundColor: item === selectedBreed ? theme.colors.primary : '#ccc',
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 20,
                            marginRight: 8,
                        }}
                    >
                        <Text style={{ color: item === selectedBreed ? '#fff' : '#000' }}>{item}</Text>
                    </TouchableOpacity>
                )}
            />

            {selectedBreed && (
                <TouchableOpacity onPress={onClear} style={{ marginTop: 10 }}>
                    <Text style={{ color: theme.colors.primary }}>Limpar filtro</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}
