const express = require("express");
const router = express.Router();

const { protect, admin } = require("../middleware/authMiddleware");

const {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
} = require("../controllers/eventController");

// GET ALL EVENTS
router.get("/", getAllEvents);

// GET SINGLE EVENT
router.get("/:id", getEventById);

// CREATE EVENT - Admin only
router.post("/", protect, admin, createEvent);

// UPDATE EVENT - Admin only
router.put("/:id", protect, admin, updateEvent);

// DELETE EVENT - Admin only
router.delete("/:id", protect, admin, deleteEvent);

module.exports = router;