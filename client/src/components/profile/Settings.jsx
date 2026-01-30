import React, { useContext, useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import axios from "axios";
import { AppContent } from "../context/AppContext";

const Settings = () => {
    const { userData, backendUrl } = useContext(AppContent);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [showPassword, setShowPassword] = useState({ old: false, new: false });
    const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

    const togglePassword = (field) =>
        setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));

    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
        if (e.target.name === "newPassword" && e.target.value.length === 0) {
            setShowPasswordRequirements(false);
        }
    };

    // Password validation
    const passwordValidations = {
        hasMinLength: passwords.newPassword.length >= 8,
        hasUppercase: /[A-Z]/.test(passwords.newPassword),
        hasLowercase: /[a-z]/.test(passwords.newPassword),
        hasNumber: /[0-9]/.test(passwords.newPassword),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(passwords.newPassword),
    };
    const isValidNewPassword = Object.values(passwordValidations).every(Boolean);

    const ValidationIcon = ({ isValid }) => (
        <span className={isValid ? "text-green-500" : "text-red-500"}>
            {isValid ? <Check size={14} /> : <X size={14} />}
        </span>
    );

    const handleSavePassword = async () => {
        setError("");
        setSuccess("");

        // Validate password strength
        if (!isValidNewPassword) {
            setError("Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character.");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                ...passwords,
                userId: userData?.userId,   // SEND USER ID
            };

            const res = await axios.post(
                `${backendUrl}/api/user/change-password`,
                payload,
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
                                    onFocus={() => setShowPasswordRequirements(true)}
                                    onBlur={() => passwords.newPassword.length === 0 && setShowPasswordRequirements(false)}
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

                            {showPasswordRequirements && (
                                <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-1 text-xs">
                                    <p className="font-medium text-gray-500">Password must contain:</p>
                                    {Object.entries({
                                        "At least 8 characters": passwordValidations.hasMinLength,
                                        "At least one uppercase letter": passwordValidations.hasUppercase,
                                        "At least one lowercase letter": passwordValidations.hasLowercase,
                                        "At least one number": passwordValidations.hasNumber,
                                        "At least one special character": passwordValidations.hasSpecialChar,
                                    }).map(([text, valid], idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <ValidationIcon isValid={valid} />
                                            <span className={valid ? "text-green-500" : "text-gray-500"}>{text}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {error && <p className="text-red-600 text-sm">{error}</p>}
                            {success && <p className="text-green-600 text-sm">{success}</p>}

                            <div className="flex space-x-3">
                                <button
                                    onClick={handleSavePassword}
                                    disabled={loading || !isValidNewPassword}
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
            </div>
        </div>
    );
};

export default Settings;