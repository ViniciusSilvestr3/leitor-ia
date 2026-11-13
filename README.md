# Leitor Inteligente

Aplicação web para leitura de livros digitais e estudo de vocabulário com apoio de inteligência artificial. O projeto permite abrir arquivos EPUB e PDF no navegador, selecionar termos ou trechos e obter traduções e explicações contextuais sem enviar o arquivo físico do livro ao servidor. O público-alvo são leitores e estudantes que desejam compreender e revisar vocabulário durante a leitura.

## Funcionalidades

- Cadastro e autenticação de usuários com JWT.
- Leitura local de arquivos EPUB e PDF no navegador.
- Seleção de palavras ou trechos diretamente no conteúdo do livro.
- Explicação contextual, tradução e análise literária geradas pelo Gemini.
- Escolha do idioma de saída entre português, inglês e espanhol.
- Persistência de flashcards por usuário em banco SQLite.
- Consulta e exclusão de flashcards salvos.
- Tema claro e escuro na interface.

## Tecnologias utilizadas

- **Linguagens:** JavaScript, HTML e CSS.
- **Runtime e servidor:** Node.js e Express 5.
- **Banco de dados:** SQLite3.
- **Inteligência artificial:** Google GenAI (`@google/genai`) com modelo configurável por `GEMINI_VERSION`.
- **Autenticação e segurança:** JWT (`jsonwebtoken`) e bcrypt.
- **Leitura de documentos:** epub.js, JSZip e PDF.js carregados por CDN no navegador.
- **Gerenciamento de dependências:** npm.

## Pré-requisitos

Antes de instalar o projeto, verifique se as seguintes ferramentas estão instaladas:

- [Git](https://git-scm.com/).
- [Node.js](https://nodejs.org/), versão 20 ou superior.
- npm, normalmente instalado junto com o Node.js.
- Uma chave de API do [Google AI Studio](https://aistudio.google.com/).
- Acesso à internet para carregar as bibliotecas de leitura disponibilizadas por CDN.

## Instalação e configuração

### 1. Obter o código-fonte

Clone o repositório e acesse o diretório do projeto:

```bash
git clone https://github.com/ViniciusSilvestr3/leitor-ia.git
cd leitor-ia
```

### 2. Instalar as dependências

```bash
npm install
```

### 3. Configurar o ambiente

Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e informe os valores necessários:

```env
GEMINI_API_KEY=sua_chave_do_google_ai_studio
JWT_SECRET=um_segredo_gerado_para_os_tokens
GEMINI_VERSION=gemini-3.8-flash
```

#### Como obter a chave do Gemini

1. Acesse o [Google AI Studio](https://aistudio.google.com/).
2. Faça login com uma conta Google.
3. Abra a opção **Get API key** ou **Obter chave de API**.
4. Crie uma chave em um projeto existente ou crie um novo projeto.
5. Copie a chave gerada e cole no valor de `GEMINI_API_KEY` no arquivo `.env`.

Essa chave deve permanecer somente no backend. Não a coloque em `public/`, no JavaScript do navegador ou em commits do Git.

#### Como criar o segredo JWT

O `JWT_SECRET` é usado para assinar os tokens de autenticação dos usuários. Gere um valor aleatório forte no terminal com um dos comandos abaixo:

```bash
openssl rand -base64 32
```

Se o OpenSSL não estiver disponível, use uma frase longa e aleatória com pelo menos 32 caracteres. Cole o resultado no valor de `JWT_SECRET`.

#### Escolha do modelo Gemini

`GEMINI_VERSION` define o modelo usado nas solicitações de explicação e no minigame. Mantenha o valor indicado no arquivo `.env.example` ou substitua por um modelo disponível na sua conta do Google AI Studio.

Não publique chaves reais no repositório. O arquivo `banco.sqlite` é criado ou atualizado quando o servidor é iniciado.

## Execução em ambiente de desenvolvimento

Depois de configurar o arquivo `.env`, instale as dependências e inicie o servidor JavaScript:

```bash
npm install
npm start
```

O comando `npm start` executa `node server.js`. O servidor:

1. Carrega as variáveis do arquivo `.env`.
2. Inicializa ou atualiza o banco SQLite local.
3. Registra as rotas de autenticação, explicação, flashcards e minigame.
4. Publica os arquivos da pasta `public/`.
5. Fica disponível na porta `3000`.

Após a inicialização, acesse [http://localhost:3000](http://localhost:3000) no navegador.

Para usar a aplicação:

1. Crie uma conta na tela de cadastro.
2. Faça login para receber o token de autenticação.
3. Selecione um arquivo EPUB ou PDF pelo botão de abertura de arquivo.
4. Selecione uma palavra ou trecho no leitor.
5. Escolha o idioma da explicação e solicite a análise.
6. Consulte os flashcards e o minigame nas respectivas abas.

O EPUB ou PDF é processado localmente no navegador. O backend recebe somente os dados textuais necessários para a explicação, e não o arquivo físico do livro.

### Encerrar e reiniciar o servidor

No terminal em que o servidor está executando, pressione `Ctrl+C`. Para iniciar novamente:

```bash
npm start
```

Não é necessário gerar uma etapa de build: o projeto é executado diretamente com JavaScript e Node.js.

## Build e execução em produção

O projeto não possui uma etapa de compilação ou geração de arquivos de saída. Para executá-lo em produção:

1. Instale o Node.js 20 ou superior no servidor.
2. Clone o repositório e entre na pasta do projeto.
3. Execute `npm install`.
4. Crie o arquivo `.env` com `GEMINI_API_KEY`, `JWT_SECRET` e `GEMINI_VERSION`.
5. Inicie a aplicação com `npm start`.
6. Libere ou encaminhe a porta `3000` conforme a configuração do servidor.

Em um ambiente de produção, mantenha o processo Node.js em execução com o gerenciador de processos adotado pela infraestrutura. O arquivo `banco.sqlite` deve estar em um local com permissão de leitura e escrita.

## Aplicação publicada

Não há uma versão publicada informada neste repositório. A aplicação está disponível para execução em ambiente local.

## Estrutura do projeto

```text
leitor-ia/
├── public/
│   ├── index.html       # Interface, estilos embutidos e bibliotecas de leitura via CDN
│   ├── script.js       # Leitura local de EPUB/PDF e chamadas à API
│   ├── style.css       # Folha de estilos complementar
│   ├── O Alienista.epub # Arquivo EPUB disponível localmente
│   └── pe000008.pdf    # Arquivo PDF disponível localmente
├── src/
│   ├── controllers/    # Validação das requisições e respostas HTTP
│   ├── middleware/     # Autenticação dos tokens JWT
│   ├── routes/         # Definição das rotas da API
│   └── services/       # Banco, autenticação, flashcards e integração com Gemini
├── banco.sqlite        # Banco de dados SQLite local
├── server.js           # Inicialização do servidor Express
├── .env.example        # Modelo das variáveis de ambiente
├── package.json        # Dependências e scripts npm
├── RdN.md              # Regras de negócio e diretivas de desenvolvimento
├── sprints.md          # Registro das fases e mudanças do projeto
└── README.md           # Documentação do projeto
```

## Equipe

| Integrante | Responsabilidade |
|---|---|
| Vinicius S | Desenvolvimento front-end |
| Leonardo M | Desenvolvimento back-end |

## Documentação adicional

Consulte [RdN.md](./RdN.md) para as regras de negócio e restrições permanentes do projeto e [sprints.md](./sprints.md) para o histórico de fases e mudanças realizadas.
