// routes/eventRoutes.js

const express = require('express');
const router = express.Router();

const eventController = require('../controllers/eventController');
const bookingController = require('../controllers/bookingController');

const {
    isAuthenticated,
    authorizeRoles
} = require('../middleware/authMiddleware');

// Admin/Merchant event management
router.get(
    '/manage',
    isAuthenticated,
    authorizeRoles('Admin', 'Merchant'),
    eventController.showManageEvents
);

router.post(
    '/create',
    isAuthenticated,
    authorizeRoles('Admin', 'Merchant'),
    eventController.createEvent
);

router.get(
    '/edit/:id',
    isAuthenticated,
    authorizeRoles('Admin', 'Merchant'),
    eventController.showEditEventForm
);

router.post(
    '/edit/:id',
    isAuthenticated,
    authorizeRoles('Admin', 'Merchant'),
    eventController.updateEvent
);

router.post(
    '/delete/:id',
    isAuthenticated,
    authorizeRoles('Admin', 'Merchant'),
    eventController.deleteEvent
);

// Dashboards
router.get(
    '/dashboard',
    isAuthenticated,
    authorizeRoles('Admin'),
    eventController.getAdminDashboard
);

router.get(
    '/merchant/dashboard',
    isAuthenticated,
    authorizeRoles('Merchant'),
    eventController.getMerchantDashboard
);

// Booking
router.post(
    '/events/:id/book',
    isAuthenticated,
    authorizeRoles('User'),
    bookingController.bookTickets
);

module.exports = router;