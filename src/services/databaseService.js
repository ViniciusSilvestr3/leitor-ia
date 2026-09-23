const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./banco.sqlite');

function run(query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function onRun(error) {
            if (error) return reject(error);
            resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

function get(query, params = []) {
    return new Promise((resolve, reject) => {
        db.get(query, params, (error, row) => {
            if (error) return reject(error);
            resolve(row);
        });
    });
}

function all(query, params = []) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (error, rows) => {
            if (error) return reject(error);
            resolve(rows);
        });
    });
}

async function initializeDatabase() {
    try {
        await run(`CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            senha_hash TEXT NOT NULL,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        await run(`CREATE TABLE IF NOT EXISTS flashcards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            livro_titulo TEXT,
            termo_original TEXT,
            traducao TEXT,
            frase_contexto TEXT,
            explicacao_ia TEXT,
            cfi TEXT,
            data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
        )`);

        try {
            await run('ALTER TABLE flashcards ADD COLUMN traducao TEXT');
        } catch (error) {
            if (!error.message.includes('duplicate column name')) throw error;
        }
    } catch (error) {
        console.error('Erro ao inicializar o banco de dados:', error.message);
        throw error;
    }
}

async function salvarVocabulario({ usuarioId, termoBase, traducao, explicacao, contexto, livroTitulo, cfi }) {
    try {
        return await run(
            `INSERT INTO flashcards
            (usuario_id, livro_titulo, termo_original, traducao, frase_contexto, explicacao_ia, cfi)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                usuarioId,
                livroTitulo || 'Livro Desconhecido',
                termoBase,
                traducao,
                contexto,
                explicacao,
                cfi || '',
            ]
        );
    } catch (error) {
        throw error;
    }
}

module.exports = { all, get, initializeDatabase, run, salvarVocabulario };