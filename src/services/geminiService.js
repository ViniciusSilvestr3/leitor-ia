const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const modelo = (process.env.GEMINI_VERSION || 'gemini-3.8-flash').trim();

async function gerarExplicacao(termo, contexto, idiomaDestino = 'Português') {
    const prompt = `Atue como um especialista literário e professor de idiomas auxiliando um leitor.
    
    TERMO SELECIONADO: "${termo}"
    CONTEXTO DO LIVRO: "${contexto}"

    Diretrizes rigorosas:
    1. Foque EXCLUSIVAMENTE no significado que a palavra assume nesta frase específica.
    2. Se for um termo fictício, nome próprio ou magia, apenas explique sua função baseada no contexto.
    3. REGRA ABSOLUTA: Sob nenhuma circunstância dê spoilers ou revele fatos futuros da trama.
    4. Gere a tradução e a análise literária estritamente em ${idiomaDestino}.

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

    const prompt = `Atue como um professor especialista em literatura e crie um quiz de revisão no estilo Kahoot.

Use exclusivamente os flashcards do usuário abaixo como fonte das perguntas:
${dadosDoUsuario}

Diretrizes:
1. Gere entre 3 e 5 perguntas, sem repetir o mesmo termo na mesma partida quando possível.
2. Cada pergunta deve testar o significado do termo no contexto fornecido.
3. Cada pergunta deve ter exatamente quatro alternativas curtas.
4. Apenas uma alternativa pode ser correta.
5. "resposta_correta" deve ser um índice numérico de 0 a 3 correspondente à alternativa correta.
6. A explicação deve ser breve e baseada no flashcard, sem spoilers.
7. Não use markdown e não inclua texto fora do JSON.

Retorne ESTRITAMENTE um array JSON neste formato:
[
    {
        "pergunta": "Qual é o significado do termo no contexto?",
        "opcoes": ["Alternativa 1", "Alternativa 2", "Alternativa 3", "Alternativa 4"],
        "resposta_correta": 0,
        "explicacao": "Explicação breve da resposta correta."
    }
]`;

    let ultimoErro;

    for (let tentativa = 1; tentativa <= 3; tentativa++) {
        try {
            const response = await ai.models.generateContent({
                model: modelo,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                }
            });

            const quiz = JSON.parse(response.text);
            validarQuiz(quiz);
            return quiz;
        } catch (error) {
            ultimoErro = error;
            if (error.status !== 503 || tentativa === 3) break;
            await new Promise(resolve => setTimeout(resolve, tentativa * 1500));
        }
    }

    if (ultimoErro?.status === 503) {
        console.warn('Gemini indisponível após três tentativas; usando quiz local.');
        return criarQuizLocal(rows);
    }

    throw ultimoErro;
}

function validarQuiz(quiz) {
    if (!Array.isArray(quiz) || quiz.length === 0) {
        throw new Error('A IA retornou um quiz vazio ou inválido.');
    }

    for (const pergunta of quiz) {
        if (!pergunta.pergunta || !Array.isArray(pergunta.opcoes) || pergunta.opcoes.length !== 4 ||
            !Number.isInteger(pergunta.resposta_correta) || pergunta.resposta_correta < 0 ||
            pergunta.resposta_correta > 3 || !pergunta.explicacao) {
            throw new Error('A IA retornou uma pergunta de quiz inválida.');
        }
    }
}

function criarQuizLocal(rows) {
    const alternativasDisponiveis = rows
        .flatMap(row => [row.traducao, row.termo_original])
        .filter(Boolean)
        .map(valor => valor.trim())
        .filter((valor, index, lista) => lista.indexOf(valor) === index);

    const quiz = rows.map(row => {
        const resposta = (row.traducao || row.termo_original).trim();
        const distratores = alternativasDisponiveis
            .filter(alternativa => alternativa !== resposta)
            .slice(0, 3);

        while (distratores.length < 3) {
            distratores.push(`Outra opção ${distratores.length + 1}`);
        }

        const opcoes = [resposta, ...distratores].sort(() => Math.random() - 0.5);
        return {
            pergunta: `Qual é o significado de "${row.termo_original}" no contexto estudado?`,
            opcoes,
            resposta_correta: opcoes.indexOf(resposta),
            explicacao: row.explicacao_ia || `A resposta correta está relacionada ao significado salvo para "${row.termo_original}".`,
        };
    });

    validarQuiz(quiz);
    return quiz;
}

module.exports = { gerarExplicacao, gerarMinigame };