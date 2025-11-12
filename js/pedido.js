document.addEventListener('DOMContentLoaded', () => {
    // 1. Ya no leemos la URL. Leemos localStorage.
    const boletaJSON = localStorage.getItem('boleta');

    if (!boletaJSON) {
        mostrarError('Error: No se encontraron datos de la boleta.');
        return;
    }

    let boleta;
    try {
        boleta = JSON.parse(boletaJSON);
    } catch (e) {
        mostrarError('Error: No se pudieron procesar los datos de la boleta.');
        console.error("Error parsing boleta JSON:", e);
        return;
    }

    // 2. Renderizar la boleta con los datos
    renderBoleta(boleta);
    
    // 3. Limpiamos el storage para que no se muestre de nuevo al recargar
    localStorage.removeItem('boleta'); 
});

/**
 * Función que muestra la boleta en el HTML
 * ¡CORREGIDA PARA LEER DE LOCALSTORAGE y USAR IDs DE pedido.html!
 */
function renderBoleta(boleta) {
    // IDs de tu pedido.html (la versión que pegaste)
    const contenedorItems = document.getElementById('boleta-items');
    const boletaFechaEl = document.getElementById('boleta-fecha');
    const boletaTotalEl = document.getElementById('boleta-total');
    const clienteNombreEl = document.getElementById('boleta-cliente-nombre');
    const clienteDireccionEl = document.getElementById('boleta-cliente-direccion');
    const clientePagoEl = document.getElementById('boleta-cliente-pago');
    const boletaIdEl = document.getElementById('boleta-id');

    // Validamos que los elementos existan
    if (!contenedorItems || !boletaFechaEl || !boletaTotalEl || !clienteNombreEl || !boletaIdEl) {
        console.error('Error fatal: Faltan elementos de la boleta en el HTML.');
        mostrarError('Error al cargar la página. IDs de boleta no encontrados.');
        return;
    }

    contenedorItems.innerHTML = ''; // Limpiar

    // Validamos que el pedido y los items existan
    if (!boleta || !boleta.items || boleta.items.length === 0) {
        mostrarError('Esta boleta no tiene items o no se encontró.');
        return;
    }

    // Llenar datos del cliente e Info de la boleta
    boletaIdEl.textContent = `#${boleta.id}`;
    boletaFechaEl.textContent = new Date(boleta.fecha_pedido).toLocaleString('es-CL');
    
    if (boleta.info_cliente) {
        clienteNombreEl.textContent = boleta.info_cliente.nombre || 'Sin nombre';
        clienteDireccionEl.textContent = boleta.info_cliente.direccion || 'Sin dirección';
        clientePagoEl.textContent = boleta.info_cliente.metodo_pago || 'Sin método';
    }

    // Iteramos sobre los items (del localStorage)
    boleta.items.forEach(item => {
        const itemHtml = document.createElement('tr');
        
        const precioUnitario = item.precio || 0;
        const cantidad = item.cantidad || 0;
        const nombreProducto = item.nombre || 'Producto desconocido';
        const subtotal = item.subtotal || (cantidad * precioUnitario); 
        
        itemHtml.innerHTML = `
            <td>${nombreProducto}</td>
            <td>${cantidad}</td>
            <td>$${precioUnitario.toLocaleString('es-CL')}</td>
            <td>$${subtotal.toLocaleString('es-CL')}</td>
        `;
        contenedorItems.appendChild(itemHtml);
    });

    // Mostramos el total
    boletaTotalEl.textContent = `$${boleta.total_pedido.toLocaleString('es-CL')}`;
}

/**
 * Función simple para mostrar errores en la página
 */
function mostrarError(mensaje) {
    const contenedorPrincipal = document.querySelector('.boleta-container'); 
    if (contenedorPrincipal) {
        contenedorPrincipal.innerHTML = `<p class="text-danger text-center" style="color: red;">${mensaje}</p>`;
    }
}