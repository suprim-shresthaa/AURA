import Cart from "../models/cart.model.js";
import SparePart from "../models/sparePart.model.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import sendEmail from "../utils/emailTemplates.js";

const CART_LOCK_TIMEOUT = 30 * 60 * 1000; // 30 minutes

/**
 * Check if a spare part is locked by another user
 */
const isSparePartLocked = async (sparePartId, currentUserId) => {
    const sparePart = await SparePart.findById(sparePartId);
    
    if (!sparePart || !sparePart.cartLock.isLocked) {
        return false;
    }
    
    // Check if lock has expired
    if (sparePart.cartLock.lockExpiresAt < new Date()) {
        await SparePart.findByIdAndUpdate(sparePartId, {
            "cartLock.isLocked": false,
            "cartLock.lockedBy": null,
            "cartLock.lockedAt": null,
            "cartLock.lockExpiresAt": null
        });
        return false;
    }
    
    // Check if locked by current user (not locked for them)
    if (sparePart.cartLock.lockedBy.toString() === currentUserId.toString()) {
        return false;
    }
    
    return true;
};

/**
 * Add item to cart (NO locking at this stage)
 * Locking only happens during checkout when initiateCartPayment is called
 */
export const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { sparePartId, quantity } = req.body;
        
        if (!sparePartId || !quantity) {
            return res.status(400).json({ message: "Missing sparePartId or quantity" });
        }
        
        if (quantity < 1) {
            return res.status(400).json({ message: "Quantity must be at least 1" });
        }
        
        // Check if spare part exists
        const sparePart = await SparePart.findById(sparePartId);
        if (!sparePart) {
            return res.status(404).json({ message: "Spare part not found" });
        }
        
        // Check stock availability
        if (sparePart.stock < quantity) {
            return res.status(400).json({ 
                message: `Only ${sparePart.stock} items available in stock` 
            });
        }
        
        // Get or create cart for user
        let cart = await Cart.findOne({ userId });
        
        if (!cart) {
            cart = await Cart.create({
                userId,
                items: [],
                cartStatus: "active"
            });
        }
        
        // Check if item already in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.sparePartId.toString() === sparePartId.toString()
        );
        
        if (existingItemIndex > -1) {
            // Update quantity
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;
            
            if (newQuantity > sparePart.stock) {
                return res.status(400).json({ 
                    message: `Only ${sparePart.stock} items available in stock` 
                });
            }
            
            cart.items[existingItemIndex].quantity = newQuantity;
        } else {
            // Add new item (without locking - locking happens at checkout)
            cart.items.push({
                sparePartId,
                quantity,
                price: sparePart.price,
                isLocked: false
            });
        }
        
        // Save cart (totalAmount is calculated in pre-save hook)
        await cart.save();
        
        res.status(200).json({
            message: "Item added to cart",
            cart
        });
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ message: "Error adding to cart", error: error.message });
    }
};

/**
 * Remove item from cart
 * No lock unlocking needed here since items are only locked at checkout
 */
export const removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { sparePartId } = req.body;
        
        if (!sparePartId) {
            return res.status(400).json({ message: "Missing sparePartId" });
        }
        
        // Check if cart exists and item is in cart
        const existingCart = await Cart.findOne({ userId });
        if (!existingCart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        
        const itemExists = existingCart.items.some(
            item => item.sparePartId.toString() === sparePartId.toString()
        );
        
        if (!itemExists) {
            return res.status(404).json({ message: "Item not found in cart" });
        }
        
        // Use findOneAndUpdate with $pull to reliably remove the item
        // This is the recommended MongoDB way to remove items from arrays
        const cart = await Cart.findOneAndUpdate(
            { userId },
            { 
                $pull: { 
                    items: { sparePartId: sparePartId } 
                } 
            },
            { new: true, runValidators: true }
        );
        
        if (!cart) {
            return res.status(404).json({ message: "Cart not found after update" });
        }
        
        // Recalculate totalAmount manually since findOneAndUpdate doesn't trigger pre-save hooks
        cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        await cart.save();
        
        // Fetch the cart fresh from database with populate to ensure we have the latest data
        const updatedCart = await Cart.findById(cart._id).populate("items.sparePartId");
        
        if (!updatedCart) {
            return res.status(404).json({ message: "Cart not found when populating" });
        }
        
        res.status(200).json({
            message: "Item removed from cart",
            cart: updatedCart
        });
    } catch (error) {
        console.error("Error removing from cart:", error);
        res.status(500).json({ message: "Error removing from cart", error: error.message });
    }
};

/**
 * Get user's cart
 */
export const getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        
        let cart = await Cart.findOne({ userId }).populate("items.sparePartId");
        
        if (!cart) {
            cart = await Cart.create({
                userId,
                items: [],
                cartStatus: "active"
            });
        }
        
        res.status(200).json({
            cart
        });
    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ message: "Error fetching cart", error: error.message });
    }
};

/**
 * Clear cart (used after successful payment)
 */
export const clearCart = async (userId) => {
    try {
        const cart = await Cart.findOne({ userId });
        
        if (cart && cart.items.length > 0) {
            // Unlock all items
            for (const item of cart.items) {
                await SparePart.findByIdAndUpdate(item.sparePartId, {
                    "cartLock.isLocked": false,
                    "cartLock.lockedBy": null,
                    "cartLock.lockedAt": null,
                    "cartLock.lockExpiresAt": null
                });
            }
            
            // Clear cart
            cart.items = [];
            cart.cartStatus = "active";
            await cart.save();
        }
        
        return true;
    } catch (error) {
        console.error("Error clearing cart:", error);
        return false;
    }
};

/**
 * Update spare part quantity after successful purchase
 */
const updateSparePartStock = async (sparePartId, quantityPurchased) => {
    try {
        const sparePart = await SparePart.findById(sparePartId);
        
        if (!sparePart) {
            throw new Error("Spare part not found");
        }
        
        sparePart.stock -= quantityPurchased;
        
        // Update status
        if (sparePart.stock === 0) {
            sparePart.status = "OutOfStock";
            sparePart.isAvailable = false;
        } else if (sparePart.stock > 0 && sparePart.status === "OutOfStock") {
            sparePart.status = "Active";
            sparePart.isAvailable = true;
        }
        
        await sparePart.save();
        return sparePart;
    } catch (error) {
        console.error("Error updating spare part stock:", error);
        throw error;
    }
};

/**
 * Initiate eSewa payment for cart items
 * This will be called by a separate payment controller
 */
export const createOrderFromCart = async (userId, deliveryAddress) => {
    try {
        const cart = await Cart.findOne({ userId }).populate("items.sparePartId");
        
        if (!cart || cart.items.length === 0) {
            throw new Error("Cart is empty");
        }
        
        // Create order items from cart
        const orderItems = cart.items.map(item => ({
            sparePartId: item.sparePartId._id,
            partName: item.sparePartId.name,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity
        }));
        
        const order = await Order.create({
            userId,
            items: orderItems,
            totalAmount: cart.totalAmount,
            paymentStatus: "pending",
            orderStatus: "pending",
            paymentMethod: "esewa",
            deliveryAddress
        });
        
        return order;
    } catch (error) {
        console.error("Error creating order from cart:", error);
        throw error;
    }
};

/**
 * Complete order after successful payment
 */
export const completeOrderPayment = async (orderId, esewaTransactionUuid, esewaRefId) => {
    try {
        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                paymentStatus: "completed",
                orderStatus: "confirmed",
                esewaTransactionUuid,
                esewaRefId,
                paidAt: new Date()
            },
            { new: true }
        ).populate("userId", "name email contact")
         .populate("items.sparePartId", "name");
        
        if (!order) {
            throw new Error("Order not found");
        }
        
        // Update stock for all items in order
        for (const item of order.items) {
            await updateSparePartStock(item.sparePartId, item.quantity);
        }
        
        // Clear the user's cart
        await clearCart(order.userId);
        
        // Send confirmation emails
        try {
            // Send email to user
            if (order.userId && order.userId.email) {
                const orderItems = order.items.map(item => ({
                    partName: item.partName || item.sparePartId?.name || 'Unknown Part',
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.totalPrice
                }));

                await sendEmail(order.userId.email, 'order-confirmation-user', {
                    userName: order.userId.name,
                    orderId: order._id.toString().slice(-8).toUpperCase(),
                    items: orderItems,
                    totalAmount: order.totalAmount,
                    deliveryAddress: order.deliveryAddress,
                    paymentMethod: order.paymentMethod,
                    transactionId: order.esewaRefId
                });
            }

            // Send email to admin
            // Get admin email from environment or find admin user
            const adminEmail = process.env.ADMIN_EMAIL;
            if (adminEmail) {
                const orderItems = order.items.map(item => ({
                    partName: item.partName || item.sparePartId?.name || 'Unknown Part',
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.totalPrice
                }));

                await sendEmail(adminEmail, 'order-confirmation-admin', {
                    orderId: order._id.toString().slice(-8).toUpperCase(),
                    userName: order.userId?.name || 'Unknown',
                    userEmail: order.userId?.email || 'N/A',
                    userContact: order.userId?.contact || 'N/A',
                    items: orderItems,
                    totalAmount: order.totalAmount,
                    deliveryAddress: order.deliveryAddress,
                    paymentMethod: order.paymentMethod,
                    transactionId: order.esewaRefId
                });
            } else {
                // Fallback: find admin user
                const adminUser = await User.findOne({ role: 'admin' });
                if (adminUser && adminUser.email) {
                    const orderItems = order.items.map(item => ({
                        partName: item.partName || item.sparePartId?.name || 'Unknown Part',
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice
                    }));

                    await sendEmail(adminUser.email, 'order-confirmation-admin', {
                        orderId: order._id.toString().slice(-8).toUpperCase(),
                        userName: order.userId?.name || 'Unknown',
                        userEmail: order.userId?.email || 'N/A',
                        userContact: order.userId?.contact || 'N/A',
                        items: orderItems,
                        totalAmount: order.totalAmount,
                        deliveryAddress: order.deliveryAddress,
                        paymentMethod: order.paymentMethod,
                        transactionId: order.esewaRefId
                    });
                }
            }

            console.log('✅ Order confirmation emails sent successfully');
        } catch (emailError) {
            // Log error but don't fail the order completion
            console.error('❌ Error sending order confirmation emails:', emailError);
            // Order is still successful even if email fails
        }
        
        return order;
    } catch (error) {
        console.error("Error completing order payment:", error);
        throw error;
    }
};

/**
 * Fail order payment
 */
export const failOrderPayment = async (orderId) => {
    try {
        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                paymentStatus: "failed",
                orderStatus: "pending"
            },
            { new: true }
        );
        
        if (!order) {
            throw new Error("Order not found");
        }
        
        // Unlock items in the failed order so they can be added to cart again
        for (const item of order.items) {
            await SparePart.findByIdAndUpdate(item.sparePartId, {
                "cartLock.isLocked": false,
                "cartLock.lockedBy": null,
                "cartLock.lockedAt": null,
                "cartLock.lockExpiresAt": null
            });
        }
        
        return order;
    } catch (error) {
        console.error("Error failing order payment:", error);
        throw error;
    }
};

/**
 * Get user's orders
 */
export const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const orders = await Order.find({ userId })
            .populate("items.sparePartId")
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            orders
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Error fetching orders", error: error.message });
    }
};

/**
 * Get order by ID
 */
export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;
        
        const order = await Order.findById(orderId).populate("items.sparePartId");
        
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        
        // Ensure user can only see their own orders
        if (order.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        
        res.status(200).json({
            order
        });
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ message: "Error fetching order", error: error.message });
    }
};
