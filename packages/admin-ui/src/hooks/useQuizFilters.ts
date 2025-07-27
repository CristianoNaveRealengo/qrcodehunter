import { createSignal } from 'solid-js';

/**
 * Hook customizado para gerenciar filtros de quiz
 * Implementa Single Responsibility Principle separando a lógica de filtros
 */
export const useQuizFilters = () => {
  const [searchTerm, setSearchTerm] = createSignal('');
  const [filterActive, setFilterActive] = createSignal<'all' | 'active' | 'inactive'>('all');

  /**
   * Aplica filtros em uma lista de quizzes
   * @param quizzes Lista de quizzes para filtrar
   * @returns Lista filtrada de quizzes
   */
  const applyFilters = (quizzes: any[]) => {
    let filtered = quizzes;
    
    // Filtro por termo de busca - busca em título e descrição
    if (searchTerm()) {
      const searchLower = searchTerm().toLowerCase();
      filtered = filtered.filter(quiz => 
        quiz.title.toLowerCase().includes(searchLower) ||
        (quiz.description?.toLowerCase() || '').includes(searchLower)
      );
    }
    
    // Filtro por status ativo/inativo
    if (filterActive() !== 'all') {
      const isActiveFilter = filterActive() === 'active';
      filtered = filtered.filter(quiz => quiz.isActive === isActiveFilter);
    }
    
    return filtered;
  };

  /**
   * Limpa todos os filtros
   */
  const clearFilters = () => {
    setSearchTerm('');
    setFilterActive('all');
  };

  return {
    searchTerm,
    setSearchTerm,
    filterActive,
    setFilterActive,
    applyFilters,
    clearFilters
  };
};