const Booking = require('../models/bookings.js');
const OTP = require('../models/otp');
const Event = require('../models/event');
const { sendOtpEmail, sendBookingEmail } = require('../utils/email');

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Step 1: Send OTP
exports.bookEvent = async(req, res) => {
    try {
        const otp = generateOtp();

        await OTP.findOneAndDelete({
            Email: req.user.email,
            action: 'booking'
        });

        await sendOtpEmail(
            req.user.email,
            otp,
            'booking'
        );

        res.json({
            message: 'OTP sent to your email. Please verify to complete the booking.'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Failed to send OTP.'
        });
    }
};


// Step 2: Verify OTP and create booking
exports.verifyBookingOtp = async(req, res) => {
    try {
        const { eventId, otp } = req.body;

        const otpRecord = await OTP.findOne({
            Email: req.user.email,
            action: 'booking'
        });

        if (!otpRecord || otpRecord.otp !== otp) {
            return res.status(400).json({
                message: 'Invalid or expired OTP.'
            });
        }

        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                message: 'Event not found.'
            });
        }

        if (event.availableSeats <= 0) {
            return res.status(400).json({
                message: 'No available seats for this event.'
            });
        }

        const existingBooking = await Booking.findOne({
            userId: req.user._id,
            eventId
        });

        if (existingBooking) {
            return res.status(400).json({
                message: 'You have already booked this event.'
            });
        }

        const booking = new Booking({
            userId: req.user._id,
            eventId,
            amount: event.price,
            status: 'pending',
            paymentStatus: 'unpaid'
        });

        await booking.save();

        await OTP.deleteMany({
            Email: req.user.email,
            action: 'booking'
        });

        res.status(201).json({
            message: 'Booking created successfully.',
            bookingId: booking._id
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Failed to create booking.'
        });
    }
};


// Step 3: Confirm booking
exports.confirmBooking = async(req, res) => {
    try {
        const paymentStatus = req.query.paymentStatus;

        if (!['paid', 'unpaid'].includes(paymentStatus)) {
            return res.status(400).json({
                message: 'Invalid payment status.'
            });
        }

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                message: 'Booking not found.'
            });
        }

        if (booking.status === 'confirmed') {
            return res.status(400).json({
                message: 'Booking is already confirmed.'
            });
        }

        const event = await Event.findById(booking.eventId);

        if (!event) {
            return res.status(404).json({
                message: 'Event not found.'
            });
        }

        if (event.availableSeats <= 0) {
            return res.status(400).json({
                message: 'No available seats for this event.'
            });
        }

        booking.status = 'confirmed';
        booking.paymentStatus = paymentStatus;

        await booking.save();

        event.availableSeats -= 1;
        await event.save();

        await sendBookingEmail(
            req.user.email,
            booking._id,
            event.name
        );

        res.json({
            message: 'Booking confirmed successfully.',
            booking
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Failed to confirm booking.'
        });
    }
};

exports.getMyBookings = async(req, res) => {
    const bookings = await Booking.find({ userId: req.user._id }).populate('eventId', 'name date location price');
    res.json(bookings);
};

exports.cancelBooking = async(req, res) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    booking.status = 'cancelled';
    await booking.save();

    if (booking.status === 'confirmed') {
        const event = await Event.findById(booking.eventId);
        if (event) {
            event.availableSeats += 1;
            await event.save();
        }
        await booking.remove();
        res.json({ message: 'Booking cancelled successfully' });
    }
};