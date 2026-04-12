const mongoose = require('mongoose');
const books = require('./books.json');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const Book = mongoose.model('Book', new mongoose.Schema({
      id: Number, name: String, author: String,
      price: String, status: String, condition: String, photo: String
    }));
    await Book.deleteMany({});
    await Book.insertMany(books);
    console.log(`${books.length} livros importados com sucesso!`);
    mongoose.disconnect();
  });
