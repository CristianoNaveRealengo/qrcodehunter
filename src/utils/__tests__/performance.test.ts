import { InteractionManager } from 'react-native';
import {
	runAfterInteractions,
	debounce,
	throttle,
	ResourceManager,
	areEqual,
} from '../performance';

// Mock do InteractionManager
jest.mock('react-native', () => ({
	InteractionManager: {
		runAfterInteractions: jest.fn(),
	},
}));

const mockRunAfterInteractions = InteractionManager.runAfterInteractions as jest.MockedFunction<
	typeof InteractionManager.runAfterInteractions
>;

describe('Performance Utils', () => {
	describe('runAfterInteractions', () => {
		it('deve chamar InteractionManager.runAfterInteractions', () => {
			const callback = jest.fn();
			runAfterInteractions(callback);

			expect(mockRunAfterInteractions).toHaveBeenCalledWith(callback);
		});
	});

	describe('debounce', () => {
		beforeEach(() => {
			jest.useFakeTimers();
		});

		afterEach(() => {
			jest.useRealTimers();
		});

		it('deve atrasar a execução da função', () => {
			const mockFn = jest.fn();
			const debouncedFn = debounce(mockFn, 100);

			debouncedFn('test');
			expect(mockFn).not.toHaveBeenCalled();

			jest.advanceTimersByTime(100);
			expect(mockFn).toHaveBeenCalledWith('test');
		});

		it('deve cancelar execução anterior se chamada novamente', () => {
			const mockFn = jest.fn();
			const debouncedFn = debounce(mockFn, 100);

			debouncedFn('first');
			jest.advanceTimersByTime(50);
			debouncedFn('second');
			jest.advanceTimersByTime(100);

			expect(mockFn).toHaveBeenCalledTimes(1);
			expect(mockFn).toHaveBeenCalledWith('second');
		});
	});

	describe('throttle', () => {
		beforeEach(() => {
			jest.useFakeTimers();
		});

		afterEach(() => {
			jest.useRealTimers();
		});

		it('deve executar função imediatamente na primeira chamada', () => {
			const mockFn = jest.fn();
			const throttledFn = throttle(mockFn, 100);

			throttledFn('test');
			expect(mockFn).toHaveBeenCalledWith('test');
		});

		it('deve ignorar chamadas subsequentes durante o período de throttle', () => {
			const mockFn = jest.fn();
			const throttledFn = throttle(mockFn, 100);

			throttledFn('first');
			throttledFn('second');
			throttledFn('third');

			expect(mockFn).toHaveBeenCalledTimes(1);
			expect(mockFn).toHaveBeenCalledWith('first');
		});

		it('deve permitir nova execução após o período de throttle', () => {
			const mockFn = jest.fn();
			const throttledFn = throttle(mockFn, 100);

			throttledFn('first');
			jest.advanceTimersByTime(100);
			throttledFn('second');

			expect(mockFn).toHaveBeenCalledTimes(2);
			expect(mockFn).toHaveBeenNthCalledWith(1, 'first');
			expect(mockFn).toHaveBeenNthCalledWith(2, 'second');
		});
	});

	describe('ResourceManager', () => {
		let resourceManager: ResourceManager;

		beforeEach(() => {
			resourceManager = new ResourceManager();
			jest.useFakeTimers();
		});

		afterEach(() => {
			jest.useRealTimers();
		});

		it('deve adicionar e limpar timers', () => {
			const timer = setTimeout(() => {}, 1000);
			resourceManager.addTimer(timer);

			const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
			resourceManager.cleanup();

			expect(clearTimeoutSpy).toHaveBeenCalledWith(timer);
			clearTimeoutSpy.mockRestore();
		});

		it('deve adicionar e limpar intervals', () => {
			const interval = setInterval(() => {}, 1000);
			resourceManager.addInterval(interval);

			const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
			resourceManager.cleanup();

			expect(clearIntervalSpy).toHaveBeenCalledWith(interval);
			clearIntervalSpy.mockRestore();
		});

		it('deve adicionar e executar cleanup de listeners', () => {
			const mockCleanup = jest.fn();
			resourceManager.addListener(mockCleanup);

			resourceManager.cleanup();

			expect(mockCleanup).toHaveBeenCalled();
		});

		it('deve limpar múltiplos recursos', () => {
			const timer = setTimeout(() => {}, 1000);
			const interval = setInterval(() => {}, 1000);
			const mockCleanup = jest.fn();

			resourceManager.addTimer(timer);
			resourceManager.addInterval(interval);
			resourceManager.addListener(mockCleanup);

			const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
			const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

			resourceManager.cleanup();

			expect(clearTimeoutSpy).toHaveBeenCalledWith(timer);
			expect(clearIntervalSpy).toHaveBeenCalledWith(interval);
			expect(mockCleanup).toHaveBeenCalled();

			clearTimeoutSpy.mockRestore();
			clearIntervalSpy.mockRestore();
		});
	});

	describe('areEqual', () => {
		it('deve retornar true para objetos iguais', () => {
			const obj1 = { name: 'test', value: 123 };
			const obj2 = { name: 'test', value: 123 };

			expect(areEqual(obj1, obj2)).toBe(true);
		});

		it('deve retornar false para objetos diferentes', () => {
			const obj1 = { name: 'test', value: 123 };
			const obj2 = { name: 'test', value: 456 };

			expect(areEqual(obj1, obj2)).toBe(false);
		});

		it('deve retornar true para valores primitivos iguais', () => {
			expect(areEqual('test', 'test')).toBe(true);
			expect(areEqual(123, 123)).toBe(true);
			expect(areEqual(true, true)).toBe(true);
		});

		it('deve retornar false para valores primitivos diferentes', () => {
			expect(areEqual('test', 'other')).toBe(false);
			expect(areEqual(123, 456)).toBe(false);
			expect(areEqual(true, false)).toBe(false);
		});

		it('deve retornar true para arrays iguais', () => {
			const arr1 = [1, 2, 3];
			const arr2 = [1, 2, 3];

			expect(areEqual(arr1, arr2)).toBe(true);
		});

		it('deve retornar false para arrays diferentes', () => {
			const arr1 = [1, 2, 3];
			const arr2 = [1, 2, 4];

			expect(areEqual(arr1, arr2)).toBe(false);
		});
	});
});