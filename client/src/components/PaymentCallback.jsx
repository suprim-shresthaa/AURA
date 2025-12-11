import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axiosInstance from "@/lib/axiosInstance";

const PaymentCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("loading");
    const [bookingId, setBookingId] = useState(null);
    const [error, setError] = useState(null);
    const [bookingDetails, setBookingDetails] = useState(null);

    useEffect(() => {
        const path = window.location.pathname;
        const bookingIdParam = searchParams.get("bookingId");
        const errorParam = searchParams.get("error");
        const statusParam = searchParams.get("status");

        setBookingId(bookingIdParam);

        if (path.includes("/payment/success")) {
            setStatus("success");
            if (bookingIdParam) {
                fetchBookingDetails(bookingIdParam);
            }
        } else if (path.includes("/payment/failed")) {
            setStatus("failed");
            setError(errorParam || "Payment failed");
        } else if (path.includes("/payment/cancelled")) {
            setStatus("cancelled");
        } else if (path.includes("/payment/pending")) {
            setStatus("pending");
            setError(statusParam || "Payment is pending");
            if (bookingIdParam) {
                fetchBookingDetails(bookingIdParam);
            }
        }
    }, [searchParams]);

    const fetchBookingDetails = async (id) => {
        try {
            const response = await axiosInstance.get(`/bookings/${id}`);
            if (response.data.success) {
                setBookingDetails(response.data.data);
            }
        } catch (err) {
            console.error("Error fetching booking details:", err);
        }
    };

    const renderContent = () => {
        switch (status) {
            case "success":
                return (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="text-green-600" size={48} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                        <p className="text-gray-600 mb-6">
                            Your booking has been confirmed. You will receive a confirmation email shortly.
                        </p>
                        {bookingDetails && (
                            <Card className="max-w-md mx-auto mb-6">
                                <CardHeader>
                                    <CardTitle>Booking Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-left">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Vehicle:</span>
                                        <span className="font-medium">{bookingDetails.vehicleId?.name || "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Amount:</span>
                                        <span className="font-medium">Rs. {bookingDetails.totalAmount || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Duration:</span>
                                        <span className="font-medium">{bookingDetails.totalDays || 0} days</span>
                                    </div>
                                    {bookingDetails.esewaTransactionUuid && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Transaction ID:</span>
                                            <span className="font-medium truncate text-xs">{bookingDetails.esewaTransactionUuid}</span>
                                        </div>
                                    )}
                                    {bookingDetails.esewaRefId && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Reference ID:</span>
                                            <span className="font-medium text-xs">{bookingDetails.esewaRefId}</span>
                                        </div>
                                    )}
                                    {bookingDetails.esewaTransactionCode && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Transaction Code:</span>
                                            <span className="font-medium text-xs">{bookingDetails.esewaTransactionCode}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                        <div className="flex gap-4 justify-center">
                            <Button onClick={() => navigate("/profile")}>
                                View My Bookings
                            </Button>
                            <Button variant="outline" onClick={() => navigate("/vehicles")}>
                                Browse More Vehicles
                            </Button>
                        </div>
                    </div>
                );

            case "failed":
                return (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="text-red-600" size={48} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
                        <p className="text-gray-600 mb-6">
                            {error || "We couldn't process your payment. Please try again."}
                        </p>
                        {bookingId && (
                            <p className="text-sm text-gray-500 mb-6">
                                Your booking has been saved. You can complete the payment from your profile.
                            </p>
                        )}
                        <div className="flex gap-4 justify-center">
                            <Button onClick={() => navigate("/profile")}>
                                Go to Profile
                            </Button>
                            <Button variant="outline" onClick={() => navigate("/vehicles")}>
                                Browse Vehicles
                            </Button>
                        </div>
                    </div>
                );

            case "cancelled":
                return (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="text-amber-600" size={48} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
                        <p className="text-gray-600 mb-6">
                            You cancelled the payment process. Your booking has been saved.
                        </p>
                        {bookingId && (
                            <p className="text-sm text-gray-500 mb-6">
                                You can complete the payment later from your profile.
                            </p>
                        )}
                        <div className="flex gap-4 justify-center">
                            <Button onClick={() => navigate("/profile")}>
                                Go to Profile
                            </Button>
                            <Button variant="outline" onClick={() => navigate("/vehicles")}>
                                Browse Vehicles
                            </Button>
                        </div>
                    </div>
                );

            case "pending":
                return (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="text-blue-600" size={48} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Pending</h1>
                        <p className="text-gray-600 mb-6">
                            Your payment is being processed. We'll notify you once it's confirmed.
                        </p>
                        {error && (
                            <p className="text-sm text-amber-600 mb-6">Status: {error}</p>
                        )}
                        {bookingDetails && (
                            <Card className="max-w-md mx-auto mb-6">
                                <CardHeader>
                                    <CardTitle>Booking Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-left">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Vehicle:</span>
                                        <span className="font-medium">{bookingDetails.vehicleId?.name || "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Amount:</span>
                                        <span className="font-medium">Rs. {bookingDetails.totalAmount || 0}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        <div className="flex gap-4 justify-center">
                            <Button onClick={() => navigate("/profile")}>
                                View My Bookings
                            </Button>
                            <Button variant="outline" onClick={() => navigate("/vehicles")}>
                                Browse Vehicles
                            </Button>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="text-gray-600" size={48} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Processing...</h1>
                        <p className="text-gray-600">Please wait while we process your payment.</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                <Card>
                    <CardContent className="pt-12 pb-12">
                        {renderContent()}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PaymentCallback;

