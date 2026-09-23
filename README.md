# Leitor Inteligente

Protótipo de um leitor de livros EPUB com apoio de inteligência artificial para explicar termos no contexto da obra, salvar vocabulário por usuário e gerar revisões em formato de quiz.

## Estado do projeto

O fluxo atualmente implementado é:

1. O usuário cria uma conta ou faz login.
2. O frontend guarda o JWT no `localStorage`.
3. O usuário seleciona um arquivo `.epub`.
4. O arquivo EPUB é aberto localmente no navegador pelo epub.js.
5. O frontend mantém o conteúdo do livro no navegador.
6. Ao selecionar um trecho, o frontend envia o termo e o parágrafo para a API do Gemini.
7. A explicação aparece em um modal e pode ser salva como flashcard.
8. Os flashcards podem ser consultados, excluídos e usados para gerar um minigame.

## Tecnologias

- Node.js com CommonJS
- Express 5
- SQLite3
- Google GenAI (`gemini-3.5-flash`)
- bcrypt para hash de senhas
- JWT para autenticação
- epub.js e JSZip carregados por CDN no navegador
- HTML, CSS embutido em `public/index.html` e JavaScript no frontend

## Estrutura atual

```text
.
├── server.js              # servidor Express, autenticação, banco e endpoints
├── src/
│   ├── controllers/       # validação de req/res e respostas HTTP
│   ├── middleware/        # autenticação JWT
│   ├── routes/            # definição dos endpoints
│   └── services/          # banco, autenticação, flashcards e Gemini
├── banco.sqlite           # banco SQLite local
├── package.json            # dependências e scripts npm
├── RdN.md                 # regras de negócio e diretivas da fase atual
├── public/
│   ├── index.html         # telas de autenticação, leitor, vocabulário e jogo
│   ├── script.js          # lógica do frontend e chamadas à API
│   ├── style.css          # atualmente vazio; os estilos estão no index.html
│   └── *.epub             # livros e arquivos de teste disponíveis localmente
└── uploads/               # EPUBs recebidos pelo endpoint de upload
```

## Como executar

Pré-requisitos: Node.js 20 ou superior e npm.

1. Instale as dependências:

	```bash
	npm install
	```

2. Crie o arquivo `.env` a partir do exemplo:

	```bash
	cp .env.example .env
	```

3. Preencha as variáveis de ambiente:

	```env
	GEMINI_API_KEY=sua_chave_do_google_ai_studio
	JWT_SECRET=um_segredo_gerado_para_os_tokens
	```

4. Inicie o servidor:

	```bash
	node server.js
	```

5. Acesse `http://localhost:3000` no navegador.

O banco `banco.sqlite` e as tabelas são criados/atualizados quando o servidor inicia.

## Autenticação

### Cadastro

`POST /api/auth/cadastro`

Payload:

```json
{
  "nome": "Nome do usuário",
  "email": "usuario@exemplo.com",
  "senha": "senha"
}
```

O servidor valida os campos, verifica o formato do e-mail, gera um hash bcrypt e grava o usuário. O e-mail precisa ser único.

### Login

`POST /api/auth/login`

Payload:

```json
{
  "email": "usuario@exemplo.com",
  "senha": "senha"
}
```

Em caso de sucesso, a resposta contém um JWT com validade de sete dias. As rotas protegidas esperam o cabeçalho:

```text
Authorization: Bearer SEU_TOKEN
```

## Endpoints do negócio

| Método | Endpoint | Objetivo |
| --- | --- | --- |
| `POST` | `/api/explicar` | Envia `termo` e `contexto` ao Gemini e retorna uma explicação sem spoilers. |
| `POST` | `/api/flashcards/salvar` | Salva termo, contexto, explicação, título do livro e CFI do usuário autenticado. |
| `GET` | `/api/flashcards` | Lista os flashcards do usuário autenticado, do mais recente para o mais antigo. |
| `DELETE` | `/api/flashcards/:id` | Exclui um flashcard somente quando ele pertence ao usuário autenticado. |
| `GET` | `/api/minigame/gerar` | Seleciona até cinco flashcards do usuário e pede ao Gemini três perguntas em JSON. |

Todas as rotas de negócio exigem autenticação, exceto cadastro e login. A resposta de erro usa o campo `erro` em JSON.

## Banco de dados

O SQLite possui duas tabelas:

- `usuarios`: `id`, `nome`, `email`, `senha_hash` e `criado_em`.
- `flashcards`: `id`, `usuario_id`, `livro_titulo`, `termo_original`, `frase_contexto`, `explicacao_ia`, `cfi` e `data_criacao`.

O `usuario_id` relaciona cada flashcard ao usuário que o criou. O CFI é usado pelo frontend para tentar retornar à posição do termo no livro aberto.

## Regras de negócio relevantes

As regras completas estão em [RdN.md](RdN.md). Os pontos principais são:

- Não adicionar suporte a PDF nesta fase.
- Manter o prompt original da IA quando a lógica for extraída.
- Ler `GEMINI_API_KEY` somente por `process.env` e nunca enviá-la ao frontend.
- A chamada ao Gemini está concentrada em `src/services/geminiService.js`.
- O processamento do livro ocorre no frontend; o backend recebe somente JSON com termo e contexto.
- Usar CommonJS, seguindo o padrão atual.
- Proteger novas integrações com a IA usando `try/catch`.

## Pendências e divergências conhecidas

Estas observações descrevem o código atual e não representam novas funcionalidades:

- `style.css` está vazio; os estilos da interface estão em um bloco `<style>` dentro de `public/index.html`.
- A função global `deletarFlashcard` está declarada duas vezes; a segunda definição substitui a primeira.
- O projeto não possui testes automatizados configurados. O script `npm test` ainda retorna a mensagem padrão de teste não configurado.
- Não existe script `start` no `package.json`; o servidor é iniciado diretamente com `node server.js`.

## Segurança e operação

- O arquivo `.env` não deve ser versionado; ele está listado no `.gitignore`.
- Nunca coloque `GEMINI_API_KEY` no HTML ou no JavaScript público.
- `banco.sqlite` e os arquivos em `uploads/` são dados locais do protótipo.
- Arquivos EPUB existentes em `uploads/` são dados legados do protótipo; a aplicação não cria novos uploads físicos no backend.
