# Funcionalidades

## Autenticação

O usuário pode criar uma conta e realizar login. Após a autenticação, o backend fornece um token JWT utilizado nas rotas protegidas.

## Leitura de EPUB e PDF

Os arquivos são selecionados pelo usuário e processados no navegador. EPUB utiliza epub.js e JSZip; PDF utiliza PDF.js, canvas e uma camada de texto que permite selecionar o conteúdo.

## Análise contextual

Ao selecionar um termo ou trecho, o frontend captura o contexto e envia uma requisição autenticada para `/api/explicar`. O backend chama o Google Gemini e retorna uma resposta JSON com os dados da análise.

## Idiomas

O usuário pode selecionar o idioma de saída da tradução e da explicação entre:

- Português.
- Inglês.
- Espanhol.

## Flashcards

Os dados retornados pela análise podem ser persistidos para o usuário autenticado. Os flashcards armazenam o termo, o contexto, a explicação, o livro e a posição do trecho quando disponível.

## Consulta e exclusão

O usuário pode listar seus flashcards e excluir registros pertencentes à própria conta.

## Minigame

O sistema utiliza os flashcards do usuário para solicitar ao Gemini perguntas de revisão em formato JSON.

## Interface

A interface possui tema claro e escuro, navegação entre leitura, vocabulário e minigame e controles específicos para navegação nas páginas de PDF.

