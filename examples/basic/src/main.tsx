import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// Import the chat component styles
import '@pulse8-ai/chat/styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
