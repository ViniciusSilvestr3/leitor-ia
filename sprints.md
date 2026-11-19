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

## 2026-10-01

### Rollback arquitetural do frontend

- Removida integralmente a aplicação React/Vite em `frontend/`.
- Restaurada a arquitetura Vanilla JS servida pelo Express em `public/`.
- Limpo o `package.json` da raiz, mantendo somente `npm start` com `node server.js`.
- Adicionada `GEMINI_VERSION=gemini-1.5-flash` em `.env` e `.env.example`.
- Nenhuma alteração realizada em `server.js`, controllers, routes ou services.

## 2026-10-01

### Registro do rollback e diagnóstico da IA

- Confirmado o rollback definitivo do frontend React/Vite para Vanilla JS servido diretamente pelo Express.
- Removida a pasta `frontend/` e mantido o frontend legado em `public/`.
- O `package.json` da raiz foi simplificado para iniciar o servidor com `npm start` / `node server.js`.
- Adicionada a variável `GEMINI_VERSION` aos arquivos de ambiente.
- Identificado que o erro inicial de autenticação era causado por JWT antigo ou incompatível com o `JWT_SECRET` atual; o token deve ser renovado após novo login.
- Identificado e corrigido o uso de modelos Gemini inexistentes ou indisponíveis: o service passou a ler `GEMINI_VERSION` e a configuração foi alinhada para `gemini-3.8-flash`.
- Confirmado que `gemini-3.8-flash` é reconhecido pela API, mas a tentativa de explicação terminou com `503 UNAVAILABLE` por alta demanda do modelo.
- A API consumiu a tentativa, mas não retornou o objeto JSON de explicação ao usuário.
- Mantidos o prompt, o retorno JSON, a autenticação e o parâmetro `idioma_destino`.

## 2026-10-01

### Correção da versão do modelo Gemini

- Corrigido o erro `404 NOT_FOUND` causado pelo modelo inexistente fixado no `geminiService.js`.
- O serviço passou a ler `GEMINI_VERSION` do ambiente, com fallback para `gemini-2.5-flash`.
- `.env` e `.env.example` foram alinhados para `GEMINI_VERSION=gemini-2.5-flash`.
- Mantidos o prompt, o retorno JSON e o parâmetro multi-idioma `idioma_destino`.

## 2026-10-01

### Atualização de compatibilidade do Gemini

- A API informou que `gemini-2.5-flash` não está disponível para novos usuários.
- Atualizados `.env`, `.env.example` e o fallback do `geminiService.js` para `gemini-3.8-flash`, conforme recomendação retornada pela API.
- Mantidos o prompt, o retorno JSON e a lógica de `idioma_destino`.

## 2026-11-06

### Sprint 7: Minigame de revisão e seleção estável de texto

#### Objetivo

- Disponibilizar um minigame funcional, inspirado em Kahoot, usando os flashcards do usuário.
- Impedir que a seleção de uma palavra ou frase no EPUB provoque uma troca imediata de página.

#### Escopo do minigame

- Corrigir a geração do quiz no `geminiService.js`, utilizando os flashcards recebidos como fonte das perguntas.
- Padronizar o retorno da IA como uma lista JSON de perguntas com enunciado, quatro alternativas, índice da resposta correta e explicação.
- Exibir perguntas e alternativas na tela existente de minigame.
- Exibir progresso, pontuação, feedback de acerto/erro e resultado final.
- Manter o requisito mínimo de dois flashcards para iniciar uma partida.
- Restringir cada partida aos flashcards do usuário autenticado.
- Repetir temporariamente a chamada ao Gemini em caso de indisponibilidade `503`.
- Usar um quiz local baseado nos flashcards quando o Gemini permanecer indisponível.

#### Escopo da seleção no EPUB

- Bloquear a navegação lateral quando o evento de clique fizer parte de uma seleção de texto.
- Manter a captura do termo, contexto e CFI para a análise e o flashcard.
- Preservar a navegação por clique nas laterais quando não houver seleção em andamento.

#### Critérios de aceite

- Com pelo menos dois flashcards, o botão `Iniciar Revisão` gera e exibe perguntas sem erro de JavaScript.
- Cada pergunta apresenta quatro alternativas e permite apenas uma resposta.
- A resposta mostra feedback, atualiza a pontuação e permite avançar.
- Ao terminar, o usuário vê a pontuação final e pode retornar ao vocabulário.
- Com menos de dois flashcards, o sistema informa o requisito sem abrir uma partida vazia.
- Uma indisponibilidade temporária do Gemini não impede a partida, pois o sistema possui fallback local.
- Ao selecionar uma frase no EPUB, a página permanece no mesmo local enquanto a análise é aberta.
- A navegação lateral do EPUB continua funcionando para cliques sem seleção.
- Nenhuma chave de API ou arquivo físico do livro é exposto ao frontend ou enviado ao backend.

## 2026-11-13

### Integração do Design System

- Aplicados tokens semânticos de cor, tipografia, espaçamento, foco e tema claro/escuro ao frontend Vanilla JS.
- Refinada a hierarquia visual do leitor, da importação de arquivos, do vocabulário e do minigame sem alterar os contratos do backend.
- Melhorada a semântica e a acessibilidade da análise contextual, incluindo diálogo rotulado, fechamento por `Esc`, anúncio de estados e idioma explícito.
- Mantida a seleção estável no EPUB, a navegação existente e o fluxo de revisão com flashcards.

### Ajustes de navegação e progresso

- Adicionada navegação do leitor pelas setas `ArrowLeft` e `ArrowRight`, incluindo o documento EPUB renderizado em iframe.
- Criado indicador persistente no canto inferior do painel com página atual, total e percentual quando disponível.
- Adicionado cálculo de progresso para PDF e geração de localizações do EPUB para estimar o percentual lido.
- Corrigida a navegação lateral do leitor com controles fixos de página anterior/próxima, removendo a dependência da coordenada do clique dentro do iframe.
- Ajustado o indicador EPUB para usar localizações do livro inteiro e identificar páginas estimadas, em vez do total do capítulo atual.

### Seleção opcional e grifo

- Removida a consulta automática ao selecionar texto no EPUB ou PDF.
- Adicionadas ações explícitas para explicar, grifar ou dispensar a seleção.
- Mantida a seleção sem requisição à IA quando o usuário apenas seleciona uma palavra ou frase.

## 2026-11-13

### Integração do Manual de Identidade Visual 1.1

- Centralizada a camada institucional com marfim, azul profundo, sálvia, dourado e carvão, incluindo uma variação própria para o tema escuro.
- Aplicadas as fontes Inter à interface e Source Serif 4 ao texto editorial e à marca.
- Adicionada assinatura vetorial discreta de livro aberto e estrela no acesso e no cabeçalho do leitor.
- Refinados botões, foco, superfícies, seleção, modal contextual e vocabulário para preservar a leitura como protagonista.
- Incluído aviso explícito de que o trecho e o contexto necessário são enviados ao serviço de IA durante a explicação.
- Mantida a distinção visual entre a página PDF original e a superfície refluível do EPUB.

### Correção de regressão visual

- Restauradas as regras estruturais de layout que haviam ficado no CSS inline: reset da página, navegação, upload, leitor PDF, controles, autenticação e grid do vocabulário.
- Mantida a identidade visual do manual com os tokens institucionais no stylesheet centralizado.

### Pop-up contextual e controles de leitura

- Mantida a explicação como pop-up sobreposto e centralizado na viewport, inclusive em telas pequenas, sem abrir uma folha abaixo do leitor.
- Refinados os botões laterais de navegação com dimensões, ícones, estados e contraste alinhados à identidade.
- Refinada a barra de ações da seleção com hierarquia visual entre “Explicar”, “Grifar” e “Esc”.
- Transformadas as entradas “Leitor” e “Vocabulário” em abas editoriais suaves, com tipografia de leitura e indicador discreto em dourado.
