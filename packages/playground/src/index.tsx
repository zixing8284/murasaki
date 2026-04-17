import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app'
import './style.css'
import './sw-register'

createRoot(document.querySelector('#app')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
