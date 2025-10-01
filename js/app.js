/* =========================
   Selección de elementos
========================= */
const homeView   = document.getElementById('home');
const menuView   = document.getElementById('menu');

const homeLink     = document.getElementById('homeLink');
const menuLink     = document.getElementById('menuLink');
const reservasLink = document.getElementById('reservasLink');
const nosotrosLink = document.getElementById('nosotrosLink');
const usuarioLink  = document.getElementById('usuarioLink');

const navLinks = [reservasLink, menuLink, nosotrosLink, usuarioLink];

/* Modales (Sprint 2) */
const loginModal    = document.getElementById('loginModal');
const registroModal = document.getElementById('registroModal');
const closeBtns     = document.querySelectorAll('.close');
const goToRegistro  = document.getElementById('goToRegistro');

/* =========================
   Navegación de vistas
========================= */
function setActive(link) {
  navLinks.forEach(a => a.classList.remove('is-active'));
  if (link) link.classList.add('is-active');
}

function showHome() {
  homeView.classList.remove('is-hidden');
  menuView.classList.add('is-hidden');
  setActive(null); // Inicio sin activo
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showMenu() {
  homeView.classList.add('is-hidden');
  menuView.classList.remove('is-hidden');
  setActive(menuLink);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* Eventos navbar */
homeLink.addEventListener('click', (e) => { e.preventDefault(); showHome(); });
menuLink.addEventListener('click', (e) => { e.preventDefault(); showMenu(); });

reservasLink.addEventListener('click', (e) => { e.preventDefault(); showHome(); });
nosotrosLink.addEventListener('click', (e) => { e.preventDefault(); showHome(); });

/* =========================
   Modal Login / Registro
========================= */
usuarioLink?.addEventListener('click', (e) => {
  e.preventDefault();
  if (loginModal) loginModal.style.display = 'flex';
});

closeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (loginModal) loginModal.style.display = 'none';
    if (registroModal) registroModal.style.display = 'none';
  });
});

window.addEventListener('click', (e) => {
  if (e.target === loginModal)    loginModal.style.display = 'none';
  if (e.target === registroModal) registroModal.style.display = 'none';
});

goToRegistro?.addEventListener('click', (e) => {
  e.preventDefault();
  if (loginModal) loginModal.style.display = 'none';
  if (registroModal) registroModal.style.display = 'flex';
});

// Carrito en memoria (se puede guardar en localStorage después)
let carrito = [];

// Seleccionar botones de agregar
document.querySelectorAll('.card button').forEach((btn) => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.card');
    const nombre = card.querySelector('h3').textContent;
    const precio = parseInt(card.querySelector('p').textContent.replace('$','').replace('.',''));
    const imagen = card.querySelector('img').getAttribute('src'); // << IMPORTANTE

    // Buscar si ya está en carrito
    const item = carrito.find(p => p.nombre === nombre);
    if(item){
      item.cantidad++;
    } else {
      carrito.push({ nombre, precio, cantidad: 1, imagen });
    }

    actualizarBarraPedido();
  });
});

// Actualizar barra de pedido
function actualizarBarraPedido(){
  const totalItems = carrito.reduce((acc, p) => acc + p.cantidad, 0);
  const totalPrecio = carrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);

  document.getElementById('totalItems').textContent = totalItems;
  document.getElementById('totalPrecio').textContent = totalPrecio.toLocaleString();

  const barra = document.getElementById('barraPedido');
  if(totalItems > 0){
    barra.classList.remove('is-hidden');
  } else {
    barra.classList.add('is-hidden');
  }
  actualizarContadorNavbar();
  guardarCarrito();
}

// Sincroniza el contador del navbar con el carrito
function actualizarContadorNavbar() {
  const totalItems = carrito.reduce((acc, p) => acc + p.cantidad, 0);
  const contador = document.getElementById('contadorCarrito');
  if (contador) contador.textContent = totalItems;
}

// Guarda el carrito en localStorage
function guardarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Cargar carrito al inicio
function cargarCarrito() {
  try {
    carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  } catch {
    carrito = [];
  }
  actualizarBarraPedido();
}

// Redirigir a la página de pedido
document.getElementById('verPedidoBtn').addEventListener('click', () => {
  // Guardamos carrito en localStorage
  localStorage.setItem('carrito', JSON.stringify(carrito));
  window.location.href = "pedido.html"; 
});

// Init
cargarCarrito();

/* =========================
   Modales de Usuario
========================= */
// (Duplicated code removed. All modal logic is handled above.)
