import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
export class Ad402ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        // Log the error using the provided tracking callback or default to console.error in debug mode
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
        else if (this.props.debug) {
            console.error('Ad402 SDK Error Boundary Caught an Error:', error, errorInfo);
        }
    }
    render() {
        if (this.state.hasError) {
            // Render user-defined fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }
            // Default error UI
            return (_jsxs("div", { style: {
                    padding: '24px',
                    margin: '16px 0',
                    border: '1px solid #ffcccc',
                    borderRadius: '8px',
                    backgroundColor: '#ffe6e6',
                    color: '#c00000',
                    fontFamily: 'sans-serif',
                    fontSize: '14px',
                    textAlign: 'left'
                }, role: "alert", children: [_jsx("h3", { style: { margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold' }, children: "We're having trouble loading this component." }), _jsx("p", { style: { margin: '0' }, children: "Please try refreshing the page or contact support if the problem persists." }), this.props.debug && this.state.error && (_jsxs("details", { style: { marginTop: '16px', backgroundColor: '#fff', padding: '12px', borderRadius: '4px', overflowX: 'auto' }, children: [_jsx("summary", { style: { cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px' }, children: "Debug Details (Hidden in Production)" }), _jsxs("pre", { style: { margin: 0, fontSize: '12px', color: '#333' }, children: [this.state.error.toString(), _jsx("br", {}), this.state.errorInfo?.componentStack] })] }))] }));
        }
        return this.props.children;
    }
}
