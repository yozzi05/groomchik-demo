import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { ToastProvider } from './components/ui'
import './index.css'
import { DemoProvider } from './store/demoStore'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <DemoProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </DemoProvider>
    </HashRouter>
  </StrictMode>,
)
