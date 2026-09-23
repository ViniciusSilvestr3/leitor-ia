const flashcardService = require('../services/flashcardService');
const geminiService = require('../services/geminiService');

async function gerar(req, res) {
    try {
        const rows = await flashcardService.buscarFlashcardsParaMinigame(req.usuario.id);

        if (!rows || rows.length < 2) {
            return res.status(400).json({
                erro: 'Você precisa ter pelo menos 2 flashcards salvos no seu perfil para gerar um minigame.',
            });
        }

        console.log(`Gerando minigame customizado para o Usuário ID: ${req.usuario.id}`);
        const quiz = await geminiService.gerarMinigame(rows);
        return res.json({ quiz });
    } catch (error) {
        console.error('Erro ao processar minigame com IA:', error);
        return res.status(500).json({ erro: 'Falha ao construir o minigame dinâmico.' });
    }
}

module.exports = { gerar };