const sqlite3 = require('sqlite3').verbose();
const { databasePath } = require('./env');

const db = new sqlite3.Database(databasePath);

function run(sql, parameters = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, parameters, function onRun(error) {
            if (error) return reject(error);
            resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

function get(sql, parameters = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, parameters, (error, row) => {
            if (error) return reject(error);
            resolve(row);
        });
    });
}

function all(sql, parameters = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, parameters, (error, rows) => {
            if (error) return reject(error);
            resolve(rows);
        });
    });
}

async function initializeDatabase() {
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
        frase_contexto TEXT,
        explicacao_ia TEXT,
        cfi TEXT,
        data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
    )`);
}

module.exports = { all, get, initializeDatabase, run };