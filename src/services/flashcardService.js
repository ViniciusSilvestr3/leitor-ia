const database = require('./databaseService');

async function salvarFlashcard({ usuarioId, termo, contexto, explicacao, livroTitulo, cfi }) {
    try {
        return await database.run(
            `INSERT INTO flashcards
            (usuario_id, livro_titulo, termo_original, frase_contexto, explicacao_ia, cfi)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [usuarioId, livroTitulo || 'Livro Desconhecido', termo, contexto, explicacao, cfi || '']
        );
    } catch (error) {
        throw error;
    }
}

async function listarFlashcards(usuarioId) {
    try {
        return await database.all(
            'SELECT * FROM flashcards WHERE usuario_id = ? ORDER BY id DESC',
            [usuarioId]
        );
    } catch (error) {
        throw error;
    }
}

async function excluirFlashcard(id, usuarioId) {
    try {
        return await database.run(
            'DELETE FROM flashcards WHERE id = ? AND usuario_id = ?',
            [id, usuarioId]
        );
    } catch (error) {
        throw error;
    }
}

async function buscarFlashcardsParaMinigame(usuarioId) {
    try {
        return await database.all(
            'SELECT termo_original, frase_contexto FROM flashcards WHERE usuario_id = ? ORDER BY RANDOM() LIMIT 5',
            [usuarioId]
        );
    } catch (error) {
        throw error;
    }
}

module.exports = {
    buscarFlashcardsParaMinigame,
    excluirFlashcard,
    listarFlashcards,
    salvarFlashcard,
};