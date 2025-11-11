/**
 * Lógica para la página pedido.html
 * Lee el ID del pedido desde la URL y obtiene los datos de la boleta desde la API
 */

const API_URL = 'http://localhost:4000/api/v1'; // Asegúrate de que sea el mismo que en app.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtener el ID del pedido desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const pedidoId = urlParams.get('id');

    if (!pedidoId) {
        // Si no hay ID, mostrar un error
        const tbody = document.getElementById('boletaItems');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="4" style="color: red;">Error: No se ha especificado un número de pedido.</td></tr>';
        }
        document.getElementById('boletaTotal').textContent = '$0';
        return;
    }

    // 2. Llamar a la API del backend para obtener los datos de la boleta
    fetchBoleta(pedidoId);
});

async function fetchBoleta(id) {
    try {
        // Obtener el token del usuario desde localStorage (si es necesario)
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Si el backend requiere token, añádelo
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/pedidos/${id}`, { headers });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || errorData.message || 'Error al cargar el pedido.');
        }

        const pedido = await response.json();
        console.log("Pedido obtenido desde la API:", pedido);
        
        // 3. Si todo sale bien, mostramos la boleta
        mostrarResumenPedido(pedido);

    } catch (error) {
        console.error('Error al obtener la boleta:', error);
        const tbody = document.getElementById('boletaItems');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="4" style="color: red;">Error: ${error.message}</td></tr>`;
        }
        document.getElementById('boletaTotal').textContent = '$0';
    }
}

function mostrarResumenPedido(pedido) {
    const fechaEl = document.getElementById('boletaFecha');
    const tbody = document.getElementById('boletaItems');
    const totalEl = document.getElementById('boletaTotal');

    if (!fechaEl || !tbody || !totalEl) {
        console.error('No se encontraron los elementos de la boleta en el HTML');
        return;
    }

    tbody.innerHTML = ''; // Limpiar contenedor

    // Mostrar fecha del pedido
    const fecha = pedido.fecha_pedido || pedido.fecha || new Date().toISOString();
    fechaEl.textContent = new Date(fecha).toLocaleString();

    // Validar que existan items
    if (!pedido.items || pedido.items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">No hay items en este pedido.</td></tr>';
        totalEl.textContent = '$0';
        return;
    }

    // Renderizar cada item
    let totalCalculado = 0;

    pedido.items.forEach(item => {
        const tr = document.createElement('tr');
        
        // Mapear campos que puede devolver el backend (flexible)
        const nombre = item.nombre_plato || item.nombre || 'Producto Desconocido';
        const cantidad = item.cantidad || 1;
        const precio = item.precio_unitario || item.precio || 0;
        const subtotal = item.subtotal || (precio * cantidad);

        tr.innerHTML = `
            <td>${nombre}</td>
            <td>${cantidad}</td>
            <td>$${precio.toLocaleString()}</td>
            <td>$${subtotal.toLocaleString()}</td>
        `;
        tbody.appendChild(tr);

        totalCalculado += subtotal;
    });

    // Mostrar el total
    const totalFinal = pedido.total_pedido || pedido.total || totalCalculado;
    totalEl.textContent = `$${totalFinal.toLocaleString()}`;
}
