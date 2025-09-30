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
usuarioLink.addEventListener('click', (e) => {
  e.preventDefault();
  loginModal.style.display = 'flex';
});

closeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    loginModal.style.display = 'none';
    registroModal.style.display = 'none';
  });
});

window.addEventListener('click', (e) => {
  if (e.target === loginModal)    loginModal.style.display = 'none';
  if (e.target === registroModal) registroModal.style.display = 'none';
});

goToRegistro?.addEventListener('click', (e) => {
  e.preventDefault();
  loginModal.style.display = 'none';
  registroModal.style.display = 'flex';
});

/* =========================
   Botones Agregar (demo S3)
========================= */
document.querySelectorAll('.card button').forEach(btn => {
  btn.addEventListener('click', () => {
    alert('Producto agregado (demo – Sprint 3)');
  });
});
