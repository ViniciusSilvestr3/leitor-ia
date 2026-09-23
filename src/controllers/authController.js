const authService = require('../services/authService');

async function cadastrar(req, res) {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ erro: 'Preencha todos os campos.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ erro: 'O formato do e-mail é inválido.' });
    }

    try {
        await authService.cadastrarUsuario({ nome, email, senha });
        return res.status(201).json({ mensagem: 'Usuário criado com sucesso!' });
    } catch (error) {
        if (error.code === 'EMAIL_DUPLICADO') {
            return res.status(400).json({ erro: error.message });
        }
        return res.status(500).json({ erro: 'Erro ao salvar usuário.' });
    }
}

async function login(req, res) {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: 'Preencha todos os campos.' });
    }

    try {
        const token = await authService.autenticarUsuario({ email, senha });
        const usuario = await authService.obterUsuarioPorEmail(email);
        return res.json({
            mensagem: 'Login efetuado com sucesso!',
            token,
            usuario: { nome: usuario.nome, email: usuario.email },
        });
    } catch (error) {
        if (error.code === 'CREDENCIAIS_INVALIDAS') {
            return res.status(400).json({ erro: error.message });
        }
        if (error.code === 'CONFIGURACAO_AUSENTE') {
            return res.status(500).json({ erro: 'Falha na configuração do servidor.' });
        }
        console.error('Erro capturado durante o login:', error);
        return res.status(500).json({ erro: 'Falha ao processar a autenticação.' });
    }
}

module.exports = { cadastrar, login };