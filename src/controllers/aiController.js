const geminiService = require('../services/geminiService');
const databaseService = require('../services/databaseService');

async function explicar(req, res) {
    const { termo, contexto, livro_titulo, cfi } = req.body;

    if (!termo || !contexto) {
        return res.status(400).json({ erro: 'Dados incompletos.' });
    }

    try {
        console.log(`Usuário ID ${req.usuario.id} está consultando o termo.`);
        const vocabulario = await geminiService.gerarExplicacao(termo, contexto);

        if (!vocabulario?.termo_base || !vocabulario?.traducao || !vocabulario?.explicacao) {
            return res.status(500).json({ erro: 'A IA retornou um formato de vocabulário inválido.' });
        }

        await databaseService.salvarVocabulario({
            usuarioId: req.usuario.id,
            termoBase: vocabulario.termo_base,
            traducao: vocabulario.traducao,
            explicacao: vocabulario.explicacao,
            contexto,
            livroTitulo: livro_titulo,
            cfi,
        });
        return res.json({ explicacao: vocabulario });
    } catch (error) {
        console.error('Erro na API da IA:', error);
        return res.status(500).json({ erro: 'Falha ao processar com a IA.' });
    }
}

module.exports = { explicar };