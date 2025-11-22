import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

export const AppContent = createContext();

export const AppContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";
    const [isLoggedin, setIsLoggedin] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Configure axios defaults once
    useEffect(() => {
        axios.defaults.withCredentials = true;
    }, []);

    // Single auth check on mount
    useEffect(() => {
        const checkAuth = async () => {
            // console.log("🔍 Checking authentication...");
            try {
                const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`);
                // console.log("✅ Auth check response:", data);
                if (data.success) {
                    setIsLoggedin(true);
                    // console.log("🔹 Auth successful — fetching user data...");
                    await getUserData();
                } else {
                    console.log("❌ Auth failed — not logged in.");
                }
            } catch (error) {
                console.log("Auth check failed:", error.message);
                setIsLoggedin(false);
                setUserData(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [backendUrl]);

    const getUserData = async () => {
        // console.log("📡 getUserData() called...");
        try {
            const { data } = await axios.post(`${backendUrl}/api/user/data`);
            // console.log("📦 getUserData response:", data);
            if (data.success) {
                setUserData(data.userData);
                setIsLoggedin(true);
                // console.log("✅ User data set successfully:", data.userData);
            } else {
                console.log("⚠️ getUserData returned success = false");
            }
        } catch (error) {
            console.error("❌ Error fetching user data:", error);
            setIsLoggedin(false);
            setUserData(null);
        }
    };

    const value = {
        backendUrl,
        isLoggedin,
        setIsLoggedin,
        userData,
        setUserData,
        getUserData,
        loading,
    };

    return <AppContent.Provider value={value}>{props.children}</AppContent.Provider>;
};
