import React, { useState, useEffect, useContext } from "react";
import { X, Calendar, DollarSign, CreditCard, Clock, CheckCircle2, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axiosInstance from "@/lib/axiosInstance";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContent } from "./context/AppContext";

export default function BookingModal({ isOpen, onClose, vehicle }) {
    const navigate = useNavigate();
    const { userData } = useContext(AppContent);
    
    const canBook = userData?.role === "user";
    const [step, setStep] = useState(1); // 1: dates, 2: payment option, 3: payment details
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [availabilityStatus, setAvailabilityStatus] = useState(null); // { available: true/false, bookedRanges: [] }
    
    const [formData, setFormData] = useState({
        startDate: "",
        endDate: "",
        paymentOption: "", // "now" or "todo"
        paymentMethod: "",
        notes: ""
    });

    const [hasLicense, setHasLicense] = useState(true);

    useEffect(() => {
        if (isOpen) {
            // Reset form when modal opens
            setStep(1);
            setFormData({
                startDate: "",
                endDate: "",
                paymentOption: "",
                paymentMethod: "",
                notes: ""
            });
            setError("");
            setAvailabilityStatus(null);
            
            // Check if user has license for this vehicle type
            checkLicense();
        }
    }, [isOpen, vehicle]);

    const checkLicense = async () => {
        if (!vehicle?.category || !userData?.userId) {
            setHasLicense(false);
            return;
        }

        try {
            const response = await axiosInstance.get("/user/license/my-licenses");
            if (response.data?.success) {
                const approvedLicense = (response.data.data || []).find(
                    license => license.vehicleType === vehicle.category && license.status === "approved"
                );
                setHasLicense(!!approvedLicense);
            } else {
                setHasLicense(false);
            }
        } catch (error) {
            console.error("Error checking license:", error);
            setHasLicense(false);
        }
    };

    const calculateDays = () => {
        if (!formData.startDate || !formData.endDate) return 0;
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays || 0;
    };

    const calculateTotal = () => {
        const days = calculateDays();
        return days * (vehicle?.rentPerDay || 0);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError("");
        
        // Check availability when dates change
        if ((name === "startDate" || name === "endDate") && vehicle?._id) {
            const newStartDate = name === "startDate" ? value : formData.startDate;
            const newEndDate = name === "endDate" ? value : formData.endDate;
            
            if (newStartDate && newEndDate) {
                checkAvailability(newStartDate, newEndDate);
            } else {
                setAvailabilityStatus(null);
            }
        }
    };

    const checkAvailability = async (startDate, endDate) => {
        if (!startDate || !endDate || !vehicle?._id) return;
        
        setCheckingAvailability(true);
        try {
            const response = await axiosInstance.get("/bookings/check-availability", {
                params: {
                    vehicleId: vehicle._id,
                    startDate,
                    endDate
                }
            });

            if (response.data.success) {
                setAvailabilityStatus({
                    available: response.data.available,
                    bookedRanges: response.data.bookedRanges || [],
                    message: response.data.message
                });

                if (!response.data.available) {
                    setError(response.data.message || "Vehicle is not available for the selected dates");
                } else {
                    setError("");
                }
            }
        } catch (err) {
            console.error("Error checking availability:", err);
            // Don't show error for availability check failures, just log it
        } finally {
            setCheckingAvailability(false);
        }
    };


    const handleNext = async () => {
        if (step === 1) {
            // Check license before proceeding
            if (!hasLicense) {
                setError(`You need an approved ${vehicle?.category} license to book this vehicle.`);
                return;
            }
            // First validate basic date rules
            if (!formData.startDate || !formData.endDate) {
                setError("Please select both start and end dates");
                return;
            }

            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (start < today) {
                setError("Start date cannot be in the past");
                return;
            }

            if (end <= start) {
                setError("End date must be after start date");
                return;
            }

            // Check availability if not already checked or if dates changed
            if (availabilityStatus === null || checkingAvailability) {
                setCheckingAvailability(true);
                try {
                    const response = await axiosInstance.get("/bookings/check-availability", {
                        params: {
                            vehicleId: vehicle._id,
                            startDate: formData.startDate,
                            endDate: formData.endDate
                        }
                    });

                    if (response.data.success) {
                        const newStatus = {
                            available: response.data.available,
                            bookedRanges: response.data.bookedRanges || [],
                            message: response.data.message
                        };
                        setAvailabilityStatus(newStatus);

                        if (!response.data.available) {
                            setError(response.data.message || "Vehicle is not available for the selected dates");
                            setCheckingAvailability(false);
                            return;
                        } else {
                            setError("");
                            // If available, proceed to next step
                            setStep(2);
                        }
                    }
                } catch (err) {
                    console.error("Error checking availability:", err);
                    setError("Failed to check availability. Please try again.");
                } finally {
                    setCheckingAvailability(false);
                }
                return;
            }

            // If availability is checked and not available, show error
            if (availabilityStatus && !availabilityStatus.available) {
                setError(availabilityStatus.message || "Vehicle is not available for the selected dates");
                return;
            }

            // If available, proceed to next step
            if (availabilityStatus && availabilityStatus.available) {
                setStep(2);
            }
        } else if (step === 2) {
            if (!formData.paymentOption) {
                setError("Please select a payment option");
                return;
            }
            if (formData.paymentOption === "now" && !formData.paymentMethod) {
                setError("Please select a payment method");
                return;
            }
            setStep(3);
        }
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
        setError("");
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError("");

        try {
            const days = calculateDays();
            const total = calculateTotal();

            // Prepare booking data
            const bookingData = {
                vehicleId: vehicle._id,
                startDate: formData.startDate,
                endDate: formData.endDate,
                totalDays: days,
                rentPerDay: vehicle.rentPerDay,
                totalAmount: total,
                notes: formData.notes || ""
            };

            // If payment option is "now", initiate payment (booking will be created after payment succeeds)
            if (formData.paymentOption === "now") {
                try {
                    if (formData.paymentMethod === "esewa") {
                        // eSewa payment
                        const paymentResponse = await axiosInstance.post("/payments/esewa/initiate", {
                            bookingData: bookingData
                        });

                        if (paymentResponse.data.success && paymentResponse.data.data.formData) {
                            // Create and submit form to eSewa
                            const form = document.createElement("form");
                            form.method = "POST";
                            form.action = paymentResponse.data.data.formUrl;

                            Object.keys(paymentResponse.data.data.formData).forEach(key => {
                                const input = document.createElement("input");
                                input.type = "hidden";
                                input.name = key;
                                input.value = paymentResponse.data.data.formData[key];
                                form.appendChild(input);
                            });
                            console.log(form)
                            document.body.appendChild(form);
                            form.submit();
                            return; // Don't close modal yet, let eSewa handle the redirect
                        } else {
                            setError("Failed to initiate payment. Please try again.");
                        }
                    }
                } catch (paymentErr) {
                    console.error("Payment initiation error:", paymentErr);
                    
                    // Handle authentication errors specifically
                    if (paymentErr.response?.status === 401) {
                        const errorMessage = paymentErr.response?.data?.message || "Session expired. Please login again.";
                        setError(errorMessage);
                        toast.error(errorMessage);
                        
                        // Redirect to login after showing error
                        setTimeout(() => {
                            onClose();
                            navigate("/login");
                        }, 2000);
                        return;
                    }
                    
                    setError(
                        paymentErr.response?.data?.message || 
                        "Failed to initiate payment. Please try again."
                    );
                }
            } else {
                // Payment deferred - create booking immediately
                const response = await axiosInstance.post("/bookings/create", {
                    ...bookingData,
                    isPaymentDeferred: true,
                    paymentMethod: null
                });

                if (response.data.success) {
                    toast.success(response.data.message || "Booking saved successfully!");
                    setTimeout(() => {
                        onClose();
                        navigate("/profile");
                    }, 1500);
                } else {
                    setError(response.data.message || "Failed to create booking. Please try again.");
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to process booking. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Prevent vendors and admins from booking
    if (!canBook) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                    <div className="text-center">
                        <X className="mx-auto text-red-600 mb-4" size={48} />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Restricted</h2>
                        <p className="text-gray-600 mb-6">
                            Vendors and admins cannot book vehicles.
                        </p>
                        <Button onClick={onClose} className="w-full">
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const days = calculateDays();
    const total = calculateTotal();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scaleIn flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Book Vehicle</h2>
                        <p className="text-sm text-gray-600 mt-1">{vehicle?.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={loading}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center flex-1">
                                <div className="flex items-center">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                                            step >= s
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-200 text-gray-600"
                                        }`}
                                    >
                                        {step > s ? <CheckCircle2 size={16} /> : s}
                                    </div>
                                    <span
                                        className={`ml-2 text-sm font-medium ${
                                            step >= s ? "text-blue-600" : "text-gray-600"
                                        }`}
                                    >
                                        {s === 1 ? "Dates" : s === 2 ? "Payment" : "Confirm"}
                                    </span>
                                </div>
                                {s < 3 && (
                                    <div
                                        className={`flex-1 h-0.5 mx-2 ${
                                            step > s ? "bg-blue-600" : "bg-gray-200"
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Select Dates */}
                    {step === 1 && (
                        <div className="space-y-6">
                            {!hasLicense && (
                                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-yellow-900 mb-1">
                                                License Required
                                            </p>
                                            <p className="text-sm text-yellow-700 mb-3">
                                                You need an approved {vehicle?.category} license to book this vehicle.
                                            </p>
                                            <Button
                                                onClick={() => {
                                                    onClose();
                                                    navigate("/profile?tab=licenses");
                                                }}
                                                variant="outline"
                                                size="sm"
                                                className="text-yellow-800 border-yellow-300 hover:bg-yellow-100"
                                            >
                                                <FileText className="mr-2 h-4 w-4" />
                                                Upload License
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Select Rental Dates
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="startDate" className="mb-2 block">
                                            <Calendar className="inline w-4 h-4 mr-1" />
                                            Start Date
                                        </Label>
                                        <Input
                                            id="startDate"
                                            name="startDate"
                                            type="date"
                                            value={formData.startDate}
                                            onChange={handleInputChange}
                                            min={new Date().toISOString().split("T")[0]}
                                            className={availabilityStatus && !availabilityStatus.available ? "border-red-300" : ""}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="endDate" className="mb-2 block">
                                            <Calendar className="inline w-4 h-4 mr-1" />
                                            End Date
                                        </Label>
                                        <Input
                                            id="endDate"
                                            name="endDate"
                                            type="date"
                                            value={formData.endDate}
                                            onChange={handleInputChange}
                                            min={formData.startDate || new Date().toISOString().split("T")[0]}
                                            className={availabilityStatus && !availabilityStatus.available ? "border-red-300" : ""}
                                        />
                                    </div>
                                </div>
                                
                                {/* Availability Status */}
                                {checkingAvailability && (
                                    <div className="mt-3 text-sm text-blue-600 flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                                        Checking availability...
                                    </div>
                                )}
                                
                                {availabilityStatus && availabilityStatus.available && formData.startDate && formData.endDate && (
                                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center gap-2 text-green-700 text-sm">
                                            <CheckCircle2 size={16} />
                                            <span>Vehicle is available for the selected dates</span>
                                        </div>
                                    </div>
                                )}

                                {/* Show Booked Dates */}
                                {availabilityStatus && availabilityStatus.bookedRanges && availabilityStatus.bookedRanges.length > 0 && (
                                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                        <h4 className="text-sm font-semibold text-amber-900 mb-2">Booked Dates:</h4>
                                        <div className="space-y-1">
                                            {availabilityStatus.bookedRanges.map((range, index) => (
                                                <div key={index} className="text-xs text-amber-700">
                                                    {new Date(range.startDate).toLocaleDateString()} - {new Date(range.endDate).toLocaleDateString()}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {days > 0 && (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Rental Days:</span>
                                                <span className="font-semibold">{days} days</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Price per day:</span>
                                                <span className="font-semibold">Rs. {vehicle?.rentPerDay}</span>
                                            </div>
                                            <div className="border-t border-gray-200 pt-2 flex justify-between">
                                                <span className="font-semibold text-gray-900">Total Amount:</span>
                                                <span className="text-xl font-bold text-blue-600">
                                                    Rs. {total}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Step 2: Payment Option */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Choose Payment Option
                                </h3>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData(prev => ({ 
                                                ...prev, 
                                                paymentOption: "now",
                                                paymentMethod: prev.paymentMethod || "esewa" // Default to esewa if not set
                                            }));
                                            setError("");
                                        }}
                                        className={`p-6 border-2 rounded-lg text-left transition-all ${
                                            formData.paymentOption === "now"
                                                ? "border-blue-600 bg-blue-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`p-2 rounded-lg ${
                                                formData.paymentOption === "now" ? "bg-blue-600" : "bg-gray-200"
                                            }`}>
                                                <DollarSign className="text-white" size={20} />
                                            </div>
                                            <span className="font-semibold text-gray-900">Pay Now</span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Complete payment immediately and confirm your booking
                                        </p>
                                    </button>

                                    {/* <button
                                        type="button"
                                        onClick={() => {
                                            setFormData(prev => ({ ...prev, paymentOption: "todo" }));
                                            setError("");
                                        }}
                                        className={`p-6 border-2 rounded-lg text-left transition-all ${
                                            formData.paymentOption === "todo"
                                                ? "border-blue-600 bg-blue-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`p-2 rounded-lg ${
                                                formData.paymentOption === "todo" ? "bg-blue-600" : "bg-gray-200"
                                            }`}>
                                                <Clock className="text-white" size={20} />
                                            </div>
                                            <span className="font-semibold text-gray-900">Save for Later</span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Save booking to your todos and pay later
                                        </p>
                                    </button> */}
                                </div>

                                {formData.paymentOption === "now" && (
                                    <div className="mt-6">
                                        <Label className="mb-3 block">Payment Method</Label>
                                        <div className="grid grid-cols-1 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, paymentMethod: "esewa" }));
                                                    setError("");
                                                }}
                                                className={`p-4 border-2 rounded-lg text-left transition-all ${
                                                    formData.paymentMethod === "esewa"
                                                        ? "border-blue-600 bg-blue-50"
                                                        : "border-gray-200 hover:border-gray-300"
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <CreditCard className="text-blue-600" size={20} />
                                                    <div>
                                                        <span className="font-semibold text-gray-900 block">eSewa</span>
                                                        <span className="text-xs text-gray-600">Mobile wallet</span>
                                                    </div>
                                                </div>
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            You will be redirected to the secure payment page to complete your transaction.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Booking Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Vehicle:</span>
                                            <span className="font-medium">{vehicle?.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Duration:</span>
                                            <span className="font-medium">{days} days</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total Amount:</span>
                                            <span className="font-bold text-blue-600">Rs. {total}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Step 3: Confirm */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="text-center py-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="text-green-600" size={32} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Review Your Booking
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Please review your booking details before confirming
                                </p>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Booking Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Vehicle:</span>
                                        <span className="font-medium">{vehicle?.name}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Start Date:</span>
                                        <span className="font-medium">
                                            {new Date(formData.startDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">End Date:</span>
                                        <span className="font-medium">
                                            {new Date(formData.endDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Duration:</span>
                                        <span className="font-medium">{days} days</span>
                                    </div>
                                    {/* <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Payment:</span>
                                        <span className="font-medium">
                                            {formData.paymentOption === "now" 
                                                ? "Pay Now (eSewa)"
                                                : "Save for Later"}
                                        </span>
                                    </div> */}
                                    <div className="border-t border-gray-200 pt-3 flex justify-between">
                                        <span className="font-semibold text-gray-900">Total Amount:</span>
                                        <span className="text-xl font-bold text-blue-600">Rs. {total}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <div>
                                <Label htmlFor="notes" className="mb-2 block">
                                    Additional Notes (Optional)
                                </Label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Any special requests or notes..."
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
                    {step > 1 && (
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={loading}
                        >
                            Back
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    {step < 3 ? (
                        <Button
                            onClick={handleNext}
                            disabled={loading || checkingAvailability}
                        >
                            {checkingAvailability ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                    Checking...
                                </>
                            ) : (
                                "Next"
                            )}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                    Processing...
                                </>
                            ) : (
                                formData.paymentOption === "now" ? "Confirm & Pay" : "Save Booking"
                            )}
                        </Button>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
                .animate-scaleIn { animation: scaleIn 0.2s ease-out; }
            `}</style>
        </div>
    );
}

