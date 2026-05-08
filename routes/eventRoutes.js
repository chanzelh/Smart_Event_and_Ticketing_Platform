// routes/eventRoutes.js
const express = require('express');
const router = express.Router();

// This handles GET requests to /admin/manage
router.get('/manage', (req, res) => {
    // Points to views/admin/manage.ejs [cite: 56, 184]
    res.render('admin/manage', { user: { role: 'Admin' } }); 
});

module.exports = router;