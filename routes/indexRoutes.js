const express = require('express');
const router = express.Router();
const Event = require('../models/Event'); // Import your Mongoose Model
const { generateTicketPDF } = require('../utils/ticketGenerator');
const { isAuthenticated } = require('../middleware/authMiddleware');
const bookingController = require('../controllers/bookingController');
const eventController = require('../controllers/eventController');

/**
 * MOCK DATA POLICY: 
 * The mockEvents array below remains for reference, 
 * but the routes now prioritize real Database data.
 */
const mockEvents = [
    { id: 1, title: 'Jonoefen LIVE at work', category: 'Concert', price: 250, venue: '123 Kalk Street', date: 'Sat, 09 May 2026', capacity: 50, image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800', description: 'An exclusive live performance by Jonoefen.' },
    { id: 2, title: 'Tech Pulse 2026', category: 'Conference', price: 1200, venue: 'Innovation Hub', date: 'Wed, 15 May 2026', capacity: 200, image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800', description: 'Dive into the future of innovation.' },
    { id: 3, title: 'Node.js Mastery', category: 'Workshop', price: 450, venue: 'Belgium Campus Lab 4', date: 'Fri, 22 May 2026', capacity: 30, image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800', description: 'Take your server-side skills to the next level.' },
    { id: 4, title: 'Cyberpunk Rave', category: 'Concert', price: 300, venue: 'Neon Underground', date: 'Sat, 30 May 2026', capacity: 0, image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800', description: 'Step into a neon-drenched reality.' },
    { id: 5, title: 'Financial Strategy', category: 'Conference', price: 800, venue: 'Sandton Convention Centre', date: 'Mon, 01 June 2026', capacity: 100, image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800' , description: 'Refine your fiscal approach.' },
    { id: 6, title: 'UI/UX Design Sprint', category: 'Workshop', price: 600, venue: 'Design Studio', date: 'Thu, 04 June 2026', capacity: 25, image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800', description: 'A fast-paced workshop for designers.' },
    { id: 7, title: 'Acoustic Evenings', category: 'Concert', price: 150, venue: 'The Coffee Lab', date: 'Fri, 12 June 2026', capacity: 40, image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&w=800', description: 'Unplugged performances in a cozy atmosphere.' },
    { id: 8, title: 'Startup Pitch Night', category: 'Conference', price: 100, venue: 'Co-Work Space', date: 'Tue, 16 June 2026', capacity: 80, image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800', description: 'Watch the next generation of entrepreneurs.' },
    { id: 9, title: 'Backend with Go', category: 'Workshop', price: 550, venue: 'Campus Hall B', date: 'Sat, 20 June 2026', capacity: 35, image: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&w=800', description: 'Master the power of Go.' },
    { id: 10, title: 'Summer Festival', category: 'Concert', price: 400, venue: 'Botanical Gardens', date: 'Sat, 27 June 2026', capacity: 500, image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800', description: 'Celebrate the season under the sun.' }
];

// 1. Home Page with Dynamic Search & Filter
router.get('/', async (req, res) => {
    try {
        const { search, category } = req.query;
        let dbQuery = {};

        // Build DB Query
        if (search) {
            dbQuery.title = { $regex: search, $options: 'i' };
        }
        if (category && category !== 'All') {
            dbQuery.category = category;
        }

        // 1. Fetch live events and unique categories from DB
        const [dbEvents, dbCategories] = await Promise.all([
            Event.find(dbQuery).sort({ date: 1 }),
            Event.distinct('category')
        ]);

        // 2. Filter the Mock Events manually to match the search/filter
        const filteredMockEvents = mockEvents.filter(event => {
            const matchesSearch = !search || event.title.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = !category || category === 'All' || event.category === category;
            return matchesSearch && matchesCategory;
        });

        // 3. MERGE BOTH: Database events first, then Mock events
        const allEvents = [...dbEvents, ...filteredMockEvents];

        // 4. Merge Categories: Get unique categories from both sources
        const mockCategories = [...new Set(mockEvents.map(e => e.category))];
        const allCategories = [...new Set([...dbCategories, ...mockCategories])];

        res.render('home', {
            events: allEvents,
            categories: allCategories,
            searchQuery: search || '',
            selectedCategory: category || 'All'
        });

    } catch (error) {
        console.error("Home Route Error:", error);
        res.status(500).send("Error loading home page.");
    }
});

// 2. Dynamic Event Details Page 
router.get('/events/:id', async (req, res) => {
    try {
        const eventId = req.params.id;
        
        // 1. Try to find in Database
        let event = await Event.findById(eventId).catch(() => null);

        // 2. If not in DB, search your mockEvents array
        if (!event) {
            event = mockEvents.find(e => e.id.toString() === eventId);
        }

        if (!event) {
            return res.status(404).send("Event not found");
        }

        // Render the details page and pass the event data
        res.render('event-details', { event });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching event details");
    }
});


// 3. User Dashboard
router.get('/dashboard', async (req, res) => {
    try {
        // Fetch real events for the dashboard display
        const events = await Event.find({});
        res.render('dashboard', { 
            events: events,
            bookings: [] // This would eventually fetch from a Bookings collection
        });
    } catch (error) {
        res.status(500).send("Error loading dashboard.");
    }
});

// 4. Cart / Booking Logic

router.get('/cart', async (req, res) => {
    try {
        // If no cart in session, pass null for cartItem
        if (!req.session.cart || !req.session.cart.eventId) {
            return res.render('cart', { 
                cartItem: null, 
                events: await Event.find({}).limit(3) 
            });
        }

        const eventId = req.session.cart.eventId;
        let cartItem = null;

        // Try Database
        try {
            if (eventId.length === 24) cartItem = await Event.findById(eventId);
        } catch (e) { cartItem = null; }

        // Try Mock
        if (!cartItem) {
            cartItem = mockEvents.find(e => e.id.toString() === eventId.toString());
        }

        res.render('cart', { 
            cartItem: cartItem, 
            events: await Event.find({}).limit(3) 
        });
    } catch (error) {
        res.status(500).send("Error loading cart.");
    }
});

// routes/indexRoutes.js

router.post('/bookings/book/:id', (req, res) => {
    const eventId = req.params.id;
    
    // Save the ID to the session so the cart route can find it later
    req.session.cart = {
        eventId: eventId,
        quantity: req.body.quantity || 1
    };

    res.redirect('/cart');
});

// 5. Checkout & Success
router.get('/checkout', (req, res) => {
    res.render('checkout');
});

// routes/indexRoutes.js

router.post('/checkout/complete', async (req, res) => {
    try {
        if (!req.session.cart) return res.redirect('/');

        const eventId = req.session.cart.eventId;
        
        let event = null;
        try {
            if (eventId.length === 24) event = await Event.findById(eventId);
        } catch (e) { event = null; }

        if (!event) {
            event = mockEvents.find(e => e.id.toString() === eventId.toString());
        }

        if (!event) throw new Error("Event data is missing for success page");

        const attendeeName = req.body.fullName || "Guest Buyer";

        req.session.lastOrder = {
            eventName: event.title,
            userName: attendeeName,
            eventDate: event.date,
            orderId: `TK-${Math.floor(10000 + Math.random() * 90000)}`
        };

       
        res.render('success', { 
            ticket: req.session.lastOrder,
            event: event 
        });

    } catch (error) {
       
        next(error); 
    }
});

// 6. Contact Page
router.get('/contact', (req, res) => {
    res.render('contact'); 
});

// 7. PDF Ticket Generation
router.get('/downloads/ticket', async (req, res) => {
    try {
        if (!req.session.lastOrder) {
            return res.status(400).send("No ticket found to download.");
        }

        const ticketData = req.session.lastOrder;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Ticket-${ticketData.orderId}.pdf`);

        // Use our ticketGenerator.js logic
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

// Public: View event details
router.get('/events/:id', eventController.getEventDetails);

// User: Book tickets (Must be logged in, but doesn't need to be an Admin)
router.post('/bookings/book/:id', isAuthenticated, bookingController.bookTickets);

module.exports = router;