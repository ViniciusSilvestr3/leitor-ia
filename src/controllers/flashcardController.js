const flashcardService = require('../services/flashcardService');

async function salvar(req, res) {
    const { termo, contexto, explicacao, livro_titulo, cfi } = req.body;

    if (!termo || !explicacao) {
        return res.status(400).json({ erro: 'Dados incompletos.' });
    }

    try {
        const resultado = await flashcardService.salvarFlashcard({
            usuarioId: req.usuario.id,
            termo,
            contexto,
            explicacao,
            livroTitulo: livro_titulo,
            cfi,
        });
        return res.status(201).json({ mensagem: 'Salvo com sucesso!', id: resultado.lastID });
    } catch (error) {
        console.error('ERRO NO SQLITE:', error.message);
        return res.status(500).json({ erro: error.message });
    }
}

async function listar(req, res) {
    try {
        const flashcards = await flashcardService.listarFlashcards(req.usuario.id);
        return res.json({ flashcards });
    } catch (error) {
        console.error('Erro ao buscar flashcards:', error.message);
        return res.status(500).json({ erro: 'Erro ao buscar banco de dados.' });
    }
}

async function excluir(req, res) {
    try {
        await flashcardService.excluirFlashcard(req.params.id, req.usuario.id);
        return res.json({ mensagem: 'Deletado com sucesso.' });
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao deletar.' });
    }
}

module.exports = { excluir, listar, salvar };