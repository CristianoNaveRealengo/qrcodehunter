// Paleta de cores amigável para crianças
export const colors = {
  // Cores primárias
  primary: '#FF6B6B',        // Vermelho coral
  secondary: '#4ECDC4',      // Turquesa
  tertiary: '#45B7D1',       // Azul céu
  
  // Cores de feedback
  success: '#96CEB4',        // Verde menta
  warning: '#FFEAA7',        // Amarelo suave
  error: '#FF6B6B',          // Vermelho coral
  
  // Cores neutras
  text: '#2D3436',           // Cinza escuro
  textLight: '#636E72',      // Cinza médio
  textMuted: '#A0A0A0',      // Cinza claro
  
  // Backgrounds
  background: '#F8F9FA',     // Cinza muito claro
  surface: '#FFFFFF',        // Branco
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Cores especiais
  gold: '#FFD700',           // Ouro para troféus
  silver: '#C0C0C0',         // Prata
  bronze: '#CD7F32',         // Bronze
  
  // Gradientes (para uso futuro)
  gradients: {
    primary: ['#FF6B6B', '#FF8E8E'],
    secondary: ['#4ECDC4', '#6ED5D0'],
    success: ['#96CEB4', '#A8D5C4'],
  },
};

// Tipografia
export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    huge: 32,
    massive: 48,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Espaçamentos
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
};

// Bordas e raios
export const borders = {
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    round: 50,
  },
  width: {
    thin: 1,
    medium: 2,
    thick: 3,
  },
};

// Sombras
export const shadows = {
  small: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  medium: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  large: {
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
};

// Animações
export const animations = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// Tema completo
export const theme = {
  colors,
  typography,
  spacing,
  borders,
  shadows,
  animations,
};