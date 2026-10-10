const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Send OTP Email
const sendOtpEmail = async(email, otp, type) => {
    try {
        const title =
            type === "account_verification" ?
            "Account Verification" :
            "Event Booking";

        const msg =
            type === "account_verification" ?
            "Please use the following OTP to verify your account." :
            "Please use the following OTP to complete your event booking.";

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your EVENTORA OTP Code",
            text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
            html: `
                <h1>${title}</h1>
                <p>${msg}</p>
                <h2>${otp}</h2>
                <p>This OTP will expire in 5 minutes.</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        console.log(`OTP email sent to ${email} for ${type}`);
    } catch (error) {
        console.error(`Error sending OTP email to ${email}:`, error);
        throw new Error("Failed to send OTP email");
    }
};


// Send Booking Email
const sendBookingEmail = async(userEmail, userName, eventTitle) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `Event Booking Confirmation: ${eventTitle}`,
            text: `Hello ${userName}, your booking for ${eventTitle} has been confirmed.`,
            html: `
                <h1>Event Booking Confirmed</h1>
                <p>Hello ${userName},</p>
                <p>Your booking for <strong>${eventTitle}</strong> has been confirmed.</p>
                <p>Thank you for using EVENTORA.</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        console.log(`Booking email sent to ${userEmail}`);
    } catch (error) {
        console.error(`Error sending booking email to ${userEmail}:`, error);
        throw new Error("Failed to send booking email");
    }
};


// Export both functions
module.exports = {
    sendBookingEmail,
    sendOtpEmail,
};