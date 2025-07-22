import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Team } from '../types';
import { generateUniqueId, validateParticipants, validateTeamName } from '../utils/validation';

// Versão web do TeamRegistrationScreen - compatível com Vite
// Remove dependências React Native e usa HTML/CSS padrão

interface Props {
  onBack?: () => void;
  onTeamRegistered?: (team: Team) => void;
}

const TeamRegistrationScreen: React.FC<Props> = ({ onBack, onTeamRegistered }) => {
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

    alert(
      `Equipe "${teamName}" foi cadastrada com sucesso!\n\nParticipantes: ${validParticipants.join(', ')}`
    );

    // Callback para notificar que a equipe foi registrada
    if (onTeamRegistered) {
      onTeamRegistered(newTeam);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.scrollContainer}>
        <div style={styles.header}>
          {onBack && (
            <button
              style={styles.backButton}
              onClick={onBack}
            >
              <span style={styles.backIcon}>←</span>
            </button>
          )}
          <h1 style={styles.title}>Cadastrar Equipe</h1>
        </div>

        <div style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nome da Equipe</label>
            <input
              style={{
                ...styles.input,
                ...(errors.teamName ? styles.inputError : {})
              }}
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Digite o nome da sua equipe"
              maxLength={30}
            />
            {errors.teamName && (
              <p style={styles.errorText}>{errors.teamName}</p>
            )}
          </div>

          <div style={styles.inputGroup}>
            <div style={styles.participantsHeader}>
              <label style={styles.label}>Participantes</label>
              <button
                style={{
                  ...styles.addButton,
                  ...(participants.length >= 10 ? styles.addButtonDisabled : {})
                }}
                onClick={addParticipant}
                disabled={participants.length >= 10}
              >
                <span style={styles.addIcon}>+</span>
                <span style={styles.addButtonText}>Adicionar</span>
              </button>
            </div>

            {participants.map((participant, index) => (
              <div key={index} style={styles.participantRow}>
                <input
                  style={{
                    ...styles.participantInput,
                    ...(errors.participants ? styles.inputError : {})
                  }}
                  type="text"
                  value={participant}
                  onChange={(e) => updateParticipant(index, e.target.value)}
                  placeholder={`Participante ${index + 1}`}
                  maxLength={50}
                />
                {participants.length > 1 && (
                  <button
                    style={styles.removeButton}
                    onClick={() => removeParticipant(index)}
                  >
                    <span style={styles.removeIcon}>×</span>
                  </button>
                )}
              </div>
            ))}

            {errors.participants && (
              <p style={styles.errorText}>{errors.participants}</p>
            )}
          </div>

          <button
            style={styles.registerButton}
            onClick={handleRegisterTeam}
          >
            <span style={styles.registerIcon}>👥</span>
            <span style={styles.registerButtonText}>Cadastrar Equipe</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Estilos CSS-in-JS para web - compatível com Vite
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#F8F9FA',
    fontFamily: 'Arial, sans-serif',
  },
  scrollContainer: {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '30px',
    marginTop: '20px',
  },
  backButton: {
    padding: '10px',
    marginRight: '10px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '24px',
    color: '#2D3436',
  },
  backIcon: {
    fontSize: '24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#2D3436',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  inputGroup: {
    marginBottom: '25px',
  },
  label: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: '10px',
    display: 'block',
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '15px',
    fontSize: '16px',
    border: '2px solid #E0E0E0',
    boxSizing: 'border-box' as const,
    outline: 'none',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  participantsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    padding: '8px 15px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  addButtonDisabled: {
    backgroundColor: '#CCCCCC',
    cursor: 'not-allowed',
  },
  addIcon: {
    marginRight: '5px',
    fontSize: '16px',
  },
  addButtonText: {
    fontSize: '14px',
  },
  participantRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
  },
  participantInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '15px',
    fontSize: '16px',
    border: '2px solid #E0E0E0',
    outline: 'none',
  },
  removeButton: {
    marginLeft: '10px',
    padding: '10px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#FF6B6B',
    fontSize: '20px',
  },
  removeIcon: {
    fontSize: '20px',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: '14px',
    marginTop: '5px',
    margin: '5px 0 0 0',
  },
  registerButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    padding: '18px',
    borderRadius: '15px',
    border: 'none',
    cursor: 'pointer',
    marginTop: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
    color: '#FFFFFF',
  },
  registerIcon: {
    marginRight: '10px',
    fontSize: '24px',
  },
  registerButtonText: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
};

export default TeamRegistrationScreen;