const express = require('express');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const path = require('path');
const apiRoutes = require('./routes/api.routes');

const app = express();
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-8',
    legacyHeaders: false
});

app.use(helmet());
app.use(express.json({ limit: '32kb' }));
app.use(express.static(path.resolve('public')));
app.use('/api', apiLimiter, apiRoutes);

app.use((error, _req, res, _next) => {
    console.error(error);
    const statusCode = Number.isInteger(error.statusCode) && error.statusCode >= 400 && error.statusCode < 500
        ? error.statusCode
        : 500;
    const message = statusCode === 500 ? 'Erro interno do servidor.' : error.message;
    res.status(statusCode).json({ erro: message });
});

module.exports = app;