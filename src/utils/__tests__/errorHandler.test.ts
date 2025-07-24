import { Alert } from 'react-native';
import { ErrorHandler } from '../errorHandler';

// Mock do Alert
jest.mock('react-native', () => ({
	Alert: {
		alert: jest.fn(),
	},
}));

const mockAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;

describe('ErrorHandler', () => {
	beforeEach(() => {
		mockAlert.mockClear();
		jest.clearAllMocks();
	});

	describe('handleError', () => {
		it('deve exibir alerta para erro conhecido', () => {
			ErrorHandler.handleError('CAMERA_PERMISSION_DENIED');

			expect(mockAlert).toHaveBeenCalledWith(
				'⚠️ Erro Importante',
				'Precisamos da sua câmera para escanear os códigos QR. Por favor, permita o acesso.',
				[{ text: 'OK', style: 'default' }]
			);
		});

		it('deve exibir alerta para erro desconhecido', () => {
			ErrorHandler.handleError('ERRO_INEXISTENTE');

			expect(mockAlert).toHaveBeenCalledWith(
				'Erro',
				'Algo deu errado. Tente novamente.',
				[{ text: 'OK', style: 'default' }]
			);
		});

		it('deve usar mensagem customizada quando fornecida', () => {
			const customMessage = 'Mensagem personalizada';
			ErrorHandler.handleError('CAMERA_PERMISSION_DENIED', customMessage);

			expect(mockAlert).toHaveBeenCalledWith(
				'⚠️ Erro Importante',
				customMessage,
				[{ text: 'OK', style: 'default' }]
			);
		});

		it('deve exibir título correto para diferentes severidades', () => {
			// Teste para severidade 'low'
			ErrorHandler.handleError('TEAM_NAME_REQUIRED');
			expect(mockAlert).toHaveBeenCalledWith(
				'Atenção',
				expect.any(String),
				expect.any(Array)
			);

			// Teste para severidade 'medium'
			ErrorHandler.handleError('GAME_NOT_ACTIVE');
			expect(mockAlert).toHaveBeenCalledWith(
				'Erro',
				expect.any(String),
				expect.any(Array)
			);

			// Teste para severidade 'high'
			ErrorHandler.handleError('STORAGE_SAVE_FAILED');
			expect(mockAlert).toHaveBeenCalledWith(
				'⚠️ Erro Importante',
				expect.any(String),
				expect.any(Array)
			);
		});
	});

	describe('handleErrorWithCallback', () => {
		it('deve exibir alerta sem botão de retry quando callback não fornecido', () => {
			ErrorHandler.handleErrorWithCallback('INVALID_QR_CODE');

			expect(mockAlert).toHaveBeenCalledWith(
				'Atenção',
				'Este código QR não é válido para a gincana.',
				[{ text: 'OK', style: 'default' }]
			);
		});

		it('deve exibir alerta com botão de retry quando callback fornecido', () => {
			const mockCallback = jest.fn();
			ErrorHandler.handleErrorWithCallback('NETWORK_ERROR', mockCallback);

			expect(mockAlert).toHaveBeenCalledWith(
				'Erro',
				'Problema de conexão. Verifique sua internet.',
				[
					{ text: 'Tentar Novamente', style: 'default' },
					{ text: 'OK', style: 'default' }
				]
			);
		});

		it('deve usar mensagem customizada', () => {
			const mockRetry = jest.fn();
			const customMessage = 'Erro personalizado';
			ErrorHandler.handleErrorWithCallback('NETWORK_ERROR', mockRetry, customMessage);

			expect(mockAlert).toHaveBeenCalledWith(
				'Erro',
				customMessage,
				[
					{ text: 'Tentar Novamente', style: 'default' },
					{ text: 'OK', style: 'default' }
				]
			);
		});
	});

	describe('handleCriticalError', () => {
		it('deve exibir alerta crítico sem botão de reiniciar quando callback não fornecido', () => {
			ErrorHandler.handleCriticalError('UNKNOWN_ERROR');

			expect(mockAlert).toHaveBeenCalledWith(
				'⚠️ Erro Crítico',
				'Algo deu errado. Tente novamente.\n\nO app precisa ser reiniciado.',
				[
					{
						text: 'Reiniciar',
						style: 'default',
						onPress: expect.any(Function),
					},
				],
				{ cancelable: false }
			);
		});

		it('deve exibir alerta crítico com botão de reiniciar quando callback fornecido', () => {
			const mockRestart = jest.fn();
			ErrorHandler.handleCriticalError('STORAGE_SAVE_FAILED', mockRestart);

			expect(mockAlert).toHaveBeenCalledWith(
				'⚠️ Erro Crítico',
				'Não foi possível salvar os dados. Tente novamente.\n\nO app precisa ser reiniciado.',
				[
					{
						text: 'Reiniciar',
						style: 'default',
						onPress: mockRestart,
					},
				],
				{ cancelable: false }
			);
		});
	});

	describe('logError', () => {
		it('deve registrar erro no console', () => {
			const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
			const testError = new Error('Erro de teste');
			
			ErrorHandler.logError(testError, 'TEST_CONTEXT');

			expect(consoleSpy).toHaveBeenCalledTimes(2);
			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining('[TEST_CONTEXT] Error: Erro de teste')
			);
			expect(consoleSpy).toHaveBeenCalledWith(testError.stack);

			consoleSpy.mockRestore();
		});
	});

	describe('getErrorMessage', () => {
		it('deve retornar mensagem de erro conhecido', () => {
			const message = ErrorHandler.getErrorMessage('CAMERA_PERMISSION_DENIED');

			expect(message).toBe('Precisamos da sua câmera para escanear os códigos QR. Por favor, permita o acesso.');
		});

		it('deve retornar mensagem de erro desconhecido para código inexistente', () => {
			const message = ErrorHandler.getErrorMessage('CODIGO_INEXISTENTE');

			expect(message).toBe('Erro desconhecido');
		});
	});
});