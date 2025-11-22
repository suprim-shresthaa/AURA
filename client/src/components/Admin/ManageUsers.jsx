// ManageUsers.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Trash2, UserCheck, UserX, Users } from "lucide-react";
import RemarksModal from "../ui/RemarksModal";

const API_BASE = "http://localhost:5001/api/user";

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state
    const [modal, setModal] = useState({
        isOpen: false,
        type: null, // "ban" | "unban" | "delete"
        userId: null,
        userName: null,
    });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError(null);

                const { data } = await axios.get(`${API_BASE}/all-users`);
                const apiUsers = data.data;

                const mapped = apiUsers.map((u) => ({
                    id: u._id,
                    name: u.name || "Unknown User",
                    email: u.email || "No email",
                    role: u.role
                        ? u.role.charAt(0).toUpperCase() + u.role.slice(1).toLowerCase()
                        : "User",
                    status: u.banInfo?.isBanned ? "Banned" : "Active",
                    image: u.image || null,
                }));

                setUsers(mapped);
            } catch (err) {
                setError(err.response?.data?.message || err.message || "Failed to load users");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(
        (u) =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Open modal
    const openModal = (type, userId, userName) => {
        setModal({ isOpen: true, type, userId, userName });
    };

    // Close modal
    const closeModal = () => {
        setModal({ isOpen: false, type: null, userId: null, userName: null });
    };

    // Perform actions
    const performBan = async (userId, reason) => {
        await axios.post(`${API_BASE}/ban/${userId}`, { reason });
        setUsers((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, status: "Banned" } : u))
        );
    };

    const performUnban = async (userId, reason = "") => {
        await axios.post(`${API_BASE}/unban/${userId}`, { reason });
        setUsers((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, status: "Active" } : u))
        );
    };

    const performDelete = async (userId, reason) => {
        await axios.delete(`${API_BASE}/${userId}`, { data: { reason } });
        setUsers((prev) => prev.filter((u) => u.id !== userId));
    };

    // Unified submit handler for modal
    const handleModalSubmit = async (remarks) => {
        if (!modal.userId) return;

        try {
            if (modal.type === "ban") {
                await performBan(modal.userId, remarks);
            } else if (modal.type === "unban") {
                await performUnban(modal.userId, remarks);
            } else if (modal.type === "delete") {
                await performDelete(modal.userId, remarks);
            }
            closeModal();
        } catch (err) {
            alert(err.response?.data?.message || "Operation failed. Please try again.");
            console.error(err);
        }
    };

    // Determine modal props
    const getModalProps = () => {
        switch (modal.type) {
            case "ban":
                return {
                    title: `Ban ${modal.userName}`,
                    description: "This user will no longer be able to log in. Please provide a reason for banning.",
                    actionType: "ban",
                    placeholder: "e.g. Spam, harassment, violation of terms...",
                    submitText: "Ban User",
                };
            case "unban":
                return {
                    title: `Unban ${modal.userName}`,
                    description: "This user will regain access to their account. You may add an optional note.",
                    actionType: "approve",
                    placeholder: "Optional note (e.g. appeal accepted, false positive)",
                    submitText: "Unban User",
                };
            case "delete":
                return {
                    title: `Delete ${modal.userName}`,
                    description: "This action is permanent and cannot be undone. All user data will be removed.",
                    actionType: "ban", // red style
                    placeholder: "State the reason for permanent deletion...",
                    submitText: "Delete Permanently",
                };
            default:
                return {};
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
                <div className="text-slate-600 animate-pulse">Loading users...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
                <div className="text-red-600 bg-red-50 px-6 py-4 rounded-lg">
                    <strong>Error:</strong> {error}
                </div>
            </div>
        );
    }

    const modalProps = getModalProps();

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <Users size={24} className="text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
                        </div>
                        <p className="text-slate-600 ml-11">
                            Manage and control user accounts and permissions
                        </p>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative max-w-md">
                            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-slate-900 placeholder-slate-500"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">User</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Email</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Role</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-blue-50 transition duration-150 group">
                                            {/* User Avatar + Name */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="shrink-0">
                                                        {user.image ? (
                                                            <img
                                                                src={user.image}
                                                                alt={user.name}
                                                                className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                                                                <span className="text-slate-500 text-sm font-medium">
                                                                    {user.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="font-medium text-slate-900">{user.name}</div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-slate-600 text-sm">{user.email}</td>

                                            <td className="px-6 py-4">
                                                <span className="inline-flex px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                                                    {user.role}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${user.status === "Active"
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-red-100 text-red-700"
                                                        }`}
                                                >
                                                    {user.status}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-3">
                                                    {/* Ban / Unban */}
                                                    <button
                                                        onClick={() =>
                                                            user.status === "Active"
                                                                ? openModal("ban", user.id, user.name)
                                                                : openModal("unban", user.id, user.name)
                                                        }
                                                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition duration-150 opacity-0 group-hover:opacity-100"
                                                        title={user.status === "Active" ? "Ban user" : "Unban user"}
                                                    >
                                                        {user.status === "Active" ? <UserX size={18} /> : <UserCheck size={18} />}
                                                    </button>

                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => openModal("delete", user.id, user.name)}
                                                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition duration-150 opacity-0 group-hover:opacity-100"
                                                        title="Delete user permanently"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    {/* Empty State */}
                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Users size={32} className="text-slate-400" />
                                                    <span className="text-slate-500 text-sm">No users found</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer Stats */}
                        {filteredUsers.length > 0 && (
                            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-between items-center">
                                <span className="text-sm text-slate-600">
                                    Showing <span className="font-semibold text-slate-900">{filteredUsers.length}</span> of{" "}
                                    <span className="font-semibold text-slate-900">{users.length}</span> users
                                </span>
                                <span className="text-sm text-slate-600">
                                    Active:{" "}
                                    <span className="font-semibold text-emerald-600">
                                        {users.filter((u) => u.status === "Active").length}
                                    </span>{" "}
                                    | Banned:{" "}
                                    <span className="font-semibold text-red-600">
                                        {users.filter((u) => u.status === "Banned").length}
                                    </span>
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Remarks Modal */}
            <RemarksModal
                isOpen={modal.isOpen}
                onClose={closeModal}
                onSubmit={handleModalSubmit}
                title={modalProps.title}
                description={modalProps.description}
                actionType={modalProps.actionType}
                placeholder={modalProps.placeholder}
                submitText={modalProps.submitText}
                maxLength={500}
            />
        </>
    );
};

export default ManageUsers;