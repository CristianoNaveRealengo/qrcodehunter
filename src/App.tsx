import React from 'react';
import { GameProvider } from './context/GameContext';
import ErrorBoundary from './utils/errorBoundary';
import WelcomeScreen from './screens/WelcomeScreen';

// Versão web do App - compatível com Vite
// Remove componentes React Native e usa componentes web
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <GameProvider>
        <div style={{ 
          minHeight: '100vh', 
          backgroundColor: '#F8F9FA',
          padding: '20px'
        }}>
          <WelcomeScreen />
        </div>
      </GameProvider>
    </ErrorBoundary>
  );
};

export default App;