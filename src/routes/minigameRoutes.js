const express = require('express');
const minigameController = require('../controllers/minigameController');
const autenticarToken = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/gerar', autenticarToken, minigameController.gerar);

module.exports = router;