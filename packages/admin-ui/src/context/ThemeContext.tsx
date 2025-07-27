import { createStorageSignal } from '@solid-primitives/storage';
import { createContext, onMount, ParentComponent, useContext } from 'solid-js';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: () => Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>();

/**
 * Provider de tema com persistência local
 * Implementa tema claro/escuro com acessibilidade
 */
export const ThemeProvider: ParentComponent = (props) => {
  const [theme, setTheme] = createStorageSignal<Theme>('quiz-theme', 'light');

  const toggleTheme = () => {
    setTheme(theme() === 'light' ? 'dark' : 'light');
  };

  // Aplicar tema ao documento
  onMount(() => {
    const updateTheme = () => {
      const root = document.documentElement;
      if (theme() === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    updateTheme();
    
    // Observar mudanças no tema
    const unsubscribe = () => updateTheme();
    return unsubscribe;
  });

  const contextValue: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {props.children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return context;
};