const express = require('express');
const { rateLimit } = require('express-rate-limit');
const controller = require('../controllers/auth.controller');

const router = express.Router();
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	standardHeaders: 'draft-8',
	legacyHeaders: false
});

router.use(authLimiter);
router.post('/cadastro', controller.register);
router.post('/login', controller.login);

module.exports = router;