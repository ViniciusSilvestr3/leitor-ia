require('dotenv').config();

const express = require('express');
const path = require('path');
const authRoutes = require('./src/routes/authRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const flashcardRoutes = require('./src/routes/flashcardRoutes');
const minigameRoutes = require('./src/routes/minigameRoutes');
const database = require('./src/services/databaseService');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api', aiRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/minigame', minigameRoutes);

database.initializeDatabase()
    .then(() => {
        app.listen(port, () => {
            console.log(`Servidor escalável rodando em http://localhost:${port}`);
        });
    })
    .catch(() => {
        process.exitCode = 1;
    });

module.exports = app;