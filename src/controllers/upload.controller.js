const path = require('path');
const { uploadsPath } = require('../config/env');

function upload(req, res) {
    if (!req.file) return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
    const formato = req.file.originalname.toLowerCase().endsWith('.pdf') ? 'pdf' : 'epub';
    res.json({ mensagem: 'Upload feito com sucesso!', caminho: `/api/uploads/${req.file.filename}`, formato });
}

function download(req, res, next) {
    const filename = path.basename(req.params.filename);
    if (filename !== req.params.filename) return res.status(404).json({ erro: 'Arquivo não encontrado.' });

    res.sendFile(filename, { root: uploadsPath }, error => {
        if (error) next(error);
    });
}

module.exports = { download, upload };