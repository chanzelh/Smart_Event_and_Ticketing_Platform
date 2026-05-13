const Event = require('../models/Event');
const Booking = require('../models/Booking');

// Show all approved events on the home page
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
        const event = await Event.findById(req.params.id)
            .populate('createdBy', 'fullName email role');

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
        // FIX: Normalize role check to handle case-sensitivity
        const userRole = req.session.user.role ? req.session.user.role.toLowerCase() : '';

        if (userRole === 'admin') {
            events = await Event.find()
                .populate('createdBy', 'fullName email role')
                .sort({ createdAt: -1 });
        } else {
            // Merchants only see their own events
            events = await Event.find({ createdBy: req.session.user.id })
                .sort({ createdAt: -1 });
        }

        res.render('admin/manage', {
            events,
            user: req.session.user
        });
    } catch (error) {
        next(error);
    }
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

        const priceNumber = Number(ticketPrice);
        const capacityNumber = Number(totalCapacity);

        if (!title || !description || !category || !venueName || !eventDateTime) {
            return res.status(400).send('Please fill in all required event fields.');
        }

        if (priceNumber < 0) {
            return res.status(400).send('Ticket price cannot be negative.');
        }

        if (capacityNumber < 1) {
            return res.status(400).send('Total capacity must be at least 1.');
        }

        const userRole = req.session.user.role ? req.session.user.role : '';

        await Event.create({
            title,
            description,
            category,
            ticketPrice: priceNumber,
            totalCapacity: capacityNumber,
            availableTickets: capacityNumber,
            venueName,
            eventDateTime,
            artworkUrl: artworkUrl || '',
            status: userRole === 'Admin' ? 'Approved' : 'Pending',
            createdBy: req.session.user.id
        });

        res.redirect('/admin/manage');
    } catch (error) {
        next(error);
    }
};

// Show edit event form/modal
exports.showEditEventForm = async (req, res, next) => {
    try {
        const eventToEdit = await Event.findById(req.params.id);

        if (!eventToEdit) {
            return res.status(404).send('Event not found');
        }

        const userRole = req.session.user.role ? req.session.user.role : '';

        if (
            userRole !== 'Admin' &&
            eventToEdit.createdBy.toString() !== req.session.user.id
        ) {
            return res.status(403).send('Access denied.');
        }

        let events;
        if (userRole === 'Admin') {
            events = await Event.find()
                .populate('createdBy', 'fullName email role')
                .sort({ createdAt: -1 });
        } else {
            events = await Event.find({ createdBy: req.session.user.id })
                .sort({ createdAt: -1 });
        }

        res.render('admin/manage', {
            events,
            eventToEdit,
            user: req.session.user
        });
    } catch (error) {
        next(error);
    }
};

// Update an existing event
exports.updateEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).send('Event not found');
        }

        const userRole = req.session.user.role ? req.session.user.role : '';

        if (
            userRole !== 'Admin' &&
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
        const priceNumber = Number(ticketPrice);
        const ticketsAlreadySold = event.totalCapacity - event.availableTickets;

        if (newTotalCapacity < ticketsAlreadySold) {
            return res.status(400).send(
                `Capacity cannot be lower than tickets already sold. Tickets already sold: ${ticketsAlreadySold}`
            );
        }

        event.title = title;
        event.description = description;
        event.category = category;
        event.ticketPrice = priceNumber;
        event.totalCapacity = newTotalCapacity;
        event.availableTickets = newTotalCapacity - ticketsAlreadySold;
        event.venueName = venueName;
        event.eventDateTime = eventDateTime;
        event.artworkUrl = artworkUrl || '';

        if (userRole === 'Admin' && status) {
            event.status = status;
        }

        await event.save();
        res.redirect('/admin/manage');
    } catch (error) {
        next(error);
    }
};

// Delete an event
exports.deleteEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).send('Event not found');
        }

        const userRole = req.session.user.role ? req.session.user.role : '';

        if (
            userRole !== 'Admin' &&
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

// Admin dashboard: platform-wide stats
exports.getAdminDashboard = async (req, res, next) => {
    try {
        const totalEvents = await Event.countDocuments({});

        const bookings = await Booking.find()
            .populate('user', 'fullName email')
            .populate('event', 'title')
            .sort({ createdAt: -1 });

        const totalTicketsSold = bookings.reduce((sum, b) => sum + (Number(b.quantity) || 0), 0);

        const totalRevenue = bookings.reduce((sum, b) => {
            return sum + (Number(b.totalPrice) || 0);
        }, 0);

        const popularEvents = []; 

        res.render('dashboard', {
            user: req.session.user,
            totalEvents: totalEvents || 0,
            totalBookings: totalTicketsSold,
            totalRevenue: totalRevenue || 0,
            popularEvents,
            bookings: bookings || [] // Fallback to empty array
        });
    } catch (error) {
        console.error("ADMIN DASHBOARD CRASH:", error);
        next(error);
    }
};

// Merchant dashboard: stats only for that merchant's events
exports.getMerchantDashboard = async (req, res, next) => {
    try {
        const merchantEvents = await Event.find({ createdBy: req.session.user.id });
        const merchantEventIds = merchantEvents.map(e => e._id);

        const bookings = await Booking.find({ event: { $in: merchantEventIds } })
            .populate('user', 'fullName email')
            .populate('event', 'title')
            .sort({ createdAt: -1 });

        const totalEvents = merchantEvents.length;
        const totalTicketsSold = bookings.reduce((sum, b) => sum + (Number(b.quantity) || 0), 0);
        const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

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
            totalBookings: totalTicketsSold,
            totalRevenue,
            popularEvents,
            bookings // Pass the filtered detailed list
        });
    } catch (error) { next(error); }
};