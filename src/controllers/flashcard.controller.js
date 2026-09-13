const flashcardService = require('../services/flashcard.service');

async function save(req, res) {
    const { termo, contexto, explicacao, livro_titulo = '', cfi = '' } = req.body;
    if ([termo, contexto, explicacao, livro_titulo, cfi].some(value => typeof value !== 'string') ||
        !termo.trim() || !explicacao.trim()) {
        return res.status(400).json({ erro: 'Dados incompletos.' });
    }
    if (termo.length > 200 || contexto.length > 10000 || explicacao.length > 5000 ||
        livro_titulo.length > 500 || cfi.length > 2000) {
        return res.status(400).json({ erro: 'Os dados informados excedem os limites permitidos.' });
    }
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