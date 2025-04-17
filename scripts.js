// Variables globales
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let total = 0;

// Función para actualizar el carrito en la interfaz
function actualizarCarrito() {
    const contador = document.querySelector('.carrito-contador');
    const itemsContainer = document.querySelector('.carrito-items');
    const totalContainer = document.querySelector('.carrito-total span');
    
    // Actualizar contador
    contador.textContent = carrito.length;
    
    // Actualizar items del carrito
    itemsContainer.innerHTML = carrito.map(item => `
        <div class="carrito-item">
            <span>${item.nombre}</span>
            <span>$${item.precio.toLocaleString()}</span>
        </div>
    `).join('');
    
    // Calcular y actualizar total
    total = carrito.reduce((sum, item) => sum + item.precio, 0);
    totalContainer.textContent = total.toLocaleString();
    
    // Guardar en localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Función para añadir producto al carrito
function añadirAlCarrito(nombre, precio) {
    // Crear nuevo item
    const nuevoItem = {
        nombre: nombre,
        precio: precio,
        fecha: new Date().toISOString()
    };
    
    // Añadir al carrito
    carrito.push(nuevoItem);
    
    // Actualizar interfaz
    actualizarCarrito();
    
    // Mostrar notificación
    mostrarNotificacion('¡Producto añadido!');
}

// Función para mostrar/ocultar carrito
function toggleCarrito() {
    const carritoContenido = document.querySelector('.carrito-contenido');
    carritoContenido.classList.toggle('mostrar');
    
    // Cerrar al hacer clic fuera
    if (carritoContenido.classList.contains('mostrar')) {
        document.addEventListener('click', cerrarCarritoAlClicExterno);
    } else {
        document.removeEventListener('click', cerrarCarritoAlClicExterno);
    }
}

// Función para cerrar carrito al hacer clic fuera
function cerrarCarritoAlClicExterno(event) {
    const carritoIcono = document.querySelector('.carrito-icono');
    const carritoContenido = document.querySelector('.carrito-contenido');
    
    if (!carritoIcono.contains(event.target) && !carritoContenido.contains(event.target)) {
        carritoContenido.classList.remove('mostrar');
        document.removeEventListener('click', cerrarCarritoAlClicExterno);
    }
}

// Función para finalizar compra
function finalizarCompra() {
    if (carrito.length === 0) {
        mostrarNotificacion('Tu carrito está vacío');
        return;
    }
    
    // Crear mensaje para WhatsApp
    const itemsTexto = carrito.map(item => 
        `➤ ${item.nombre} - $${item.precio.toLocaleString()}`
    ).join('\n');
    
    const mensaje = `¡Hola Suela C! 👟\n\nQuiero realizar el siguiente pedido:\n\n${itemsTexto}\n\nTotal: $${total.toLocaleString()}\n\nMi información:\n- Nombre: \n- Dirección: \n- Teléfono: `;
    
    // Abrir WhatsApp
    window.open(`https://wa.me/573162859682?text=${encodeURIComponent(mensaje)}`, '_blank');
    
    // Vaciar carrito
    carrito = [];
    actualizarCarrito();
    
    // Mostrar confirmación
    mostrarNotificacion('¡Pedido enviado!');
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje) {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion';
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.classList.add('desvanecer');
        setTimeout(() => notificacion.remove(), 300);
    }, 2500);
}

// Inicializar eventos al cargar el DOM
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar carrito
    actualizarCarrito();
    
    // Eventos para botones "Añadir al carrito"
    document.querySelectorAll('.btn-add-to-cart').forEach(boton => {
        boton.addEventListener('click', function(e) {
            e.preventDefault();
            
            const nombre = this.getAttribute('data-name');
            const precio = parseInt(this.getAttribute('data-price'));
            
            // Añadir al carrito
            añadirAlCarrito(nombre, precio);
            
            // Animación de confirmación
            this.textContent = '✓ Añadido';
            this.style.backgroundColor = '#4CAF50';
            
            setTimeout(() => {
                this.textContent = 'Añadir al carrito';
                this.style.backgroundColor = '';
            }, 2000);
        });
    });
    
    // Evento para el ícono del carrito
    document.querySelector('.carrito-icono').addEventListener('click', toggleCarrito);
    
    // Evento para el botón de comprar
    document.querySelector('.btn-comprar').addEventListener('click', finalizarCompra);
    
    // Botón volver arriba
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        backToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTop.classList.add('mostrar');
            } else {
                backToTop.classList.remove('mostrar');
            }
        });
    }
    
    // Menú hamburguesa
    const hamburger = document.getElementById('hamburger-icon');
    const navbarMenu = document.getElementById('navbar-menu');
    
    if (hamburger && navbarMenu) {
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            navbarMenu.classList.toggle('active');
        });
        
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', function() {
            navbarMenu.classList.remove('active');
        });
        
        // Prevenir que se cierre al hacer clic en el menú
        navbarMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
});

// Función para formatear precios
function formatPrice(input) {
    let value = input.value.replace(/\D/g, '');
    if (value) {
        value = Number(value).toLocaleString('es-CO');
    }
    input.value = value;
}

// Función para convertir precios formateados a números
function convertirPrecioANumero(precioFormateado) {
    return parseInt(precioFormateado.replace(/\D/g, ''), 10);
}

// Función para aplicar filtros (mantenida de tu código original)
function applyFilters() {
    const minPrice = convertirPrecioANumero(document.getElementById('min-precio').value);
    const maxPrice = convertirPrecioANumero(document.getElementById('max-precio').value);
    const selectedColors = Array.from(document.querySelectorAll('.filtro-color input[type="checkbox"]:checked')).map(checkbox => checkbox.value);
    const selectedSize = document.getElementById('select-talla').value;

    const productos = document.querySelectorAll('.producto');

    productos.forEach(producto => {
        const precioProducto = convertirPrecioANumero(producto.querySelector('p').textContent);
        const colores = producto.getAttribute('data-colores').split(',');
        const tallas = producto.getAttribute('data-tallas').split(',');

        const precioValido = (isNaN(minPrice) || precioProducto >= minPrice) &&
                           (isNaN(maxPrice) || precioProducto <= maxPrice);
        const colorValido = selectedColors.length === 0 || selectedColors.some(color => colores.includes(color));
        const tallaValida = selectedSize === 'todos' || tallas.includes(selectedSize);

        producto.style.display = (precioValido && colorValido && tallaValida) ? 'block' : 'none';
    });

    const noProductsMessage = document.getElementById('no-products-message');
    const visibleProducts = Array.from(productos).filter(producto => producto.style.display !== 'none');
    noProductsMessage.style.display = visibleProducts.length === 0 ? 'flex' : 'none';
}

// Función para organizar productos (mantenida de tu código original)
function organizarProductos(criterio) {
    const productosContainer = document.querySelector('.grid-productos');
    const productos = Array.from(productosContainer.querySelectorAll('.producto'));

    const obtenerPrecio = (producto) => {
        const precioTexto = producto.querySelector('p').textContent.replace(/\D/g, '');
        return parseInt(precioTexto, 10);
    };

    const obtenerVentas = (producto) => {
        return parseInt(producto.getAttribute('data-ventas'), 10) || 0;
    };

    if (criterio === 'menor-mayor') {
        productos.sort((a, b) => obtenerPrecio(a) - obtenerPrecio(b));
    } else if (criterio === 'mayor-menor') {
        productos.sort((a, b) => obtenerPrecio(b) - obtenerPrecio(a));
    } else if (criterio === 'ofertas') {
        productos.forEach(producto => {
            producto.style.display = producto.getAttribute('data-oferta') === 'true' ? 'block' : 'none';
        });
        return;
    } else if (criterio === 'mas-vendidos') {
        productos.sort((a, b) => obtenerVentas(b) - obtenerVentas(a));
    }

    productosContainer.innerHTML = '';
    productos.forEach(producto => productosContainer.appendChild(producto));
}
