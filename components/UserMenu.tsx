import React from 'react';
import { Menu } from 'react-native-paper';
import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

interface UserMenuProps {
    visible: boolean;
    onDismiss: () => void;
    onToggleVisible: () => void;
    onEditProfile: () => void;
    onFavorites: () => void;
    onAdopteds: () => void;
    onToggleTheme: () => void;
    isDarkTheme: boolean;
    onLogout: () => void;
}

export default function UserMenu({
    visible,
    onDismiss,
    onToggleVisible,
    onEditProfile,
    onFavorites,
    onAdopteds,
    onToggleTheme,
    isDarkTheme,
    onLogout,
}: UserMenuProps) {
    const theme = useTheme();

    return (
        <Menu
            visible={visible}
            onDismiss={onDismiss}
            anchor={
                <TouchableOpacity onPress={onToggleVisible}>
                    <MaterialIcons name="account-circle" size={32} color={theme.colors.onBackground} />
                </TouchableOpacity>
            }
        >
            <Menu.Item onPress={onEditProfile} title="Editar perfil" />
            <Menu.Item onPress={onFavorites} title="Meus Favoritos" />
            <Menu.Item onPress={onAdopteds} title="Minhas Adoções" />
            <Menu.Item onPress={onToggleTheme} title={isDarkTheme ? 'Modo claro' : 'Modo escuro'} />
            <Menu.Item
                titleStyle={{ color: 'red', fontWeight: 'bold' }}
                onPress={onLogout}
                title="Sair"
            />
        </Menu>
    );
}
