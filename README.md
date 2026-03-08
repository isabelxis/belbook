# Frontend Venda de Livros

Estava precisando vender meus livros e então criei em uma tarde essa página responsiva simples para exibir livros à venda. Cada livro mostra nome, autor, preço, status, estado e foto. Há um botão **QUERO** que, ao ser clicado, abre um modal para o comprador informar nome e mensagem.

Quando o formulário é enviado, uma nova aba do WhatsApp é aberta com mensagem pré-formatada e o status do livro muda para **Vendido** e o botão fica inativo.

### Endpoints disponíveis
- `GET /api/books` – lista todos os livros.
- `POST /api/books` – adiciona um novo livro (**requer API key**). Exemplo de corpo JSON:
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
- `PUT /api/books/:id` – atualiza campos de um livro existente (**requer API key**). Envie apenas os atributos que deseja mudar.
- `DELETE /api/books/:id` – remove o livro com o identificador informado (**requer API key**); retorna o recurso excluído.
- `POST /api/books/:id/sell` – marca um livro como vendido (usado pelo front‑end quando o formulário é enviado). Requer token CSRF obtido em `/api/config` e enviado no cabeçalho `X-CSRF-Token`.

> **Configuração:** para incluir o número do WhatsApp. Coloque `WHATSAPP_NUMBER=5511999999999` em um arquivo `.env` na raiz ou no ambiente antes de iniciar.
> Defina também `API_KEY` para proteger as rotas administrativas.

> Você pode testar essas rotas com `curl`, `Insomnia` ou outro cliente HTTP.

## Como executar

> Observação de segurança: as requisições que alteram o estado usam proteção CSRF via cookie. O navegador deve permitir cookies de mesmo site; não há autenticação (mas o mecanismo impede sites de terceiros de dispararem comandos).


Configure a variável de ambiente do WhatsApp (por exemplo em `.env`):

```bash
# na raiz do projeto
WHATSAPP_NUMBER=5511999999999
API_KEY=sua-chave-forte-aqui
npm start
```

Se estiver usando Docker, adicione `ENV WHATSAPP_NUMBER=5511999999999`.


### 1. dentro do WSL (Linux)
Se você estiver usando o WSL, **não use o npm do Windows**. instale o Node.js no Linux e execute os comandos a partir da distro:

```bash
# instale Node/npm (exemplo via nvm):
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
source ~/.bashrc
nvm install --lts

# dentro da pasta do projeto
cd /home/isabe/github/belbook
npm install
npm start  # servidor iniciará em http://localhost:3000
```

Se preferir, use `sudo apt install nodejs npm` em vez de nvm, mas jamais misture com o binário do Windows (que fica em `/mnt/c/…`).

### 2. usando Docker
Um `Dockerfile` está incluído; para build e execução:

```bash
docker build -t belbook .          # cria a imagem

docker run --rm -p 3000:3000 belbook
# (opcional, para manter books.json persistente)
# docker run --rm -p 3000:3000 \
#     -v "$(pwd)/books.json:/app/books.json" \
#     belbook
```

Após isso, o app também estará disponível em `http://localhost:3000`.

## Uso da API key
Envie a chave no cabeçalho `x-api-key` (ou `Authorization: Bearer <chave>`) nas rotas administrativas.

Exemplo:

```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -H "x-api-key: sua-chave-forte-aqui" \
  -d '{"name":"Livro","author":"Autor","price":"R$ 10,00","status":"Disponível","condition":"Novo","photo":"images/arquivo.jpg"}'
```

## Estrutura de arquivos
- `index.html` – marcação básica e modal
- `styles.css` – estilos responsivos
- `script.js` – lógica front-end (busca de livros no backend)
- `server.js` – servidor Express simples
- `books.json` – dados persistidos dos livros
- `package.json` – dependências Node.js

Fique livre para personalizar o visual e funcionalidades adicionais!

