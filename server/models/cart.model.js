import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    sparePartId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SparePart",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    // Lock status: when item is added to cart, it's locked
    // Locked means no other user can add this item until current user completes purchase or removes it
    isLocked: {
        type: Boolean,
        default: true
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

const cartSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        items: [cartItemSchema],
        totalAmount: {
            type: Number,
            default: 0,
            min: 0
        },
        cartStatus: {
            type: String,
            enum: ["active", "checkout_pending", "completed", "abandoned"],
            default: "active"
        },
        // Track locked items across users
        lockedItems: [
            {
                sparePartId: mongoose.Schema.Types.ObjectId,
                lockedUntil: Date,
                lockReason: String // "in_cart", "in_checkout", etc.
            }
        ]
    },
    { timestamps: true }
);

// Calculate total amount before saving
cartSchema.pre("save", function (next) {
    this.totalAmount = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    next();
});

// Index for quick user lookups
cartSchema.index({ userId: 1 });
cartSchema.index({ "lockedItems.sparePartId": 1 });

export default mongoose.model("Cart", cartSchema);
