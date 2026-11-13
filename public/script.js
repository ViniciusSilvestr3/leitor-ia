// ==========================================
// 0. CONTROLE DE TELA E AUTENTICAÇÃO
// ==========================================
// ==========================================
// 1. VARIÁVEIS GLOBAIS DA LEITURA
// ==========================================
let currentRendition;
let termoAtual = "";
let contextoAtual = "";
let explicacaoAtual = "";
let tituloLivroAtual = "Livro Desconhecido";
let cfiAtual = "";
let pdfAtual = null;
let pdfPaginaAtual = 1;
let pdfRenderizando = false;
let ignorarCliqueAte = 0;
let epubLocationsReady = false;
let ultimaLocalizacaoEpub = null;
let selecaoPendente = null;
const modalOverlay = document.getElementById('modalOverlay');
const readerPrev = document.getElementById('reader-prev');
const readerNext = document.getElementById('reader-next');
const selectionActions = document.getElementById('selection-actions');
const selectionExplain = document.getElementById('selection-explain');
const selectionHighlight = document.getElementById('selection-highlight');
const selectionDismiss = document.getElementById('selection-dismiss');

function esconderAcoesSelecao() {
    selectionActions.hidden = true;
    selecaoPendente = null;
}

function posicionarAcoesSelecao(rect) {
    const painel = document.getElementById('reader-panel').getBoundingClientRect();
    const largura = selectionActions.offsetWidth || 220;
    const margem = 12;
    const esquerda = Math.min(
        Math.max(rect.left - painel.left + (rect.width / 2) - (largura / 2), margem),
        painel.width - largura - margem
    );
    const acima = rect.bottom - painel.top + 8;
    selectionActions.style.left = `${esquerda}px`;
    selectionActions.style.top = `${Math.min(acima, painel.height - 56)}px`;
    selectionActions.hidden = false;
}

function prepararSelecao({ texto, contexto, cfi = '', contents = null, range = null, highlight = null }) {
    if (!texto.trim()) return;

    selecaoPendente = { texto: texto.trim(), contexto, cfi, contents, range, highlight };
    const rect = range?.getBoundingClientRect?.() || highlight?.getBoundingClientRect?.();
    if (rect) {
        const iframe = contents?.document?.defaultView?.frameElement;
        if (iframe) {
            const iframeRect = iframe.getBoundingClientRect();
            posicionarAcoesSelecao({
                top: iframeRect.top + rect.top,
                bottom: iframeRect.top + rect.bottom,
                left: iframeRect.left + rect.left,
                width: rect.width,
            });
        } else {
            posicionarAcoesSelecao(rect);
        }
    } else {
        selectionActions.hidden = false;
    }
}

selectionExplain.addEventListener('click', async () => {
    if (!selecaoPendente) return;
    const selecao = selecaoPendente;
    esconderAcoesSelecao();
    if (selecao.contents) selecao.contents.window.getSelection().removeAllRanges();
    await solicitarExplicacao(selecao.texto, selecao.contexto, selecao.cfi);
});

selectionHighlight.addEventListener('click', () => {
    if (!selecaoPendente) return;
    const selecao = selecaoPendente;
    if (selecao.highlight) {
        selecao.highlight();
    } else if (selecao.cfi && currentRendition) {
        currentRendition.annotations.highlight(selecao.cfi, {}, () => {});
    }
    if (selecao.contents) selecao.contents.window.getSelection().removeAllRanges();
    esconderAcoesSelecao();
});

selectionDismiss.addEventListener('click', esconderAcoesSelecao);

function definirNavegacaoAtiva(ativa) {
    readerPrev.disabled = !ativa;
    readerNext.disabled = !ativa;
}

function atualizarIndicadorLeitura({ pagina, total, percentual, estimada = false }) {
    const indicador = document.getElementById('reading-progress');
    const texto = document.getElementById('reading-progress-text');
    if (!indicador || !texto) return;

    indicador.style.display = 'flex';
    const percentualValido = Number.isFinite(percentual)
        ? ` · ${Math.round(Math.min(Math.max(percentual, 0), 1) * 100)}%`
        : '';

    if (Number.isFinite(pagina) && Number.isFinite(total) && total > 0) {
        texto.innerText = `${estimada ? 'Página estimada' : 'Página'} ${pagina} de ${total}${percentualValido}`;
        return;
    }

    texto.innerText = Number.isFinite(percentual)
        ? `${Math.round(Math.min(Math.max(percentual, 0), 1) * 100)}% lido`
        : 'Progresso da leitura indisponível';
}

function atualizarProgressoEpub(location, book) {
    const exibicao = location?.start?.displayed;
    let percentual = Number(location?.start?.percentage);
    let pagina;
    let total;

    if (epubLocationsReady && location?.start?.cfi) {
        percentual = book.locations.percentageFromCfi(location.start.cfi);
        pagina = book.locations.locationFromCfi(location.start.cfi) + 1;
        total = book.locations.length();
    }

    atualizarIndicadorLeitura({
        pagina: Number.isFinite(pagina) ? pagina : Number(exibicao?.page),
        total: Number.isFinite(total) ? total : undefined,
        percentual,
        estimada: true,
    });
}

function navegarLeitor(direcao) {
    if (modalOverlay?.style.display === 'block') return;
    esconderAcoesSelecao();

    if (pdfAtual) {
        const proximaPagina = pdfPaginaAtual + direcao;
        if (proximaPagina >= 1 && proximaPagina <= pdfAtual.numPages) {
            pdfPaginaAtual = proximaPagina;
            renderizarPaginaPdf(pdfPaginaAtual);
        }
        return;
    }

    if (currentRendition) {
        if (direcao < 0) currentRendition.prev();
        else currentRendition.next();
    }
}

function teclaPodeNavegar(event) {
    const elemento = event.target;
    return !(elemento instanceof HTMLInputElement ||
        elemento instanceof HTMLTextAreaElement ||
        elemento instanceof HTMLSelectElement ||
        elemento instanceof HTMLButtonElement ||
        elemento?.isContentEditable);
}

function lidarComTeclaDeNavegacao(event) {
    if (!teclaPodeNavegar(event)) return;
    if (event.key === 'ArrowLeft') {
        event.preventDefault();
        navegarLeitor(-1);
    } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        navegarLeitor(1);
    }
}

document.addEventListener('keydown', lidarComTeclaDeNavegacao);
readerPrev.addEventListener('click', () => navegarLeitor(-1));
readerNext.addEventListener('click', () => navegarLeitor(1));
definirNavegacaoAtiva(false);
// ==========================================
// MODO NOTURNO
// ==========================================
let isDarkMode = localStorage.getItem('theme') === 'dark';
const btnThemeToggle = document.getElementById('btnThemeToggle');
const idiomaDestinoSelect = document.getElementById('idiomaDestino');

idiomaDestinoSelect.value = localStorage.getItem('idiomaDestino') || 'Português';
idiomaDestinoSelect.addEventListener('change', () => {
    localStorage.setItem('idiomaDestino', idiomaDestinoSelect.value);
});

function aplicarTema() {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.body.dataset.theme = 'dark';
        btnThemeToggle.innerText = 'Modo Claro';
    } else {
        document.body.classList.remove('dark-mode');
        document.body.dataset.theme = 'light';
        btnThemeToggle.innerText = 'Modo Escuro';
    }

    // Usa typeof para evitar ReferenceError (TDZ)
    if (typeof currentRendition !== 'undefined' && currentRendition) {
        currentRendition.themes.select(isDarkMode ? "dark" : "light");
    }
}

btnThemeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    aplicarTema();
});

// Aplica o tema salvo logo ao abrir a página
aplicarTema();
let isModoCadastro = false;

const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const tabLogin = document.getElementById('tabLogin');
const tabCadastro = document.getElementById('tabCadastro');
const authNome = document.getElementById('authNome');
const authEmail = document.getElementById('authEmail');
const authSenha = document.getElementById('authSenha');
const btnAuthAction = document.getElementById('btnAuthAction');
const authMessage = document.getElementById('authMessage');

function showMessage(text, isError = true) {
    authMessage.innerText = text;
    authMessage.style.color = isError ? '#dc3545' : '#28a745';
    authMessage.style.display = 'block';
}

function verificarLoginInicial() {
    const token = localStorage.getItem('token');
    if (token) {
        authScreen.style.display = 'none';
        appScreen.style.display = 'flex'; 
    } else {
        authScreen.style.display = 'flex';
        appScreen.style.display = 'none';
    }
}
verificarLoginInicial(); 

document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.removeItem('token');
    if (currentRendition) currentRendition.destroy();
    document.getElementById('viewer').innerHTML = ''; 
    verificarLoginInicial();
});

tabLogin.addEventListener('click', () => {
    isModoCadastro = false;
    authNome.style.display = 'none';
    btnAuthAction.innerText = 'Entrar';
    tabLogin.style.borderBottom = '3px solid #007bff'; tabLogin.style.color = '#007bff';
    tabCadastro.style.borderBottom = 'none'; tabCadastro.style.color = '#888';
    authMessage.style.display = 'none';
});

tabCadastro.addEventListener('click', () => {
    isModoCadastro = true;
    authNome.style.display = 'block';
    btnAuthAction.innerText = 'Criar Conta';
    tabCadastro.style.borderBottom = '3px solid #007bff'; tabCadastro.style.color = '#007bff';
    tabLogin.style.borderBottom = 'none'; tabLogin.style.color = '#888';
    authMessage.style.display = 'none';
});

function isEmailValido(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

btnAuthAction.addEventListener('click', async () => {
    const nome = authNome.value.trim();
    const email = authEmail.value.trim();
    const senha = authSenha.value.trim();

    if (!email || !senha || (isModoCadastro && !nome)) {
        showMessage("Preencha todos os campos."); return;
    }
    if (!isEmailValido(email)) {
        showMessage("E-mail inválido."); return;
    }

    btnAuthAction.disabled = true;
    btnAuthAction.innerText = "Aguarde...";

    const url = isModoCadastro ? '/api/auth/cadastro' : '/api/auth/login';
    const payload = isModoCadastro ? { nome, email, senha } : { email, senha };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (response.ok) {
            if (isModoCadastro) {
                showMessage("Conta criada! Faça login.", false);
                tabLogin.click();
            } else {
                localStorage.setItem('token', data.token);
                authEmail.value = ''; authSenha.value = '';
                verificarLoginInicial();
            }
        } else {
            showMessage(data.erro);
        }
    } catch (error) {
        showMessage("Erro de conexão.");
    } finally {
        btnAuthAction.disabled = false;
        btnAuthAction.innerText = isModoCadastro ? "Criar Conta" : "Entrar";
    }
});


// ==========================================
// 2. UPLOAD DO LIVRO
// ==========================================
async function abrirArquivoSelecionado() {
    const fileInput = document.getElementById('bookInput');
    const file = fileInput.files[0];

    if (!file) return;

    try {
        const conteudoLivro = await file.arrayBuffer();
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            renderizarPdf(conteudoLivro);
        } else {
            renderizarLivro(conteudoLivro);
        }
    } catch (error) {
        console.error("Erro ao ler o arquivo no navegador:", error);
        alert("Não foi possível abrir o arquivo.");
    }
}

document.getElementById('bookInput').addEventListener('change', abrirArquivoSelecionado);

async function solicitarExplicacao(textoSelecionado, contexto, cfi = "") {
    const token = localStorage.getItem('token');
    const idiomaDestino = idiomaDestinoSelect.value;

    document.getElementById('modalOverlay').style.display = 'block';
    document.getElementById('termo-box').innerText = textoSelecionado;
    document.getElementById('idioma-box').innerText = `Idioma da explicação: ${idiomaDestino}`;
    document.getElementById('traducao-box').innerText = '';
    document.getElementById('explicacao-box').innerText = "Analisando o contexto...";
    document.getElementById('modal-status').innerText = "Analisando o contexto...";
    document.getElementById('btnSalvarCard').style.display = 'none';

    try {
        const response = await fetch('/api/explicar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ termo: textoSelecionado, contexto, livro_titulo: tituloLivroAtual, cfi, idioma_destino: idiomaDestino })
        });
        const data = await response.json();

        if (response.ok) {
            const vocabulario = data.explicacao;
            document.getElementById('termo-box').innerText = vocabulario.termo_base;
            document.getElementById('traducao-box').innerText = vocabulario.traducao;
            document.getElementById('explicacao-box').innerText = vocabulario.explicacao;
            document.getElementById('modal-status').innerText = "Explicação disponível.";
            termoAtual = vocabulario.termo_base;
            contextoAtual = contexto;
            explicacaoAtual = vocabulario.explicacao;
            cfiAtual = cfi;

            const btnSalvar = document.getElementById('btnSalvarCard');
            btnSalvar.style.display = 'none';
        } else {
            document.getElementById('traducao-box').innerText = '';
            document.getElementById('explicacao-box').innerText = "Não foi possível obter a explicação. Tente novamente.";
            document.getElementById('modal-status').innerText = data.erro || "Falha na análise.";
        }
    } catch (error) {
        document.getElementById('explicacao-box').innerText = "Não foi possível obter a explicação. Tente novamente.";
        document.getElementById('modal-status').innerText = "Erro de conexão com a API.";
    }
}

// ==========================================
// 3. RENDERIZAR O LIVRO E IA
// ==========================================
// ==========================================
// 3. RENDERIZAR O LIVRO E IA (VERSÃO FINAL)
// ==========================================
// ==========================================
// 3. RENDERIZAR O LIVRO E IA (COM PROGRESSO E CLIQUES)
// ==========================================
function renderizarLivro(conteudoLivro) {
    if (currentRendition) currentRendition.destroy();
    esconderAcoesSelecao();
    pdfAtual = null;
    pdfPaginaAtual = 1;
    pdfRenderizando = false;
    epubLocationsReady = false;
    ultimaLocalizacaoEpub = null;
    definirNavegacaoAtiva(false);
    document.getElementById('pdf-controls').style.display = 'none';
    document.getElementById('viewer').innerHTML = ''; 
    
    const book = ePub(conteudoLivro);
    
    book.ready.then(() => {
        tituloLivroAtual = book.package.metadata.title || "Livro Desconhecido";
        return book.locations.generate(1600);
    }).then(() => {
        epubLocationsReady = true;
        definirNavegacaoAtiva(true);
        if (ultimaLocalizacaoEpub) atualizarProgressoEpub(ultimaLocalizacaoEpub, book);
    }).catch(() => {
        epubLocationsReady = false;
        definirNavegacaoAtiva(true);
    });
    
    currentRendition = book.renderTo("viewer", {
        width: "100%",
        height: "100%",
        spread: "none",
        flow: "paginated",     
        manager: "continuous", 
        allowScriptedContent: true 
    });

    // Registra os temas DENTRO do iframe do livro
    currentRendition.themes.register("light", {
        "body": { "background": "#ffffff", "color": "#333333" },
        "body::selection": { "background": "#b9dcff", "color": "#1f2933" },
        "img": { "max-width": "100% !important", "max-height": "80vh !important", "height": "auto !important", "object-fit": "contain !important", "display": "block !important", "margin": "0 auto !important" },
        "svg": { "max-width": "100% !important", "max-height": "80vh !important" }
    });
    
    currentRendition.themes.register("dark", {
        "body": { "background": "#1e1e1e", "color": "#e0e0e0" },
        "body::selection": { "background": "#28527a", "color": "#ffffff" },
        "img": { "max-width": "100% !important", "max-height": "80vh !important", "height": "auto !important", "object-fit": "contain !important", "display": "block !important", "margin": "0 auto !important" },
        "svg": { "max-width": "100% !important", "max-height": "80vh !important" },
        "a": { "color": "#66b3ff" }
    });

    // Aplica o tema atual
    currentRendition.themes.select(isDarkMode ? "dark" : "light");

    // CARREGAR PROGRESSO: Verifica se existe uma página salva para este livro
    book.ready.then(() => {
        const progressoSalvo = localStorage.getItem('progresso_' + tituloLivroAtual);
        if (progressoSalvo) {
            currentRendition.display(progressoSalvo);
        } else {
            currentRendition.display();
        }
    });

    currentRendition.display().then(() => {
        document.getElementById('controls').style.display = 'block';
        definirNavegacaoAtiva(true);
    }).catch(erro => console.error("Erro ao renderizar:", erro));

    // SALVAR PROGRESSO: Dispara toda vez que a página é virada
    currentRendition.on("relocated", function(location) {
        ultimaLocalizacaoEpub = location;
        if (tituloLivroAtual !== "Livro Desconhecido") {
            localStorage.setItem('progresso_' + tituloLivroAtual, location.start.cfi);
        }
        atualizarProgressoEpub(location, book);
    });

    currentRendition.on('rendered', (_section, contents) => {
        contents.document.addEventListener('keydown', lidarComTeclaDeNavegacao);
    });

    // A seleção aguarda uma ação explícita: explicar ou grifar.
    currentRendition.on("selected", function (cfiRange, contents) {
        ignorarCliqueAte = Date.now() + 1200;
        book.getRange(cfiRange).then(range => {
            const textoSelecionado = range.toString().trim();
            if (!textoSelecionado) return;

            const selection = contents.window.getSelection();
            const node = selection.anchorNode;
            const paragrafoContexto = node?.parentElement?.textContent?.trim() || "";

            prepararSelecao({
                texto: textoSelecionado,
                contexto: paragrafoContexto,
                cfi: cfiRange,
                contents,
                range,
            });
        }).catch(error => {
            console.error("Não foi possível preparar a seleção do EPUB:", error);
        });
    });
}

async function renderizarPdf(conteudoPdf) {
    if (currentRendition) currentRendition.destroy();
    esconderAcoesSelecao();
    document.getElementById('controls').style.display = 'none';
    document.getElementById('viewer').innerHTML = '<div id="pdfViewer"></div>';
    document.getElementById('pdf-controls').style.display = 'flex';
    epubLocationsReady = false;
    definirNavegacaoAtiva(false);
    pdfPaginaAtual = 1;
    tituloLivroAtual = "Documento PDF";

    try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        pdfAtual = await pdfjsLib.getDocument({ data: conteudoPdf }).promise;
        await renderizarPaginaPdf(pdfPaginaAtual);
        definirNavegacaoAtiva(true);
    } catch (error) {
        console.error("Erro ao abrir o PDF:", error);
        document.getElementById('viewer').innerText = "Não foi possível abrir o arquivo PDF.";
    }
}

async function renderizarPaginaPdf(numeroPagina) {
    if (!pdfAtual || pdfRenderizando) return;
    pdfRenderizando = true;

    try {
        const pagina = await pdfAtual.getPage(numeroPagina);
        const escala = Math.min((document.getElementById('viewer').clientWidth - 40) / pagina.getViewport({ scale: 1 }).width, 1.5);
        const viewport = pagina.getViewport({ scale: Math.max(escala, 0.5) });
        const pdfViewer = document.getElementById('pdfViewer');
        pdfViewer.innerHTML = '';

        const pageContainer = document.createElement('div');
        pageContainer.className = 'pdf-page';
        pageContainer.style.width = `${viewport.width}px`;
        pageContainer.style.height = `${viewport.height}px`;

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        pageContainer.appendChild(canvas);

        const textLayer = document.createElement('div');
        textLayer.className = 'pdf-text-layer';
        textLayer.style.width = `${viewport.width}px`;
        textLayer.style.height = `${viewport.height}px`;
        pageContainer.appendChild(textLayer);
        pdfViewer.appendChild(pageContainer);

        await pagina.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        const textContent = await pagina.getTextContent();
        const textDivs = [];
        const renderTextLayerTask = pdfjsLib.renderTextLayer({
            textContent,
            container: textLayer,
            viewport,
            textDivs,
        });
        if (renderTextLayerTask.promise) await renderTextLayerTask.promise;

        textLayer.addEventListener('mouseup', () => {
            const selecaoDocumento = textLayer.ownerDocument.getSelection();
            const selecao = selecaoDocumento.toString().trim();
            if (!selecao) return;
            const contexto = textContent.items.map(item => item.str).join(' ').trim();
            const range = selecaoDocumento.rangeCount ? selecaoDocumento.getRangeAt(0).cloneRange() : null;
            prepararSelecao({
                texto: selecao,
                contexto,
                range,
                highlight: () => {
                    if (!range) return;
                    textLayer.querySelectorAll('span').forEach(span => {
                        if (range.intersectsNode(span)) span.classList.add('pdf-highlight');
                    });
                },
            });
        });

        document.getElementById('pdf-page-number').innerText = `Página ${numeroPagina} de ${pdfAtual.numPages}`;
        atualizarIndicadorLeitura({
            pagina: numeroPagina,
            total: pdfAtual.numPages,
            percentual: numeroPagina / pdfAtual.numPages,
        });
    } catch (error) {
        console.error("Erro ao renderizar página do PDF:", error);
    } finally {
        pdfRenderizando = false;
    }
}

document.getElementById('pdf-prev').addEventListener('click', () => {
    if (pdfAtual && pdfPaginaAtual > 1) {
        pdfPaginaAtual--;
        renderizarPaginaPdf(pdfPaginaAtual);
    }
});

document.getElementById('pdf-next').addEventListener('click', () => {
    if (pdfAtual && pdfPaginaAtual < pdfAtual.numPages) {
        pdfPaginaAtual++;
        renderizarPaginaPdf(pdfPaginaAtual);
    }
});

// ==========================================
// 4. SALVAR FLASHCARD NO BANCO E FECHAR MODAL
// ==========================================
// ==========================================
// 4. SALVAR FLASHCARD NO BANCO E FECHAR MODAL
// ==========================================
document.getElementById('btnSalvarCard').addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    const botao = document.getElementById('btnSalvarCard');
    botao.disabled = true; 
    botao.innerText = "Salvando...";

    try {
        const response = await fetch('/api/flashcards/salvar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ 
                termo: termoAtual, 
                contexto: contextoAtual, 
                explicacao: explicacaoAtual,
                livro_titulo: tituloLivroAtual,
                cfi: cfiAtual // Enviando a coordenada pro backend!
            })
        });
        const data = await response.json(); // Lendo o que o servidor respondeu

        if (response.ok) {
            botao.innerText = "✔️ Salvo!"; 
            botao.style.backgroundColor = "#20c997"; 
        } else {
            // Se der erro, joga o erro na tela (ou no botão)
            botao.disabled = false; 
            botao.innerText = "Erro!";
            alert("Erro do Servidor: " + data.erro);
        }
    } catch (error) { 
        botao.disabled = false; 
        alert("Erro de conexão com o banco.");
    }
});

function fecharModal() { modalOverlay.style.display = 'none'; }
document.getElementById('closeModal').addEventListener('click', fecharModal);
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modalOverlay.style.display === 'block') fecharModal();
});
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) fecharModal(); });

// ==========================================
// 7. NAVEGAÇÃO E ABAS (Leitor vs Vocabulário)
// ==========================================
const navLeitor = document.getElementById('navLeitor');
const navVocab = document.getElementById('navVocab');
const screenReader = document.getElementById('screen-reader');
const screenVocab = document.getElementById('screen-vocab');
const screenGame = document.getElementById('screen-game');

navLeitor.addEventListener('click', () => {
    screenReader.style.display = 'flex'; screenVocab.style.display = 'none'; screenGame.style.display = 'none';
    navLeitor.classList.add('active');
    navVocab.classList.remove('active');
});

navVocab.addEventListener('click', () => {
    screenReader.style.display = 'none'; screenVocab.style.display = 'block'; screenGame.style.display = 'none';
    navVocab.classList.add('active');
    navLeitor.classList.remove('active');
    carregarVocabulario(); 
});

// ==========================================
// 8. CARREGAR VOCABULÁRIO (Lista de Flashcards)
// ==========================================
// ==========================================
// 8. CARREGAR E AGRUPAR VOCABULÁRIO + DELETAR
// ==========================================
// ==========================================
// 8. CARREGAR E AGRUPAR VOCABULÁRIO + DELETAR
// ==========================================
async function carregarVocabulario() {
    const token = localStorage.getItem('token');
    const lista = document.getElementById('lista-flashcards');
    lista.innerHTML = '<p style="text-align: center; color: #888;">Carregando...</p>';

    try {
        const response = await fetch('/api/flashcards', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await response.json();
        
        if (response.ok) {
            if (data.flashcards.length === 0) {
                lista.innerHTML = '<p style="text-align: center; color: #888;">Nenhuma palavra salva ainda.</p>'; 
                return;
            }
            
            lista.innerHTML = '';
            
            const agrupados = data.flashcards.reduce((acc, card) => {
                const titulo = card.livro_titulo || "Livro Desconhecido";
                if (!acc[titulo]) acc[titulo] = [];
                acc[titulo].push(card);
                return acc;
            }, {});

            for (const [livro, cards] of Object.entries(agrupados)) {
                let htmlGrupo = `
                <div class="livro-grupo">
                    <h3 class="livro-titulo-grupo">📖 ${livro}</h3>
                    <div class="vocab-grid">`;
                
                cards.forEach(card => {
                    // É AQUI DENTRO QUE DESENHAMOS O CARD E O BOTÃO AZUL:
                    htmlGrupo += `
                        <div class="vocab-card" id="card-${card.id}">
                            <strong>${card.termo_original}</strong>
                            <i>"${card.frase_contexto}"</i>
                            <p>${card.explicacao_ia}</p>
                            
                            <div class="card-actions">
                                <button onclick="irParaGrifo('${card.cfi}')" class="btn-text">Ver no Livro</button>
                                <button onclick="deletarFlashcard(${card.id})" class="btn-text danger">Excluir</button>
                            </div>
                        </div>`;
                });
                
                htmlGrupo += `</div></div>`;
                lista.innerHTML += htmlGrupo;
            }
        }
    } catch (error) { lista.innerHTML = `<p style="color: red; text-align: center;">Erro de conexão.</p>`; }
}

// LÓGICA DE CLIQUE DO BOTÃO AZUL
window.irParaGrifo = function(cfi) {
    if (!cfi || cfi === 'undefined') {
        alert("Ops! Esta palavra não tem localização salva.");
        return;
    }
    
    // 1. Muda visualmente para a aba do Leitor
    document.getElementById('navLeitor').click(); 
    
    // 2. Se o livro já estiver aberto, pula direto pra página!
    if (currentRendition) {
        currentRendition.display(cfi); 
    } else {
        alert("Por favor, abra o arquivo .epub deste livro primeiro para viajar até a página.");
    }
};

// Lógica Global para Deletar Flashcard
window.deletarFlashcard = async function(id) {
    if (!confirm("Tem certeza que deseja excluir esta palavra?")) return;
    
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/api/flashcards/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            document.getElementById(`card-${id}`).style.display = 'none';
        } else {
            alert("Erro ao excluir.");
        }
    } catch (error) {
        alert("Falha na comunicação com o servidor.");
    }
};

// Função Global para Deletar Flashcard
window.deletarFlashcard = async function(id) {
    if (!confirm("Tem certeza que deseja excluir esta palavra?")) return;
    
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/api/flashcards/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            document.getElementById(`card-${id}`).style.display = 'none'; // Remove visualmente com suavidade
        } else {
            alert("Erro ao excluir.");
        }
    } catch (error) {
        alert("Falha na comunicação com o servidor.");
    }
};

// ==========================================
// 9. O MOTOR DO MINIGAME (Estilo Kahoot)
// ==========================================
let perguntasJogo = [];
let perguntaAtualIndex = 0;
let pontuacaoJogo = 0;
let resultadoFinalExibido = false;
const btnIniciarJogo = document.getElementById('btnIniciarJogo');
const btnSairJogo = document.getElementById('btnSairJogo');
const gameLoading = document.getElementById('game-loading');
const gameContent = document.getElementById('game-content');
const gameFeedback = document.getElementById('game-feedback');
const botoesOpcao = document.querySelectorAll('.game-opt');
const gameProgress = document.getElementById('game-progress');
const gameScore = document.getElementById('game-score');
const btnProximaPergunta = document.getElementById('btnProximaPergunta');

btnIniciarJogo.addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    screenVocab.style.display = 'none'; screenGame.style.display = 'flex';
    gameLoading.style.display = 'block'; gameContent.style.display = 'none'; gameFeedback.style.display = 'none';
    pontuacaoJogo = 0;
    perguntaAtualIndex = 0;
    resultadoFinalExibido = false;
    gameScore.innerText = 'Pontuação: 0';
    btnProximaPergunta.innerText = 'Próxima pergunta';

    try {
        const response = await fetch('/api/minigame/gerar', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await response.json();
        if (response.ok) {
            perguntasJogo = Array.isArray(data.quiz) ? data.quiz : [];
            if (perguntasJogo.length === 0) {
                throw new Error('O servidor não retornou perguntas.');
            }
            gameLoading.style.display = 'none'; mostrarPergunta(); 
        } else {
            alert(data.erro); navVocab.click(); 
        }
    } catch (error) { alert(error.message || "Erro ao gerar o jogo."); navVocab.click(); }
});

btnSairJogo.addEventListener('click', () => { navVocab.click(); });

function mostrarPergunta() {
    gameFeedback.style.display = 'none'; gameContent.style.display = 'block';
    const perguntaAtual = perguntasJogo[perguntaAtualIndex];
    gameProgress.innerText = `Pergunta ${perguntaAtualIndex + 1} de ${perguntasJogo.length}`;
    gameScore.innerText = `Pontuação: ${pontuacaoJogo}`;
    document.getElementById('game-pergunta').innerText = perguntaAtual.pergunta;
    botoesOpcao.forEach((botao, index) => {
        botao.innerText = perguntaAtual.opcoes[index];
        botao.disabled = false;
        botao.style.opacity = '1';
        botao.onclick = () => verificarResposta(index);
    });
}

function verificarResposta(indiceEscolhido) {
    botoesOpcao.forEach(botao => {
        botao.disabled = true;
        botao.style.opacity = '0.7';
    });

    gameContent.style.display = 'none'; gameFeedback.style.display = 'block';
    const perguntaAtual = perguntasJogo[perguntaAtualIndex];
    const acertou = (indiceEscolhido === perguntaAtual.resposta_correta);
    const titulo = document.getElementById('feedback-titulo');
    const texto = document.getElementById('feedback-texto');

    if (acertou) {
        pontuacaoJogo++;
        titulo.innerText = "Correto!";
        titulo.style.color = "#28a745";
    }
    else { titulo.innerText = "❌ Incorreto!"; titulo.style.color = "#dc3545"; }
    texto.innerText = perguntaAtual.explicacao;
    gameScore.innerText = `Pontuação: ${pontuacaoJogo}`;
    btnProximaPergunta.innerText = perguntaAtualIndex + 1 < perguntasJogo.length
        ? 'Próxima pergunta'
        : 'Ver resultado';
}

btnProximaPergunta.addEventListener('click', () => {
    if (perguntaAtualIndex + 1 < perguntasJogo.length) {
        perguntaAtualIndex++;
        mostrarPergunta();
        return;
    }

    if (resultadoFinalExibido) {
        navVocab.click();
        return;
    }

    resultadoFinalExibido = true;
    document.getElementById('feedback-titulo').innerText = 'Resultado final';
    document.getElementById('feedback-titulo').style.color = '#3498db';
    document.getElementById('feedback-texto').innerText = `Você acertou ${pontuacaoJogo} de ${perguntasJogo.length} perguntas.`;
    btnProximaPergunta.innerText = 'Voltar ao vocabulário';
});
