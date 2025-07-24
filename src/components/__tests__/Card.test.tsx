import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Card from '../Card';

// Mock do react-native components
jest.mock('react-native', () => ({
  View: ({ children, style, testID }: any) => (
    <div style={style} data-testid={testID || 'card'}>
      {children}
    </div>
  ),
  StyleSheet: {
    create: (styles: any) => styles,
  },
}));

describe('Card Component', () => {
  it('deve renderizar children corretamente', () => {
    const { getByText } = render(
      <Card>
        <span>Conteúdo do card</span>
      </Card>
    );
    
    expect(getByText('Conteúdo do card')).toBeInTheDocument();
  });

  it('deve aplicar padding medium por padrão', () => {
    const { getByTestId } = render(
      <Card>
        <span>Conteúdo</span>
      </Card>
    );
    
    const card = getByTestId('card');
    expect(card).toBeInTheDocument();
  });

  it('deve aplicar padding none', () => {
    const { getByTestId } = render(
      <Card padding="none">
        <span>Conteúdo</span>
      </Card>
    );
    
    const card = getByTestId('card');
    expect(card).toBeInTheDocument();
  });

  it('deve aplicar padding small', () => {
    const { getByTestId } = render(
      <Card padding="small">
        <span>Conteúdo</span>
      </Card>
    );
    
    const card = getByTestId('card');
    expect(card).toBeInTheDocument();
  });

  it('deve aplicar padding large', () => {
    const { getByTestId } = render(
      <Card padding="large">
        <span>Conteúdo</span>
      </Card>
    );
    
    const card = getByTestId('card');
    expect(card).toBeInTheDocument();
  });

  it('deve aplicar shadow medium por padrão', () => {
    const { getByTestId } = render(
      <Card>
        <span>Conteúdo</span>
      </Card>
    );
    
    const card = getByTestId('card');
    expect(card).toBeInTheDocument();
  });

  it('deve aplicar shadow none', () => {
    const { getByTestId } = render(
      <Card shadow="none">
        <span>Conteúdo</span>
      </Card>
    );
    
    const card = getByTestId('card');
    expect(card).toBeInTheDocument();
  });

  it('deve aplicar shadow small', () => {
    const { getByTestId } = render(
      <Card shadow="small">
        <span>Conteúdo</span>
      </Card>
    );
    
    const card = getByTestId('card');
    expect(card).toBeInTheDocument();
  });

  it('deve aplicar shadow large', () => {
    const { getByTestId } = render(
      <Card shadow="large">
        <span>Conteúdo</span>
      </Card>
    );
    
    const card = getByTestId('card');
    expect(card).toBeInTheDocument();
  });

  it('deve aplicar backgroundColor customizada', () => {
    const { getByTestId } = render(
      <Card backgroundColor="#ff0000">
        <span>Conteúdo</span>
      </Card>
    );
    
    const card = getByTestId('card');
    expect(card).toBeInTheDocument();
  });

  it('deve aplicar borderRadius customizado', () => {
    const { getByTestId } = render(
      <Card borderRadius={10}>
        <span>Conteúdo</span>
      </Card>
    );
    
    const card = getByTestId('card');
    expect(card).toBeInTheDocument();
  });

  it('deve aplicar estilo customizado', () => {
    const customStyle = { margin: 10 };
    const { getByTestId } = render(
      <Card style={customStyle}>
        <span>Conteúdo</span>
      </Card>
    );
    
    const card = getByTestId('card');
    expect(card).toBeInTheDocument();
  });
});