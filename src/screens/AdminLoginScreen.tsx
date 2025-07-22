import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useGame } from '../context/GameContext';
import { RootStackParamList } from '../types';

type AdminLoginNavigationProp = StackNavigationProp<RootStackParamList, 'AdminLogin'>;

interface Props {
  navigation: AdminLoginNavigationProp;
}

const ADMIN_PASSWORD = 'admin123'; // Em produção, isso deveria ser mais seguro

const AdminLoginScreen: React.FC<Props> = ({ navigation }) => {
  const { dispatch } = useGame();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    if (!password.trim()) {
      Alert.alert('Erro', 'Digite a senha de administrador');
      return;
    }

    setIsLoading(true);

    // Simular verificação de senha
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        dispatch({ type: 'SET_ADMIN_MODE', payload: true });
        navigation.navigate('QRGeneration');
      } else {
        Alert.alert('Erro', 'Senha incorreta');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#2D3436" />
        </TouchableOpacity>
        <Text style={styles.title}>Área do Organizador</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon name="admin-panel-settings" size={80} color="#4ECDC4" />
        </View>

        <Text style={styles.subtitle}>
          Digite a senha para acessar as ferramentas de organização
        </Text>

        <View style={styles.inputContainer}>
          <Icon name="lock" size={24} color="#636E72" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Senha do organizador"
            placeholderTextColor="#A0A0A0"
            secureTextEntry
            autoCapitalize="none"
            onSubmitEditing={handleLogin}
          />
        </View>

        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.loginButtonText}>Verificando...</Text>
          ) : (
            <>
              <Icon name="login" size={24} color="#FFFFFF" />
              <Text style={styles.loginButtonText}>Entrar</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Como organizador, você pode:
          </Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Icon name="qr-code" size={20} color="#4ECDC4" />
              <Text style={styles.featureText}>Gerar QR Codes com pontuações</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="play-arrow" size={20} color="#4ECDC4" />
              <Text style={styles.featureText}>Controlar início e fim do jogo</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="timer" size={20} color="#4ECDC4" />
              <Text style={styles.featureText}>Definir tempo da gincana</Text>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 16,
    color: '#636E72',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginBottom: 30,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#2D3436',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ECDC4',
    paddingVertical: 18,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loginButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  infoContainer: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 15,
  },
  featureList: {
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#636E72',
    marginLeft: 10,
  },
});

export default AdminLoginScreen;