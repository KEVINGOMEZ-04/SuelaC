// Variables globales
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let carritoAbierto = false;

// Elementos del DOM
const carritoIcono = document.querySelector('.carrito-icono');
const carritoContenido = document.querySelector('.carrito-contenido');
const carritoItems = document.querySelector('.carrito-items');
const carritoContador = document.querySelector('.carrito-contador');
const btnCerrarCarrito = document.querySelector('.btn-cerrar-carrito');
const btnComprar = document.querySelector('.btn-comprar');
const itemsCountElement = document.querySelector('.items-count');

// Funciones
function toggleCarrito() {
    carritoAbierto = !carritoAbierto;
    if (carritoAbierto) {
        carritoContenido.classList.add('mostrar');
        actualizarCarrito();
    } else {
        carritoContenido.classList.remove('mostrar');
    }
}

function actualizarCarrito() {
    carritoItems.innerHTML = '';
    
    let subtotal = 0;
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    
    // Mostrar mensaje si el carrito está vacío
    if (totalItems === 0) {
        carritoItems.innerHTML = `
            <div class="carrito-vacio">
                <i class="fas fa-shopping-bag"></i>
                <p>Tu carrito está vacío</p>
            </div>
        `;
        btnComprar.disabled = true;
    } else {
        btnComprar.disabled = false;
        
        carrito.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'carrito-item';
            itemElement.innerHTML = `
                <span>${item.nombre}</span>
                <span class="precio-item">$${(item.precio * item.cantidad).toLocaleString()}</span>
                <div class="cantidad-control">
                    <button class="cantidad-btn disminuir" data-index="${index}" aria-label="Reducir cantidad">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span>${item.cantidad}</span>
                    <button class="cantidad-btn aumentar" data-index="${index}" aria-label="Aumentar cantidad">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="eliminar-item" data-index="${index}" aria-label="Eliminar producto">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            carritoItems.appendChild(itemElement);
            
            subtotal += item.precio * item.cantidad;
        });
    }
    
    // Actualizar contadores y totales
    carritoContador.textContent = totalItems;
    itemsCountElement.textContent = `(${totalItems} ${totalItems === 1 ? 'item' : 'items'})`;
    document.querySelector('.subtotal').textContent = subtotal.toLocaleString();
    document.querySelector('.total-final').textContent = subtotal.toLocaleString();
    
    // Guardar en localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));
    
    // Agregar event listeners a los botones de cantidad
    document.querySelectorAll('.disminuir').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.getAttribute('data-index'));
            if (carrito[index].cantidad > 1) {
                carrito[index].cantidad--;
            } else {
                carrito.splice(index, 1);
            }
            actualizarCarrito();
            mostrarNotificacion('Producto actualizado');
        });
    });
    
    document.querySelectorAll('.aumentar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.getAttribute('data-index'));
            carrito[index].cantidad++;
            actualizarCarrito();
            mostrarNotificacion('Producto actualizado');
        });
    });
    
    document.querySelectorAll('.eliminar-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.getAttribute('data-index'));
            const nombreProducto = carrito[index].nombre;
            carrito.splice(index, 1);
            actualizarCarrito();
            mostrarNotificacion(`${nombreProducto} eliminado`);
        });
    });
}

function completarPedido() {
    if (carrito.length === 0) {
        mostrarNotificacion('El carrito está vacío');
        return;
    }
    
    // Crear mensaje para WhatsApp
    let mensaje = '¡Hola! Quiero realizar el siguiente pedido:\n\n';
    carrito.forEach(item => {
        mensaje += `- ${item.nombre} (${item.cantidad}): $${(item.precio * item.cantidad).toLocaleString()}\n`;
    });
    
    mensaje += `\nTotal: $${carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0).toLocaleString()}\n\n`;
    mensaje += 'Por favor, indíquenme cómo proceder con el pago y envío.';
    
    // Codificar el mensaje para URL
    const mensajeCodificado = encodeURIComponent(mensaje);
    
    // Abrir WhatsApp con el mensaje
    window.open(`https://wa.me/?text=${mensajeCodificado}`, '_blank');
}

function mostrarNotificacion(mensaje) {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion';
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.classList.add('desvanecer');
        setTimeout(() => {
            notificacion.remove();
        }, 300);
    }, 3000);
}

function agregarProductoAlCarrito(nombre, precio, cantidad = 1) {
    const productoExistente = carrito.find(item => item.nombre === nombre);
    
    if (productoExistente) {
        productoExistente.cantidad += cantidad;
    } else {
        carrito.push({
            nombre,
            precio,
            cantidad,
            fecha: new Date().toISOString()
        });
    }
    
    actualizarCarrito();
    mostrarNotificacion('¡Producto añadido al carrito!');
    
    // Animación en el icono del carrito
    carritoIcono.classList.add('item-added');
    setTimeout(() => {
        carritoIcono.classList.remove('item-added');
    }, 300);
}

// Event Listeners
carritoIcono.addEventListener('click', toggleCarrito);
btnCerrarCarrito.addEventListener('click', toggleCarrito);
btnComprar.addEventListener('click', completarPedido);

// Cerrar carrito al hacer clic fuera de él
document.addEventListener('click', (e) => {
    if (carritoAbierto && 
        !carritoContenido.contains(e.target) && 
        !carritoIcono.contains(e.target)) {
        toggleCarrito();
    }
});

// Botón volver arriba
window.addEventListener('scroll', () => {
    const backToTop = document.querySelector('.back-to-top');
    if (window.pageYOffset > 300) {
        backToTop.style.display = 'flex';
    } else {
        backToTop.style.display = 'none';
    }
});

document.querySelector('.back-to-top').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Menú hamburguesa para móviles
document.getElementById('hamburger-icon').addEventListener('click', () => {
    document.getElementById('navbar-menu').classList.toggle('active');
    document.querySelector('.navbar-hamburger').classList.toggle('active');
});

// Inicializar carrito al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    actualizarCarrito();
});
