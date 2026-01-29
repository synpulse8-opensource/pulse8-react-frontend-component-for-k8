/**
 * Simple proxy server for AI API calls
 * This keeps API keys secure on the server side
 *
 * Usage:
 *   1. Copy .env.example to .env and add your API keys
 *   2. Run: npm run server
 *   3. Server runs on http://localhost:3001
 */

import express, { Request, Response } from 'express'
import cors from 'cors'
import { config } from 'dotenv'

config() // Load .env file

interface ChatMessage {
    role: 'user' | 'assistant' | 'system'
    content: string
}

interface ChatRequestBody {
    model?: string
    messages: ChatMessage[]
}

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' })
})

/**
 * OpenAI Chat Completions Proxy
 * POST /api/openai/chat
 */
app.post('/api/openai/chat', async (req: Request<object, object, ChatRequestBody>, res: Response) => {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
        res.status(500).json({ error: 'OPENAI_API_KEY not configured' })
        return
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: req.body.model || 'gpt-4o-mini',
                messages: req.body.messages,
                stream: true,
            }),
        })

        if (!response.ok) {
            const error = await response.text()
            res.status(response.status).json({ error })
            return
        }

        // Set headers for SSE streaming
        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')

        // Stream the response
        const reader = response.body!.getReader()
        const decoder = new TextDecoder()

        while (true) {
            const { done, value } = await reader.read()
            if (done) break
            res.write(decoder.decode(value, { stream: true }))
        }

        res.end()
    } catch (error) {
        console.error('OpenAI API error:', error)
        res.status(500).json({ error: (error as Error).message })
    }
})

/**
 * Google Gemini Proxy
 * POST /api/gemini/chat
 */
app.post('/api/gemini/chat', async (req: Request<object, object, ChatRequestBody>, res: Response) => {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
        res.status(500).json({ error: 'GEMINI_API_KEY not configured' })
        return
    }

    try {
        const model = req.body.model || 'gemini-2.0-flash'
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`

        // Convert messages to Gemini format
        const contents = req.body.messages.map((msg) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }))

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ contents }),
        })

        if (!response.ok) {
            const error = await response.text()
            res.status(response.status).json({ error })
            return
        }

        // Set headers for SSE streaming
        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')

        // Stream the response
        const reader = response.body!.getReader()
        const decoder = new TextDecoder()

        while (true) {
            const { done, value } = await reader.read()
            if (done) break
            res.write(decoder.decode(value, { stream: true }))
        }

        res.end()
    } catch (error) {
        console.error('Gemini API error:', error)
        res.status(500).json({ error: (error as Error).message })
    }
})

/**
 * Anthropic Claude Proxy
 * POST /api/anthropic/chat
 */
app.post('/api/anthropic/chat', async (req: Request<object, object, ChatRequestBody>, res: Response) => {
    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
        res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
        return
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: req.body.model || 'claude-3-5-sonnet-20241022',
                max_tokens: 1024,
                messages: req.body.messages,
                stream: true,
            }),
        })

        if (!response.ok) {
            const error = await response.text()
            res.status(response.status).json({ error })
            return
        }

        // Set headers for SSE streaming
        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')

        // Stream the response
        const reader = response.body!.getReader()
        const decoder = new TextDecoder()

        while (true) {
            const { done, value } = await reader.read()
            if (done) break
            res.write(decoder.decode(value, { stream: true }))
        }

        res.end()
    } catch (error) {
        console.error('Anthropic API error:', error)
        res.status(500).json({ error: (error as Error).message })
    }
})

app.listen(PORT, () => {
    console.log(`\n🚀 API Proxy Server running at http://localhost:${PORT}`)
    console.log('\nConfigured providers:')
    console.log(`  - OpenAI:    ${process.env.OPENAI_API_KEY ? '✅ Ready' : '❌ Missing OPENAI_API_KEY'}`)
    console.log(`  - Gemini:    ${process.env.GEMINI_API_KEY ? '✅ Ready' : '❌ Missing GEMINI_API_KEY'}`)
    console.log(`  - Anthropic: ${process.env.ANTHROPIC_API_KEY ? '✅ Ready' : '❌ Missing ANTHROPIC_API_KEY'}`)
    console.log('\nEndpoints:')
    console.log('  POST /api/openai/chat')
    console.log('  POST /api/gemini/chat')
    console.log('  POST /api/anthropic/chat')
    console.log('')
})
