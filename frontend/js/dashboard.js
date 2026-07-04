document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 1. LIVE WEATHER API (Open-Meteo)
    // ==========================================
    // ==========================================
    // 1. LIVE WEATHER API (Open-Meteo)
    // ==========================================
    const cityInput = document.getElementById('city-input');
    const btnUpdateCity = document.getElementById('btn-update-city');
    
    // UI Elements
    const uiTemp = document.getElementById('stat-temp');
    const uiHumidity = document.getElementById('stat-humidity');
    const uiWind = document.getElementById('stat-wind');
    const uiWeatherCityLabel = document.getElementById('weather-city-label');
    const uiMainTemp = document.getElementById('main-temp-display');
    const uiMainDesc = document.getElementById('main-weather-desc');

    async function fetchWeather(city) {
        if (!city) return;
        
        // Show loading state
        if(uiMainTemp) uiMainTemp.textContent = "...";
        if(uiMainDesc) uiMainDesc.textContent = "Searching Location...";
        
        try {
            // Step 1: Geocoding
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`);
            const geoData = await geoRes.json();
            
            if (!geoData.results || geoData.results.length === 0) {
                uiMainTemp.textContent = "--°C";
                uiMainDesc.textContent = "Location not found ❌";
                uiWeatherCityLabel.textContent = "Unknown";
                return;
            }

            const { latitude, longitude, name } = geoData.results[0];

            // Step 2: Fetch Weather
            uiMainDesc.textContent = "Fetching weather...";
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`);
            const weatherData = await weatherRes.json();
            const current = weatherData.current;

            // Step 3: Update UI
            const temp = Math.round(current.temperature_2m) + "°C";
            
            if(uiTemp) uiTemp.textContent = temp;
            if(uiMainTemp) uiMainTemp.textContent = temp;
            if(uiHumidity) uiHumidity.textContent = current.relative_humidity_2m + "%";
            if(uiWind) uiWind.textContent = current.wind_speed_10m + " km/h";
            if(uiWeatherCityLabel) uiWeatherCityLabel.textContent = name;
            if(uiMainDesc) uiMainDesc.textContent = getWeatherDescription(current.weather_code);
            
            if(cityInput) cityInput.value = "";
            
        } catch (error) {
            console.error("Weather fetch failed:", error);
            if(uiMainDesc) uiMainDesc.textContent = "API Connection Error";
        }
    }

    function getWeatherDescription(code) {
        if (code === 0) return "Sunny & Clear ☀️";
        if (code >= 1 && code <= 3) return "Partly Cloudy ⛅";
        if (code >= 45 && code <= 48) return "Foggy 🌫️";
        if (code >= 51 && code <= 67) return "Rainy 🌧️";
        if (code >= 71 && code <= 77) return "Snowy ❄️";
        if (code >= 95) return "Thunderstorm ⛈️";
        return "Clear";
    }

    // Manual Event Listeners
    if(btnUpdateCity) {
        btnUpdateCity.addEventListener("click", () => fetchWeather(cityInput.value.trim()));
    }
    if(cityInput) {
        cityInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                fetchWeather(cityInput.value.trim());
            }
        });
    }

    // 🚨 THE RACE-CONDITION FIX: Auto-Load Weather Safely 🚨
    setTimeout(() => {
        const savedSession = localStorage.getItem("annajyoti_user");
        if (savedSession) {
            const farmerData = JSON.parse(savedSession);
            // If they have a city saved, use it. Otherwise, default to Kolkata.
            if (farmerData.city) {
                fetchWeather(farmerData.city);
            } else {
                fetchWeather("Kolkata"); 
            }
        }
    }, 300); // Wait 300ms to ensure everything is fully loaded before fetching

    // Make fetchWeather globally available so auth.js can trigger it on login
    // window.fetchInitialWeather = fetchWeather;

    // ==========================================
    // 2. ENHANCED MARKET PRICES (Dynamic Generator)
    // ==========================================
    const marketTbody = document.getElementById('market-tbody');
    
    const baseCrops = [
        { name: "Wheat", market: "Delhi Mandi", base: 2200 },
        { name: "Rice (Paddy)", market: "Karnal", base: 2100 },
        { name: "Mustard", market: "Jaipur", base: 5400 },
        { name: "Soybean", market: "Indore", base: 4600 },
        { name: "Cotton", market: "Ahmedabad", base: 7000 }
    ];

    function populateMarketPrices() {
        marketTbody.innerHTML = ""; // Clear existing rows
        
        // Randomly pick 3-4 crops to show "Live" action
        const shuffled = baseCrops.sort(() => 0.5 - Math.random()).slice(0, 4);

        shuffled.forEach(crop => {
            // Simulate daily market fluctuation (-5% to +5%)
            const fluctuation = crop.base * (Math.random() * 0.1 - 0.05);
            const livePrice = Math.round(crop.base + fluctuation);
            
            // Determine if price went up (green) or down (red)
            const color = fluctuation >= 0 ? 'color: #2e7d32;' : 'color: #c62828;';
            const arrow = fluctuation >= 0 ? '↑' : '↓';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${crop.name}</strong></td>
                <td>${crop.market}</td>
                <td style="${color}; font-weight: 600;">₹${livePrice} ${arrow}</td>
            `;
            marketTbody.appendChild(row);
        });
    }

    // Load prices initially, and simulate a refresh every 30 seconds
    populateMarketPrices();
    setInterval(populateMarketPrices, 30000);


    // ==========================================
    // 3. CROP RECOMMENDATION ENGINE
    // ==========================================
    // ==========================================
    // 3. CROP RECOMMENDATION ENGINE (AI POWERED)
    // ==========================================
    const btnGetRec = document.getElementById('btn-get-rec');
    const btnResetRec = document.getElementById('btn-reset-rec');
    const inputSection = document.getElementById('crop-input-section');
    const resultSection = document.getElementById('crop-result-section');
    
    // UI Elements
    const uiCropName = document.getElementById('rec-crop-name');
    const uiYieldEst = document.getElementById('rec-yield-est');
    const uiReason = document.getElementById('rec-reason');
    
    btnGetRec.addEventListener("click", async () => {
        const soil = document.getElementById('rec-soil').value;
        const season = document.getElementById('rec-season').value;
        const region = document.getElementById('rec-region').value.trim() || "India";
        const land = parseFloat(document.getElementById('rec-land').value) || 1; 

        // 1. Show Loading State
        btnGetRec.disabled = true;
        btnGetRec.textContent = "AI is thinking... 🧠";

        try {
            // 2. Call your Node.js AI Route
            const res = await fetch('http://localhost:5000/api/ai/recommend-crop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ soil, season, region, land })
            });

            const aiData = await res.json();

            if (res.ok) {
                // 3. Update the UI with real AI data!
                uiCropName.textContent = aiData.crop;
                uiYieldEst.textContent = `Est. Yield: ${aiData.estimatedYield} Quintals (${land} Acres)`;
                uiReason.textContent = `🤖 AI Note: ${aiData.reason}`;

                // Swap panels
                inputSection.classList.add('hidden');
                resultSection.classList.remove('hidden');
            } else {
                alert("AI Engine Error: " + aiData.error);
            }
        } catch (error) {
            console.error(error);
            alert("Could not connect to the AI server.");
        } finally {
            // Reset Button
            btnGetRec.disabled = false;
            btnGetRec.textContent = "Get Recommendation";
        }
    });

    btnResetRec.addEventListener("click", () => {
        resultSection.classList.add('hidden');
        inputSection.classList.remove('hidden');
    });

    // Make fetchWeather globally available so auth.js can trigger it on login
    window.fetchInitialWeather = fetchWeather;
});