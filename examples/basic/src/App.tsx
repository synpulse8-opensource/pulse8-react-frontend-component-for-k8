import { useState } from 'react'
import {
  ChatPanel,
  useChatMessages,
  streamSSE,
  createOpenAIAdapter,
  createGeminiAdapter,
  createAnthropicAdapter,
} from '@pulse8-ai/chat'
import type { IStreamEvent, IMessage } from '@pulse8-ai/chat'

type Provider = 'mock' | 'openai' | 'gemini' | 'anthropic'

const PROVIDERS: { id: Provider; name: string; description: string }[] = [
  { id: 'mock', name: 'Mock (Demo)', description: 'Simulated responses - no API key needed' },
  { id: 'openai', name: 'OpenAI', description: 'GPT-4o-mini' },
  { id: 'gemini', name: 'Google Gemini', description: 'Gemini 2.0 Flash' },
  { id: 'anthropic', name: 'Anthropic', description: 'Claude 3.5 Sonnet' },
]

function App() {
  const [provider, setProvider] = useState<Provider>('mock')
  const [error, setError] = useState<string | null>(null)

  // Convert messages to API format (role/content array)
  const messagesToApiFormat = (messages: IMessage[]) => {
    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))
  }

  const { messages, isStreaming, sendMessage, stopStreaming, clearChat } =
    useChatMessages({
      sendMessageToApi: async (params) => {
        setError(null)

        if (provider === 'mock') {
          // Use mock API for demo
          await mockStreamingResponse(
            params.userInput,
            params.onEvent,
            params.onComplete,
            params.onError,
            params.abortSignal
          )
          return
        }

        // Build conversation history
        const conversationHistory = messagesToApiFormat(params.messages)
        conversationHistory.push({ role: 'user', content: params.userInput })

        try {
          if (provider === 'openai') {
            await streamSSE({
              url: 'http://localhost:3001/api/openai/chat',
              body: {
                model: 'gpt-4o-mini',
                messages: conversationHistory,
              },
              adapter: createOpenAIAdapter(),
              onEvent: params.onEvent,
              onComplete: params.onComplete,
              onError: (err) => {
                setError(err.message)
                params.onError(err)
              },
              signal: params.abortSignal,
            })
          } else if (provider === 'gemini') {
            await streamSSE({
              url: 'http://localhost:3001/api/gemini/chat',
              body: {
                model: 'gemini-2.0-flash',
                messages: conversationHistory,
              },
              adapter: createGeminiAdapter(),
              onEvent: params.onEvent,
              onComplete: params.onComplete,
              onError: (err) => {
                setError(err.message)
                params.onError(err)
              },
              signal: params.abortSignal,
            })
          } else if (provider === 'anthropic') {
            await streamSSE({
              url: 'http://localhost:3001/api/anthropic/chat',
              body: {
                model: 'claude-3-5-sonnet-20241022',
                messages: conversationHistory,
              },
              adapter: createAnthropicAdapter(),
              onEvent: params.onEvent,
              onComplete: params.onComplete,
              onError: (err) => {
                setError(err.message)
                params.onError(err)
              },
              signal: params.abortSignal,
            })
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error'
          setError(errorMsg)
          params.onError(err instanceof Error ? err : new Error(errorMsg))
        }
      },
    })

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#1a1a2e',
      }}
    >
      {/* Header with Provider Selector */}
      <header
        style={{
          padding: '1rem',
          borderBottom: '1px solid #333',
          color: 'white',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem' }}>
              Pulse8 Chat Component Demo
            </h1>
            <p style={{ margin: '0.25rem 0 0', color: '#888', fontSize: '0.8rem' }}>
              Testing @pulse8-ai/chat integration
            </p>
          </div>

          {/* Provider Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', color: '#aaa' }}>Provider:</label>
            <select
              value={provider}
              onChange={(e) => {
                setProvider(e.target.value as Provider)
                setError(null)
              }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid #444',
                backgroundColor: '#2d2d44',
                color: 'white',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              {PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - {p.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div
            style={{
              marginTop: '0.75rem',
              padding: '0.75rem 1rem',
              backgroundColor: '#ff4d4f20',
              border: '1px solid #ff4d4f',
              borderRadius: '6px',
              color: '#ff7875',
              fontSize: '0.875rem',
            }}
          >
            <strong>Error:</strong> {error}
            {provider !== 'mock' && (
              <span style={{ display: 'block', marginTop: '0.25rem', color: '#aaa' }}>
                Make sure the proxy server is running: <code>npm run server</code>
              </span>
            )}
          </div>
        )}

        {/* Info for non-mock providers */}
        {provider !== 'mock' && !error && (
          <div
            style={{
              marginTop: '0.75rem',
              padding: '0.75rem 1rem',
              backgroundColor: '#1890ff20',
              border: '1px solid #1890ff',
              borderRadius: '6px',
              color: '#69c0ff',
              fontSize: '0.875rem',
            }}
          >
            Using <strong>{PROVIDERS.find((p) => p.id === provider)?.name}</strong>.
            Ensure the proxy server is running on port 3001.
          </div>
        )}
      </header>

      {/* Chat Panel */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <ChatPanel
          messages={messages}
          isStreaming={isStreaming}
          onSendMessage={(msg) => sendMessage(msg, provider)}
          onStopStreaming={stopStreaming}
          onClearChat={clearChat}
          emptyStateTitle={getEmptyStateTitle(provider)}
          emptyStateSubtitle={getEmptyStateSubtitle(provider)}
          suggestedQuestions={[
            'What can you help me with?',
            'Explain quantum computing in simple terms',
            'Write a haiku about programming',
          ]}
        />
      </div>
    </div>
  )
}

function getEmptyStateTitle(provider: Provider): string {
  switch (provider) {
    case 'openai':
      return 'Chat with GPT-4o-mini'
    case 'gemini':
      return 'Chat with Gemini'
    case 'anthropic':
      return 'Chat with Claude'
    default:
      return 'Hi! How can I help you today?'
  }
}

function getEmptyStateSubtitle(provider: Provider): string {
  switch (provider) {
    case 'openai':
      return 'Powered by OpenAI'
    case 'gemini':
      return 'Powered by Google Gemini'
    case 'anthropic':
      return 'Powered by Anthropic Claude'
    default:
      return 'This is a demo using a mock API. Switch providers above to use real AI!'
  }
}

/**
 * Mock streaming response for demo purposes
 */
async function mockStreamingResponse(
  userInput: string,
  onEvent: (event: IStreamEvent) => void,
  onComplete: () => void,
  onError: (error: Error) => void,
  signal?: AbortSignal
): Promise<void> {
  const responses: Record<string, string> = {
    default: `Thanks for your message! You said: "${userInput}"\n\nThis is a **mock response** demonstrating the chat component.\n\n### To use real AI:\n1. Select a provider from the dropdown\n2. Start the proxy server: \`npm run server\`\n3. Add your API keys to \`.env\`\n\nThe component supports **OpenAI**, **Gemini**, and **Anthropic**!`,
    help: "I'm a demo showing **@pulse8-ai/chat** capabilities!\n\n### Available Providers:\n- **Mock** - Demo mode (no API needed)\n- **OpenAI** - GPT-4o-mini\n- **Gemini** - Google's Gemini 1.5 Flash\n- **Anthropic** - Claude 3.5 Sonnet\n\n### Setup:\n```bash\n# Terminal 1: Start proxy server\nnpm run server\n\n# Terminal 2: Start frontend\nnpm run dev\n```",
    quantum:
      "**Quantum Computing Simplified:**\n\nRegular computers use **bits** (0 or 1). Quantum computers use **qubits** which can be 0, 1, or *both at once* (superposition).\n\nImagine flipping a coin:\n- Regular: Heads OR tails\n- Quantum: Spinning in the air - both until you look!\n\nThis lets quantum computers try many solutions *simultaneously*, making them powerful for specific problems like:\n- 🔐 Cryptography\n- 💊 Drug discovery\n- 🌡️ Climate modeling",
    haiku:
      "Here's a programming haiku:\n\n```\nCode compiles at last\nOne bug fixed, two more appear\nSuch is the dev life\n```\n\n🐛✨",
  }

  let response = responses.default
  const lowerInput = userInput.toLowerCase()
  if (lowerInput.includes('help') || lowerInput.includes('what can')) {
    response = responses.help
  } else if (lowerInput.includes('quantum')) {
    response = responses.quantum
  } else if (lowerInput.includes('haiku')) {
    response = responses.haiku
  }

  const words = response.split(' ')

  try {
    for (let i = 0; i < words.length; i++) {
      if (signal?.aborted) return

      const content = i === 0 ? words[i] : ' ' + words[i]
      onEvent({ type: 'llm_token', content })

      await new Promise((resolve) => setTimeout(resolve, 25 + Math.random() * 25))
    }
    onComplete()
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Unknown error'))
  }
}

export default App
