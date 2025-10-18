import { useState } from 'react'
import './App.css'

function App() {
  const [inputUrl, setInputUrl] = useState('')
  const [shortenedUrl, setShortenedUrl] = useState('')

  const handleShorten = async () => {
    if (!inputUrl.trim()) return
    
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: inputUrl }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setShortenedUrl(data.shortUrl)
      }
    } catch (error) {
      console.error('Error shortening URL:', error)
      // For now, just show a placeholder
      setShortenedUrl('https://short.ly/abc123')
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shortenedUrl)
  }

  return (
    <div className="app">
      <header className="header">
        <h1>URL Shortener</h1>
        <p>Transform your long URLs into short, shareable links</p>
      </header>
      
      <main className="main">
        <div className="input-section">
          <label htmlFor="url-input" className="input-label">
            Enter your URL
          </label>
          <div className="input-group">
            <input
              id="url-input"
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://example.com/very-long-url"
              className="url-input"
            />
            <button 
              onClick={handleShorten}
              className="shorten-button"
              disabled={!inputUrl.trim()}
            >
              Shorten
            </button>
          </div>
        </div>

        <div className="output-section">
          <label htmlFor="url-output" className="output-label">
            Your shortened URL
          </label>
          <div className="output-group">
            <input
              id="url-output"
              type="text"
              value={shortenedUrl}
              readOnly
              placeholder="Your shortened URL will appear here"
              className="url-output"
            />
            <button 
              onClick={handleCopy}
              className="copy-button"
              disabled={!shortenedUrl}
            >
              Copy
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
