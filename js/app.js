// ==================
// Variables principales
// ==================
const hero = document.getElementById('hero');
const menuSection = document.getElementById('menu');
const menuLink = document.getElementById('menuLink');

const loginModal = document.getElementById('loginModal');
const usuarioLink = document.getElementById('usuarioLink');
const closeBtn = document.querySelector('.close');

// ==================
// Mostrar/Ocultar Menú
// ==================
menuLink.addEventListener('click', (e) => {
  e.preventDefault();
  hero.classList.add('hidden');   // Oculta el hero
  menuSection.classList.remove('hidden'); // Muestra el menú
  window.scrollTo({ top: menuSection.offsetTop, behavior: 'smooth' });
});

// ==================
// Modal Login
// ==================
usuarioLink.addEventListener('click', (e) => {
  e.preventDefault();
  loginModal.style.display = 'flex';
});

closeBtn.addEventListener('click', () => {
  loginModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === loginModal) {
    loginModal.style.display = 'none';
  }
});

// ==================
// Demo: Botón Agregar (por ahora solo loguea)
// ==================
const addButtons = document.querySelectorAll('.card button');
addButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    alert('Producto agregado al carrito (demo Sprint 3)');
  });
});
