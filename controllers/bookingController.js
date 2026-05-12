const Event = require('../models/Event');
const Booking = require('../models/Booking');

// Book tickets for an event
exports.bookTickets = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        const quantity = Number(req.body.quantity);

        if (!quantity || quantity < 1) {
            return res.status(400).send('Please select at least 1 ticket.');
        }

        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).send('Event not found.');
        }

        if (event.status !== 'Approved') {
            return res.status(400).send('This event is not available for booking.');
        }

        if (event.availableTickets < quantity) {
            return res.status(400).send(
                `Not enough tickets available. Only ${event.availableTickets} ticket(s) left.`
            );
        }

        const totalPrice = event.ticketPrice * quantity;

        await Booking.create({
            user: req.session.user.id,
            event: event._id,
            quantity,
            totalPrice,
            bookingStatus: 'Confirmed'
        });

        event.availableTickets -= quantity;
        await event.save();

        res.redirect('/success');
    } catch (error) {
        next(error);
    }
};

// Show current user's booking history
exports.getUserBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({
            user: req.session.user.id
        })
            .populate('event')
            .sort({ createdAt: -1 });

        res.render('dashboard', {
            user: req.session.user,
            bookings
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

        if (booking.user.toString() !== req.session.user.id && req.session.user.role !== 'Admin') {
            return res.status(403).send('Access denied.');
        }

        if (booking.bookingStatus === 'Cancelled') {
            return res.status(400).send('This booking is already cancelled.');
        }

        booking.bookingStatus = 'Cancelled';
        await booking.save();

        const event = await Event.findById(booking.event);

        if (event) {
            event.availableTickets += booking.quantity;

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