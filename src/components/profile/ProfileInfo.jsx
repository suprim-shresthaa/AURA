import React, { useContext, useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Edit, Save, X } from 'lucide-react';
import { AppContent } from '../../context/AppContext';
import { toast } from 'react-toastify';

const ProfileInfo = () => {
    const { userData, setUserData, backendUrl } = useContext(AppContent);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        contact: "",
        address: "",
        description: "",
    });

    // Sync formData when entering edit mode
    useEffect(() => {
        if (isEditing) {
            setFormData({
                name: userData?.name || "",
                contact: userData?.contact || "",
                address: userData?.address || "",
                description: userData?.description || "",
            });
        }
    }, [isEditing, userData]); // Depend on isEditing and userData

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            const response = await fetch(`${backendUrl}/api/user/edit/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userData?.userId, ...formData }),
            });

            const data = await response.json();
            if (response.ok) {
                setUserData(data.user);
                setIsEditing(false);
                toast.success("Profile updated succesfully.")
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };


    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
                    <p className="mt-1 text-sm text-gray-500">Your personal and contact details.</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center text-sm text-blue-600 hover:underline"
                    >
                        <Edit className="mr-1 h-4 w-4" /> Edit Profile
                    </button>
                ) : null}
            </div>

            <div className="px-6 py-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-sm font-medium text-gray-500">Full Name</h4>
                        {isEditing ? (
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                            />
                        ) : (
                            <p className="mt-1 text-sm text-gray-900">{userData?.name || "N/A"}</p>
                        )}
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-500">Email Address</h4>
                        <div className="mt-1 flex items-center text-sm text-gray-900">
                            <Mail className="mr-2 h-4 w-4 text-gray-400" />
                            {userData?.email || "N/A"}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-500">Phone Number</h4>
                        {isEditing ? (
                            <input
                                type="text"
                                name="contact"
                                value={formData.contact}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                            />
                        ) : (
                            <div className="mt-1 flex items-center text-sm text-gray-900">
                                <Phone className="mr-2 h-4 w-4 text-gray-400" />
                                {userData?.contact || "N/A"}
                            </div>
                        )}
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-500">Location</h4>
                        {isEditing ? (
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                            />
                        ) : (
                            <div className="mt-1 flex items-center text-sm text-gray-900">
                                <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                                {userData?.address || "N/A"}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-500">Bio</h4>
                    {isEditing ? (
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        />
                    ) : (
                        <p className="mt-1 text-sm text-gray-900">{userData?.description || "N/A"}</p>
                    )}
                </div>

                {isEditing ? (
                    <div className="mt-6 flex space-x-4">
                        <button
                            onClick={handleSave}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700"
                        >
                            <Save className="mr-2 h-4 w-4" /> Save
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <X className="mr-2 h-4 w-4 text-gray-500" /> Cancel
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default ProfileInfo;
