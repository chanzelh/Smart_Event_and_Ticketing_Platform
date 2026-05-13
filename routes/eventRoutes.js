const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Note: Middleware (isAuthenticated, authorizeRoles) is already 
// applied in app.js via: app.use('/admin', isAuthenticated, authorizeRoles('Admin'), eventRoutes);
// So we don't need to repeat them on every single line here.

/**
 * ALL ROUTES HERE ARE PREFIXED WITH /admin 
 * (e.g., this first one is http://localhost:3000/admin/manage)
 */

// 1. View all events in a management table
router.get('/manage', eventController.showManageEvents);

// 2. Form to create a new event
router.get('/create', (req, res) => {
    res.render('admin/create-event');
});

// 3. Logic to handle creating the event
router.post('/create', eventController.createEvent);

// 4. Form to edit an existing event
router.get('/edit/:id', eventController.showEditEventForm);

// 5. Logic to update the event
router.post('/edit/:id', eventController.updateEvent);

// 6. Delete an event
router.post('/delete/:id', eventController.deleteEvent);

// 7. Admin Dashboard / Stats
router.get('/dashboard', eventController.getAdminDashboard);
router.get('/merchant/dashboard', eventController.getMerchantDashboard);

module.exports = router;