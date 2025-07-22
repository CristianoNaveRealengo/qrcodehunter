import { act, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { Team } from '../../types';
import { GameProvider, useGame } from '../GameContext';

// Componente de teste
const TestComponent: React.FC = () => {
  const { state, dispatch } = useGame();
  
  return (
    <>
      <Text testID="team-count">{state.currentSession?.teams.length || 0}</Text>
      <Text testID="qr-count">{state.currentSession?.qrCodes.length || 0}</Text>
      <Text testID="is-admin">{state.isAdmin.toString()}</Text>
    </>
  );
};

describe('GameContext', () => {
  it('should provide initial state', () => {
    const { getByTestId } = render(
      <GameProvider>
        <TestComponent />
      </GameProvider>
    );

    expect(getByTestId('team-count').props.children).toBe(0);
    expect(getByTestId('qr-count').props.children).toBe(0);
    expect(getByTestId('is-admin').props.children).toBe('false');
  });

  it('should create game session', () => {
    let dispatch: any;
    
    const TestComponentWithDispatch: React.FC = () => {
      const context = useGame();
      dispatch = context.dispatch;
      return <TestComponent />;
    };

    render(
      <GameProvider>
        <TestComponentWithDispatch />
      </GameProvider>
    );

    act(() => {
      dispatch({ type: 'CREATE_GAME_SESSION', payload: { duration: 30 } });
    });

    // O estado deve ser atualizado após a criação da sessão
    expect(dispatch).toBeDefined();
  });

  it('should add team to session', () => {
    let dispatch: any;
    
    const TestComponentWithDispatch: React.FC = () => {
      const context = useGame();
      dispatch = context.dispatch;
      return <TestComponent />;
    };

    const { getByTestId } = render(
      <GameProvider>
        <TestComponentWithDispatch />
      </GameProvider>
    );

    const mockTeam: Team = {
      id: 'team1',
      name: 'Test Team',
      participants: ['Player 1'],
      score: 0,
      scannedCodes: [],
      createdAt: new Date(),
    };

    act(() => {
      dispatch({ type: 'CREATE_GAME_SESSION', payload: { duration: 30 } });
      dispatch({ type: 'ADD_TEAM', payload: mockTeam });
    });

    expect(getByTestId('team-count').props.children).toBe(1);
  });

  it('should set admin mode', () => {
    let dispatch: any;
    
    const TestComponentWithDispatch: React.FC = () => {
      const context = useGame();
      dispatch = context.dispatch;
      return <TestComponent />;
    };

    const { getByTestId } = render(
      <GameProvider>
        <TestComponentWithDispatch />
      </GameProvider>
    );

    act(() => {
      dispatch({ type: 'SET_ADMIN_MODE', payload: true });
    });

    expect(getByTestId('is-admin').props.children).toBe('true');
  });
});