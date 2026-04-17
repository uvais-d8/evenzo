import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { RepositoryProvider } from './infrastructure/context/RepositoryContext'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="775034363414-vha4am7gk59l8cme2cefebfdv5472ghv.apps.googleusercontent.com">
      <RepositoryProvider>
        <App />
      </RepositoryProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
