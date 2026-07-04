document.addEventListener("DOMContentLoaded", () => {
    const API_BASE_URL = 'http://localhost:5000/api/auth';
    
    const authScreen = document.getElementById("auth-screen");
    const appScreen = document.getElementById("app-screen");
    
    // UI Elements
    const loginPhoneInput = document.getElementById("login-phone");
    const loginPasswordInput = document.getElementById("login-password");
    const btnLogin = document.getElementById("btn-login");
    
    const regNameInput = document.getElementById("reg-name");
    const regPhoneInput = document.getElementById("reg-phone");
    const regPasswordInput = document.getElementById("reg-password");
    const regCityInput = document.getElementById("reg-city");
    const regStateInput = document.getElementById("reg-state");
    const regLandInput = document.getElementById("reg-land");
    const btnRegister = document.getElementById("btn-register");
    const btnLogout = document.getElementById("btn-logout");

    // ==========================================
    // 1. SESSION CHECK (Auto-Login)
    // ==========================================
    // Check if the user is already saved in LocalStorage when the page loads
    const savedSession = localStorage.getItem("annajyoti_user");
    if (savedSession) {
        const farmerData = JSON.parse(savedSession);
        console.log("🔄 Found active session! Auto-logging in...");
        launchDashboard(farmerData);
    }

    // Tab Switching Logic
    const authTabs = document.querySelectorAll(".auth-tab");
    const formBlocks = document.querySelectorAll(".auth-form-block");

    authTabs.forEach(tab => {
        tab.addEventListener("click", (e) => {
            authTabs.forEach(t => t.classList.remove("active"));
            formBlocks.forEach(f => f.classList.remove("active"));
            e.target.classList.add("active");
            document.getElementById(`form-${e.target.getAttribute("data-tab")}`).classList.add("active");
        });
    });

    // ==========================================
    // 2. DASHBOARD LAUNCHER
    // ==========================================
    // ==========================================
    // 2. DASHBOARD LAUNCHER (Strict Farmer View)
    // ==========================================
    function launchDashboard(farmerData) {
        // SAVE TO LOCAL STORAGE
        localStorage.setItem("annajyoti_user", JSON.stringify(farmerData));
        
        // Swap screens
        authScreen.classList.remove("active");
        authScreen.classList.add("hidden");
        appScreen.classList.remove("hidden");
        appScreen.classList.add("active");
        window.scrollTo(0, 0);

        // 🚨 ROLE SECURITY: Force Farmer View, Hide Admin View
        document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
        document.getElementById('page-dashboard').classList.remove('hidden');
        document.getElementById('page-dashboard').classList.add('active');
        
        // Ensure normal Farmer Navigation is visible
        document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('hidden'));
        
        // Inject Data
        const nameEl = document.getElementById('nav-farmer-name');
        const greetingEl = document.getElementById('dash-greeting');
        const cityEl = document.getElementById('city-input');

        if (nameEl) nameEl.textContent = farmerData.name || "Farmer";
        if (nameEl) nameEl.style.color = ""; // Reset color in case admin changed it
        if (greetingEl) greetingEl.textContent = `Good Morning, ${farmerData.name || "Farmer"}! 🌅`;
        
        // Trigger Weather
        if (cityEl && farmerData.city && window.fetchInitialWeather) {
            cityEl.value = farmerData.city;
            setTimeout(() => {
                const updateBtn = document.getElementById('btn-update-city');
                if(updateBtn) updateBtn.click();
            }, 100);
        }
    }

    // ==========================================
    // 3. LOGIN & REGISTER LOGIC
    // ==========================================
    btnLogin.addEventListener("click", async (e) => {
        e.preventDefault();
        const phone = loginPhoneInput.value.trim();
        const password = loginPasswordInput.value.trim();

        if (!phone || !password) return alert("Please enter both phone number and password.");

        btnLogin.disabled = true;
        btnLogin.textContent = "Logging in...";

        try {
            const res = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, password })
            });
            const data = await res.json();
            
            if (res.ok) launchDashboard(data.farmer);
            else alert(`Login Failed: ${data.error}`);
        } catch (error) {
            alert("Connection error. Is the Node.js server running?");
        } finally {
            btnLogin.disabled = false;
            btnLogin.textContent = "Login →";
        }
    });

    btnRegister.addEventListener("click", async (e) => {
        e.preventDefault();
        const name = regNameInput.value.trim();
        const phone = regPhoneInput.value.trim();
        const password = regPasswordInput.value.trim();
        const city = regCityInput.value.trim();
        const state = regStateInput.value;
        const landAcres = regLandInput.value;

        if (!name || phone.length !== 10 || !password) return alert("Please fill in Name, 10-digit Phone, and Password.");

        btnRegister.disabled = true;
        btnRegister.textContent = "Creating...";

        try {
            const res = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, password, city, state, landAcres })
            });
            const data = await res.json();
            
            if (res.ok) {
                alert("🎉 Registration Successful! Welcome to AnnaJyoti.");
                launchDashboard(data.farmer);
            } else {
                alert(`Registration Failed: ${data.error}`);
            }
        } catch (error) {
            alert("Connection error. Is the server running?");
        } finally {
            btnRegister.disabled = false;
            btnRegister.textContent = "Create My Account ✓";
        }
    });

    // ==========================================
    // 4. LOGOUT (Clear Session)
    // ==========================================
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            // WIPE FROM LOCAL STORAGE
            localStorage.removeItem("annajyoti_user");
            
            // Return to Auth Screen
            appScreen.classList.remove("active");
            appScreen.classList.add("hidden");
            authScreen.classList.remove("hidden");
            authScreen.classList.add("active");
            window.scrollTo(0, 0);
            
            // Clear inputs
            loginPhoneInput.value = '';
            loginPasswordInput.value = '';
        });
    }
});