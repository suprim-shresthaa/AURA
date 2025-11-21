import mongoose from "mongoose";

const sparePartSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    brand: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    compatibleVehicles: [String],
    description: { type: String },
    images: [String], // Array of Cloudinary URLs
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("SparePart", sparePartSchema);