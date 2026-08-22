import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AppProvider } from './context/AppContext.tsx'
import { OwnerProvider } from './context/OwnerContext.tsx'
import { AdminPortalProvider } from './context/AdminPortalContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <OwnerProvider>
          <AdminPortalProvider>
            <App />
          </AdminPortalProvider>
        </OwnerProvider>
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
)
