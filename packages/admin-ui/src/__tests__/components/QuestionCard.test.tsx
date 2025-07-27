import { Question } from '@qrcode-hunter/shared';
import { render, screen } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';
import { QuestionCard } from '../../components/QuestionCard';

describe('QuestionCard', () => {
  const mockQuestion: Question = {
    id: 'q1',
    title: 'Qual é a capital do Brasil?',
    options: [
      { id: 'opt1', text: 'São Paulo', color: '#dc2626', shape: 'circle' },
      { id: 'opt2', text: 'Rio de Janeiro', color: '#2563eb', shape: 'square' },
      { id: 'opt3', text: 'Brasília', color: '#16a34a', shape: 'triangle' },
      { id: 'opt4', text: 'Salvador', color: '#ca8a04', shape: 'diamond' }
    ],
    correctAnswer: 2,
    timeLimit: 30,
    points: 1000
  };

  it('deve renderizar pergunta com título e opções', () => {
    render(() => <QuestionCard question={mockQuestion} index={0} />);
    
    expect(screen.getByText('Qual é a capital do Brasil?')).toBeInTheDocument();
    expect(screen.getByText('São Paulo')).toBeInTheDocument();
    expect(screen.getByText('Rio de Janeiro')).toBeInTheDocument();
    expect(screen.getByText('Brasília')).toBeInTheDocument();
    expect(screen.getByText('Salvador')).toBeInTheDocument();
  });

  it('deve mostrar número da pergunta corretamente', () => {
    render(() => <QuestionCard question={mockQuestion} index={2} />);
    
    expect(screen.getByText('3')).toBeInTheDocument(); // index 2 = pergunta 3
  });

  it('deve mostrar informações de tempo e pontuação', () => {
    render(() => <QuestionCard question={mockQuestion} index={0} />);
    
    expect(screen.getByText('30s')).toBeInTheDocument();
    expect(screen.getByText('1000 pts')).toBeInTheDocument();
  });

  it('deve destacar resposta correta', () => {
    render(() => <QuestionCard question={mockQuestion} index={0} />);
    
    expect(screen.getByText('Resposta: 3')).toBeInTheDocument(); // correctAnswer 2 = opção 3
  });

  it('deve mostrar botões de ação quando não readonly', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    
    render(() => (
      <QuestionCard 
        question={mockQuestion} 
        index={0} 
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ));
    
    expect(screen.getByTitle('Editar pergunta')).toBeInTheDocument();
    expect(screen.getByTitle('Remover pergunta')).toBeInTheDocument();
  });

  it('deve ocultar botões de ação quando readonly', () => {
    render(() => (
      <QuestionCard 
        question={mockQuestion} 
        index={0} 
        readonly={true}
      />
    ));
    
    expect(screen.queryByTitle('Editar pergunta')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Remover pergunta')).not.toBeInTheDocument();
  });

  it('deve chamar callback de edição quando botão clicado', async () => {
    const onEdit = vi.fn();
    
    render(() => (
      <QuestionCard 
        question={mockQuestion} 
        index={0} 
        onEdit={onEdit}
      />
    ));
    
    const editButton = screen.getByTitle('Editar pergunta');
    editButton.click();
    
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('deve chamar callback de exclusão quando botão clicado', async () => {
    const onDelete = vi.fn();
    
    render(() => (
      <QuestionCard 
        question={mockQuestion} 
        index={0} 
        onDelete={onDelete}
      />
    ));
    
    const deleteButton = screen.getByTitle('Remover pergunta');
    deleteButton.click();
    
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('deve aplicar classes corretas para formas geométricas', () => {
    render(() => <QuestionCard question={mockQuestion} index={0} />);
    
    // Verificar se as formas estão sendo aplicadas
    // Nota: Teste visual seria mais apropriado, mas verificamos a presença dos elementos
    expect(screen.getByText('●')).toBeInTheDocument(); // círculo
    expect(screen.getByText('■')).toBeInTheDocument(); // quadrado
    expect(screen.getByText('▲')).toBeInTheDocument(); // triângulo
    expect(screen.getByText('♦')).toBeInTheDocument(); // diamante
  });

  it('deve mostrar letras das opções (A, B, C, D)', () => {
    render(() => <QuestionCard question={mockQuestion} index={0} />);
    
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
  });

  it('deve mostrar cor de fundo quando configurada', () => {
    const questionWithBg = {
      ...mockQuestion,
      backgroundColor: '#f3f4f6'
    };
    
    render(() => <QuestionCard question={questionWithBg} index={0} />);
    
    expect(screen.getByText('Cor de fundo:')).toBeInTheDocument();
    expect(screen.getByText('#f3f4f6')).toBeInTheDocument();
  });

  it('deve aplicar estilos de acessibilidade para resposta correta', () => {
    render(() => <QuestionCard question={mockQuestion} index={0} />);
    
    // A terceira opção (Brasília) deve ter estilo de resposta correta
    const correctOption = screen.getByText('Brasília').closest('div');
    expect(correctOption).toHaveClass('border-success-300');
  });
});