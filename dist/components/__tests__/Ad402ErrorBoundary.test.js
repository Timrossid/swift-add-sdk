import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Ad402ErrorBoundary } from '../Ad402ErrorBoundary';
const ThrowingComponent = ({ message }) => {
    throw new Error(message);
    return _jsx("div", { children: "Will not render" });
};
describe('Ad402ErrorBoundary', () => {
    beforeEach(() => {
        // Suppress console.error in tests to avoid noisy output
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('should render children when there is no error', () => {
        render(_jsx(Ad402ErrorBoundary, { children: _jsx("div", { children: "Healthy Child" }) }));
        expect(screen.getByText('Healthy Child')).toBeInTheDocument();
    });
    it('should render default fallback UI when an error is thrown', () => {
        render(_jsx(Ad402ErrorBoundary, { children: _jsx(ThrowingComponent, { message: "Test Error" }) }));
        expect(screen.getByText("We're having trouble loading this component.")).toBeInTheDocument();
    });
    it('should render custom fallback UI when provided', () => {
        render(_jsx(Ad402ErrorBoundary, { fallback: _jsx("div", { children: "Custom Error UI" }), children: _jsx(ThrowingComponent, { message: "Test Error" }) }));
        expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
    });
    it('should call onError callback when an error is thrown', () => {
        const onErrorMock = jest.fn();
        render(_jsx(Ad402ErrorBoundary, { onError: onErrorMock, children: _jsx(ThrowingComponent, { message: "Test Error" }) }));
        expect(onErrorMock).toHaveBeenCalledTimes(1);
        expect(onErrorMock).toHaveBeenCalledWith(expect.any(Error), expect.objectContaining({ componentStack: expect.any(String) }));
    });
    it('should show debug info in debug mode', () => {
        render(_jsx(Ad402ErrorBoundary, { debug: true, children: _jsx(ThrowingComponent, { message: "Super Secret Test Error" }) }));
        expect(screen.getByText('Debug Details (Hidden in Production)')).toBeInTheDocument();
        expect(screen.getByText(/Super Secret Test Error/)).toBeInTheDocument();
    });
});
