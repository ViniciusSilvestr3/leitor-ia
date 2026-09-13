const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const jwt = require('jsonwebtoken');
const request = require('supertest');

const databasePath = path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), 'leitor-ia-api-test-')),
    'database.sqlite'
);

process.env.DATABASE_PATH = databasePath;
process.env.JWT_SECRET = 'chave-de-teste';

const mockGenerateContent = jest.fn();

jest.mock('@google/genai', () => ({
    GoogleGenAI: jest.fn(() => ({
        models: {
            generateContent: (...args) => mockGenerateContent(...args)
        }
    }))
}));

const app = require('../src/app');
const database = require('../src/config/database');

beforeAll(async () => {
    await database.initializeDatabase();
});

beforeEach(async () => {
    mockGenerateContent.mockReset();
    mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({
            traducao: 'casa',
            sentido_no_contexto: 'Uma residência.',
            papel_na_passagem: 'Substantivo.',
            parafrase: 'Ela voltou para casa.'
        })
    });
    await database.run('DELETE FROM dictionary');
    await database.run('DELETE FROM users');
});

afterAll(() => {
    fs.rmSync(path.dirname(databasePath), { recursive: true, force: true });
});

async function login() {
    await request(app)
        .post('/api/auth/cadastro')
        .send({ nome: 'Teste', email: 'teste@example.com', senha: 'senha123' })
        .expect(201);

    const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'teste@example.com', senha: 'senha123' })
        .expect(200);

    return response.body.token;
}

test('usa a IA simulada na primeira consulta e o banco na segunda', async () => {
    const token = await login();
    const payload = { termo: 'house', contexto: 'She went home.', idioma: 'en-US' };

    const firstResponse = await request(app)
        .post('/api/explicar')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(200);

    expect(firstResponse.body.analise.origem).toBe('ia');
    expect(firstResponse.body.analise.traducao).toBe('casa');
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(mockGenerateContent.mock.calls[0][0].config).not.toHaveProperty('thinkingConfig');

    const secondResponse = await request(app)
        .post('/api/explicar')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(200);

    expect(secondResponse.body.analise.origem).toBe('ia');
    expect(secondResponse.body.analise.traducao).toBe('casa');
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);

    const saved = await database.get(
        'SELECT ds_translation FROM dictionary WHERE ds_normalized_term = ? AND ds_normalized_context = ?',
        ['house', 'she went home.']
    );
    expect(saved.ds_translation).toBe('casa');
});

test('usa uma explicação do banco sem chamar a IA', async () => {
    const token = await login();
    await database.run(
        `INSERT INTO dictionary
        (ds_term, ds_normalized_term, ds_normalized_context, tp_language, ds_translation,
         ds_contextual_meaning, ds_passage_role, ds_paraphrase)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            'book',
            'book',
            'read the book.',
            'en-US',
            'livro',
            'Uma obra escrita.',
            'Substantivo.',
            'Leia o livro.'
        ]
    );

    const response = await request(app)
        .post('/api/explicar')
        .set('Authorization', `Bearer ${token}`)
        .send({ termo: 'BOOK', contexto: 'Read the book.', idioma: 'en-US' })
        .expect(200);

    expect(response.body.analise.origem).toBe('banco');
    expect(response.body.analise.traducao).toBe('livro');
    expect(mockGenerateContent).not.toHaveBeenCalled();
});

test('separa a mesma palavra quando o idioma muda', async () => {
    const token = await login();
    const payload = { termo: 'gift', contexto: 'She received a gift.', idioma: 'en-US' };

    await request(app)
        .post('/api/explicar')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(200);

    const otherLanguageResponse = await request(app)
        .post('/api/explicar')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...payload, idioma: 'de-DE' })
        .expect(200);

    expect(otherLanguageResponse.body.analise.origem).toBe('ia');
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
});

test('recusa a rota de explicação sem autenticação', async () => {
    await request(app)
        .post('/api/explicar')
        .send({ termo: 'house', contexto: 'She went home.' })
        .expect(401);
});

test('o token usado no teste é válido para o middleware', async () => {
    const token = await login();
    expect(jwt.verify(token, process.env.JWT_SECRET).email).toBe('teste@example.com');
});