import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// iOS Safari only matches :active (and Tailwind's `active:` variant) once a
// touchstart listener exists somewhere on the page — without this, every
// button's tap feedback silently does nothing on iPhone.
document.addEventListener('touchstart', () => {}, { passive: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
