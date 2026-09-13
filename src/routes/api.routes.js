const express = require('express');
const authenticateToken = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const authRoutes = require('./auth.routes');
const aiController = require('../controllers/ai.controller');
const flashcardController = require('../controllers/flashcard.controller');
const uploadController = require('../controllers/upload.controller');

const router = express.Router();
router.use('/auth', authRoutes);
router.post('/upload', authenticateToken, upload.single('livro'), uploadController.upload);
router.get('/uploads/:filename', authenticateToken, uploadController.download);
router.post('/explicar', authenticateToken, aiController.explain);
router.post('/flashcards/salvar', authenticateToken, flashcardController.save);
router.delete('/flashcards/:id', authenticateToken, flashcardController.remove);
router.get('/flashcards', authenticateToken, flashcardController.list);
router.get('/minigame/gerar', authenticateToken, aiController.generateMinigame);

module.exports = router;