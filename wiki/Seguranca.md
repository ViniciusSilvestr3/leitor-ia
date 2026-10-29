# Segurança e privacidade

## Autenticação

As rotas protegidas exigem um token JWT no cabeçalho `Authorization`. O middleware verifica o token antes de permitir o acesso aos dados do usuário.

## Senhas

As senhas não são armazenadas em texto puro. O backend utiliza bcrypt para gerar e comparar hashes.

## Variáveis de ambiente

As configurações sensíveis ficam no arquivo `.env`, que não deve ser versionado:

- `GEMINI_API_KEY`: chave de acesso ao Google Gemini.
- `JWT_SECRET`: segredo usado para assinar os tokens.
- `GEMINI_VERSION`: modelo Gemini utilizado pelo service.

## Proteção da chave da IA

A `GEMINI_API_KEY` é acessada por `process.env` no backend e não deve ser colocada em arquivos públicos nem enviada ao navegador.

## Arquivos de leitura

O EPUB ou PDF não é enviado fisicamente ao backend. O processamento ocorre no client-side e apenas o termo, o contexto e os metadados necessários são enviados para a API.

## Boas práticas

- Nunca publicar o conteúdo real do `.env`.
- Nunca inserir tokens ou chaves na Wiki.
- Usar um `JWT_SECRET` forte e aleatório.
- Usar HTTPS e variáveis de ambiente protegidas em produção.
- Restringir permissões de leitura e escrita do arquivo SQLite conforme a infraestrutura.

