import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [inputHtml, setInputHtml] = useState('')
  const [outputHtml, setOutputHtml] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true)
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light')
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }

  const extractUrls = (html) => {
    // More precise regex to find complete URLs, avoiding partial matches
    // This regex looks for URLs that are complete (not part of other URLs)
    const urlRegex = /(https?:\/\/[^\s<>"']+?)(?=\s|$|"|'|>|<|\)|,|;)/gi;
    const urls = html.match(urlRegex) || [];
    return [...new Set(urls)]; // Remove duplicates
  }

  const handleProcess = async () => {
    if (!inputHtml.trim()) return
    
    setIsLoading(true)
    
    try {
      // Extract URLs on the frontend
      const urls = extractUrls(inputHtml)
      console.log('Extracted URLs:', urls)
      
      if (urls.length === 0) {
        setOutputHtml(inputHtml)
        setIsLoading(false)
        return
      }

      // Create shortened URLs for each unique URL
      const urlMappings = {}
      const baseUrl = 'https://url-api-a0a024cbef93.herokuapp.com'
      
      for (const originalUrl of urls) {
        try {
          const response = await fetch(`${baseUrl}/api/url`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ original_url: originalUrl }),
          })
          
          if (response.ok) {
            const data = await response.json()
            urlMappings[originalUrl] = `${baseUrl}/api/url/redirect/${data.short_url}`
          } else {
            // Keep original URL if shortening fails
            urlMappings[originalUrl] = originalUrl
          }
        } catch (error) {
          console.error(`Error shortening URL ${originalUrl}:`, error)
          urlMappings[originalUrl] = originalUrl
        }
      }

      // Replace all URLs in the HTML with shortened versions
      let processedHtml = inputHtml
      console.log('URL Mappings:', urlMappings)
      
      for (const [originalUrl, shortUrl] of Object.entries(urlMappings)) {
        // Escape special regex characters in the original URL
        const escapedOriginalUrl = originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        console.log(`Replacing: ${originalUrl} -> ${shortUrl}`)
        // Use a simple global replace - this should work correctly since we're replacing exact matches
        processedHtml = processedHtml.replace(new RegExp(escapedOriginalUrl, 'g'), shortUrl)
      }

      setOutputHtml(processedHtml)
      
      // Show success message with stats
      console.log(`Successfully processed HTML:`)
      console.log(`- Found ${urls.length} unique URLs`)
      console.log(`- Created ${Object.keys(urlMappings).length} shortened URLs`)
      
    } catch (error) {
      console.error('Error processing HTML:', error)
      setOutputHtml(`<!-- Error processing HTML: ${error.message} -->\n${inputHtml}`)
    } finally {
      setIsLoading(false)
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
        <div className="header-content">
          <h1>URL Shortener</h1>
          <button 
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>
      
      <main className="main">
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Processing URLs...</p>
            </div>
          </div>
        )}
        <div className="editor-container">
          <div className="input-section">
            <div className="section-header">
              <label htmlFor="html-input" className="section-label">
                Input HTML
              </label>
            <button 
              onClick={handleProcess}
              className="process-button"
              disabled={!inputHtml.trim() || isLoading}
            >
              {isLoading ? 'Processing...' : 'Process HTML'}
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
