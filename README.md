# Frontend Venda de Livros

Estava precisando vender meus livros e então criei em uma tarde essa página responsiva simples para exibir livros à venda. Cada livro mostra nome, autor, preço, status, estado e foto. Há um botão **QUERO** que, ao ser clicado, abre um modal para o comprador informar nome e mensagem.

Quando o formulário é enviado, uma nova aba do WhatsApp é aberta com mensagem pré-formatada e o status do livro muda para **Vendido** e o botão fica inativo.

### Endpoints disponíveis
- `GET /api/books` – lista todos os livros.
- `POST /api/books` – adiciona um novo livro. Exemplo de corpo JSON:
  ```json
  {
    "name": "Título",
    "author": "Autor",
    "price": "R$ 10,00",
    "status": "Disponível",
    "condition": "Novo",
    "photo": "images/arquivo.jpg"
  }
  ```
  O servidor atribui automaticamente um `id`.
- `PUT /api/books/:id` – atualiza campos de um livro existente. Envie apenas os atributos que deseja mudar.
- `POST /api/books/:id/sell` – marca um livro como vendido (usado pelo front‑end quando o formulário é enviado).

> Você pode testar essas rotas com `curl`, `Postman` ou outro cliente HTTP.

## Estrutura de arquivos
- `index.html` – marcação básica e modal
- `styles.css` – estilos responsivos
- `script.js` – lógica front-end (busca de livros no backend)
- `server.js` – servidor Express simples
- `books.json` – dados persistidos dos livros
- `package.json` – dependências Node.js

Fique livre para personalizar o visual e funcionalidades adicionais!
