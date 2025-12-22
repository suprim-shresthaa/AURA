// src/components/profile/ProfileInfo.jsx
import React, { useContext, useEffect, useState } from "react";
import { Mail, Phone, MapPin, Edit, Save, X } from "lucide-react";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";

const ProfileInfo = () => {
    const { userData, setUserData, backendUrl } = useContext(AppContent);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        contact: "",
        address: "",
    });

    // Sync values into form when edit mode opens
    useEffect(() => {
        if (isEditing && userData) {
            setFormData({
                name: userData.name || "",
                contact: userData.contact || "",
                address: userData.address || "",
            });
        }
    }, [isEditing, userData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            const res = await fetch(`${backendUrl}/api/user/edit/profile`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    name: formData.name,
                    contact: formData.contact,
                    address: formData.address,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setUserData(data.user);
                setIsEditing(false);
                toast.success("Profile updated successfully!");
            } else {
                    toast.error(data.message || "Update failed.");
            }
        } catch (err) {
            toast.error("Failed to update profile.");
            console.error(err);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
                    <p className="mt-1 text-sm text-gray-500">Update your personal details.</p>
                </div>

                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                        <Edit className="mr-1 h-4 w-4" /> Edit
                    </button>
                )}
            </div>

            <div className="px-6 py-5 space-y-6">
                {/* GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* NAME */}
                    <div>
                        <label className="text-sm font-medium text-gray-500">Full Name</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        ) : (
                            <p className="mt-1 text-sm text-gray-900">{userData?.name || "N/A"}</p>
                        )}
                    </div>

                    {/* EMAIL */}
                    <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <div className="mt-1 flex items-center text-sm text-gray-900">
                            <Mail className="mr-2 h-4 w-4 text-gray-400" />
                            {userData?.email || "N/A"}
                        </div>
                    </div>

                    {/* PHONE */}
                    <div>
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="contact"
                                value={formData.contact}
                                onChange={handleChange}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        ) : (
                            <div className="mt-1 flex items-center text-sm text-gray-900">
                                <Phone className="mr-2 h-4 w-4 text-gray-400" />
                                {userData?.contact || "N/A"}
                            </div>
                        )}
                    </div>

                    {/* ADDRESS */}
                    <div>
                        <label className="text-sm font-medium text-gray-500">Address</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        ) : (
                            <div className="mt-1 flex items-center text-sm text-gray-900">
                                <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                                {userData?.address || "N/A"}
                            </div>
                        )}
                    </div>
                </div>


                {/* BUTTONS */}
                {isEditing && (
                    <div className="flex space-x-3">
                        <button
                            onClick={handleSave}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                        >
                            <Save className="mr-2 h-4 w-4" /> Save
                        </button>

                        <button
                            onClick={() => setIsEditing(false)}
                            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <X className="mr-2 h-4 w-4" /> Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileInfo;
