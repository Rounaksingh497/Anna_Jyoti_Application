require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs'); 

// Models
const Farmer = require('./models/Farmer');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Scheme = require('./models/Scheme'); 
const SupportQuery = require('./models/support'); // <-- New Support Model Imported!

const app = express();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());

// ==========================================
// SEED DATA (Products & Schemes)
// ==========================================
const defaultProducts = [
    { name: "Premium Wheat Seeds (PBW 343)", category: "Seeds", price: 850, image: "./images/wheat.png", desc: "High yield, rust-resistant wheat seeds. 10kg bag.", stock: 50 },
    { name: "Hybrid Tomato Seeds", category: "Seeds", price: 150, image: "./images/tomato.png", desc: "Disease-resistant, high-yield hybrid seeds. 100g.", stock: 50 },
    { name: "Basmati Rice Seeds (Pusa 1121)", category: "Seeds", price: 920, image: "./images/rice.png", desc: "Long-grain, aromatic basmati paddy seeds. 10kg.", stock: 50 },
    { name: "Bt Cotton Seeds", category: "Seeds", price: 750, image: "./images/cotton.png", desc: "Bollworm-resistant premium cotton seeds. 450g packet.", stock: 50 },
    { name: "Sweet Corn Seeds", category: "Seeds", price: 200, image: "./images/corn.png", desc: "High-sugar, fast-growing sweet corn seeds. 500g.", stock: 50 },
    { name: "Red Onion Seeds", category: "Seeds", price: 300, image: "./images/onion.png", desc: "High-germination rate onion seeds for Kharif. 250g.", stock: 50 },
    { name: "Organic Urea Fertilizer", category: "Fertilizers", price: 450, image: "./images/urea.png", desc: "Nitrogen-rich organic fertilizer for rapid growth. 50kg.", stock: 50 },
    { name: "Neem Oil Bio-Pesticide", category: "Fertilizers", price: 320, image: "./images/neem.png", desc: "100% natural pest repellent and fungicide. 1 Liter.", stock: 50 },
    { name: "NPK 19:19:19 Water Soluble", category: "Fertilizers", price: 180, image: "./images/npk.png", desc: "Balanced nutrient mix for all crop stages. 1kg.", stock: 50 },
    { name: "Premium Vermicompost", category: "Fertilizers", price: 250, image: "./images/compost.png", desc: "Enriched earthworm compost for soil health. 25kg.", stock: 50 },
    { name: "DAP (Diammonium Phosphate)", category: "Fertilizers", price: 1350, image: "./images/dap.png", desc: "Highly soluble phosphorus for root development. 50kg.", stock: 50 },
    { name: "Zinc Sulfate", category: "Fertilizers", price: 400, image: "./images/zinc.png", desc: "Cures zinc deficiency in paddy and wheat. 5kg.", stock: 50 },
    { name: "Heavy Duty Sickle", category: "Tools", price: 220, image: "./images/sickle.png", desc: "Carbon steel blade with ergonomic wooden grip.", stock: 50 },
    { name: "Kisan Sprayer Pump", category: "Tools", price: 1250, image: "./images/sprayer.png", desc: "16-Liter manual knapsack sprayer with brass nozzle.", stock: 50 },
    { name: "Steel Farming Shovel", category: "Tools", price: 350, image: "./images/shovel.png", desc: "Rust-resistant flat spade with sturdy iron handle.", stock: 50 },
    { name: "Pruning Shears", category: "Tools", price: 280, image: "./images/shears.png", desc: "Sharp bypass pruners for cutting thick branches.", stock: 50 },
    { name: "Heavy Duty Tarpaulin", category: "Tools", price: 850, image: "./images/tarpaulin.png", desc: "Waterproof 12x15 ft cover for protecting harvested crops.", stock: 50 },
    { name: "Drip Irrigation Pipe", category: "Tools", price: 1100, image: "./images/pipe.png", desc: "16mm thick, UV-resistant drip lateral pipe. 100 meters.", stock: 50 }
];

const defaultSchemes = [
    { name: "PM-KISAN (Kisan Samman Nidhi)", government: "Central Government", applyLink: "https://pmkisan.gov.in/", videoLink: "https://youtube.com/results?search_query=how+to+apply+pm+kisan", description: "Direct income support of ₹6,000 per year transferred in three equal installments directly to farmer bank accounts." },
    { name: "PMFBY (Fasal Bima Yojana)", government: "Central Government", applyLink: "https://pmfby.gov.in/", videoLink: "https://youtube.com/results?search_query=how+to+apply+pmfby", description: "Comprehensive crop insurance scheme protecting farmers from non-preventable natural risks from pre-sowing to post-harvest." },
    { name: "Kisan Credit Card (KCC)", government: "Central Government", applyLink: "https://sbi.co.in/web/agri-rural/agriculture-banking/crop-loan/kisan-credit-card", videoLink: "https://youtube.com/results?search_query=how+to+apply+kisan+credit+card", description: "Provides farmers with timely and adequate credit support from the banking system under a single window with flexible repayment." },
    { name: "Soil Health Card Scheme", government: "Central Government", applyLink: "https://soilhealth.dac.gov.in/", videoLink: "https://youtube.com/results?search_query=how+to+apply+soil+health+card", description: "Provides farmers with crop-wise recommendations of appropriate nutrients and fertilizers to improve crop productivity." },
    { name: "PKVY (Paramparagat Krishi Vikas)", government: "Central Government", applyLink: "https://pgsindia-ncof.gov.in/", videoLink: "https://youtube.com/results?search_query=Paramparagat+Krishi+Vikas+Yojana+apply", description: "Promotes organic farming through cluster approach. Financial assistance is provided to farmers for organic transition." },
    { name: "PMKSY (Krishi Sinchayee Yojana)", government: "Central Government", applyLink: "https://www.myscheme.gov.in/schemes/pmksypdmc", videoLink: "https://youtube.com/results?search_query=how+to+apply+pmksy", description: "Focuses on expanding cultivable area under assured irrigation, improving on-farm water use efficiency (Per Drop More Crop)." },
    { name: "e-NAM (National Agriculture Market)", government: "Central Government", applyLink: "https://enam.gov.in/", videoLink: "https://youtube.com/results?search_query=enam+registration+process", description: "Pan-India electronic trading portal that networks existing APMC mandis to create a unified national market for agricultural commodities." },
    { name: "RKVY (Rashtriya Krishi Vikas)", government: "State Governments", applyLink: "https://rkvy.da.gov.in/", videoLink: "https://youtube.com/results?search_query=RKVY+scheme+full+process", description: "Provides States flexibility to plan and execute agriculture development schemes based on local needs to maximize farmer returns." }
];

// Connect to MongoDB and Seed Data
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB');
    
        const prodCount = await Product.countDocuments();
        if (prodCount === 0) {
            console.log('🌱 Seeding default Products...');
            await Product.insertMany(defaultProducts);
        } else {
            console.log(`Found ${prodCount} products in DB`);
        }

        const schemeCount = await Scheme.countDocuments();
        if (schemeCount === 0) {
            console.log('🏛️ Seeding default Government Schemes...');
            await Scheme.insertMany(defaultSchemes);
        } else {
            console.log(`Found ${schemeCount} schemes in DB`);
        }
    })
    .catch(err => console.error('❌ MongoDB connection error:', err));

app.get('/', (req, res) => res.send("🌾 AnnaJyoti API is running perfectly!"));

// ==========================================
// AUTH ROUTES & PROFILE MANAGEMENT
// ==========================================
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, phone, password, city, state, landAcres } = req.body;
        const existingFarmer = await Farmer.findOne({ phone });
        if (existingFarmer) return res.status(400).json({ error: 'Mobile number already exists.' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newFarmer = new Farmer({ name, phone, password: hashedPassword, city, state, landAcres });
        await newFarmer.save();
        res.status(201).json({ message: 'Account created!', farmer: { name: newFarmer.name, phone: newFarmer.phone, city: newFarmer.city, state: newFarmer.state, landAcres: newFarmer.landAcres } });
    } catch (error) {
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { phone, password } = req.body;
        const farmer = await Farmer.findOne({ phone });
        if (!farmer) return res.status(404).json({ error: 'Account not found.' });

        const isMatch = await bcrypt.compare(password, farmer.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid password.' });

        res.json({ message: 'Login successful!', farmer: { name: farmer.name, phone: farmer.phone, city: farmer.city, state: farmer.state, landAcres: farmer.landAcres } });
    } catch (error) {
        res.status(500).json({ error: 'Server error during login.' });
    }
});

app.put('/api/auth/update-profile', async (req, res) => {
    try {
        const { phone, name, city, state, landAcres } = req.body;
        const updatedFarmer = await Farmer.findOneAndUpdate(
            { phone }, 
            { name, city, state, landAcres }, 
            { new: true }
        );
        res.json({ message: 'Profile updated', farmer: { name: updatedFarmer.name, phone: updatedFarmer.phone, city: updatedFarmer.city, state: updatedFarmer.state, landAcres: updatedFarmer.landAcres } });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile.' });
    }
});

app.put('/api/auth/change-password', async (req, res) => {
    try {
        const { phone, currentPassword, newPassword } = req.body;
        const farmer = await Farmer.findOne({ phone });
        
        if (!farmer) return res.status(404).json({ error: 'User not found.' });

        const isMatch = await bcrypt.compare(currentPassword, farmer.password);
        if (!isMatch) return res.status(401).json({ error: 'Incorrect current password.' });

        const salt = await bcrypt.genSalt(10);
        farmer.password = await bcrypt.hash(newPassword, salt);
        await farmer.save();
        
        res.json({ message: 'Password changed successfully.' });
    } catch (error) {
        console.error("Password Change Error:", error);
        res.status(500).json({ error: 'Server error during password change.' });
    }
});

// ==========================================
// SUPPORT QUERY ROUTES
// ==========================================
app.post('/api/support/query', async (req, res) => {
    try {
        console.log("📥 Incoming Query:", req.body);
        const newQuery = new SupportQuery(req.body);
        await newQuery.save();
        res.status(201).json({ message: 'Query submitted successfully' });
    } catch (error) {
        console.error("❌ DB ERROR saving query:", error);
        res.status(500).json({ error: error.message || 'Failed to submit query to the database.' });
    }
});

app.get('/api/support/my-queries/:phone', async (req, res) => {
    try {
        const queries = await SupportQuery.find({ farmerPhone: req.params.phone }).sort({ _id: -1 });
        res.json(queries);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch your queries.' });
    }
});

app.get('/api/admin/queries', async (req, res) => {
    try {
        const queries = await SupportQuery.find().sort({ _id: -1 });
        res.json(queries);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch admin queries.' });
    }
});

app.put('/api/admin/query/respond/:id', async (req, res) => {
    try {
        const { adminResponse } = req.body;
        await SupportQuery.findByIdAndUpdate(req.params.id, { adminResponse, status: "Answered" });
        res.json({ message: 'Response sent successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send response.' });
    }
});

// ==========================================
// AI / CHATBOT ROUTES
// ==========================================
app.post('/api/ai/recommend-crop', async (req, res) => {
    try {
        const { soil, season, region, land } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `You are an expert Indian agricultural agronomist. A farmer in ${region} has ${land} acres of ${soil} soil. The upcoming season is ${season}. Recommend the single best crop for them to maximize profit and yield. You must reply ONLY with a valid JSON object in exactly this format: {"crop": "Name", "estimatedYield": "Yield in Quintals", "reason": "1 short sentence reason"}`;
        
        const result = await model.generateContent(prompt);
        const cleanJsonString = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        res.json(JSON.parse(cleanJsonString));
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate AI recommendation.' });
    }
});

app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const prompt = `You are AI Mitra, an intelligent agricultural assistant for Indian farmers on the AnnaJyoti platform.
        STRICT BOUNDARIES: 
        1. You are strictly a FARMING expert. If the user asks about ANYTHING not related to agriculture, farming, crops, weather, livestock, market prices, pests, or agricultural schemes, you MUST politely refuse to answer. Say something like: "I am AI Mitra, an agricultural assistant. I can only answer questions related to farming and agriculture."
        2. Do NOT write code, solve math equations, or discuss politics/entertainment.
        LANGUAGE RULES:
        1. Detect the language the user is speaking (or typing) and reply in the EXACT SAME LANGUAGE. 
        Answer concisely and practically. 
        User Query: "${message}"`;
        
        const result = await model.generateContent(prompt);
        res.json({ reply: result.response.text() });
    } catch (error) {
        console.error("AI Chat Error:", error);
        res.status(500).json({ error: 'Failed to generate response.' });
    }
});

// ==========================================
// PRODUCT ROUTES
// ==========================================
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add product' });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// ==========================================
// ORDER ROUTES
// ==========================================
app.post('/api/orders', async (req, res) => {
    try {
        const { farmerPhone, items, total, date } = req.body;
        const orderId = "ORD" + Date.now().toString().slice(-6);

        const newOrder = new Order({ orderId, farmerPhone, items, total, date });
        await newOrder.save();

        for (let item of items) {
            await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
        }

        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ error: 'Failed to place order' });
    }
});

app.get('/api/orders/farmer/:phone', async (req, res) => {
    try {
        const orders = await Order.find({ farmerPhone: req.params.phone }).sort({ _id: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch farmer orders' });
    }
});

app.get('/api/admin/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ _id: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch all orders' });
    }
});

app.put('/api/admin/orders/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// ==========================================
// SCHEME ROUTES
// ==========================================
app.get('/api/schemes', async (req, res) => {
    try {
        const schemes = await Scheme.find();
        res.json(schemes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch schemes' });
    }
});

app.post('/api/schemes', async (req, res) => {
    try {
        const newScheme = new Scheme(req.body);
        await newScheme.save();
        res.status(201).json(newScheme);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add scheme' });
    }
});

app.put('/api/schemes/:id', async (req, res) => {
    try {
        const updatedScheme = await Scheme.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedScheme);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update scheme' });
    }
});

app.delete('/api/schemes/:id', async (req, res) => {
    try {
        await Scheme.findByIdAndDelete(req.params.id);
        res.json({ message: 'Scheme deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete scheme' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 AnnaJyoti Server running on http://localhost:${PORT}`));