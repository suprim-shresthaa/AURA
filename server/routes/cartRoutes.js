import express from "express";
import  userAuth  from "../middlewares/userAuth.js";
import {
    addToCart,
    removeFromCart,
    getCart,
    getUserOrders,
    getOrderById
} from "../controllers/cartController.js";

const router = express.Router();

// All routes require user authentication
router.use(userAuth);

// Cart routes
router.post("/add", addToCart);
router.post("/remove", removeFromCart);
router.get("/", getCart);

// Order routes
router.get("/orders/all", getUserOrders);
router.get("/orders/:orderId", getOrderById);

export default router;
