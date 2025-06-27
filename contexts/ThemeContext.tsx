import React, { createContext, useState, useContext, ReactNode } from 'react';
import {
    MD3DarkTheme as PaperDarkTheme,
    MD3LightTheme as PaperLightTheme,
    MD3Theme,
} from 'react-native-paper';
import {
    DarkTheme as NavigationDarkTheme,
    DefaultTheme as NavigationLightTheme,
    Theme as NavigationTheme,
} from '@react-navigation/native';

interface ThemeContextType {
    toggleTheme: () => void;
    isDarkTheme: boolean;
    paperTheme: MD3Theme;
    navigationTheme: NavigationTheme;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [isDarkTheme, setIsDarkTheme] = useState(false);

    const toggleTheme = () => setIsDarkTheme((prev) => !prev);

    const paperDark: MD3Theme = {
        ...PaperDarkTheme,
        colors: {
            ...PaperDarkTheme.colors,
            background: '#121212',
            surface: '#1E1E1E',
            primary: '#FF6B6B',
            onPrimary: '#ffffff',
            onSurface: '#dddddd',  
            onBackground: '#eeeeee',
        },
    };

    const paperLight: MD3Theme = {
        ...PaperLightTheme,
        colors: {
            ...PaperLightTheme.colors,
            primary: '#FF6B6B',
        },
    };

    const navigationDark: NavigationTheme = {
        ...NavigationDarkTheme,
        colors: {
            ...NavigationDarkTheme.colors,
            background: '#121212',
            card: '#1E1E1E',
            text: '#ffffff',
            border: '#333',
            notification: '#FF6B6B',
            primary: '#FF6B6B',
        },
    };

    const navigationLight: NavigationTheme = {
        ...NavigationLightTheme,
        colors: {
            ...NavigationLightTheme.colors,
            primary: '#FF6B6B',
        },
    };

    return (
        <ThemeContext.Provider
            value={{
                toggleTheme,
                isDarkTheme,
                paperTheme: isDarkTheme ? paperDark : paperLight,
                navigationTheme: isDarkTheme ? navigationDark : navigationLight,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useThemeContext = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context)
        throw new Error('useThemeContext deve ser usado dentro de um ThemeProvider');
    return context;
};
