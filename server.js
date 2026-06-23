require('dotenv').config();
const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

// NOVAS IMPORTAÇÕES PARA SEGURANÇA
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const ai = new GoogleGenAI({}); 

// Configuração do Multer (Upload)
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ==========================================
// BANCO DE DADOS: ESQUEMA MULTI-USUÁRIO
// ==========================================
const db = new sqlite3.Database('./banco.sqlite', (err) => {
    if (err) console.error('Erro no SQLite:', err.message);
    else {
        console.log('Conectado ao banco de dados SQLite.');
        
        // 1. Tabela de Usuários
        db.run(`CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            senha_hash TEXT NOT NULL,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // 2. Tabela de Flashcards (Modificada para incluir usuario_id)
        db.run(`CREATE TABLE IF NOT EXISTS flashcards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            termo_original TEXT NOT NULL,
            frase_contexto TEXT NOT NULL,
            explicacao_ia TEXT,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        )`);
    }
});

// ==========================================
// MIDDLEWARE DE AUTENTICAÇÃO (O GUARDA)
// ==========================================
function autenticarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    // O token geralmente vem no formato: Bearer TOKEN_AQUI
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, usuarioDecodificado) => {
        if (err) {
            return res.status(403).json({ erro: 'Token inválido ou expirado.' });
        }
        // Injeta os dados do usuário logado na requisição para as próximas rotas usarem
        req.usuario = usuarioDecodificado;
        next();
    });
}

// ==========================================
// ROTAS DE AUTENTICAÇÃO
// ==========================================

// 1. Cadastro de Usuário
app.post('/api/auth/cadastro', async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ erro: 'Preencha todos os campos.' });
    }

    try {
        // Criptografa a senha com um fator de custo de 10
        const senhaHash = await bcrypt.hash(senha, 10);

        const query = `INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)`;
        db.run(query, [nome, email, senhaHash], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ erro: 'Este e-mail já está cadastrado.' });
                }
                return res.status(500).json({ erro: 'Erro ao salvar usuário.' });
            }
            res.status(201).json({ mensagem: 'Usuário criado com sucesso!' });
        });
    } catch (error) {
        res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
});

// 2. Login de Usuário
app.post('/api/auth/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: 'Preencha todos os campos.' });
    }

    const query = `SELECT * FROM usuarios WHERE email = ?`;
    db.get(query, [email], async (err, usuario) => {
        if (err) return res.status(500).json({ erro: 'Erro no servidor.' });
        if (!usuario) return res.status(400).json({ erro: 'E-mail ou senha incorretos.' });

        // Compara a senha digitada com o Hash salvo no banco
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaCorreta) return res.status(400).json({ erro: 'E-mail ou senha incorretos.' });

        // Gera o Token JWT contendo o ID e o e-mail do usuário (expira em 7 dias)
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Devolve o token e os dados básicos do usuário
        res.json({
            mensagem: 'Login efetuado com sucesso!',
            token,
            usuario: { nome: usuario.nome, email: usuario.email }
        });
    });
});

// ==========================================
// ROTAS DO NEGÓCIO (AGORA PROTEGIDAS)
// ==========================================

// Rota de Upload protegida (Opcional por enquanto, mas bom estruturar)
app.post('/api/upload', autenticarToken, upload.single('livro'), (req, res) => {
    if (!req.file) return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
    res.json({ mensagem: 'Upload feito com sucesso!', caminho: `/uploads/${req.file.filename}` });
});

// Rota da IA protegida
app.post('/api/explicar', autenticarToken, async (req, res) => {
    const { termo, contexto } = req.body;
    
    // Conseguimos saber exatamente quem está fazendo a requisição!
    console.log(`Usuário ID ${req.usuario.id} está consultando o termo.`);

    if (!termo || !contexto) return res.status(400).json({ erro: 'Dados incompletos.' });

    const prompt = `Você é um professor de literatura e especialista no ensino de idiomas auxiliando um leitor. 
    O usuário teve dúvida no termo "${termo}", que aparece dentro do seguinte parágrafo do livro que ele está lendo: 
    "${contexto}"
    Forneça uma resposta direta com:
    1. Tradução focando no sentido usado nesta frase.
    2. Explique brevemente o tempo verbal ou a nuance literária/idiomática.
    REGRA ABSOLUTA: Sob nenhuma circunstância dê spoilers ou revele fatos futuros da trama.`;

    let tentativas = 2;
    while (tentativas > 0) {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: prompt,
            });

            // SALVANDO NO BANCO DE DADOS ATRELADO AO USUÁRIO LOGADO
            

            return res.json({ explicacao: response.text });

        } catch (error) {
            if (error.status === 503 && tentativas > 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                tentativas--;
            } else {
                console.error("Erro na API da IA:", error);
                return res.status(500).json({ erro: 'Falha ao processar com a IA.' });
            }
        }
    }
});
// Rota para salvar o flashcard manualmente
app.post('/api/flashcards/salvar', autenticarToken, (req, res) => {
    const { termo, contexto, explicacao } = req.body;

    if (!termo || !contexto || !explicacao) {
        return res.status(400).json({ erro: 'Dados incompletos para salvar o flashcard.' });
    }

    const query = `INSERT INTO flashcards (usuario_id, termo_original, frase_contexto, explicacao_ia) VALUES (?, ?, ?, ?)`;
    
    db.run(query, [req.usuario.id, termo, contexto, explicacao], function(err) {
        if (err) {
            console.error("Erro ao salvar flashcard:", err.message);
            return res.status(500).json({ erro: 'Não foi possível salvar no seu vocabulário.' });
        }
        res.json({ mensagem: 'Flashcard salvo com sucesso!', id: this.lastID });
    });
});
// ==========================================
// ROTA 1: BUSCAR TODOS OS FLASHCARDS DO USUÁRIO LOGADO
// ==========================================
app.get('/api/flashcards', autenticarToken, (req, res) => {
    // Busca apenas os cards pertencentes ao ID do usuário do token JWT
    const query = `SELECT * FROM flashcards WHERE usuario_id = ? ORDER BY id DESC`;
    
    db.all(query, [req.usuario.id], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar flashcards:", err.message);
            return res.status(500).json({ erro: 'Erro ao buscar banco de dados.' });
        }
        res.json({ flashcards: rows });
    });
});

// ==========================================
// ROTA 2: GERAR MINIGAME ESTILO KAHOOT COM IA
// ==========================================
app.get('/api/minigame/gerar', autenticarToken, (req, res) => {
    // 1. Sorteia até 5 flashcards que o usuário salvos no banco para servir de matéria-prima
    const query = `SELECT termo_original, frase_contexto FROM flashcards WHERE usuario_id = ? ORDER BY RANDOM() LIMIT 5`;
    
    db.all(query, [req.usuario.id], async (err, rows) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro ao coletar dados para o jogo.' });
        }

        // Validação: O usuário precisa ter uma base mínima para jogar
        if (!rows || rows.length < 2) {
            return res.status(400).json({ 
                erro: 'Você precisa ter pelo menos 2 flashcards salvos no seu perfil para gerar um minigame.' 
            });
        }

        // 2. Formata os flashcards sorteados em uma string para enviar no prompt
        const dadosDoUsuario = rows.map(r => `Termo: "${r.termo_original}" usado em: "${r.frase_contexto}"`).join('\n');

        // 3. Monta o Prompt instruindo a IA a agir como um motor de jogo e retornar JSON estrito
        const prompt = `
        Você é o motor de um jogo de perguntas e respostas educativo (estilo Kahoot) focado em fixação de vocabulário e literatura.
        Com base nos flashcards reais que o usuário salvou no banco de dados, crie um quiz com 3 perguntas exclusivas.

        Dados extraídos do perfil do usuário:
        ${dadosDoUsuario}

        Instruções para a criação das perguntas (mescle os estilos):
        - Uma pergunta focando na tradução correta do termo dentro do contexto da obra.
        - Uma pergunta de preenchimento de lacuna (exiba uma nova frase e pergunte qual dos termos se encaixa gramaticalmente).
        - Uma pergunta sobre a nuance ou significado do termo.

        Sua resposta deve ser EXCLUSIVAMENTE um JSON estruturado (um array de objetos), sem explicações antes ou depois, e sem blocos de código markdown (\`\`\`json ... \`\`\`). Siga rigorosamente esta estrutura:
        [
          {
            "id": 1,
            "pergunta": "Texto da pergunta aqui...",
            "opcoes": ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"],
            "resposta_correta": 0,
            "explicacao": "Texto explicando detalhadamente o porquê de a resposta estar correta."
          }
        ]
        `;

        try {
            console.log(`Gerando minigame customizado para o Usuário ID: ${req.usuario.id}`);
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            // Tratamento de string preventivo caso a IA envie marcações markdown por vício
            let textoJson = response.text.trim();
            if (textoJson.startsWith("```json")) textoJson = textoJson.replace(/```json|```/g, "").trim();
            if (textoJson.startsWith("```")) textoJson = textoJson.replace(/```/g, "").trim();

            // Transforma o texto da IA em um objeto JSON real para a API entregar limpo
            const quizFinal = JSON.parse(textoJson);
            
            res.json({ quiz: quizFinal });

        } catch (error) {
            console.error("Erro ao processar minigame com IA:", error);
            res.status(500).json({ erro: 'Falha ao construir o minigame dinâmico.' });
        }
    });
});
app.listen(port, () => {
    console.log(`Servidor escalável rodando em http://localhost:${port}`);
});