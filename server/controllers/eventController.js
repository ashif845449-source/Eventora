const Event = require("../models/Event");

// ==========================================
// GET ALL EVENTS
// ==========================================
exports.getAllEvents = async(req, res) => {
    try {
        const filter = {};

        // Filter by category
        if (req.query.category) {
            filter.category = req.query.category;
        }

        // Filter by location
        if (req.query.location) {
            filter.location = req.query.location;
        }

        const events = await Event.find(filter).sort({ createdAt: -1 });

        res.status(200).json(events);
    } catch (error) {
        console.error("Get all events error:", error);

        res.status(500).json({
            message: error.message
        });
    }
};


// ==========================================
// GET SINGLE EVENT
// ==========================================
exports.getEventById = async(req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.status(200).json(event);
    } catch (error) {
        console.error("Get event by ID error:", error);

        res.status(500).json({
            message: error.message
        });
    }
};


// ==========================================
// CREATE EVENT
// ==========================================
exports.createEvent = async(req, res) => {
    const {
        title,
        description,
        date,
        location,
        category,
        totalSeats,
        availableSeats,
        price,
        image
    } = req.body;

    try {
        const event = new Event({
            title,
            description,
            date,
            location,
            category,
            totalSeats,
            availableSeats,
            price,
            image,

            // User who created the event
            createdBy: req.user._id
        });

        const savedEvent = await event.save();

        res.status(201).json(savedEvent);
    } catch (error) {
        console.error("Create event error:", error);

        res.status(500).json({
            message: error.message
        });
    }
};


// ==========================================
// UPDATE EVENT
// ==========================================
exports.updateEvent = async(req, res) => {
    const {
        title,
        description,
        date,
        location,
        category,
        totalSeats,
        availableSeats,
        price,
        image
    } = req.body;

    try {
        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id, {
                title,
                description,
                date,
                location,
                category,
                totalSeats,
                availableSeats,
                price,
                image
            }, {
                new: true,
                runValidators: true
            }
        );

        if (!updatedEvent) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.status(200).json(updatedEvent);
    } catch (error) {
        console.error("Update event error:", error);

        res.status(500).json({
            message: error.message
        });
    }
};


// ==========================================
// DELETE EVENT
// ==========================================
exports.deleteEvent = async(req, res) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);

        if (!deletedEvent) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.status(200).json({
            message: "Event deleted successfully"
        });
    } catch (error) {
        console.error("Delete event error:", error);

        res.status(500).json({
            message: error.message
        });
    }
};