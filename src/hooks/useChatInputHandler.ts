import { useEffect, useRef, useState, type KeyboardEvent } from 'react'

interface IUseChatInputHandlerProps {
    onSend: (message: string) => void
    isStreaming: boolean
    acceptedFileTypes: string[]
    onUploadFile: (file: File) => Promise<void>
}

interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number
    readonly results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string
    readonly message: string
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    onresult: ((event: SpeechRecognitionEvent) => void) | null
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
    onend: (() => void) | null
    start(): void
    stop(): void
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition
        webkitSpeechRecognition: new () => SpeechRecognition
    }
}

export const useChatInputHandler = ({
    onSend,
    isStreaming,
    acceptedFileTypes,
    onUploadFile,
}: IUseChatInputHandlerProps) => {
    const [input, setInput] = useState('')
    const [dragOver, setDragOver] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const recognitionRef = useRef<SpeechRecognition | null>(null)
    const startInputRef = useRef('')

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleSend = () => {
        if (input.trim() && !isStreaming) {
            onSend(input.trim())
            setInput('')
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return
        handleFileUpload(e.target.files)
    }

    const handleFileUpload = async (files: FileList) => {
        const acceptedFiles = Array.from(files).filter((file) =>
            acceptedFileTypes.some((type) => file.name.toLowerCase().endsWith(type.toLowerCase())),
        )
        for (const file of acceptedFiles) {
            await onUploadFile(file)
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        handleFileUpload(e.dataTransfer.files)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
    }

    const handleMicrophoneClick = () => {
        if (!recognitionRef.current) {
            alert('Speech recognition is not supported in your browser.')
            return
        }

        if (isRecording) {
            recognitionRef.current.stop()
            setIsRecording(false)
        } else {
            startInputRef.current = input
            recognitionRef.current.start()
            setIsRecording(true)
        }
    }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognitionConstructor =
                window.SpeechRecognition || window.webkitSpeechRecognition

            if (SpeechRecognitionConstructor) {
                const recognition = new SpeechRecognitionConstructor()
                recognition.continuous = true
                recognition.interimResults = true
                recognition.lang = 'en-US'

                recognition.onresult = (event: SpeechRecognitionEvent) => {
                    let transcript = ''
                    for (let i = 0; i < event.results.length; i++) {
                        transcript += event.results[i][0].transcript
                        if (event.results[i].isFinal) {
                            transcript += ' '
                        }
                    }
                    setInput(startInputRef.current + transcript)
                }

                recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                    console.error('Speech recognition error:', event.error)
                    setIsRecording(false)
                }

                recognition.onend = () => {
                    setIsRecording(false)
                }

                recognitionRef.current = recognition
            }
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop()
            }
        }
    }, [])

    return {
        input,
        setInput,
        handleKeyDown,
        handleSend,
        handleFileChange,
        handleFileUpload,
        handleDrop,
        handleDragOver,
        handleDragLeave,
        handleMicrophoneClick,
        dragOver,
        fileInputRef,
        isRecording,
    }
}
