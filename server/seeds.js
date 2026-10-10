const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./models/user");
const Event = require("./models/event");
const Booking = require("./models/bookings");

dotenv.config();

const seedData = async() => {
    try {
        // ===============================
        // CONNECT TO MONGODB
        // ===============================
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected successfully");

        // ===============================
        // CLEAR OLD SEED DATA
        // ===============================
        await Booking.deleteMany({});

        await Event.deleteMany({});

        await User.deleteMany({
            email: {
                $in: [
                    "admin@eventora.com",
                    "user@eventora.com"
                ]
            }
        });

        console.log("Old seed data cleared");

        // ===============================
        // CREATE ADMIN
        // ===============================
        const admin = await User.create({
            name: "EVENTORA Admin",
            email: "admin@eventora.com",
            password: await bcrypt.hash("123456", 12),
            role: "admin"
        });

        // ===============================
        // CREATE NORMAL USER
        // ===============================
        const user = await User.create({
            name: "Test User",
            email: "user@eventora.com",
            password: "123456",
            role: "user"
        });

        // ===============================
        // CREATE EVENTS
        // ===============================
        const events = [{
                title: "Tech Conference 2026",
                description: "A technology conference featuring AI, Web Development and emerging technologies.",
                date: new Date("2026-11-15T10:00:00"),
                location: "Delhi",
                category: "Technology",
                totalSeats: 200,
                availableSeats: 200,
                price: 999,
                image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
                createdBy: admin._id
            },

            {
                title: "Music Night",
                description: "An amazing live music evening with talented artists and performers.",
                date: new Date("2026-12-05T18:00:00"),
                location: "Mumbai",
                category: "Music",
                totalSeats: 500,
                availableSeats: 500,
                price: 799,
                image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a",
                createdBy: admin._id
            },

            {
                title: "Startup Meetup",
                description: "Meet entrepreneurs, founders and investors and learn about startups.",
                date: new Date("2026-11-25T11:00:00"),
                location: "Bangalore",
                category: "Business",
                totalSeats: 100,
                availableSeats: 100,
                price: 499,
                image: "https://images.unsplash.com/photo-1556761175-b413da4baf72",
                createdBy: admin._id
            },

            {
                title: "Photography Workshop",
                description: "Learn photography basics, composition, lighting and professional techniques.",
                date: new Date("2026-12-12T10:00:00"),
                location: "Jaipur",
                category: "Workshop",
                totalSeats: 50,
                availableSeats: 50,
                price: 699,
                image: "https://images.unsplash.com/photo-1452780212940-6f5c0d14d848",
                createdBy: admin._id
            }
        ];

        const createdEvents = await Event.insertMany(events);

        console.log(`${createdEvents.length} events created`);

        // ===============================
        // SUCCESS
        // ===============================
        console.log("");
        console.log("=================================");
        console.log("EVENTORA SEED COMPLETED");
        console.log("=================================");
        console.log("");

        console.log("ADMIN LOGIN");
        console.log("Email: admin@eventora.com");
        console.log("Password: 123456");

        console.log("");

        console.log("USER LOGIN");
        console.log("Email: user@eventora.com");
        console.log("Password: 123456");

        console.log("");
        console.log("Admin ID:", admin._id);
        console.log("User ID:", user._id);

        await mongoose.connection.close();

        process.exit(0);

    } catch (error) {
        console.error("Seed Error:", error);

        await mongoose.connection.close();

        process.exit(1);
    }
};

seedData();