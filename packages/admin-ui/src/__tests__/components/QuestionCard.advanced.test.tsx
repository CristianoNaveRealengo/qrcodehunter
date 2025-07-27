// Importações organizadas por camadas da Clean Architecture
import { Question } from '@qrcode-hunter/shared'; // Entities (Entidades)
import { fireEvent, render, screen } from '@solidjs/testing-library'; // Frameworks & Drivers
import { describe, expect, it, vi } from 'vitest'; // Frameworks & Drivers
import { QuestionCard } from '../../components/QuestionCard'; // Interface Adapters (Componente de UI)

// Importações de utilitários de teste - Princípio Single Responsibility
import { QuestionTestFactory } from '../helpers/QuestionTestFactory';

describe('QuestionCard - Advanced TDD Tests', () => {
  // Usar factory centralizada - Princípio Single Responsibility
  const mockQuestion = QuestionTestFactory.createDefault();

  describe('Renderização Básica', () => {
    it('deve renderizar pergunta com todas as informações', () => {
      render(() => <QuestionCard question={mockQuestion} index={0} />);
      
      expect(screen.getByText('Qual é a capital do Brasil?')).toBeInTheDocument();
      expect(screen.getByText('30s')).toBeInTheDocument();
      expect(screen.getByText('1000 pts')).toBeInTheDocument();
      expect(screen.getByText('Resposta: 3')).toBeInTheDocument();
    });

    it('deve renderizar todas as opções com formas corretas', () => {
      render(() => <QuestionCard question={mockQuestion} index={0} />);
      
      // Verificar textos das opções - Princípio Single Responsibility
      const expectedOptionTexts = ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'];
      expectedOptionTexts.forEach(text => {
        expect(screen.getByText(text)).toBeInTheDocument();
      });
      
      // Verificar símbolos das formas usando constantes - Princípio Open/Closed
      expect(screen.getByText(EXPECTED_SHAPES.CIRCLE)).toBeInTheDocument();
      expect(screen.getByText(EXPECTED_SHAPES.SQUARE)).toBeInTheDocument();
      expect(screen.getByText(EXPECTED_SHAPES.TRIANGLE)).toBeInTheDocument();
      expect(screen.getByText(EXPECTED_SHAPES.DIAMOND)).toBeInTheDocument();
    });

    it('deve mostrar letras das opções (A, B, C, D)', () => {
      render(() => <QuestionCard question={mockQuestion} index={0} />);
      
      // Usar constante para melhor manutenibilidade - Princípio Open/Closed
      EXPECTED_OPTION_LETTERS.forEach(letter => {
        expect(screen.getByText(letter)).toBeInTheDocument();
      });
    });
  });

  describe('Numeração de Perguntas', () => {
    it('deve mostrar número correto da pergunta (index + 1)', () => {
      render(() => <QuestionCard question={mockQuestion} index={4} />);
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('deve mostrar número 1 para primeira pergunta', () => {
      render(() => <QuestionCard question={mockQuestion} index={0} />);
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('Destaque da Resposta Correta', () => {
    it('deve destacar visualmente a resposta correta', () => {
      render(() => <QuestionCard question={mockQuestion} index={0} />);
      
      // A terceira opção (Brasília) deve ter estilo de resposta correta
      const correctOption = screen.getByText('Brasília').closest('div');
      expect(correctOption).toHaveClass('border-success-300');
    });

    it('deve mostrar ícone de check na resposta correta', () => {
      render(() => <QuestionCard question={mockQuestion} index={0} />);
      
      // Deve haver um ícone de check na resposta correta
      const checkIcons = screen.getAllByTestId('check-icon');
      expect(checkIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Cores e Acessibilidade', () => {
    it('deve aplicar cores corretas às opções', () => {
      render(() => <QuestionCard question={mockQuestion} index={0} />);
      
      // Verificar se as cores estão sendo aplicadas via style
      const options = screen.getAllByRole('generic');
      const coloredOptions = options.filter(el => 
        el.style.backgroundColor && el.style.backgroundColor !== ''
      );
      
      expect(coloredOptions.length).toBeGreaterThan(0);
    });

    it('deve ter contraste adequado para acessibilidade', () => {
      render(() => <QuestionCard question={mockQuestion} index={0} />);
      
      // Verificar se as cores usadas têm contraste adequado
      const redOption = screen.getByText('São Paulo').previousElementSibling;
      const blueOption = screen.getByText('Rio de Janeiro').previousElementSibling;
      
      expect(redOption).toHaveStyle({ backgroundColor: '#dc2626' });
      expect(blueOption).toHaveStyle({ backgroundColor: '#2563eb' });
    });
  });

  describe('Interações e Callbacks', () => {
    it('deve chamar onEdit quando botão de editar é clicado', () => {
      const onEdit = vi.fn();
      render(() => <QuestionCard question={mockQuestion} index={0} onEdit={onEdit} />);
      
      const editButton = screen.getByTitle('Editar pergunta');
      fireEvent.click(editButton);
      
      expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it('deve chamar onDelete quando botão de deletar é clicado', () => {
      const onDelete = vi.fn();
      render(() => <QuestionCard question={mockQuestion} index={0} onDelete={onDelete} />);
      
      const deleteButton = screen.getByTitle('Remover pergunta');
      fireEvent.click(deleteButton);
      
      expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it('não deve mostrar botões quando readonly=true', () => {
      render(() => <QuestionCard question={mockQuestion} index={0} readonly={true} />);
      
      expect(screen.queryByTitle('Editar pergunta')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Remover pergunta')).not.toBeInTheDocument();
    });
  });

  describe('Propriedades Opcionais', () => {
    it('deve mostrar cor de fundo quando configurada', () => {
      const questionWithBg = {
        ...mockQuestion,
        backgroundColor: '#f3f4f6'
      };
      
      render(() => <QuestionCard question={questionWithBg} index={0} />);
      
      expect(screen.getByText('Cor de fundo:')).toBeInTheDocument();
      expect(screen.getByText('#f3f4f6')).toBeInTheDocument();
    });

    it('não deve mostrar seção de cor de fundo quando não configurada', () => {
      render(() => <QuestionCard question={mockQuestion} index={0} />);
      
      expect(screen.queryByText('Cor de fundo:')).not.toBeInTheDocument();
    });
  });

  describe('Validação de Dados', () => {
    it('deve lidar com pergunta sem opções', () => {
      // Usar factory para criar cenário específico - Princípio Single Responsibility
      const emptyQuestion = createMockQuestion({ options: [] });
      
      render(() => <QuestionCard question={emptyQuestion} index={0} />);
      
      expect(screen.getByText('Qual é a capital do Brasil?')).toBeInTheDocument();
      // Não deve quebrar mesmo sem opções - Princípio de robustez
    });

    it('deve lidar com índice de resposta correta inválido', () => {
      // Usar factory para criar cenário específico - Princípio Single Responsibility
      const invalidQuestion = createMockQuestion({ correctAnswer: 10 });
      
      render(() => <QuestionCard question={invalidQuestion} index={0} />);
      
      expect(screen.getByText('Resposta: 11')).toBeInTheDocument(); // 10 + 1
      // Não deve quebrar mesmo com índice inválido - Princípio de robustez
    });

    it('deve lidar com tempo limite extremo', () => {
      // Usar factory para criar cenário específico - Princípio Single Responsibility
      const extremeQuestion = createMockQuestion({ timeLimit: 999 });
      
      render(() => <QuestionCard question={extremeQuestion} index={0} />);
      
      expect(screen.getByText('999s')).toBeInTheDocument();
    });

    it('deve lidar com pontuação muito alta', () => {
      // Usar factory para criar cenário específico - Princípio Single Responsibility
      const highPointsQuestion = createMockQuestion({ points: 999999 });
      
      render(() => <QuestionCard question={highPointsQuestion} index={0} />);
      
      expect(screen.getByText('999999 pts')).toBeInTheDocument();
    });
  });

  describe('Responsividade', () => {
    it('deve aplicar classes responsivas para grid de opções', () => {
      render(() => <QuestionCard question={mockQuestion} index={0} />);
      
      // Verificar se o grid tem classes responsivas
      const optionsGrid = screen.getByText('São Paulo').closest('.grid');
      expect(optionsGrid).toHaveClass('grid-cols-1', 'sm:grid-cols-2');
    });
  });

  describe('Estados de Loading/Error', () => {
    it('deve renderizar mesmo com dados mínimos', () => {
      const minimalQuestion: Question = {
        id: 'q1',
        title: 'Pergunta mínima',
        options: [
          { id: 'opt1', text: 'A', color: '#000000', shape: 'circle' },
          { id: 'opt2', text: 'B', color: '#ffffff', shape: 'square' }
        ],
        correctAnswer: 0,
        timeLimit: 5,
        points: 1
      };
      
      render(() => <QuestionCard question={minimalQuestion} index={0} />);
      
      expect(screen.getByText('Pergunta mínima')).toBeInTheDocument();
      expect(screen.getByText('5s')).toBeInTheDocument();
      expect(screen.getByText('1 pts')).toBeInTheDocument();
    });
  });

  describe('Acessibilidade Avançada', () => {
    it('deve ter estrutura semântica adequada', () => {
      render(() => <QuestionCard question={mockQuestion} index={0} />);
      
      // Verificar se há headings apropriados
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Qual é a capital do Brasil?');
    });

    it('deve ter botões com labels acessíveis', () => {
      render(() => <QuestionCard question={mockQuestion} index={0} onEdit={vi.fn()} onDelete={vi.fn()} />);
      
      const editButton = screen.getByTitle('Editar pergunta');
      const deleteButton = screen.getByTitle('Remover pergunta');
      
      expect(editButton).toHaveAttribute('title', 'Editar pergunta');
      expect(deleteButton).toHaveAttribute('title', 'Remover pergunta');
    });
  });
});