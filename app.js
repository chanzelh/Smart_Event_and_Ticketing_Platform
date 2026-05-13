const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');
const { isAuthenticated, authorizeRoles } = require('./middleware/authMiddleware');

dotenv.config();

const connectDB = require('./config/db');
connectDB();

const app = express();

// Import routes
const indexRoutes = require('./routes/indexRoutes.js');
const authRoutes = require('./routes/authRoutes.js');
const eventRoutes = require('./routes/eventRoutes.js');

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'temporarysecret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Makes the logged-in user available inside all EJS pages
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// --- REGISTER ROUTES ---

// Public Routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);

// Protected Admin Routes
// This ensures only logged-in users with the 'admin' role can access /admin/...
app.use('/admin', isAuthenticated, authorizeRoles('Admin', 'Merchant'), eventRoutes);

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error("DEBUG ERROR:", err.stack); // ADD THIS LINE
    res.status(500).send('Something went wrong on the server!');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});