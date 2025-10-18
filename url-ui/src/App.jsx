import { useState } from 'react'
import './App.css'

function App() {
  const [inputHtml, setInputHtml] = useState('')
  const [outputHtml, setOutputHtml] = useState('')

  const handleProcess = async () => {
    if (!inputHtml.trim()) return
    
    try {
      const response = await fetch('https://url-api-a0a024cbef93.herokuapp.com/api/url/process-html', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ html: inputHtml }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setOutputHtml(data.processedHtml)
        
        // Show success message with stats
        console.log(`Successfully processed HTML:`)
        console.log(`- Found ${data.originalUrlCount} unique URLs`)
        console.log(`- Created ${data.shortenedUrlCount} shortened URLs`)
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData.error)
        setOutputHtml(`<!-- Error processing HTML: ${errorData.error} -->\n${inputHtml}`)
      }
    } catch (error) {
      console.error('Error processing HTML:', error)
      setOutputHtml(`<!-- Error processing HTML: ${error.message} -->\n${inputHtml}`)
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
