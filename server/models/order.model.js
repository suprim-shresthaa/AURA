import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    sparePartId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SparePart",
        required: true
    },
    partName: String,
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    unitPrice: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        items: [orderItemSchema],
        totalAmount: {
            type: Number,
            required: true
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "initiated", "completed", "failed", "refunded"],
            default: "pending"
        },
        orderStatus: {
            type: String,
            enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
            default: "pending"
        },
        paymentMethod: {
            type: String,
            enum: ["esewa", "cash", "bank_transfer"],
            default: "esewa"
        },
        esewaTransactionUuid: String,
        esewaTransactionDate: Date,
        esewaRefId: String,
        
        // Delivery details
        deliveryAddress: {
            street: String,
            city: String,
            province: String,
            postalCode: String,
            phone: String
        },
        notes: String,
        
        // Timestamps
        createdAt: {
            type: Date,
            default: Date.now
        },
        paidAt: Date,
        shippedAt: Date,
        deliveredAt: Date
    },
    { timestamps: true }
);

// Index for quick lookups
orderSchema.index({ userId: 1 });
orderSchema.index({ esewaTransactionUuid: 1 });
orderSchema.index({ paymentStatus: 1 });

export default mongoose.model("Order", orderSchema);
