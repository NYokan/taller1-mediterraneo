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
      
      <button id="historialBtn" class="btn-confirmar" style="padding:.6rem 1rem; width: 100%; margin-top: 1rem;">Mi Historial de Pedidos</button>
      
      <div style="display:flex;gap:.5rem;justify-content:center;margin-top:1rem">
        <button id="switchAccountBtn" class="btn-confirmar" style="padding:.6rem 1rem">Iniciar con otro usuario</button>
        <button id="logoutBtn" class="btn-cancelar" style="padding:.6rem 1rem">Cerrar sesión</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('userPanelClose')?.addEventListener('click', closeUserPanel);
  
  // [US-Int-04] Listener para el nuevo botón 'Mi Historial'
  document.getElementById('historialBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      closeUserPanel();
      showHistorial();
  });
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
    
    renderReportes(); // <-- Asegúrate de que esta línea esté aquí y descomentada
    
    setActive("reportes");
}

function showGestion() {
  document.querySelectorAll(".view").forEach(v => v.classList.add("is-hidden"));
  const g = document.getElementById("gestion");
  if (g) g.classList.remove("is-hidden");
  
  renderProductos();
  
  setActive("gestion");
}
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
   Productos (Admin) -> (Integrado con API)
========================= */

// [US-Int-05] REEMPLAZO COMPLETO de renderProductos para que use la API
async function renderProductos() {
  const tbody = document.getElementById("productosTabla");
  if (!tbody) return;

  // Mostramos un 'cargando...'
  tbody.innerHTML = `<tr><td colspan="4">Cargando productos...</td></tr>`;

  try {
    // 1. Obtener los productos (igual que en el menú)
    // No necesitamos token aquí porque GET /productos es público
    const response = await fetch(`${API_URL}/productos`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const productos = await response.json();

    // 2. Limpiar la tabla y renderizar las filas
    tbody.innerHTML = "";
    
    if (productos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4">No hay productos en la base de datos.</td></tr>`;
        return;
    }

    productos.forEach(p => {
      const tr = document.createElement("tr");
      // Usamos los nombres de columna de la BD (ej. imagen_url, nombre_plato)
      tr.innerHTML = `
        <td><img src="${p.imagen_url}" alt="${p.nombre_plato}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;"></td>
        <td>${p.nombre_plato}</td>
        <td>$${p.precio.toLocaleString()}</td>
        <td>
          <button class="btn-editar" data-id="${p.id}">Editar</button>
          <button class="btn-eliminar" data-id="${p.id}">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error("Error al renderizar productos de admin:", error);
    tbody.innerHTML = `<tr><td colspan="4" style="color: red;">Error al cargar productos: ${error.message}</td></tr>`;
  }
}

// ... (El resto de tus funciones de admin como 'productoForm', 'editarProducto', etc.
// permanecen debajo de esta función por ahora)
// [US-Int-05] Integración del formulario de 'Agregar Producto'
const productoForm = document.getElementById("productoForm");
if (productoForm) {
  productoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombreProducto").value.trim();
    const precio = parseInt(document.getElementById("precioProducto").value);
    // Tu formulario original pide 'imgProducto', así que usamos ese ID
    const img = document.getElementById("imgProducto").value.trim(); 
    
    if (!nombre || Number.isNaN(precio) || !img) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    const { token } = getUser(); // Obtenemos el token del admin
    if (!token) {
      alert("Error de autenticación. Por favor, inicia sesión de nuevo.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/productos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Enviamos el token
        },
        body: JSON.stringify({
          nombre_plato: nombre,
          precio: precio,
          imagen_url: "img/" + img, // Asumimos que la ruta es "img/pizza.png"
          descripcion: "Descripción por defecto" 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el producto');
      }

      alert(data.mensaje); // "Producto creado"
      productoForm.reset();
      renderProductos(); // Volvemos a cargar la tabla (ahora con el nuevo producto)

    } catch (error) {
      console.error("Error al agregar producto:", error);
      alert(`Error: ${error.message}`);
    }
  });
}

// [US-Int-05] Agregamos un listener de eventos a la tabla de productos
// para manejar los clics de 'Editar' y 'Eliminar'
document.getElementById('productosTabla')?.addEventListener('click', (e) => {
  const btnEliminar = e.target.closest('.btn-eliminar');
  const btnEditar = e.target.closest('.btn-editar');

  if (btnEliminar) {
    const id = btnEliminar.dataset.id;
    eliminarProducto(id); // Llamamos a la nueva función
  } else if (btnEditar) {
    const id = btnEditar.dataset.id;
    // La lógica de editar es más compleja (requiere un modal), 
    // así que la dejamos pendiente por ahora.
    alert(`Función 'Editar' para ID ${id} aún no implementada en el frontend.`);
  }
});

// [US-Int-05] Integración de 'Eliminar Producto' (reemplaza la función antigua)
async function eliminarProducto(id) {
  if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) {
    return;
  }

  const { token } = getUser();
  if (!token) {
    alert("Error de autenticación. Por favor, inicia sesión de nuevo.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/productos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}` // Enviamos el token
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar el producto');
    }

    alert(data.mensaje); // "Producto eliminado"
    renderProductos(); // Volvemos a cargar la tabla (sin el producto eliminado)

  } catch (error) {
    console.error("Error al eliminar producto:", error);
    alert(`Error: ${error.message}`);
  }
}

// La función 'editarProducto(index)' antigua ya no es necesaria, 
// puedes borrarla o dejarla comentada.
function editarProducto(index) { 
  alert("Esta función (editarProducto) ya no se usa y debe ser reemplazada.");
}
// ... [FIN LÓGICA DE ADMIN] ...

// ... [LÓGICA DE NAVEGACIÓN Y CARRITO] ...

function ensurePedidoDOM() {
  const pedido = document.getElementById('pedido');
  if (!pedido) return;

  // Si la vista está vacía, creamos el contenido base
  if (!pedido.dataset.built) {
    pedido.innerHTML = `
      <h2>Tu Pedido</h2>
      <ul id="pedidoList" class="pedido-list"></ul>
      <p id="pedidoVacio" class="muted" style="display:none;">
        Tu carrito está vacío. <a href="#" id="irMenuDesdeVacio" class="nav__link">Ir al menú</a>
      </p>
      <div id="pedidoResumen" class="pedido-resumen" style="display:none;">
        <div>
          <strong>Productos:</strong> <span id="resumenItems">0</span> ·
          <strong>Total:</strong> $<span id="resumenTotal">0</span>
        </div>
        <div class="acciones">
          <button id="btnVaciar">Vaciar carrito</button>
          <button id="btnConfirmar">Confirmar pedido</button>
        </div>
      </div>
    `;
    pedido.dataset.built = "1";

    // Listeners locales de la vista pedido
    document.getElementById('irMenuDesdeVacio')?.addEventListener('click', (e) => {
      e.preventDefault();
      showMenu();
    });
    document.getElementById('btnVaciar')?.addEventListener('click', () => {
      if (carrito.length === 0) return;
      if (confirm('¿Vaciar carrito?')) {
        carrito = [];
        actualizarBarraPedido();
        renderPedido();
      }
    });

    // [US-Int-03] MODIFICADO: El botón 'Confirmar' ahora te lleva a la vista de pago
    document.getElementById('btnConfirmar')?.addEventListener('click', () => {
      if (carrito.length === 0) {
        alert('Tu carrito está vacío');
        return;
      }
      // Pasar a vista pago (en lugar de la lógica antigua de boleta)
      document.getElementById('pedido')?.classList.add('is-hidden');
      document.getElementById('pago')?.classList.remove('is-hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

function renderPedido() {
  ensurePedidoDOM();

  const list = document.getElementById('pedidoList');
  const vacio = document.getElementById('pedidoVacio');
  const resumen = document.getElementById('pedidoResumen');
  const resumenItems = document.getElementById('resumenItems');
  const resumenTotal = document.getElementById('resumenTotal');
  if (!list || !vacio || !resumen || !resumenItems || !resumenTotal) return;

  list.innerHTML = "";
  if (carrito.length === 0) {
    vacio.style.display = 'block';
    resumen.style.display = 'none';
    return;
  }

  vacio.style.display = 'none';
  resumen.style.display = 'flex';

  // Usamos 'item.id' como índice único (data-id) en lugar de 'idx'
  carrito.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'pedido-item';
    li.innerHTML = `
      <div class="pi-info">
        <img class="pi-thumb" src="${item.imagen}" alt="${item.nombre}">
        <div>
          <h4>${item.nombre}</h4>
          <small>$${item.precio.toLocaleString()} c/u</small>
        </div>
      </div>
      <div class="pi-actions">
        <button class="menos" data-id="${item.id}">−</button>
        <span>${item.cantidad}</span>
        <button class="mas" data-id="${item.id}">+</button>
        <span class="pi-total">$${(item.precio * item.cantidad).toLocaleString()}</span>
        <button class="eliminar" data-id="${item.id}">Eliminar</button>
      </div>
    `;
    list.appendChild(li);
  });

  // Totales
  const totalItems = carrito.reduce((a, p) => a + p.cantidad, 0);
  const totalPrecio = carrito.reduce((a, p) => a + p.precio * p.cantidad, 0);
  resumenItems.textContent = totalItems;
  resumenTotal.textContent = totalPrecio.toLocaleString();

  // Listeners de cada ítem (ahora usan data-id)
  list.querySelectorAll('.menos').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id, 10);
      const item = carrito.find(p => p.id === id);
      if (!item) return;

      item.cantidad = Math.max(0, item.cantidad - 1);
      if (item.cantidad === 0) {
        carrito = carrito.filter(p => p.id !== id);
      }
      actualizarBarraPedido();
      renderPedido();
    });
  });
  list.querySelectorAll('.mas').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id, 10);
      const item = carrito.find(p => p.id === id);
      if (item) {
         item.cantidad += 1;
         actualizarBarraPedido();
         renderPedido();
      }
    });
  });
  list.querySelectorAll('.eliminar').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id, 10);
      carrito = carrito.filter(p => p.id !== id);
      actualizarBarraPedido();
      renderPedido();
    });
  });
}

function showPedido() {
  document.querySelectorAll('.view').forEach(v => v.classList.add('is-hidden'));
  const pedido = document.getElementById('pedido');
  if (pedido) pedido.classList.remove('is-hidden');
  setActive('reservas');

  renderPedido(); // ← dibujar la vista con el estado actual del carrito
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function calcularTotal() {
  return carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
}
const confirmarBtn = document.querySelector(".btn-confirmar-pedido");
/* === [US-Int-03] Submit del formulario de pago (Integrado con API) === */
const pagoForm = document.getElementById("pagoForm");
if (pagoForm) {
  pagoForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1. Validar campos del formulario
    const nombre    = document.getElementById("nombre")?.value.trim();
    const direccion = document.getElementById("direccion")?.value.trim();
    const metodo    = document.getElementById("metodo")?.value;

    if (!nombre || !direccion || !metodo) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    // 2. Validar carrito y autenticación
    if (!carrito || carrito.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }
    
    const { token } = getUser();
    if (!isLoggedIn() || !token) {
        alert("Debes iniciar sesión para confirmar un pedido.");
        showLogin();
        return;
    }

    // 3. Preparar el JSON para la API (como en el Doc de API)
    const total = carrito.reduce((acc, i) => acc + (i.precio * i.cantidad), 0);
    
    // Mapeamos el carrito a los IDs de producto que espera el backend
    const itemsParaAPI = carrito.map(item => ({
        producto_id: item.id, // Usamos el ID de la BD
        cantidad: item.cantidad,
        precio_unitario: item.precio
    }));

    const datosPedido = {
        info_cliente: {
            nombre: nombre,
            direccion: direccion,
            metodo_pago: metodo
        },
        items: itemsParaAPI,
        total_pedido: total
    };

    try {
      // 4. Llamar a la API
      const response = await fetch(`${API_URL}/pedidos`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` // ¡Enviamos el token de cliente!
          },
          body: JSON.stringify(datosPedido)
      });

      const data = await response.json();
      if (!response.ok) {
          throw new Error(data.error || 'Error al crear el pedido');
      }

      // 5. ¡Éxito! Limpiar y mostrar boleta
      alert(data.mensaje); // "Pedido creado exitosamente"

  // Guardamos la boleta RECIBIDA de la API (no la que creamos)
  // El backend ahora nos devuelve la boleta real con el ID
  // Hacemos fallback por si el backend devuelve el objeto en otra clave
  const boletaToStore = data.boleta ?? data.pedido ?? data;
  localStorage.setItem("boleta", JSON.stringify(boletaToStore));
      
      // Limpiamos el carrito
      carrito = [];
      guardarCarrito(); // Esto limpia el localStorage del carrito
      
      // Limpiamos el formulario
      pagoForm.reset();

      // Mostramos la vista de boleta
      document.getElementById("pago")?.classList.add("is-hidden");
      showBoleta(); // Esta función ahora leerá la boleta de la API

    } catch (error) {
        console.error("Error al confirmar pedido:", error);
        alert(`Error: ${error.message}`);
    }
  });
}

// [US-Int-05] Integración de 'Reportes' (Admin)
async function renderReportes() {
    const totalEl = document.getElementById("reporteTotalVentas");
    const cantEl  = document.getElementById("reporteCantidadPedidos");
    const popEl   = document.getElementById("reporteProductoPopular");

    if (!totalEl || !cantEl || !popEl) return;

    // Mostramos 'cargando...'
    totalEl.textContent = "...";
    cantEl.textContent = "...";
    popEl.textContent = "...";

    const { token } = getUser();
    if (!token) {
        alert("Error de autenticación. Por favor, inicia sesión de nuevo.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/reportes/ventas`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Error al cargar reportes');
        }

        // Cargar los datos de la API en el HTML
        totalEl.textContent = `$${data.total_ventas.toLocaleString()}`;
        cantEl.textContent  = data.cantidad_pedidos;
        popEl.textContent   = data.producto_popular;

    } catch (error) {
        console.error("Error al cargar reportes:", error);
        alert(`Error: ${error.message}`);
        totalEl.textContent = "Error";
        cantEl.textContent = "Error";
        popEl.textContent = "Error";
    }
}
// [US-Int-03] Actualización de renderBoleta para leer el formato de la API
function showBoleta() {
  // Mostrar la vista de boleta y renderizar su contenido
  document.querySelectorAll('.view').forEach(v => v.classList.add('is-hidden'));
  const b = document.getElementById('boleta');
  if (b) b.classList.remove('is-hidden');
  setActive(null);
  renderBoleta();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// [US-Int-03] Actualización de renderBoleta para leer el formato de la API
function renderBoleta() {
  // Leemos la boleta que guardamos en localStorage DESPUÉS de la llamada a la API
  const boleta = JSON.parse(localStorage.getItem('boleta'));
  
  if (!boleta || !boleta.items) {
      console.error("No se encontró una boleta válida en localStorage.");
      return;
  }

  const fechaEl = document.getElementById("boletaFecha");
  const tbody = document.getElementById("boletaItems");
  const totalEl = document.getElementById("boletaTotal");
  if (!fechaEl || !tbody || !totalEl) return;

  // Total Final y Fecha
  fechaEl.textContent = new Date(boleta.fecha_pedido || boleta.fecha).toLocaleString();
  const totalFinal = boleta.total_pedido || boleta.total;
  totalEl.textContent = `$${totalFinal.toLocaleString()}`;

  tbody.innerHTML = "";
  boleta.items.forEach(item => {
    const tr = document.createElement("tr");
    
    // --- LECTURA DE CAMPOS CRÍTICOS ---
    const nombre = item.nombre_plato || item.nombre || 'Producto Desconocido';
    const precio = item.precio_unitario || item.precio || 0;
    const subtotal = item.subtotal || (precio * (item.cantidad || 1));
    
    tr.innerHTML = `
      <td>${nombre}</td>
      <td>${item.cantidad || 1}</td>
      <td>$${precio.toLocaleString()}</td>
      <td>$${subtotal.toLocaleString()}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ... [FIN LÓGICA DE NAVEGACIÓN Y CARRITO] ...

// [US-Int-04] Nueva vista para el historial del cliente
function showHistorial() {
  document.querySelectorAll(".view").forEach(v => v.classList.add("is-hidden"));
  const g = document.getElementById("historial");
  if (g) g.classList.remove("is-hidden");
    
  renderHistorial(); // <-- Llamada a la API
    
  setActive(null); // No hay ítem de navbar activo
}

// [US-Int-04] Nueva función para renderizar el historial desde la API
async function renderHistorial() {
  const tbody = document.getElementById("historialTabla");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="5">Cargando historial...</td></tr>`;

  const { token } = getUser();
  if (!token) {
    tbody.innerHTML = `<tr><td colspan="5" style="color: red;">Debes iniciar sesión para ver tu historial.</td></tr>`;
    return;
  }

  try {
    const response = await fetch(`${API_URL}/pedidos/historial`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al cargar historial');
    }

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5">Aún no has realizado ningún pedido.</td></tr>`;
      return;
    }

    tbody.innerHTML = ""; // Limpiamos la tabla
    data.forEach(pedido => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${pedido.id}</td>
        <td>${new Date(pedido.fecha_pedido).toLocaleString()}</td>
        <td>${pedido.nombre_cliente}</td>
        <td>${pedido.direccion_envio}</td>
        <td>$${pedido.total_pedido.toLocaleString()}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error("Error al cargar historial:", error);
    tbody.innerHTML = `<tr><td colspan="5" style="color: red;">Error al cargar historial: ${error.message}</td></tr>`;
  }
}


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