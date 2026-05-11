const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');

dotenv.config();

const connectDB = require('./config/db');
connectDB();

const app = express();

// Import routes
const indexRoutes = require('./routes/indexRoutes');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
// This must come BEFORE your routes
app.use(session({
    secret: process.env.SESSION_SECRET || 'temporarysecret',
    resave: false,
    saveUninitialized: false
}));

// Makes the logged-in user available inside all EJS pages
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Register routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/admin', eventRoutes);

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong on the server!');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});