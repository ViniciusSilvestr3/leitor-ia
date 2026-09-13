const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const database = require('../config/database');
const { jwtSecret } = require('../config/env');

async function createUser({ nome, email, senha }) {
    const senhaHash = await bcrypt.hash(senha, 10);

    try {
        return await database.run(
            'INSERT INTO users (nm_user, ds_email, ds_password_hash) VALUES (?, ?, ?)',
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
    const usuario = await database.get(
        'SELECT cd_id_user, nm_user AS nome, ds_email AS email, ds_password_hash AS password_hash FROM users WHERE ds_email = ?',
        [email]
    );
    if (!usuario || !(await bcrypt.compare(senha, usuario.password_hash))) return null;
    if (!jwtSecret) throw new Error('JWT_SECRET não configurado.');

    return {
        token: jwt.sign({ id: usuario.cd_id_user, email: usuario.email }, jwtSecret, { expiresIn: '7d' }),
        usuario: { nome: usuario.nome, email: usuario.email }
    };
}

module.exports = { authenticateUser, createUser };