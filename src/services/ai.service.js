const { GoogleGenAI } = require('@google/genai');
const { geminiModel } = require('../config/env');

const ai = new GoogleGenAI({});
const explanationCache = new Map();
const MAX_CONTEXT_LENGTH = 2400;

async function generateContent(prompt, config = {}) {
    let attempts = 2;
    while (attempts > 0) {
        try {
            const response = await ai.models.generateContent({
                model: geminiModel,
                contents: prompt,
                config
            });
            return response.text;
        } catch (error) {
            if (error.status === 503 && attempts > 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                attempts--;
                continue;
            }
            throw error;
        }
    }
}

async function explainTerm(termo, contexto) {
    const contextoReduzido = contexto.trim().slice(0, MAX_CONTEXT_LENGTH);
    const cacheKey = `${termo.trim().toLowerCase()}::${contextoReduzido.toLowerCase()}`;
    if (explanationCache.has(cacheKey)) return explanationCache.get(cacheKey);

    const prompt = `Você é um professor de literatura e especialista no ensino de idiomas auxiliando um leitor.
O usuário teve dúvida no termo "${termo}", que aparece dentro do seguinte parágrafo do livro que ele está lendo:
"${contextoReduzido}"
Forneça uma resposta direta com:
1. Tradução focando no sentido usado nesta frase.
2. Explique em uma frase o tempo verbal ou a nuance literária/idiomática.
Responda em no máximo 80 palavras.
REGRA ABSOLUTA: Sob nenhuma circunstância dê spoilers ou revele fatos futuros da trama.`;

    const explanation = await generateContent(prompt, {
        maxOutputTokens: 120,
        temperature: 0.2
    });
    explanationCache.set(cacheKey, explanation);
    return explanation;
}

async function generateQuiz(rows) {
    const data = rows.map(row => `Termo: "${row.termo_original}" usado em: "${row.frase_contexto}"`).join('\n');
    const prompt = `Você é o motor de um jogo de perguntas e respostas educativo (estilo Kahoot) focado em fixação de vocabulário e literatura.
Com base nos flashcards reais que o usuário salvou no banco de dados, crie um quiz com 3 perguntas exclusivas.

Dados extraídos do perfil do usuário:
${data}

Instruções para a criação das perguntas (mescle os estilos):
- Uma pergunta focando na tradução correta do termo dentro do contexto da obra.
- Uma pergunta de preenchimento de lacuna (exiba uma nova frase e pergunte qual dos termos se encaixa gramaticalmente).
- Uma pergunta sobre a nuance ou significado do termo.

Sua resposta deve ser EXCLUSIVAMENTE um JSON estruturado (um array de objetos), sem explicações antes ou depois, e sem blocos de código markdown. Siga rigorosamente esta estrutura:
[
  {
    "id": 1,
    "pergunta": "Texto da pergunta aqui...",
    "opcoes": ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"],
    "resposta_correta": 0,
    "explicacao": "Texto explicando detalhadamente o porquê de a resposta estar correta."
  }
]`;

    const text = (await generateContent(prompt)).trim().replace(/^```json|^```|```$/g, '').trim();
    return JSON.parse(text);
}

module.exports = { explainTerm, generateQuiz };