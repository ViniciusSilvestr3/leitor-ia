// ==========================================
// 1. VARIÁVEIS GLOBAIS
// ==========================================
let currentRendition;
let termoAtual = "";
let contextoAtual = "";
let explicacaoAtual = "";

// ==========================================
// 2. UPLOAD DO LIVRO
// ==========================================
document.getElementById('uploadBtn').addEventListener('click', async () => {
    const fileInput = document.getElementById('epubInput');
    const file = fileInput.files[0];

    if (!file) {
        alert("Por favor, selecione um arquivo .epub primeiro!");
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        alert("Acesso negado: Você precisa estar logado para abrir um livro.");
        return;
    }

    const formData = new FormData();
    formData.append('livro', file);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Upload concluído! Caminho:", data.caminho);
            renderizarLivro(data.caminho);
        } else {
            alert("Erro no upload: " + data.erro);
        }
    } catch (error) {
        console.error("Erro ao enviar arquivo:", error);
    }
});

// ==========================================
// 3. RENDERIZAR O LIVRO E ACIONAR A IA
// ==========================================
function renderizarLivro(caminhoUrl) {
    const urlCompleta = window.location.origin + caminhoUrl;
    
    if (currentRendition) {
        currentRendition.destroy();
    }
    document.getElementById('viewer').innerHTML = ''; 
    
    const book = ePub(urlCompleta);
    
    // ATENÇÃO: É esta linha que evita o erro "undefined" que você tomou
    currentRendition = book.renderTo("viewer", {
        width: "100%",
        height: "100%",
        spread: "none",
        allowScriptedContent: true 
    });

    currentRendition.display().then(() => {
        console.log("Livro renderizado com sucesso!");
        document.getElementById('controls').style.display = 'block';
    }).catch((erro) => {
        console.error("Erro ao renderizar:", erro);
    });

    // Lógica do Modal e IA
    currentRendition.on("selected", function (cfiRange, contents) {
        book.getRange(cfiRange).then(async function (range) {
            const textoSelecionado = range.toString().trim();
            
            if (textoSelecionado) {
                const selection = contents.window.getSelection();
                const node = selection.anchorNode;
                const paragrafoContexto = node ? node.parentElement.textContent.trim() : "";

                contents.window.getSelection().removeAllRanges();
                
                const token = localStorage.getItem('token');
                if (!token) {
                    alert("Você precisa estar logado."); 
                    return;
                }

                // Abre o Modal em modo de carregamento
                document.getElementById('modalOverlay').style.display = 'flex';
                document.getElementById('termo-box').innerText = textoSelecionado;
                document.getElementById('explicacao-box').innerText = "A IA está analisando o contexto da obra. Aguarde...";
                document.getElementById('btnSalvarCard').style.display = 'none';

                try {
                    const response = await fetch('/api/explicar', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}` 
                        },
                        body: JSON.stringify({ termo: textoSelecionado, contexto: paragrafoContexto })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        // Resposta recebida, atualiza o modal
                        document.getElementById('explicacao-box').innerText = data.explicacao;
                        
                        termoAtual = textoSelecionado;
                        contextoAtual = paragrafoContexto;
                        explicacaoAtual = data.explicacao;

                        const btnSalvar = document.getElementById('btnSalvarCard');
                        btnSalvar.style.display = 'block';
                        btnSalvar.innerText = "➕ Adicionar aos Flashcards";
                        btnSalvar.disabled = false;
                        btnSalvar.style.backgroundColor = "#28a745";
                    } else {
                        document.getElementById('explicacao-box').innerText = "Erro: " + data.erro;
                    }
                } catch (error) {
                    document.getElementById('explicacao-box').innerText = "Erro de conexão com a API.";
                }
            }
        });
    });
}

// ==========================================
// 4. SALVAR FLASHCARD NO BANCO
// ==========================================
document.getElementById('btnSalvarCard').addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    const botao = document.getElementById('btnSalvarCard');
    
    botao.disabled = true;
    botao.innerText = "Salvando...";

    try {
        const response = await fetch('/api/flashcards/salvar', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ 
                termo: termoAtual, 
                contexto: contextoAtual, 
                explicacao: explicacaoAtual 
            })
        });

        const data = await response.json();

        if (response.ok) {
            botao.innerText = "✔️ Salvo no Vocabulário!";
            botao.style.backgroundColor = "#20c997"; 
        } else {
            alert("Erro ao salvar: " + data.erro);
            botao.disabled = false;
            botao.innerText = "Tentar Novamente";
        }
    } catch (error) {
        alert("Erro de conexão.");
        botao.disabled = false;
    }
});

// ==========================================
// 5. FECHAR O MODAL
// ==========================================
const modalOverlay = document.getElementById('modalOverlay');
const btnFecharX = document.getElementById('closeModal');

function fecharModal() {
    modalOverlay.style.display = 'none';
}

btnFecharX.addEventListener('click', fecharModal);

// Clicar fora da caixa branca fecha o modal
modalOverlay.addEventListener('click', function(event) {
    if (event.target === modalOverlay) {
        fecharModal();
    }
});

// ==========================================
// 6. NAVEGAÇÃO DE PÁGINAS
// ==========================================
document.getElementById('prevBtn').addEventListener('click', () => {
    if (currentRendition) currentRendition.prev();
});

document.getElementById('nextBtn').addEventListener('click', () => {
    if (currentRendition) currentRendition.next();
});

document.addEventListener('keyup', (e) => {
    if (!currentRendition) return; 
    if (e.key === 'ArrowLeft') currentRendition.prev();
    if (e.key === 'ArrowRight') currentRendition.next();
});