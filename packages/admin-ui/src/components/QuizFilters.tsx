import { Component } from 'solid-js';

/**
 * Componente de filtros para lista de quizzes
 * Implementa Interface Segregation Principle com interface específica
 */
interface QuizFiltersProps {
  searchTerm: () => string;
  setSearchTerm: (term: string) => void;
  filterActive: () => 'all' | 'active' | 'inactive';
  setFilterActive: (filter: 'all' | 'active' | 'inactive') => void;
  totalQuizzes: number;
  activeQuizzes: number;
  inactiveQuizzes: number;
}

export const QuizFilters: Component<QuizFiltersProps> = (props) => {
  return (
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex flex-col sm:flex-row gap-4">
        {/* Campo de Busca */}
        <div class="flex-1">
          <div class="relative">
            <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar quizzes por título ou descrição..."
              value={props.searchTerm()}
              onInput={(e) => props.setSearchTerm(e.currentTarget.value)}
              class="input pl-10"
            />
          </div>
        </div>

        {/* Filtros por Status */}
        <div class="flex space-x-2">
          <FilterButton
            active={props.filterActive() === 'all'}
            onClick={() => props.setFilterActive('all')}
            variant="primary"
          >
            Todos ({props.totalQuizzes})
          </FilterButton>
          
          <FilterButton
            active={props.filterActive() === 'active'}
            onClick={() => props.setFilterActive('active')}
            variant="success"
          >
            Ativos ({props.activeQuizzes})
          </FilterButton>
          
          <FilterButton
            active={props.filterActive() === 'inactive'}
            onClick={() => props.setFilterActive('inactive')}
            variant="gray"
          >
            Inativos ({props.inactiveQuizzes})
          </FilterButton>
        </div>
      </div>
    </div>
  );
};

/**
 * Componente de botão de filtro reutilizável
 * Implementa Open/Closed Principle - extensível para novos tipos
 */
interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  variant: 'primary' | 'success' | 'gray';
  children: any;
}

const FilterButton: Component<FilterButtonProps> = (props) => {
  const getVariantClasses = () => {
    const baseClasses = 'px-4 py-2 rounded-lg text-sm font-medium transition-colors';
    
    if (props.active) {
      switch (props.variant) {
        case 'primary':
          return `${baseClasses} bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300`;
        case 'success':
          return `${baseClasses} bg-success-100 dark:bg-success-900/20 text-success-700 dark:text-success-300`;
        case 'gray':
          return `${baseClasses} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300`;
        default:
          return baseClasses;
      }
    }
    
    return `${baseClasses} text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700`;
  };

  return (
    <button
      onClick={props.onClick}
      class={getVariantClasses()}
    >
      {props.children}
    </button>
  );
};

// Ícone de busca
const SearchIcon: Component<{ class?: string }> = (props) => (
  <svg class={props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);