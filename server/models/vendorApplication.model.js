import mongoose from "mongoose";

const vendorApplicationSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true },
        businessName: { type: String },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        businessType: { type: String, enum: ["individual", "company"], required: true },
        govIdType: { type: String, enum: ["citizenship", "license", "passport"], required: true },
        govIdNumber: { type: String, required: true },
        idDocumentUrl: { type: String, required: true },
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
        rejectionReason: { type: String, trim: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

export default mongoose.model("VendorApplication", vendorApplicationSchema);
