import { Analytics } from '@vercel/analytics/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app'
import './sw-register'
import './style.css'

createRoot(document.querySelector('#app')!).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
)
