document.addEventListener("DOMContentLoaded", () => {
    const API_URL = 'http://localhost:5000/api';
    const schemesGrid = document.getElementById('schemes-grid');

    async function loadFarmerSchemes() {
        if (!schemesGrid) return;
        
        try {
            const res = await fetch(`${API_URL}/schemes`);
            const schemes = await res.json();

            schemesGrid.innerHTML = ""; // Clear loader
            
            schemes.forEach(scheme => {
                const card = document.createElement('div');
                card.className = "dash-card";
                card.style.cssText = "display: flex; flex-direction: column; justify-content: space-between;";
                
                card.innerHTML = `
                    <div>
                        <div style="display:flex; justify-content:space-between; margin-bottom: 10px;">
                            <span class="card-badge" style="background: var(--green-100); color: var(--green-700);">${scheme.government}</span>
                        </div>
                        <h3 style="font-family: var(--font-display); font-size: 20px; color: var(--green-900); margin-bottom: 8px;">${scheme.name}</h3>
                        <p style="font-size: 14px; color: var(--text-muted); line-height: 1.5; margin-bottom: 20px;">${scheme.description}</p>
                    </div>
                    
                    <div style="display: flex; gap: 10px;">
                        <a href="${scheme.applyLink}" target="_blank" class="btn-primary" style="flex: 1; text-align: center; text-decoration: none; padding: 10px;">
                            📝 Apply Here
                        </a>
                        <a href="${scheme.videoLink}" target="_blank" class="btn-ghost" style="flex: 1; text-align: center; text-decoration: none; padding: 10px; border-color: #f87171; color: #b91c1c;">
                            🎥 Watch Guide
                        </a>
                    </div>
                `;
                schemesGrid.appendChild(card);
            });

        } catch (error) {
            console.error("Error loading schemes:", error);
            schemesGrid.innerHTML = "<p style='text-align:center; color:red;'>Could not load schemes. Please check connection.</p>";
        }
    }

    // Load schemes immediately
    loadFarmerSchemes();
});