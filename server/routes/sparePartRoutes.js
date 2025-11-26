import express from "express";
import { upload } from "../config/cloudinary.js";
import {
    createSparePart,
    getAllSpareParts,
    searchSpareParts,
    getSparePartById,
    updateSparePart,
    deleteSparePart
} from "../controllers/sparePartController.js";

const router = express.Router();

// Upload fields for images
const uploadFields = upload.fields([
    { name: "images", maxCount: 10 }
]);

router.post("/add", uploadFields, createSparePart);
router.get("/all", getAllSpareParts);
router.get("/search", searchSpareParts);
router.get("/:id", getSparePartById);
router.put("/:id", uploadFields, updateSparePart);
router.delete("/:id", deleteSparePart);

export default router;

