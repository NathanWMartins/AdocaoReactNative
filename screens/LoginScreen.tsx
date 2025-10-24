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
    Modal,
} from 'react-native';
import { auth } from '../firebaseConfig';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
} from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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
    const [modalVisible, setModalVisible] = useState(false);
    const [aceitouTermos, setAceitouTermos] = useState(false);

    const fazerLogin = async () => {
        if (!aceitouTermos) {
            mostrarAlerta('Termos obrigatórios', 'Você precisa aceitar os termos para continuar.');
            return;
        }

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
        if (!aceitouTermos) {
            mostrarAlerta('Termos obrigatórios', 'Você precisa aceitar os termos para continuar.');
            return;
        }

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
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Icon name="dog" size={40} color="#26b8b5" />
                    </View>
                    <Text style={styles.title}>Bem-vindo ao AdoCão</Text>
                    <Text style={styles.subtitle}>Encontre seu companheiro ideal</Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>E-mail</Text>
                        <View style={styles.inputWithIcon}>
                            <Icon name="email-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                placeholder="seu@email.com"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                style={styles.input}
                                placeholderTextColor="#666"
                            />
                        </View>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Senha</Text>
                        <View style={styles.inputWithIcon}>
                            <Icon name="lock-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                placeholder="Sua senha"
                                value={senha}
                                onChangeText={setSenha}
                                secureTextEntry
                                style={styles.input}
                                placeholderTextColor="#666"
                            />
                        </View>
                    </View>

                    <TouchableOpacity style={styles.loginButton} onPress={fazerLogin}>
                        <Icon name="login" size={20} color="#fff" style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>Entrar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.registerButton} onPress={registrar}>
                        <Icon name="account-plus" size={20} color="#26b8b5" style={styles.buttonIcon} />
                        <Text style={styles.registerText}>Criar Conta</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.termsContainer}>
                    <Text style={styles.termsText}>
                        Antes de continuar, leia nossos{' '}
                        <Text
                            style={styles.termsLink}
                            onPress={() => setModalVisible(true)}
                        >
                            Termos de Consentimento e Política de Privacidade
                        </Text>
                        .
                    </Text>
                </View>
            </ScrollView>

            <Modal visible={modalVisible} animationType="slide">
                <View style={styles.modalHeader}>
                    <TouchableOpacity
                        style={styles.modalCloseButton}
                        onPress={() => setModalVisible(false)}
                    >
                        <Icon name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>
                        <Icon name="file-document-outline" size={24} color="#26b8b5" />
                        {' '}Termo de Consentimento e Política de Privacidade
                    </Text>
                </View>

                <ScrollView contentContainerStyle={styles.modalContainer}>
                    {[
                        {
                            titulo: '1. Quem somos',
                            texto: `A AdoCão é uma plataforma dedicada à adoção responsável de cães, conectando adotantes a protetores, ONGs e lares temporários.`,
                            icon: 'information-outline'
                        },
                        {
                            titulo: '2. Quais dados coletamos',
                            texto: `Dados fornecidos por você: nome, e-mail, telefone, cidade e informações de cadastro. Coletamos automaticamente: IP, navegador, cookies e páginas visitadas.`,
                            icon: 'database-outline'
                        },
                    ].map((sec, idx) => (
                        <View key={idx} style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Icon name={sec.icon} size={18} color="#26b8b5" />
                                <Text style={styles.sectionTitle}>{sec.titulo}</Text>
                            </View>
                            <Text style={styles.modalText}>{sec.texto}</Text>
                        </View>
                    ))}

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.acceptButton, { flex: 1, marginRight: 10 }]}
                            onPress={() => {
                                setAceitouTermos(true);
                                setModalVisible(false);
                            }}
                        >
                            <Icon name="check" size={20} color="#fff" />
                            <Text style={styles.buttonText}>Aceitar Termos</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.declineButton, { flex: 1 }]}
                            onPress={() => {
                                setAceitouTermos(false);
                                setModalVisible(false);
                                mostrarAlerta('Acesso negado', 'Você precisa aceitar os termos para usar o AdoCão.');
                            }}
                        >
                            <Icon name="close" size={20} color="#fff" />
                            <Text style={styles.buttonText}>Recusar</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </Modal>
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
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#26b8b5',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#ffffff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: '#888',
    },
    formContainer: {
        marginBottom: 20,
        maxWidth: 400,
        alignSelf: 'center',
        width: '100%',
    },
    inputWrapper: {
        marginBottom: 20,
    },
    inputLabel: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e1e1e',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
        maxWidth: 400,
        width: '100%',
    },
    inputIcon: {
        padding: 12,
        paddingLeft: 16,
    },
    input: {
        flex: 1,
        height: 48,
        paddingHorizontal: 12,
        color: '#fff',
        fontSize: 16,
    },
    loginButton: {
        backgroundColor: '#26b8b5',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
    },
    registerButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#26b8b5',
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    registerText: {
        color: '#26b8b5',
        fontWeight: 'bold',
        fontSize: 15,
    },
    termsContainer: {
        marginTop: 20,
        paddingHorizontal: 10,
    },
    termsText: {
        color: '#aaa',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 18,
    },
    termsLink: {
        color: '#26b8b5',
        textDecorationLine: 'underline',
        fontWeight: '500',
    },
    modalHeader: {
        backgroundColor: '#1a1a1a',
        padding: 20,
        paddingTop: 50,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#2e2e2e',
    },
    modalCloseButton: {
        marginRight: 12,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
    },
    modalContainer: {
        padding: 20,
        backgroundColor: '#1a1a1a',
        flexGrow: 1,
    },
    section: {
        backgroundColor: '#222',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#26b8b5',
        marginLeft: 8,
    },
    modalText: {
        fontSize: 14,
        color: '#e0e0e0',
        lineHeight: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
        marginBottom: 20,
    },
    acceptButton: {
        backgroundColor: '#26b8b5',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 12,
    },
    declineButton: {
        backgroundColor: '#b82626',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 12,
    },
});