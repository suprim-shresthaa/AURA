import React, { useState } from "react";
import { Search, Trash2, UserCheck, UserX, Users } from "lucide-react";

const ManageUsers = () => {
    const [users, setUsers] = useState([
        { id: 1, name: "John Doe", email: "john@example.com", role: "User", status: "Active" },
        { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Vendor", status: "Inactive" },
        { id: 3, name: "Michael Johnson", email: "mike@example.com", role: "User", status: "Active" },
        { id: 4, name: "Sarah Lee", email: "sarah@example.com", role: "Admin", status: "Active" },
    ]);

    const [searchTerm, setSearchTerm] = useState("");

    const filteredUsers = users.filter(
        (u) =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleStatus = (id) => {
        setUsers(
            users.map((user) =>
                user.id === id
                    ? {
                        ...user,
                        status: user.status === "Active" ? "Inactive" : "Active",
                    }
                    : user
            )
        );
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            setUsers(users.filter((user) => user.id !== id));
        }
    };

    return (
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
                    <p className="text-slate-600 ml-11">Manage and control user accounts and permissions</p>
                </div>

                {/* Search Bar */}
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

                {/* Table Container */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Email</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Role</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredUsers.map((user, idx) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-blue-50 transition duration-150 group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{user.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-600 text-sm">{user.email}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${user.status === "Active"
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-slate-200 text-slate-600"
                                                    }`}
                                            >
                                                {user.status === "Active" ? "● Active" : "● Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-3">
                                                <button
                                                    onClick={() => toggleStatus(user.id)}
                                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition duration-150 opacity-0 group-hover:opacity-100"
                                                    title={user.status === "Active" ? "Deactivate" : "Activate"}
                                                >
                                                    {user.status === "Active" ? (
                                                        <UserX size={18} />
                                                    ) : (
                                                        <UserCheck size={18} />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition duration-150 opacity-0 group-hover:opacity-100"
                                                    title="Delete user"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

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
                                Showing <span className="font-semibold text-slate-900">{filteredUsers.length}</span> of <span className="font-semibold text-slate-900">{users.length}</span> users
                            </span>
                            <span className="text-sm text-slate-600">
                                Active: <span className="font-semibold text-emerald-600">{users.filter(u => u.status === "Active").length}</span>
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageUsers;