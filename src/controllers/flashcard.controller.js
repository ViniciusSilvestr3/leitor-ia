const flashcardService = require('../services/flashcard.service');

async function save(req, res) {
    const { termo, explicacao } = req.body;
    if (!termo || !explicacao) return res.status(400).json({ erro: 'Dados incompletos.' });
    const result = await flashcardService.saveFlashcard(req.usuario.id, req.body);
    res.status(201).json({ mensagem: 'Salvo com sucesso!', id: result.lastID });
}

async function remove(req, res) {
    await flashcardService.deleteFlashcard(req.params.id, req.usuario.id);
    res.json({ mensagem: 'Deletado com sucesso.' });
}

async function list(req, res) {
    res.json({ flashcards: await flashcardService.listFlashcards(req.usuario.id) });
}

module.exports = { list, remove, save };