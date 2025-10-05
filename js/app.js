// Gestión de Productos (Admin)
let productos = JSON.parse(localStorage.getItem("productos")) || [
  { nombre: "Pizza Margarita", precio: 8500, img: "pizz.png" },
  { nombre: "Lasaña Boloñesa", precio: 9200, img: "lasaña.png" }
];

// Renderizar productos en la tabla
function renderProductos() {
  const tbody = document.getElementById("productosTabla");
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

    productos.push({ nombre, precio, img });
    renderProductos();

    productoForm.reset();
  });
}

// Editar producto
function editarProducto(index) {
  const nuevoNombre = prompt("Nuevo nombre:", productos[index].nombre);
  const nuevoPrecio = prompt("Nuevo precio:", productos[index].precio);
  const nuevaImg = prompt("Nueva imagen (ruta):", productos[index].img);

  if (nuevoNombre && nuevoPrecio && nuevaImg) {
    productos[index] = { nombre: nuevoNombre, precio: parseInt(nuevoPrecio), img: nuevaImg };
    renderProductos();
  }
}

// Eliminar producto
function eliminarProducto(index) {
  if (confirm("¿Eliminar este producto?")) {
    productos.splice(index, 1);
    renderProductos();
  }
}

function showGestion() {
  document.querySelectorAll(".view").forEach(v => v.classList.add("is-hidden"));
  document.getElementById("gestion").classList.remove("is-hidden");
  renderProductos();
  setActive("gestion");
}
// Elementos principales de vistas
const homeView = document.getElementById('home');
const menuView = document.getElementById('menu');

// Utilidades para navbar dinámica
function getNavLinks() {
  return Array.from(document.querySelectorAll('.nav__link'));
}

// Simulación: usuario admin
const ADMIN_EMAIL = "admin@laterraza.cl";
const ADMIN_PASS = "123456";

function login(email, pass) {
  if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
    localStorage.setItem("userRole", "admin");
    alert("Has iniciado sesión como ADMINISTRADOR");
    renderNavbar();
    showHome();
  } else {
    localStorage.setItem("userRole", "cliente");
    alert("Bienvenido cliente");
    renderNavbar();
    showHome();
  }
}

// Navbar dinámica según rol
function renderNavbar() {
  const nav = document.querySelector(".nav");
  const role = localStorage.getItem("userRole") || "cliente";

  // Reiniciar navbar
  nav.innerHTML = `
    <a href="#" class="nav__link" id="menuLink">Menú</a>
    <a href="#" class="nav__link" id="nosotrosLink">Nosotros</a>
    <a href="#" class="nav__link" id="reservasLink">Pedido</a>
    <a href="#" class="nav__link" id="usuarioLink">Usuario</a>
  `;

  // Si es admin, añadir opciones extra
  if (role === "admin") {
    nav.innerHTML += `
      <a href="#" class="nav__link" id="reportesLink">Reportes</a>
      <a href="#" class="nav__link" id="gestionLink">Gestión de Productos</a>
    `;
  }

  // Reasignar listeners después de regenerar
  setNavListeners();
}

// Asignar listeners a la navbar dinámica
function setNavListeners() {
  // Eliminar listeners previos usando cloneNode para evitar duplicados
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

  const usuarioLink = document.getElementById("usuarioLink");
  if (usuarioLink) usuarioLink.addEventListener("click", (e) => { e.preventDefault(); showLogin(); });

  const reportesLink = document.getElementById("reportesLink");
  if (reportesLink) reportesLink.addEventListener("click", (e) => { e.preventDefault(); showReportes(); });

  const gestionLink = document.getElementById("gestionLink");
  if (gestionLink) gestionLink.addEventListener("click", (e) => { e.preventDefault(); showGestion(); });
}

// Mostrar vista "Nosotros"
function showNosotros() {
  // Ocultar todas las vistas
  document.querySelectorAll('.view').forEach(v => v.classList.add('is-hidden'));

  // Mostrar nosotros
  document.getElementById('nosotros').classList.remove('is-hidden');

  // Marcar activo en navbar (si usas subrayado)
  setActive('nosotros');

  // Subir al inicio
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
// showPedido y showLogin ya están implementadas correctamente o no son necesarias como stubs

// Modales
const loginModal    = document.getElementById('loginModal');
const registroModal = document.getElementById('registroModal');
const closeBtns     = document.querySelectorAll('.close');
const goToRegistro  = document.getElementById('goToRegistro');

// Botón confirmar pedido en carrito
const confirmarBtn = document.querySelector(".btn-confirmar-pedido");
const pagoView = document.getElementById("pago");
const pedidoView = document.getElementById("pedido");

// Navegación de vistas
function setActive(link) {
  getNavLinks().forEach(a => {
    if (a) a.classList.remove('is-active');
  });
  if (link) link.classList.add('is-active');
}

function showHome() {
  // Ocultar todas las vistas
  document.querySelectorAll('.view').forEach(v => v.classList.add('is-hidden'));
  // Mostrar solo home
  homeView.classList.remove('is-hidden');
  setActive(null); // Inicio sin activo
  // Eliminar boleta del localStorage para que no quede persistente
  localStorage.removeItem('boleta');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showMenu() {
  homeView.classList.add('is-hidden');
  menuView.classList.remove('is-hidden');
  setActive(menuLink);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Mostrar Reportes (Admin)
function showReportes() {
  // Ocultar todas las vistas
  document.querySelectorAll(".view").forEach(v => v.classList.add("is-hidden"));

  // Mostrar reportes
  document.getElementById("reportes").classList.remove("is-hidden");

  // Renderizar métricas
  renderReportes();

  // Actualizar navbar activa
  setActive("reportes");
}



// Modal Login / Registro
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

// Carrito en memoria
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

// Mostrar menú si la URL tiene #menu
if (window.location.hash === '#menu') {
  showMenu();
}

// Calcular total del carrito
function calcularTotal() {
  return carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
}

// Botón confirmar pedido en carrito
if (confirmarBtn) {
  confirmarBtn.addEventListener("click", () => {
    if (carrito.length === 0) {
      alert("Tu carrito está vacío");
      return;
    }

    // Guardar boleta en localStorage
    const boleta = {
      fecha: new Date().toLocaleString(),
      items: carrito,
      total: calcularTotal()
    };
    localStorage.setItem("boleta", JSON.stringify(boleta));

    // Mostrar popup
    const popup = document.getElementById("pedidoPopup");
    popup.classList.remove("is-hidden");

    // Después de 1.5s ocultar popup y mostrar boleta
    setTimeout(() => {
      popup.classList.add("is-hidden");
      showBoleta();
    }, 1500);
  });
}

// Botón cancelar pago
const cancelarPago = document.getElementById("cancelarPago");
if (cancelarPago) {
  cancelarPago.addEventListener("click", () => {
    document.getElementById("pago").classList.add("is-hidden");
    document.getElementById("pedido").classList.remove("is-hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.getElementById("home").classList.remove("is-hidden");
  });
}

// Botón Confirmar pedido (pasa de pedido a pago)
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

// Renderizar Boleta Digital
function renderBoleta() {
  const boleta = JSON.parse(localStorage.getItem('boleta'));
  if (!boleta) return;

  document.getElementById("boletaFecha").textContent = boleta.fecha;

  const tbody = document.getElementById("boletaItems");
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

  document.getElementById("boletaTotal").textContent = `$${boleta.total.toLocaleString()}`;
}



document.addEventListener("DOMContentLoaded", () => {
  renderNavbar();
  if (document.getElementById("boleta")) {
    renderBoleta();
  }
});

const volverInicio = document.getElementById("volverInicio");
if (volverInicio) {
  volverInicio.addEventListener("click", () => {
    showHome();
  });
}

// Mostrar la boleta
function showBoleta() {
  // Ocultar todas las vistas
  document.querySelectorAll(".view").forEach(v => v.classList.add("is-hidden"));

  // Mostrar la vista boleta
  document.getElementById("boleta").classList.remove("is-hidden");

  // Renderizar contenido
  renderBoleta();

  // Actualizar navegación activa (si usas subrayado de navbar)
  setActive("boleta");
}

// Mostrar boleta si la URL tiene #boleta
if (window.location.hash === "#boleta") {
  showBoleta();
}

// Reportes (Admin)
function renderReportes() {
  const boletaHistorial = JSON.parse(localStorage.getItem("boletaHistorial")) || [];

  // Calcular total de ventas
  let totalVentas = 0;
  let cantidadPedidos = boletaHistorial.length;
  let productoPopular = "-";
  const contadorProductos = {};

  boletaHistorial.forEach(b => {
    totalVentas += b.total;

    b.items.forEach(item => {
      // Usa 'nombre' y 'cantidad' si así se llaman en tu sistema
      const nombre = item.nombre || item.name;
      const cantidad = item.cantidad || item.quantity;
      contadorProductos[nombre] = (contadorProductos[nombre] || 0) + cantidad;
    });
  });

  // Producto más vendido
  if (Object.keys(contadorProductos).length > 0) {
    productoPopular = Object.entries(contadorProductos).sort((a, b) => b[1] - a[1])[0][0];
  }

  // Pintar en HTML
  document.getElementById("reporteTotalVentas").textContent = `$${totalVentas.toLocaleString()}`;
  document.getElementById("reporteCantidadPedidos").textContent = cantidadPedidos;
  document.getElementById("reporteProductoPopular").textContent = productoPopular;
}
