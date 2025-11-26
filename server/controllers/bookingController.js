import Booking from "../models/booking.model.js";
import Vehicle from "../models/vehicle.model.js";

export const createBooking = async (req, res) => {
    try {
        const { vehicleId, startDate, endDate, paymentMethod, isPaymentDeferred, notes } = req.body;
        const userId = req.userId;

        if (!vehicleId || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Vehicle ID, start date, and end date are required"
            });
        }

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (start < today) {
            return res.status(400).json({
                success: false,
                message: "Start date cannot be in the past"
            });
        }

        if (end <= start) {
            return res.status(400).json({
                success: false,
                message: "End date must be after start date"
            });
        }

        // Check if vehicle exists and is available
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found"
            });
        }

        if (!vehicle.isAvailable) {
            return res.status(400).json({
                success: false,
                message: "Vehicle is not available for booking"
            });
        }

        // Check for overlapping bookings
        const overlappingBookings = await Booking.find({
            vehicleId,
            bookingStatus: { $in: ["pending", "confirmed", "active"] },
            $or: [
                {
                    startDate: { $lte: end },
                    endDate: { $gte: start }
                }
            ]
        });

        if (overlappingBookings.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Vehicle is already booked for the selected dates"
            });
        }

        // Calculate total days and amount
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const totalAmount = totalDays * vehicle.rentPerDay;

        // Create booking
        const booking = await Booking.create({
            userId,
            vehicleId,
            startDate: start,
            endDate: end,
            totalDays,
            rentPerDay: vehicle.rentPerDay,
            totalAmount,
            paymentMethod: isPaymentDeferred ? null : paymentMethod,
            paymentStatus: isPaymentDeferred ? "pending" : "paid",
            bookingStatus: isPaymentDeferred ? "pending" : "confirmed",
            pickupLocation: vehicle.pickupLocation,
            notes: notes || "",
            isPaymentDeferred
        });

        // If payment is not deferred, mark vehicle as unavailable
        if (!isPaymentDeferred) {
            await Vehicle.findByIdAndUpdate(vehicleId, { isAvailable: false });
        }

        res.status(201).json({
            success: true,
            message: isPaymentDeferred 
                ? "Booking saved to your todos. Complete payment to confirm." 
                : "Booking confirmed successfully",
            data: booking
        });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to create booking"
        });
    }
};

export const getUserBookings = async (req, res) => {
    try {
        const userId = req.userId;
        const bookings = await Booking.find({ userId })
            .populate("vehicleId", "name mainImage category")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bookings"
        });
    }
};

export const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const booking = await Booking.findOne({ _id: id, userId })
            .populate("vehicleId")
            .populate("userId", "name email contact");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        res.json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error("Error fetching booking:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch booking"
        });
    }
};

export const completePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentMethod } = req.body;
        const userId = req.userId;

        const booking = await Booking.findOne({ _id: id, userId });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        if (booking.paymentStatus === "paid") {
            return res.status(400).json({
                success: false,
                message: "Payment already completed"
            });
        }

        booking.paymentStatus = "paid";
        booking.paymentMethod = paymentMethod;
        booking.bookingStatus = "confirmed";
        booking.isPaymentDeferred = false;

        await booking.save();

        // Mark vehicle as unavailable
        await Vehicle.findByIdAndUpdate(booking.vehicleId, { isAvailable: false });

        res.json({
            success: true,
            message: "Payment completed successfully",
            data: booking
        });
    } catch (error) {
        console.error("Error completing payment:", error);
        res.status(500).json({
            success: false,
            message: "Failed to complete payment"
        });
    }
};

export const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const booking = await Booking.findOne({ _id: id, userId });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        if (booking.bookingStatus === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Booking is already cancelled"
            });
        }

        booking.bookingStatus = "cancelled";
        await booking.save();

        // Mark vehicle as available again
        await Vehicle.findByIdAndUpdate(booking.vehicleId, { isAvailable: true });

        res.json({
            success: true,
            message: "Booking cancelled successfully",
            data: booking
        });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(500).json({
            success: false,
            message: "Failed to cancel booking"
        });
    }
};

