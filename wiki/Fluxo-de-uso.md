# Fluxo de uso

1. O usuário acessa a aplicação em um navegador.
2. Cria uma conta ou informa suas credenciais na tela de login.
3. O backend valida os dados e retorna um token JWT.
4. O usuário seleciona um arquivo EPUB ou PDF.
5. O navegador processa o arquivo localmente.
6. O usuário seleciona uma palavra ou trecho.
7. O frontend captura o texto, o contexto, o título do livro, a posição quando disponível e o idioma escolhido.
8. O frontend envia esses dados para a rota autenticada `/api/explicar`.
9. O controller valida o payload e chama o service do Gemini.
10. O Gemini retorna os dados estruturados da análise.
11. O frontend exibe o termo, a tradução e a explicação.
12. A análise pode ser persistida como flashcard.
13. O usuário consulta seus flashcards ou gera um minigame de revisão.

O arquivo EPUB ou PDF permanece no navegador durante esse processo. Somente informações textuais necessárias para a análise são enviadas à API.

