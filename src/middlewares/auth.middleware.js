const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
    }

    if (!jwtSecret) {
        console.error('JWT_SECRET não configurado.');
        return res.status(500).json({ erro: 'Falha na configuração do servidor.' });
    }

    jwt.verify(token, jwtSecret, (error, usuario) => {
        if (error) return res.status(403).json({ erro: 'Token inválido ou expirado.' });
        req.usuario = usuario;
        next();
    });
}

module.exports = authenticateToken;