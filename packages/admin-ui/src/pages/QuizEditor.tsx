import { Component, createSignal, onMount, Show, For } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { useQuiz } from '../context/QuizContext';
import { Question, QuestionOption } from '@qrcode-hunter/shared';
import { clsx } from 'clsx';

/**
 * Editor de Quiz - Criar/Editar quizzes
 * Implementa formulário com validação e preview
 */
export const QuizEditor: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { currentQuiz, loadQuiz, createQuiz, updateQuiz, loading, error } = useQuiz();
  
  const [title, setTitle] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [isActive, setIsActive] = createSignal(true);
  const [questions, setQuestions] = createSignal<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = createSignal(0);
  const [validationErrors, setValidationErrors] = createSignal<string[]>([]);

  const isEditing = () => !!params.id;

  onMount(async () => {
    if (isEditing()) {
      await loadQuiz(params.id);
      const quiz = currentQuiz();
      if (quiz) {
        setTitle(quiz.title);
        setDescription(quiz.description);
        setIsActive(quiz.isActive);
        setQuestions(quiz.questions);
      }
    } else {
      // Novo quiz - adicionar primeira pergunta
      addQuestion();
    }
  });

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      title: '',
      options: [
        { id: 'opt_0', text: '', color: '#dc2626', shape: 'circle' },
        { id: 'opt_1', text: '', color: '#2563eb', shape: 'square' }
      ],
      correctAnswer: 0,
      timeLimit: 30,
      points: 1000
    };
    
    setQuestions(prev => [...prev, newQuestion]);
    setCurrentQuestionIndex(questions().length);
  };

  const removeQuestion = (index: number) => {
    if (questions().length <= 1) {
      alert('O quiz deve ter pelo menos uma pergunta');
      return;
    }
    
    setQuestions(prev => prev.filter((_, i) => i !== index));
    
    // Ajustar índice atual se necessário
    if (currentQuestionIndex() >= questions().length - 1) {
      setCurrentQuestionIndex(Math.max(0, questions().length - 2));
    }
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    setQuestions(prev => prev.map((q, i) => i === index ? { ...q, ...updates } : q));
  };

  const addOption = (questionIndex: number) => {
    const question = questions()[questionIndex];
    if (question.options.length >= 4) {
      alert('Máximo 4 opções por pergunta');
      return;
    }

    const colors = ['#dc2626', '#2563eb', '#16a34a', '#ca8a04'];
    const shapes: QuestionOption['shape'][] = ['circle', 'square', 'triangle', 'diamond'];
    const optionIndex = question.options.length;

    const newOption: QuestionOption = {
      id: `opt_${optionIndex}`,
      text: '',
      color: colors[optionIndex] || '#6b7280',
      shape: shapes[optionIndex] || 'circle'
    };

    updateQuestion(questionIndex, {
      options: [...question.options, 