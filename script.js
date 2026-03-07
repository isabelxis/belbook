let books = []; // será carregado do backend

const bookListEl = document.getElementById('book-list');
const modal = document.getElementById('contact-modal');
const closeModalBtn = document.getElementById('close-modal');
const contactForm = document.getElementById('contact-form');
let selectedBook = null;

function renderBooks() {
    bookListEl.innerHTML = '';
    books.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <img src="${book.photo}" alt="Foto do livro ${book.name}">
            <div class="book-info">
                <h3>${book.name}</h3>
                <p><em>${book.author || 'Autor desconhecido'}</em></p>
                <p class="price">${book.price}</p>
                <p>Status: <span class="status">${book.status}</span></p>
                <p>Estado: ${book.condition}</p>
            </div>
            <button class="btn-quero" ${book.status !== 'Disponível' ? 'disabled' : ''}>QUERO</button>
        `;
        const btn = card.querySelector('.btn-quero');
        btn.addEventListener('click', () => openModal(book));
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

// read whatsapp number from meta tag
const whatsappMeta = document.querySelector('meta[name="whatsapp-number"]');
const WHATSAPP_NUMBER = whatsappMeta ? whatsappMeta.getAttribute('content') : '';

contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('buyer-name').value.trim();
    const msg = document.getElementById('buyer-msg').value.trim();
    if (!selectedBook) return;

    const text = `Quero o livro *${selectedBook.name}*\nPreço: *${selectedBook.price}*\nNome: *${name}*\nMensagem: *${msg}*`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');

    // atualizar status no backend
    fetch(`/api/books/${selectedBook.id}/sell`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
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
    fetch('/api/books')
        .then(r => r.json())
        .then(data => {
            books = data;
            renderBooks();
        })
        .catch(e => console.error('Erro carregando livros', e));
}

loadBooks();