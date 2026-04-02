import SparePart from "../models/sparePart.model.js";

/** Multipart may send nested pickup as an object or as flat keys like pickupLocation[address]. */
function normalizePickupLocation(body) {
    const pl = body.pickupLocation;
    if (pl && typeof pl === "object" && !Array.isArray(pl)) {
        const address = pl.address != null ? String(pl.address).trim() : "";
        const city = pl.city != null ? String(pl.city).trim() : "";
        if (address || city) return { address, city };
    }
    const a = body["pickupLocation[address]"];
    const c = body["pickupLocation[city]"];
    if (a != null || c != null) {
        return {
            address: a != null ? String(a).trim() : "",
            city: c != null ? String(c).trim() : "",
        };
    }
    return null;
}

function hasPickupInBody(body) {
    return (
        body.pickupLocation != null ||
        body["pickupLocation[address]"] !== undefined ||
        body["pickupLocation[city]"] !== undefined
    );
}

export const createSparePart = async (req, res) => {
    try {
        const { name, category, brand, rentPrice, compatibleVehicles, description } = req.body;

        if (!req.files?.images || req.files.images.length === 0) {
            return res.status(400).json({ success: false, message: "At least one image is required." });
        }

        // Rental-only: rentPrice is required
        const hasRentPrice = rentPrice !== undefined && rentPrice !== null && rentPrice !== "";
        if (!hasRentPrice) {
            return res.status(400).json({
                success: false,
                message: "rentPrice is required."
            });
        }

        const pickup = normalizePickupLocation(req.body);
        if (!pickup?.address || !pickup?.city) {
            return res.status(400).json({
                success: false,
                message: "Pickup address and city are required."
            });
        }

        const images = req.files.images.map(file => file.path);

        const sparePartData = {
            name: name.trim(),
            category,
            brand: brand.trim(),
            compatibleVehicles: compatibleVehicles?.trim() || "",
            description: description?.trim() || "",
            images,
            isAvailable: true,
            status: "Active",
            pickupLocation: {
                address: pickup.address,
                city: pickup.city,
            },
        };

        sparePartData.rentPrice = parseFloat(rentPrice);

        const sparePart = new SparePart(sparePartData);

        await sparePart.save();

        return res.status(201).json({
            success: true,
            message: "Spare part added successfully!",
            data: sparePart
        });
    } catch (error) {
        console.error("Error creating spare part:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

export const getAllSpareParts = async (req, res) => {
    try {
        const spareParts = await SparePart.find({ status: "Active" });
        res.status(200).json({ success: true, data: spareParts });
    } catch (error) {
        console.error("Error fetching spare parts:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const searchSpareParts = async (req, res) => {
    try {
        const {
            search,
            category,
            brand,
            minPrice,
            maxPrice,
            available
        } = req.query;

        // Build query
        const query = { status: "Active" };

        // Search by name, brand, or description
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { brand: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { compatibleVehicles: { $regex: search, $options: "i" } }
            ];
        }

        // Category filter
        if (category && category !== "all") {
            query.category = category;
        }

        // Brand filter
        if (brand && brand !== "all") {
            query.brand = { $regex: brand, $options: "i" };
        }

        // Price range filter - rentPrice only (rental-only spare parts)
        if (minPrice || maxPrice) {
            query.rentPrice = { $gte: parseFloat(minPrice || 0), $lte: parseFloat(maxPrice || Infinity) };
        }

        if (available !== undefined && (available === "true" || available === true)) {
            query.isAvailable = true;
        }

        const spareParts = await SparePart.find(query).sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: spareParts });
    } catch (error) {
        console.error("Error searching spare parts:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const getSparePartById = async (req, res) => {
    try {
        const { id } = req.params;
        const sparePart = await SparePart.findById(id);

        if (!sparePart) {
            return res.status(404).json({
                success: false,
                message: "Spare part not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: sparePart
        });
    } catch (error) {
        console.error("Error fetching spare part:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

export const updateSparePart = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        delete updateData.pickupLocation;
        delete updateData["pickupLocation[address]"];
        delete updateData["pickupLocation[city]"];
        delete updateData.stock;

        if (req.files?.images && req.files.images.length > 0) {
            updateData.images = req.files.images.map(file => file.path);
        }

        if (hasPickupInBody(req.body)) {
            const pickup = normalizePickupLocation(req.body);
            if (!pickup?.address || !pickup?.city) {
                return res.status(400).json({
                    success: false,
                    message: "Pickup address and city are required."
                });
            }
            updateData.pickupLocation = {
                address: pickup.address,
                city: pickup.city,
            };
        }

        // Handle price fields (rental-only: rentPrice required)
        if (updateData.rentPrice !== undefined) {
            updateData.rentPrice = updateData.rentPrice ? parseFloat(updateData.rentPrice) : null;
        }

        // Validate that rentPrice exists after update
        const sparePart = await SparePart.findById(id);
        if (!sparePart) {
            return res.status(404).json({
                success: false,
                message: "Spare part not found."
            });
        }

        const finalRentPrice = updateData.rentPrice !== undefined ? updateData.rentPrice : sparePart.rentPrice;
        if (!finalRentPrice) {
            return res.status(400).json({
                success: false,
                message: "rentPrice is required."
            });
        }

        const finalPickup = updateData.pickupLocation || sparePart.pickupLocation;
        if (!finalPickup?.address?.trim() || !finalPickup?.city?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Pickup address and city are required."
            });
        }

        const updatedSparePart = await SparePart.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedSparePart) {
            return res.status(404).json({
                success: false,
                message: "Spare part not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Spare part updated successfully!",
            data: updatedSparePart
        });
    } catch (error) {
        console.error("Error updating spare part:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

export const deleteSparePart = async (req, res) => {
    try {
        const { id } = req.params;
        const sparePart = await SparePart.findByIdAndUpdate(
            id,
            { status: "Inactive" },
            { new: true }
        );

        if (!sparePart) {
            return res.status(404).json({
                success: false,
                message: "Spare part not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Spare part deleted successfully."
        });
    } catch (error) {
        console.error("Error deleting spare part:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

