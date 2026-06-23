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
// 0. CONTROLE DE TELA (LOGIN / APLICATIVO)
// ==========================================
let isModoCadastro = false;

// Elementos da UI
const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const tabLogin = document.getElementById('tabLogin');
const tabCadastro = document.getElementById('tabCadastro');
const authNome = document.getElementById('authNome');
const authEmail = document.getElementById('authEmail');
const authSenha = document.getElementById('authSenha');
const btnAuthAction = document.getElementById('btnAuthAction');
const authMessage = document.getElementById('authMessage');

// Função para mostrar mensagens de erro/sucesso na tela
function showMessage(text, isError = true) {
    authMessage.innerText = text;
    authMessage.style.color = isError ? '#dc3545' : '#28a745';
    authMessage.style.display = 'block';
}

// Checagem inicial: O usuário já está logado?
function verificarLoginInicial() {
    const token = localStorage.getItem('token');
    if (token) {
        authScreen.style.display = 'none';
        appScreen.style.display = 'block';
    } else {
        authScreen.style.display = 'flex';
        appScreen.style.display = 'none';
    }
}
verificarLoginInicial(); // Roda assim que a página abre

// Botão de Sair (Logout)
document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.removeItem('token');
    // Limpa o visualizador para não ficar resto de livro na tela
    if (currentRendition) currentRendition.destroy();
    document.getElementById('viewer').innerHTML = ''; 
    verificarLoginInicial();
});

// Alternar entre abas (Entrar / Cadastrar)
tabLogin.addEventListener('click', () => {
    isModoCadastro = false;
    authNome.style.display = 'none';
    btnAuthAction.innerText = 'Entrar';
    tabLogin.style.borderBottom = '3px solid #007bff';
    tabLogin.style.color = '#007bff';
    tabCadastro.style.borderBottom = 'none';
    tabCadastro.style.color = '#888';
    authMessage.style.display = 'none';
});

tabCadastro.addEventListener('click', () => {
    isModoCadastro = true;
    authNome.style.display = 'block';
    btnAuthAction.innerText = 'Criar Conta';
    tabCadastro.style.borderBottom = '3px solid #007bff';
    tabCadastro.style.color = '#007bff';
    tabLogin.style.borderBottom = 'none';
    tabLogin.style.color = '#888';
    authMessage.style.display = 'none';
});

// Validador de E-mail (Regex de Frontend)
function isEmailValido(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Ação principal de Login ou Cadastro
btnAuthAction.addEventListener('click', async () => {
    const nome = authNome.value.trim();
    const email = authEmail.value.trim();
    const senha = authSenha.value.trim();

    // Validações locais
    if (!email || !senha || (isModoCadastro && !nome)) {
        showMessage("Por favor, preencha todos os campos.");
        return;
    }
    
    if (!isEmailValido(email)) {
        showMessage("Digite um formato de e-mail válido.");
        return;
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
                // Cadastro deu certo, muda pra aba de login
                showMessage("Conta criada! Faça login.", false);
                tabLogin.click();
            } else {
                // Login deu certo, salva o token e entra no App
                localStorage.setItem('token', data.token);
                authEmail.value = '';
                authSenha.value = '';
                verificarLoginInicial();
            }
        } else {
            showMessage(data.erro);
        }
    } catch (error) {
        showMessage("Erro de conexão com o servidor.");
    } finally {
        btnAuthAction.disabled = false;
        btnAuthAction.innerText = isModoCadastro ? "Criar Conta" : "Entrar";
    }
});

// (Seu código existente do upload, ePub.js e etc continua daqui para baixo...)
// ==========================================
// 1. VARIÁVEIS GLOBAIS
// ...
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