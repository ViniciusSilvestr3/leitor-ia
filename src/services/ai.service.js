const { GoogleGenAI } = require('@google/genai');
const { geminiModel } = require('../config/env');

const ai = new GoogleGenAI({});
const explanationCache = new Map();
const MAX_CONTEXT_LENGTH = 1400;

function normalizeText(value = '') {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function buildRelevantContext(termo, contexto) {
    const rawContext = normalizeText(contexto);
    if (!rawContext) return '';

    const cleanTerm = normalizeText(termo).toLowerCase();
    const sentences = rawContext.split(/(?<=[.!?])\s+/).map(sentence => normalizeText(sentence)).filter(Boolean);

    if (!sentences.length) return rawContext.slice(0, MAX_CONTEXT_LENGTH);

    let bestSentence = sentences[0];
    let bestScore = -Infinity;

    for (const sentence of sentences) {
        const lower = sentence.toLowerCase();
        let score = 0;

        if (lower.includes(cleanTerm)) score += 50;
        score += sentence.split(/\s+/).filter(word => word.length > 3).length;

        if (score > bestScore) {
            bestScore = score;
            bestSentence = sentence;
        }
    }

    return bestSentence.slice(0, MAX_CONTEXT_LENGTH);
}

function shouldRetryModel(error) {
    const status = error?.status ?? error?.code ?? error?.response?.status;
    return [400, 404, 429, 503].includes(Number(status));
}

async function generateContent(prompt, config = {}, modelPriority = [geminiModel]) {
    const modelsToTry = [...new Set(modelPriority.filter(Boolean))];
    let lastError;

    for (const modelName of modelsToTry) {
        try {
            const response = await ai.models.generateContent({
                model: modelName,
                contents: prompt,
                config: {
                    ...config,
                    thinkingConfig: {
                        includeThoughts: false,
                        thinkingBudget: 0
                    }
                }
            });
            return response.text;
        } catch (error) {
            lastError = error;
            if (!shouldRetryModel(error) || modelName === modelsToTry[modelsToTry.length - 1]) {
                throw error;
            }

            const waitTime = error?.status === 429 ? 5000 : 2000;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }

    throw lastError;
}

async function explainTerm(termo, contexto) {
    const termoLimpo = normalizeText(termo);
    const contextoReduzido = buildRelevantContext(termoLimpo, contexto);
    const cacheKey = `${termoLimpo.toLowerCase()}::${contextoReduzido.toLowerCase()}`;

    if (explanationCache.has(cacheKey)) return explanationCache.get(cacheKey);

    const buildPrompt = (mode = 'simple') => {
        if (mode === 'simple') {
            return `Você é um professor de literatura.
Termo: "${termoLimpo}"
Contexto: "${contextoReduzido}"
Responda em português em uma frase curta. Diga primeiro a tradução do termo no sentido dessa frase e depois explique a nuance em poucos termos. Máximo de 30 palavras.`;
        }

        return `Você é um professor de literatura.
Termo: "${termoLimpo}"
Contexto: "${contextoReduzido}"
Resposta obrigatória em português, em uma única frase, sem listas nem markdown. Diga a tradução no sentido usado na frase e a nuance do termo.`;
    };

    let explanation = '';

    for (const mode of ['simple', 'fallback']) {
        const prompt = buildPrompt(mode);
        const result = await generateContent(prompt, {
            maxOutputTokens: 120,
            temperature: 0.2
        });

        const cleaned = normalizeText(result || '').replace(/^['"\n]+|['"\n]+$/g, '');
        if (cleaned && cleaned.length >= 12 && cleaned.split(/\s+/).length >= 5) {
            explanation = cleaned;
            break;
        }
    }

    if (!explanation) {
        explanation = `O termo "${termoLimpo}" no contexto indicado significa algo relacionado ao uso da frase, e a nuance depende do sentido literário da passagem.`;
    }

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