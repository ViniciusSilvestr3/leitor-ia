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
    await run(`CREATE TABLE IF NOT EXISTS users (
        cd_id_user INTEGER PRIMARY KEY AUTOINCREMENT,
        nm_user TEXT NOT NULL,
        ds_email TEXT NOT NULL UNIQUE,
        ds_password_hash TEXT NOT NULL,
        dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await run(`CREATE TABLE IF NOT EXISTS flashcards (
        cd_id_flashcard INTEGER PRIMARY KEY AUTOINCREMENT,
        cd_id_user INTEGER,
        nm_book_title TEXT,
        ds_original_term TEXT,
        ds_context_sentence TEXT,
        ds_ai_explanation TEXT,
        cd_cfi TEXT,
        dt_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(cd_id_user) REFERENCES users(cd_id_user)
    )`);

    await run(`CREATE TABLE IF NOT EXISTS dictionary (
        cd_id_dictionary INTEGER PRIMARY KEY AUTOINCREMENT,
        ds_term TEXT NOT NULL,
        ds_normalized_term TEXT NOT NULL,
        ds_normalized_context TEXT NOT NULL,
        tp_language TEXT NOT NULL DEFAULT 'pt-BR',
        ds_translation TEXT NOT NULL,
        ds_contextual_meaning TEXT NOT NULL,
        ds_passage_role TEXT NOT NULL,
        ds_paraphrase TEXT NOT NULL,
        dt_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        dt_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (ds_normalized_term, ds_normalized_context, tp_language)
    )`);
}

module.exports = { all, get, initializeDatabase, run };