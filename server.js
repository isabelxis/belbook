const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Conexão com MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB conectado!'))
  .catch(err => console.error('Erro ao conectar MongoDB:', err));

// Schema do livro
const bookSchema = new mongoose.Schema({
  id:        { type: Number, unique: true },
  name:      String,
  author:    String,
  price:     String,
  status:    String,
  condition: String,
  photo:     String
});

const Book = mongoose.model('Book', bookSchema);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Listar todos os livros
app.get('/api/books', async (req, res) => {
  const books = await Book.find().sort({ id: 1 });
  res.json(books);
});

// Marcar livro como vendido
app.post('/api/books/:id/sell', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const book = await Book.findOne({ id });
  if (!book) return res.status(404).json({ error: 'Livro não encontrado' });
  if (book.status !== 'Disponível') return res.status(400).json({ error: 'Livro já vendido' });
  book.status = 'Vendido';
  await book.save();
  res.json(book);
});

// Adicionar novo livro
app.post('/api/books', async (req, res) => {
  const newBook = req.body;
  if (!newBook.name || !newBook.price) {
    return res.status(400).json({ error: 'Campos name e price são obrigatórios' });
  }
  const last = await Book.findOne().sort({ id: -1 });
  newBook.id = last ? last.id + 1 : 1;
  const book = new Book(newBook);
  await book.save();
  res.status(201).json(book);
});

// Atualizar livro existente
app.put('/api/books/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const book = await Book.findOneAndUpdate({ id }, req.body, { new: true });
  if (!book) return res.status(404).json({ error: 'Livro não encontrado' });
  res.json(book);
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado em http://localhost:${PORT}`);
});
