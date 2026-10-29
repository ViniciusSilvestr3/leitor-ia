# Banco de dados

O projeto utiliza SQLite por meio do pacote `sqlite3`. O arquivo local é `banco.sqlite`, inicializado ou atualizado quando o servidor é iniciado.

## Entidade `usuarios`

Armazena as contas da aplicação, incluindo:

- Identificador do usuário.
- Nome.
- E-mail.
- Hash da senha.
- Data de criação.

## Entidade `flashcards`

Armazena o vocabulário associado ao usuário, incluindo:

- Identificador do flashcard.
- Identificador do usuário.
- Título do livro.
- Termo original.
- Contexto do trecho.
- Tradução.
- Explicação gerada pela IA.
- CFI ou posição do trecho quando disponível.
- Data de criação.

## Relacionamento

Cada flashcard pertence a um usuário por meio de `usuario_id`. As consultas e exclusões são filtradas pelo usuário autenticado para evitar acesso aos flashcards de outras contas.

## Persistência da análise

Durante a análise contextual, a resposta estruturada do Gemini pode ser usada para persistir o vocabulário. A estrutura separa o termo, a tradução, a explicação e o contexto, facilitando a exibição no frontend e a criação do minigame.

