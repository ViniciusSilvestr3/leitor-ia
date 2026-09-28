const express = require('express');
const aiController = require('../controllers/aiController');
const autenticarToken = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/explicar', autenticarToken, aiController.explicar);

module.exports = router;