const express = require('express');
const flashcardController = require('../controllers/flashcardController');
const autenticarToken = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/salvar', autenticarToken, flashcardController.salvar);
router.get('/', autenticarToken, flashcardController.listar);
router.delete('/:id', autenticarToken, flashcardController.excluir);

module.exports = router;