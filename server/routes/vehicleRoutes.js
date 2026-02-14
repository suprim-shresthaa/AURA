import express from "express";
import { upload } from "../config/cloudinary.js";
import { createVehicle, updateVehicle, deleteVehicle, getAllVehicles, getVehicleById, getVehiclesByVendor, searchVehicles, toggleVehicleAvailability } from "../controllers/vehicleController.js";

const router = express.Router();

// Upload fields
const uploadFields = upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "bluebook", maxCount: 1 },
    { name: "images", maxCount: 10 },
]);

router.post("/create", uploadFields, createVehicle);
router.put("/:id", uploadFields, updateVehicle);
router.put("/:id/availability", toggleVehicleAvailability);
router.get("/all-vehicles", getAllVehicles)
router.get("/search", searchVehicles)
router.get('/vendor-vehicles', getVehiclesByVendor)
router.delete('/:id', deleteVehicle)
router.get("/:id", getVehicleById)

export default router;
