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
    itemsContainer.innerHTML = carrito.map((item, index) => `
        <div class="carrito-item">
            <span>${item.nombre}</span>
            <span>$${(item.precio / 1000).toFixed(3)}</span>
            <button class="eliminar-item" data-index="${index}">×</button>
        </div>
    `).join('');
    
    // Calcular y actualizar total
    total = carrito.reduce((sum, item) => sum + item.precio, 0);
    totalContainer.textContent = (total / 1000).toFixed(3);
    
    // Guardar en localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));
    
    // Asignar eventos a los botones de eliminar
    document.querySelectorAll('.eliminar-item').forEach(btn => {
        btn.addEventListener('click', eliminarDelCarrito);
    });
}

// Función para eliminar un producto del carrito
function eliminarDelCarrito(e) {
    const index = parseInt(e.target.getAttribute('data-index'));
    carrito.splice(index, 1);
    actualizarCarrito();
    mostrarNotificacion('Producto eliminado');
}
    
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
        `➤ ${item.nombre} - $${(item.precio / 1000).toFixed(3)}`
    ).join('\n');
    
    const mensaje = `¡Hola Suela C! 👟\n\nQuiero realizar el siguiente pedido:\n\n${itemsTexto}\n\nTotal: $${(total / 1000).toFixed(3)}\n\nMi información:\n- Nombre: \n- Dirección: \n- Teléfono: `;
    
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
        notificacion.style.opacity = '0';
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
                backToTop.style.display = 'flex';
            } else {
                backToTop.style.display = 'none';
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
