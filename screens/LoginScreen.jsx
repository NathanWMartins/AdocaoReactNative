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

                <View style={{ marginTop: 20 }}>
                    <Text style={{ color: '#aaa', fontSize: 13, textAlign: 'center' }}>
                        Antes de continuar, leia nossos{' '}
                        <Text
                            style={{ color: '#26b8b5', textDecorationLine: 'underline' }}
                            onPress={() => setModalVisible(true)}
                        >
                            Termos de Consentimento e Política de Privacidade
                        </Text>
                        .
                    </Text>
                </View>
            </ScrollView>

            <Modal visible={modalVisible} animationType="slide">
                <ScrollView contentContainerStyle={styles.modalContainer}>
                    <Text style={styles.modalTitle}>
                        🐾 Termo de Consentimento e Política de Privacidade – AdoCão
                    </Text>
                    {[
                        {
                            titulo: '1. Quem somos',
                            texto: `A AdoCão é uma plataforma dedicada à adoção responsável de cães, conectando adotantes a protetores, ONGs e lares temporários.
                                Controlador dos dados: AdoCão – Nathan Will Martins e Rafaela Ines Jung
                                E-mail: contato@adocao.com.br
                                Localização: [Cidade, Estado]
                                Encarregado de Dados (DPO): privacidade@adocao.com.br`,
                        },
                        {
                            titulo: '2. Quais dados coletamos',
                            texto: `2.1. Dados fornecidos por você:
                                - Nome completo
                                - E-mail
                                - Telefone
                                - Cidade e Estado
                                - Informações inseridas em formulários de cadastro ou adoção

                                2.2. Dados coletados automaticamente:
                                - Endereço IP
                                - Tipo de navegador e sistema operacional
                                - Cookies e identificadores de sessão
                                - Geolocalização aproximada
                                - Páginas visitadas e tempo de navegação`,
                        },
                        {
                            titulo: '3. Finalidades do uso dos dados',
                            texto: `- Entrar em contato sobre processos de adoção
                                    - Personalizar e melhorar sua experiência na plataforma
                                    - Enviar notificações relevantes (ex: status de adoção)
                                    - Cumprir obrigações legais, regulatórias e contratuais`,
                        },
                        {
                            titulo: '4. Base legal',
                            texto: `O tratamento de dados é fundamentado no seu consentimento livre, informado e inequívoco, conforme o art. 7º, inciso I da LGPD.`,
                        },
                        {
                            titulo: '5. Compartilhamento de dados',
                            texto: `Seus dados podem ser compartilhados com:
                                - ONGs e protetores parceiros envolvidos nas adoções
                                - Provedores de hospedagem segura (ex: servidores em nuvem)
                                - Ferramentas de análise de navegação (ex: Google Analytics)

                                Não comercializamos seus dados pessoais.`,
                        },
                        {
                            titulo: '6. Cookies e tecnologias semelhantes',
                            texto: `Utilizamos cookies para:
                                - Melhorar o desempenho e funcionamento da plataforma
                                - Salvar preferências do usuário
                                - Obter estatísticas de uso

                                Você pode gerenciar ou desabilitar cookies nas configurações do seu navegador.`,
                        },
                        {
                            titulo: '7. Armazenamento e segurança dos dados',
                            texto: `Os dados são armazenados em servidores seguros, com acesso restrito, e protegidos por medidas técnicas e administrativas que garantem integridade e confidencialidade das informações.`,
                        },
                        {
                            titulo: '8. Seus direitos (LGPD – Art. 18)',
                            texto: `Você tem o direito de:
                                - Confirmar a existência de tratamento de dados
                                - Acessar seus dados pessoais
                                - Corrigir dados incompletos, inexatos ou desatualizados
                                - Solicitar anonimização, bloqueio ou eliminação de dados
                                - Revogar o consentimento a qualquer momento
                                - Solicitar portabilidade dos dados
                                - Obter informações sobre compartilhamento de dados

                                Para exercer seus direitos, entre em contato: privacidade@adocao.com.br`,
                        },
                        {
                            titulo: '9. Tempo de retenção dos dados',
                            texto: `Seus dados serão mantidos:
                                - Enquanto durar seu vínculo com a AdoCão
                                - Enquanto forem necessários para as finalidades informadas
                                - Conforme obrigações legais e regulatórias

                                Após esse período, os dados serão anonimizados ou eliminados com segurança.`,
                        },
                        {
                            titulo: '10. Transferência internacional de dados',
                            texto: `Seus dados podem ser transferidos para servidores fora do Brasil (ex: Firebase, AWS), sempre com garantias de segurança e proteção adequadas, em conformidade com a LGPD.`,
                        },
                        {
                            titulo: '11. Consequência do não consentimento',
                            texto: `A não aceitação deste termo impede o uso de funcionalidades essenciais, como cadastro, adoção e contato com protetores.`,
                        },
                        {
                            titulo: '12. Aceite do usuário',
                            texto: `Ao clicar em “Li e aceito os termos”, você declara que:
                                - Leu e compreendeu este documento
                                - Está ciente dos seus direitos como titular dos dados
                                - Autoriza o uso de seus dados conforme descrito`,
                        },
                        {
                            titulo: '13. Fale conosco',
                            texto: `Caso tenha dúvidas, sugestões ou precise exercer seus direitos, entre em contato:
                                privacidade@adocao.com.br`,
                        },
                    ].map((sec, idx) => (
                        <View key={idx} style={styles.section}>
                            <Text style={styles.sectionTitle}>{sec.titulo}</Text>
                            <Text style={styles.modalText}>{sec.texto}</Text>
                        </View>
                    ))}

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.loginButton, { flex: 1, marginRight: 10 }]}
                            onPress={() => {
                                setAceitouTermos(true);
                                setModalVisible(false);
                            }}
                        >
                            <Text style={styles.buttonText}>Li e aceito os termos</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.loginButton, { backgroundColor: '#b82626', flex: 1 }]}
                            onPress={() => {
                                setAceitouTermos(false);
                                setModalVisible(false);
                                mostrarAlerta('Acesso negado', 'Você precisa aceitar os termos para usar o AdoCão.');
                            }}
                        >
                            <Text style={styles.buttonText}>Li e não aceito os termos</Text>
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
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
        elevation: 2,
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
    modalContainer: {
        padding: 24,
        paddingTop: 50,
        backgroundColor: '#1a1a1a',
        flexGrow: 1,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#26b8b5',
        marginBottom: 20,
        textAlign: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#2e2e2e',
        paddingBottom: 10,
    },
    modalText: {
        fontSize: 14,
        color: '#e0e0e0',
        lineHeight: 22,
        marginTop: 6,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
    },
    section: {
        backgroundColor: '#222',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#26b8b5',
        marginBottom: 6,
    },
});
