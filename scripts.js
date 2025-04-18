// Variables globales
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let total = 0;

// Función para actualizar el carrito
function actualizarCarrito() {
    const contador = document.querySelector('.carrito-contador');
    const itemsContainer = document.querySelector('.carrito-items');
    const subtotalContainer = document.querySelector('.subtotal');
    const envioContainer = document.querySelector('.envio');
    const totalContainer = document.querySelector('.total-final');
    
    // Actualizar contador (suma de cantidades)
    contador.textContent = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
    
    // Actualizar items del carrito
    itemsContainer.innerHTML = carrito.map((item, index) => `
        <div class="carrito-item">
            <span>${item.nombre} ${item.oferta ? '<span class="oferta">(Oferta)</span>' : ''}</span>
            <div class="cantidad-control">
                <button class="cantidad-btn menos" data-index="${index}">-</button>
                <span>${item.cantidad || 1}</span>
                <button class="cantidad-btn mas" data-index="${index}">+</button>
            </div>
            <span>$${(item.precio * (item.cantidad || 1) / 1000).toFixed(3)}</span>
            <button class="eliminar-item" data-index="${index}">×</button>
        </div>
    `).join('');
    
    // Calcular totales
    const subtotal = carrito.reduce((sum, item) => sum + (item.precio * (item.cantidad || 1)), 0);
    const envio = calcularEnvio(subtotal);
    total = subtotal + envio;
    
    // Actualizar resumen
    subtotalContainer.textContent = (subtotal / 1000).toFixed(3);
    envioContainer.textContent = (envio / 1000).toFixed(3);
    totalContainer.textContent = (total / 1000).toFixed(3);
    
    // Guardar en localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));
    
    // Asignar eventos
    document.querySelectorAll('.eliminar-item').forEach(btn => {
        btn.addEventListener('click', eliminarDelCarrito);
    });
    
    document.querySelectorAll('.cantidad-btn.menos').forEach(btn => {
        btn.addEventListener('click', disminuirCantidad);
    });
    
    document.querySelectorAll('.cantidad-btn.mas').forEach(btn => {
        btn.addEventListener('click', aumentarCantidad);
    });
}

// Función para calcular envío
function calcularEnvio(subtotal) {
    const envioBase = 15000; // $15.000 COP
    const envioGratisMinimo = 300000; // $300.000 COP
    return subtotal >= envioGratisMinimo ? 0 : envioBase;
}

// Función para eliminar producto del carrito
function eliminarDelCarrito(e) {
    const index = parseInt(e.target.getAttribute('data-index'));
    carrito.splice(index, 1);
    actualizarCarrito();
    mostrarNotificacion('Producto eliminado');
}

// Función para aumentar cantidad
function aumentarCantidad(e) {
    const index = parseInt(e.target.getAttribute('data-index'));
    carrito[index].cantidad = (carrito[index].cantidad || 1) + 1;
    actualizarCarrito();
}

// Función para disminuir cantidad
function disminuirCantidad(e) {
    const index = parseInt(e.target.getAttribute('data-index'));
    if (carrito[index].cantidad > 1) {
        carrito[index].cantidad -= 1;
        actualizarCarrito();
    }
}

// Función para vaciar carrito
function vaciarCarrito() {
    if (carrito.length === 0) return;
    
    if (confirm('¿Estás seguro de vaciar el carrito?')) {
        carrito = [];
        actualizarCarrito();
        mostrarNotificacion('Carrito vaciado');
    }
}

// Función para animar producto al carrito
function animarProductoAlCarrito(boton) {
    const producto = boton.closest('.product-item');
    const clon = producto.cloneNode(true);
    const img = clon.querySelector('img');
    
    clon.style.position = 'fixed';
    clon.style.width = `${producto.offsetWidth}px`;
    clon.style.top = `${producto.getBoundingClientRect().top}px`;
    clon.style.left = `${producto.getBoundingClientRect().left}px`;
    clon.style.zIndex = '1000';
    clon.style.pointerEvents = 'none';
    clon.classList.add('producto-volando');
    
    document.body.appendChild(clon);
    
    setTimeout(() => {
        clon.remove();
    }, 800);
}

// Función para añadir producto al carrito
function añadirAlCarrito(nombre, precio, esOferta = false) {
    // Animación
    animarProductoAlCarrito(event.target);
    
    // Buscar si el producto ya está en el carrito
    const productoExistente = carrito.find(item => item.nombre === nombre);
    
    if (productoExistente) {
        productoExistente.cantidad = (productoExistente.cantidad || 1) + 1;
    } else {
        carrito.push({
            nombre,
            precio,
            cantidad: 1,
            oferta: esOferta,
            fecha: new Date().toISOString()
        });
    }
    
    actualizarCarrito();
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
        `➤ ${item.nombre}${item.oferta ? ' (Oferta)' : ''} - ${item.cantidad || 1} x $${(item.precio / 1000).toFixed(3)} = $${(item.precio * (item.cantidad || 1) / 1000).toFixed(3)}`
    ).join('\n');
    
    const mensaje = `¡Hola Suela C! 👟\n\nQuiero realizar el siguiente pedido:\n\n${itemsTexto}\n\nSubtotal: $${(total / 1000).toFixed(3)}\nEnvÍo: $${(calcularEnvio(total) / 1000).toFixed(3)}\nTOTAL: $${((total + calcularEnvio(total)) / 1000).toFixed(3)}\n\nMi información:\n- Nombre: \n- Dirección: \n- Teléfono: `;
    
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

// Inicializar al cargar el DOM
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar carrito
    actualizarCarrito();
    
    // Eventos para botones "Añadir al carrito"
    document.querySelectorAll('.btn-add-to-cart').forEach(boton => {
        boton.addEventListener('click', function(e) {
            e.preventDefault();
            const esOferta = this.hasAttribute('data-oferta');
            añadirAlCarrito(
                this.getAttribute('data-name'),
                parseInt(this.getAttribute('data-price')),
                esOferta
            );
            
            // Animación de confirmación
            this.textContent = '✓ Añadido';
            this.style.backgroundColor = '#4CAF50';
            
            setTimeout(() => {
                this.textContent = this.hasAttribute('data-oferta') ? 
                    'Añadir al carrito (Oferta)' : 'Añadir al carrito';
                this.style.backgroundColor = '';
            }, 2000);
        });
    });
    
    // Evento para el ícono del carrito
    document.querySelector('.carrito-icono').addEventListener('click', toggleCarrito);
    
    // Evento para el botón de comprar
    document.querySelector('.btn-comprar').addEventListener('click', finalizarCompra);
    
    // Evento para vaciar carrito
    document.querySelector('.btn-vaciar').addEventListener('click', vaciarCarrito);
    
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
