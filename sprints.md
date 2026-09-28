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

## 2026-09-26

### Fase 4: Componentes centrais de leitura e análise em React

- Criados `ReaderScreen`, `PdfReader`, `EpubReader` e `AiAnalysisModal` em `frontend/src/components`.
- Implementado processamento local de arquivos EPUB e PDF, sem envio do arquivo físico ao backend.
- Implementada seleção de texto e captura do contexto para EPUB e PDF.
- Integrada a análise contextual com `POST /api/explicar`, mantendo o contrato JSON com `traducao` e `explicacao`.
- Integrado o `ReaderScreen` ao `AppLayout` e substituído o scaffold visual do Vite.
- Nenhuma alteração realizada nas rotas, controllers ou services do backend.

## 2026-09-28

### Fase 4: Revisão e validação do frontend React

- Revisados os componentes centrais de leitura e análise da Fase 4.
- Corrigidos efeitos React 19 que causavam erro no lint por atualizarem estado de forma síncrona.
- Garantida a remontagem limpa dos leitores ao trocar o arquivo selecionado.
- Confirmado o processamento local de EPUB e PDF e a integração do modal com `api.js`.
- Executados `npm run lint` e `npm run build` com sucesso no frontend.
- Confirmado que as rotas, controllers, services e middleware do backend permaneceram inalterados.
- Corrigido o alinhamento da `TextLayer` do PDF.js com o canvas usando as variáveis de escala exigidas pela versão atual.
- Melhorada a seleção de palavras e frases no PDF com seleção nativa e captura após a conclusão do `mouseup`.
- Build e lint executados novamente após a correção da seleção de PDF.
- Automatizada a abertura de EPUB e PDF na interface pública ao selecionar o arquivo, removendo a necessidade do botão `Abrir Arquivo`.
- Corrigida a troca entre formatos para esconder os controles de paginação do PDF ao abrir um EPUB.
- Resetado o estado do PDF ao trocar para EPUB, evitando que a paginação anterior permaneça ativa.

### Fase 5: Expansão Multi-idioma

- Adicionado o seletor de idioma da explicação com Português, Inglês e Espanhol no frontend React e na interface pública.
- A preferência de idioma passou a ser persistida localmente e enviada como `idioma_destino` no POST para `/api/explicar`.
- Atualizado o `aiController.js` para validar os três idiomas permitidos e usar Português como padrão compatível.
- Atualizado o `geminiService.js` para receber `idioma_destino` e exigir tradução e análise literária estritamente nesse idioma.
- Mantida a resposta JSON com `responseMimeType: "application/json"` e o esquema atual do banco.
- Executados lint, build e verificações de sintaxe com sucesso.
