const database = require('../config/database');

function saveFlashcard(usuarioId, { termo, contexto, explicacao, livro_titulo, cfi }) {
    return database.run(
        `INSERT INTO flashcards
        (cd_id_user, nm_book_title, ds_original_term, ds_context_sentence, ds_ai_explanation, cd_cfi)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [usuarioId, livro_titulo || 'Livro Desconhecido', termo, contexto, explicacao, cfi || '']
    );
}

function deleteFlashcard(id, usuarioId) {
    return database.run(
        'DELETE FROM flashcards WHERE cd_id_flashcard = ? AND cd_id_user = ?',
        [id, usuarioId]
    );
}

function listFlashcards(usuarioId) {
    return database.all(
        `SELECT cd_id_flashcard AS id, cd_id_user AS usuario_id, nm_book_title AS livro_titulo,
            ds_original_term AS termo_original, ds_context_sentence AS frase_contexto,
            ds_ai_explanation AS explicacao_ia, cd_cfi AS cfi,
            dt_created_at AS data_criacao
         FROM flashcards WHERE cd_id_user = ? ORDER BY cd_id_flashcard DESC`,
        [usuarioId]
    );
}

function getRandomFlashcards(usuarioId) {
    return database.all(
        `SELECT ds_original_term AS termo_original, ds_context_sentence AS frase_contexto
         FROM flashcards WHERE cd_id_user = ? ORDER BY RANDOM() LIMIT 5`,
        [usuarioId]
    );
}

module.exports = { deleteFlashcard, getRandomFlashcards, listFlashcards, saveFlashcard };