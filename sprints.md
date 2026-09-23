# Log de Sprints

Este arquivo registra as principais mudanças realizadas no projeto por fase e por dia.

## 2026-09-22

### Fase 3: Engenharia de Prompt e Padronização JSON

- Conclusão da Fase 3: Engenharia de Prompt e Padronização JSON.
- O `geminiService.js` foi atualizado para utilizar `responseMimeType: "application/json"`, garantindo retornos estritos sem necessidade de regex.
- O prompt de explicação literária foi refinado para separar chaves de banco de dados (`termo_base`, `definicao_dicionario`) das chaves de exibição rica (`traducao_direta`, `analise_literaria`).
- O Controller e o script do Frontend foram ajustados para processar e exibir os dados desse novo objeto JSON nativo de forma isolada.

## 2026-09-23

### Fase 1: Refatoração da arquitetura

- Separação do backend monolítico de `server.js` em camadas:
  - `src/routes`: definição dos endpoints e conexão com controllers.
  - `src/controllers`: validação de requisições e respostas HTTP.
  - `src/services`: regras de negócio, banco de dados, autenticação, flashcards e integração com o Gemini.
  - `src/middleware`: autenticação dos tokens JWT.
- Criação do `databaseService.js` para centralizar operações SQLite e inicialização das tabelas.
- Criação do `authService.js` para cadastro, login, hash de senhas e geração de JWT.
- Criação do `geminiService.js` para concentrar as chamadas ao Gemini.
- Preservação dos prompts existentes da explicação contextual e do minigame.
- Configuração da chave do Gemini por `process.env.GEMINI_API_KEY`.
- Manutenção da autenticação por JWT usando `process.env.JWT_SECRET`.
- Criação dos controllers e rotas para autenticação, explicações, flashcards e minigame.
- Remoção do upload físico de EPUB no backend.
- Alteração do frontend para ler o arquivo EPUB como `ArrayBuffer` e processá-lo localmente com epub.js.
- Remoção dos listeners de elementos de navegação que não existiam no HTML.
- Atualização do `README.md` para refletir a arquitetura e o fluxo atual.

### Regras de trabalho reforçadas

- Não adicionar suporte a PDF nesta fase.
- Não instalar pacotes ou criar funcionalidades sem solicitação explícita.
- Não expor chaves de API no frontend.
- Não executar testes ou validações automatizadas pelo agente. A validação deve ser feita pelo humano, salvo solicitação explícita.

## 2026-09-23

### Fase 2: Suporte a PDF no frontend

- Inclusão do PDF.js via CDN em `public/index.html`.
- Alteração do input de arquivo para aceitar EPUB e PDF.
- Implementação do processamento local do PDF com `ArrayBuffer`.
- Renderização da página PDF em elemento `<canvas>`.
- Criação da TextLayer sobreposta ao canvas para permitir seleção nativa de texto.
- Inclusão de navegação entre páginas do PDF.
- Reutilização da chamada existente para `/api/explicar` com termo selecionado e contexto da página.
- Nenhuma alteração nos controllers ou services do backend.
- Nenhum upload físico do PDF para o backend.

## 2026-09-23

### Fase 3: Padronização JSON e persistência estruturada

- Mantido o `geminiService.js` configurado manualmente pelo desenvolvedor sem alterações.
- Atualizado o `databaseService.js` para persistir `termo_base`, `traducao`, `explicacao` e contexto em campos estruturados.
- Adicionada migração compatível para a coluna `traducao` na tabela `flashcards`.
- Atualizado o `aiController.js` para salvar o vocabulário retornado pelo Gemini antes de responder ao frontend.
- Mantido o retorno da API no contrato externo `{ explicacao: objeto }`, com o objeto JSON estruturado dentro de `explicacao`.
- Atualizado o modal para exibir o termo base, a tradução como título e a explicação no corpo em elementos separados.
- A persistência passou a ocorrer na consulta à IA; o botão de salvamento manual foi ocultado para evitar registros duplicados.
- Nenhuma alteração nos prompts ou na implementação do `geminiService.js`.
