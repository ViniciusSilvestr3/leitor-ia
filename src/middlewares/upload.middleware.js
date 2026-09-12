const multer = require('multer');
const path = require('path');
const { uploadsPath } = require('../config/env');

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadsPath),
    filename: (_req, file, callback) => callback(null, `${Date.now()}${path.extname(file.originalname)}`)
});

module.exports = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const isSupported = extension === '.epub' || extension === '.pdf';
        callback(isSupported ? null : new Error('Apenas arquivos EPUB ou PDF são permitidos.'), isSupported);
    }
});