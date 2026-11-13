# Design System — Leitor Inteligente

> **Versão:** 1.0  
> **Status:** proposta de direção visual e funcional  
> **Produto:** leitor web de PDF e EPUB com assistência contextual de IA para aprendizagem de idiomas  
> **Público prioritário:** estudantes de idiomas  
> **Princípio central:** **a leitura é protagonista; a inteligência é discreta.**

---

## 1. Visão do produto

O produto não deve se apresentar como um chatbot com um PDF anexado, mas como **um ambiente de leitura e estudo de textos**. O usuário importa um PDF ou EPUB, lê sem distrações e, ao selecionar uma palavra ou expressão, recebe uma explicação contextualizada no idioma de apoio escolhido.

A linguagem visual deve evocar **biblioteca, caderno de estudos, edição comentada e ensaio**, sem reproduzir a aparência de um livro antigo nem sacrificar usabilidade por ornamentação. A interface deve parecer contemporânea, calma, criteriosa e intelectualmente acolhedora.

### 1.1 Objetivos de experiência

1. **Ler primeiro:** o texto deve ocupar o centro perceptivo e funcional.
2. **Aprender sem interromper:** esclarecer uma palavra deve exigir o mínimo possível de mudança de contexto.
3. **Entender imediatamente:** ações e estados precisam ser reconhecíveis sem tutorial obrigatório.
4. **Preservar a concentração:** reduzindo ruído, movimentos e disputas por atenção.
5. **Transmitir rigor intelectual:** tipografia editorial, hierarquia clara, linguagem precisa e ausência de enfeites arbitrários.
6. **Funcionar em documentos reais:** PDFs de layout fixo, EPUBs refluíveis, textos complexos e seleções imperfeitas.

### 1.2 Princípios e antiobjetivos

| Fazer | Evitar |
|---|---|
| Leitura visualmente dominante | Dashboard, cards e métricas concorrendo com o texto |
| Feedback contextual na seleção | Abrir um chat de tela cheia para explicar uma palavra |
| Tons neutros e um acento contido | Gradientes chamativos, neon e excesso de cores |
| Linguagem clara e adulta | Gamificação infantilizada e jargão de IA |
| Preferências persistentes | Reconfigurar fonte e idioma a cada arquivo |
| Controles progressivamente revelados | Barras de ferramentas sempre expansivas |
| Informação graduada por profundidade | Respostas extensas bloqueando a leitura |

---

## 2. Personalidade e expressão

**Arquétipo:** biblioteca contemporânea + edição crítica + ferramenta de estudo.

**Atributos:** sóbrio, sereno, culto, legível, cuidadoso, confiável, curioso.

**Não é:** austero ao ponto de intimidar; antiquado; professoral; lúdico demais; uma interface de IA genérica.

### 2.1 Diretrizes de marca

- A identidade deve se apoiar mais em **proporção, ritmo, tipografia e espaços vazios** do que em ilustrações.
- Elementos decorativos (linhas, pequenos numerais, capitulares) devem surgir apenas quando melhorarem organização ou caráter editorial.
- Ícones são auxiliares; jamais substituem rótulos em ações críticas ou pouco frequentes.
- A assistência de IA deve parecer uma **nota de margem inteligente**, não um interlocutor que sequestra a atenção.

### 2.2 Tom de voz

- **Preciso:** “Significado neste contexto” em vez de “Descubra a magia desta palavra”.
- **Humano, mas contido:** “Não foi possível analisar a seleção. Tente novamente.”
- **Didático sem condescendência:** explicações curtas e exemplos úteis.
- **Transparente:** quando houver ambiguidade, indicar que a interpretação depende do trecho.
- **Sem antropomorfização:** preferir “Analisando o contexto…” a “Estou pensando…”.

---

## 3. Fundamentos visuais

### 3.1 Paleta — *Papel, tinta e anotação*

O padrão é **claro e levemente quente**, apropriado a sessões longas de leitura. O tema escuro é uma alternativa, não a identidade principal. O acento verde profundo remete a estudo, confiança e biblioteca sem parecer um aplicativo corporativo.

#### Tokens semânticos — tema claro

| Token | Hex | Uso |
|---|---|---|
| `--color-canvas` | `#F4F1EA` | Fundo da aplicação |
| `--color-surface` | `#FBFAF6` | Cartões, menus e painéis |
| `--color-page` | `#FFFDF8` | Superfície de leitura refluível |
| `--color-ink` | `#252820` | Texto principal e títulos |
| `--color-ink-muted` | `#596056` | Metadados e textos secundários |
| `--color-border` | `#DADDD4` | Separadores e contornos |
| `--color-accent` | `#285A4B` | Ação primária, links e foco contextual |
| `--color-accent-hover` | `#1E473B` | Hover do acento |
| `--color-accent-soft` | `#E0ECE5` | Seleção assistida e indicação suave |
| `--color-highlight` | `#F2E6AC` | Realce manual de texto |
| `--color-error` | `#A33D32` | Erros e falhas |
| `--color-success` | `#2C654A` | Confirmação e salvamento |
| `--color-focus` | `#1D6659` | Contorno de foco acessível |

#### Tokens semânticos — tema escuro

| Token | Hex | Uso |
|---|---|---|
| `--color-canvas` | `#171B19` | Fundo da aplicação |
| `--color-surface` | `#222824` | Painéis e menus |
| `--color-page` | `#202521` | Página de leitura EPUB |
| `--color-ink` | `#ECEFE7` | Texto principal |
| `--color-ink-muted` | `#BAC4B8` | Texto secundário |
| `--color-border` | `#3B483F` | Divisores |
| `--color-accent` | `#A5D6BF` | Ações e links |
| `--color-accent-hover` | `#C0E5D1` | Hover do acento |
| `--color-accent-soft` | `#30483D` | Seleção contextual |
| `--color-highlight` | `#625527` | Realce manual de texto |
| `--color-error` | `#FFB4A8` | Erros |
| `--color-success` | `#A5DEB9` | Confirmação |
| `--color-focus` | `#B9E5D0` | Contorno de foco |

**Acessibilidade:** esses valores constituem uma direção inicial; validar em implementação os pares reais de cor com WCAG 2.2 AA (mínimo **4,5:1** para texto normal, **3:1** para texto grande e componentes gráficos essenciais). Em especial, confirmar cores de texto sobre `accent-soft`, texto em botões, destaques e links no tema escuro. Não presumir conformidade apenas pela tabela.

**Regra de proporção:** aproximadamente 80% superfícies neutras, 15% texto/contorno e 5% acento. A regra é uma orientação de composição, não um cálculo rígido de pixels.

### 3.2 Tipografia — editorial sem perder ergonomia

**Duas vozes tipográficas:**

- **Interface:** `Inter` (fallback `system-ui, sans-serif`). Para navegação, menus, botões, campos e mensagens.
- **Leitura refluível e títulos editoriais:** `Source Serif 4` (fallback `Georgia, serif`). Para o corpo do EPUB quando o usuário escolhe serifada, títulos da biblioteca e trechos de exemplo.

Disponibilizar no leitor EPUB uma alternativa **sem serifa** (`Inter`) e a opção **usar a tipografia original do livro**, quando tecnicamente viável. Carregar apenas pesos efetivamente utilizados; preservar caracteres acentuados e glifos do idioma estudado.

| Papel | Fonte | Tamanho / linha | Peso |
|---|---|---|---|
| Nome da página / título editorial | Source Serif 4 | 30px / 1.2 | 600 |
| Título de seção | Source Serif 4 | 24px / 1.3 | 600 |
| Título de componente | Inter | 16px / 1.4 | 600 |
| Texto de interface | Inter | 14px / 1.5 | 400 |
| Texto de apoio | Inter | 13px / 1.5 | 400 |
| Rótulo / metadado | Inter | 12px / 1.4 | 500 |
| Texto do leitor EPUB (padrão) | Source Serif 4 | 19px / 1.7 | 400 |
| Explicação contextual | Inter | 15px / 1.6 | 400 |

**Regras:**

- Não usar cinza muito claro em corpo de texto.
- Evitar blocos inteiros em caixa alta; caixa alta só em micro-rótulos muito curtos, com espaçamento de letras discreto.
- Usar itálico para *termos, obras e exemplos*, não como estilo de longos parágrafos.
- Não impor `letter-spacing` ao texto do EPUB; preservar a legibilidade do idioma.
- Não justificar texto por padrão: usar alinhamento à esquerda; justificar apenas como preferência opcional, com hifenização adequada.

### 3.3 Ritmo, medidas e largura

**Escala espacial:** base de 4px; passos recomendados `4, 8, 12, 16, 24, 32, 40, 48, 64`.

| Token | Valor | Aplicação |
|---|---:|---|
| `--space-1` | 4px | Ícone e texto próximos |
| `--space-2` | 8px | Entre controles relacionados |
| `--space-3` | 12px | Dentro de itens pequenos |
| `--space-4` | 16px | Preenchimento de campos |
| `--space-6` | 24px | Seções e painéis |
| `--space-8` | 32px | Separação de blocos |
| `--space-12` | 48px | Áreas de destaque |
| `--reader-max-width` | 72ch | Largura máxima do texto EPUB |
| `--content-max-width` | 1200px | Biblioteca e telas gerais |
| `--sidebar-width` | 264px | Navegação expandida em desktop |
| `--topbar-height` | 60px | Barra do aplicativo |

Para leitura EPUB, manter **55–75 caracteres por linha** como faixa de referência; o usuário pode ajustar a largura em configurações. PDF tem dimensões e paginação próprias: ajustar a escala do documento à viewport, sem forçar largura de coluna ou alterar seu layout interno.

### 3.4 Cantos, bordas, sombras e ícones

- `--radius-sm: 6px`: botões e inputs.
- `--radius-md: 10px`: menus, cartões e popovers.
- `--radius-lg: 16px`: modais e diálogos.
- Bordas de `1px` em `--color-border` para delimitação discreta.
- Sombras raras e leves; reservadas a elementos sobrepostos: `0 8px 30px rgba(20, 28, 24, 0.10)` no tema claro.
- Ícones simples em traço consistente, por exemplo Lucide, com **20px** como base e `stroke-width` coerente.
- Evitar glassmorphism, desfoques extensivos, brilho e elevações exageradas.

---

## 4. Arquitetura de informação

A hierarquia deve reduzir decisões durante a leitura.

```text
Aplicação
├── Biblioteca
│   ├── Importar PDF/EPUB
│   ├── Continuar leitura
│   └── Obras recentes
├── Leitor
│   ├── Voltar à biblioteca
│   ├── Título + progresso
│   ├── Documento (área dominante)
│   ├── Seleção de texto → Explicação contextual
│   ├── Sumário / páginas / busca (quando suportado)
│   └── Preferências de leitura e idioma
└── Preferências
    ├── Idioma de explicação
    ├── Aparência
    └── Comportamento da assistência
```

**Não presumir:** contas, sincronização em nuvem, gamificação, listas de vocabulário e tradução de páginas inteiras são funcionalidades existentes. Podem ser extensões futuras, mas não devem aparecer como controles falsamente funcionais no MVP.

### 4.1 Biblioteca

Objetivo: **abrir uma obra em segundos**.

- Cabeçalho sereno: título “Sua biblioteca” e ação visível “Adicionar livro”.
- Zona de importação com suporte a clique e arrastar/soltar; confirmar tipos aceitos `.pdf` e `.epub`.
- Obras em lista ou grade compacta, com título legível, formato, último acesso e progresso **apenas se esses dados forem realmente armazenados**.
- Sem capa real? Usar placeholder tipográfico neutro com iniciais do título; nunca inserir capas aleatórias.
- Estado vazio com um convite direto e exemplo de uso: “Adicione um PDF ou EPUB para começar a ler e explorar palavras no contexto.”
- Menus secundários discretos para remover documento, se implementado, com confirmação proporcional ao risco.

### 4.2 Leitor desktop

```text
┌───────────────────────────────────────────────────────────────────────┐
│ ← Biblioteca     Título da obra                 Idioma  Aa  Sumário   │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│                     ÁREA PRINCIPAL DE LEITURA                         │
│                                                                       │
│               Texto, PDF ou página EPUB ao centro                     │
│                                                                       │
│          palavra selecionada                                          │
│                └── [nota contextual compacta]                         │
│                                                                       │
│                                                                       │
├───────────────────────────────────────────────────────────────────────┤
│  ← página anterior             Progresso             próxima página →  │
└───────────────────────────────────────────────────────────────────────┘
```

Esta é uma estrutura lógica, não um pedido de molduras permanentes. Cabeçalho e rodapé podem reduzir destaque ou recolher durante a leitura, desde que sempre possam ser recuperados por teclado, toque e mouse.

- **Texto é a área dominante.** Não manter painel de IA aberto por padrão.
- Para PDFs: opção “Ajustar à largura”, “Ajustar à página” e zoom somente quando o renderizador suportar com qualidade.
- Para EPUB: personalização de fonte, tamanho, entrelinha, largura e tema.
- Sumário acessível se o arquivo contiver navegação estruturada; caso não contenha, não apresentar um sumário vazio como funcional.
- Progresso deve ser informado com precisão apropriada: página em PDF, localização/capítulo ou percentual real do EPUB quando disponíveis. Não prometer porcentagem universal.

### 4.3 Leitor em telas pequenas

- Documento ocupa a largura disponível com margens adequadas.
- Topbar compacta; controles secundários em menu ou folha inferior.
- **Explicações em bottom sheet** não modal por padrão, com altura inicial contida e possibilidade de expandir; evitar popover minúsculo ou escondido sob o teclado.
- Respeitar áreas seguras (`safe-area-inset-*`) e manter alvos interativos de no mínimo **24×24 CSS px**, preferencialmente **44×44px** para toque.
- No PDF, não prometer reflow automático: oferecer zoom e deslocamento claros; se existir modo texto extraído, identificá-lo como alternativo.

---

## 5. Comportamento central: selecionar → compreender → continuar

### 5.1 Modelo de interação

**Meta:** a explicação deve agir como anotação lateral que se revela quando solicitada.

1. **Seleção:** usuário marca uma palavra ou expressão no texto.
2. **Detecção:** app identifica a seleção e o contexto ao redor, quando acessíveis.
3. **Abertura discreta:** exibir nota contextual próxima à seleção (desktop) ou sheet inferior (mobile), sem tirar o foco da leitura desnecessariamente.
4. **Resposta em camadas:** primeiro a acepção relevante, depois detalhes sob demanda.
5. **Retorno imediato:** clique fora, tecla `Esc` ou botão “Fechar” devolve o foco ao texto; seleção e posição de leitura não devem saltar.

**Regra de consentimento:** não enviar seleção para a IA ao mero gesto de arrastar quando isso gerar requisições acidentais ou custos significativos. Preferir acionar ao final da seleção (`pointerup` / `selectionchange` estabilizado) com opção configurável “Explicar automaticamente” ou pelo botão “Explicar” na minibarra. **Padrão recomendado para o MVP:** selecionar e confirmar em “Explicar”, pois é mais previsível; estudar ativação automática após testes de uso.

### 5.2 Anatomia da nota contextual

```text
┌─────────────────────────────────────────┐
│  fleeting                       Fechar ×│
│  adjetivo · inglês → português          │
│                                         │
│  passageiro; breve                      │
│  Algo que dura pouco tempo, como uma    │
│  sensação ou um momento.                │
│                                         │
│  No trecho                              │
│  “a fleeting sense of joy”              │
│  → uma sensação breve de alegria        │
│                                         │
│  [Ver mais detalhes]                    │
└─────────────────────────────────────────┘
```

Exemplo ilustrativo, não uma resposta de modelo prescrita.

**Ordem informacional:**

1. **Termo selecionado** (preservar caracteres originais, acentos e caixa quando relevante).
2. **Classe gramatical**, se inferível com confiança; não inventar.
3. **Idioma de origem → idioma de explicação**, quando detectável.
4. **Significado principal naquele contexto**, em uma frase curta.
5. **Explicação simples** da acepção; evitar lista inicial de traduções desconectadas.
6. **Trecho de apoio** curto, quando disponível e pertinente.
7. **Detalhes expansíveis**: outros sentidos, nuance, registro, variações e exemplos.

Não apresentar pronúncia, áudio, origem etimológica ou conjugações como funções nativas se não existirem. O layout pode prevê-las como **módulos futuros opcionais**, sem reservar espaço permanente.

### 5.3 Restrições da resposta de IA

- Começar **pelo significado que melhor se encaixa no trecho**; reconhecer ambiguidades relevantes.
- Separar **tradução sugerida** de **explicação contextual**.
- Evitar afirmações categóricas quando o trecho é insuficiente: “Neste trecho, provavelmente significa…”.
- Restringir resposta inicial a aproximadamente **40–80 palavras**, ajustando pelo idioma e complexidade; detalhes sob expansão.
- Diferenciar claramente texto original do documento e conteúdo gerado pela IA.
- Caso a análise não tenha contexto, informar: “Explicação baseada apenas na expressão selecionada.”
- Se a seleção for um nome próprio, código, referência bibliográfica ou trecho sem sentido lexical claro, não fabricar definição.
- Nunca alterar silenciosamente o conteúdo do PDF/EPUB.

### 5.4 Estados do componente

| Estado | Experiência |
|---|---|
| Seleção sem ação | Seleção visível + ação “Explicar” próxima ao texto |
| Carregando | Nota com altura estável, indicador discreto e “Analisando o contexto…” |
| Sucesso | Acepção contextual em primeiro plano |
| Ambíguo | Mostrar a interpretação mais provável e indicação de alternativa |
| Sem texto extraível | “Não foi possível identificar texto selecionável nesta página.” |
| Erro de rede/serviço | “Não foi possível obter a explicação.” + “Tentar novamente” |
| Seleção vazia/inválida | Não abrir a nota; não mostrar alerta invasivo |
| Nova seleção | Cancelar/ignorar resposta obsoleta; nota acompanha a nova seleção |
| Fechado | Preservar posição de leitura; devolver foco de maneira previsível |

**Robustez:** evitar que uma resposta atrasada de uma seleção anterior substitua a explicação de uma palavra nova. Usar identificador de requisição, cancelamento ou verificação de seleção atual.

### 5.5 Geometria e posicionamento

- Desktop: popover com largura de **320–400px**, altura máxima de `min(65vh, 520px)` e rolagem interna quando necessária.
- Posicionar abaixo da seleção quando couber; inverter acima quando não houver espaço; manter margem da viewport.
- Não encobrir integralmente o parágrafo de origem; quando o espaço for insuficiente, usar painel lateral temporário ou posicionamento adaptativo.
- Mobile: sheet com alça visual e botão “Fechar” explícito; rolagem independente.
- Evitar seleção residual não intencional ao clicar na nota, sem suprimir a seleção nativa para cópia e acessibilidade.

---

## 6. Componentes do sistema

| Componente | Uso | Regras essenciais |
|---|---|---|
| `AppShell` | Moldura da aplicação | Cabeçalho mínimo, largura responsiva |
| `LibraryHeader` | Identidade e entrada da biblioteca | Um CTA principal |
| `UploadDropzone` | Importação | Clique e drag-and-drop; validação clara e estados de progresso |
| `DocumentItem` | Entrada da biblioteca | Título dominante; metadados discretos |
| `ReaderCanvas` | Exibição principal | Não interferir em seleção, scroll e zoom |
| `ReaderToolbar` | Ações de leitura | Ferramentas agrupadas por tarefa |
| `LanguageSelector` | Idioma das explicações | Nome do idioma por extenso; seleção persistida |
| `ReadingPreferences` | Ajustes EPUB e tema | Alterações reversíveis, preview imediato |
| `SelectionAction` | Ação após selecionar | Pequena, visível e acessível por teclado |
| `DefinitionPopover` | Explicação contextual | Resposta em camadas; fechamento inequívoco |
| `DefinitionSheet` | Variante mobile | Boa área de toque e expansão |
| `StatusMessage` | Feedback | Próximo da ação, sem bloquear leitura |
| `ConfirmDialog` | Ação destrutiva | Texto claro e alternativa de cancelar |
| `EmptyState` | Nenhuma obra | Explicar benefício + ação concreta |

### 6.1 Botões

- **Primário:** fundo `accent`, texto de contraste validado; para ação predominante no contexto (ex.: “Adicionar livro”).
- **Secundário:** superfície e borda; ações comuns sem destaque excessivo.
- **Terciário / texto:** ações de baixa prioridade (ex.: “Ver mais detalhes”).
- **Ícone:** apenas quando a função for reconhecível; tooltip e nome acessível obrigatórios.
- Altura visual de referência: `40px` em desktop e `44px` em contexto de toque; estados `default`, `hover`, `focus-visible`, `pressed`, `disabled`, `loading`.
- Não depender apenas de mudança de cor para indicar estado.

### 6.2 Campos e seletores

- Rótulo visível acima do campo em preferências, sem usar placeholder como único nome.
- Campos com borda distinta, foco de pelo menos `2px` e mensagem de erro próxima.
- Idiomas apresentados por nome (“Português”, “Inglês”, “Espanhol”), não apenas bandeiras — idioma não equivale a país.
- Caso exista detecção do idioma do documento, mostrar “Detectado: inglês” com possibilidade de corrigir, não presumir precisão absoluta.

### 6.3 Tooltips, toasts e avisos

- Tooltip orienta ícones, mas **não contém conteúdo essencial**.
- Toast breve apenas para eventos não críticos; erros de importação/análise devem aparecer perto do componente correspondente.
- Não abrir modal para comunicar sucesso de importação ou explicação concluída.
- Evitar várias notificações simultâneas.

---

## 7. Design específico para PDF e EPUB

### 7.1 PDF — fidelidade em primeiro lugar

PDF é um formato de layout fixo. A interface deve manter **a composição original**, inclusive margens, notas de rodapé e paginação. Evitar aplicar diretamente a tipografia do sistema ao conteúdo PDF.

- Ferramentas: zoom, ajuste de largura/página, navegação entre páginas e busca se suportada.
- Seleção lexical: depende de camada de texto ou extração confiável; arquivos digitalizados podem exigir OCR, **que não é presumido como existente**.
- Se um trecho for impossível de selecionar, explicar a limitação sem sugerir que a IA consegue interpretar qualquer PDF.
- Em PDFs multicoluna, conferir se a seleção e o contexto respeitam a ordem de leitura; não juntar colunas arbitrariamente.
- Cuidar do contraste da interface sobre páginas de cores muito diferentes (sombra/borda mínima do canvas).

### 7.2 EPUB — legibilidade personalizável

EPUB geralmente permite texto refluível e uma experiência mais personalizável.

**Preferências recomendadas:**

- Fonte: serifada / sem serifa / original, conforme suporte.
- Corpo: intervalo aproximado de **16–26px**, padrão **19px**.
- Entrelinha: **1,5–1,9**, padrão **1,7**.
- Largura de leitura: estreita / padrão / ampla, com padrão em torno de `72ch`.
- Tema: claro / escuro / acompanhar sistema; padrão claro ou preferência já salva.
- Alinhamento: à esquerda por padrão; justificado apenas se a composição e a hifenização funcionarem bem.

Ajustes devem aplicar-se ao EPUB sem alterar semanticamente citações, ênfases, fórmulas, poemas, imagens ou notas. Respeitar folhas de estilo da obra quando essenciais à sua compreensão.

### 7.3 Progresso e preservação de contexto

- Ao abrir uma obra, retomar posição anterior **se a persistência estiver implementada**.
- Salvar preferências de leitura e idioma com escopo claramente definido: global por padrão, exceções por obra apenas se existir necessidade.
- Trocar o tema ou o tamanho da fonte não deve apagar a seleção ativa nem conduzir o usuário ao início da obra.
- Em EPUB, a repaginação pode alterar o número de páginas: preferir localizações estáveis quando o mecanismo suportar.

---

## 8. Movimento e feedback

**Movimento deve confirmar relações espaciais, não servir de decoração.**

| Evento | Duração sugerida | Comportamento |
|---|---:|---|
| Hover / mudança de botão | 120ms | Cor e contorno |
| Entrada de popover | 150ms | Opacidade + deslocamento de até 4px |
| Abertura de sheet | 180–220ms | Deslize curto e desaceleração |
| Alteração de preferência | 120–180ms | Transição suave, sem alterar o texto bruscamente |
| Carregamento de IA | Variável | Indicador discreto, sem animação incessante |

- Respeitar `prefers-reduced-motion: reduce`, desabilitando transições não essenciais.
- Não usar efeitos de digitação da IA por padrão: a resposta deve aparecer completa e estável quando pronta, evitando reflow contínuo.
- Não ocultar o estado “Carregando” quando a operação está em andamento; evitar indicadores de carregamento falsos com duração fixa.

---

## 9. Acessibilidade e inclusão

**Meta:** WCAG 2.2 AA para a interface da aplicação; conteúdo importado pode ter limitações próprias que devem ser comunicadas.

### 9.1 Requisitos

1. Navegação completa por teclado em biblioteca, preferências e comandos de explicação.
2. `focus-visible` nítido e consistente, sem retirar o contorno do navegador sem substituto equivalente.
3. Alvos de interação no mínimo 24×24 CSS px (WCAG 2.2), preferencialmente 44×44px nos principais controles de toque.
4. Zoom do navegador e aumento do tamanho do texto sem perder funcionalidades importantes.
5. Estrutura semântica: headings, `nav`, `main`, `button`, `dialog`/popover com papéis apropriados e rótulos acessíveis.
6. Estado de análise comunicado com `aria-live="polite"` onde apropriado, sem ler automaticamente explicações longas sem solicitação.
7. Escape para fechar popovers; gerenciamento de foco previsível e retorno ao gatilho quando apropriado.
8. Seleção de texto e ações explicativas acessíveis também sem mouse; considerar botão “Explicar seleção” na barra do leitor.
9. Nenhum significado transmitido exclusivamente por cor, ícone ou animação.
10. Suporte a português, inglês e outros idiomas com metadados `lang` adequados quando conhecidos; o leitor de tela deve distinguir idioma do texto original e idioma da explicação.

**Atenção:** acessibilidade do PDF/EPUB depende também da estrutura fornecida pelo arquivo e da biblioteca de renderização. Não anunciar suporte integral a leitores de tela sem testes reais, especialmente em PDF digitalizado ou EPUB com conteúdo incorporado complexo.

### 9.2 Privacidade e confiança

- Informar que o trecho selecionado — e possivelmente contexto textual ao redor — pode ser enviado ao serviço de IA.
- Enviar **somente o contexto necessário** para fornecer a explicação; evitar transmitir o documento inteiro por padrão.
- Distinguir claramente armazenamento local de envio remoto.
- Não exibir promessas de “privacidade total” ou “processamento local” sem respaldo técnico.
- O usuário deve conseguir entender o que será analisado e controlar comportamento automático quando existir.

---

## 10. Conteúdo e microcopy

| Situação | Texto recomendado |
|---|---|
| Biblioteca vazia | “Sua próxima leitura começa aqui.” |
| Instrução de importação | “Arraste um PDF ou EPUB ou escolha um arquivo.” |
| Ação principal | “Adicionar livro” |
| Leitor sem seleção | “Selecione uma palavra ou expressão para entendê-la no contexto.” |
| Ação de seleção | “Explicar” |
| Carregamento | “Analisando o contexto…” |
| Resposta sem contexto suficiente | “A explicação pode variar conforme a frase.” |
| Falha de análise | “Não foi possível obter a explicação. Tente novamente.” |
| PDF sem camada de texto | “Esta página não oferece texto selecionável.” |
| Arquivo incompatível | “Formato não suportado. Escolha um arquivo PDF ou EPUB.” |
| Preferências | “Aparência de leitura” |
| Idioma | “Idioma da explicação” |
| Expansão da nota | “Ver mais detalhes” |
| Fechamento | “Fechar explicação” |

**Evitar:** “Seu copiloto literário mágico”, “IA revolucionária”, “Supertradução”, “Oops!”, emojis em notificações e termos técnicos não explicados.

---

## 11. Tokens de implementação (CSS de referência)

Os tokens abaixo são **um ponto de partida**. Componentes devem usar nomes semânticos, não valores hexadecimais embutidos. A aplicação pode transportá-los para Tailwind, CSS Modules, tokens JSON ou outro mecanismo sem alterar a semântica.

```css
:root {
  color-scheme: light;
  --font-ui: "Inter", system-ui, sans-serif;
  --font-reading: "Source Serif 4", Georgia, serif;

  --color-canvas: #F4F1EA;
  --color-surface: #FBFAF6;
  --color-page: #FFFDF8;
  --color-ink: #252820;
  --color-ink-muted: #596056;
  --color-border: #DADDD4;
  --color-accent: #285A4B;
  --color-accent-hover: #1E473B;
  --color-accent-soft: #E0ECE5;
  --color-highlight: #F2E6AC;
  --color-error: #A33D32;
  --color-success: #2C654A;
  --color-focus: #1D6659;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --reader-max-width: 72ch;
  --content-max-width: 1200px;
  --sidebar-width: 264px;
  --topbar-height: 60px;
  --shadow-popover: 0 8px 30px rgb(20 28 24 / 10%);
}

[data-theme="dark"] {
  color-scheme: dark;
  --color-canvas: #171B19;
  --color-surface: #222824;
  --color-page: #202521;
  --color-ink: #ECEFE7;
  --color-ink-muted: #BAC4B8;
  --color-border: #3B483F;
  --color-accent: #A5D6BF;
  --color-accent-hover: #C0E5D1;
  --color-accent-soft: #30483D;
  --color-highlight: #625527;
  --color-error: #FFB4A8;
  --color-success: #A5DEB9;
  --color-focus: #B9E5D0;
  --shadow-popover: 0 8px 30px rgb(0 0 0 / 24%);
}

body {
  background: var(--color-canvas);
  color: var(--color-ink);
  font-family: var(--font-ui);
}

.reader--epub {
  max-width: var(--reader-max-width);
  margin-inline: auto;
  font-family: var(--font-reading);
  font-size: 19px;
  line-height: 1.7;
  text-align: start;
}

:where(button, input, select, a, [tabindex]):focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 3px;
}

::selection {
  background: var(--color-accent-soft);
  color: var(--color-ink);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Notas técnicas importantes:**

- A regra global `::selection` não deve interferir em seleções internas de visualizadores PDF que adotem suas próprias camadas de texto.
- EPUBs em iframe ou shadow DOM podem exigir aplicação separada de estilos; CSS global não chega automaticamente a esses contextos.
- Manter distinção entre `--color-page` (EPUB) e a aparência original de cada página PDF.
- Verificar contraste de `--color-accent` com texto de botão escolhido. No tema escuro, usar texto escuro sobre acento claro; no claro, usar texto claro sobre acento escuro, após teste.
- Usar `font-display: swap` e fallbacks adequados para evitar tela de leitura invisível durante o carregamento de fontes.

---

## 12. Fluxos que devem ser desenhados e testados

### Fluxo A — primeira leitura

`Biblioteca vazia → importar arquivo → confirmar abertura → leitor → selecionar termo → Explicar → ler significado → Fechar → continuar leitura`

**Critério de sucesso:** usuário entende como obter a primeira explicação sem tutorial extenso.

### Fluxo B — leitura concentrada

`Abrir livro → retomar posição (se houver) → ajustar aparência EPUB → ler por vários minutos → consultar termo → continuar no mesmo trecho`

**Critério de sucesso:** a consulta não produz salto de rolagem ou perda de localização.

### Fluxo C — problemas reais

`Importar arquivo inválido / abrir PDF sem camada textual / perder conexão durante análise → ver mensagem específica → corrigir ou tentar novamente`

**Critério de sucesso:** a interface identifica a causa provável e oferece uma ação possível sem bloquear as demais tarefas.

---

## 13. Critérios de aceite do design system

### Visual

- [ ] A área de leitura domina visualmente em desktop e celular.
- [ ] Existe consistência entre biblioteca, leitor, menus e nota contextual.
- [ ] Não há mais de um CTA visualmente dominante por região.
- [ ] A tipografia de interface difere intencionalmente da tipografia de leitura.
- [ ] Tema claro e escuro mantêm legibilidade após auditoria de contraste.

### Interação

- [ ] Uma palavra pode ser selecionada e explicada sem sair do leitor.
- [ ] A nota abre em posição visível e não fica cortada.
- [ ] Fechar a nota preserva a posição de leitura.
- [ ] Uma resposta antiga não sobrescreve uma consulta mais recente.
- [ ] Estados de carregamento, vazio e erro são compreensíveis.
- [ ] Preferências aplicam-se apenas onde o formato permite (EPUB versus PDF).

### Acessibilidade

- [ ] Todos os controles são acessíveis por teclado.
- [ ] Foco é visível.
- [ ] Alvos de toque atendem ao mínimo WCAG e são confortáveis no mobile.
- [ ] O sistema funciona sem animação essencial.
- [ ] Rotulagem e anúncios de estado funcionam com leitor de tela em testes reais.
- [ ] Informações essenciais não dependem só de cor.

### Conteúdo e confiança

- [ ] A IA prioriza o sentido contextual, não uma lista desordenada de definições.
- [ ] É possível distinguir trecho original de explicação gerada.
- [ ] Limitações de texto não extraível são comunicadas.
- [ ] Idioma da explicação é explícito.
- [ ] A política de envio de trechos à IA corresponde à implementação real.

---

## 14. Ordem de implementação sugerida

**Fase 1 — legibilidade estrutural (maior impacto)**

1. Aplicar tokens de cor, tipografia, espaçamento e foco.
2. Simplificar a navegação e transformar o leitor na região visual dominante.
3. Refinar a biblioteca, a importação e os estados vazios/erros.
4. Construir `DefinitionPopover` / `DefinitionSheet` e uma saída clara da consulta.

**Fase 2 — qualidade de estudo**

1. Preferências EPUB: fonte, tamanho, entrelinha e largura.
2. Seletor persistente de idioma da explicação.
3. Estruturar respostas da IA com sentido, nuance e contexto.
4. Robustez de seleção, cancelamento, loading e navegação por teclado.

**Fase 3 — validação e refinamento**

1. Testar leitura e seleção com PDF textual, PDF multicoluna, PDF digitalizado e EPUBs de diferentes estilos.
2. Testar desktop, celular, teclado, zoom 200% e leitor de tela.
3. Medir taxa de sucesso da primeira consulta, tempo para compreender a ação e taxa de consultas acidentais.
4. Ajustar automaticamente versus manualmente o acionamento da IA **com evidência de uso**.

---

## 15. Diretriz final para desenvolvimento

> **Antes de adicionar qualquer elemento à interface, perguntar:** “Isso ajuda o leitor a ler, compreender ou voltar à leitura?”
>
> Se a resposta for não, o elemento provavelmente não pertence à tela principal.

O sucesso deste design system não está em fazer o aplicativo parecer mais tecnológico, mas em fazer a tecnologia **desaparecer diante do texto**. Uma boa leitura permanece silenciosa; a assistência surge no momento exato, explica o necessário e se retira.
