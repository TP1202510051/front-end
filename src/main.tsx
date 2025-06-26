// src/main.tsx
import { Buffer } from 'buffer'
declare global {
  interface Window {
    global: typeof window;
    Buffer: typeof Buffer;
  }
}
window.global = window;
window.Buffer = Buffer;

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
