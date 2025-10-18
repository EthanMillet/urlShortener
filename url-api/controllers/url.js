const { urls } = require('../models');

// Base62 encoding utility
const base62Chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function encodeBase62(num) {
  if (num === 0) return '0';
  let result = '';
  while (num > 0) {
    result = base62Chars[num % 62] + result;
    num = Math.floor(num / 62);
  }
  // Limit to maximum 7 characters
  return result.length > 7 ? result.slice(-7) : result;
}

module.exports = {
  async getUrlsById(req, res, next) {
    try {
      if (isNaN(parseInt(req.params.id))) {
        return res.status(400).json({ error: "Provided ID is invalid." });
      }
      const { id } = req.params;
      const url = await urls.findByPk(id);
      if (!url) {
        return res.status(404).json({ error: "URL not found." });
      }
      res.status(200).json(url);  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  
  async getUrls(req, res, next) {
    try {
      const allUrls = await urls.findAll();
      res.status(200).json(allUrls);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  
  async createUrl(req, res, next) {
    try {
      const { original_url } = req.body;
      if (!original_url) {
        return res.status(400).json({ error: "original_url is required" });
      }
      
      // Create the URL first to get the ID
      const newUrl = await urls.create({ original_url });
      
      // Generate short URL using base62 encoding of the row ID
      const shortUrl = encodeBase62(newUrl.id);
      
      // Update the record with the short URL
      await newUrl.update({ short_url: shortUrl });
      
      res.status(201).json(newUrl);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  
  async deleteUrl(req, res, next) {
    try {
      const { id } = req.params;
      if (isNaN(parseInt(id))) {
        return res.status(400).json({ error: "Provided ID is invalid." });
      }
      const deleted = await urls.destroy({ where: { id } });
      if (deleted === 0) {
        return res.status(404).json({ error: "URL not found." });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async redirectUrl(req, res, next) {
    try {
      const { shortUrl } = req.params;
      if (!shortUrl) {
        return res.status(400).json({ error: "Short URL is required." });
      }
      
      const url = await urls.findOne({ where: { short_url: shortUrl } });
      if (!url) {
        return res.status(404).json({ error: "Short URL not found." });
      }
      
      res.redirect(301, url.original_url);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async processHtml(req, res, next) {
    try {
      const { html } = req.body;
      if (!html) {
        return res.status(400).json({ error: "HTML content is required" });
      }

      // Regex to find all URLs in HTML (href, src, and other attributes)
      const urlRegex = /(https?:\/\/[^\s<>"']+)/gi;
      const urls = html.match(urlRegex) || [];
      
      // Remove duplicates
      const uniqueUrls = [...new Set(urls)];
      
      // Create shortened URLs for each unique URL
      const urlMappings = {};
      const baseUrl = req.protocol + '://' + req.get('host');
      
      for (const originalUrl of uniqueUrls) {
        try {
          // Check if URL already exists
          let existingUrl = await urls.findOne({ where: { original_url: originalUrl } });
          
          if (existingUrl) {
            // Use existing short URL
            urlMappings[originalUrl] = `${baseUrl}/api/url/redirect/${existingUrl.short_url}`;
          } else {
            // Create new shortened URL
            const newUrl = await urls.create({ original_url: originalUrl });
            const shortUrl = encodeBase62(newUrl.id);
            await newUrl.update({ short_url: shortUrl });
            urlMappings[originalUrl] = `${baseUrl}/api/url/redirect/${shortUrl}`;
          }
        } catch (error) {
          console.error(`Error processing URL ${originalUrl}:`, error);
          // Keep original URL if shortening fails
          urlMappings[originalUrl] = originalUrl;
        }
      }

      // Replace all URLs in the HTML with shortened versions
      let processedHtml = html;
      for (const [originalUrl, shortUrl] of Object.entries(urlMappings)) {
        const escapedOriginalUrl = originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        processedHtml = processedHtml.replace(new RegExp(escapedOriginalUrl, 'g'), shortUrl);
      }

      res.status(200).json({
        processedHtml,
        originalUrlCount: uniqueUrls.length,
        shortenedUrlCount: Object.keys(urlMappings).length,
        urlMappings
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};