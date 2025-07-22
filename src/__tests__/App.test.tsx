import { render } from '@testing-library/react-native';
import React from 'react';
import App from '../App';

// Mock das dependências - versão híbrida para compatibilidade
jest.mock('../context/GameContext', () => ({
  GameProvider: ({ children }: { children: React.ReactNode }) => children,
  useGame: () => ({
    state: {
      currentSession: null,
      currentTeam: null,
      isAdmin: false,
      timer: { timeLeft: 0, isRunning: false },
    },
    dispatch: jest.fn(),
  }),
}));

// Mock do WelcomeScreen para simular a versão web
jest.mock('../screens/WelcomeScreen', () => {
  const { View, Text } = require('react-native');
  return () => (
    <View testID="welcome-screen">
      <Text>QRCode Hunter</Text>
      <Text>Escaneie, pontue e vença!</Text>
      <Text>Cadastrar Equipe</Text>
    </View>
  );
});

jest.mock('../utils/errorBoundary', () => {
  return ({ children }: { children: React.ReactNode }) => children;
});

describe('App', () => {
  it('should render without crashing', () => {
    const { getByText, getByTestId } = render(<App />);
    expect(getByTestId('welcome-screen')).toBeTruthy();
    expect(getByText('QRCode Hunter')).toBeTruthy();
    expect(getByText('Escaneie, pontue e vença!')).toBeTruthy();
    expect(getByText('Cadastrar Equipe')).toBeTruthy();
  });
});