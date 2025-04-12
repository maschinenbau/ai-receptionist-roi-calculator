    import React from 'react'
    import ReactDOM from 'react-dom/client'
    // Import the main App component (which contains the calculator)
    import App from './App.jsx'
    // Import the CSS file which includes Tailwind directives
    import './index.css'

    // Standard React entry point - renders the App component into the HTML
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
    