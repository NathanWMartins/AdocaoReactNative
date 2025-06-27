import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider, useThemeContext } from './contexts/ThemeContext';
import Home from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';
import EditProfile from './screens/EditarPerfil';
import MyFavorites from './screens/MyFavorites';
import MyAdoptions from './screens/MyAdoptions';
import { store } from './redux/store';
import { Provider as ReduxProvider } from 'react-redux';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home';
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Favorites') iconName = 'star';
          else if (route.name === 'Adopteds') iconName = 'pets';
          else if (route.name === 'Edit') iconName = 'edit';
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Favorites" component={MyFavorites} />
      <Tab.Screen name="Adopteds" component={MyAdoptions} />
      <Tab.Screen name="Edit" component={EditProfile} />
    </Tab.Navigator>
  );
}
const Stack = createNativeStackNavigator();

function AppWithTheme() {
  const { paperTheme, navigationTheme } = useThemeContext();
  const [usuarioLogado, setUsuarioLogado] = React.useState(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuarioLogado(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {usuarioLogado ? (
            <Stack.Screen name="MainTabs" component={MainTabs} />
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider>
        <AppWithTheme />
      </ThemeProvider>
    </ReduxProvider>
  );
}
