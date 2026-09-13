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
let paginaPdfAtual = 1;
// ==========================================
// MODO NOTURNO
// ==========================================
let isDarkMode = localStorage.getItem('theme') === 'dark';
const btnThemeToggle = document.getElementById('btnThemeToggle');

function aplicarTema() {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        btnThemeToggle.innerText = 'Modo Claro';
    } else {
        document.body.classList.remove('dark-mode');
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
document.getElementById('uploadBtn').addEventListener('click', async () => {
    const fileInput = document.getElementById('epubInput');
    const file = fileInput.files[0];

    if (!file) { alert("Selecione um arquivo .epub primeiro!"); return; }
    
    const token = localStorage.getItem('token');
    if (!token) { alert("Você precisa estar logado."); return; }

    const formData = new FormData();
    formData.append('livro', file);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const data = await response.json();
        if (response.ok) renderizarLivro(data.caminho, data.formato);
        else alert("Erro: " + data.erro);
    } catch (error) {
        console.error("Erro no upload:", error);
    }
});

// ==========================================
// 3. RENDERIZAR O LIVRO E IA
// ==========================================
// ==========================================
// 3. RENDERIZAR O LIVRO E IA (VERSÃO FINAL)
// ==========================================
// ==========================================
// 3. RENDERIZAR O LIVRO E IA (COM PROGRESSO E CLIQUES)
// ==========================================
function renderizarLivro(caminhoUrl, formato = caminhoUrl.toLowerCase().endsWith('.pdf') ? 'pdf' : 'epub') {
    if (formato === 'pdf') {
        renderizarPdf(caminhoUrl);
        return;
    }

    pdfAtual = null;
    document.getElementById('viewer').classList.remove('pdf-mode');
    paginaPdfAtual = 1;
    document.getElementById('pdf-controls').style.display = 'none';
    document.getElementById('epub-controls-hint').style.display = 'block';
    document.getElementById('pdf-page-counter').innerText = 'Página 1';
    const urlCompleta = window.location.origin + caminhoUrl;
    
    if (currentRendition) currentRendition.destroy();
    document.getElementById('viewer').innerHTML = ''; 
    
    const book = ePub(urlCompleta);
    
    book.ready.then(() => {
        tituloLivroAtual = book.package.metadata.title || "Livro Desconhecido";
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
        "img": { "max-width": "100% !important", "max-height": "80vh !important", "height": "auto !important", "object-fit": "contain !important", "display": "block !important", "margin": "0 auto !important" },
        "svg": { "max-width": "100% !important", "max-height": "80vh !important" }
    });
    
    currentRendition.themes.register("dark", {
        "body": { "background": "#1e1e1e", "color": "#e0e0e0" },
        "img": { "max-width": "100% !important", "max-height": "80vh !important", "height": "auto !important", "object-fit": "contain !important", "display": "block !important", "margin": "0 auto !important" },
        "svg": { "max-width": "100% !important", "max-height": "80vh !important" },
        "a": { "color": "#66b3ff" }
    });

    // Aplica o tema atual
    currentRendition.themes.select(isDarkMode ? "dark" : "light");

    // CARREGAR PROGRESSO: Verifica se existe uma página salva para este livro
    book.ready.then(() => {
        const progressoSalvo = localStorage.getItem('progresso_' + tituloLivroAtual);
        return progressoSalvo ? currentRendition.display(progressoSalvo) : currentRendition.display();
    }).then(() => {
        document.getElementById('controls').style.display = 'block';
        document.getElementById('epub-controls-hint').style.display = 'block';
        document.getElementById('pdf-controls').style.display = 'none';
    }).catch(erro => console.error("Erro ao renderizar:", erro));

    // SALVAR PROGRESSO: Dispara toda vez que a página é virada
    currentRendition.on("relocated", function(location) {
        if (tituloLivroAtual !== "Livro Desconhecido") {
            localStorage.setItem('progresso_' + tituloLivroAtual, location.start.cfi);
        }
    });

    let isSelectingText = false;
    let selectionGuardTimer = null;
    let lastSelectionAt = 0;

    // MUDANÇA DE PÁGINA PELO CLIQUE (Ignora se for um grifo)
    currentRendition.on("click", (e) => {
        const contents = currentRendition.manager.getContents()[0];
        const selection = contents.window.getSelection();
        const selecao = selection.toString().trim();
        const selectionIsActive = selection.rangeCount > 0 && !selection.isCollapsed;

        // Se a seleção ainda está ativa ou acabou de ocorrer, não navega.
        if (selectionIsActive || selecao.length > 0 || isSelectingText || Date.now() - lastSelectionAt < 800) return;

        const screenWidth = contents.window.innerWidth;
        const clickX = e.clientX;

        if (clickX < screenWidth / 2) {
            currentRendition.prev();
        } else {
            currentRendition.next();
        }
    });

    // Lógica Inteligente de Captura para a IA (Mantida igual)
    let timeoutSelecao;
    currentRendition.on("selected", function (cfiRange, contents) {
        isSelectingText = true;
        lastSelectionAt = Date.now();
        clearTimeout(selectionGuardTimer);
        selectionGuardTimer = setTimeout(() => {
            isSelectingText = false;
        }, 800);

        clearTimeout(timeoutSelecao); 
        timeoutSelecao = setTimeout(async () => {
            const range = await book.getRange(cfiRange);
            const textoSelecionado = range.toString().trim();

            if (textoSelecionado) {
                const selection = contents.window.getSelection();
                const node = selection.anchorNode;
                const paragrafoContexto = node ? node.parentElement?.textContent?.trim() || "" : "";
                
                contents.window.getSelection().removeAllRanges();
                currentRendition.annotations.highlight(cfiRange, {}, (e) => {});
                
                const token = localStorage.getItem('token');
                
                document.getElementById('modalOverlay').style.display = 'block';
                document.getElementById('termo-box').innerText = textoSelecionado;
                document.getElementById('explicacao-box').innerText = "Analisando contexto...";
                document.getElementById('btnSalvarCard').style.display = 'none';

                try {
                    const response = await fetch('/api/explicar', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ termo: textoSelecionado, contexto: paragrafoContexto })
                    });
                    const data = await response.json();
                    
                    if (response.ok) {
                        const explicacaoFormatada = renderizarAnalise(data);
                        termoAtual = textoSelecionado; contextoAtual = paragrafoContexto; explicacaoAtual = explicacaoFormatada; cfiAtual = cfiRange; 
                        
                        const btnSalvar = document.getElementById('btnSalvarCard');
                        btnSalvar.style.display = 'block'; 
                        btnSalvar.innerText = "Salvar Palavra";
                        btnSalvar.disabled = false; 
                    } else {
                        document.getElementById('explicacao-box').innerText = "Erro: " + data.erro;
                    }
                } catch (error) {
                    document.getElementById('explicacao-box').innerText = "Erro de conexão com a API.";
                }
            }
            isSelectingText = false;
        }, 400);
    });
}

async function renderizarPdf(caminhoUrl) {
    if (currentRendition) currentRendition.destroy();
    pdfAtual = null;
    const viewer = document.getElementById('viewer');
    viewer.classList.add('pdf-mode');
    viewer.innerHTML = '<p style="text-align:center; padding:20px;">Carregando PDF...</p>';
    document.getElementById('controls').style.display = 'block';
    document.getElementById('epub-controls-hint').style.display = 'none';
    document.getElementById('pdf-controls').style.display = 'flex';
    document.getElementById('pdf-page-counter').innerText = 'Página 1';

    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    pdfAtual = await pdfjsLib.getDocument(window.location.origin + caminhoUrl).promise;
    tituloLivroAtual = caminhoUrl.split('/').pop() || 'Livro PDF';
    paginaPdfAtual = 1;
    await renderizarPaginaPdf(paginaPdfAtual);
}

async function renderizarPaginaPdf(pageNumber) {
    if (!pdfAtual || pageNumber < 1 || pageNumber > pdfAtual.numPages) return;

    const viewer = document.getElementById('viewer');
    viewer.innerHTML = '<p style="text-align:center; padding:20px;">Carregando página...</p>';
    const page = await pdfAtual.getPage(pageNumber);
    const tamanhoOriginal = page.getViewport({ scale: 1 });
    const escalaHorizontal = (viewer.clientWidth - 24) / tamanhoOriginal.width;
    const escalaVertical = (viewer.clientHeight - 24) / tamanhoOriginal.height;
    const scale = Math.min(1.6, escalaHorizontal, escalaVertical);
    const viewport = page.getViewport({ scale });
    const pageElement = document.createElement('div');
    pageElement.className = 'pdf-page';
    pageElement.dataset.pageNumber = pageNumber;

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    pageElement.appendChild(canvas);
    viewer.innerHTML = '';
    viewer.appendChild(pageElement);
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

    const textContent = await page.getTextContent();
    const textLayer = document.createElement('div');
    textLayer.className = 'pdf-text-layer textLayer';
    textLayer.dataset.hasText = String(textContent.items.length > 0);

    if (textContent.items.length > 0) {
        const textDivs = [];
        const renderTask = pdfjsLib.renderTextLayer({
            textContent,
            container: textLayer,
            viewport,
            textDivs
        });
        await renderTask.promise;
    } else {
        const ocrStatus = document.createElement('div');
        ocrStatus.className = 'pdf-ocr-status';
        ocrStatus.innerText = 'Reconhecendo texto da página...';
        pageElement.appendChild(ocrStatus);
    }

    pageElement.appendChild(textLayer);
    pageElement.addEventListener('mouseup', () => processarSelecaoPdf(pageElement));
    pageElement.addEventListener('touchend', () => processarSelecaoPdf(pageElement));

    if (textContent.items.length === 0) {
        reconhecerTextoPdf(pageElement, canvas);
    }

    paginaPdfAtual = pageNumber;
    document.getElementById('pdf-page-counter').innerText = `Página ${pageNumber} de ${pdfAtual.numPages}`;
    document.getElementById('prevBtn').disabled = pageNumber === 1;
    document.getElementById('nextBtn').disabled = pageNumber === pdfAtual.numPages;
}

function renderizarAnalise(data) {
    const caixa = document.getElementById('explicacao-box');
    const analise = data.analise;

    if (!analise) {
        caixa.innerText = data.explicacao || 'Não foi possível gerar a análise.';
        return data.explicacao || '';
    }

    const secoes = [
        ['Tradução neste contexto', analise.traducao],
        ['Sentido na passagem', analise.sentido_no_contexto],
        ['Função na cena', analise.papel_na_passagem],
        ['Em outras palavras', analise.parafrase]
    ];

    caixa.innerHTML = '';
    secoes.forEach(([titulo, texto]) => {
        const bloco = document.createElement('div');
        bloco.className = 'analise-item';
        const cabecalho = document.createElement('strong');
        cabecalho.innerText = titulo;
        const conteudo = document.createElement('p');
        conteudo.innerText = texto;
        bloco.append(cabecalho, conteudo);
        caixa.appendChild(bloco);
    });

    return secoes.map(([titulo, texto]) => `${titulo}: ${texto}`).join('\n\n');
}

function processarSelecaoPdf(pageElement) {
    const selecao = window.getSelection().toString().trim();
    if (!selecao) return;

    const textoDoTexto = pageElement.querySelector('.pdf-text-layer');
    const textoDaPagina = textoDoTexto?.dataset.pageText || textoDoTexto?.innerText.trim() || '';

    if (!textoDaPagina || textoDoTexto?.dataset.hasText !== 'true') return;
    abrirAnaliseTermo(selecao, textoDaPagina, `pdf-page-${pageElement.dataset.pageNumber}`);
    window.getSelection().removeAllRanges();
}

async function reconhecerTextoPdf(pageElement, canvas) {
    const textLayer = pageElement.querySelector('.pdf-text-layer');
    const ocrStatus = pageElement.querySelector('.pdf-ocr-status');

    if (!textLayer || !ocrStatus || ocrStatus.dataset.processing === 'true') return;

    ocrStatus.dataset.processing = 'true';

    try {
        const ocrScale = 2;
        const ocrCanvas = document.createElement('canvas');
        ocrCanvas.width = canvas.width * ocrScale;
        ocrCanvas.height = canvas.height * ocrScale;
        const ocrContext = ocrCanvas.getContext('2d', { alpha: false });
        ocrContext.fillStyle = '#ffffff';
        ocrContext.fillRect(0, 0, ocrCanvas.width, ocrCanvas.height);
        ocrContext.drawImage(canvas, 0, 0, ocrCanvas.width, ocrCanvas.height);

        const resultado = await Tesseract.recognize(ocrCanvas, 'por+eng', {
            logger: ({ status, progress }) => {
                if (status === 'recognizing text') {
                    ocrStatus.innerText = `Reconhecendo texto... ${Math.round(progress * 100)}%`;
                }
            }
        });

        textLayer.innerHTML = '';
        const palavras = resultado.data.words.filter(word => word.text.trim() && word.confidence >= 35);
        textLayer.dataset.hasText = String(palavras.length > 0);
        textLayer.dataset.pageText = resultado.data.text.trim();

        palavras.forEach(word => {
            const span = document.createElement('span');
            const esquerda = word.bbox.x0 / ocrScale;
            const topo = word.bbox.y0 / ocrScale;
            const largura = Math.max(1, (word.bbox.x1 - word.bbox.x0) / ocrScale);
            const altura = Math.max(1, (word.bbox.y1 - word.bbox.y0) / ocrScale);
            span.textContent = `${word.text} `;
            span.style.left = `${esquerda}px`;
            span.style.top = `${topo}px`;
            span.style.width = `${largura}px`;
            span.style.height = `${altura}px`;
            span.style.fontSize = `${altura}px`;
            span.style.lineHeight = `${altura}px`;
            textLayer.appendChild(span);
        });

        ocrStatus.remove();
    } catch (error) {
        console.error('Erro no OCR do PDF:', error);
        ocrStatus.dataset.processing = 'false';
        ocrStatus.innerText = 'Não foi possível reconhecer o texto desta página.';
    }
}

async function abrirAnaliseTermo(textoSelecionado, paragrafoContexto, cfi) {
    const token = localStorage.getItem('token');
    document.getElementById('modalOverlay').style.display = 'block';
    document.getElementById('termo-box').innerText = textoSelecionado;
    document.getElementById('explicacao-box').innerText = 'Analisando contexto...';
    document.getElementById('btnSalvarCard').style.display = 'none';

    try {
        const response = await fetch('/api/explicar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ termo: textoSelecionado, contexto: paragrafoContexto })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.erro);
        const explicacaoFormatada = renderizarAnalise(data);
        termoAtual = textoSelecionado;
        contextoAtual = paragrafoContexto;
        explicacaoAtual = explicacaoFormatada;
        cfiAtual = cfi;
        const btnSalvar = document.getElementById('btnSalvarCard');
        btnSalvar.style.display = 'block';
        btnSalvar.innerText = 'Salvar Palavra';
        btnSalvar.disabled = false;
    } catch (error) {
        document.getElementById('explicacao-box').innerText = `Erro: ${error.message}`;
    }
}

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

const modalOverlay = document.getElementById('modalOverlay');
function fecharModal() { modalOverlay.style.display = 'none'; }
document.getElementById('closeModal').addEventListener('click', fecharModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) fecharModal(); });

// ==========================================
// 6. NAVEGAÇÃO DE PÁGINAS DO LEITOR
// ==========================================
document.getElementById('prevBtn').addEventListener('click', () => {
    if (pdfAtual) renderizarPaginaPdf(paginaPdfAtual - 1);
    else if (currentRendition) currentRendition.prev();
});
document.getElementById('nextBtn').addEventListener('click', () => {
    if (pdfAtual) renderizarPaginaPdf(paginaPdfAtual + 1);
    else if (currentRendition) currentRendition.next();
});
document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') {
        if (pdfAtual) renderizarPaginaPdf(paginaPdfAtual - 1);
        else if (currentRendition) currentRendition.prev();
    }
    if (e.key === 'ArrowRight') {
        if (pdfAtual) renderizarPaginaPdf(paginaPdfAtual + 1);
        else if (currentRendition) currentRendition.next();
    }
});

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
    navLeitor.style.borderBottom = '2px solid white'; navLeitor.style.color = 'white';
    navVocab.style.borderBottom = 'none'; navVocab.style.color = '#ccc';
});

navVocab.addEventListener('click', () => {
    screenReader.style.display = 'none'; screenVocab.style.display = 'block'; screenGame.style.display = 'none';
    navVocab.style.borderBottom = '2px solid white'; navVocab.style.color = 'white';
    navLeitor.style.borderBottom = 'none'; navLeitor.style.color = '#ccc';
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
let perguntasJogo = []; let perguntaAtualIndex = 0;
const btnIniciarJogo = document.getElementById('btnIniciarJogo');
const btnSairJogo = document.getElementById('btnSairJogo');
const gameLoading = document.getElementById('game-loading');
const gameContent = document.getElementById('game-content');
const gameFeedback = document.getElementById('game-feedback');
const botoesOpcao = document.querySelectorAll('.game-opt');

btnIniciarJogo.addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    screenVocab.style.display = 'none'; screenGame.style.display = 'flex';
    gameLoading.style.display = 'block'; gameContent.style.display = 'none'; gameFeedback.style.display = 'none';

    try {
        const response = await fetch('/api/minigame/gerar', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await response.json();
        if (response.ok) {
            perguntasJogo = data.quiz; perguntaAtualIndex = 0;
            gameLoading.style.display = 'none'; mostrarPergunta(); 
        } else {
            alert(data.erro); navVocab.click(); 
        }
    } catch (error) { alert("Erro ao gerar o jogo."); navVocab.click(); }
});

btnSairJogo.addEventListener('click', () => { navVocab.click(); });

function mostrarPergunta() {
    gameFeedback.style.display = 'none'; gameContent.style.display = 'block';
    const perguntaAtual = perguntasJogo[perguntaAtualIndex];
    document.getElementById('game-pergunta').innerText = perguntaAtual.pergunta;
    botoesOpcao.forEach((botao, index) => {
        botao.innerText = perguntaAtual.opcoes[index];
        botao.onclick = () => verificarResposta(index);
    });
}

function verificarResposta(indiceEscolhido) {
    gameContent.style.display = 'none'; gameFeedback.style.display = 'block';
    const perguntaAtual = perguntasJogo[perguntaAtualIndex];
    const acertou = (indiceEscolhido === perguntaAtual.resposta_correta);
    const titulo = document.getElementById('feedback-titulo');
    const texto = document.getElementById('feedback-texto');

    if (acertou) { titulo.innerText = "🎉 Correto!"; titulo.style.color = "#28a745"; } 
    else { titulo.innerText = "❌ Incorreto!"; titulo.style.color = "#dc3545"; }
    texto.innerText = perguntaAtual.explicacao;
}

document.getElementById('btnProximaPergunta').addEventListener('click', () => {
    perguntaAtualIndex++;
    if (perguntaAtualIndex < perguntasJogo.length) mostrarPergunta();
    else { alert("🏆 Fim do jogo!"); navVocab.click(); }
});
