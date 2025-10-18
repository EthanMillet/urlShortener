const { urls } = require('../models');

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
      const newUrl = await urls.create({ original_url });
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
  }
};