const Event = require('../models/Event');
const Booking = require('../models/Booking');

// Book tickets for an event
exports.bookTickets = async (req, res, next) => {
    try {
        // 1. Verify the session cart exists
        if (!req.session.cart) {
            console.error("Booking Error: No cart found in session.");
            return res.redirect('/');
        }

        // 2. Extract eventId and the UPDATED quantity from the session
        const { eventId, quantity } = req.session.cart;
        
        const qtyNumber = parseInt(quantity);

        if (!qtyNumber || qtyNumber < 1) {
            return res.status(400).send('Invalid ticket quantity. Please go back to the cart.');
        }

        // 3. Find the event in the database
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).send('Event not found.');
        }

        // 4. Validate event status and ticket availability
        if (event.status !== 'Approved') {
            return res.status(400).send('This event is no longer available for booking.');
        }

        if (event.availableTickets < qtyNumber) {
            return res.status(400).send(
                `Not enough tickets available. Only ${event.availableTickets} ticket(s) left.`
            );
        }

        // 5. Calculate final price based on the selected quantity
        const totalPrice = event.ticketPrice * qtyNumber;

        // 6. Create a permanent record in the Booking collection
        const newBooking = await Booking.create({
            user: req.session.user.id,
            event: event._id,
            quantity: qtyNumber,
            totalPrice,
            bookingStatus: 'Confirmed'
        });

        // 7. DECREMENT DATABASE: Subtract the ACTUAL quantity purchased 
        event.availableTickets -= qtyNumber; 
        await event.save();

        // 8. PREPARE SUCCESS DATA: Pass quantity to drive the Success page loop 
        req.session.lastOrder = {
            eventName: event.title,
            userName: req.session.user.fullName,
            eventDate: new Date(event.eventDateTime).toLocaleDateString('en-GB', { 
                weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' 
            }),
            orderId: `TK-${newBooking._id.toString().slice(-6).toUpperCase()}`,
            quantity: qtyNumber,
            totalPrice: totalPrice
        };

        // 9. Clean up and redirect
        delete req.session.cart;
        res.redirect('/success');

    } catch (error) {
        console.error("CRITICAL BOOKING ERROR:", error);
        next(error);
    }
};

// Show current user's booking history
exports.getUserBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({ user: req.session.user.id })
            .populate('event')
            .sort({ createdAt: -1 });

        res.render('dashboard', {
            user: req.session.user,
            bookings: bookings || [],
            totalEvents: 0,
            totalBookings: bookings.length || 0,
            totalRevenue: 0,
            popularEvents: []
        });
    } catch (error) {
        next(error);
    }
};

// Cancel a booking and return tickets to the event
exports.cancelBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).send('Booking not found.');
        }

        // Authorization check
        const isOwner = booking.user.toString() === req.session.user.id;
        const isAdmin = req.session.user.role.toLowerCase() === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).send('Access denied.');
        }

        if (booking.bookingStatus === 'Cancelled') {
            return res.status(400).send('This booking is already cancelled.');
        }

        // Update booking status
        booking.bookingStatus = 'Cancelled';
        await booking.save();

        // Return tickets to the event pool
        const event = await Event.findById(booking.event);
        if (event) {
            event.availableTickets += booking.quantity;
            
            // Ensure we don't exceed original capacity
            if (event.availableTickets > event.totalCapacity) {
                event.availableTickets = event.totalCapacity;
            }

            await event.save();
        }

        res.redirect('/dashboard');
    } catch (error) {
        next(error);
    }
};