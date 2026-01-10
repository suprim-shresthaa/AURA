import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "./context/AppContext";
import { ArrowLeft, Loader } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "react-toastify";
import axios from "axios";
import Cookies from "js-cookie";

export default function Checkout() {
    const navigate = useNavigate();
    const { cart, cartItems, isLoggedin, backendUrl, clearCart } = useContext(AppContent);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: ""
    });

    React.useEffect(() => {
        if (!isLoggedin) {
            navigate("/login");
            return;
        }
        if (!cart || !cartItems || cartItems.length === 0) {
            navigate("/cart");
            return;
        }
    }, [isLoggedin, cart, cartItems]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.firstName || !formData.lastName || !formData.email || 
            !formData.phone || !formData.street || !formData.city || 
            !formData.state || !formData.zipCode) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            setLoading(true);

            const deliveryAddress = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                street: formData.street,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,
                country: formData.country || "Nepal"
            };

            // Initiate payment
            const response = await axios.post(
                `${backendUrl}/api/payments/cart/initiate`,
                { deliveryAddress },
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("token")}`
                    }
                }
            );
            console.log(response.data);

            if (response.data.success && response.data.data) {
                // Get eSewa form data from backend response
                const { formUrl, formData } = response.data.data;

                // Create and submit eSewa form
                const form = document.createElement("form");
                form.method = "POST";
                form.action = formUrl;

                // Add all form fields from formData
                for (const [key, value] of Object.entries(formData)) {
                    const input = document.createElement("input");
                    input.type = "hidden";
                    input.name = key;
                    input.value = value;
                    form.appendChild(input);
                }

                document.body.appendChild(form);
                form.submit();
            } else {
                toast.error(response.data.message || "Error initiating payment");
            }
        } catch (error) {
            console.error("Checkout error:", error);
            const errorMessage = error.response?.data?.message || 
                                error.message ||
                                "An error occurred during checkout";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!cart || !cartItems || cartItems.length === 0) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <Button
                    variant="ghost"
                    onClick={() => navigate("/cart")}
                    className="mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Cart
                </Button>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Delivery Address</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Name Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            placeholder="John"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            placeholder="Doe"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Email and Phone */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="john@example.com"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="+977-9800000000"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Street Address */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Street Address *
                                    </label>
                                    <input
                                        type="text"
                                        name="street"
                                        value={formData.street}
                                        onChange={handleInputChange}
                                        placeholder="123 Main Street"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                {/* City, State, Zip */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="Kathmandu"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            State/Province *
                                        </label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            placeholder="Bagmati"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            ZIP Code *
                                        </label>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            value={formData.zipCode}
                                            onChange={handleInputChange}
                                            placeholder="44600"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Country */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        placeholder="Nepal"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => navigate("/cart")}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader className="w-4 h-4 mr-2 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            "Proceed to Payment"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                                {cartItems.map((item) => (
                                    <div key={item.sparePartId} className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            {item.sparePartId?.name || "Item"} x {item.quantity}
                                        </span>
                                        <span className="text-gray-900 font-semibold">
                                            Rs. {((item.price || 0) * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 pt-4 space-y-3">
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
                                <div className="border-t border-gray-200 pt-3 flex justify-between">
                                    <span className="text-gray-900 font-bold">Total</span>
                                    <span className="text-lg font-bold text-blue-600">
                                        Rs. {(cart.totalAmount || 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-xs text-blue-700">
                                    ℹ️ Your items will be locked during checkout to ensure availability. You'll be redirected to eSewa for secure payment.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
