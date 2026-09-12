const { authenticateUser, createUser } = require('../services/auth.service');

async function register(req, res) {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ erro: 'Preencha todos os campos.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ erro: 'O formato do e-mail é inválido.' });
    }

    await createUser({ nome, email, senha });
    res.status(201).json({ mensagem: 'Usuário criado com sucesso!' });
}

async function login(req, res) {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ erro: 'Preencha todos os campos.' });

    const result = await authenticateUser(email, senha);
    if (!result) return res.status(400).json({ erro: 'E-mail ou senha incorretos.' });
    res.json({ mensagem: 'Login efetuado com sucesso!', ...result });
}

module.exports = { login, register };