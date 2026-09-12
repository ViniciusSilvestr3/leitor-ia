const database = require('../config/database');

function saveFlashcard(usuarioId, { termo, contexto, explicacao, livro_titulo, cfi }) {
    return database.run(
        `INSERT INTO flashcards
        (usuario_id, livro_titulo, termo_original, frase_contexto, explicacao_ia, cfi)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [usuarioId, livro_titulo || 'Livro Desconhecido', termo, contexto, explicacao, cfi || '']
    );
}

function deleteFlashcard(id, usuarioId) {
    return database.run('DELETE FROM flashcards WHERE id = ? AND usuario_id = ?', [id, usuarioId]);
}

function listFlashcards(usuarioId) {
    return database.all('SELECT * FROM flashcards WHERE usuario_id = ? ORDER BY id DESC', [usuarioId]);
}

function getRandomFlashcards(usuarioId) {
    return database.all(
        'SELECT termo_original, frase_contexto FROM flashcards WHERE usuario_id = ? ORDER BY RANDOM() LIMIT 5',
        [usuarioId]
    );
}

module.exports = { deleteFlashcard, getRandomFlashcards, listFlashcards, saveFlashcard };