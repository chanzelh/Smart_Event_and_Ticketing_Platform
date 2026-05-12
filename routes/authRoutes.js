const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// --- GET Routes (Displaying the Forms) ---

// If your login/register are on separate pages:
router.get('/login', (req, res) => {
    const success = req.query.success; 
    res.render('auth/auth', { success: success }); 
});
router.get('/login', (req, res) => res.render('auth/auth'));

// If you are using that combined 'auth/auth.ejs' view you mentioned:
router.get('/', (req, res) => {
    res.render('auth/auth'); 
});

// --- POST Routes (Handling the Logic) ---

// These now point to the functions we just fixed in the controller
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;