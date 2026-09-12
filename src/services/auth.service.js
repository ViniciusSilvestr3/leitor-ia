const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const database = require('../config/database');
const { jwtSecret } = require('../config/env');

async function createUser({ nome, email, senha }) {
    const senhaHash = await bcrypt.hash(senha, 10);

    try {
        return await database.run(
            'INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)',
            [nome, email, senhaHash]
        );
    } catch (error) {
        if (error.message.includes('UNIQUE')) {
            const duplicateError = new Error('Este e-mail já está cadastrado.');
            duplicateError.statusCode = 400;
            throw duplicateError;
        }
        throw error;
    }
}

async function authenticateUser(email, senha) {
    const usuario = await database.get('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) return null;
    if (!jwtSecret) throw new Error('JWT_SECRET não configurado.');

    return {
        token: jwt.sign({ id: usuario.id, email: usuario.email }, jwtSecret, { expiresIn: '7d' }),
        usuario: { nome: usuario.nome, email: usuario.email }
    };
}

module.exports = { authenticateUser, createUser };