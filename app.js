const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables 
dotenv.config();

const app = express();

// 1. Import Routes from your 'routes' folder [cite: 109]
const indexRoutes = require('./routes/indexRoutes');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');

// 2. Set EJS as the template engine [cite: 16, 95]
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 3. Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Serves CSS and Images 

// 4. Register Routes [cite: 43, 93]
// indexRoutes handles '/', '/dashboard', and '/contact' [cite: 182, 185, 186]
app.use('/', indexRoutes); 

// authRoutes handles '/auth' for login and registration [cite: 51, 183]
app.use('/auth', authRoutes);

// eventRoutes handles '/admin' prefix for '/manage' [cite: 56, 184]
app.use('/admin', eventRoutes);

// 5. Global Error Handling Middleware [cite: 106, 167]
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong on the server!');
});

// 6. Start the Server [cite: 139]
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});