import mongoose from "mongoose";

const sparePartSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        category: {
            type: String,
            required: true,
            enum: ["Electrical", "Tires", "Body", "Accessories", "Brakes"],
        },
        brand: {
            type: String,
            required: true,
            trim: true
        },
        rentPrice: {
            type: Number,
            required: true,
            min: 0
        },
        compatibleVehicles: {
            type: String,
            default: ""
        },
        description: {
            type: String,
            default: ""
        },
        images: {
            type: [String],
            default: []
        },
        isAvailable: {
            type: Boolean,
            default: true
        },

        pickupLocation: {
            address: { type: String, required: true, trim: true },
            city: { type: String, required: true, trim: true },
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active"
        }
    },
    { timestamps: true }
);

export default mongoose.model("SparePart", sparePartSchema);

