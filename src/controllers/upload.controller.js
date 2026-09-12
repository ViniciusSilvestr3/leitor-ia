function upload(req, res) {
    if (!req.file) return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
    const formato = req.file.originalname.toLowerCase().endsWith('.pdf') ? 'pdf' : 'epub';
    res.json({ mensagem: 'Upload feito com sucesso!', caminho: `/uploads/${req.file.filename}`, formato });
}

module.exports = { upload };