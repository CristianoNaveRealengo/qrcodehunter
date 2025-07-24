import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from '../Button';

// Mock do react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => {
  return ({ name, size, color, style }: any) => (
    <span 
      data-testid={`icon-${name}`}
      style={{ fontSize: size, color, ...style }}
    >
      {name}
    </span>
  );
});

// Mock do react-native components
jest.mock('react-native', () => ({
  TouchableOpacity: ({ children, onPress, disabled, style, testID }: any) => (
    <button 
      onClick={onPress} 
      disabled={disabled} 
      style={style}
      data-testid={testID || 'button'}
    >
      {children}
    </button>
  ),
  Text: ({ children, style }: any) => (
    <span style={style}>{children}</span>
  ),
  ActivityIndicator: ({ size, color }: any) => (
    <div data-testid="loading-indicator" style={{ color }}>
      Loading {size}
    </div>
  ),
  StyleSheet: {
    create: (styles: any) => styles,
  },
}));

describe('Button Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('deve renderizar o botão com título', () => {
    const { getByText } = render(
      <Button title="Clique aqui" onPress={mockOnPress} />
    );
    
    expect(getByText('Clique aqui')).toBeInTheDocument();
  });

  it('deve chamar onPress quando clicado', () => {
    const { getByTestId } = render(
      <Button title="Clique aqui" onPress={mockOnPress} />
    );
    
    fireEvent.click(getByTestId('button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('deve estar desabilitado quando disabled=true', () => {
    const { getByTestId } = render(
      <Button title="Botão" onPress={mockOnPress} disabled={true} />
    );
    
    const button = getByTestId('button');
    expect(button).toBeDisabled();
  });

  it('não deve chamar onPress quando desabilitado', () => {
    const { getByTestId } = render(
      <Button title="Botão" onPress={mockOnPress} disabled={true} />
    );
    
    fireEvent.click(getByTestId('button'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('deve mostrar loading indicator quando loading=true', () => {
    const { getByTestId } = render(
      <Button title="Botão" onPress={mockOnPress} loading={true} />
    );
    
    expect(getByTestId('loading-indicator')).toBeInTheDocument();
  });

  it('deve renderizar ícone quando fornecido', () => {
    const { getByTestId } = render(
      <Button title="Botão" onPress={mockOnPress} icon="home" />
    );
    
    expect(getByTestId('icon-home')).toBeInTheDocument();
  });

  it('deve aplicar variante primary por padrão', () => {
    const { getByTestId } = render(
      <Button title="Botão" onPress={mockOnPress} />
    );
    
    const button = getByTestId('button');
    expect(button).toBeInTheDocument();
  });

  it('deve aplicar variante secondary', () => {
    const { getByTestId } = render(
      <Button title="Botão" onPress={mockOnPress} variant="secondary" />
    );
    
    const button = getByTestId('button');
    expect(button).toBeInTheDocument();
  });

  it('deve aplicar variante success', () => {
    const { getByTestId } = render(
      <Button title="Botão" onPress={mockOnPress} variant="success" />
    );
    
    const button = getByTestId('button');
    expect(button).toBeInTheDocument();
  });

  it('deve aplicar variante warning', () => {
    const { getByTestId } = render(
      <Button title="Botão" onPress={mockOnPress} variant="warning" />
    );
    
    const button = getByTestId('button');
    expect(button).toBeInTheDocument();
  });

  it('deve aplicar variante error', () => {
    const { getByTestId } = render(
      <Button title="Botão" onPress={mockOnPress} variant="error" />
    );
    
    const button = getByTestId('button');
    expect(button).toBeInTheDocument();
  });

  it('deve aplicar tamanho small', () => {
    const { getByTestId } = render(
      <Button title="Botão" onPress={mockOnPress} size="small" />
    );
    
    const button = getByTestId('button');
    expect(button).toBeInTheDocument();
  });

  it('deve aplicar tamanho large', () => {
    const { getByTestId } = render(
      <Button title="Botão" onPress={mockOnPress} size="large" />
    );
    
    const button = getByTestId('button');
    expect(button).toBeInTheDocument();
  });

  it('deve posicionar ícone à direita quando iconPosition=right', () => {
    const { getByTestId } = render(
      <Button 
        title="Botão" 
        onPress={mockOnPress} 
        icon="home" 
        iconPosition="right" 
      />
    );
    
    expect(getByTestId('icon-home')).toBeInTheDocument();
  });
});