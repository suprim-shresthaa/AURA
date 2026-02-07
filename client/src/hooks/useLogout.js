import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { message } from "antd";
import { AppContent } from "../components/context/AppContext";
import { toast } from "react-toastify";

const useLogout = () => {
    const navigate = useNavigate();
    const { backendUrl, setIsLoggedin, setUserData } = useContext(AppContent);

    const logout = async () => {
        try {
            const response = await fetch(`${backendUrl}/api/auth/logout`, {
                method: "POST",
                credentials: "include",
            });

            const data = await response.json();

            if (response.ok && data.success) {
                localStorage.removeItem("user");
                Cookies.remove("token");
                setIsLoggedin(false);
                setUserData(null);
                toast.success("Successfully logged out!");
                navigate("/");
            } else {
                throw new Error(data.message || "Logout failed");
            }
        } catch (error) {
            console.error("Logout error:", error);
            message.error("An error occurred during logout. Please try again.");
        }
    };

    return logout;
};

export default useLogout;
