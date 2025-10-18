import { useState } from 'react'
import './App.css'

function App() {
  const [inputHtml, setInputHtml] = useState('')
  const [outputHtml, setOutputHtml] = useState('')

  const handleProcess = async () => {
    if (!inputHtml.trim()) return
    
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ html: inputHtml }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setOutputHtml(data.processedHtml)
      }
    } catch (error) {
      console.error('Error processing HTML:', error)
      // For now, just show a placeholder
      setOutputHtml('<!-- Processed HTML will appear here -->\n' + inputHtml)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(outputHtml)
  }

  const handleClear = () => {
    setInputHtml('')
    setOutputHtml('')
  }

  return (
    <div className="app">
      <header className="header">
        <h1>HTML Processor</h1>
        <p>Transform your HTML with ease</p>
      </header>
      
      <main className="main">
        <div className="editor-container">
          <div className="input-section">
            <div className="section-header">
              <label htmlFor="html-input" className="section-label">
                Input HTML
              </label>
              <button 
                onClick={handleProcess}
                className="process-button"
                disabled={!inputHtml.trim()}
              >
                Process HTML
              </button>
            </div>
            <textarea
              id="html-input"
              value={inputHtml}
              onChange={(e) => setInputHtml(e.target.value)}
              placeholder="Paste your HTML code here..."
              className="html-textarea input-textarea"
            />
          </div>

          <div className="output-section">
            <div className="section-header">
              <label htmlFor="html-output" className="section-label">
                Processed HTML
              </label>
              <div className="output-actions">
                <button 
                  onClick={handleCopy}
                  className="copy-button"
                  disabled={!outputHtml}
                >
                  Copy
                </button>
                <button 
                  onClick={handleClear}
                  className="clear-button"
                >
                  Clear
                </button>
              </div>
            </div>
            <textarea
              id="html-output"
              value={outputHtml}
              readOnly
              placeholder="Your processed HTML will appear here..."
              className="html-textarea output-textarea"
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
