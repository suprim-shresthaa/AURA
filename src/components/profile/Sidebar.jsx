import React, { useContext, useRef, useState } from 'react';
import { AppContent } from '../../context/AppContext';
import { User, PawPrint, Heart, Calendar, Settings, LogOut, Edit, ArrowRightCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Cookies from "js-cookie";

const Sidebar = ({ activeTab, setActiveTab, user }) => {
    const { userData, setUserData, setIsLoggedin, backendUrl, isLoggedin } = useContext(AppContent);

    const fileInputRef = useRef(null); // Reference for file input
    const [isUploading, setIsUploading] = useState(false); // Track upload state
    const navigate = useNavigate()

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    // Calculate counts based on userData
    const adoptedPetsCount = userData?.adoptedPets?.length || 0;
    const favoritePetsCount = userData?.favoritePets?.length || 0;
    const applicationsCount = userData?.applications?.length || 0;

    const handleLogout = async () => {
        try {
            const response = await fetch(`${backendUrl}/api/auth/logout`, {
                method: "POST",
                credentials: "include", // Important for cookie removal
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Clear localStorage and cookie
                localStorage.removeItem("user");
                Cookies.remove("token");

                // Reset context state
                setIsLoggedin(false);
                setUserData(null);

                toast.success("Successfully logged out!");
                navigate("/");
            } else {
                throw new Error(data.message || "Logout failed");
            }
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("An error occurred during logout. Please try again.");
        }
    };



    // Function to trigger file input
    const handleEditClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset); // Cloudinary preset

        setIsUploading(true);
        try {
            const uploadResponse = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                formData,
                {
                    withCredentials: false, // Explicitly disable credentials
                }
            );

            const imageUrl = uploadResponse.data.secure_url;
            console.log("Image URL:", imageUrl);

            // Update backend
            await axios.put(
                `${backendUrl}/api/user/update-profile-img`,
                { email: userData?.email, image: imageUrl },
                { withCredentials: true } // Only send credentials for your own backend
            );

            setUserData((prevData) => ({ ...prevData, image: imageUrl }));
            toast.success("Profile picture updated successfully!");
        } catch (error) {
            toast.error("Error uploading image. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };


    return (
        <div className="bg-white shadow rounded-lg overflow-hidden sticky top-6">
            {/* Profile Section */}
            <div className="p-6 text-center">
                <div className="relative mx-auto w-32 h-32 mb-4">
                    <img
                        src={userData?.image}
                        alt={userData?.name}
                        className="rounded-full w-full h-full object-cover border-4 border-amber-400"
                    />
                    <button
                        onClick={handleEditClick}
                        className="absolute bottom-0 right-0 bg-amber-500 text-white p-2 rounded-full hover:bg-amber-600"
                        disabled={isUploading}
                    >
                        {isUploading ? "..." : <Edit className="h-4 w-4" />}
                    </button>
                    {/* Hidden file input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                        accept="image/*"
                    />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{userData?.name}</h2>
                <p className="text-sm text-gray-500 mt-1">Member since {user.joinDate}</p>
            </div>

            {/* Navigation Menu */}
            <div className="border-t border-gray-200 mt-4">
                <nav className="flex flex-col">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center px-6 py-3 text-sm font-medium ${activeTab === 'profile'
                            ? 'bg-amber-50 text-amber-700 border-l-4 border-amber-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                        <User className="mr-3 h-5 w-5" />
                        Profile Information
                    </button>

                    <button
                        onClick={() => setActiveTab('adopted')}
                        className={`flex items-center px-6 py-3 text-sm font-medium ${activeTab === 'adopted'
                            ? 'bg-amber-50 text-amber-700 border-l-4 border-amber-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                        <PawPrint className="mr-3 h-5 w-5" />
                        My Adopted Pets
                        <span className="ml-auto bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                            {adoptedPetsCount}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('favorites')}
                        className={`flex items-center px-6 py-3 text-sm font-medium ${activeTab === 'favorites'
                            ? 'bg-amber-50 text-amber-700 border-l-4 border-amber-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                        <Heart className="mr-3 h-5 w-5" />
                        Favorite Pets
                        <span className="ml-auto bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                            {favoritePetsCount}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`flex items-center px-6 py-3 text-sm font-medium ${activeTab === 'applications'
                            ? 'bg-amber-50 text-amber-700 border-l-4 border-amber-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                        <Calendar className="mr-3 h-5 w-5" />
                        My Applications
                        <span className="ml-auto bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                            {applicationsCount}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex items-center px-6 py-3 text-sm font-medium ${activeTab === 'settings'
                            ? 'bg-amber-50 text-amber-700 border-l-4 border-amber-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                        <Settings className="mr-3 h-5 w-5" />
                        Account Settings
                    </button>

                    {/* Admin Dashboard Link */}
                    {userData?.role === "admin" && (
                        <Link to="/admin/dashboard">
                            <button
                                className={`flex items-center px-6 py-3 text-sm font-medium ${activeTab === 'admin-dashboard'
                                    ? 'bg-amber-50 text-amber-700 border-l-4 border-amber-600'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                <ArrowRightCircle className="mr-3 h-5 w-5" />
                                Go to Admin Dashboard
                            </button>
                        </Link>
                    )}
                    {userData?.role === "vendor" && (
                        <Link to="/vendor-dashboard">
                            <button
                                className={`flex items-center px-6 py-3 text-sm font-medium ${activeTab === 'vendor-dashboard'
                                    ? 'bg-amber-50 text-amber-700 border-l-4 border-amber-600'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                <ArrowRightCircle className="mr-3 h-5 w-5" />
                                Go to Vendor Dashboard
                            </button>
                        </Link>
                    )}
                    {userData?.role === "user" && (
                        <Link to="/vendor-registration">
                            <button
                                className={`flex items-center px-6 py-3 text-sm font-medium ${activeTab === 'vendor-dashboard'
                                    ? 'bg-amber-50 text-amber-700 border-l-4 border-amber-600'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                <ArrowRightCircle className="mr-3 h-5 w-5" />
                                Apply for Vendor
                            </button>
                        </Link>
                    )}
                </nav>
            </div>

            {/* Sign Out Button */}
            <div className="p-6 border-t border-gray-200">
                <button onClick={handleLogout} className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
