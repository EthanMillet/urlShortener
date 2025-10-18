const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');

router.get('/:id', urlController.getUrlsById);
router.get('/', urlController.getUrls);
router.post('/', urlController.createUrl);
router.delete('/:id', urlController.deleteUrl);