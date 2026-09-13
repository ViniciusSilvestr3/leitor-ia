const aiService = require('../services/ai.service');

async function explain(req, res) {
    const { termo, contexto, idioma = 'pt-BR' } = req.body;
    if (typeof termo !== 'string' || typeof contexto !== 'string' || typeof idioma !== 'string' ||
        !termo.trim() || !contexto.trim()) {
        return res.status(400).json({ erro: 'Dados incompletos.' });
    }
    if (termo.length > 200 || contexto.length > 10000 || idioma.length > 20) {
        return res.status(400).json({ erro: 'Os dados informados excedem os limites permitidos.' });
    }
    console.log(`Usuário ID ${req.usuario.id} está consultando o termo.`);
    const analise = await aiService.explainTerm(termo, contexto, idioma);
    const explicacao = [
        `Tradução: ${analise.traducao}`,
        `Sentido no contexto: ${analise.sentido_no_contexto}`,
        `Papel na passagem: ${analise.papel_na_passagem}`,
        `Em outras palavras: ${analise.parafrase}`
    ].join('\n\n');

    res.json({ explicacao, analise });
}

async function generateMinigame(req, res) {
    const flashcards = await require('../services/flashcard.service').getRandomFlashcards(req.usuario.id);
    if (flashcards.length < 2) {
        return res.status(400).json({ erro: 'Você precisa ter pelo menos 2 flashcards salvos no seu perfil para gerar um minigame.' });
    }
    console.log(`Gerando minigame customizado para o Usuário ID: ${req.usuario.id}`);
    res.json({ quiz: await aiService.generateQuiz(flashcards) });
}

module.exports = { explain, generateMinigame };