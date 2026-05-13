const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Show login/register page
router.get('/login', (req, res) => {
    // If user is already logged in, don't show login; send to home or dashboard
    if (req.session && req.session.user) {
        return res.redirect('/');
    }
    res.render('auth/auth', {
        error: null,
        success: req.query.success || null
    });
});

// Register new user
router.post('/register', authController.register);

// Login existing user
router.post('/login', authController.login);

// Logout user
router.get('/logout', authController.logout);

module.exports = router;