import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
    {
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            enum: ["Car", "Bike", "Scooter", "Jeep", "Van"]
        },

        modelYear: {
            type: Number,
            required: true
        },

        plateNumber: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
            unique: true
        },

        condition: {
            type: String,
            required: true,
            enum: ["Excellent", "Good", "Average"]
        },

        description: {
            type: String,
            trim: true
        },

        rentPerDay: {
            type: Number,
            required: true
        },

        // Images
        mainImage: {
            type: String,
            required: true
        },

        bluebook: {
            type: String,
            required: true
        },

        images: {
            type: [String],
            default: []
        },

        // Status fields
        isAvailable: {
            type: Boolean,
            default: true
        },
    },
    { timestamps: true }
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;
