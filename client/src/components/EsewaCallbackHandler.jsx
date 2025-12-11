import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const EsewaCallbackHandler = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = () => {
            try {
                // Get all query parameters from eSewa callback
                const callbackData = {};
                searchParams.forEach((value, key) => {
                    callbackData[key] = value;
                });

                // If data is base64 encoded, decode it and extract individual parameters
                if (callbackData.data) {
                    try {
                        const decoded = JSON.parse(atob(callbackData.data));
                        // Merge decoded data with existing params (decoded takes precedence)
                        Object.assign(callbackData, decoded);
                        // Remove the encoded data param as we've decoded it
                        delete callbackData.data;
                    } catch (e) {
                        console.error("Error decoding callback data:", e);
                    }
                }

                // Forward the callback to the backend
                // The backend will process it and redirect appropriately
                const backendUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5001/api";
                const callbackUrl = `${backendUrl}/payments/esewa/callback`;

                // Build query string from callback data
                const queryString = new URLSearchParams(callbackData).toString();
                const fullUrl = `${callbackUrl}?${queryString}`;

                // Redirect to backend callback endpoint
                // The backend will handle the callback and redirect to the appropriate frontend page
                window.location.href = fullUrl;
            } catch (error) {
                console.error("Error handling eSewa callback:", error);
                navigate("/payment/failed?error=callback_processing_error");
            }
        };

        handleCallback();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Processing payment callback...</p>
            </div>
        </div>
    );
};

export default EsewaCallbackHandler;

