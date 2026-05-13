require('dotenv').config(); // This line is CRITICAL to read your MONGO_URI
const mongoose = require('mongoose');
const Event = require('./models/Event'); 
const User = require('./models/User');

const mockEvents = [
    { title: 'Jonoefen LIVE at work', category: 'Concert', price: 250, venue: '123 Kalk Street', date: '2026-05-09', capacity: 50, image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800', description: 'An exclusive live performance by Jonoefen.' },
    { title: 'Tech Pulse 2026', category: 'Conference', price: 1200, venue: 'Innovation Hub', date: '2026-05-15', capacity: 200, image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800', description: 'Dive into the future of innovation.' },
    { title: 'Node.js Mastery', category: 'Workshop', price: 450, venue: 'Belgium Campus Lab 4', date: '2026-05-22', capacity: 30, image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800', description: 'Take your server-side skills to the next level.' },
    { title: 'Cyberpunk Rave', category: 'Concert', price: 300, venue: 'Neon Underground', date: '2026-05-30', capacity: 100, image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800', description: 'Step into a neon-drenched reality.' },
    { title: 'Financial Strategy', category: 'Conference', price: 800, venue: 'Sandton Convention Centre', date: '2026-06-01', capacity: 100, image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800' , description: 'Refine your fiscal approach.' },
    { title: 'UI/UX Design Sprint', category: 'Workshop', price: 600, venue: 'Design Studio', date: '2026-06-04', capacity: 25, image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800', description: 'A fast-paced workshop for designers.' },
    { title: 'Acoustic Evenings', category: 'Concert', price: 150, venue: 'The Coffee Lab', date: '2026-06-12', capacity: 40, image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&w=800', description: 'Unplugged performances in a cozy atmosphere.' },
    { title: 'Startup Pitch Night', category: 'Conference', price: 100, venue: 'Co-Work Space', date: '2026-06-16', capacity: 80, image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800', description: 'Watch the next generation of entrepreneurs.' },
    { title: 'Backend with Go', category: 'Workshop', price: 550, venue: 'Campus Hall B', date: '2026-06-20', capacity: 35, image: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&w=800', description: 'Master the power of Go.' },
    { title: 'Summer Festival', category: 'Concert', price: 400, venue: 'Botanical Gardens', date: '2026-06-27', capacity: 500, image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800', description: 'Celebrate the season under the sun.' }
];

async function seedDB() {
    console.log("--- Starting Seed Process ---");
    try {
        // Use the exact key from your .env file
        const uri = process.env.MONGO_URI;
        
        if (!uri) {
            throw new Error("MONGO_URI not found in .env file!");
        }

        await mongoose.connect(uri);
        console.log("✅ Connected to MongoDB Atlas");

        // Find user case-insensitively
        const creator = await User.findOne({ email: /^user123@gmail.com$/i });
        
        if (!creator) {
            console.log("❌ User123@gmail.com not found in the remote database.");
            process.exit(1);
        }

        console.log(`👤 Attributing events to: ${creator.fullName}`);

        const eventsToInsert = mockEvents.map(event => ({
            title: event.title,
            description: event.description,
            category: event.category,
            ticketPrice: event.price,
            totalCapacity: event.capacity || 100,
            availableTickets: event.capacity || 100,
            venueName: event.venue,
            eventDateTime: new Date(event.date),
            artworkUrl: event.image,
            status: 'Approved',
            createdBy: creator._id
        }));

        await Event.insertMany(eventsToInsert);
        console.log(`🚀 SUCCESS: ${eventsToInsert.length} events added to Atlas!`);

    } catch (err) {
        console.error("🔥 Error:", err.message);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
}

seedDB();