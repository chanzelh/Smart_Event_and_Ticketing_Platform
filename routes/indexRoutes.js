const express = require('express');
const router = express.Router();
const Event = require('../models/Event'); 
const { generateTicketPDF } = require('../utils/ticketGenerator');
const { isAuthenticated } = require('../middleware/authMiddleware');
const bookingController = require('../controllers/bookingController');
const eventController = require('../controllers/eventController');

/**
 * 1. Home Page
 * Fetches only 'Approved' events from the database[cite: 1, 3].
 */
router.get('/', async (req, res) => {
    try {
        const { search, category } = req.query;
        let dbQuery = { status: 'Approved' };

        if (search) {
            dbQuery.title = { $regex: search, $options: 'i' };
        }
        if (category && category !== 'All') {
            dbQuery.category = category;
        }

        const [events, categories] = await Promise.all([
            Event.find(dbQuery).sort({ eventDateTime: 1 }),
            Event.distinct('category')
        ]);

        res.render('home', {
            events,
            categories,
            searchQuery: search || '',
            selectedCategory: category || 'All',
            user: req.session ? req.session.user : null
        });

    } catch (error) {
        console.error("Home Route Error:", error);
        res.status(500).send("Error loading home page.");
    }
});

/**
 * 2. Event Details
 * Uses the controller to fetch real DB data[cite: 3].
 */
router.get('/events/:id', eventController.getEventDetails);

/**
 * 3. Shopping Cart
 * Manages the temporary session-based selection[cite: 1].
 */
router.get('/cart', async (req, res) => {
    try {
        if (!req.session.cart || !req.session.cart.eventId) {
            return res.render('cart', { 
                cartItem: null, 
                events: await Event.find({ status: 'Approved' }).limit(3) 
            });
        }

        const cartItem = await Event.findById(req.session.cart.eventId);

        res.render('cart', { 
            cartItem, 
            events: await Event.find({ status: 'Approved' }).limit(3) 
        });
    } catch (error) {
        console.error("Cart Error:", error);
        res.status(500).send("Error loading cart.");
    }
});

/**
 * 4. Add to Cart Logic
 * Stores the event selection in the session[cite: 1].
 */


router.post('/bookings/book/:id', (req, res) => {
    const eventId = req.params.id;
    
    // Default quantity to 1 since it's no longer in the details view
    req.session.cart = {
        eventId: eventId,
        quantity: 1 
    };

    res.redirect('/cart');
});

/**
 * 5. Checkout & Order Completion
 * This now interfaces with the bookingController to ensure tickets 
 * are decremented and records are saved.
 */
// routes/indexRoutes.js

router.post('/cart/prepare-checkout', (req, res) => {
    console.log("--- DEBUG: PREPARE CHECKOUT HIT ---");
    console.log("Incoming Body:", req.body);

    if (req.session.cart) {
        // Capture quantity from the form
        const selectedQty = parseInt(req.body.quantity) || 1;
        req.session.cart.quantity = selectedQty;
        
        console.log("Updated Session Qty to:", req.session.cart.quantity);
    }
    
    res.redirect('/checkout');
});

router.get('/checkout', isAuthenticated, (req, res) => {
    if (!req.session.cart) return res.redirect('/');
    res.render('checkout', { user: req.session.user });
});

router.post('/checkout/complete', isAuthenticated, bookingController.bookTickets);

/**
 * 6. Success Page
 * Displays after bookingController.bookTickets redirects here[cite: 2].
 */
router.get('/success', (req, res) => {
    if (!req.session.lastOrder) {
        return res.redirect('/');
    }
    res.render('success', { 
        ticket: req.session.lastOrder 
    });
});

/**
 * 7. Dashboard & Contact
 */
router.get('/dashboard', isAuthenticated, bookingController.getUserBookings);

router.get('/contact', (req, res) => {
    res.render('contact'); 
});

/**
 * 8. PDF Ticket Generation
 * Generates PDF using data stored in session after a successful booking[cite: 1].
 */
router.get('/downloads/ticket', async (req, res) => {
    try {
        if (!req.session.lastOrder) {
            return res.status(400).send("No ticket found to download.");
        }

        const ticketData = req.session.lastOrder;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Ticket-${ticketData.orderId}.pdf`);

        await generateTicketPDF(
            (chunk) => res.write(chunk),
            () => res.end(),
            ticketData
        );
    } catch (error) {
        console.error("PDF Error:", error);
        res.status(500).send("Error generating PDF");
    }
});

module.exports = router;