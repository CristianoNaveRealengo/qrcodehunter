import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useGame } from '../context/GameContext';
import { RootStackParamList, Team } from '../types';
import { generateUniqueId, validateParticipants, validateTeamName } from '../utils/validation';

type TeamRegistrationNavigationProp = StackNavigationProp<RootStackParamList, 'TeamRegistration'>;

interface Props {
  navigation: TeamRegistrationNavigationProp;
}

const TeamRegistrationScreen: React.FC<Props> = ({ navigation }) => {
  const { state, dispatch } = useGame();
  const [teamName, setTeamName] = useState('');
  const [participants, setParticipants] = useState(['']);
  const [errors, setErrors] = useState<{ teamName?: string; participants?: string }>({});

  const addParticipant = () => {
    if (participants.length < 10) {
      setParticipants([...participants, '']);
    }
  };

  const removeParticipant = (index: number) => {
    if (participants.length > 1) {
      const newParticipants = participants.filter((_, i) => i !== index);
      setParticipants(newParticipants);
    }
  };

  const updateParticipant = (index: number, value: string) => {
    const newParticipants = [...participants];
    newParticipants[index] = value;
    setParticipants(newParticipants);
  };

  const validateForm = (): boolean => {
    const newErrors: { teamName?: string; participants?: string } = {};
    
    const existingTeams = state.currentSession?.teams || [];
    const teamNameError = validateTeamName(teamName, existingTeams);
    if (teamNameError) {
      newErrors.teamName = teamNameError;
    }

    const participantsError = validateParticipants(participants);
    if (participantsError) {
      newErrors.participants = participantsError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegisterTeam = () => {
    if (!validateForm()) {
      return;
    }

    const validParticipants = participants.filter(p => p.trim().length > 0);
    
    const newTeam: Team = {
      id: generateUniqueId(),
      name: teamName.trim(),
      participants: validParticipants,
      score: 0,
      scannedCodes: [],
      createdAt: new Date(),
    };

    // Se não há sessão ativa, criar uma nova
    if (!state.currentSession) {
      dispatch({ type: 'CREATE_GAME_SESSION', payload: { duration: 30 } });
    }

    dispatch({ type: 'ADD_TEAM', payload: newTeam });
    dispatch({ type: 'SET_CURRENT_TEAM', payload: newTeam });

    Alert.alert(
      'Equipe Cadastrada!',
      `A equipe "${teamName}" foi cadastrada com sucesso!`,
      [
        {
          text: 'Começar Jogo',
          onPress: () => navigation.navigate('MainGame'),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#2D3436" />
          </TouchableOpacity>
          <Text style={styles.title}>Cadastrar Equipe</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome da Equipe</Text>
            <TextInput
              style={[styles.input, errors.teamName && styles.inputError]}
              value={teamName}
              onChangeText={setTeamName}
              placeholder="Digite o nome da sua equipe"
              placeholderTextColor="#A0A0A0"
              maxLength={30}
            />
            {errors.teamName && (
              <Text style={styles.errorText}>{errors.teamName}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.participantsHeader}>
              <Text style={styles.label}>Participantes</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={addParticipant}
                disabled={participants.length >= 10}
              >
                <Icon name="add" size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>

            {participants.map((participant, index) => (
              <View key={index} style={styles.participantRow}>
                <TextInput
                  style={[styles.participantInput, errors.participants && styles.inputError]}
                  value={participant}
                  onChangeText={(value) => updateParticipant(index, value)}
                  placeholder={`Participante ${index + 1}`}
                  placeholderTextColor="#A0A0A0"
                  maxLength={50}
                />
                {participants.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeParticipant(index)}
                  >
                    <Icon name="remove" size={20} color="#FF6B6B" />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {errors.participants && (
              <Text style={styles.errorText}>{errors.participants}</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegisterTeam}
          >
            <Icon name="group-add" size={24} color="#FFFFFF" />
            <Text style={styles.registerButtonText}>Cadastrar Equipe</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 40,
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  participantsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  participantInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  removeButton: {
    marginLeft: 10,
    padding: 10,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 5,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    paddingVertical: 18,
    borderRadius: 15,
    marginTop: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default TeamRegistrationScreen;