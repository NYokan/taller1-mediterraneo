/* =========================
   Selección de elementos
========================= */
const homeView   = document.getElementById('home');
const menuView   = document.getElementById('menu');

const homeLink     = document.getElementById('homeLink');
const menuLink     = document.getElementById('menuLink');
const nosotrosLink = document.getElementById('nosotrosLink');
const usuarioLink  = document.getElementById('usuarioLink');

const navLinks = [menuLink, nosotrosLink, usuarioLink];

/* Modales (Sprint 2) */
const loginModal    = document.getElementById('loginModal');
const registroModal = document.getElementById('registroModal');
const closeBtns     = document.querySelectorAll('.close');
const goToRegistro  = document.getElementById('goToRegistro');

// Botón confirmar pedido en carrito
const confirmarBtn = document.querySelector(".btn-confirmar-pedido");
const pagoView = document.getElementById("pago");
const pedidoView = document.getElementById("pedido");

/* =========================
   Navegación de vistas
========================= */
function setActive(link) {
  navLinks.forEach(a => {
    if (a) a.classList.remove('is-active');
  });
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
if (homeLink) {
  homeLink.addEventListener('click', (e) => { e.preventDefault(); showHome(); });
}
if (menuLink) {
  menuLink.addEventListener('click', (e) => { e.preventDefault(); showMenu(); });
}
if (nosotrosLink) {
  nosotrosLink.addEventListener('click', (e) => { e.preventDefault(); showHome(); });
}

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
let pedidoItems = []; // lista de productos en el carrito

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

// Mostrar menú si la URL tiene #menu
if (window.location.hash === '#menu') {
  showMenu();
}

// Botón confirmar pedido en carrito
if (confirmarBtn) {
  confirmarBtn.addEventListener("click", () => {
    pedidoView.classList.add("is-hidden");
    pagoView.classList.remove("is-hidden");
  });
}

// Formulario de pago
const pagoForm = document.getElementById("pagoForm");
if (pagoForm) {
  pagoForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const direccion = document.getElementById("direccion").value.trim();
    const metodo = document.getElementById("metodo").value;

    if (!nombre || !direccion || !metodo) {
      alert("⚠️ Por favor completa todos los campos antes de continuar.");
      return;
    }

    // Ocultar vista de pago
    document.getElementById("pago").classList.add("is-hidden");

    // Mostrar boleta
    generarBoleta();

    document.getElementById("boleta").classList.remove("is-hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Vaciar carrito después de mostrar boleta
    pedidoItems = [];
    actualizarPedido();
  });
}

// Botón cancelar pago
const cancelarPago = document.getElementById("cancelarPago");
if (cancelarPago) {
  cancelarPago.addEventListener("click", () => {
    document.getElementById("pago").classList.add("is-hidden");
    document.getElementById("pedido").classList.remove("is-hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
// Simular envío de pago
// (Código duplicado eliminado. El evento submit ya está manejado arriba.)
    document.getElementById("home").classList.remove("is-hidden");
  });
}

// Botón Confirmar pedido
const confirmarPedidoBtn = document.getElementById("confirmarPedidoBtn");
if (confirmarPedidoBtn) {
  confirmarPedidoBtn.addEventListener("click", () => {
    // Ocultar la vista de pedido
    document.getElementById("pedido").classList.add("is-hidden");
    // Mostrar la vista de pago
    document.getElementById("pago").classList.remove("is-hidden");

    // Opcional: resetear scroll para que el usuario vea el formulario desde arriba
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Generar boleta
function generarBoleta() {
  const boletaItems = document.getElementById("boletaItems");
  const boletaTotal = document.getElementById("boletaTotal");
  const boletaFecha = document.getElementById("boletaFecha");

  // Fecha actual
  const fecha = new Date();
  boletaFecha.textContent = `Fecha: ${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}`;

  // Limpiar tabla
  boletaItems.innerHTML = "";

  let total = 0;

  if (pedidoItems.length === 0) {
    boletaItems.innerHTML = `<tr><td colspan="4">No hay productos en la boleta</td></tr>`;
    boletaTotal.textContent = "$0";
    return;
  }

  // Llenar tabla con productos
  pedidoItems.forEach(item => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;

    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${item.nombre}</td>
      <td>${item.cantidad}</td>
      <td>$${item.precio.toLocaleString()}</td>
      <td>$${subtotal.toLocaleString()}</td>
    `;
    boletaItems.appendChild(fila);
  });

  // Mostrar total
  boletaTotal.textContent = `$${total.toLocaleString()}`;
}

const volverInicio = document.getElementById("volverInicio");
if (volverInicio) {
  volverInicio.addEventListener("click", () => {
    document.getElementById("boleta").classList.add("is-hidden");
    document.getElementById("home").classList.remove("is-hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
