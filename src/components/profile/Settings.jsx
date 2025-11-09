// src/components/profile/Settings.jsx
import React, { useContext, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { AppContent } from "../context/AppContext";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const Settings = () => {
    const { userData, backendUrl } = useContext(AppContent);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [showPassword, setShowPassword] = useState({ old: false, new: false });
    const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Delete Account Modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [emailInput, setEmailInput] = useState("");
    const [deleteError, setDeleteError] = useState("");

    const togglePassword = (field) =>
        setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));

    const handlePasswordChange = (e) =>
        setPasswords({ ...passwords, [e.target.name]: e.target.value });

    const handleSavePassword = async () => {
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const res = await axios.post(
                `${backendUrl}/api/user/change-password`,
                passwords,
                { withCredentials: true }
            );

            if (res.data.success) {
                setSuccess("Password changed successfully!");
                setIsEditingPassword(false);
                setPasswords({ oldPassword: "", newPassword: "" });
            } else {
                setError(res.data.message);
            }
        } catch (err) {
            setError("Failed to change password.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (emailInput !== userData?.email) {
            setDeleteError("Email does not match.");
            return;
        }

        try {
            const res = await axios.delete(`${backendUrl}/api/user/delete-user`, {
                data: { userId: userData?.userId },
                withCredentials: true,
            });

            if (res.data.success) {
                Cookies.remove("token");
                toast.success("Account deleted.");
                window.location.href = "/login";
            } else {
                setDeleteError(res.data.message);
            }
        } catch (err) {
            setDeleteError("Failed to delete account.");
        }
    };

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Account Settings</h3>
                <p className="mt-1 text-sm text-gray-500">Manage password and account deletion.</p>
            </div>

            <div className="px-6 py-5 space-y-8">
                {/* Change Password */}
                <div className="border-t pt-6">
                    <h4 className="text-sm font-medium text-gray-900">Change Password</h4>
                    {isEditingPassword ? (
                        <div className="mt-4 space-y-4">
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                                <input
                                    type={showPassword.old ? "text" : "password"}
                                    name="oldPassword"
                                    value={passwords.oldPassword}
                                    onChange={handlePasswordChange}
                                    className="mt-1 block w-full px-3 py-2 border rounded-md pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePassword("old")}
                                    className="absolute right-3 top-9 text-gray-500"
                                >
                                    {showPassword.old ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700">New Password</label>
                                <input
                                    type={showPassword.new ? "text" : "password"}
                                    name="newPassword"
                                    value={passwords.newPassword}
                                    onChange={handlePasswordChange}
                                    className="mt-1 block w-full px-3 py-2 border rounded-md pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePassword("new")}
                                    className="absolute right-3 top-9 text-gray-500"
                                >
                                    {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {error && <p className="text-red-600 text-sm">{error}</p>}
                            {success && <p className="text-green-600 text-sm">{success}</p>}

                            <div className="flex space-x-3">
                                <button
                                    onClick={handleSavePassword}
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? "Saving..." : "Save"}
                                </button>
                                <button
                                    onClick={() => setIsEditingPassword(false)}
                                    className="px-4 py-2 border rounded-md text-sm text-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsEditingPassword(true)}
                            className="mt-3 px-4 py-2 border rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Change Password
                        </button>
                    )}
                </div>

                {/* Delete Account */}
                <div className="border-t pt-6">
                    <h4 className="text-sm font-medium text-red-700">Delete Account</h4>
                    <p className="mt-1 text-sm text-gray-500">
                        This action is permanent. All your data will be lost.
                    </p>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                    >
                        Delete My Account
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                        <h3 className="text-lg font-semibold text-red-700">Confirm Deletion</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Type your email <strong>{userData?.email}</strong> to confirm.
                        </p>
                        <input
                            type="email"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="your@email.com"
                            className="mt-3 w-full px-3 py-2 border rounded-md"
                        />
                        {deleteError && <p className="mt-2 text-sm text-red-600">{deleteError}</p>}
                        <div className="mt-5 flex space-x-3">
                            <button
                                onClick={handleDeleteAccount}
                                disabled={emailInput !== userData?.email}
                                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm disabled:bg-gray-400"
                            >
                                Delete Forever
                            </button>
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setEmailInput("");
                                    setDeleteError("");
                                }}
                                className="px-4 py-2 border rounded-md text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;