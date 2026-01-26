import { useState, useCallback, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { IMessage, IPdfFile, IContentSegment } from '../types'
import type { IStreamEvent } from '../context/ChatConfigContext'

// Re-export IStreamEvent for backward compatibility
export type { IStreamEvent } from '../context/ChatConfigContext'

/**
 * Parameters passed to the sendMessageToApi callback function.
 * These parameters provide everything needed to make an API call
 * and process the streaming response.
 */
export interface ISendMessageParams {
    /** The user's input message text */
    userInput: string
    /** Array of uploaded PDF file UUIDs to include with the message */
    pdfUuids?: string[]
    /** The AI model to use for this request */
    modelName: string
    /** Callback to handle each streaming event */
    onEvent: (event: IStreamEvent) => void
    /** Callback called when streaming completes successfully */
    onComplete: () => void
    /** Callback called when an error occurs */
    onError: (error: Error) => void
    /** AbortSignal for cancelling the request */
    abortSignal?: AbortSignal
}

/**
 * Default maximum number of messages to keep in history.
 * Set to 0 for unlimited messages.
 */
export const DEFAULT_MAX_MESSAGES = 0

/**
 * Configuration options for the useChatMessages hook.
 */
export interface IUseChatMessagesOptions {
    /**
     * Function to send a message to the API.
     * This function should handle the actual API call and invoke the provided callbacks.
     *
     * @param params - Parameters including user input, callbacks, and abort signal
     *
     * @example
     * ```tsx
     * sendMessageToApi: async (params) => {
     *   await streamSSE({
     *     url: '/api/chat',
     *     body: { message: params.userInput, model: params.modelName },
     *     adapter: createOpenAIAdapter(),
     *     onEvent: params.onEvent,
     *     onComplete: params.onComplete,
     *     onError: params.onError,
     *     signal: params.abortSignal,
     *   })
     * }
     * ```
     */
    sendMessageToApi: (params: ISendMessageParams) => Promise<void>
    /**
     * Optional function to generate unique IDs for messages.
     * Defaults to UUID v4 generation.
     *
     * @example
     * ```tsx
     * generateId: () => `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`
     * ```
     */
    generateId?: () => string
    /**
     * Maximum number of messages to keep in history.
     * When exceeded, oldest messages are removed.
     * Set to 0 for unlimited messages (default).
     *
     * This helps prevent memory issues in long-running conversations.
     *
     * @example
     * ```tsx
     * // Keep only the last 100 messages
     * maxMessages: 100
     * ```
     */
    maxMessages?: number
}

/**
 * Hook to manage chat messages and streaming state
 * Handles all message state management and streaming event processing
 * API calls are handled externally via sendMessageToApi callback
 *
 * @example
 * ```tsx
 * const { messages, sendMessage, isStreaming } = useChatMessages({
 *   sendMessageToApi: async (params) => {
 *     await myApiService.sendMessage(params)
 *   },
 * })
 * ```
 */
export const useChatMessages = (options: IUseChatMessagesOptions) => {
    const {
        sendMessageToApi,
        generateId = () => uuidv4(),
        maxMessages = DEFAULT_MAX_MESSAGES,
    } = options

    const [messages, setMessages] = useState<IMessage[]>([])

    /**
     * Trims messages array to maxMessages limit if specified.
     * Removes oldest messages first.
     */
    const trimMessages = useCallback(
        (msgs: IMessage[]): IMessage[] => {
            if (maxMessages <= 0 || msgs.length <= maxMessages) {
                return msgs
            }
            // Remove oldest messages to stay within limit
            return msgs.slice(-maxMessages)
        },
        [maxMessages],
    )
    const [isStreaming, setIsStreaming] = useState(false)
    const [uploadedPdfs, setUploadedPdfs] = useState<IPdfFile[]>([])

    // Refs for streaming state
    const accumulatedContentRef = useRef('')
    const contentSegmentsRef = useRef<IContentSegment[]>([])
    const currentTextSegmentRef = useRef('')
    const abortControllerRef = useRef<AbortController | null>(null)

    // Handle streaming events
    const handleStreamEvent = useCallback((event: IStreamEvent) => {
        switch (event.type) {
            case 'llm_token':
            case 'tool_content':
                if (event.content) {
                    const contentToAdd =
                        typeof event.content === 'string' ? event.content : String(event.content)
                    accumulatedContentRef.current += contentToAdd
                    currentTextSegmentRef.current += contentToAdd

                    setMessages((prev) => {
                        const updated = [...prev]
                        const lastMessage = updated[updated.length - 1]
                        if (lastMessage && lastMessage.role === 'assistant') {
                            lastMessage.content = accumulatedContentRef.current
                        }
                        return updated
                    })

                    const segments = [...contentSegmentsRef.current]
                    if (segments.length > 0 && segments[segments.length - 1].type === 'text') {
                        segments[segments.length - 1] = {
                            type: 'text',
                            content: currentTextSegmentRef.current,
                        }
                    } else {
                        segments.push({
                            type: 'text',
                            content: currentTextSegmentRef.current,
                        })
                    }
                    contentSegmentsRef.current = segments

                    setMessages((prev) => {
                        const updated = [...prev]
                        const lastMessage = updated[updated.length - 1]
                        if (lastMessage && lastMessage.role === 'assistant') {
                            lastMessage.contentSegments = segments
                        }
                        return updated
                    })
                }
                break

            case 'tool_start':
            case 'tool_end':
                // Tool events are ignored - no tool rendering
                break

            case 'error':
                console.error('Stream error:', event.message)
                break
        }
    }, [])

    // Handle sending messages
    const sendMessage = useCallback(
        async (userInput: string, modelName: string) => {
            if (!userInput.trim()) return

            // Add user message
            const userMessage: IMessage = {
                id: generateId(),
                role: 'user',
                content: userInput,
                attachedFiles: uploadedPdfs.length > 0 ? uploadedPdfs : undefined,
                timestamp: new Date(),
            }

            setMessages((prev) => trimMessages([...prev, userMessage]))

            // Prepare assistant message
            const assistantMessage: IMessage = {
                id: generateId(),
                role: 'assistant',
                content: '',
                timestamp: new Date(),
            }
            setMessages((prev) => trimMessages([...prev, assistantMessage]))

            // Reset state
            accumulatedContentRef.current = ''
            contentSegmentsRef.current = []
            currentTextSegmentRef.current = ''
            setIsStreaming(true)

            // Create new AbortController for this request
            abortControllerRef.current = new AbortController()

            // Get PDF UUIDs for request
            const pdfUuids = uploadedPdfs.map((pdf) => pdf.uuid)
            setUploadedPdfs([])

            try {
                await sendMessageToApi({
                    userInput,
                    pdfUuids: pdfUuids.length > 0 ? pdfUuids : undefined,
                    modelName,
                    onEvent: handleStreamEvent,
                    onComplete: () => {
                        // On complete, finalize any remaining text segment
                        if (currentTextSegmentRef.current.trim()) {
                            const segments = [...contentSegmentsRef.current]
                            if (
                                segments.length > 0 &&
                                segments[segments.length - 1].type === 'text'
                            ) {
                                segments[segments.length - 1] = {
                                    type: 'text',
                                    content: currentTextSegmentRef.current,
                                }
                            } else {
                                segments.push({
                                    type: 'text',
                                    content: currentTextSegmentRef.current,
                                })
                            }
                            contentSegmentsRef.current = segments

                            setMessages((prev) => {
                                const updated = [...prev]
                                const lastMessage = updated[updated.length - 1]
                                if (lastMessage && lastMessage.role === 'assistant') {
                                    lastMessage.contentSegments = segments
                                }
                                return updated
                            })
                        }

                        setIsStreaming(false)
                        abortControllerRef.current = null
                    },
                    onError: (error) => {
                        console.error('Chat error:', error)
                        setIsStreaming(false)
                        abortControllerRef.current = null
                    },
                    abortSignal: abortControllerRef.current.signal,
                })
            } catch (error) {
                console.error('Send message error:', error)
                setIsStreaming(false)
                abortControllerRef.current = null
            }
        },
        [uploadedPdfs, sendMessageToApi, handleStreamEvent, generateId],
    )

    // Handle stopping streaming
    const stopStreaming = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
            setIsStreaming(false)

            // Reset accumulated content
            accumulatedContentRef.current = ''
            contentSegmentsRef.current = []
            currentTextSegmentRef.current = ''

            // Remove the last message if it has no content
            setMessages((prev) => {
                const lastMessage = prev[prev.length - 1]
                if (
                    lastMessage &&
                    lastMessage.role === 'assistant' &&
                    !lastMessage.content.trim()
                ) {
                    return prev.slice(0, -1)
                }
                return prev
            })
        }
    }, [])

    // Handle adding PDF
    const addPdf = useCallback((pdf: IPdfFile) => {
        setUploadedPdfs((prev) => [...prev, pdf])
    }, [])

    // Handle removing PDF
    const removePdf = useCallback((uuid: string) => {
        setUploadedPdfs((prev) => prev.filter((pdf) => pdf.uuid !== uuid))
    }, [])

    // Handle clearing chat
    const clearChat = useCallback(() => {
        setMessages([])
        setUploadedPdfs([])
        accumulatedContentRef.current = ''
        contentSegmentsRef.current = []
        currentTextSegmentRef.current = ''
    }, [])

    return {
        messages,
        isStreaming,
        uploadedPdfs,
        sendMessage,
        stopStreaming,
        addPdf,
        removePdf,
        clearChat,
    }
}
