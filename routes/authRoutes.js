const express = require('express');
const router = express.Router();

// This matches the GET request when you click "Login / Register" in the header
router.get('/', (req, res) => {
    // We point to the 'auth' subfolder, then the 'auth' file
    // We pass 'user: null' so the header doesn't try to greet a non-existent user
    res.render('auth/auth', { user: null }); 
});

// These will be used for Task 1: Project Setup & Security 
router.post('/register', (req, res) => {
    // Placeholder for registration logic (bcrypt, Mongoose) 
    res.send('Registration logic coming in Task 1');
});

router.post('/login', (req, res) => {
    // Placeholder for login logic 
    res.send('Login logic coming in Task 1');
});
const authController = require('../controllers/authController');

router.get('/register', (req, res) => res.render('register'));
router.post('/register', authController.register);

router.get('/login', (req, res) => res.render('login'));
router.post('/login', authController.login);

module.exports = router;