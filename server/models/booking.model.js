import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        vehicleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vehicle",
            required: false
        },
        sparePartId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SparePart",
            required: false
        },
        bookingType: {
            type: String,
            enum: ["vehicle", "sparePart"],
            required: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        totalDays: {
            type: Number,
            required: true
        },
        rentPerDay: {
            type: Number,
            required: true
        },
        totalAmount: {
            type: Number,
            required: true
        },
        // Insurance addon
        insuranceSelected: {
            type: Boolean,
            default: false
        },
        insuranceAmount: {
            type: Number,
            default: 0
        },
        insuranceDetails: {
            type: String,
            default: "Accidental coverage"
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "refunded"],
            default: "pending"
        },
        paymentMethod: {
            type: String,
            enum: ["esewa"],
            default: "esewa"
        },
        // eSewa payment fields
        esewaTransactionUuid: {
            type: String,
            default: null
        },
        esewaTransactionCode: {
            type: String,
            default: null
        },
        esewaRefId: {
            type: String,
            default: null
        },
        bookingStatus: {
            type: String,
            enum: ["pending", "confirmed", "active", "completed", "cancelled"],
            default: "pending"
        },
        pickupLocation: {
            address: { type: String, required: false },
            city: { type: String, required: false }
        },
        notes: {
            type: String,
            default: ""
        },
        isPaymentDeferred: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

// Validate that endDate is after startDate
bookingSchema.pre("save", function (next) {
    if (this.endDate <= this.startDate) {
        return next(new Error("End date must be after start date"));
    }
    
    // Validate that either vehicleId or sparePartId is present
    if (!this.vehicleId && !this.sparePartId) {
        return next(new Error("Either vehicleId or sparePartId must be provided"));
    }
    
    // Validate that bookingType matches the provided ID
    if (this.bookingType === "vehicle" && !this.vehicleId) {
        return next(new Error("vehicleId is required for vehicle bookings"));
    }
    
    if (this.bookingType === "sparePart" && !this.sparePartId) {
        return next(new Error("sparePartId is required for spare part bookings"));
    }
    
    next();
});

export default mongoose.model("Booking", bookingSchema);

