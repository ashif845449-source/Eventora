const express = require("express");
const router = express.Router();

const { protect, admin } = require("../middleware/authMiddleware");

const {
    bookEvent,
    verifyBookingOtp,
    getMyBookings,
    confirmBooking,
    cancelBooking
} = require("../controllers/bookingController");

// Step 1: Send OTP / Start booking
router.post("/", protect, bookEvent);

// Step 2: Verify OTP and create booking
router.post("/verify-otp", protect, verifyBookingOtp);

// Get logged-in user's bookings
router.get("/my", protect, getMyBookings);

// Confirm booking - Admin only
router.get("/:id/confirm", protect, admin, confirmBooking);

// Cancel booking
router.delete("/:id", protect, cancelBooking);

module.exports = router;