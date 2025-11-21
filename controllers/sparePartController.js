// controllers/sparePart.controller.js

import SparePart from "../models/SparePart.js";

export const addSparePart = async (req, res) => {
    try {
        const {
            name,
            category,
            brand,
            price,
            stock,
            compatibleVehicles,
            description,
        } = req.body;

        // Image URLs from Multer
        const imageUrls = req.files.map((file) => file.path);

        // Convert compatible vehicles string → array
        const vehiclesArray = compatibleVehicles
            ? compatibleVehicles.split(",").map((v) => v.trim())
            : [];

        const newPart = new SparePart({
            name,
            category,
            brand: brand || undefined,
            price: Number(price),
            stock: Number(stock),
            compatibleVehicles: vehiclesArray,
            description: description || "",
            images: imageUrls,
        });

        await newPart.save();

        res.status(201).json({
            success: true,
            message: "Spare part added successfully!",
            data: newPart,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to add spare part",
            error: error.message,
        });
    }
};


export const getAllSpareParts = async (req, res) => {
    try {
        const spareParts = await SparePart.find();
        res.status(200).json({ success: true, data: spareParts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};