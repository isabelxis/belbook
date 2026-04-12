# Belbook

Aplicação web para venda de livros usados, com catálogo visual, contato por WhatsApp e atualização de status de venda.

O projeto combina:
- frontend estático (`index.html`, `styles.css`, `script.js`)
- backend em Node.js + Express (`server.js`)
- persistência em MongoDB (via Mongoose)

## Funcionalidades

- Listagem de livros com foto, autor, preço, estado e status.
- Botão **QUERO** por livro, com modal para nome e mensagem.
- Redirecionamento automático para o WhatsApp com mensagem pré-formatada.
- Mudança de status para `Vendido` após envio do formulário.
- Endpoints para listar, criar e atualizar livros.

## Arquitetura atual

- O frontend escolhe a API automaticamente:
  - `http://localhost:3000` quando roda localmente (`localhost`/`127.0.0.1`)
  - `https://belbook.onrender.com` em produção
- O backend expõe:
  - arquivos estáticos da raiz do projeto
  - API REST em `/api/*`
- O backend exige conexão MongoDB via `MONGO_URI`.

## Requisitos

- Node.js 18+
- npm
- MongoDB acessível (local ou Atlas)

## Variáveis de ambiente

Variáveis usadas pelo backend:

- `MONGO_URI` (obrigatória): string de conexão do MongoDB.
- `WHATSAPP_NUMBER` (opcional): número no formato internacional, sem `+` (ex: `5511999999999`).
- `CSRF_TOKEN` (opcional, mas recomendado): token exigido no endpoint de venda.
- `PORT` (opcional): porta HTTP (padrão `3000`).

Exemplo:

```bash
export MONGO_URI='mongodb+srv://usuario:senha@cluster/db'
export WHATSAPP_NUMBER='5511999999999'
export CSRF_TOKEN='seu_token_forte'
npm start
```

Observação importante: o projeto não carrega `.env` automaticamente (não usa `dotenv` no código). Se quiser usar o arquivo `.env`, carregue as variáveis antes de iniciar o servidor.

## Como rodar localmente

1. Instale dependências:

```bash
npm install
```

2. Exporte as variáveis de ambiente (principalmente `MONGO_URI`).

3. Inicie o servidor:

```bash
npm start
```

4. Acesse:

- `http://localhost:3000`

## Popular banco com `books.json`

Use o script de seed para importar os livros do arquivo `books.json`:

```bash
MONGO_URI='mongodb+srv://usuario:senha@cluster/db' node seed.js
```

O script remove todos os livros existentes antes de inserir os novos.

## Docker

Build da imagem:

```bash
docker build -t belbook .
```

Execução (passando variáveis de ambiente):

```bash
docker run --rm -p 3000:3000 \
  -e MONGO_URI='mongodb+srv://usuario:senha@cluster/db' \
  -e WHATSAPP_NUMBER='5511999999999' \
  -e CSRF_TOKEN='seu_token_forte' \
  belbook
```

## API

### `GET /api/config`
Retorna configurações públicas consumidas pelo frontend.

Resposta esperada:

```json
{
  "whatsappNumber": "5511999999999",
  "csrfToken": "..."
}
```

### `GET /api/books`
Lista todos os livros ordenados por `id` crescente.

### `POST /api/books/:id/sell`
Marca o livro como vendido.

Regras:
- exige header `X-CSRF-Token` igual ao `CSRF_TOKEN` do servidor
- falha com `404` se livro não existir
- falha com `400` se já estiver vendido

Exemplo:

```bash
curl -X POST http://localhost:3000/api/books/9/sell \
  -H 'X-CSRF-Token: seu_token_forte' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

### `POST /api/books`
Cria um novo livro.

Regras:
- `name` e `price` são obrigatórios
- `id` é gerado automaticamente (último id + 1)

Exemplo:

```bash
curl -X POST http://localhost:3000/api/books \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Novo Livro",
    "author": "Autor",
    "price": "R$ 25,00",
    "status": "Disponível",
    "condition": "Ótimo",
    "photo": "images/capa.jpeg"
  }'
```

### `PUT /api/books/:id`
Atualiza campos de um livro existente.

Exemplo:

```bash
curl -X PUT http://localhost:3000/api/books/9 \
  -H 'Content-Type: application/json' \
  -d '{ "price": "R$ 20,00", "condition": "Bom" }'
```

## CORS

O backend está configurado com CORS para `https://isabelxis.github.io`.

## Estrutura do projeto

- `index.html`: layout e modal de contato
- `styles.css`: estilo responsivo
- `script.js`: renderização dos cards e integração com API/WhatsApp
- `server.js`: API Express + conexão MongoDB
- `seed.js`: importação de `books.json` para MongoDB
- `books.json`: base inicial de livros
- `images/`: capas/fotos dos livros
- `Dockerfile`: containerização da aplicação
- `.github/workflows/static.yml`: deploy de conteúdo estático para GitHub Pages

## Script disponível

- `npm start`: inicia o servidor (`node server.js`)

## Telas

<img width="933" height="656" alt="image" src="https://github.com/user-attachments/assets/a03d75a6-a807-4e25-8066-1e0837bff17e" />
<img width="790" height="510" alt="image" src="https://github.com/user-attachments/assets/4f89c310-ff24-43e8-929b-0ce95c94c581" />
<img width="880" height="630" alt="image" src="https://github.com/user-attachments/assets/0c9676cf-94e5-44dd-b61b-7ee62c03a665" />


Fique livre para personalizar o visual e funcionalidades adicionais!
