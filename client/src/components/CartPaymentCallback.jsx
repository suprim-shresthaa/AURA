import React, { useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppContent } from "./context/AppContext";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { Button } from "./ui/button";
import axios from "axios";
import Cookies from "js-cookie";

export default function CartPaymentCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { backendUrl, clearCart } = useContext(AppContent);
    const [status, setStatus] = React.useState("processing"); // processing, success, failure
    const [orderData, setOrderData] = React.useState(null);
    const [message, setMessage] = React.useState("");

    useEffect(() => {
        const processPayment = async () => {
            try {
                // Get parameters from URL
                const pidx = searchParams.get("pidx");
                const status = searchParams.get("status");
                const transaction_uuid = searchParams.get("transaction_uuid");
                const transactionId = searchParams.get("transaction_id");

                if (!pidx || !status) {
                    setStatus("failure");
                    setMessage("Invalid payment response from eSewa");
                    return;
                }

                if (status !== "Completed") {
                    setStatus("failure");
                    setMessage("Payment was not completed. Please try again.");
                    return;
                }

                // Call backend to verify and complete payment
                const response = await axios.post(
                    `${backendUrl}/api/payments/cart/callback`,
                    {
                        pidx,
                        status,
                        transaction_uuid: transaction_uuid || pidx,
                        transactionId
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${Cookies.get("token")}`
                        }
                    }
                );

                if (response.data.success) {
                    setStatus("success");
                    setOrderData(response.data.data);
                    setMessage("Payment successful! Your order has been confirmed.");
                    clearCart();
                } else {
                    setStatus("failure");
                    setMessage(response.data.message || "Payment verification failed");
                }
            } catch (error) {
                console.error("Payment callback error:", error);
                setStatus("failure");
                setMessage(
                    error.response?.data?.message ||
                    error.message ||
                    "An error occurred while processing your payment"
                );
            }
        };

        processPayment();
    }, [searchParams, backendUrl, clearCart]);

    if (status === "processing") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
                <div className="text-center">
                    <Loader className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h1>
                    <p className="text-gray-600">Please wait while we confirm your payment...</p>
                </div>
            </div>
        );
    }

    if (status === "success") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
                <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                    <p className="text-gray-600 mb-6">{message}</p>

                    {orderData && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Order ID:</span>
                                    <span className="font-mono text-gray-900">{orderData.orderId}</span>
                                </div>
                                {orderData.totalAmount && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Amount:</span>
                                        <span className="font-semibold text-gray-900">
                                            Rs. {orderData.totalAmount.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                {orderData.itemCount && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Items:</span>
                                        <span className="font-semibold text-gray-900">{orderData.itemCount}</span>
                                    </div>
                                )}
                                {orderData.esewaRefId && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Ref ID:</span>
                                        <span className="font-mono text-gray-900">{orderData.esewaRefId}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <Button
                            onClick={() => navigate(`/profile/orders`)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
                        >
                            View Order Details
                        </Button>
                        <Button
                            onClick={() => navigate("/spare-parts")}
                            variant="ghost"
                            className="w-full"
                        >
                            Continue Shopping
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Failure
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center px-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
                <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
                <p className="text-gray-600 mb-6">{message}</p>

                <div className="space-y-3">
                    <Button
                        onClick={() => navigate("/cart")}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
                    >
                        Return to Cart
                    </Button>
                    <Button
                        onClick={() => navigate("/spare-parts")}
                        variant="ghost"
                        className="w-full"
                    >
                        Continue Shopping
                    </Button>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600">
                        💡 Your items remain in your cart. Please check your payment details and try again.
                    </p>
                </div>
            </div>
        </div>
    );
}
