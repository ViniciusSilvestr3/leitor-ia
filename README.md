# Leitor IA

Aplicação web para leitura de livros digitais nos formatos EPUB e PDF. O usuário pode selecionar um termo durante a leitura, enviar o contexto para o Gemini, receber uma explicação/tradução e salvar o resultado como flashcard. Os flashcards ficam separados por conta e também alimentam o minigame de revisão.

## Pré-requisitos

- Node.js 18 ou superior.
- npm, instalado junto com o Node.js.
- Uma chave da API do Gemini para usar as funções de IA.

Não é necessário instalar ou iniciar um servidor SQLite separado. O projeto usa SQLite como um arquivo local.

## 1. Instalar o projeto

Abra um terminal na pasta do projeto:

```bash
cd /caminho/para/leitor-ia
npm install
```

O comando instala o backend, o SQLite, a integração com o Gemini e as demais dependências.

## 2. Configurar as variáveis de ambiente

Crie um arquivo chamado `.env` na raiz do projeto, no mesmo nível de `server.js`:

```env
GEMINI_API_KEY=sua_chave_do_gemini
JWT_SECRET=uma_chave_secreta_longa_e_aleatoria
PORT=3000
DATABASE_PATH=./banco.sqlite
UPLOADS_PATH=./uploads
GEMINI_MODEL=gemini-2.5-flash
```

`GEMINI_API_KEY` é usado pelo pacote do Google para autenticar as chamadas de IA. `JWT_SECRET` é usado para assinar os tokens de login e deve ser mantido privado.

Não coloque o conteúdo real do `.env` no GitHub ou em mensagens. Cada desenvolvedor deve criar o próprio arquivo localmente.

## 3. Ligar o backend e o frontend

Na raiz do projeto, execute:

```bash
node server.js
```

Quando tudo estiver funcionando, o terminal exibirá:

```text
Conectado ao banco de dados SQLite.
Servidor escalável rodando em http://localhost:3000
```

Abra no navegador:

```text
http://localhost:3000
```

O frontend está na pasta `public/` e é servido pelo próprio Express. Por isso, não é necessário abrir `public/index.html` diretamente nem iniciar um segundo servidor.

Para desligar a aplicação, volte ao terminal onde ela está rodando e pressione `Ctrl+C`.

## 4. Como o SQLite funciona

Na primeira inicialização, o backend cria automaticamente o arquivo definido em `DATABASE_PATH`. Por padrão, ele será:

```text
banco.sqlite
```

Também são criadas automaticamente as tabelas:

- `usuarios`: contas, e-mails e hashes das senhas.
- `flashcards`: palavras salvas, contexto, explicação, livro e posição no EPUB.

Depois disso, o fluxo normal é:

1. Criar uma conta na tela inicial.
2. Entrar com e-mail e senha.
3. Fazer upload de um arquivo `.epub` ou `.pdf`.
4. Selecionar um termo no livro para consultar a IA.
5. Salvar a explicação como flashcard.
6. Abrir a aba de vocabulário ou iniciar o minigame.

O arquivo SQLite é persistente: parar e iniciar o servidor não apaga os usuários nem os flashcards. Os EPUBs e PDFs enviados ficam em `uploads/`.

### EPUB e PDF

O sistema mantém os arquivos originais e escolhe o leitor automaticamente:

- EPUB usa `epub.js`.
- PDF usa `PDF.js` e permite selecionar texto sobre as páginas.

PDFs que são apenas imagens, como documentos escaneados, podem não ter texto selecionável. Para esses arquivos será necessário adicionar OCR em uma etapa futura.

### Consultar o banco manualmente (opcional)

Se o comando `sqlite3` estiver instalado, é possível abrir o banco com:

```bash
sqlite3 banco.sqlite
```

Dentro do console SQLite:

```sql
.tables
SELECT id, nome, email FROM usuarios;
SELECT id, usuario_id, termo_original, livro_titulo FROM flashcards;
.quit
```

Isso é apenas para inspeção. A aplicação já cria e utiliza o banco automaticamente.

## Estrutura principal

```text
server.js                  # inicializa banco e servidor
src/app.js                 # configura o Express
src/routes/                # define os endpoints
src/controllers/            # recebe requisições e monta respostas
src/services/               # regras de negócio e integração com Gemini
src/middlewares/            # autenticação e upload
src/config/database.js      # conexão e criação das tabelas SQLite
src/config/env.js           # configurações do ambiente
public/                    # frontend servido pelo Express
uploads/                   # EPUBs e PDFs enviados pelos usuários
```

## Endpoints principais

| Método | Endpoint | Função |
| --- | --- | --- |
| `POST` | `/api/auth/cadastro` | Cria uma conta |
| `POST` | `/api/auth/login` | Faz login e retorna um JWT |
| `POST` | `/api/upload` | Envia um EPUB ou PDF autenticado |
| `POST` | `/api/explicar` | Consulta tradução/explicação à IA |
| `POST` | `/api/flashcards/salvar` | Salva um flashcard |
| `GET` | `/api/flashcards` | Lista os flashcards do usuário |
| `DELETE` | `/api/flashcards/:id` | Exclui um flashcard do usuário |
| `GET` | `/api/minigame/gerar` | Gera um minigame com a IA |

As rotas protegidas exigem o cabeçalho `Authorization` no formato `Bearer <token>`.

## Problemas comuns

### `GEMINI_API_KEY` não configurada

Confira se o arquivo `.env` existe na raiz e se contém uma chave válida. Reinicie o servidor depois de alterar o arquivo.

### Porta 3000 ocupada

Altere a porta no `.env`:

```env
PORT=3001
```

Depois, acesse `http://localhost:3001`.

### Banco não inicia

Confira se a pasta do projeto permite criar arquivos. Se `DATABASE_PATH` apontar para outra pasta, essa pasta também precisa existir e ter permissão de escrita.

### Upload rejeitado

O backend aceita somente arquivos com extensão `.epub` ou `.pdf`. O limite atual é de 50 MB por arquivo.

## Uso de tokens na tradução

Cada consulta ao Gemini consome tokens de entrada e de saída. Para reduzir o custo, o backend atualmente:

- limita o contexto enviado a 2.400 caracteres;
- pede uma resposta com no máximo 80 palavras;
- reutiliza a resposta em memória quando o mesmo termo é consultado no mesmo contexto;
- mantém o prompt direto, sem enviar o livro inteiro.

O cache fica na memória do processo e é perdido quando o servidor é reiniciado. O flashcard salvo continua no SQLite, mas uma nova consulta à IA poderá consumir tokens novamente. No futuro, podemos persistir traduções reutilizáveis no banco e evitar novas chamadas mesmo depois de reiniciar o servidor.
