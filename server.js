const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

// Variaveis de ambiente do arquivo .env são carregadas aqui
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'books.json');

app.use(cors());
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

app.get('/api/books', (req, res) => {
    const books = readBooks();
    res.json(books);
});

app.get('/api/config', (req, res) => {
    res.json({ whatsappNumber: process.env.WHATSAPP_NUMBER || '' });
});

// marca um livro como vendido
app.post('/api/books/:id/sell', (req, res) => {
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

// adicionar um novo livro
app.post('/api/books', (req, res) => {
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

// atualizar livro existente
app.put('/api/books/:id', (req, res) => {
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

// remover um livro
app.delete('/api/books/:id', (req, res) => {
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

app.listen(PORT, () => {
    console.log(`Servidor iniciado em http://localhost:${PORT}`);
});