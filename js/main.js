// js/main.js

// 1. Inicializar carrito y favoritos desde LocalStorage (clave unificada: 'aura-cart')
let cart = JSON.parse(localStorage.getItem('aura-cart')) || [];
let favorites = JSON.parse(localStorage.getItem('aura_favorites')) || [];
let discountApplied = false;

// Funciones auxiliares para guardar datos
function saveCart() {
    localStorage.setItem('aura-cart', JSON.stringify(cart));
}

function saveFavorites() {
    localStorage.setItem('aura_favorites', JSON.stringify(favorites));
}

// 2. Catálogo global de productos (utilizado tanto en tienda como en /admin)
let searchProducts = [
    { id: '1', name: 'Abrigo Lana Minimal', category: 'Mujer', price: 189.00, stock: 15, tag: 'Abrigo Lana', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=600&h=800' },
    { id: '2', name: 'Vestido Seda Fluid', category: 'Mujer', price: 125.00, stock: 8, tag: 'Vestido Seda', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600&h=800' },
    { id: '3', name: 'Blazer Sastre Oversize', category: 'Mujer', price: 145.00, stock: 12, tag: 'Blazer Lana', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=600&h=800' },
    { id: '4', name: 'Camisa Lino Orgánico', category: 'Hombre', price: 79.00, stock: 20, tag: 'Hombre Lino', image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=600&h=800' },
    { id: '5', name: 'Pantalón Tailored', category: 'Hombre', price: 95.00, stock: 14, tag: 'Hombre Pantalón', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600&h=800' },
    { id: '6', name: 'Jersey Punto Cashmere', category: 'Mujer', price: 160.00, stock: 10, tag: 'Cashmere Lana', image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=600&h=800' }
];

// 3. Funciones de Administración (/admin)
function switchAdminSection(section) {
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(sec => sec.classList.add('hidden'));

    const navButtons = document.querySelectorAll('aside nav button');
    navButtons.forEach(btn => {
        btn.classList.remove('bg-aura-gold/15', 'text-aura-gold');
        btn.classList.add('text-aura-lightgray', 'hover:bg-white/5', 'hover:text-white');
    });

    const target = document.getElementById('sec-' + section);
    if (target) target.classList.remove('hidden');

    const titles = {
        'dashboard': 'Dashboard General',
        'productos': 'Gestión de Catálogo y Stock',
        'pedidos': 'Control de Pedidos y Envíos',
        'clientes': 'Base de Clientes Registrados',
        'promociones': 'Cupones y Descuentos Activos'
    };

    const headerTitle = document.getElementById('admin-header-title');
    if (headerTitle) headerTitle.textContent = titles[section] || 'Panel de Administración';

    const btnMap = { 'dashboard': 'nav-dash', 'productos': 'nav-prod', 'pedidos': 'nav-ped', 'clientes': 'nav-cli', 'promociones': 'nav-prom' };
    const activeBtn = document.getElementById(btnMap[section]);
    if (activeBtn) {
        activeBtn.classList.remove('text-aura-lightgray', 'hover:bg-white/5', 'hover:text-white');
        activeBtn.classList.add('bg-aura-gold/15', 'text-aura-gold');
    }

    if (section === 'productos') {
        renderAdminProducts();
    }
}

function renderAdminProducts() {
    const tableBody = document.getElementById('admin-products-table');
    if (!tableBody) return;

    tableBody.innerHTML = searchProducts.map((p, index) => `
        <tr class="hover:bg-aura-cream/50 transition-colors">
            <td class="p-4 flex items-center gap-3">
                <img src="${p.image}" alt="${p.name}" class="w-10 h-12 object-cover rounded bg-aura-lightgray">
                <div>
                    <span class="font-semibold text-aura-dark block">${p.name}</span>
                    <span class="text-xs text-aura-gray">ID: ${p.id}</span>
                </div>
            </td>
            <td class="p-4 text-aura-gray">${p.category}</td>
            <td class="p-4 font-semibold text-aura-dark">${p.price.toFixed(2)} €</td>
            <td class="p-4 text-aura-gray"><span class="px-2.5 py-1 bg-aura-lightgray/50 rounded font-medium">${p.stock} unidades</span></td>
            <td class="p-4 text-right space-x-2">
                <button onclick="editProduct('${p.id}')" class="text-aura-gold hover:underline text-xs font-semibold">Editar</button>
                <button onclick="deleteProduct('${p.id}')" class="text-red-600 hover:underline text-xs font-semibold">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

function openNewProductModal() {
    const name = prompt('Nombre del nuevo producto:');
    if (!name) return;
    const category = prompt('Categoría (Mujer / Hombre):', 'Mujer');
    const price = parseFloat(prompt('Precio en €:', '100')) || 50;
    const stock = parseInt(prompt('Stock inicial:', '10')) || 10;
    const image = prompt('URL de imagen:', 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=600&h=800');

    const newProd = {
        id: Date.now().toString(),
        name,
        category,
        price,
        stock,
        tag: category,
        image
    };

    searchProducts.push(newProd);
    renderAdminProducts();
    alert('¡Producto creado con éxito!');
}

function deleteProduct(id) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        searchProducts = searchProducts.filter(p => p.id !== id);
        renderAdminProducts();
    }
}

function editProduct(id) {
    const p = searchProducts.find(item => item.id === id);
    if (!p) return;
    const newName = prompt('Editar nombre:', p.name);
    if (newName) p.name = newName;
    const newPrice = parseFloat(prompt('Editar precio:', p.price));
    if (!isNaN(newPrice)) p.price = newPrice;
    renderAdminProducts();
    alert('Producto actualizado.');
}

// 4. Funciones globales de control del carrito y cajón (Drawer)
function toggleCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (drawer && overlay) {
        drawer.classList.toggle('translate-x-full');
        overlay.classList.toggle('hidden');
    }
}

function addToCart(name, price, image) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, image, quantity: 1 });
    }
    saveCart();
    updateCartUI();
    toggleCart();
}

window.auraAddToCartWithQuantity = function(name, price, image, quantity) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ name, price, image, quantity: quantity });
    }
    saveCart();
    updateCartUI();
    toggleCart();
};

function changeQuantity(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity < 1) {
        cart[index].quantity = 1;
    }
    saveCart();
    updateCartUI();
}

function removeItem(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

function clearCart() {
    if (confirm('¿Estás seguro de que deseas vaciar toda la cesta?')) {
        cart = [];
        discountApplied = false;
        saveCart();
        updateCartUI();
    }
}

function applyPromo() {
    const promoInput = document.getElementById('promo-input');
    const msg = document.getElementById('promo-msg');
    if (!promoInput || !msg) return;

    const code = promoInput.value.trim().toUpperCase();
    if (code === 'AURA2026' || code === 'WELCOME') {
        discountApplied = true;
        msg.textContent = '¡Código aplicado con éxito (-10%)!';
        msg.classList.remove('hidden', 'text-red-600');
        msg.classList.add('text-green-600');
        updateCartUI();
    } else {
        msg.textContent = 'Código promocional no válido.';
        msg.classList.remove('hidden', 'text-green-600');
        msg.classList.add('text-red-600');
    }
}

function processOrder(event) {
    event.preventDefault();
    if (cart.length === 0) {
        alert('Tu cesta está vacía.');
        return;
    }
    cart = [];
    discountApplied = false;
    saveCart();
    window.location.href = 'pedido-confirmado.html';
}

// 5. Soporte para otras páginas (Contacto, FAQ, Búsqueda, etc.)
function handleContact(event) {
    event.preventDefault();
    alert('¡Mensaje enviado con éxito! Nos pondremos en contacto contigo en menos de 24 horas.');
    event.target.reset();
}

function toggleFAQ(id) {
    const element = document.getElementById(id);
    if (element) {
        element.classList.toggle('hidden');
    }
}

function renderSearchProducts(items) {
    const grid = document.getElementById('search-grid');
    const noResults = document.getElementById('no-results');
    const resultsCount = document.getElementById('results-count');

    if (!grid || !noResults || !resultsCount) return;

    resultsCount.textContent = `Mostrando ${items.length} ${items.length === 1 ? 'pieza' : 'piezas'}`;

    if (items.length === 0) {
        grid.classList.add('hidden');
        noResults.classList.remove('hidden');
    } else {
        noResults.classList.add('hidden');
        grid.classList.remove('hidden');
        grid.innerHTML = items.map(item => `
            <div class="group bg-white rounded-xl border border-aura-lightgray overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div class="relative overflow-hidden aspect-[3/4]">
                    <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <span class="absolute top-3 left-3 bg-aura-dark/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">${item.category}</span>
                </div>
                <div class="p-5">
                    <h3 class="font-semibold text-aura-dark text-base">${item.name}</h3>
                    <p class="text-aura-gray text-xs mt-1 mb-4">${item.price.toFixed(2)} €</p>
                    <button onclick="addToCart('${item.name}', ${item.price}, '${item.image}')" class="w-full text-center py-2.5 text-xs uppercase tracking-wider font-semibold border border-aura-dark text-aura-dark hover:bg-aura-dark hover:text-white transition-colors rounded">
                        Añadir a la Cesta
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// 6. Actualización de UI del carrito y contadores
function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const cartCountEls = document.querySelectorAll('#cart-count');
    cartCountEls.forEach(el => {
        el.textContent = totalCount;
    });

    const cartItemsContainer = document.getElementById('cart-items');
    const subtotalEl = document.getElementById('cart-subtotal');

    if (cartItemsContainer && subtotalEl) {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p id="empty-cart-msg" class="text-center text-aura-gray py-12 italic">Tu cesta está vacía actualmente.</p>';
            subtotalEl.textContent = '0,00 €';
        } else {
            let html = '';
            let subtotal = 0;
            cart.forEach((item, index) => {
                subtotal += item.price * item.quantity;
                html += `
                    <div class="flex items-center gap-4 pt-4 first:pt-0">
                        <img src="${item.image}" alt="${item.name}" class="w-16 h-20 object-cover rounded bg-aura-lightgray">
                        <div class="flex-grow">
                            <h4 class="font-serif font-bold text-sm text-aura-dark">${item.name}</h4>
                            <p class="text-xs text-aura-gray mt-1">${item.price.toFixed(2)} € x ${item.quantity}</p>
                        </div>
                        <button onclick="removeItem(${index})" class="text-aura-gray hover:text-red-600 p-2">
                            <i class="fa-solid fa-trash-can text-sm"></i>
                        </button>
                    </div>
                `;
            });
            cartItemsContainer.innerHTML = html;
            subtotalEl.textContent = subtotal.toFixed(2) + ' €';
        }
    }

    const detailedContainer = document.getElementById('cart-items-container');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryTotal = document.getElementById('summary-total');

    if (detailedContainer && summarySubtotal && summaryTotal) {
        if (cart.length === 0) {
            detailedContainer.innerHTML = `
                <div class="text-center py-16 bg-white rounded-xl border border-aura-lightgray p-8">
                    <i class="fa-solid fa-bag-shopping text-4xl text-aura-lightgray mb-4"></i>
                    <h2 class="font-serif text-2xl font-bold mb-2">Tu cesta está vacía</h2>
                    <p class="text-aura-gray text-sm mb-6">Parece que aún no has añadido ninguna prenda exclusiva.</p>
                    <a href="index.html" class="inline-block bg-aura-dark text-aura-cream px-8 py-3.5 rounded text-xs uppercase tracking-widest font-medium hover:bg-aura-gold transition-colors">
                        Explorar Colección
                    </a>
                </div>
            `;
            summarySubtotal.textContent = '0,00 €';
            summaryTotal.textContent = '0,00 €';
            return;
        }

        let htmlDetail = '';
        let subtotalDetail = 0;

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            subtotalDetail += itemTotal;
            htmlDetail += `
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 first:pt-0 bg-white sm:bg-transparent p-4 sm:p-0 rounded-lg sm:rounded-none border sm:border-0 border-aura-lightgray">
                    <div class="flex items-center gap-4">
                        <img src="${item.image}" alt="${item.name}" class="w-20 h-24 object-cover rounded bg-aura-lightgray flex-shrink-0">
                        <div>
                            <h3 class="font-serif font-bold text-base text-aura-dark">${item.name}</h3>
                            <p class="text-xs text-aura-gray mt-1">Precio unitario: ${item.price.toFixed(2)} €</p>
                        </div>
                    </div>
                    <div class="flex items-center justify-between w-full sm:w-auto gap-6 mt-4 sm:mt-0">
                        <div class="flex items-center border border-aura-lightgray rounded bg-white">
                            <button onclick="changeQuantity(${index}, -1)" class="px-3 py-1.5 text-aura-gray hover:text-aura-dark">-</button>
                            <span class="px-3 py-1.5 text-sm font-semibold">${item.quantity}</span>
                            <button onclick="changeQuantity(${index}, 1)" class="px-3 py-1.5 text-aura-gray hover:text-aura-dark">+</button>
                        </div>
                        <span class="font-bold text-aura-dark text-base">${itemTotal.toFixed(2)} €</span>
                        <button onclick="removeItem(${index})" class="text-aura-gray hover:text-red-600 p-2"><i class="fa-solid fa-trash-can text-sm"></i></button>
                    </div>
                </div>
            `;
        });

        detailedContainer.innerHTML = htmlDetail;
        summarySubtotal.textContent = subtotalDetail.toFixed(2) + ' €';

        let finalTotal = discountApplied ? subtotalDetail * 0.9 : subtotalDetail;
        summaryTotal.textContent = finalTotal.toFixed(2) + ' €';
    }
}

// 7. Inicialización global al cargar cualquier página
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        renderSearchProducts(searchProducts);
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const filtered = searchProducts.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query)
            );
            renderSearchProducts(filtered);
        });
    }

    if (document.getElementById('sec-productos')) {
        renderAdminProducts();
    }
});