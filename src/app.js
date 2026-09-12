const express = require('express');
const path = require('path');
const apiRoutes = require('./routes/api.routes');
const { uploadsPath } = require('./config/env');

const app = express();
app.use(express.json());
app.use(express.static(path.resolve('public')));
app.use('/uploads', express.static(uploadsPath));
app.use('/api', apiRoutes);

app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(error.statusCode || 500).json({ erro: error.message || 'Erro interno no servidor.' });
});

module.exports = app;