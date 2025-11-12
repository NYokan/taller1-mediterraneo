document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtener el ID del pedido desde la URL (Ej: pedido.html?id=5)
    const urlParams = new URLSearchParams(window.location.search);
    const pedidoId = urlParams.get('id');

    if (!pedidoId) {
        // Si no hay ID en la URL, mostramos un error
        mostrarError('Error: No se ha especificado un número de pedido.');
        return;
    }

    // 2. Llamar a la API del backend para obtener los datos de ESE pedido
    // Asumiendo que tu API_URL es una variable global, si no, escribe la URL completa
    // const API_URL = 'http://localhost:3000/api'; // <--- Descomenta si no es global
    
    fetchBoleta(pedidoId);
});

async function fetchBoleta(id) {
    try {
        const { token } = getUser(); // Asumiendo que tienes esta función global
        if (!token) {
             throw new Error('No estás autenticado para ver esta boleta.');
        }

        // Usamos el endpoint GET que ya tienes en tu backend
        const response = await fetch(`${API_URL}/pedidos/${id}`, {
             method: 'GET',
             headers: {
                 'Authorization': `Bearer ${token}` 
             }
        }); 
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'No se pudo cargar el pedido.');
        }

        const boleta = await response.json(); // El backend nos da la boleta completa
        
        // 3. Si el backend responde bien, mostramos la boleta
        renderBoleta(boleta); // Usamos la función para mostrar los datos

    } catch (error) {
        console.error('Error al obtener la boleta:', error);
        mostrarError(`Error: ${error.message}`);
    }
}

/**
 * Función que muestra la boleta en el HTML
 * AHORA RECIBE LA BOLETA COMO PARÁMETRO
 */
function renderBoleta(boleta) {
    const contenedorItems = document.getElementById('boleta-items'); // Asigna IDs en tu HTML
    const clienteNombreEl = document.getElementById('boleta-cliente-nombre');
    const clienteDireccionEl = document.getElementById('boleta-cliente-direccion');
    const clientePagoEl = document.getElementById('boleta-cliente-pago');
    const boletaIdEl = document.getElementById('boleta-id');
    const boletaFechaEl = document.getElementById('boleta-fecha');
    const boletaTotalEl = document.getElementById('boleta-total');
    
    contenedorItems.innerHTML = ''; // Limpiar

    // Validamos que el pedido y los items existan
    if (!boleta || !boleta.items || boleta.items.length === 0) {
        mostrarError('Este pedido no tiene items o no se encontró.');
        return;
    }

    // Llenar datos del cliente e Info de la boleta
    // (Asegúrate de que 'boleta.info_cliente' venga de tu API)
    if(boleta.info_cliente) {
        clienteNombreEl.textContent = boleta.info_cliente.nombre || 'Sin nombre';
        clienteDireccionEl.textContent = boleta.info_cliente.direccion || 'Sin dirección';
        clientePagoEl.textContent = boleta.info_cliente.metodo_pago || 'Sin método de pago';
    }
    boletaIdEl.textContent = `#${boleta.id}`;
    boletaFechaEl.textContent = new Date(boleta.fecha_pedido).toLocaleString('es-CL');

    // 4. Iteramos sobre los items que vinieron del backend
    boleta.items.forEach(item => {
        const itemHtml = document.createElement('tr');
        const subtotal = item.cantidad * item.precio_unitario; // Usa los nombres de tu API
        
        itemHtml.innerHTML = `
            <td>${item.nombre_producto || 'Producto desconocido'}</td>
            <td>${item.cantidad}</td>
            <td>$${item.precio_unitario.toLocaleString('es-CL')}</td>
            <td>$${subtotal.toLocaleString('es-CL')}</td>
        `;
        contenedorItems.appendChild(itemHtml);
    });

    // 5. Mostramos el total (que ya vino calculado de la API)
    boletaTotalEl.textContent = `$${boleta.total_pedido.toLocaleString('es-CL')}`;
}

/**
 * Función simple para mostrar errores en la página
 */
function mostrarError(mensaje) {
    const contenedorPrincipal = document.querySelector('.boleta-container'); // Busca el contenedor principal
    if (contenedorPrincipal) {
        contenedorPrincipal.innerHTML = `<p class="text-danger text-center">${mensaje}</p>`;
    }
}

// Asumo que tienes una función global `getUser()` en algún script
// Si no la tienes, debes implementarla para obtener el token.
// Ejemplo:
/*
function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : { token: null, nombre: null };
}
*/