const database = require('../config/database');

function normalizeText(value = '') {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeKey(value = '') {
    return normalizeText(value).toLocaleLowerCase('pt-BR');
}

function normalizeLanguage(value = 'pt-BR') {
    return normalizeText(value) || 'pt-BR';
}

function findExplanation(termo, contexto, idioma = 'pt-BR') {
    return database.get(
        `SELECT ds_translation AS traducao, ds_contextual_meaning AS sentido_no_contexto,
            ds_passage_role AS papel_na_passagem, ds_paraphrase AS parafrase
         FROM dictionary
         WHERE ds_normalized_term = ? AND ds_normalized_context = ? AND tp_language = ?`,
        [normalizeKey(termo), normalizeKey(contexto), normalizeLanguage(idioma)]
    );
}

function saveExplanation(termo, contexto, explanation, idioma = 'pt-BR') {
    const termoNormalizado = normalizeKey(termo);
    const contextoNormalizado = normalizeKey(contexto);

    return database.run(
        `INSERT INTO dictionary
        (ds_term, ds_normalized_term, ds_normalized_context, tp_language, ds_translation,
         ds_contextual_meaning, ds_passage_role, ds_paraphrase)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (ds_normalized_term, ds_normalized_context, tp_language)
        DO UPDATE SET
            ds_translation = excluded.ds_translation,
            ds_contextual_meaning = excluded.ds_contextual_meaning,
            ds_passage_role = excluded.ds_passage_role,
            ds_paraphrase = excluded.ds_paraphrase,
            dt_updated_at = CURRENT_TIMESTAMP`,
        [
            normalizeText(termo),
            termoNormalizado,
            contextoNormalizado,
            normalizeLanguage(idioma),
            explanation.traducao,
            explanation.sentido_no_contexto,
            explanation.papel_na_passagem,
            explanation.parafrase
        ]
    );
}

module.exports = { findExplanation, saveExplanation };