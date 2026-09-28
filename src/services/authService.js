const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const database = require('./databaseService');

async function cadastrarUsuario({ nome, email, senha }) {
    try {
        const senhaHash = await bcrypt.hash(senha, 10);
        await database.run(
            'INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)',
            [nome, email, senhaHash]
        );
    } catch (error) {
        if (error.message.includes('UNIQUE')) {
            const duplicateError = new Error('Este e-mail já está cadastrado.');
            duplicateError.code = 'EMAIL_DUPLICADO';
            throw duplicateError;
        }
        throw error;
    }
}

async function autenticarUsuario({ email, senha }) {
    try {
        const usuario = await database.get('SELECT * FROM usuarios WHERE email = ?', [email]);

        if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
            const credentialsError = new Error('E-mail ou senha incorretos.');
            credentialsError.code = 'CREDENCIAIS_INVALIDAS';
            throw credentialsError;
        }

        if (!process.env.JWT_SECRET) {
            const configurationError = new Error('JWT_SECRET não encontrado no arquivo .env');
            configurationError.code = 'CONFIGURACAO_AUSENTE';
            throw configurationError;
        }

        return jwt.sign(
            { id: usuario.id, email: usuario.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
    } catch (error) {
        throw error;
    }
}

async function obterUsuarioPorEmail(email) {
    try {
        return await database.get('SELECT nome, email FROM usuarios WHERE email = ?', [email]);
    } catch (error) {
        throw error;
    }
}

module.exports = { autenticarUsuario, cadastrarUsuario, obterUsuarioPorEmail };