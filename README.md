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

Copie `.env.example` para `.env` na raiz do projeto, no mesmo nível de `server.js`:

```env
GEMINI_API_KEY=sua_chave_do_gemini
JWT_SECRET=uma_chave_secreta_longa_e_aleatoria
```

`GEMINI_API_KEY` é usado pelo pacote do Google para autenticar as chamadas de IA. `JWT_SECRET` é usado para assinar os tokens de login e deve ser mantido privado.

Essas são as únicas variáveis obrigatórias. A aplicação usa os seguintes valores padrão para as demais configurações:

- Porta: `3000`.
- Banco: `banco.sqlite`.
- Uploads: `uploads/`.
- Modelo Gemini: `gemini-3.6-flash`.

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

Na primeira inicialização, o backend cria automaticamente o arquivo `banco.sqlite`:

```text
banco.sqlite
```

Também são criadas automaticamente as tabelas:

- `users`: contas, e-mails e hashes das senhas.
- `flashcards`: palavras salvas, contexto, explicação, livro e posição no EPUB.
- `dictionary`: explicações armazenadas para evitar chamadas repetidas à IA.

Os campos do banco seguem uma convenção de prefixos:

- `cd_`: códigos e identificadores.
- `nm_`: nomes e títulos.
- `ds_`: textos, descrições e valores de conteúdo.
- `dt_`: datas e horários.
- `tp_`: tipos ou categorias.

Depois disso, o fluxo normal é:

1. Criar uma conta na tela inicial.
2. Entrar com e-mail e senha.
3. Fazer upload de um arquivo `.epub` ou `.pdf`.
4. Selecionar um termo no livro para consultar a IA.
5. Salvar a explicação como flashcard.
6. Abrir a aba de vocabulário ou iniciar o minigame.

O arquivo SQLite é persistente: parar e iniciar o servidor não apaga os usuários nem os flashcards. Os EPUBs e PDFs enviados ficam em `uploads/` e só podem ser baixados por requisições autenticadas.

### EPUB e PDF

O sistema mantém os arquivos originais e escolhe o leitor automaticamente:

- EPUB usa `epub.js` com scripts internos desativados por segurança.
- PDF usa `PDF.js` e permite selecionar texto sobre as páginas.

PDFs que são apenas imagens, como documentos escaneados, usam OCR no navegador para tentar criar uma camada de texto selecionável.

### Consultar o banco manualmente (opcional)

Se o comando `sqlite3` estiver instalado, é possível abrir o banco com:

```bash
sqlite3 banco.sqlite
```

Dentro do console SQLite:

```sql
.tables
SELECT cd_id_user, nm_user, ds_email FROM users;
SELECT cd_id_flashcard, cd_id_user, ds_original_term, nm_book_title FROM flashcards;
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

### `GEMINI_API_KEY` ou `JWT_SECRET` não configurada

Confira se o arquivo `.env` existe na raiz e se contém uma chave válida. Reinicie o servidor depois de alterar o arquivo.

### Banco não inicia

Confira se a pasta do projeto permite criar o arquivo `banco.sqlite` e se o arquivo não está sendo usado por outro processo.

### Upload rejeitado

O backend aceita somente arquivos com extensão `.epub` ou `.pdf`. O limite atual é de 50 MB por arquivo.

## Uso de tokens na tradução

Cada consulta ao Gemini consome tokens de entrada e de saída. Para reduzir o custo, o backend atualmente:

- limita o contexto enviado a 1.400 caracteres;
- limita a resposta da IA a 240 tokens;
- reutiliza a resposta em memória quando o mesmo termo é consultado no mesmo contexto;
- mantém o prompt direto, sem enviar o livro inteiro.

As requisições possuem limites de tamanho e rate limit para reduzir brute force, abuso da API e consumo excessivo de memória. Uploads são limitados a 50 MB e aceitam somente arquivos `.epub` ou `.pdf`.

O cache fica na memória do processo e é perdido quando o servidor é reiniciado. O flashcard salvo continua no SQLite, mas uma nova consulta à IA poderá consumir tokens novamente. No futuro, podemos persistir traduções reutilizáveis no banco e evitar novas chamadas mesmo depois de reiniciar o servidor.
