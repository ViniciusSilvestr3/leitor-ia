const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const databasePath = path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), 'leitor-ia-test-')),
    'database.sqlite'
);

process.env.DATABASE_PATH = databasePath;

const database = require('../src/config/database');
const dictionaryService = require('../src/services/dictionary.service');

const explanation = {
    traducao: 'casa',
    sentido_no_contexto: 'Uma residência.',
    papel_na_passagem: 'Substantivo.',
    parafrase: 'A personagem voltou para casa.'
};

beforeAll(async () => {
    await database.initializeDatabase();
});

afterAll(() => {
    fs.rmSync(path.dirname(databasePath), { recursive: true, force: true });
});

test('cria a tabela do dicionário e encontra uma explicação salva', async () => {
    await dictionaryService.saveExplanation('House', 'She went home.', explanation);

    const result = await dictionaryService.findExplanation(' house ', 'She went home.');

    expect(result).toEqual(explanation);
});

test('normaliza maiúsculas e espaços sem criar outra chave', async () => {
    await dictionaryService.saveExplanation(' HOUSE ', ' She went home. ', {
        ...explanation,
        traducao: 'lar'
    });

    const rows = await database.all('SELECT * FROM dictionary');
    const matchingRows = rows.filter(row => (
        row.ds_normalized_term === 'house' &&
        row.ds_normalized_context === 'she went home.'
    ));

    expect(matchingRows).toHaveLength(1);
    expect(matchingRows[0].ds_translation).toBe('lar');
});

test('mantém explicações separadas para contextos diferentes', async () => {
    await dictionaryService.saveExplanation('House', 'The house was empty.', {
        ...explanation,
        sentido_no_contexto: 'O prédio estava vazio.'
    });

    const result = await dictionaryService.findExplanation('house', 'The house was empty.');

    expect(result.sentido_no_contexto).toBe('O prédio estava vazio.');
});

test('mantém explicações separadas para idiomas diferentes', async () => {
    await dictionaryService.saveExplanation('Gift', 'She received a gift.', explanation, 'en-US');
    await dictionaryService.saveExplanation('Gift', 'She received a gift.', {
        ...explanation,
        traducao: 'Geschenk'
    }, 'de-DE');

    const result = await dictionaryService.findExplanation('gift', 'She received a gift.', 'de-DE');

    expect(result.traducao).toBe('Geschenk');
});