const { GoogleGenAI } = require('@google/genai');
const { geminiModel } = require('../config/env');
const dictionaryService = require('./dictionary.service');

const ai = new GoogleGenAI({});
const explanationCache = new Map();
const MAX_CONTEXT_LENGTH = 1400;
const MAX_CACHE_ENTRIES = 1000;

function cacheExplanation(key, value) {
    if (explanationCache.size >= MAX_CACHE_ENTRIES && !explanationCache.has(key)) {
        const oldestKey = explanationCache.keys().next().value;
        explanationCache.delete(oldestKey);
    }
    explanationCache.set(key, value);
}

function normalizeText(value = '') {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function buildRelevantContext(termo, contexto) {
    const rawContext = normalizeText(contexto);
    if (!rawContext) return '';

    const cleanTerm = normalizeText(termo).toLowerCase();
    const sentences = rawContext.split(/(?<=[.!?])\s+/).map(sentence => normalizeText(sentence)).filter(Boolean);

    if (!sentences.length) return rawContext.slice(0, MAX_CONTEXT_LENGTH);

    let bestIndex = 0;
    let bestScore = -Infinity;

    for (const [index, sentence] of sentences.entries()) {
        const lower = sentence.toLowerCase();
        let score = 0;

        if (lower.includes(cleanTerm)) score += 50;
        score += sentence.split(/\s+/).filter(word => word.length > 3).length;

        if (score > bestScore) {
            bestScore = score;
            bestIndex = index;
        }
    }

    const start = Math.max(0, bestIndex - 1);
    const end = Math.min(sentences.length, bestIndex + 2);
    return sentences.slice(start, end).join(' ').slice(0, MAX_CONTEXT_LENGTH);
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
                    responseMimeType: config.responseMimeType || 'text/plain'
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

async function explainTerm(termo, contexto, idioma = 'pt-BR') {
    const termoLimpo = normalizeText(termo);
    const contextoReduzido = buildRelevantContext(termoLimpo, contexto);
    const idiomaLimpo = normalizeText(idioma) || 'pt-BR';
    const cacheKey = `${idiomaLimpo.toLowerCase()}::${termoLimpo.toLowerCase()}::${contextoReduzido.toLowerCase()}`;

    if (explanationCache.has(cacheKey)) return explanationCache.get(cacheKey);

    const savedExplanation = await dictionaryService.findExplanation(termoLimpo, contextoReduzido, idiomaLimpo);
    if (savedExplanation) {
        const result = { ...savedExplanation, origem: 'banco' };
        cacheExplanation(cacheKey, result);
        return result;
    }

    const buildPrompt = (mode = 'simple') => {
        if (mode === 'simple') {
            return `Analise uma palavra ou expressão dentro de uma passagem de livro.
Termo selecionado: "${termoLimpo}"
Idioma do termo: "${idiomaLimpo}"
Contexto da passagem: "${contextoReduzido}"
    Responda exclusivamente com JSON válido, sem markdown, usando exatamente estas chaves:
    {"traducao":"...","sentido_no_contexto":"...","papel_na_passagem":"...","parafrase":"..."}

    Regras:
    - Escreva em português claro.
    - Explique o que o termo significa nesta situação específica, não uma definição genérica de dicionário.
    - Se for uma expressão técnica, de jogo, literatura ou outra área, explique brevemente o conceito dessa área e depois relacione-o à passagem.
    - Explique a emoção, intenção ou relação transmitida pelo termo quando isso estiver sustentado pelo contexto.
    - A paráfrase deve reescrever a ideia da passagem em português natural.
    - Não invente informações que não aparecem no contexto.
    - Se o contexto for insuficiente, diga isso brevemente em "papel_na_passagem".`;
        }

        return `Analise o termo de um livro com base somente no contexto abaixo.
Termo: "${termoLimpo}"
Idioma do termo: "${idiomaLimpo}"
Contexto: "${contextoReduzido}"
    Responda exclusivamente com JSON válido, sem markdown, usando estas chaves: traducao, sentido_no_contexto, papel_na_passagem, parafrase. Seja claro, contextual e não invente informações.`;
    };

    let explanation = '';

    for (const mode of ['simple', 'fallback']) {
        const prompt = buildPrompt(mode);
        const result = await generateContent(prompt, {
            maxOutputTokens: 240,
            temperature: 0.2,
            responseMimeType: 'application/json'
        });

        const cleaned = String(result || '').trim().replace(/^```json\s*|^```\s*|\s*```$/g, '').trim();
        try {
            const parsed = JSON.parse(cleaned);
            const analysis = {
                traducao: normalizeText(parsed.traducao),
                sentido_no_contexto: normalizeText(parsed.sentido_no_contexto),
                papel_na_passagem: normalizeText(parsed.papel_na_passagem),
                parafrase: normalizeText(parsed.parafrase)
            };

            if (Object.values(analysis).every(value => value)) {
                explanation = analysis;
                break;
            }
        } catch (_error) {}
    }

    if (!explanation) {
        explanation = {
            traducao: termoLimpo,
            sentido_no_contexto: 'Não foi possível determinar o sentido com segurança a partir do contexto disponível.',
            papel_na_passagem: 'O contexto enviado não foi suficiente para identificar a função do termo na passagem.',
            parafrase: contextoReduzido || 'Contexto indisponível.'
        };
    }

    await dictionaryService.saveExplanation(termoLimpo, contextoReduzido, explanation, idiomaLimpo);
    const result = { ...explanation, origem: 'ia' };
    cacheExplanation(cacheKey, result);
    return result;
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