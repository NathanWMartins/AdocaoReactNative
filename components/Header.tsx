import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import UserMenu from './UserMenu';

interface HeaderProps {
    title: string;
    menuVisible: boolean;
    onToggleMenu: () => void;
    onDismissMenu: () => void;
    onEditProfile: () => void;
    onFavorites: () => void;
    onAdopteds: () => void;
    onToggleTheme: () => void;
    isDarkTheme: boolean;
    onLogout: () => void;
}

export default function Header({
    title,
    menuVisible,
    onToggleMenu,
    onDismissMenu,
    onEditProfile,
    onFavorites,
    onAdopteds,
    onToggleTheme,
    isDarkTheme,
    onLogout,
}: HeaderProps) {
    const theme = useTheme();

    return (
        <View style={[styles.header, {
            backgroundColor: theme.colors.surface, 
            borderBottomColor: theme.dark ? '#333' : '#e0e0e0'
        }]}>
            <View style={styles.logoContainer}>
                <View style={[styles.iconContainer, { borderColor: theme.colors.primary }]}>
                    <Icon name="dog" size={28} color={theme.colors.primary} />
                </View>
                <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                    {title}
                </Text>
            </View>

            <UserMenu
                visible={menuVisible}
                onDismiss={onDismissMenu}
                onToggleVisible={onToggleMenu}
                onEditProfile={onEditProfile}
                onFavorites={onFavorites}
                onAdopteds={onAdopteds}
                onToggleTheme={onToggleTheme}
                isDarkTheme={isDarkTheme}
                onLogout={onLogout}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(38, 184, 181, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});