import React, { useContext, useState } from 'react';
import InputField from '../ui/InputField';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios'; // Import axios to make the API request
import { AppContent } from '../../context/AppContext';
import Cookies from "js-cookie";

const Settings = () => {
    const { userData, backendUrl } = useContext(AppContent);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [isPasswordShown, setIsPasswordShown] = useState({
        oldPassword: false,
        newPassword: false,
    });

    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // State for delete account modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [deleteError, setDeleteError] = useState(null);
    const [isEmailMatch, setIsEmailMatch] = useState(true); // Track email match


    const togglePasswordVisibility = (field) => {
        setIsPasswordShown((prevState) => ({
            ...prevState,
            [field]: !prevState[field],
        }));
    };

    const handleChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleSavePassword = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await axios.post(`${backendUrl}/api/user/change-password`, {
                oldPassword: passwords.oldPassword,
                newPassword: passwords.newPassword,
            });

            if (response.data.success) {
                setSuccessMessage('Password changed successfully!');
                setIsEditingPassword(false);
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError('An error occurred while changing your password.');
        } finally {
            setLoading(false);
        }
    };

    // Function to handle account deletion
    const handleDeleteAccount = async () => {
        if (!userData?.userId) {
            setDeleteError('User ID is required.');
            return;
        }

        try {
            const userId = userData?.userId
            // Send userId in the request body using the `data` property
            const response = await axios.delete(`${backendUrl}/api/user/delete-user`, {
                data: { userId }, // Send userId as part of the request body
            });

            if (response.data.success) {
                // Remove the token from cookies
                Cookies.remove('token')
                // Handle success (e.g., redirect to login page or show success message)
                setIsDeleteModalOpen(false); // Close the modal after successful deletion
                alert('Your account has been deleted successfully.');
            } else {
                setDeleteError(response.data.message);
            }
        } catch (error) {
            setDeleteError('An error occurred while deleting your account.');
        }
    };

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Account Settings</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Manage your account preferences and settings.
                </p>
            </div>

            <div className="px-6 py-5 space-y-6">
                {/* Password Change Section */}
                <div className="pt-5 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900">Password</h4>
                    {isEditingPassword ? (
                        <div className="mt-3 space-y-4">
                            {/* Old Password */}
                            <div className="relative">
                                <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">
                                    Old Password
                                </label>
                                <div className="relative mt-1">
                                    <InputField
                                        id="oldPassword"
                                        type={isPasswordShown.oldPassword ? "text" : "password"}
                                        name="oldPassword"
                                        placeholder="Enter old password"
                                        value={passwords.oldPassword}
                                        onChange={handleChange}
                                        className="block w-full p-2 border border-gray-300 rounded-md pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility("oldPassword")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {isPasswordShown.oldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div className="relative">
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                    New Password
                                </label>
                                <div className="relative mt-1">
                                    <InputField
                                        id="newPassword"
                                        type={isPasswordShown.newPassword ? "text" : "password"}
                                        name="newPassword"
                                        placeholder="Enter new password"
                                        value={passwords.newPassword}
                                        onChange={handleChange}
                                        className="block w-full p-2 border border-gray-300 rounded-md pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility("newPassword")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {isPasswordShown.newPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Error/Success message */}
                            {error && <p className="text-red-600 text-sm">{error}</p>}
                            {successMessage && <p className="text-green-600 text-sm">{successMessage}</p>}

                            {/* Buttons */}
                            <div className="flex space-x-4">
                                <button
                                    onClick={handleSavePassword}
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700"
                                >
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={() => setIsEditingPassword(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-2">
                            <button
                                onClick={() => setIsEditingPassword(true)}
                                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Change Password
                            </button>
                        </div>
                    )}
                </div>

                {/* Delete Account Section */}
                <div className="pt-5 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900">Delete Account</h4>
                    <p className="mt-1 text-sm text-gray-500">
                        Once you delete your account, you will lose all data associated with it.
                    </p>
                    <div className="mt-2">
                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Account Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-10 bg-gray-500 bg-opacity-75 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-md shadow-lg w-96">
                        <h3 className="text-lg font-medium">Delete Account</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            If you delete your account, you will lose all data associated with it.
                        </p>
                        <div className="mt-4">
                            <InputField
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full p-2 border border-gray-300 rounded-md"
                            />
                            {deleteError && <p className="text-red-600 text-sm mt-2">{deleteError}</p>}
                            {!isEmailMatch && <p className="text-red-600 text-sm mt-2">The email does not match your account email.</p>}
                        </div>
                        <div className="mt-4 flex space-x-4">
                            <button
                                onClick={handleDeleteAccount}
                                disabled={email !== userData?.email}
                                className={`px-4 py-2 rounded-md text-white ${email === userData?.email ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'}`}
                            >
                                Confirm Deletion
                            </button>
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700"
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
