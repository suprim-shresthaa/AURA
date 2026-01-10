// src/components/profile/Sidebar.jsx
import React, { useContext, useRef, useState } from "react";
import { User, Settings, LogOut, Edit, ArrowRightCircle, Calendar, FileText, ShoppingBag } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import Cookies from "js-cookie";
import { AppContent } from "../context/AppContext";

const Sidebar = ({ userData }) => {
    const { setIsLoggedin, backendUrl, setUserData } = useContext(AppContent);
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const navigate = useNavigate();


    //only show licenses if user is a regular user
    const showLicenses = userData?.role === "user"; 
    const handleLogout = async () => {
        try {
            await fetch(`${backendUrl}/api/auth/logout`, {
                method: "POST",
                credentials: "include",
            });

            Cookies.remove("token");
            setIsLoggedin(false);
            toast.success("Logged out successfully!");
            navigate("/");
        } catch (err) {
            toast.error("Logout failed.");
        }
    };

    const handleEditClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
            toast.error("Please select a valid image file (JPEG or PNG)");
            return;
        }

        // Validate file size (max 15MB)
        if (file.size > 15 * 1024 * 1024) {
            toast.error("Image size must be less than 15MB");
            return;
        }

        const formData = new FormData();
        formData.append("image", file);

        setIsUploading(true);

        try {
            const response = await axios.put(
                `${backendUrl}/api/user/update-profile-img`,
                formData,
                {
                    withCredentials: true,
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            if (response.data.success) {
                // Update userData in context
                setUserData((prev) => ({
                    ...prev,
                    image: response.data.image,
                }));
                toast.success("Profile picture updated!");
            } else {
                toast.error(response.data.message || "Failed to update image.");
            }
        } catch (err) {
            console.error("Image upload error:", err);
            toast.error(err.response?.data?.message || "Failed to upload image.");
        } finally {
            setIsUploading(false);
        }
    };



    return (
        <div className="bg-white shadow rounded-lg sticky top-6">
            {/* Profile Header */}
            <div className="p-6 text-center">
                <div className="relative mx-auto w-32 h-32">
                    <img
                        src={userData?.image || "/default-avatar.png"}
                        alt={userData?.name}
                        className="w-full h-full rounded-full object-cover border-4 border-amber-400"
                    />
                    <button
                        onClick={handleEditClick}
                        disabled={isUploading}
                        className="absolute bottom-0 right-0 bg-amber-500 text-white p-2 rounded-full hover:bg-amber-600 disabled:opacity-50"
                    >
                        {isUploading ? "..." : <Edit className="h-4 w-4" />}
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>
                <h2 className="mt-4 text-xl font-bold text-gray-900">{userData?.name}</h2>
                <p className="text-sm text-gray-500">Member since {userData?.joinDate || "2025"}</p>
            </div>

            {/* Navigation */}
            <nav className="border-border-t border-gray-200">
                <NavLink
                    to="/profile"
                    end
                    className={({ isActive }) =>
                        `w-full flex items-center px-6 py-3 text-sm font-medium ${
                            isActive
                                ? "bg-amber-50 text-amber-700 border-l-4 border-amber-600"
                                : "text-gray-600 hover:bg-gray-50"
                        }`
                    }
                >
                    <User className="mr-3 h-5 w-5" />
                    Profile
                </NavLink>

                <NavLink
                    to="/profile/bookings"
                    className={({ isActive }) =>
                        `w-full flex items-center px-6 py-3 text-sm font-medium ${
                            isActive
                                ? "bg-amber-50 text-amber-700 border-l-4 border-amber-600"
                                : "text-gray-600 hover:bg-gray-50"
                        }`
                    }
                >
                    <Calendar className="mr-3 h-5 w-5" />
                    My Bookings
                </NavLink>

                <NavLink
                    to="/profile/orders"
                    className={({ isActive }) =>
                        `w-full flex items-center px-6 py-3 text-sm font-medium ${
                            isActive
                                ? "bg-amber-50 text-amber-700 border-l-4 border-amber-600"
                                : "text-gray-600 hover:bg-gray-50"
                        }`
                    }
                >
                    <ShoppingBag className="mr-3 h-5 w-5" />
                    My Orders
                </NavLink>

                {showLicenses && (
                    <NavLink
                        to="/profile/licenses"
                        className={({ isActive }) =>
                            `w-full flex items-center px-6 py-3 text-sm font-medium ${
                                isActive
                                    ? "bg-amber-50 text-amber-700 border-l-4 border-amber-600"
                                    : "text-gray-600 hover:bg-gray-50"
                            }`
                        }
                    >
                        <FileText className="mr-3 h-5 w-5" />
                        Licenses
                    </NavLink>
                )}
                <NavLink
                    to="/profile/settings"
                    className={({ isActive }) =>
                        `w-full flex items-center px-6 py-3 text-sm font-medium ${
                            isActive
                                ? "bg-amber-50 text-amber-700 border-l-4 border-amber-600"
                                : "text-gray-600 hover:bg-gray-50"
                        }`
                    }
                >
                    <Settings className="mr-3 h-5 w-5" />
                    Settings
                </NavLink>

                {/* Role-based Links */}
                {userData?.role === "admin" && (
                    <Link to="/admin/dashboard" className="block">
                        <button className="w-full flex items-center px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50">
                            <ArrowRightCircle className="mr-3 h-5 w-5" />
                            Admin Dashboard
                        </button>
                    </Link>
                )}
                {userData?.role === "vendor" && (
                    <Link to="/vendor/dashboard" className="block">
                        <button className="w-full flex items-center px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50">
                            <ArrowRightCircle className="mr-3 h-5 w-5" />
                            Vendor Dashboard
                        </button>
                    </Link>
                )}
                {userData?.role === "user" && (
                    <Link to="/vendor/apply" className="block">
                        <button className="w-full flex items-center px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50">
                            <ArrowRightCircle className="mr-3 h-5 w-5" />
                            Become a Vendor
                        </button>
                    </Link>
                )}
            </nav>

            {/* Logout */}
            <div className="p-6 border-t">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;