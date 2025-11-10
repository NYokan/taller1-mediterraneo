/**********************************************************
 * La Terraza - app.js (Integrado con API REST)
 **********************************************************/

/* =========================
   CONFIGURACIÓN DE LA API
========================= */
const API_URL = 'http://localhost:4000/api/v1';
let menuProductos = []; // Lista global de productos obtenida de la API

/* =========================
   Sesión de usuario (JWT Token)
========================= */
function getUser() {
  return {
    email: localStorage.getItem('userEmail') || null,
    role:  localStorage.getItem('userRole')  || 'visitante',
    token: localStorage.getItem('token') || null
  };
}
function setUser(email, role, token) {
  if (email) localStorage.setItem('userEmail', email);
  if (role)  localStorage.setItem('userRole', role);
  if (token) localStorage.setItem('token', token);
}
function clearUser() {
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userRole');
  localStorage.removeItem('token');
}
function isLoggedIn() {
  const u = getUser();
  return !!u.token && (u.role === 'cliente' || u.role === 'admin');
}

/* =========================
   Vistas principales / Modales
========================= */
const homeView = document.getElementById('home');
const menuView = document.getElementById('menu');
const loginModal    = document.getElementById('loginModal');
const registroModal = document.getElementById('registroModal');
const closeBtns     = document.querySelectorAll('.close');
const goToRegistro  = document.getElementById('goToRegistro');


// Se mantiene la lógica de Login / Logout, pero pronto usará la API

// ... [INICIO LÓGICA DE LOGIN / LOGOUT (API REAL)] ...

// Ya no necesitamos las contraseñas hardcodeadas
// const ADMIN_EMAIL = "admin@laterraza.cl";
// const ADMIN_PASS  = "123456";

// [US-Int-02] Función de Login integrada con la API
async function login(email, pass) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: pass
            })
        });

        const data = await response.json();

        if (!response.ok) {
            // Si la respuesta no es 2xx, es un error (ej. 401 Credenciales inválidas)
            throw new Error(data.error || 'Error al iniciar sesión');
        }

        // ¡Éxito! Guardamos los datos del usuario y el token
        setUser(data.usuario.email, data.usuario.rol, data.token);
        
        alert(`¡Bienvenido, ${data.usuario.nombre}!`);
        renderNavbar();
        showHome();
        if (loginModal) loginModal.style.display = 'none';

    } catch (error) {
        console.error('Error de login:', error);
        alert(`Error: ${error.message}`);
    }
}

function logout() {
  clearUser();
  alert("Has cerrado sesión");
  renderNavbar();
  showHome();
}
// ... [FIN LÓGICA DE LOGIN / LOGOUT (API REAL)] ...


// ... [INICIO LÓGICA DE RENDERIZADO DE NAVBAR, LISTENERS Y PANELES] ...
function renderNavbar() {
  const nav = document.querySelector(".nav");
  if (!nav) return;
  const { role, email } = getUser();

  nav.innerHTML = `
    <a href="#" class="nav__link" id="menuLink">Menú</a>
    <a href="#" class="nav__link" id="nosotrosLink">Nosotros</a>
    <a href="#" class="nav__link" id="reservasLink">Pedido (<span id="contadorCarrito">0</span>)</a>
    <a href="#" class="nav__link" id="usuarioLink">${isLoggedIn() ? (email || "Cuenta") : "Usuario"}</a>
  `;

  if (role === "admin") {
    nav.innerHTML += `
      <a href="#" class="nav__link" id="reportesLink">Reportes</a>
      <a href="#" class="nav__link" id="gestionLink">Gestión de Productos</a>
    `;
  }

  ensureUserPanel();
  updateUserPanel(email, role);
  setNavListeners();
}

function getNavLinks() {
  return Array.from(document.querySelectorAll('.nav__link'));
}

function setNavListeners() {
  getNavLinks().forEach(link => {
    const newLink = link.cloneNode(true);
    link.parentNode.replaceChild(newLink, link);
  });

  document.getElementById("menuLink")?.addEventListener("click", (e) => { e.preventDefault(); showMenu(); });
  document.getElementById("nosotrosLink")?.addEventListener("click", (e) => { e.preventDefault(); showNosotros(); });
  document.getElementById("reservasLink")?.addEventListener("click", (e) => { e.preventDefault(); showPedido(); });

  document.getElementById("usuarioLink")?.addEventListener("click", (e) => {
    e.preventDefault();
    if (isLoggedIn()) openUserPanel();
    else showLogin();
  });

  // Listener del formulario de Login (Integrado)
  const loginForm = document.querySelector('#loginModal form') || document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = loginForm.querySelector('input[type="email"]') ||
                         loginForm.querySelector('input[name="email"]') ||
                         loginForm.querySelector('input[type="text"]');
      const passInput  = loginForm.querySelector('input[type="password"]') ||
                         loginForm.querySelector('input[name="password"]');
      const email = emailInput ? emailInput.value.trim() : '';
      const pass  = passInput  ? passInput.value.trim()  : '';
      
      // Llamamos a la nueva función de login asíncrona
      login(email, pass); 
    });
  }

  // [US-Int-02] Listener del formulario de Registro (Integrado)
  const registroForm = document.querySelector('#registroModal form');
  if (registroForm) {
    registroForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nombreInput = registroForm.querySelector('input[placeholder="Usuario"]');
        const emailInput = registroForm.querySelector('input[type="email"]');
        const passInput = registroForm.querySelector('input[type="password"]');

        const nombre = nombreInput ? nombreInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const password = passInput ? passInput.value.trim() : '';

        if (!nombre || !email || !password) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/registrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre_usuario: nombre,
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al registrarse');
            }

            alert(data.mensaje);
            if (registroModal) registroModal.style.display = 'none';
            showLogin();

        } catch (error) {
            console.error('Error de registro:', error);
            alert(`Error: ${error.message}`);
        }
    });
  }

  // --- ¡CORRECCIÓN AQUÍ! ---
  // Listeners para los botones de Admin
  document.getElementById("reportesLink")?.addEventListener("click", (e) => { e.preventDefault(); showReportes(); });
  document.getElementById("gestionLink")?.addEventListener("click", (e) => { e.preventDefault(); showGestion(); });
  // --- FIN DE LA CORRECCIÓN ---


  // Listeners del panel de usuario
  document.getElementById("logoutBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    closeUserPanel();
    logout();
  });
  document.getElementById("switchAccountBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    closeUserPanel();
    showLogin();
  });

  // Listener del Home
  document.getElementById("homeLink")?.addEventListener("click", (e) => {
    e.preventDefault();
    showHome();
  });
}

function ensureUserPanel() {
  if (document.getElementById('userPanelModal')) return;

  const modal = document.createElement('div');
  modal.id = 'userPanelModal';
  modal.className = 'modal';
  modal.style.display = 'none';
  modal.innerHTML = `
    <div class="modal-content" style="max-width:420px;text-align:center">
      <span class="close" id="userPanelClose">&times;</span>
      <h2>Tu cuenta</h2>
      <p style="margin:.5rem 0"><strong>Email:</strong> <span id="userEmailLabel">—</span></p>
      <p style="margin:.5rem 0"><strong>Rol:</strong> <span id="userRoleLabel">visitante</span></p>
      <div style="display:flex;gap:.5rem;justify-content:center;margin-top:1rem">
        <button id="switchAccountBtn" class="btn-confirmar" style="padding:.6rem 1rem">Iniciar con otro usuario</button>
        <button id="logoutBtn" class="btn-cancelar" style="padding:.6rem 1rem">Cerrar sesión</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('userPanelClose')?.addEventListener('click', closeUserPanel);
  window.addEventListener('click', (e) => {
    if (e.target === modal) closeUserPanel();
  });
}
function updateUserPanel(email, role) {
  const emailEl = document.getElementById('userEmailLabel');
  const roleEl  = document.getElementById('userRoleLabel');
  if (emailEl) emailEl.textContent = email || '—';
  if (roleEl)  roleEl.textContent  = role || 'visitante';
}
function openUserPanel() {
  const modal = document.getElementById('userPanelModal');
  if (modal) modal.style.display = 'flex';
}
function closeUserPanel() {
  const modal = document.getElementById('userPanelModal');
  if (modal) modal.style.display = 'none';
}

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

function setActive(key) {
  getNavLinks().forEach(a => a.classList.remove("is-active"));
  if (!key) return;
  const linkEl = document.getElementById(key + "Link");
  if (linkEl) linkEl.classList.add("is-active");
}

function showHome() {
  document.querySelectorAll('.view').forEach(v => v.classList.add('is-hidden'));
  if (homeView) homeView.classList.remove('is-hidden');
  setActive(null);
  localStorage.removeItem('boleta'); // limpiar boleta temporal
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
  const home = document.getElementById('home');
  if (home) home.classList.remove('is-hidden');

  const sec = document.getElementById('nosotros');
  if (sec) {
    const y = sec.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
  setActive('nosotros');
}

// --- INICIO DE LA CORRECCIÓN ---
// Movemos estas funciones aquí para que setNavListeners las pueda encontrar

function showReportes() { 
    document.querySelectorAll(".view").forEach(v => v.classList.add("is-hidden"));
    const g = document.getElementById("reportes");
    if (g) g.classList.remove("is-hidden");
    // renderReportes(); // <-- Esta la integraremos después
    setActive("reportes");
}

function showGestion() {
  document.querySelectorAll(".view").forEach(v => v.classList.add("is-hidden"));
  const g = document.getElementById("gestion");
  if (g) g.classList.remove("is-hidden");
  // renderProductos(); // <-- Esta la integraremos después
  setActive("gestion");
}
// --- FIN DE LA CORRECCIÓN ---

// ... [FIN LÓGICA DE RENDERIZADO DE NAVBAR, LISTENERS Y PANELES] ...


/* =========================
   INTEGRACIÓN 1: Cargar Menú desde la API
========================= */

// Función para obtener el menú de la API
async function fetchMenu() {
    try {
        const response = await fetch(`${API_URL}/productos`);
        if (!response.ok) {
            throw new Error('Error al cargar el menú: ' + response.statusText);
        }
        // menuProductos es ahora un array de objetos de la BD
        menuProductos = await response.json();
        renderMenuCards();
    } catch (error) {
        console.error("Error al obtener el menú:", error);
    }
}

// Función que genera dinámicamente las tarjetas del menú
function renderMenuCards() {
    const menuGrid = document.querySelector('.menu-grid');
    if (!menuGrid) return;
    
    // Generamos el HTML usando los datos de la BD
    menuGrid.innerHTML = menuProductos.map(p => `
        <article class="card" data-id="${p.id}">
            <img src="${p.imagen_url}" alt="${p.nombre_plato}">
            <h3>${p.nombre_plato}</h3>
            <p>$${p.precio.toLocaleString()}</p>
            <button type="button" class="btn-agregar" data-id="${p.id}">Agregar</button>
        </article>
    `).join('');
    
    // Volvemos a adjuntar el listener de los botones 'Agregar'
    setMenuListeners(); 
}

/* =========================
   Carrito (La lógica se mantiene, solo cambia la forma de agregar)
========================= */
let carrito = [];

function parsePrecio(str) {
  return parseInt(String(str).replace(/[^\d]/g, ''), 10) || 0;
}

// Re-implementación de la lógica del Carrito para usar delegación de eventos y ID
function setMenuListeners() {
    const menuGrid = document.querySelector('.menu-grid');
    if (!menuGrid) return;

    // ELIMINAMOS EL LISTENER ESTATICO ANTERIOR Y USAMOS ESTE DE DELEGACIÓN
    menuGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-agregar');
        if (!btn) return;
        
        // Obtenemos el ID del producto (clave única de la BD)
        const productId = parseInt(btn.dataset.id, 10);
        
        // Buscamos el producto en la lista global obtenida de la API
        const producto = menuProductos.find(p => p.id === productId);

        if (!producto) return;

        // Lógica de carrito: el carrito AHORA debe guardar el ID
        const item = carrito.find(p => p.id === productId);
        if (item) item.cantidad++;
        else carrito.push({ 
            id: producto.id, 
            nombre: producto.nombre_plato, 
            precio: producto.precio, 
            cantidad: 1, 
            imagen: producto.imagen_url 
        });

        actualizarBarraPedido();
    });
}

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


// ... [LÓGICA RESTANTE (ADMIN, PEDIDO, PAGO, BOLETA) SE MANTIENEN POR AHORA] ...

/* =========================
   Productos (Admin) -> Se mantiene por ahora
========================= */
// Mantener esta función vacía o con la lógica mínima para que no falle.
function renderProductos() {
  const tbody = document.getElementById("productosTabla");
  if (!tbody) return;
  
  const productosAdmin = JSON.parse(localStorage.getItem("productos")) || [];
  
  tbody.innerHTML = "";
  productosAdmin.forEach((p, i) => {
    // Lógica de renderizado de la tabla de admin
  });

  localStorage.setItem("productos", JSON.stringify(productosAdmin));
}
const productoForm = document.getElementById("productoForm");
if (productoForm) {
  // ... lógica del formulario de admin
}

function editarProducto(index) { /* ... */ }
function eliminarProducto(index) { /* ... */ }
// ... [FIN LÓGICA DE ADMIN] ...

// ... [LÓGICA DE NAVEGACIÓN Y CARRITO] ...
function ensurePedidoDOM() { /* ... */ }
function renderPedido() { /* ... */ }
function showPedido() { /* ... */ renderPedido(); /* ... */ }

function calcularTotal() { /* ... */ }
const confirmarBtn = document.querySelector(".btn-confirmar-pedido");
// ... [LÓGICA DE PAGO/BOLETA] ...
const pagoForm = document.getElementById("pagoForm");
if (pagoForm) { /* ... */ }

function renderBoleta() { /* ... */ }
function showBoleta() { /* ... */ renderBoleta(); /* ... */ }

function renderReportes() { /* ... */ }
// ... [FIN LÓGICA DE NAVEGACIÓN Y CARRITO] ...


/* =========================
   Init
========================= */
document.addEventListener("DOMContentLoaded", () => {
  renderNavbar();
  cargarCarrito();
  fetchMenu(); // <--- LLAMADA A LA API (Nueva funcionalidad)
  
  // Lógica de redirección por hash
  if (document.getElementById("boleta")) renderBoleta();
  if (window.location.hash === '#menu')   showMenu();
  if (window.location.hash === '#boleta') showBoleta();
  
  const verPedidoBtn = document.getElementById('verPedidoBtn');
  if (verPedidoBtn) verPedidoBtn.addEventListener('click', () => showPedido());
});

const volverInicio = document.getElementById("volverInicio");
if (volverInicio) {
  volverInicio.addEventListener("click", () => showHome());
}