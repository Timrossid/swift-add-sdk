import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Ad402Slot } from '../Ad402Slot';
import { Ad402Provider } from '../Ad402Provider';
import * as utils from '../../utils';
// Mock the util function
jest.mock('../../utils', () => ({
    ...jest.requireActual('../../utils'),
    retryAsync: jest.fn(),
}));
const mockConfig = {
    websiteId: 'test-site-id',
    walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    apiBaseUrl: 'https://test-api.ad402.io',
    theme: {
        primaryColor: '#000000',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        borderColor: '#e5e5e5',
    }
};
describe('Ad402Slot Error Handling', () => {
    let originalOnLine;
    beforeEach(() => {
        jest.clearAllMocks();
        originalOnLine = navigator.onLine;
        // Reset online status
        Object.defineProperty(navigator, 'onLine', {
            configurable: true,
            value: true,
        });
    });
    afterEach(() => {
        Object.defineProperty(navigator, 'onLine', {
            configurable: true,
            value: originalOnLine,
        });
    });
    const TestWrapper = ({ children }) => (_jsx(Ad402Provider, { config: mockConfig, children: children }));
    it('should render the loading state initially', () => {
        utils.retryAsync.mockImplementation(() => new Promise(() => { }));
        // Mock queue info fetch as resolving empty queue
        global.fetch = jest.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ totalInQueue: 0, isAvailable: true }),
        }));
        render(_jsx(TestWrapper, { children: _jsx(Ad402Slot, { slotId: "slot-1", size: "banner", price: "0.25" }) }));
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
    it('should render offline UI if navigator is offline', async () => {
        Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
        utils.retryAsync.mockRejectedValue(new Error('NETWORK_OFFLINE'));
        global.fetch = jest.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ totalInQueue: 0, isAvailable: true }),
        }));
        await act(async () => {
            render(_jsx(TestWrapper, { children: _jsx(Ad402Slot, { slotId: "slot-1", size: "banner", price: "0.25" }) }));
        });
        expect(screen.getByText('Please check your internet connection.')).toBeInTheDocument();
    });
    it('should render error UI on API failure', async () => {
        const error = new Error('Test API Error');
        utils.retryAsync.mockRejectedValue(error);
        global.fetch = jest.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ totalInQueue: 0, isAvailable: true }),
        }));
        await act(async () => {
            render(_jsx(TestWrapper, { children: _jsx(Ad402Slot, { slotId: "slot-1", size: "banner", price: "0.25" }) }));
        });
        expect(screen.getByText("We're having trouble loading this ad.")).toBeInTheDocument();
        expect(screen.getByText('Test API Error')).toBeInTheDocument();
    });
    it('should allow manual retry from error state', async () => {
        const error = new Error('Test API Error');
        utils.retryAsync.mockRejectedValueOnce(error).mockResolvedValueOnce({
            json: () => Promise.resolve({ hasAd: false })
        });
        global.fetch = jest.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ totalInQueue: 0, isAvailable: true }),
        }));
        await act(async () => {
            render(_jsx(TestWrapper, { children: _jsx(Ad402Slot, { slotId: "slot-1", size: "banner", price: "0.25" }) }));
        });
        const retryButton = screen.getByRole('button', { name: /Retry/i });
        expect(retryButton).toBeInTheDocument();
        await act(async () => {
            fireEvent.click(retryButton);
        });
        expect(utils.retryAsync).toHaveBeenCalledTimes(2);
    });
});
