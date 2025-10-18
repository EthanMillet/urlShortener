const express = require('express');
const router = express.Router();
const urlController = require('../controllers/url');

router.get('/:id', urlController.getUrlsById);
router.get('/', urlController.getUrls);
router.post('/', urlController.createUrl);
router.delete('/:id', urlController.deleteUrl);

module.exports = router;