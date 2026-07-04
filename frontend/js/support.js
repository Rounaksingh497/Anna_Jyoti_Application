document.addEventListener("DOMContentLoaded", () => {
    const API_URL = 'http://localhost:5000/api';
    
    // ==========================================
    // 1. PROFILE DROPDOWN LOGIC
    // ==========================================
    const userBtn = document.getElementById('nav-user-btn');
    const dropdown = document.getElementById('profile-dropdown');
    
    if (userBtn && dropdown) {
        userBtn.addEventListener('click', (e) => {
            // Prevent toggling if the logout button is clicked directly
            if (e.target.id !== 'btn-logout') {
                dropdown.classList.toggle('hidden');
            }
        });
        
        // Close dropdown when clicking outside of it
        document.addEventListener('click', (e) => {
            if (!userBtn.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
    }

    // ==========================================
    // 2. MODAL CONTROLS
    // ==========================================
    const openModal = (id) => { 
        document.getElementById(id).classList.remove('hidden'); 
        if (dropdown) dropdown.classList.add('hidden'); 
    };
    
    const closeModal = (id) => {
        document.getElementById(id).classList.add('hidden');
    };

    // Open Modals from Dropdown
    document.getElementById('menu-settings')?.addEventListener('click', () => {
        // Pre-fill existing data
        const sessionData = JSON.parse(localStorage.getItem('annajyoti_user') || '{}');
        document.getElementById('set-name').value = sessionData.name || '';
        document.getElementById('set-city').value = sessionData.city || '';
        document.getElementById('set-state').value = sessionData.state || '';
        document.getElementById('set-land').value = sessionData.landAcres || '';
        openModal('modal-settings');
    });
    
    document.getElementById('menu-password')?.addEventListener('click', () => {
        document.getElementById('pass-current').value = '';
        document.getElementById('pass-new').value = '';
        openModal('modal-password');
    });
    
    document.getElementById('menu-queries')?.addEventListener('click', () => {
        openModal('modal-queries');
        fetchMyQueries(); // Load queries immediately when opened
    });

    // Close Modal Buttons
    document.querySelectorAll('.close-settings').forEach(btn => btn.addEventListener('click', () => closeModal('modal-settings')));
    document.querySelectorAll('.close-password').forEach(btn => btn.addEventListener('click', () => closeModal('modal-password')));
    document.querySelectorAll('.close-queries').forEach(btn => btn.addEventListener('click', () => closeModal('modal-queries')));

    // ==========================================
    // 3. EDIT PROFILE SETTINGS
    // ==========================================
    const btnSaveSettings = document.getElementById('btn-save-settings');
    if (btnSaveSettings) {
        btnSaveSettings.addEventListener('click', async () => {
            const sessionData = JSON.parse(localStorage.getItem('annajyoti_user'));
            if (!sessionData) return alert("Session expired. Please log in again.");

            const payload = {
                phone: sessionData.phone,
                name: document.getElementById('set-name').value.trim(),
                city: document.getElementById('set-city').value.trim(),
                state: document.getElementById('set-state').value.trim(),
                landAcres: document.getElementById('set-land').value
            };

            btnSaveSettings.disabled = true;
            btnSaveSettings.innerText = "Saving... ⏳";

            try {
                const res = await fetch(`${API_URL}/auth/update-profile`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                if (res.ok) {
                    alert("✅ Profile updated successfully!");
                    // Update Local Storage & UI
                    localStorage.setItem('annajyoti_user', JSON.stringify({ ...sessionData, ...payload }));
                    const nameEl = document.getElementById('nav-farmer-name');
                    if (nameEl) nameEl.textContent = payload.name;
                    closeModal('modal-settings');
                } else {
                    const data = await res.json();
                    alert(`❌ Failed to update: ${data.error}`);
                }
            } catch (error) {
                alert("🔌 Network Error: Could not connect to the server.");
            } finally {
                btnSaveSettings.disabled = false;
                btnSaveSettings.innerText = "Save Changes";
            }
        });
    }

    // ==========================================
    // 4. CHANGE PASSWORD LOGIC
    // ==========================================
    const btnSavePassword = document.getElementById('btn-save-password');
    if (btnSavePassword) {
        btnSavePassword.addEventListener('click', async () => {
            const sessionData = JSON.parse(localStorage.getItem('annajyoti_user'));
            const currentPassword = document.getElementById('pass-current').value;
            const newPassword = document.getElementById('pass-new').value;

            if (!currentPassword || !newPassword) return alert("⚠️ Please fill in all password fields.");
            if (newPassword.length < 6) return alert("⚠️ New password must be at least 6 characters.");

            btnSavePassword.disabled = true;
            btnSavePassword.innerText = "Updating... ⏳";

            try {
                const res = await fetch(`${API_URL}/auth/change-password`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        phone: sessionData.phone, 
                        currentPassword, 
                        newPassword 
                    })
                });
                const data = await res.json();
                
                if (res.ok) {
                    alert("✅ Password Changed Successfully!");
                    closeModal('modal-password');
                } else {
                    alert(`❌ ${data.error}`);
                }
            } catch (error) {
                alert("🔌 Network Error: Could not connect to the server.");
            } finally {
                btnSavePassword.disabled = false;
                btnSavePassword.innerText = "Update Password";
            }
        });
    }

    // ==========================================
    // 5. ROBUST SUBMIT QUERY LOGIC (Right Side)
    // ==========================================
    const btnSubmitQuery = document.getElementById('btn-submit-query');
    if (btnSubmitQuery) {
        btnSubmitQuery.addEventListener('click', async () => {
            try {
                const sessionString = localStorage.getItem('annajyoti_user');
                if (!sessionString) {
                    alert("❌ Please log in first to submit a query.");
                    return;
                }
                
                const sessionData = JSON.parse(sessionString);
                
                const queryType = document.getElementById('query-type').value;
                const subject = document.getElementById('query-subject').value.trim();
                const detail = document.getElementById('query-detail').value.trim();

                if (!subject || !detail) {
                    alert("⚠️ Please provide both a subject and details for your query.");
                    return;
                }

                btnSubmitQuery.disabled = true;
                btnSubmitQuery.innerText = "Submitting... ⏳";

                const res = await fetch(`${API_URL}/support/query`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        farmerPhone: sessionData.phone,
                        farmerName: sessionData.name || "Farmer",
                        queryType: queryType,
                        subject: subject,
                        detail: detail
                    })
                });

                let data;
                try { data = await res.json(); } catch (err) { data = { error: "Invalid server response" }; }

                if (res.ok) {
                    alert("✅ Query Submitted Successfully! You can track it in 'My Queries' under your profile.");
                    document.getElementById('query-subject').value = '';
                    document.getElementById('query-detail').value = '';
                } else {
                    alert(`❌ Server Error: ${data.error || 'Failed to save query.'}`);
                }

            } catch (error) {
                console.error("Submit Query Error:", error);
                alert("🔌 Network Error: Could not connect to the server. Please ensure your backend is running.");
            } finally {
                btnSubmitQuery.disabled = false;
                btnSubmitQuery.innerText = "Submit Query";
            }
        });
    }

    // ==========================================
    // 6. FETCH MY QUERIES (Modal Content)
    // ==========================================
    async function fetchMyQueries() {
        const list = document.getElementById('my-queries-list');
        if (!list) return;

        const sessionData = JSON.parse(localStorage.getItem('annajyoti_user'));
        if (!sessionData) return;

        list.innerHTML = `<p style="text-align: center; color: var(--text-muted);">Loading queries... ⏳</p>`;

        try {
            const res = await fetch(`${API_URL}/support/my-queries/${sessionData.phone}`);
            const queries = await res.json();

            if (queries.length === 0) {
                list.innerHTML = `<p style="text-align: center; padding: 20px; color: var(--text-muted);">You have no previous queries.</p>`;
                return;
            }

            list.innerHTML = "";
            queries.forEach(q => {
                const statusColor = q.status === 'Answered' ? '#dcfce7' : '#fef3c7';
                const statusText = q.status === 'Answered' ? '#166534' : '#b45309';

                list.innerHTML += `
                    <div style="border: 1px solid var(--border); padding: 16px; border-radius: var(--r); background: var(--white); box-shadow: var(--sh-sm);">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-size: 12px; color: var(--text-muted); font-weight: 700;">${q.date} • ${q.queryType}</span>
                            <span style="font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 999px; background: ${statusColor}; color: ${statusText};">${q.status}</span>
                        </div>
                        <h4 style="color: var(--green-900); margin: 0 0 8px 0; font-family: var(--font-display); font-size: 18px;">${q.subject}</h4>
                        <p style="font-size: 14px; margin-bottom: 12px; color: var(--gray-600); line-height: 1.5;">${q.detail}</p>
                        
                        <div style="background: ${q.status === 'Answered' ? '#f0fdf4' : '#f8fafc'}; padding: 12px; border-radius: 8px; border-left: 3px solid ${q.status === 'Answered' ? '#22c55e' : '#cbd5e1'};">
                            <strong style="font-size: 13px; color: var(--green-900);">Krishi Mitra Response:</strong><br>
                            <span style="font-size: 14px; color: var(--text);">
                                ${q.adminResponse || "<em style='color: var(--text-muted);'>Pending response from support team...</em>"}
                            </span>
                        </div>
                    </div>
                `;
            });
        } catch (error) {
            list.innerHTML = `<p style="text-align: center; color: red;">Failed to load queries.</p>`;
        }
    }

    // ==========================================
    // 7. FAQ ACCORDION LOGIC (Left Side)
    // ==========================================
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', function() {
            const item = this.parentElement;
            
            // Close all other items
            document.querySelectorAll('.faq-item').forEach(i => { 
                if(i !== item) i.classList.remove('active'); 
            });
            
            // Toggle the clicked item
            item.classList.toggle('active');
        });
    });
});