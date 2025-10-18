const express = require('express');
const router = express.Router();
const urlController = require('../controllers/url');

router.get('/:id', urlController.getUrlsById);
router.get('/', urlController.getUrls);
router.post('/', urlController.createUrl);
router.post('/process-html', urlController.processHtml);
router.delete('/:id', urlController.deleteUrl);
router.get('/redirect/:shortUrl', urlController.redirectUrl);

module.exports = router;