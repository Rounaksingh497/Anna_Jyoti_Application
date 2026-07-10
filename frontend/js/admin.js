document.addEventListener("DOMContentLoaded", () => {
    const API_URL = 'https://anna-jyoti-application-2.onrender.com/api';
    const authScreen = document.getElementById("auth-screen");
    const appScreen = document.getElementById("app-screen");
    
    // UI Elements
    const adminUsername = document.getElementById('admin-username');
    const adminPassword = document.getElementById('admin-password');
    const btnAdminLogin = document.getElementById('btn-admin-login');
    const inventoryList = document.getElementById('admin-inventory-list');
    const ordersList = document.getElementById('admin-orders-list');
    const schemesList = document.getElementById('admin-schemes-list');
    const queriesList = document.getElementById('admin-queries-list'); // New UI Element

    // ==========================================
    // 1. ADMIN LOGIN LOGIC
    // ==========================================
    if (btnAdminLogin) {
        btnAdminLogin.addEventListener('click', (e) => {
            e.preventDefault();
            if (adminUsername.value.trim() === "admin" && adminPassword.value.trim() === "admin497497") {
                launchAdminDashboard();
            } else {
                alert("❌ Invalid Admin Credentials!");
            }
        });
    }

    function launchAdminDashboard() {
        authScreen.classList.remove("active");
        authScreen.classList.add("hidden");
        appScreen.classList.remove("hidden");
        appScreen.classList.add("active");
        
        document.querySelectorAll('.nav-link').forEach(nav => nav.classList.add('hidden')); 
        const nameEl = document.getElementById('nav-farmer-name');
        if (nameEl) {
            nameEl.textContent = "Admin System";
            nameEl.style.color = "var(--saffron)";
        }
        
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active', 'hidden');
            if (page.id !== 'page-admin') page.classList.add('hidden');
        });
        document.getElementById('page-admin').classList.add('active');

        // Load all dashboards
        loadAdminInventory();
        loadAdminOrders();
        loadAdminSchemes();
        loadAdminQueries(); // <-- Added to load support queries on login
    }

    // ==========================================
    // 2. LIVE INVENTORY MANAGEMENT (MongoDB)
    // ==========================================
    async function loadAdminInventory() {
        try {
            const res = await fetch(`${API_URL}/products`);
            const products = await res.json();
            
            document.getElementById('admin-total-products').textContent = products.length;
            inventoryList.innerHTML = "";

            products.forEach(product => {
                const row = document.createElement('tr');
                // Color code stock if running low
                const stockColor = product.stock < 10 ? '#c62828' : 'inherit';
                
                row.innerHTML = `
                    <td style="font-size: 12px; color: #666;">${product._id.slice(-6)}</td>
                    <td style="font-weight: 600;">${product.name}</td>
                    <td><span class="card-badge">${product.category}</span></td>
                    <td>₹${product.price}</td>
                    <td style="font-weight: bold; color: ${stockColor};">${product.stock} Units</td>
                    <td>
                        <button class="btn-sm" onclick="editProduct('${product._id}', '${product.name}', ${product.stock}, ${product.price})" style="background: #e0f2fe; color: #0284c7; border:none; padding:4px 8px; border-radius:4px; margin-right:5px; cursor:pointer;">Edit</button>
                        <button class="btn-sm" onclick="deleteProduct('${product._id}')" style="background: #fee2e2; color: #991b1b; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">Delete</button>
                    </td>
                `;
                inventoryList.appendChild(row);
            });
        } catch (error) {
            console.error("Failed to load inventory", error);
        }
    }

    // Add Product
    const btnAddProduct = document.getElementById('btn-add-product');
    if(btnAddProduct) {
        btnAddProduct.addEventListener('click', async () => {
            const name = document.getElementById('admin-prod-name').value.trim();
            const category = document.getElementById('admin-prod-cat').value;
            const price = parseFloat(document.getElementById('admin-prod-price').value);
            const stockInput = document.getElementById('admin-prod-stock');
            const stock = stockInput ? parseInt(stockInput.value) : 50;
            const image = document.getElementById('admin-prod-img').value.trim() || "./images/default.png";

            if (!name || !price) return alert("Please fill in Name and Price!");

            try {
                await fetch(`${API_URL}/products`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, category, price, image, stock, desc: "New product." })
                });
                alert("✅ Product Added to Database!");
                loadAdminInventory();
            } catch (error) {
                alert("Error adding product.");
            }
        });
    }

    // Delete Product
    window.deleteProduct = async (id) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
        loadAdminInventory(); 
    };

    // Edit Product (Stock & Price)
    window.editProduct = async (id, name, currentStock, currentPrice) => {
        const newStock = prompt(`Update Stock for ${name}:`, currentStock);
        if (newStock === null) return; 
        
        const newPrice = prompt(`Update Price for ${name}:`, currentPrice);
        if (newPrice === null) return;

        try {
            await fetch(`${API_URL}/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stock: parseInt(newStock), price: parseFloat(newPrice) })
            });
            loadAdminInventory();
        } catch (error) {
            alert("Error updating product.");
        }
    };

    // ==========================================
    // 3. ADMIN ORDER MANAGEMENT
    // ==========================================
    async function loadAdminOrders() {
        try {
            const res = await fetch(`${API_URL}/admin/orders`);
            const orders = await res.json();
            
            const topOrderStat = document.getElementById('admin-total-orders');
            if (topOrderStat) topOrderStat.textContent = orders.length;

            const tableOrderBadge = document.getElementById('admin-table-order-count');
            if (tableOrderBadge) tableOrderBadge.textContent = `${orders.length} Orders`;
            
            const revenue = orders.reduce((sum, ord) => sum + ord.total, 0);
            const statValues = document.querySelectorAll('.stat-info .stat-value');
            if (statValues.length >= 3) {
                statValues[2].textContent = `₹${revenue}`;
            }

            ordersList.innerHTML = "";
            orders.forEach(order => {
                const row = document.createElement('tr');
                const itemsStr = order.items.map(i => `${i.name} (x${i.quantity})`).join(', ');

                row.innerHTML = `
                    <td>#${order.orderId}</td>
                    <td style="font-size: 13px; max-width: 200px;">${itemsStr} <br><strong style="color:var(--primary)">👤 ${order.farmerPhone}</strong></td>
                    <td style="font-weight:bold;">₹${order.total}</td>
                    <td style="font-size:12px;">${order.date}</td>
                    <td>
                        <select onchange="updateOrderStatus('${order._id}', this.value)" style="padding: 4px; border-radius: 4px; font-size: 12px; border: 1px solid #ccc;">
                            <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                            <option value="Shipping" ${order.status === 'Shipping' ? 'selected' : ''}>Shipping</option>
                            <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        </select>
                    </td>
                `;
                ordersList.appendChild(row);
            });
        } catch (error) {
            console.error("Failed to load orders", error);
        }
    }

    window.updateOrderStatus = async (id, newStatus) => {
        try {
            await fetch(`${API_URL}/admin/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            alert(`✅ Order status updated to ${newStatus}`);
        } catch (error) {
            alert("Failed to update status");
        }
    };

    // ==========================================
    // 4. ADMIN SCHEME MANAGEMENT
    // ==========================================
    async function loadAdminSchemes() {
        if(!schemesList) return;
        try {
            const res = await fetch(`${API_URL}/schemes`);
            const schemes = await res.json();
            
            const countBadge = document.getElementById('admin-total-schemes');
            if (countBadge) countBadge.textContent = `${schemes.length} Schemes`;

            schemesList.innerHTML = "";
            schemes.forEach(scheme => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td style="font-weight: 600;">${scheme.name}</td>
                    <td><span class="card-badge">${scheme.government}</span></td>
                    <td style="font-size: 12px;">
                        <a href="${scheme.applyLink}" target="_blank" style="color:var(--primary); text-decoration:none;">🔗 Apply Link</a><br>
                        <a href="${scheme.videoLink}" target="_blank" style="color:#c62828; text-decoration:none;">🎥 YouTube</a>
                    </td>
                    <td>
                        <button class="btn-sm" onclick="editScheme('${scheme._id}', '${scheme.name}')" style="background: #e0f2fe; color: #0284c7; border:none; padding:4px 8px; border-radius:4px; margin-right:5px; cursor:pointer;">Edit</button>
                        <button class="btn-sm" onclick="deleteScheme('${scheme._id}')" style="background: #fee2e2; color: #991b1b; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">Delete</button>
                    </td>
                `;
                schemesList.appendChild(row);
            });
        } catch (error) {
            console.error("Failed to load schemes", error);
        }
    }

    const btnAddScheme = document.getElementById('btn-add-scheme');
    if (btnAddScheme) {
        btnAddScheme.addEventListener('click', async () => {
            const name = document.getElementById('admin-scheme-name').value.trim();
            const government = document.getElementById('admin-scheme-govt').value.trim();
            const applyLink = document.getElementById('admin-scheme-link').value.trim();
            const videoLink = document.getElementById('admin-scheme-video').value.trim();
            const description = document.getElementById('admin-scheme-desc').value.trim();

            if (!name || !government) return alert("Please fill in Scheme Name and Government Level!");

            try {
                await fetch(`${API_URL}/schemes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, government, applyLink, videoLink, description })
                });
                alert("✅ Scheme Published!");
                
                // Clear inputs
                document.getElementById('admin-scheme-name').value = '';
                document.getElementById('admin-scheme-govt').value = '';
                document.getElementById('admin-scheme-link').value = '';
                document.getElementById('admin-scheme-video').value = '';
                document.getElementById('admin-scheme-desc').value = '';
                
                loadAdminSchemes();
            } catch (error) {
                alert("Error adding scheme.");
            }
        });
    }

    window.deleteScheme = async (id) => {
        if (!confirm("Are you sure you want to delete this scheme?")) return;
        await fetch(`${API_URL}/schemes/${id}`, { method: 'DELETE' });
        loadAdminSchemes(); 
    };

    window.editScheme = async (id, currentName) => {
        const newName = prompt(`Update Scheme Name for ${currentName}:`, currentName);
        if (newName === null || newName.trim() === "") return;

        try {
            await fetch(`${API_URL}/schemes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName })
            });
            loadAdminSchemes();
        } catch (error) {
            alert("Error updating scheme.");
        }
    };

    // ==========================================
    // 5. ADMIN QUERIES MANAGEMENT
    // ==========================================
    async function loadAdminQueries() {
        if (!queriesList) return;

        try {
            const res = await fetch(`${API_URL}/admin/queries`);
            const queries = await res.json();
            queriesList.innerHTML = "";

            queries.forEach(q => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${q.farmerName || "Farmer"}</strong><br><small>${q.farmerPhone}</small></td>
                    <td><strong>${q.queryType}</strong><br>${q.subject}</td>
                    <td style="font-size:13px; max-width:200px;">${q.detail}</td>
                    <td><span class="card-badge" style="background:${q.status === 'Pending' ? '#fef3c7' : '#dcfce7'};">${q.status}</span></td>
                    <td>
                        ${q.status === 'Pending' 
                            ? `<button class="btn-primary" onclick="respondToQuery('${q._id}')" style="padding: 6px 12px; font-size: 12px;">Reply</button>`
                            : `<span style="color: green; font-size: 12px;">Answered</span>`
                        }
                    </td>
                `;
                queriesList.appendChild(tr);
            });
        } catch (error) {
            console.error("Failed to load queries", error);
        }
    }

    window.respondToQuery = async (id) => {
        const responseText = prompt("Write your response to the farmer:");
        if (!responseText) return;

        try {
            await fetch(`${API_URL}/admin/query/respond/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminResponse: responseText })
            });
            alert("✅ Response sent successfully!");
            loadAdminQueries(); // Refresh the list
        } catch (error) {
            alert("Failed to send response.");
        }
    };
});