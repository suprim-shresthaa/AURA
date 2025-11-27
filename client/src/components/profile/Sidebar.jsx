// src/components/profile/Sidebar.jsx
import React, { useContext, useRef, useState } from "react";
import { User, Settings, LogOut, Edit, ArrowRightCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import Cookies from "js-cookie";
import { AppContent } from "../context/AppContext";

const Sidebar = ({ activeTab, setActiveTab, userData }) => {
    const { setIsLoggedin, backendUrl } = useContext(AppContent);
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const navigate = useNavigate();

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;


    console.log(cloudName);
    console.log(uploadPreset);



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

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);
        formData.append("folder", "vendor_images");

        setIsUploading(true);

        try {
            const uploadRes = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
                formData,
                {
                    withCredentials: false,   // 🔥 FIX
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            const imageUrl = uploadRes.data.secure_url;

            // Now your backend request can use credentials
            await axios.put(
                `${backendUrl}/api/user/update-profile-img`,
                { email: userData?.email, image: imageUrl },
                { withCredentials: true }
            );

            toast.success("Profile picture updated!");
        } catch (err) {
            console.log(err);
            toast.error("Failed to upload image.");
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
                <button
                    onClick={() => setActiveTab("profile")}
                    className={`w-full flex items-center px-6 py-3 text-sm font-medium ${activeTab === "profile"
                        ? "bg-amber-50 text-amber-700 border-l-4 border-amber-600"
                        : "text-gray-600 hover:bg-gray-50"
                        }`}
                >
                    <User className="mr-3 h-5 w-5" />
                    Profile
                </button>

                <button
                    onClick={() => setActiveTab("settings")}
                    className={`w-full flex items-center px-6 py-3 text-sm font-medium ${activeTab === "settings"
                        ? "bg-amber-50 text-amber-700 border-l-4 border-amber-600"
                        : "text-gray-600 hover:bg-gray-50"
                        }`}
                >
                    <Settings className="mr-3 h-5 w-5" />
                    Settings
                </button>

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