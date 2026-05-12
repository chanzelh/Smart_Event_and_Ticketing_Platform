// controllers/eventController.js

const Event = require('../models/Event');
const Booking = require('../models/Booking');

// Show all approved events to normal users
exports.getAllEvents = async (req, res, next) => {
    try {
        const { search, category } = req.query;

        const filter = {
            status: 'Approved'
        };

        if (search) {
            filter.title = { $regex: search, $options: 'i' };
        }

        if (category && category !== 'All') {
            filter.category = category;
        }

        const events = await Event.find(filter).sort({ eventDateTime: 1 });

        res.render('home', {
            events,
            user: req.session ? req.session.user : null,
            search: search || '',
            category: category || 'All'
        });
    } catch (error) {
        next(error);
    }
};

// Show one event's details
exports.getEventDetails = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id).populate('createdBy', 'name email role');

        if (!event) {
            return res.status(404).send('Event not found');
        }

        res.render('event-details', {
            event,
            user: req.session ? req.session.user : null
        });
    } catch (error) {
        next(error);
    }
};

// Show event management page
exports.showManageEvents = async (req, res, next) => {
    try {
        let events;

        if (req.session.user.role === 'Admin') {
            events = await Event.find().populate('createdBy', 'name email role').sort({ createdAt: -1 });
        } else {
            events = await Event.find({ createdBy: req.session.user.id }).sort({ createdAt: -1 });
        }

        res.render('admin/manage', {
            events,
            user: req.session.user
        });
    } catch (error) {
        next(error);
    }
};

// Show create event form
exports.showCreateEventForm = (req, res) => {
    res.render('admin/manage', {
        events: [],
        user: req.session.user,
        showCreateForm: true
    });
};

// Create a new event
exports.createEvent = async (req, res, next) => {
    try {
        const {
            title,
            description,
            category,
            ticketPrice,
            totalCapacity,
            venueName,
            eventDateTime,
            artworkUrl
        } = req.body;

        const capacityNumber = Number(totalCapacity);
        const priceNumber = Number(ticketPrice);

        if (capacityNumber < 1) {
            return res.status(400).send('Total capacity must be at least 1.');
        }

        if (priceNumber < 0) {
            return res.status(400).send('Ticket price cannot be negative.');
        }

        await Event.create({
            title,
            description,
            category,
            ticketPrice: priceNumber,
            totalCapacity: capacityNumber,
            availableTickets: capacityNumber,
            venueName,
            eventDateTime,
            artworkUrl,
            status: req.session.user.role === 'Admin' ? 'Approved' : 'Pending',
            createdBy: req.session.user.id
        });

        res.redirect('/admin/manage');
    } catch (error) {
        next(error);
    }
};

// Show edit event form
exports.showEditEventForm = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).send('Event not found');
        }

        if (
            req.session.user.role !== 'Admin' &&
            event.createdBy.toString() !== req.session.user.id
        ) {
            return res.status(403).send('Access denied.');
        }

        res.render('admin/manage', {
            events: [],
            eventToEdit: event,
            user: req.session.user
        });
    } catch (error) {
        next(error);
    }
};

// Update event
exports.updateEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).send('Event not found');
        }

        if (
            req.session.user.role !== 'Admin' &&
            event.createdBy.toString() !== req.session.user.id
        ) {
            return res.status(403).send('Access denied.');
        }

        const {
            title,
            description,
            category,
            ticketPrice,
            totalCapacity,
            venueName,
            eventDateTime,
            artworkUrl,
            status
        } = req.body;

        const newTotalCapacity = Number(totalCapacity);
        const ticketsAlreadySold = event.totalCapacity - event.availableTickets;

        if (newTotalCapacity < ticketsAlreadySold) {
            return res.status(400).send(
                `Capacity cannot be lower than tickets already sold. Tickets already sold: ${ticketsAlreadySold}`
            );
        }

        event.title = title;
        event.description = description;
        event.category = category;
        event.ticketPrice = Number(ticketPrice);
        event.totalCapacity = newTotalCapacity;
        event.availableTickets = newTotalCapacity - ticketsAlreadySold;
        event.venueName = venueName;
        event.eventDateTime = eventDateTime;
        event.artworkUrl = artworkUrl;

        if (req.session.user.role === 'Admin' && status) {
            event.status = status;
        }

        await event.save();

        res.redirect('/admin/manage');
    } catch (error) {
        next(error);
    }
};

// Delete event
exports.deleteEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).send('Event not found');
        }

        if (
            req.session.user.role !== 'Admin' &&
            event.createdBy.toString() !== req.session.user.id
        ) {
            return res.status(403).send('Access denied.');
        }

        await Booking.deleteMany({ event: event._id });
        await Event.findByIdAndDelete(event._id);

        res.redirect('/admin/manage');
    } catch (error) {
        next(error);
    }
};

// Admin dashboard: stats for all events
exports.getAdminDashboard = async (req, res, next) => {
    try {
        const totalEvents = await Event.countDocuments();
        const totalBookings = await Booking.countDocuments();

        const bookings = await Booking.find().populate('event');

        const totalRevenue = bookings.reduce((sum, booking) => {
            return sum + booking.totalPrice;
        }, 0);

        const popularEvents = await Booking.aggregate([
            {
                $group: {
                    _id: '$event',
                    totalTicketsSold: { $sum: '$quantity' },
                    totalRevenue: { $sum: '$totalPrice' }
                }
            },
            { $sort: { totalTicketsSold: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'events',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'event'
                }
            },
            { $unwind: '$event' }
        ]);

        res.render('dashboard', {
            user: req.session.user,
            totalEvents,
            totalBookings,
            totalRevenue,
            popularEvents
        });
    } catch (error) {
        next(error);
    }
};

// Merchant dashboard: stats only for that merchant's events
exports.getMerchantDashboard = async (req, res, next) => {
    try {
        const merchantEvents = await Event.find({ createdBy: req.session.user.id });
        const merchantEventIds = merchantEvents.map(event => event._id);

        const totalEvents = merchantEvents.length;

        const bookings = await Booking.find({
            event: { $in: merchantEventIds }
        }).populate('event');

        const totalBookings = bookings.length;

        const totalRevenue = bookings.reduce((sum, booking) => {
            return sum + booking.totalPrice;
        }, 0);

        const popularEvents = await Booking.aggregate([
            {
                $match: {
                    event: { $in: merchantEventIds }
                }
            },
            {
                $group: {
                    _id: '$event',
                    totalTicketsSold: { $sum: '$quantity' },
                    totalRevenue: { $sum: '$totalPrice' }
                }
            },
            { $sort: { totalTicketsSold: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'events',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'event'
                }
            },
            { $unwind: '$event' }
        ]);

        res.render('dashboard', {
            user: req.session.user,
            totalEvents,
            totalBookings,
            totalRevenue,
            popularEvents
        });
    } catch (error) {
        next(error);
    }
};