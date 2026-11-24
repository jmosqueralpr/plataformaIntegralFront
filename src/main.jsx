import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/tokens.css'
import './styles/components/buttons.css'
import './styles/components/forms.css'
import './styles/components/layout.css'
import './styles/components/cards.css'
import './styles/components/modals.css'
import './styles/components/badges.css'
import './styles/login.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
