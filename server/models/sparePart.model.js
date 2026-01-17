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
            enum: ["Engine", "Electrical", "Tires", "Filters", "Body", "Accessories", "Brakes", "Suspension"],
            required: true
        },
        brand: {
            type: String,
            required: true,
            trim: true
        },
        // Deprecated: kept for backward compatibility
        price: {
            type: Number,
            required: false,
            min: 0
        },
        rentPrice: {
            type: Number,
            required: false,
            min: 0
        },
        sellPrice: {
            type: Number,
            required: false,
            min: 0
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0
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
        status: {
            type: String,
            enum: ["Active", "Inactive", "OutOfStock"],
            default: "Active"
        },
        // Track if item is locked in someone's cart
        cartLock: {
            isLocked: {
                type: Boolean,
                default: false
            },
            lockedBy: mongoose.Schema.Types.ObjectId, // userId who locked it
            lockedAt: Date,
            lockExpiresAt: Date // Auto-unlock after timeout (e.g., 30 mins)
        }
    },
    { timestamps: true }
);

export default mongoose.model("SparePart", sparePartSchema);

