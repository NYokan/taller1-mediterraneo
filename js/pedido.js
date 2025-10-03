// Utilidad para CLP
const CLP = n => (n || 0).toLocaleString('es-CL');

// Cargar carrito
let carrito = [];
try { carrito = JSON.parse(localStorage.getItem('carrito')) || []; } catch { carrito = []; }

const lista = document.getElementById('pedidoList');
const vacio = document.getElementById('pedidoVacio');
const resumen = document.getElementById('pedidoResumen');
const resumenItems = document.getElementById('resumenItems');
const resumenTotal = document.getElementById('resumenTotal');

function guardar() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

function totales() {
  const items = carrito.reduce((acc, it) => acc + it.cantidad, 0);
  const total = carrito.reduce((acc, it) => acc + it.cantidad * it.precio, 0);
  resumenItems.textContent = items;
  resumenTotal.textContent = CLP(total);
  // Mostrar/ocultar bloques
  if (items > 0) {
    vacio.style.display = 'none';
    resumen.style.display = 'flex';
  } else {
    vacio.style.display = 'block';
    resumen.style.display = 'none';
  }
}

function render() {
  if (!lista) return;
  if (!carrito.length) {
    lista.innerHTML = '';
    totales();
    return;
  }

  lista.innerHTML = carrito.map(it => `
    <li class="pedido-item" data-nombre="${it.nombre}">
      <div class="pi-info">
        <img src="${it.imagen}" alt="${it.nombre}" class="pi-thumb">
        <div>
          <h4>${it.nombre}</h4>
          <small>$${CLP(it.precio)} c/u</small>
        </div>
      </div>
      <div class="pi-actions">
        <button class="menos" aria-label="Disminuir">−</button>
        <span class="cantidad">${it.cantidad}</span>
        <button class="mas" aria-label="Aumentar">+</button>
        <span class="pi-total">$${CLP(it.cantidad * it.precio)}</span>
        <button class="eliminar" aria-label="Eliminar">Eliminar</button>
      </div>
    </li>
  `).join('');

  totales();

  // Actualizar contador en navbar
  const totalItems = carrito.reduce((acc, p) => acc + p.cantidad, 0);
  const contador = document.getElementById('contadorCarrito');
  if (contador) contador.textContent = totalItems;
}

// Delegación de eventos para + / − / eliminar
lista?.addEventListener('click', (e) => {
  const btn = e.target;
  const li = btn.closest('.pedido-item');
  if (!li) return;
  const nombre = li.dataset.nombre;
  const idx = carrito.findIndex(p => p.nombre === nombre);
  if (idx === -1) return;

  if (btn.classList.contains('mas')) {
    carrito[idx].cantidad++;
  } else if (btn.classList.contains('menos')) {
    carrito[idx].cantidad = Math.max(0, carrito[idx].cantidad - 1);
    if (carrito[idx].cantidad === 0) carrito.splice(idx, 1);
  } else if (btn.classList.contains('eliminar')) {
    carrito.splice(idx, 1);
  }

  guardar();
  render();
});

// Vaciar
document.getElementById('btnVaciar')?.addEventListener('click', () => {
  if (confirm('¿Vaciar carrito?')) {
    carrito = [];
    guardar();
    render();
  }
});

// Confirmar (mock)
document.getElementById('btnConfirmar')?.addEventListener('click', () => {
  if (!carrito.length) return alert('Tu carrito está vacío.');

  // Guardar boleta en localStorage
  const boleta = {
    fecha: new Date().toLocaleString(),
    items: carrito,
    total: carrito.reduce((acc, it) => acc + it.cantidad * it.precio, 0)
  };
  localStorage.setItem('boleta', JSON.stringify(boleta));

  // Vaciar carrito
  carrito = [];
  guardar();
  render();

  // Redirigir a index.html y mostrar la boleta
  window.location.href = "index.html#boleta";
});

// Init
render();
