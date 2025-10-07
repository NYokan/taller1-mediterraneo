// ==============================
// Gestión de Productos (Admin)
// ==============================
let productos = JSON.parse(localStorage.getItem("productos")) || [
  { nombre: "Pizza Margarita", precio: 8500, img: "pizz.png" },
  { nombre: "Lasaña Boloñesa", precio: 9200, img: "lasaña.png" }
];

function renderProductos() {
  const tbody = document.getElementById("productosTabla");
  if (!tbody) return;
  tbody.innerHTML = "";

  productos.forEach((p, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><img src="img/${p.img}" alt="${p.nombre}"></td>
      <td>${p.nombre}</td>
      <td>$${p.precio}</td>
      <td>
        <button class="btn-editar" onclick="editarProducto(${i})">Editar</button>
        <button class="btn-eliminar" onclick="eliminarProducto(${i})">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  localStorage.setItem("productos", JSON.stringify(productos));
}

// Agregar producto
const productoForm = document.getElementById("productoForm");
if (productoForm) {
  productoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombreProducto").value.trim();
    const precio = parseInt(document.getElementById("precioProducto").value);
    const img = document.getElementById("imgProducto").value.trim();
    if (!nombre || Number.isNaN(precio) || !img) return;

    productos.push({ nombre, precio, img });
    renderProductos();
    productoForm.reset();
  });
}

// Editar / Eliminar
function editarProducto(index) {
  const nuevoNombre = prompt("Nuevo nombre:", productos[index].nombre);
  const nuevoPrecio = prompt("Nuevo precio:", productos[index].precio);
  const nuevaImg = prompt("Nueva imagen (ruta):", productos[index].img);

  if (nuevoNombre && nuevoPrecio && nuevaImg) {
    productos[index] = { nombre: nuevoNombre, precio: parseInt(nuevoPrecio), img: nuevaImg };
    renderProductos();
  }
}
function eliminarProducto(index) {
  if (confirm("¿Eliminar este producto?")) {
    productos.splice(index, 1);
    renderProductos();
  }
}

function showGestion() {
  document.querySelectorAll(".view").forEach(v => v.classList.add("is-hidden"));
  const g = document.getElementById("gestion");
  if (g) g.classList.remove("is-hidden");
  renderProductos();
  setActive("gestion");
}

// ==============================
// Vistas principales
// ==============================
const homeView = document.getElementById('home');
const menuView = document.getElementById('menu');

// Utilidad
function getNavLinks() {
  return Array.from(document.querySelectorAll('.nav__link'));
}

// Credenciales admin
const ADMIN_EMAIL = "admin@laterraza.cl";
const ADMIN_PASS = "123456";

// ==============================
// Login
// ==============================
function login(email, pass) {
  if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
    localStorage.setItem("userRole", "admin");
    alert("Has iniciado sesión como ADMINISTRADOR");
  } else {
    localStorage.setItem("userRole", "cliente");
    alert("Bienvenido cliente");
  }
  renderNavbar();
  showHome();
}

// ==============================
// Navbar dinámica
// ==============================
function renderNavbar() {
  const nav = document.querySelector(".nav");
  if (!nav) return;
  const role = localStorage.getItem("userRole") || "cliente";

  // Base (cliente) con contador
  nav.innerHTML = `
    <a href="#" class="nav__link" id="menuLink">Menú</a>
    <a href="#" class="nav__link" id="nosotrosLink">Nosotros</a>
    <a href="#" class="nav__link" id="reservasLink">Pedido (<span id="contadorCarrito">0</span>)</a>
    <a href="#" class="nav__link" id="usuarioLink">Usuario</a>
  `;

  // Admin extra
  if (role === "admin") {
    nav.innerHTML += `
      <a href="#" class="nav__link" id="reportesLink">Reportes</a>
      <a href="#" class="nav__link" id="gestionLink">Gestión de Productos</a>
    `;
  }

  setNavListeners();
}

// ==============================
// Listeners Navbar
// ==============================
function setNavListeners() {
  // Limpia duplicados
  getNavLinks().forEach(link => {
    const newLink = link.cloneNode(true);
    link.parentNode.replaceChild(newLink, link);
  });

  const menuLink = document.getElementById("menuLink");
  if (menuLink) menuLink.addEventListener("click", (e) => { e.preventDefault(); showMenu(); });

  const nosotrosLink = document.getElementById("nosotrosLink");
  if (nosotrosLink) nosotrosLink.addEventListener("click", (e) => { e.preventDefault(); showNosotros(); });

  const reservasLink = document.getElementById("reservasLink");
  if (reservasLink) reservasLink.addEventListener("click", (e) => { e.preventDefault(); showPedido(); });

  // Mostrar Login (abrir modal)
  const usuarioLink = document.getElementById("usuarioLink");
  if (usuarioLink) {
    usuarioLink.addEventListener("click", (e) => {
      e.preventDefault();
      showLogin();
    });
  }

  // Conectar formulario de login dentro del modal (flexible con tus inputs)
  const loginForm = document.querySelector('#loginModal form') || document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // Toma email del input type="email" o del primer input de texto
      const emailInput = loginForm.querySelector('input[type="email"]') ||
                         loginForm.querySelector('input[name="email"]') ||
                         loginForm.querySelector('input[type="text"]');
      const passInput  = loginForm.querySelector('input[type="password"]') ||
                         loginForm.querySelector('input[name="password"]');
      const email = emailInput ? emailInput.value.trim() : '';
      const pass  = passInput  ? passInput.value.trim()  : '';
      login(email, pass);
      if (loginModal) loginModal.style.display = 'none';
    });
  }

  const reportesLink = document.getElementById("reportesLink");
  if (reportesLink) reportesLink.addEventListener("click", (e) => { e.preventDefault(); showReportes(); });

  const gestionLink = document.getElementById("gestionLink");
  if (gestionLink) gestionLink.addEventListener("click", (e) => { e.preventDefault(); showGestion(); });
}

// ==============================
// Acciones de vistas
// ==============================
function setActive(linkId) {
  getNavLinks().forEach(a => a.classList.remove("is-active"));
  if (linkId) {
    const linkEl = document.getElementById(linkId + "Link");
    if (linkEl) linkEl.classList.add("is-active");
  }
}

function showHome() {
  document.querySelectorAll('.view').forEach(v => v.classList.add('is-hidden'));
  if (homeView) homeView.classList.remove('is-hidden');
  setActive(null);
  localStorage.removeItem('boleta');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showMenu() {
  document.querySelectorAll('.view').forEach(v => v.classList.add('is-hidden'));
  if (menuView) menuView.classList.remove('is-hidden');
  setActive("menu");
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showNosotros() {
  document.querySelectorAll('.view').forEach(v => v.classList.add('is-hidden'));
  const sec = document.getElementById('nosotros');
  if (sec) sec.classList.remove('is-hidden');
  setActive('nosotros');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// NUEVO: comportamiento de Pedido cuando el carrito está vacío
function showPedido() {
  document.querySelectorAll('.view').forEach(v => v.classList.add('is-hidden'));
  const pedido = document.getElementById('pedido');
  if (pedido) pedido.classList.remove('is-hidden');
  setActive('reservas');

  const vacio = carrito.length === 0;
  if (vacio) {
    const ir = confirm("Tu carrito está vacío. ¿Deseas realizar un pedido? (Ir al Menú)");
    if (ir) showMenu();
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function showReportes() {
  document.querySelectorAll(".view").forEach(v => v.classList.add("is-hidden"));
  const r = document.getElementById("reportes");
  if (r) r.classList.remove("is-hidden");
  renderReportes();
  setActive("reportes");
}

// ==============================
// Modales
// ==============================
const loginModal    = document.getElementById('loginModal');
const registroModal = document.getElementById('registroModal');
const closeBtns     = document.querySelectorAll('.close');
const goToRegistro  = document.getElementById('goToRegistro');

function showLogin() {
  document.querySelectorAll('.view').forEach(v => v.classList.add('is-hidden'));
  if (loginModal) loginModal.style.display = 'flex';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

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

// ==============================
// Carrito
// ==============================
let carrito = [];

document.querySelectorAll('.card button').forEach((btn) => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.card');
    const nombre = card.querySelector('h3').textContent;
    const precio = parseInt(card.querySelector('p').textContent.replace('$','').replace('.',''));
    const imagen = card.querySelector('img').getAttribute('src');
    const item = carrito.find(p => p.nombre === nombre);
    if (item) item.cantidad++; else carrito.push({ nombre, precio, cantidad: 1, imagen });
    actualizarBarraPedido();
  });
});

function actualizarBarraPedido(){
  const totalItems = carrito.reduce((acc, p) => acc + p.cantidad, 0);
  const totalPrecio = carrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);

  const iSpan = document.getElementById('totalItems');
  const pSpan = document.getElementById('totalPrecio');
  if (iSpan) iSpan.textContent = totalItems;
  if (pSpan) pSpan.textContent = totalPrecio.toLocaleString();

  const barra = document.getElementById('barraPedido');
  if (barra) barra.classList.toggle('is-hidden', totalItems === 0);

  actualizarContadorNavbar();
  guardarCarrito();
}

function actualizarContadorNavbar() {
  const totalItems = carrito.reduce((acc, p) => acc + p.cantidad, 0);
  const contador = document.getElementById('contadorCarrito');
  if (contador) contador.textContent = totalItems;
}

function guardarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}
function cargarCarrito() {
  try { carrito = JSON.parse(localStorage.getItem('carrito')) || []; }
  catch { carrito = []; }
  actualizarBarraPedido();
}

// Botón “Ver pedido” (si existe en esta página)
const verPedidoBtn = document.getElementById('verPedidoBtn');
if (verPedidoBtn) {
  verPedidoBtn.addEventListener('click', () => {
    // En sitio multipágina: redirigir
    // window.location.href = "pedido.html";
    // En SPA: mostrar vista pedido
    showPedido();
  });
}

// ==============================
// Pago / Boleta
// ==============================
const confirmarBtn = document.querySelector(".btn-confirmar-pedido");
const pagoView = document.getElementById("pago");

function calcularTotal() {
  return carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
}

if (confirmarBtn) {
  confirmarBtn.addEventListener("click", () => {
    if (carrito.length === 0) {
      alert("Tu carrito está vacío");
      return;
    }
    const boleta = { fecha: new Date().toLocaleString(), items: carrito, total: calcularTotal() };
    localStorage.setItem("boleta", JSON.stringify(boleta));

    const popup = document.getElementById("pedidoPopup");
    if (popup) {
      popup.classList.remove("is-hidden");
      setTimeout(() => {
        popup.classList.add("is-hidden");
        showBoleta();
      }, 1500);
    } else {
      showBoleta();
    }
  });
}

const cancelarPago = document.getElementById("cancelarPago");
if (cancelarPago) {
  cancelarPago.addEventListener("click", () => {
    document.getElementById("pago")?.classList.add("is-hidden");
    document.getElementById("pedido")?.classList.remove("is-hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.getElementById("home")?.classList.remove("is-hidden");
  });
}

const confirmarPedidoBtn = document.getElementById("confirmarPedidoBtn");
if (confirmarPedidoBtn) {
  confirmarPedidoBtn.addEventListener("click", () => {
    document.getElementById("pedido")?.classList.add("is-hidden");
    document.getElementById("pago")?.classList.remove("is-hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function renderBoleta() {
  const boleta = JSON.parse(localStorage.getItem('boleta'));
  if (!boleta) return;

  const fechaEl = document.getElementById("boletaFecha");
  if (fechaEl) fechaEl.textContent = boleta.fecha;

  const tbody = document.getElementById("boletaItems");
  if (!tbody) return;
  tbody.innerHTML = "";
  boleta.items.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.nombre}</td>
      <td>${item.cantidad}</td>
      <td>$${item.precio.toLocaleString()}</td>
      <td>$${(item.precio * item.cantidad).toLocaleString()}</td>
    `;
    tbody.appendChild(tr);
  });

  const totalEl = document.getElementById("boletaTotal");
  if (totalEl) totalEl.textContent = `$${boleta.total.toLocaleString()}`;
}

function showBoleta() {
  document.querySelectorAll(".view").forEach(v => v.classList.add("is-hidden"));
  document.getElementById("boleta")?.classList.remove("is-hidden");
  renderBoleta();
  setActive(null); // no hay boletaLink en la navbar
}

// ==============================
// Reportes
// ==============================
function renderReportes() {
  const boletaHistorial = JSON.parse(localStorage.getItem("boletaHistorial")) || [];
  let totalVentas = 0;
  let cantidadPedidos = boletaHistorial.length;
  let productoPopular = "-";
  const contadorProductos = {};

  boletaHistorial.forEach(b => {
    totalVentas += b.total;
    b.items.forEach(item => {
      const nombre = item.nombre || item.name;
      const cantidad = item.cantidad || item.quantity;
      contadorProductos[nombre] = (contadorProductos[nombre] || 0) + cantidad;
    });
  });

  if (Object.keys(contadorProductos).length > 0) {
    productoPopular = Object.entries(contadorProductos).sort((a, b) => b[1] - a[1])[0][0];
  }

  const totalEl = document.getElementById("reporteTotalVentas");
  const cantEl  = document.getElementById("reporteCantidadPedidos");
  const popEl   = document.getElementById("reporteProductoPopular");
  if (totalEl) totalEl.textContent = `$${totalVentas.toLocaleString()}`;
  if (cantEl)  cantEl.textContent = cantidadPedidos;
  if (popEl)   popEl.textContent = productoPopular;
}

// ==============================
// Init
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  renderNavbar();
  cargarCarrito();
  if (document.getElementById("boleta")) renderBoleta();

  // Mostrar menú si la URL tiene #menu
  if (window.location.hash === '#menu') showMenu();
  if (window.location.hash === '#boleta') showBoleta();
});

const volverInicio = document.getElementById("volverInicio");
if (volverInicio) {
  volverInicio.addEventListener("click", () => showHome());
}
