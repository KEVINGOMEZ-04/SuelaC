// Variables globales
let cartItems = [];
let total = 0.0;

// Referencias a elementos del DOM
const cartIcon = document.getElementById("cart-icon");
const cartContainer = document.getElementById("cart-container");
const cartCount = document.getElementById("cart-count");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");

// Carrito y funcionalidades globales
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

function actualizarCarrito() {
    cartCount.textContent = carrito.length;
    cartItemsContainer.innerHTML = carrito.map(item => `
        <div class="carrito-item">
            <span>${item.nombre}</span>
            <span>$${item.precio.toLocaleString()}</span>
        </div>
    `).join('');
    
    const total = carrito.reduce((sum, item) => sum + item.precio, 0);
    cartTotal.textContent = total.toLocaleString();
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function addToCart(nombre, precio) {
    const talla = document.querySelector('.talla-item.selected')?.dataset.talla || 'Sin talla';
    const color = document.querySelector('.color-btn.selected')?.dataset.color || 'Sin color';
    
    carrito.push({
        nombre: `${nombre} - Talla ${talla}, Color ${color}`,
        precio: precio
    });
    
    actualizarCarrito();
    mostrarNotificacion('¡Producto añadido!');
}

function toggleCarrito() {
    cartContainer.classList.toggle('show');
}

function finalizarCompra() {
    const pedido = carrito.map(item => `• ${item.nombre}: $${item.precio.toLocaleString()}`).join('\n');
    const total = carrito.reduce((sum, item) => sum + item.precio, 0);
    const codigo = `PEDIDO SUELA C\n${pedido}\n\nTOTAL: $${total.toLocaleString()}`;
    
    try {
        navigator.clipboard.writeText(codigo);
        window.open(`https://wa.me/573162859682?text=${encodeURIComponent(codigo)}`, '_blank');
        carrito = [];
        actualizarCarrito();
    } catch (err) {
        console.error('Error al copiar al portapapeles:', err);
        // Fallback para navegadores que no soportan clipboard API
        const textarea = document.createElement('textarea');
        textarea.value = codigo;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        window.open(`https://wa.me/573162859682?text=${encodeURIComponent(codigo)}`, '_blank');
        carrito = [];
        actualizarCarrito();
    }
}

// Notificación Flotante
function mostrarNotificacion(mensaje) {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion';
    notificacion.textContent = mensaje;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.classList.add('fade-out');
        setTimeout(() => {
            notificacion.remove();
        }, 300);
    }, 2700);
}

// Función para formatear el precio con separación de miles
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

// Función para restablecer el catálogo a su estado inicial
function resetearCatalogo() {
    const productos = document.querySelectorAll('.producto');
    productos.forEach(producto => {
        producto.style.display = 'block';
    });
}

// Función para aplicar los filtros
function applyFilters() {
    resetearCatalogo();

    const minPrice = convertirPrecioANumero(document.getElementById('min-precio').value);
    const maxPrice = convertirPrecioANumero(document.getElementById('max-precio').value);
    const selectedColors = Array.from(document.querySelectorAll('.filtro-color input[type="checkbox"]:checked')).map(checkbox => checkbox.value);
    const selectedSize = document.getElementById('select-talla').value;

    const productos = document.querySelectorAll('.producto');

    productos.forEach(producto => {
        const precioProducto = convertirPrecioANumero(producto.querySelector('p').textContent);
        const colores = producto.getAttribute('data-colores')?.split(',') || [];
        const tallas = producto.getAttribute('data-tallas')?.split(',') || [];

        const precioValido = (isNaN(minPrice) || precioProducto >= minPrice) &&
                           (isNaN(maxPrice) || precioProducto <= maxPrice);
        const colorValido = selectedColors.length === 0 || selectedColors.some(color => colores.includes(color));
        const tallaValida = selectedSize === 'todos' || tallas.includes(selectedSize);

        if (precioValido && colorValido && tallaValida) {
            producto.style.display = 'block';
        } else {
            producto.style.display = 'none';
        }
    });

    const noProductsMessage = document.getElementById('no-products-message');
    const visibleProducts = Array.from(productos).filter(producto => producto.style.display !== 'none');

    if (visibleProducts.length === 0) {
        noProductsMessage.style.display = 'flex';
    } else {
        noProductsMessage.style.display = 'none';
    }
}

// Función para reiniciar los filtros
function resetFilters() {
    document.getElementById('min-precio').value = '';
    document.getElementById('max-precio').value = '';
    document.querySelectorAll('.filtro-color input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    document.getElementById('select-talla').value = 'todos';
    applyFilters();
}

// Función para organizar productos
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
            const esOferta = producto.getAttribute('data-oferta') === 'true';
            producto.style.display = esOferta ? 'block' : 'none';
        });
        return;
    } else if (criterio === 'mas-vendidos') {
        productos.sort((a, b) => obtenerVentas(b) - obtenerVentas(a));
    }

    productosContainer.innerHTML = '';
    productos.forEach(producto => productosContainer.appendChild(producto));
}

// Menú hamburguesa
document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.getElementById('hamburger-icon');
    const navbarMenu = document.getElementById('navbar-menu');

    if (hamburger && navbarMenu) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            navbarMenu.classList.toggle('active');
        });

        document.addEventListener('click', (event) => {
            if (!navbarMenu.contains(event.target) && !hamburger.contains(event.target)) {
                navbarMenu.classList.remove('active');
            }
        });
    }
});

// Mostrar/ocultar filtros en móviles
const mostrarFiltrosBtn = document.getElementById('mostrar-filtros-btn');
if (mostrarFiltrosBtn) {
    mostrarFiltrosBtn.addEventListener('click', () => {
        const filtros = document.getElementById('filtros');
        filtros.classList.toggle('active');
    });
}

// Selección de color
document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
    });
});

// Selección de talla
document.querySelectorAll('.talla-btn:not(.agotado)').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.talla-btn').forEach(t => t.classList.remove('selected'));
        this.classList.add('selected');
    });
});

// Inicializar Carrito al cargar
document.addEventListener('DOMContentLoaded', actualizarCarrito);

// Scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Mostrar/ocultar botón "volver arriba"
window.addEventListener('scroll', function() {
    const backToTop = document.querySelector('.back-to-top');
    if (window.scrollY > 300) {
        backToTop.style.display = 'flex';
    } else {
        backToTop.style.display = 'none';
    }
});
