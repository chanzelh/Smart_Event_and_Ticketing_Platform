const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const authController = require('../controllers/authController');

// Show login/register page
router.get('/', (req, res) => {
    res.render('auth/auth', {
        user: req.session ? req.session.user : null
    });
});

// Register new user
router.post('/register', authController.register);

// Login existing user
router.post('/login', authController.login);

// Logout user
router.get('/logout', authController.logout);

module.exports = router;