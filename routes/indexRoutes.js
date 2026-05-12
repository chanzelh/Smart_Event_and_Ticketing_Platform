const express = require('express');
const router = express.Router();
const { generateTicketPDF } = require('../utils/ticketGenerator'); // Import the helper

// MOVED OUTSIDE: Globally available to all routes in this file
const mockEvents = [
    { 
        id: 1, 
        title: 'Jonoefen LIVE at work', 
        category: 'Concert', 
        price: 250, 
        venue: '123 Kalk Street', 
        date: 'Sat, 09 May 2026', 
        capacity: 50, 
        image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800',
        description: 'An exclusive live performance by Jonoefen, featuring unreleased tracks and an intimate Q&A session for fans.'
    },
    {
        id: 2, 
        title: 'Tech Pulse 2026', 
        category: 'Conference', 
        price: 1200, 
        venue: 'Innovation Hub', 
        date: 'Wed, 15 May 2026', 
        capacity: 200, 
        image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800',
        description: 'Dive into the future of innovation at this premier tech summit. Join industry leaders at the Innovation Hub for a day of keynote speeches and networking focused on the breakthrough technologies and digital trends shaping the year ahead.'
    },
    {
        id: 3, 
        title: 'Node.js Mastery', 
        category: 'Workshop', 
        price: 450, 
        venue: 'Belgium Campus Lab 4', 
        date: 'Fri, 22 May 2026', 
        capacity: 30, 
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800',
        description: 'Take your server-side JavaScript skills to the next level in this intensive, hands-on workshop. Hosted at Belgium Campus Lab 4, this session focuses on building scalable, high-performance applications and mastering the latest Node.js ecosystem updates.'
    },
    {
        id: 4, 
        title: 'Cyberpunk Rave', 
        category: 'Concert', 
        price: 300, 
        venue: 'Neon Underground', 
        date: 'Sat, 30 May 2026', 
        capacity: 0, 
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800',
        description: 'Step into a neon-drenched reality at the Neon Underground. Experience an immersive night of high-energy electronic beats and futuristic aesthetics in a venue designed to transport you straight into a sci-fi underworld.'
    },
    {
        id: 5, 
        title: 'Financial Strategy', 
        category: 'Conference', 
        price: 800, 
        venue: 'Sandton Convention Centre', 
        date: 'Mon, 01 June 2026', 
        capacity: 100, 
        image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800' ,
        description: 'Refine your fiscal approach at the Sandton Convention Centre. This conference brings together economic experts and business leaders to discuss market resilience, investment trends, and strategic planning in an evolving global economy.'
    },
    {   id: 6, 
        title: 'UI/UX Design Sprint', 
        category: 'Workshop', 
        price: 600, 
        venue: 'Design Studio', 
        date: 'Thu, 04 June 2026', 
        capacity: 25, 
        image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800',
        description: 'A fast-paced, collaborative workshop for designers looking to sharpen their workflow. Learn to rapidly prototype, test, and iterate on user-centric solutions within the creative environment of the Design Studio.'
    },
    {   id: 7, 
        title: 'Acoustic Evenings', 
        category: 'Concert', 
        price: 150, 
        venue: 'The Coffee Lab', 
        date: 'Fri, 12 June 2026', 
        capacity: 40, 
        image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&w=800',
        description: 'Unwind at The Coffee Lab with an intimate night of live, unplugged performances. This concert series highlights local singer-songwriters in a cozy, relaxed atmosphere perfect for music lovers and coffee enthusiasts alike.'
    },
    {   id: 8, 
        title: 'Startup Pitch Night', 
        category: 'Conference', 
        price: 100, 
        venue: 'Co-Work Space', 
        date: 'Tue, 16 June 2026', 
        capacity: 80, 
        image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800',
        description: 'Watch the next generation of entrepreneurs take the stage at the Co-Work Space. Founders will pitch their high-growth ideas to a panel of experts and investors in a high-stakes evening of innovation and networking.'
    },
    {   id: 9, 
        title: 'Backend with Go', 
        category: 'Workshop', 
        price: 550, 
        venue: 'Campus Hall B', 
        date: 'Sat, 20 June 2026', 
        capacity: 35, 
        image: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&w=800',
        description: 'Master the power of Go for modern backend development. This workshop at Campus Hall B covers concurrency, efficient routing, and microservices architecture, providing you with the tools to build robust, industrial-grade systems.'
    },
    {   id: 10, 
        title: 'Summer Festival', 
        category: 'Concert', 
        price: 400, 
        venue: 'Botanical Gardens', 
        date: 'Sat, 27 June 2026', 
        capacity: 500, 
        image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800',
        description: 'Celebrate the season under the sun at the Botanical Gardens. An expansive outdoor concert featuring a diverse lineup of artists, food stalls, and vibrant energy, set against the backdrop of lush greenery and open skies.'
    }
];

// 1. Home / Event Listing Page
router.get('/', (req, res) => {
    res.render('home', { 
        user: null, 
        events: mockEvents 
    });
});

// 2. Event Details Page 
router.get('/events/:id', (req, res) => {
    const eventId = parseInt(req.params.id);
    const event = mockEvents.find(e => e.id === eventId);

    if (!event) {
        return res.status(404).send('Event not found');
    }

    res.render('event-details', { 
        user: { role: 'User' }, 
        event: event 
    });
});

//Dashboard routes
router.get('/dashboard', (req, res) => {
    res.render('dashboard', { 
        user: { name: 'Jono', role: 'Admin' }, 
        events: mockEvents, // Must be defined
        bookings: [] 
    });
});


// 4. Contact / Enquiry Page (Mandatory Page 5)
router.get('/contact', (req, res) => {
    res.render('contact', { 
        user: { role: 'Admin' } 
    }); 
});

// routes/indexRoutes.js

// 4. THE CART ROUTE (THE FIX IS HERE)
router.get('/cart', (req, res) => {
    res.render('cart', { 
        user: { name: 'Jono', role: 'User' }, 
        cartItem: mockEvents[0], // Sending the first event so 'cartItem' is defined
        events: mockEvents 
    });
});

// 5. BOOKING POST ROUTE
router.post('/bookings/book/:id', (req, res) => {
    // Logic to add to session would go here. For now, just redirect.
    res.redirect('/cart');
});

// 7. CHECKOUT & SUCCESS
router.get('/checkout', (req, res) => {
    res.render('checkout', { user: null });
});

router.post('/checkout/complete', (req, res) => {
    res.render('success', { user: null });
});

// 1. Handle the "Book Tickets Now" button click (POST)
router.post('/bookings/book/:id', (req, res) => {
    const eventId = parseInt(req.params.id);
    const event = mockEvents.find(e => e.id === eventId);

    if (!event) {
        return res.status(404).send('Event not found');
    }

    // In Task 4, we simulate adding to a session-based cart.
    // For now, we redirect the user straight to the cart page.
    res.redirect('/cart');
});

// 2. View the Shopping Cart (GET)
// routes/indexRoutes.js

router.get('/cart', (req, res) => {
    // We pass mockEvents[0] so the page has data to display
    // Without this, 'cartItem' is undefined and the server crashes
    res.render('cart', { 
        user: { name: 'Jono', role: 'User' }, 
        cartItem: mockEvents[0], 
        events: mockEvents 
    });
});

// 3. View the Checkout Page (GET)
router.get('/checkout', (req, res) => {
    res.render('checkout', { user: null });
});

router.post('/checkout/complete', (req, res) => {
    res.render('success', { 
        user: { name: 'Jono', role: 'User' },
        cartItem: mockEvents[0] // Change this index to match the user's selection later
    });
});

router.get('/downloads/ticket', async (req, res) => { // Added async here
    try {
        const ticketData = {
            eventName: "WPR381 Final Project Showcase",
            userName: "Jono",
            eventDate: "2026-06-20",
            orderId: "TK-99821" // This will be encoded in the QR
        };

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=Tckt-Order.pdf');

        // Note: we await the function call now
        await generateTicketPDF(
            (chunk) => res.write(chunk),
            () => res.end(),
            ticketData
        );
    } catch (error) {
        console.error("PDF Generation Error:", error);
        res.status(500).send("Error generating ticket");
    }
});

module.exports = router;