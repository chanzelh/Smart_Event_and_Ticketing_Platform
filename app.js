
const express = require('express');
const app = express();
const path = require('path');

// 1. Set EJS as the template engine [cite: 95, 101]
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2. Serve static files (CSS, Images, JS) from the public folder [cite: 41, 122]
app.use(express.static(path.join(__dirname, 'public')));

// 3. Define the Home Page Route [cite: 46, 182]
app.get('/', (req, res) => {
    res.render('home'); // This looks for views/home.ejs
});

// 4. Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
app.use(express.static('public'));