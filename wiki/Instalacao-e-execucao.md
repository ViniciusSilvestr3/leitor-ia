# Instalação e execução

## Pré-requisitos

- Git.
- Node.js 20 ou superior.
- npm.
- Chave de API do Google AI Studio.
- Acesso à internet para os CDNs de epub.js, JSZip e PDF.js.

## Clonar o projeto

```bash
git clone https://github.com/ViniciusSilvestr3/leitor-ia.git
cd leitor-ia
```

## Instalar dependências

```bash
npm install
```

## Configurar variáveis de ambiente

Crie o arquivo local:

```bash
cp .env.example .env
```

Edite `.env`:

```env
GEMINI_API_KEY=sua_chave_do_google_ai_studio
JWT_SECRET=seu_segredo_jwt
GEMINI_VERSION=gemini-3.8-flash
```

Para obter a chave, acesse o [Google AI Studio](https://aistudio.google.com/), faça login, abra **Get API key**, crie ou selecione um projeto e copie a chave para `GEMINI_API_KEY`.

Para gerar um segredo JWT forte:

```bash
openssl rand -base64 32
```

Não publique o arquivo `.env` nem substitua os valores de exemplo por credenciais reais no repositório.

## Iniciar o servidor

```bash
npm start
```

Esse comando executa `node server.js`. O servidor inicializa o SQLite, registra as rotas e disponibiliza a aplicação em:

```text
http://localhost:3000
```

## Usar a aplicação

1. Acesse `http://localhost:3000`.
2. Crie uma conta.
3. Faça login.
4. Selecione um arquivo EPUB ou PDF.
5. Selecione uma palavra ou trecho.
6. Escolha o idioma e solicite a análise.
7. Consulte a explicação e o vocabulário salvo.

## Encerrar

No terminal do servidor, pressione `Ctrl+C`. Para reiniciar, execute novamente:

```bash
npm start
```

## Build

O projeto não possui etapa de build. O frontend é JavaScript servido diretamente pelo Express e o backend é executado pelo Node.js.

