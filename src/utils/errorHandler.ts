import { Alert } from 'react-native';

export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class ErrorHandler {
  private static errors: { [key: string]: AppError } = {
    // Erros de câmera
    CAMERA_PERMISSION_DENIED: {
      code: 'CAMERA_PERMISSION_DENIED',
      message: 'Camera permission denied',
      userMessage: 'Precisamos da sua câmera para escanear os códigos QR. Por favor, permita o acesso.',
      severity: 'high',
    },
    CAMERA_NOT_AVAILABLE: {
      code: 'CAMERA_NOT_AVAILABLE',
      message: 'Camera not available',
      userMessage: 'A câmera não está disponível no seu dispositivo.',
      severity: 'high',
    },
    CAMERA_INITIALIZATION_FAILED: {
      code: 'CAMERA_INITIALIZATION_FAILED',
      message: 'Failed to initialize camera',
      userMessage: 'Não foi possível inicializar a câmera. Tente novamente.',
      severity: 'medium',
    },

    // Erros de QR Code
    INVALID_QR_CODE: {
      code: 'INVALID_QR_CODE',
      message: 'Invalid QR code format',
      userMessage: 'Este código QR não é válido para a gincana.',
      severity: 'low',
    },
    QR_CODE_ALREADY_SCANNED: {
      code: 'QR_CODE_ALREADY_SCANNED',
      message: 'QR code already scanned by team',
      userMessage: 'Sua equipe já escaneou este código QR!',
      severity: 'low',
    },
    QR_CODE_NOT_FOUND: {
      code: 'QR_CODE_NOT_FOUND',
      message: 'QR code not found in system',
      userMessage: 'Este código QR não foi encontrado no sistema.',
      severity: 'medium',
    },

    // Erros de equipe
    TEAM_NAME_REQUIRED: {
      code: 'TEAM_NAME_REQUIRED',
      message: 'Team name is required',
      userMessage: 'Por favor, digite o nome da sua equipe.',
      severity: 'low',
    },
    TEAM_NAME_TOO_SHORT: {
      code: 'TEAM_NAME_TOO_SHORT',
      message: 'Team name too short',
      userMessage: 'O nome da equipe deve ter pelo menos 3 caracteres.',
      severity: 'low',
    },
    TEAM_NAME_ALREADY_EXISTS: {
      code: 'TEAM_NAME_ALREADY_EXISTS',
      message: 'Team name already exists',
      userMessage: 'Já existe uma equipe com este nome. Escolha outro.',
      severity: 'low',
    },
    NO_PARTICIPANTS: {
      code: 'NO_PARTICIPANTS',
      message: 'No participants added',
      userMessage: 'Adicione pelo menos um participante à equipe.',
      severity: 'low',
    },
    TOO_MANY_PARTICIPANTS: {
      code: 'TOO_MANY_PARTICIPANTS',
      message: 'Too many participants',
      userMessage: 'Máximo de 10 participantes por equipe.',
      severity: 'low',
    },

    // Erros de jogo
    GAME_NOT_ACTIVE: {
      code: 'GAME_NOT_ACTIVE',
      message: 'Game is not active',
      userMessage: 'O jogo não está ativo no momento.',
      severity: 'medium',
    },
    NO_TEAM_SELECTED: {
      code: 'NO_TEAM_SELECTED',
      message: 'No team selected',
      userMessage: 'Nenhuma equipe foi selecionada.',
      severity: 'medium',
    },
    GAME_ALREADY_ENDED: {
      code: 'GAME_ALREADY_ENDED',
      message: 'Game has already ended',
      userMessage: 'O jogo já foi finalizado.',
      severity: 'medium',
    },
    NO_QR_CODES_GENERATED: {
      code: 'NO_QR_CODES_GENERATED',
      message: 'No QR codes generated',
      userMessage: 'Nenhum código QR foi gerado ainda.',
      severity: 'medium',
    },

    // Erros de armazenamento
    STORAGE_SAVE_FAILED: {
      code: 'STORAGE_SAVE_FAILED',
      message: 'Failed to save data to storage',
      userMessage: 'Não foi possível salvar os dados. Tente novamente.',
      severity: 'high',
    },
    STORAGE_LOAD_FAILED: {
      code: 'STORAGE_LOAD_FAILED',
      message: 'Failed to load data from storage',
      userMessage: 'Erro ao carregar dados salvos.',
      severity: 'medium',
    },

    // Erros de administração
    INVALID_ADMIN_PASSWORD: {
      code: 'INVALID_ADMIN_PASSWORD',
      message: 'Invalid admin password',
      userMessage: 'Senha de administrador incorreta.',
      severity: 'low',
    },
    ADMIN_PASSWORD_REQUIRED: {
      code: 'ADMIN_PASSWORD_REQUIRED',
      message: 'Admin password required',
      userMessage: 'Digite a senha de administrador.',
      severity: 'low',
    },

    // Erros gerais
    NETWORK_ERROR: {
      code: 'NETWORK_ERROR',
      message: 'Network connection error',
      userMessage: 'Problema de conexão. Verifique sua internet.',
      severity: 'medium',
    },
    UNKNOWN_ERROR: {
      code: 'UNKNOWN_ERROR',
      message: 'Unknown error occurred',
      userMessage: 'Algo deu errado. Tente novamente.',
      severity: 'medium',
    },
  };

  static handleError(errorCode: string, customMessage?: string): void {
    const error = this.errors[errorCode] || this.errors.UNKNOWN_ERROR;
    const message = customMessage || error.userMessage;

    // Log do erro para debugging
    console.error(`[${error.code}] ${error.message}`);

    // Mostrar alerta amigável para o usuário
    Alert.alert(
      this.getErrorTitle(error.severity),
      message,
      [{ text: 'OK', style: 'default' }]
    );
  }

  static handleErrorWithCallback(
    errorCode: string,
    onRetry?: () => void,
    customMessage?: string
  ): void {
    const error = this.errors[errorCode] || this.errors.UNKNOWN_ERROR;
    const message = customMessage || error.userMessage;

    console.error(`[${error.code}] ${error.message}`);

    const buttons = [{ text: 'OK', style: 'default' as const }];
    
    if (onRetry) {
      buttons.unshift({
        text: 'Tentar Novamente',
        style: 'default' as const,
        onPress: onRetry,
      });
    }

    Alert.alert(
      this.getErrorTitle(error.severity),
      message,
      buttons
    );
  }

  static handleCriticalError(errorCode: string, onRestart?: () => void): void {
    const error = this.errors[errorCode] || this.errors.UNKNOWN_ERROR;

    console.error(`[CRITICAL] [${error.code}] ${error.message}`);

    Alert.alert(
      '⚠️ Erro Crítico',
      error.userMessage + '\n\nO app precisa ser reiniciado.',
      [
        {
          text: 'Reiniciar',
          style: 'default',
          onPress: onRestart || (() => {}),
        },
      ],
      { cancelable: false }
    );
  }

  private static getErrorTitle(severity: string): string {
    switch (severity) {
      case 'low':
        return 'Atenção';
      case 'medium':
        return 'Erro';
      case 'high':
        return '⚠️ Erro Importante';
      case 'critical':
        return '🚨 Erro Crítico';
      default:
        return 'Erro';
    }
  }

  static logError(error: Error, context?: string): void {
    const timestamp = new Date().toISOString();
    const contextInfo = context ? ` [${context}]` : '';
    
    console.error(`${timestamp}${contextInfo} ${error.name}: ${error.message}`);
    console.error(error.stack);
  }

  static createCustomError(
    code: string,
    message: string,
    userMessage: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): void {
    this.errors[code] = {
      code,
      message,
      userMessage,
      severity,
    };
  }

  static getErrorMessage(errorCode: string): string {
    const error = this.errors[errorCode];
    return error ? error.userMessage : 'Erro desconhecido';
  }
}

// Hook para tratamento de erros em componentes
export const useErrorHandler = () => {
  const handleError = (errorCode: string, customMessage?: string) => {
    ErrorHandler.handleError(errorCode, customMessage);
  };

  const handleErrorWithRetry = (
    errorCode: string,
    onRetry: () => void,
    customMessage?: string
  ) => {
    ErrorHandler.handleErrorWithCallback(errorCode, onRetry, customMessage);
  };

  const handleCriticalError = (errorCode: string, onRestart?: () => void) => {
    ErrorHandler.handleCriticalError(errorCode, onRestart);
  };

  return {
    handleError,
    handleErrorWithRetry,
    handleCriticalError,
  };
};