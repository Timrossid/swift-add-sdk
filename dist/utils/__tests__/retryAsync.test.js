import { retryAsync } from '../index';
describe('retryAsync', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });
    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });
    it('should resolve immediately if the function succeeds', async () => {
        const fn = jest.fn().mockResolvedValue('success');
        const result = await retryAsync(fn);
        expect(result).toBe('success');
        expect(fn).toHaveBeenCalledTimes(1);
    });
    it('should retry and eventually succeed', async () => {
        const fn = jest.fn()
            .mockRejectedValueOnce(new Error('fail 1'))
            .mockRejectedValueOnce(new Error('fail 2'))
            .mockResolvedValue('success');
        const promise = retryAsync(fn, { retries: 3, delay: 100 });
        // First attempt fails, waits 100ms
        await Promise.resolve();
        jest.advanceTimersByTime(100);
        // Second attempt fails, waits 200ms
        await Promise.resolve();
        jest.advanceTimersByTime(200);
        const result = await promise;
        expect(result).toBe('success');
        expect(fn).toHaveBeenCalledTimes(3);
    });
    it('should throw if retries are exhausted', async () => {
        const error = new Error('fail');
        const fn = jest.fn().mockRejectedValue(error);
        const promise = retryAsync(fn, { retries: 2, delay: 100 });
        // Attempt 1 fails, waits 100ms
        await Promise.resolve();
        jest.advanceTimersByTime(100);
        // Attempt 2 fails, waits 200ms
        await Promise.resolve();
        jest.advanceTimersByTime(200);
        // Attempt 3 fails, throws
        await expect(promise).rejects.toThrow('fail');
        expect(fn).toHaveBeenCalledTimes(3);
    });
    it('should stop retrying on 4xx errors by default', async () => {
        const error = new Error('Not found');
        error.status = 404;
        const fn = jest.fn().mockRejectedValue(error);
        await expect(retryAsync(fn)).rejects.toThrow('Not found');
        expect(fn).toHaveBeenCalledTimes(1); // Only tried once
    });
    it('should retry on 5xx errors by default', async () => {
        const error = new Error('Server error');
        error.status = 500;
        const fn = jest.fn()
            .mockRejectedValueOnce(error)
            .mockResolvedValue('success');
        const promise = retryAsync(fn, { delay: 10 });
        await Promise.resolve();
        jest.advanceTimersByTime(10);
        const result = await promise;
        expect(result).toBe('success');
        expect(fn).toHaveBeenCalledTimes(2);
    });
    it('should abort if signal is aborted initially', async () => {
        const controller = new AbortController();
        controller.abort();
        const fn = jest.fn();
        await expect(retryAsync(fn, { signal: controller.signal }))
            .rejects.toThrow('Aborted');
        expect(fn).not.toHaveBeenCalled();
    });
    it('should stop retrying if aborted during retry wait', async () => {
        const fn = jest.fn().mockRejectedValue(new Error('fail'));
        const controller = new AbortController();
        const promise = retryAsync(fn, { retries: 5, delay: 1000, signal: controller.signal });
        // After first failure, while waiting, we abort it
        await Promise.resolve();
        controller.abort();
        jest.advanceTimersByTime(1000); // this timer won't matter because it rejects early
        await expect(promise).rejects.toThrow('Aborted');
        expect(fn).toHaveBeenCalledTimes(1);
    });
});
