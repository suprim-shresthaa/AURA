import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "./context/AppContext";
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "react-toastify";

export default function Cart() {
    const navigate = useNavigate();
    const { cart, cartItems, fetchCart, removeItemFromCart, isLoggedin } = useContext(AppContent);
    const [loading, setLoading] = React.useState(false);

    useEffect(() => {
       
        fetchCart();
    }, [isLoggedin]);

    const handleRemoveItem = async (sparePartId) => {
        try {
            setLoading(true);
            const response = await removeItemFromCart(sparePartId);
            // removeItemFromCart already updates the state, so no need to fetchCart again
            // The state will be updated with the response from the API
            if (response && response.cart) {
                toast.success("Item removed from cart");
            }
        } catch (error) {
            console.error("Error removing item:", error);
            toast.error(error.response?.data?.message || "Error removing item");
            // If removal fails, refresh cart to get current state
            await fetchCart();
        } finally {
            setLoading(false);
        }
    };

    const handleCheckout = () => {
        if (!cartItems || cartItems.length === 0) {
            toast.warning("Cart is empty");
            return;
        }
        navigate("/checkout");
    };

    if (!cart) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/spare-parts")}
                        className="mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Continue Shopping
                    </Button>

                    <div className="text-center py-16">
                        <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Cart</h1>
                        <p className="text-gray-600 mb-6">Loading your cart...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/spare-parts")}
                        className="mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Continue Shopping
                    </Button>

                    <div className="text-center py-16">
                        <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h1>
                        <p className="text-gray-600 mb-6">Add some spare parts to your cart to get started</p>
                        <Button onClick={() => navigate("/spare-parts")} className="bg-blue-600 hover:bg-blue-700">
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Continue Shopping
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/spare-parts")}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Continue Shopping
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
                    <p className="text-gray-600 mt-2">
                        {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            {cartItems.map((item) => (
                                <CartItem
                                    key={item.sparePartId}
                                    item={item}
                                    onRemove={() => handleRemoveItem(item.sparePartId?._id)}
                                    loading={loading}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="text-gray-900 font-semibold">
                                        Rs. {(cart.totalAmount || 0).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="text-gray-900 font-semibold">Rs. 0</span>
                                </div>
                                <div className="border-t border-gray-200 pt-4 flex justify-between">
                                    <span className="text-gray-900 font-bold">Total</span>
                                    <span className="text-lg font-bold text-blue-600">
                                        Rs. {(cart.totalAmount || 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <Button
                                onClick={handleCheckout}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
                            >
                                Proceed to Checkout
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={() => navigate("/spare-parts")}
                                className="w-full mt-3"
                            >
                                Continue Shopping
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CartItem({ item, onRemove, loading }) {
    const navigate = useNavigate();

    return (
        <div className="border-b border-gray-200 last:border-0 p-6 flex gap-6 hover:bg-gray-50 transition">
            {/* Item Image Placeholder */}
            <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                {item.sparePartId?.images?.[0] && (
                    <img
                        src={item.sparePartId.images[0]}
                        alt={item.sparePartId?.name || "Spare part"}
                        className="w-full h-full object-cover"
                    />
                )}
            </div>

            {/* Item Details */}
            <div className="flex-grow">
                <div className="flex justify-between items-start mb-3">
                    <div
                        className="cursor-pointer hover:underline"
                        onClick={() => navigate(`/spare-parts/${item.sparePartId?._id}`)}
                    >
                        <h3 className="font-semibold text-gray-900">
                            {item.sparePartId?.name || "Unknown Item"}
                        </h3>
                        <p className="text-sm text-gray-500">{item.sparePartId?.category}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRemove}
                        disabled={loading}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-sm text-gray-600 mb-2">
                            Quantity: <span className="font-semibold text-gray-900">{item.quantity}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                            Price per unit: Rs. {(item.price || 0).toFixed(2)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Total</p>
                        <p className="text-lg font-bold text-blue-600">
                            Rs. {((item.price || 0) * item.quantity).toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
