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
import { loadRuntimeConfig } from './runtime-config'

// La aplicacion se importa despues de leer la configuracion de la instalacion: el cliente REST y
// Firebase la leen al evaluarse, asi que no puede estar ya en el arbol de modulos cuando se carga.
const root = createRoot(document.getElementById('root')!)
loadRuntimeConfig().then(async outcome => {
  if (outcome.status !== 'loaded') {
    root.render(<main role="alert" className="flex min-h-screen items-center justify-center p-8">
      {outcome.status === 'missing'
        ? 'Esta instalación no tiene identidad configurada (runtime-config.json).'
        : 'La configuración de esta instalación no es válida.'}
    </main>)
    return
  }
  const [{ default: App }, { AuthProvider }] = await Promise.all([import('./App.tsx'), import('./contexts/AuthContext.tsx')])
  root.render(
    <StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StrictMode>,
  )
})
