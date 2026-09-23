const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const modelo = 'gemini-3.5-flash';

async function gerarExplicacao(termo, contexto) {
    const prompt = `Atue como um especialista literário e professor de idiomas auxiliando um leitor.
    
    TERMO SELECIONADO: "${termo}"
    CONTEXTO DO LIVRO: "${contexto}"

    Diretrizes rigorosas:
    1. Foque EXCLUSIVAMENTE no significado que a palavra assume nesta frase específica.
    2. Se for um termo fictício, nome próprio ou magia, apenas explique sua função baseada no contexto.
    3. REGRA ABSOLUTA: Sob nenhuma circunstância dê spoilers ou revele fatos futuros da trama.

    Retorne ESTRITAMENTE o seguinte formato JSON:
    {
        "termo_base": "A palavra no infinitivo ou singular (ideal para flashcards)",
        "traducao": "Tradução curta ou sinônimo (máximo de 3 palavras)",
        "explicacao": "Explicação breve da nuance literária ou uso na frase (máximo de 2 frases)"
    }`;

    let tentativas = 2;
    while (tentativas > 0) {
        try {
            const response = await ai.models.generateContent({
                model: modelo,
                contents: prompt,
                config: {
                    // Força a IA a retornar apenas um JSON válido, sem formatação markdown
                    responseMimeType: "application/json",
                }
            });

            // Como garantimos o MimeType, podemos fazer o parse diretamente
            return JSON.parse(response.text);
        } catch (error) {
            if (error.status === 503 && tentativas > 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                tentativas--;
            } else {
                throw error;
            }
        }
    }
}

async function gerarMinigame(rows) {
    const dadosDoUsuario = rows
        .map(r => `Termo: "${r.termo_original}" usado em: "${r.frase_contexto}"`)
        .join('\n');

    const prompt = `Atue como um professor especialista em literatura guiando um leitor.
Sua missão é explicar o termo desconhecido revelando seu significado e sua profunda conexão com a história, personagens e cena em que ocorre.

TERMO SELECIONADO: "${termo}"
TRECHO DO LIVRO: "${contexto}"

Diretrizes:
1. Análise Contextual: Mergulhe no enredo. Explique como a palavra reflete os sentimentos dos personagens, a ironia do autor ou os eventos da trama naquele momento específico. Você pode e DEVE usar seu conhecimento prévio sobre a obra para enriquecer a explicação do trecho.
2. Definição Limpa: Forneça também o significado de dicionário da palavra, totalmente isolado da história.
3. REGRA ABSOLUTA: ZERO SPOILERS. Analise os motivos e a cena atual, mas nunca revele o final da obra ou grandes viradas futuras.

Retorne ESTRITAMENTE o seguinte formato JSON:
{
    "termo_base": "A palavra no infinitivo (ex: aterrar)",
    "traducao_direta": "Sinônimos (ex: apavorada, assustada)",
    "definicao_dicionario": "Significado genérico e limpo da palavra para salvar em banco de dados.",
    "analise_literaria": "A explicação rica e imersiva do trecho, citando personagens e conectando a palavra ao enredo da obra."
}`;

    try {
        const response = await ai.models.generateContent({
            model: modelo,
            contents: prompt,
            config: {
                // Garante que o retorno seja um JSON nativo
                responseMimeType: "application/json",
            }
        });

        // O SDK e a API garantem o formato, dispensando o uso de replace() ou regex
        return JSON.parse(response.text);
    } catch (error) {
        throw error;
    }
}

module.exports = { gerarExplicacao, gerarMinigame };