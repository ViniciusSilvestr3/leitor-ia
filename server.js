require('dotenv').config();
const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = require('./src/app');
const { initializeDatabase } = require('./src/config/database');
const { port } = require('./src/config/env');

async function startServer() {
    try {
        await initializeDatabase();
        console.log('Conectado ao banco de dados SQLite.');
        app.listen(port, () => console.log(`Servidor escalável rodando em http://localhost:${port}`));
    } catch (error) {
        console.error('Erro ao inicializar o banco de dados:', error);
        process.exitCode = 1;
    }
}

startServer();