import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
    {
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: true
        },

        name: { type: String, required: true, trim: true },

        category: {
            type: String,
            required: true,
            enum: ["Car", "Bike", "Scooter", "Van"]
        },

        modelYear: { type: Number, required: true },

        condition: {
            type: String,
            required: true,
            enum: ["Excellent", "Good", "Average"]
        },

        description: { type: String, trim: true },

        fuelType: {
            type: String,
            enum: ["Petrol", "Diesel", "Electric", "Hybrid"],
            required: true
        },

        transmission: {
            type: String,
            enum: ["Manual", "Automatic"],
            required: true
        },

        seatingCapacity: { type: Number, required: true },

        mileage: { type: Number, required: true },


        rentPerDay: { type: Number, required: true },

        pickupLocation: {
            address: { type: String, required: true },
            city: { type: String, required: true },
        },

        mainImage: { type: String, required: true },
        bluebook: { type: String, required: true },
        images: { type: [String], default: [] },

        isAvailable: { type: Boolean, default: true },

        status: {
            type: String,
            enum: ["Active", "Inactive", "UnderMaintenance"],
            default: "Active"
        },
        verificationStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },
        rejectionReason: {
            type: String,
            default: ""
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        verifiedAt: {
            type: Date,
            default: null
        },
        ratings: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.model("Vehicle", vehicleSchema);
