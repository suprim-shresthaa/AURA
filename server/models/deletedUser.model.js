import mongoose from "mongoose";

/**
 * Archive of soft-deleted users. The live User document is removed so the email
 * can be used to register again; this collection keeps admin-visible history.
 */
const deletedUserSchema = new mongoose.Schema(
    {
        originalUserId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        /** Plain object snapshot (no password) — same shape as User JSON for admin UI */
        snapshot: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        deletedAt: {
            type: Date,
            default: Date.now,
        },
        deletedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        reason: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

deletedUserSchema.index({ email: 1 });

const DeletedUser =
    mongoose.models.DeletedUser || mongoose.model("DeletedUser", deletedUserSchema);
export default DeletedUser;
