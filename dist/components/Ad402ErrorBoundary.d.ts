import React, { Component, ErrorInfo, ReactNode } from 'react';
export interface Ad402ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, info: ErrorInfo) => void;
    debug?: boolean;
}
interface Ad402ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}
export declare class Ad402ErrorBoundary extends Component<Ad402ErrorBoundaryProps, Ad402ErrorBoundaryState> {
    constructor(props: Ad402ErrorBoundaryProps);
    static getDerivedStateFromError(error: Error): Ad402ErrorBoundaryState;
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    render(): string | number | boolean | Iterable<React.ReactNode> | import("react/jsx-runtime").JSX.Element | null | undefined;
}
export {};
//# sourceMappingURL=Ad402ErrorBoundary.d.ts.map