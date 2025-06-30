import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    TouchableOpacity,
    Platform,
    Alert,
    StyleSheet,
    KeyboardAvoidingView,
    ScrollView,
} from 'react-native';
import { auth } from '../firebaseConfig';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
} from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const db = getFirestore();

const mostrarAlerta = (titulo, mensagem) => {
    if (Platform.OS === 'web') {
        window.alert(`${titulo}\n\n${mensagem}`);
    } else {
        Alert.alert(titulo, mensagem);
    }
};

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const fazerLogin = async () => {
        if (!email || !senha) {
            mostrarAlerta('Erro', 'Preencha e-mail e senha');
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, senha);
        } catch (error) {
            if (error.code === 'auth/invalid-email') {
                mostrarAlerta('Erro', 'E-mail inválido.');
            } else if (error.code === 'auth/user-not-found') {
                mostrarAlerta('Erro', 'Usuário não encontrado.');
            } else if (error.code === 'auth/wrong-password') {
                mostrarAlerta('Erro', 'Senha incorreta.');
            } else {
                mostrarAlerta('Erro', 'Falha ao entrar: ' + error.message);
            }
        }
    };

    const registrar = async () => {
        if (!email || !senha) {
            mostrarAlerta('Erro', 'Preencha e-mail e senha');
            return;
        }

        if (senha.length < 6) {
            mostrarAlerta('Erro', 'A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
            const user = userCredential.user;

            await setDoc(doc(db, 'usuarios', user.uid), {
                email: user.email,
                nome: '',
                telefone: '',
                criadoEm: new Date(),
            });

            mostrarAlerta('Sucesso', 'Conta criada e salva com sucesso!');
        } catch (error) {
            mostrarAlerta('Erro ao registrar', error.message);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Bem-vindo ao AdoCÃO🐶</Text>

                <TextInput
                    placeholder="E-mail"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                    placeholderTextColor="#888"
                />

                <TextInput
                    placeholder="Senha"
                    value={senha}
                    onChangeText={setSenha}
                    secureTextEntry
                    style={styles.input}
                    placeholderTextColor="#888"
                />

                <TouchableOpacity style={styles.loginButton} onPress={fazerLogin}>
                    <Text style={styles.buttonText}>Entrar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.registerButton} onPress={registrar}>
                    <Text style={styles.registerText}>Criar Conta</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        flexGrow: 1,
        justifyContent: 'center',
        backgroundColor: '#121212',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 32,
        textAlign: 'center',
        color: '#ffffff',
    },
    input: {
        height: 50,
        borderColor: '#444',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        marginBottom: 16,
        backgroundColor: '#1e1e1e',
        color: '#fff',
        fontSize: 16,
    },
    loginButton: {
        backgroundColor: '#26b8b5',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 12,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    registerButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    registerText: {
        color: '#26b8b5',
        fontWeight: 'bold',
        fontSize: 15,
    },
});
