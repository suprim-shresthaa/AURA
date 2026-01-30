import Booking from "../models/booking.model.js";
import Vehicle from "../models/vehicle.model.js";
import User from "../models/user.model.js";
import SparePart from "../models/sparePart.model.js";

export const createBooking = async (req, res) => {
    try {
        const { vehicleId, sparePartId, startDate, endDate, isPaymentDeferred, notes, insuranceSelected } = req.body;
        const userId = req.userId;

        // Check if user is vendor or admin - they cannot book
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        if (req.user.role === "vendor" || req.user.role === "admin") {
            return res.status(403).json({
                success: false,
                message: "Vendors and admins cannot make bookings"
            });
        }

        // Validate that either vehicleId or sparePartId is provided
        if (!vehicleId && !sparePartId) {
            return res.status(400).json({
                success: false,
                message: "Either vehicle ID or spare part ID is required"
            });
        }

        if (vehicleId && sparePartId) {
            return res.status(400).json({
                success: false,
                message: "Cannot book both vehicle and spare part in one booking"
            });
        }

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Start date and end date are required"
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

        let bookingData = {
            userId,
            startDate: start,
            endDate: end,
            paymentMethod: "esewa",
            paymentStatus: isPaymentDeferred ? "pending" : "pending",
            bookingStatus: isPaymentDeferred ? "pending" : "pending",
            notes: notes || "",
            isPaymentDeferred,
            insuranceSelected: !!insuranceSelected,
            insuranceAmount: !!insuranceSelected ? 500 : 0
        };

        if (vehicleId) {
            // Vehicle booking logic
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

            if (vehicle.verificationStatus !== "approved") {
                return res.status(400).json({
                    success: false,
                    message: "Vehicle is not approved for booking"
                });
            }

            // Check if user has approved license for this vehicle type
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            const approvedLicense = user.licenses.find(
                license => license.vehicleTypes?.includes(vehicle.category) && license.status === "approved"
            );

            if (!approvedLicense) {
                return res.status(403).json({
                    success: false,
                    message: `You need an approved ${vehicle.category} license to book this vehicle. Please upload your license and wait for admin approval.`
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
            let totalAmount = totalDays * vehicle.rentPerDay;
            const insuranceAmount = !!insuranceSelected ? 500 : 0;
            totalAmount += insuranceAmount;

            bookingData = {
                ...bookingData,
                vehicleId,
                bookingType: "vehicle",
                totalDays,
                rentPerDay: vehicle.rentPerDay,
                totalAmount,
                insuranceSelected: !!insuranceSelected,
                insuranceAmount,
                pickupLocation: vehicle.pickupLocation
            };
        } else if (sparePartId) {
            // Spare part booking logic
            const sparePart = await SparePart.findById(sparePartId);
            if (!sparePart) {
                return res.status(404).json({
                    success: false,
                    message: "Spare part not found"
                });
            }

            if (!sparePart.rentPrice) {
                return res.status(400).json({
                    success: false,
                    message: "This spare part is not available for rent"
                });
            }

            if (!sparePart.isAvailable || sparePart.stock <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Spare part is out of stock"
                });
            }

            // Check if spare part was updated within the last 2 days
            if (sparePart.updatedAt) {
                const TWO_DAYS = 1000 * 60 * 60 * 24 * 2;
                const updatedAtTime = new Date(sparePart.updatedAt).getTime();
                const currentTime = Date.now();
                const isRecentlyUpdated = updatedAtTime > currentTime - TWO_DAYS;
                
                if (isRecentlyUpdated) {
                    return res.status(400).json({
                        success: false,
                        message: "This spare part was recently updated. Please wait 2 days before booking."
                    });
                }
            }

            // Check for overlapping bookings for this spare part
            const overlappingBookings = await Booking.find({
                sparePartId,
                bookingStatus: { $in: ["pending", "confirmed", "active"] },
                $or: [
                    {
                        startDate: { $lte: end },
                        endDate: { $gte: start }
                    }
                ]
            });

            // Check if stock is sufficient (considering existing bookings)
            const bookedQuantity = overlappingBookings.reduce((sum, booking) => {
                // For now, each booking is for 1 unit, but this can be extended
                return sum + 1;
            }, 0);

            if (sparePart.stock <= bookedQuantity) {
                return res.status(400).json({
                    success: false,
                    message: "Spare part is not available for the selected dates"
                });
            }

            // Calculate total days and amount
            const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            let totalAmount = totalDays * sparePart.rentPrice;
            const insuranceAmount = !!insuranceSelected ? 500 : 0;
            totalAmount += insuranceAmount;

            bookingData = {
                ...bookingData,
                sparePartId,
                bookingType: "sparePart",
                totalDays,
                rentPerDay: sparePart.rentPrice,
                totalAmount,
                insuranceSelected: !!insuranceSelected,
                insuranceAmount,
                pickupLocation: {
                    address: "Store Location",
                    city: "Kathmandu"
                }
            };
        }

        // Create booking
        const booking = await Booking.create(bookingData);

        res.status(201).json({
            success: true,
            message: "Booking created. Please complete payment via eSewa to confirm your booking.",
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
            .populate("sparePartId", "name images category brand")
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
            .populate("sparePartId")
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

export const checkAvailability = async (req, res) => {
    try {
        const { vehicleId, sparePartId, startDate, endDate } = req.query;

        if (!vehicleId && !sparePartId) {
            return res.status(400).json({
                success: false,
                message: "Either vehicle ID or spare part ID is required"
            });
        }

        if (vehicleId && sparePartId) {
            return res.status(400).json({
                success: false,
                message: "Cannot check availability for both vehicle and spare part"
            });
        }

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Start date and end date are required"
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

        if (vehicleId) {
            // Vehicle availability check
            const vehicle = await Vehicle.findById(vehicleId);
            if (!vehicle) {
                return res.status(404).json({
                    success: false,
                    message: "Vehicle not found"
                });
            }

            if (!vehicle.isAvailable) {
                return res.json({
                    success: true,
                    available: false,
                    message: "Vehicle is not available for booking",
                    reason: "vehicle_unavailable"
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
                // Get all booked date ranges for display
                const bookedRanges = overlappingBookings.map(booking => ({
                    startDate: booking.startDate,
                    endDate: booking.endDate
                }));

                return res.json({
                    success: true,
                    available: false,
                    message: "Vehicle is already booked for the selected dates",
                    reason: "date_conflict",
                    bookedRanges
                });
            }

            // Get all existing bookings to show unavailable dates
            const allBookings = await Booking.find({
                vehicleId,
                bookingStatus: { $in: ["pending", "confirmed", "active"] }
            }).select("startDate endDate").sort({ startDate: 1 });

            const bookedRanges = allBookings.map(booking => ({
                startDate: booking.startDate,
                endDate: booking.endDate
            }));

            return res.json({
                success: true,
                available: true,
                message: "Vehicle is available for the selected dates",
                bookedRanges
            });
        } else if (sparePartId) {
            // Spare part availability check
            const sparePart = await SparePart.findById(sparePartId);
            if (!sparePart) {
                return res.status(404).json({
                    success: false,
                    message: "Spare part not found"
                });
            }

            if (!sparePart.rentPrice) {
                return res.json({
                    success: true,
                    available: false,
                    message: "This spare part is not available for rent",
                    reason: "not_rentable"
                });
            }

            if (!sparePart.isAvailable || sparePart.stock <= 0) {
                return res.json({
                    success: true,
                    available: false,
                    message: "Spare part is out of stock",
                    reason: "out_of_stock"
                });
            }

            // Check for overlapping bookings
            const overlappingBookings = await Booking.find({
                sparePartId,
                bookingStatus: { $in: ["pending", "confirmed", "active"] },
                $or: [
                    {
                        startDate: { $lte: end },
                        endDate: { $gte: start }
                    }
                ]
            });

            // Check if stock is sufficient
            const bookedQuantity = overlappingBookings.length;
            if (sparePart.stock <= bookedQuantity) {
                const bookedRanges = overlappingBookings.map(booking => ({
                    startDate: booking.startDate,
                    endDate: booking.endDate
                }));

                return res.json({
                    success: true,
                    available: false,
                    message: "Spare part is not available for the selected dates",
                    reason: "date_conflict",
                    bookedRanges
                });
            }

            // Get all existing bookings to show unavailable dates
            const allBookings = await Booking.find({
                sparePartId,
                bookingStatus: { $in: ["pending", "confirmed", "active"] }
            }).select("startDate endDate").sort({ startDate: 1 });

            const bookedRanges = allBookings.map(booking => ({
                startDate: booking.startDate,
                endDate: booking.endDate
            }));

            return res.json({
                success: true,
                available: true,
                message: "Spare part is available for the selected dates",
                bookedRanges
            });
        }
    } catch (error) {
        console.error("Error checking availability:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to check availability"
        });
    }
};

