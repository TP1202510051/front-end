// sockjs-client (el transporte del canal de operaciones) lee `global` como en Node; Vite no lo
// define en el navegador, asi que se apunta a window antes de que se cargue.
declare global {
  interface Window {
    global: typeof window;
  }
}
window.global = window;

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
