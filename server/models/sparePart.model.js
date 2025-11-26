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
        price: {
            type: Number,
            required: true,
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
        }
    },
    { timestamps: true }
);

export default mongoose.model("SparePart", sparePartSchema);

