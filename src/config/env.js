require('dotenv').config();

const path = require('path');

module.exports = {
    port: Number(process.env.PORT) || 3000,
    jwtSecret: process.env.JWT_SECRET,
    databasePath: path.resolve(process.env.DATABASE_PATH || 'banco.sqlite'),
    uploadsPath: path.resolve(process.env.UPLOADS_PATH || 'uploads'),
    geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash'
};