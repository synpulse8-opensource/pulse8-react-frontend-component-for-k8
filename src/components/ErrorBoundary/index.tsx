import { Component, type ReactNode, type ErrorInfo } from 'react'

/**
 * Props for the ErrorBoundary component
 */
export interface IErrorBoundaryProps {
    /** Child components to wrap */
    children: ReactNode
    /** Custom fallback UI when an error occurs */
    fallback?: ReactNode
    /** Custom error renderer function */
    renderError?: (error: Error, resetError: () => void) => ReactNode
    /** Callback when an error is caught */
    onError?: (error: Error, errorInfo: ErrorInfo) => void
}

/**
 * State for the ErrorBoundary component
 */
interface IErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in the child
 * component tree, logs those errors, and displays a fallback UI.
 *
 * This is critical for preventing the entire chat UI from crashing due to
 * malformed message content or rendering errors.
 *
 * @example
 * ```tsx
 * import { ErrorBoundary } from '@pulse8-ai/chat'
 *
 * <ErrorBoundary
 *   fallback={<div>Something went wrong</div>}
 *   onError={(error) => logToService(error)}
 * >
 *   <ChatPanel {...props} />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<IErrorBoundaryProps, IErrorBoundaryState> {
    constructor(props: IErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): IErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Log error to console in development
        console.error('ErrorBoundary caught an error:', error, errorInfo)

        // Call optional error callback for external logging
        this.props.onError?.(error, errorInfo)
    }

    /**
     * Resets the error state, allowing the component to try rendering again
     */
    resetError = (): void => {
        this.setState({ hasError: false, error: null })
    }

    render(): ReactNode {
        if (this.state.hasError) {
            // Use custom error renderer if provided
            if (this.props.renderError && this.state.error) {
                return this.props.renderError(this.state.error, this.resetError)
            }

            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback
            }

            // Default fallback UI
            return (
                <div
                    role='alert'
                    aria-live='assertive'
                    className='p-4 rounded-lg border border-red-200 bg-red-50 text-red-800'
                >
                    <h3 className='font-semibold mb-2'>Something went wrong</h3>
                    <p className='text-sm mb-3'>An error occurred while rendering this content.</p>
                    <button
                        onClick={this.resetError}
                        className='text-sm px-3 py-1 bg-red-100 hover:bg-red-200 rounded transition-colors'
                        type='button'
                    >
                        Try again
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}

/**
 * Props for the MessageErrorBoundary component
 */
export interface IMessageErrorBoundaryProps {
    /** Child components to wrap */
    children: ReactNode
    /** Message ID for identification */
    messageId?: string
    /** Callback when an error is caught */
    onError?: (error: Error, messageId?: string) => void
}

/**
 * Specialized error boundary for message content rendering.
 * Provides a more contextual fallback UI for chat messages.
 *
 * @example
 * ```tsx
 * <MessageErrorBoundary messageId={message.id}>
 *   <MessageContentRenderer message={message} />
 * </MessageErrorBoundary>
 * ```
 */
export class MessageErrorBoundary extends Component<
    IMessageErrorBoundaryProps,
    IErrorBoundaryState
> {
    constructor(props: IMessageErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): IErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error(
            `MessageErrorBoundary caught error for message ${this.props.messageId}:`,
            error,
            errorInfo,
        )
        this.props.onError?.(error, this.props.messageId)
    }

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div
                    role='alert'
                    aria-live='polite'
                    className='p-3 rounded-lg text-sm opacity-70 italic'
                >
                    Unable to display this message content.
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
