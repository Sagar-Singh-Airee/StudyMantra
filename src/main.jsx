// src/main.jsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

// Quick environment / capability checks (won't block runtime)
const checkAgoraSupport = () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.warn('WebRTC / getUserMedia is not fully supported in this browser')
    return false
  }
  return true
}

const checkEnvVariables = () => {
  const required = ['VITE_AGORA_APP_ID']
  const missing = required.filter((k) => !import.meta.env[k])
  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`)
    if (import.meta.env.MODE === 'development') {
      console.info('Running in development mode with limited functionality')
    }
  }
}

checkAgoraSupport()
checkEnvVariables()

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0f1724',
            color: '#e6eef6',
            border: '1px solid rgba(255,255,255,0.04)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
