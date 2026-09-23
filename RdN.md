
# Regras de Negócio e Diretivas de Desenvolvimento (Contexto para IA)

## Regras
REGRA NUMERO 1: Não deve ter teste do Agente apenas do humano.
REGRA NUMERO 2: Deve sempre ler o RdN.md e o sprints.md antes de qualquer prompt para garantir entendimento do escopo.
REGRA NUMERO 3: Sempre mantenha informado o desenvolvedor antes de qualquer alteração drastica no codigo.
REGRA NUMERO 4: Fases com o (Completa) Devem ser entendidas como terminada e podem ser ignoradas caso sejam irrelevantes para o escopo da fase atual

## Leitura obrigatória antes de cada trabalho
- Antes de iniciar qualquer trabalho no workspace, o agente deve ler este arquivo (`RdN.md`) e o arquivo `sprints.md`.
- `RdN.md` é a fonte das regras de negócio e das restrições permanentes do projeto.
- `sprints.md` é o registro do que já foi realizado e deve ser consultado para evitar repetir, desfazer ou contradizer mudanças anteriores.
- O agente não deve executar testes, validações automatizadas ou iniciar processos para testar o projeto, salvo solicitação explícita do usuário.

## FASE 1 (Completa)
## 1.1: Escopo Atual (Fase de Refatoração)
- O sistema possui um protótipo funcional de leitura de EPUB.
- **Ação Permitida:** Refatorar e mover a lógica existente do `server.js` para a nova arquitetura em camadas (`routes`, `controllers`, `services`).
- **Ação Proibida:** NÃO adicione suporte a PDF ainda. NÃO invente ou instale novos pacotes npm, e NÃO crie novas funcionalidades sem solicitação explícita do usuário.

## 1.2: Arquitetura do Backend (Node.js + Express)
- **Rotas (`src/routes`):** Apenas definem os verbos HTTP (GET, POST) e conectam aos controllers. Nenhuma lógica de negócio é permitida aqui.
- **Controllers (`src/controllers`):** Responsáveis exclusivos pelo objeto `req` e `res`. Validam se o payload JSON possui os dados necessários (ex: `palavra` e `contexto`) e retornam os status HTTP (200, 400, 500).
- **Services (`src/services`):** Executam a lógica de negócio e as integrações externas.

## 1.3: Regras da IA e Segurança (Google AI Studio)
- A chave de API (`GEMINI_API_KEY`) deve ser acessada via `process.env` e NUNCA exposta em código estático ou enviada ao frontend.
- A requisição para o Gemini deve ocorrer exclusivamente dentro de um arquivo service (ex: `geminiService.js`).
- O prompt enviado para a IA deve permanecer idêntico ao do código original em funcionamento.

## 1.4: Manipulação de Arquivos de Leitura
- O arquivo do livro (EPUB) deve ser processado **inteiramente no frontend**. 
- O backend NUNCA deve receber o upload físico do livro nas rotas atuais. Ele deve aguardar apenas um JSON contendo o trecho de texto capturado pelo navegador.

## 1.5: Padrões de Código
- Preserve o padrão de importação/exportação atual (CommonJS com `require` ou ESModules com `import`).
- Todo novo código ou extração deve conter blocos `try/catch` para evitar que o servidor Express caia em caso de falha da IA.

## Fase 2: Suporte a PDF via PDF.js Frontend (Completa)

- **Objetivo:** Adicionar visualização e seleção de texto em arquivos PDF diretamente no navegador.
- **Regra de Arquitetura:** O arquivo físico do PDF NUNCA deve ser enviado ao backend. Todo o processamento ocorre no client-side.
- **Tecnologias:** Utilizar estritamente a biblioteca `pdf.js` (Mozilla) carregada via CDN no HTML. É expressamente proibido sugerir bibliotecas de OCR ou instalar pacotes de PDF no Node.js.
- **Renderização:** O script deve carregar o PDF em um elemento `<canvas>` (Camada Visual) e obrigatoriamente instanciar a `TextLayer` (Camada de Texto invisível) sobreposta a ele.
- **Integração:** A seleção de palavras pelo usuário na `TextLayer` deve capturar o texto e acionar a mesma função JavaScript já existente da Fase 1, enviando o payload JSON (palavra + contexto) para as rotas atuais do Express. Não modifique os controllers ou services do backend.

## Fase 3: Engenharia de Prompt e Padronização JSON
- **Objetivo:** Garantir que todas as respostas do Gemini sejam objetos JSON para facilitar a persistência no banco SQLite e a renderização no frontend.
- **Regra de Integração (Backend):** Utilizar a configuração `config: { responseMimeType: "application/json" }` no SDK `@google/genai` para forçar o retorno estruturado, eliminando limpezas manuais de string com regex.
- **Regra de Interface (Frontend):** O frontend deve ser atualizado para ler e exibir os atributos isolados do JSON (`termo_base`, `traducao`, `explicacao`) em vez de renderizar um texto bruto.