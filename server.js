const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');

// Variaveis de ambiente do arquivo .env são carregadas aqui
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'books.json');
const API_KEY = (process.env.API_KEY || '').trim();
const csrfProtection = csrf({ cookie: true });

// middleware stack
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // serve frontend files

function readBooks() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        console.error('Erro ao ler arquivo de livros', e);
        return [];
    }
}

function writeBooks(books) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(books, null, 2), 'utf8');
}

function requireApiKey(req, res, next) {
    if (!API_KEY) {
        return res.status(500).json({ error: 'Servidor sem API_KEY configurada' });
    }

    const headerKey = (req.get('x-api-key') || '').trim();
    const authHeader = req.get('authorization') || '';
    const bearerKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    const providedKey = headerKey || bearerKey;

    if (!providedKey || providedKey !== API_KEY) {
        return res.status(401).json({ error: 'API key inválida ou ausente' });
    }

    return next();
}

app.get('/api/books', (req, res) => {
    const books = readBooks();
    res.json(books);
});

app.get('/api/config', csrfProtection, (req, res) => {
    // include csrf token with config
    res.json({
        whatsappNumber: process.env.WHATSAPP_NUMBER || '',
        csrfToken: req.csrfToken(),
    });
});

// marcar um livro como vendido (fluxo público do frontend)
app.post('/api/books/:id/sell', csrfProtection, (req, res) => {
    // csurf middleware will automatically validate token from header/body/cookie
    const id = parseInt(req.params.id, 10);
    const { buyerName, message } = req.body;
    const books = readBooks();
    const book = books.find(b => b.id === id);
    if (!book) {
        return res.status(404).json({ error: 'Livro não encontrado' });
    }
    if (book.status !== 'Disponível') {
        return res.status(400).json({ error: 'Livro já vendido' });
    }
    book.status = 'Vendido';
    writeBooks(books);
    // opcional: você pode gravar o comprador em outro arquivo ou log
    res.json(book);
});

// adicionar um novo livro (requires API key)
app.post('/api/books', requireApiKey, (req, res) => {
    const newBook = req.body;
    if (!newBook.name || !newBook.price) {
        return res.status(400).json({ error: 'Campos name e price são obrigatórios' });
    }
    const books = readBooks();
    // determina o próximo id
    const maxId = books.reduce((m, b) => (b.id > m ? b.id : m), 0);
    newBook.id = maxId + 1;
    books.push(newBook);
    writeBooks(books);
    res.status(201).json(newBook);
});

// atualizar livro existente (requires API key)
app.put('/api/books/:id', requireApiKey, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const updates = req.body;
    const books = readBooks();
    const book = books.find(b => b.id === id);
    if (!book) {
        return res.status(404).json({ error: 'Livro não encontrado' });
    }
    Object.assign(book, updates);
    writeBooks(books);
    res.json(book);
});

// remover um livro (requires API key)
app.delete('/api/books/:id', requireApiKey, (req, res) => {
    const id = parseInt(req.params.id, 10);
    let books = readBooks();
    const index = books.findIndex(b => b.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Livro não encontrado' });
    }
    const [removed] = books.splice(index, 1);
    writeBooks(books);
    // opcionalmente retornamos o recurso excluído
    res.json(removed);
});

app.use((err, req, res, next) => {
    if (err && err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({ error: 'Token CSRF inválido ou ausente' });
    }
    return next(err);
});

app.listen(PORT, () => {
    if (!API_KEY) {
        console.warn('Aviso: API_KEY não configurada. Rotas administrativas retornarão erro 500.');
    }
    console.log(`Servidor iniciado em http://localhost:${PORT}`);
});
