document.addEventListener("DOMContentLoaded", () => {
    const API_URL = 'http://localhost:5000/api';
    
    // Navbar Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            navLinks.forEach(nav => nav.classList.remove('active'));
            pages.forEach(page => page.classList.remove('active', 'hidden'));
            e.currentTarget.classList.add('active');
            
            const targetPageId = `page-${e.currentTarget.getAttribute('data-page')}`;
            pages.forEach(page => {
                if (page.id === targetPageId) page.classList.add('active');
                else page.classList.add('hidden');
            });
            window.scrollTo(0, 0);
        });
    });

    let liveProducts = [];
    let cart = [];

    // 1. LOAD PRODUCTS FROM DATABASE
    async function loadProducts() {
        try {
            const res = await fetch(`${API_URL}/products`);
            liveProducts = await res.json();
            renderProducts("All");
        } catch (error) {
            console.error("Error loading products:", error);
            document.getElementById('products-grid').innerHTML = "<p style='grid-column: span 3; text-align:center;'>Unable to load shop data. Ensure server is running.</p>";
        }
    }

    const grid = document.getElementById('products-grid');
    const categoryBtns = document.querySelectorAll('.shop-sidebar .cat-btn');

    function renderProducts(filterCategory = "All") {
        if (!grid) return;
        grid.innerHTML = "";
        const safeFilter = filterCategory.toLowerCase().trim();

        const filteredProducts = liveProducts.filter(p => {
            if (safeFilter === "all" || safeFilter === "all products") return true;
            return p.category.toLowerCase() === safeFilter;
        });

        filteredProducts.forEach(product => {
            const isOutOfStock = product.stock <= 0;
            const stockLabel = isOutOfStock 
                ? `<span style="color: #c62828; font-weight:bold; font-size: 12px;">Out of Stock</span>`
                : `<span style="color: #2e7d32; font-size: 12px;">Stock: ${product.stock}</span>`;

            const card = document.createElement('div');
            card.className = "product-card dash-card"; 
            card.innerHTML = `
                <div class="product-img">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='./images/default.png'">
                </div>
                <div class="product-body">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span class="product-category">${product.category}</span>
                        ${stockLabel}
                    </div>
                    <h4 class="product-name">${product.name}</h4>
                    <p class="product-desc">${product.desc}</p>
                    <div class="product-footer">
                        <span class="product-price">₹${product.price}</span>
                        <div class="qty-action-wrap">
                            <input type="number" id="qty-${product._id}" class="qty-input" value="1" min="1" max="${product.stock}" ${isOutOfStock ? 'disabled' : ''}>
                            <button class="btn-add-cart" onclick="addToCart('${product._id}')" ${isOutOfStock ? 'disabled style="background:#ccc;cursor:not-allowed;"' : ''}>
                                ${isOutOfStock ? 'Empty' : 'Add'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            let target = e.currentTarget.textContent.replace(/[^\w\s]/gi, '').trim();
            renderProducts(target);
        });
    });

    // 2. CART LOGIC WITH STOCK VALIDATION
    window.addToCart = (productId) => {
        const product = liveProducts.find(p => p._id === productId);
        if (!product) return;
        
        const qtyInput = document.getElementById(`qty-${productId}`);
        const qty = parseInt(qtyInput.value) || 1;

        // Check stock availability
        const existingItem = cart.find(item => item.productId === productId);
        const currentCartQty = existingItem ? existingItem.quantity : 0;

        if (currentCartQty + qty > product.stock) {
            return alert(`❌ Cannot add ${qty}. Only ${product.stock - currentCartQty} more units available in stock!`);
        }

        if (existingItem) {
            existingItem.quantity += qty;
        } else {
            cart.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: qty
            });
        }

        updateCartUI();
        alert(`✅ Added ${qty}x ${product.name}`);
        qtyInput.value = 1; // reset input
    };

    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        document.getElementById('cart-count').innerText = totalItems;
        document.getElementById('cart-total-header').innerText = totalPrice;
    }

    // ==========================================
    // 3. MODAL OPEN/CLOSE & CART RENDERING LOGIC
    // ==========================================
    const btnViewCart = document.getElementById('btn-view-cart');
    const checkoutModal = document.getElementById('checkout-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartTotalPrice = document.getElementById('cart-total-price');

    // Remove Item Function (Attached to window so HTML can see it)
    window.removeFromCart = (productId) => {
        // Filter out the item that matches the ID
        cart = cart.filter(item => item.productId !== productId);
        
        // Update the cart icon numbers
        updateCartUI();
        
        // Refresh the modal UI instantly if it's open
        if (!checkoutModal.classList.contains('hidden')) {
            btnViewCart.click(); 
        }
    };

    // Open Modal & Populate Items
    if (btnViewCart && checkoutModal) {
        btnViewCart.addEventListener('click', () => {
            if (cartItemsList) cartItemsList.innerHTML = '';
            
            if (cart.length === 0) {
                cartItemsList.innerHTML = '<p style="text-align:center; color:#666; margin: 20px 0;">Your cart is empty.</p>';
            } else {
                cart.forEach(item => {
                    const div = document.createElement('div');
                    div.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding-bottom:10px; border-bottom:1px solid var(--gray-200); font-size: 14px;";
                    div.innerHTML = `
                        <div style="flex: 1;">
                            <span style="font-weight: 600; color: var(--green-900);">${item.name}</span>
                            <div style="font-size: 12px; color: var(--text-muted);">Qty: ${item.quantity}</div>
                        </div>
                        <div style="display:flex; align-items:center; gap: 15px;">
                            <span style="font-weight: 700; color: var(--green-700);">₹${item.price * item.quantity}</span>
                            <button onclick="removeFromCart('${item.productId}')" style="background:none; border:none; color:#ef4444; font-size:16px; cursor:pointer; padding:4px;" title="Remove Item">🗑️</button>
                        </div>
                    `;
                    cartItemsList.appendChild(div);
                });
            }

            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            if (cartTotalPrice) cartTotalPrice.innerText = total;

            checkoutModal.classList.remove('hidden');
        });
    }

    // Close Modal
    if (btnCloseModal && checkoutModal) {
        btnCloseModal.addEventListener('click', () => {
            checkoutModal.classList.add('hidden');
        });
    }

    // ==========================================
    // 4. CHECKOUT & API ORDER CREATION
    // ==========================================
    const btnConfirm = document.getElementById('btn-confirm-order');
    if (btnConfirm) {
        btnConfirm.addEventListener('click', async () => {
            if (cart.length === 0) return alert("Cart is empty!");
            
            // Get logged in farmer
            const sessionData = localStorage.getItem('annajyoti_user');
            if (!sessionData) return alert("Please log in to place an order.");
            const farmer = JSON.parse(sessionData);

            btnConfirm.innerText = "Processing Payment... ⏳";
            btnConfirm.disabled = true;

            const orderPayload = {
                farmerPhone: farmer.phone, // Bind order to user
                items: cart,
                total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                date: new Date().toLocaleDateString('en-IN')
            };

            try {
                const res = await fetch(`${API_URL}/orders`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderPayload)
                });
                
                const newOrder = await res.json();
                
                alert(`🎉 Order Placed Successfully!\nOrder ID: ${newOrder.orderId}`);
                
                // Clear cart, close modal
                cart = [];
                updateCartUI();
                document.getElementById('checkout-modal').classList.add('hidden');
                
                // Refresh products to show updated stock limits!
                await loadProducts();
                
                // Jump to orders tab
                document.getElementById('tab-orders').click();

            } catch (error) {
                alert("Error placing order. Please try again.");
            } finally {
                btnConfirm.innerText = "Confirm Order & Pay ✓";
                btnConfirm.disabled = false;
            }
        });
    }

    // ==========================================
    // 5. LOAD MY ORDERS (Farmer Specific)
    // ==========================================
    async function renderFarmerOrders() {
        const tbody = document.getElementById('orders-list');
        if (!tbody) return;
        
        const sessionData = localStorage.getItem('annajyoti_user');
        if (!sessionData) return;
        const farmerPhone = JSON.parse(sessionData).phone;

        try {
            const res = await fetch(`${API_URL}/orders/farmer/${farmerPhone}`);
            const orders = await res.json();

            if (orders.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:40px;">No orders yet. Start shopping!</td></tr>`;
                return;
            }

            tbody.innerHTML = "";
            orders.forEach(order => {
                // Determine badge color based on DB status
                let badgeColor = "var(--gray-200)";
                let textColor = "var(--gray-800)";
                if (order.status === "Processing") { badgeColor = "#fef3c7"; textColor = "#d97706"; }
                if (order.status === "Shipping") { badgeColor = "#e0f2fe"; textColor = "#0284c7"; }
                if (order.status === "Delivered") { badgeColor = "#dcfce7"; textColor = "#166534"; }

                const itemsStr = order.items.map(i => `${i.name} (x${i.quantity})`).join(', ');

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>#${order.orderId}</td>
                    <td style="max-width:300px; font-size:13px;">${itemsStr}</td>
                    <td style="font-weight:bold;">₹${order.total}</td>
                    <td>${order.date}</td>
                    <td><span class="card-badge" style="background:${badgeColor}; color:${textColor};">${order.status}</span></td>
                `;
                tbody.appendChild(row);
            });
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Failed to fetch orders.</td></tr>`;
        }
    }

    // Tab Switching
    const tabShop = document.getElementById('tab-shop');
    const tabOrders = document.getElementById('tab-orders');
    const productsView = document.getElementById('shop-products-view');
    const ordersView = document.getElementById('shop-orders-view');

    if (tabShop && tabOrders) {
        tabShop.addEventListener('click', () => {
            tabShop.classList.add('active');
            tabOrders.classList.remove('active');
            productsView.classList.remove('hidden');
            ordersView.classList.add('hidden');
        });

        tabOrders.addEventListener('click', () => {
            tabShop.classList.remove('active');
            tabOrders.classList.add('active');
            productsView.classList.add('hidden');
            ordersView.classList.remove('hidden');
            renderFarmerOrders(); // Fetch from DB when tab clicked
        });
    }

    // Initialize Page
    loadProducts();
});