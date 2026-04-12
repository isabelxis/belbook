let books = []; // será carregado do backend

const bookListEl = document.getElementById('book-list');
const modal = document.getElementById('contact-modal');
const closeModalBtn = document.getElementById('close-modal');
const contactForm = document.getElementById('contact-form');
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'
        : 'https://belbook.onrender.com';
let selectedBook = null;

function renderBooks() {
    bookListEl.innerHTML = '';
    books.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';

        const img = document.createElement('img');
        img.src = book.photo;
        img.alt = `Foto do livro ${book.name}`;
        card.appendChild(img);

        const info = document.createElement('div');
        info.className = 'book-info';

        const title = document.createElement('h3');
        title.textContent = book.name;
        info.appendChild(title);

        const authorP = document.createElement('p');
        const authorEm = document.createElement('em');
        authorEm.textContent = book.author || 'Autor desconhecido';
        authorP.appendChild(authorEm);
        info.appendChild(authorP);

        const priceP = document.createElement('p');
        priceP.className = 'price';
        priceP.textContent = book.price;
        info.appendChild(priceP);

        const statusP = document.createElement('p');
        statusP.innerHTML = 'Status: <span class="status"></span>';
        statusP.querySelector('.status').textContent = book.status;
        info.appendChild(statusP);

        const conditionP = document.createElement('p');
        conditionP.textContent = `Estado: ${book.condition}`;
        info.appendChild(conditionP);

        card.appendChild(info);

        const btn = document.createElement('button');
        btn.className = 'btn-quero';
        btn.textContent = 'QUERO';
        if (book.status !== 'Disponível') btn.disabled = true;
        btn.addEventListener('click', () => openModal(book));
        card.appendChild(btn);

        bookListEl.appendChild(card);
    });
}

function openModal(book) {
    selectedBook = book;
    const nameEl = document.getElementById('modal-book-name');
    if (nameEl) {
        nameEl.textContent = book.name;
    }
    modal.classList.remove('hidden');
}

function closeModal() {
    modal.classList.add('hidden');
    contactForm.reset();
}

closeModalBtn.addEventListener('click', closeModal);
window.addEventListener('click', e => {
    if (e.target === modal) closeModal();
});

// fetch config from server (reads from .env via /api/config)
let WHATSAPP_NUMBER = '';
let CSRF_TOKEN = '';
function loadConfig() {
    return fetch('/api/config', { credentials: 'include' })
        .then(r => r.json())
        .then(cfg => {
            WHATSAPP_NUMBER = cfg.whatsappNumber || '';
            CSRF_TOKEN = cfg.csrfToken || '';
        })
        .catch(err => console.error('Erro carregando config', err));
}

contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('buyer-name').value.trim();
    const msg = document.getElementById('buyer-msg').value.trim();
    if (!selectedBook) return;

    const text = `Quero o livro *${selectedBook.name}*\nPreço: *${selectedBook.price}*\nNome: *${name}*\nMensagem: *${msg}*`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');

    // atualizar status no backend
    fetch(`${API_URL}/api/books/${selectedBook.id}/sell`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': CSRF_TOKEN
        },
        body: JSON.stringify({ buyerName: name, message: msg })
    })
    .then(res => res.json())
    .then(updated => {
        selectedBook.status = updated.status;
        loadBooks();
        closeModal();
    })
    .catch(err => {
        console.error('Erro ao vender livro', err);
        alert('Não foi possível atualizar o status. Tente novamente.');
    });
});

// carrega inicialmente os livros
function loadBooks() {
    fetch(`${API_URL}/api/books`)
        .then(r => r.json())
        .then(data => {
            books = data;
            renderBooks();
        })
        .catch(e => console.error('Erro carregando livros', e));
}

// primeiro carregamos a config, depois os livros
loadConfig().then(loadBooks);
