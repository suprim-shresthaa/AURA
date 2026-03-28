import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Shield,
    Calendar,
    IdCard,
    Ban,
    CheckCircle,
    XCircle,
    Clock,
    User,
    Archive,
} from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";

function formatDate(value) {
    if (!value) return "—";
    try {
        return new Date(value).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        });
    } catch {
        return "—";
    }
}

function statusBadgeClass(status) {
    switch (status) {
        case "approved":
            return "bg-emerald-100 text-emerald-800";
        case "rejected":
            return "bg-red-100 text-red-800";
        default:
            return "bg-amber-100 text-amber-800";
    }
}

const AdminUserDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const { data } = await axiosInstance.get(`/admin/users/${id}`);
                if (!cancelled && data?.success) {
                    setUser(data.data);
                } else if (!cancelled) {
                    setError("Could not load user.");
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.response?.data?.message || err.message || "Failed to load user");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center text-slate-600">
                Loading user…
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="p-8 max-w-3xl mx-auto">
                <button
                    type="button"
                    onClick={() => navigate("/admin/users")}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
                >
                    <ArrowLeft size={18} />
                    Back to users
                </button>
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
                    {error || "User not found."}
                </div>
            </div>
        );
    }

    const roleLabel = user.role
        ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()
        : "User";

    const licenses = Array.isArray(user.licenses) ? user.licenses : [];
    const ban = user.banInfo || {};

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex flex-wrap items-center gap-4">
                    <Link
                        to="/admin/users"
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700"
                    >
                        <ArrowLeft size={18} />
                        All users
                    </Link>
                </div>

                {user.isDeleted && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                        <p className="font-semibold flex items-center gap-2">
                            <Archive size={18} />
                            This account was removed
                        </p>
                        <p className="mt-1 text-amber-900/90">
                            There is no login for this email anymore. The person can register again with the same email.
                        </p>
                        {user.deletedAt && (
                            <p className="mt-2 text-xs text-amber-800/80">
                                Removed {formatDate(user.deletedAt)}
                                {user.deletionReason ? ` · ${user.deletionReason}` : ""}
                            </p>
                        )}
                        {user.deletedByAdmin &&
                            typeof user.deletedByAdmin === "object" &&
                            user.deletedByAdmin?.name && (
                                <p className="mt-1 text-xs text-amber-800/80">
                                    By admin: {user.deletedByAdmin.name}
                                    {user.deletedByAdmin.email ? ` (${user.deletedByAdmin.email})` : ""}
                                </p>
                            )}
                    </div>
                )}

                {/* Header card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8 flex flex-col sm:flex-row gap-6">
                        <div className="shrink-0">
                            {user.image ? (
                                <img
                                    src={user.image}
                                    alt={user.name}
                                    className="w-28 h-28 rounded-2xl object-cover border border-slate-200"
                                />
                            ) : (
                                <div className="w-28 h-28 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-500 text-3xl font-semibold">
                                    {(user.name || "?").charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                                <h2 className="text-2xl font-semibold text-slate-900">{user.name}</h2>
                                <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                                    {roleLabel}
                                </span>
                                {user.isDeleted ? (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900">
                                        <Archive size={14} />
                                        Removed
                                    </span>
                                ) : ban.isBanned ? (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                        <Ban size={14} />
                                        Banned
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                        <CheckCircle size={14} />
                                        Active
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                                <span className="inline-flex items-center gap-2">
                                    <Mail size={16} className="text-slate-400 shrink-0" />
                                    {user.email}
                                </span>
                                {user.contact && (
                                    <span className="inline-flex items-center gap-2">
                                        <Phone size={16} className="text-slate-400 shrink-0" />
                                        {user.contact}
                                    </span>
                                )}
                            </div>
                            {user.address && (
                                <p className="text-sm text-slate-600 flex items-start gap-2">
                                    <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                                    {user.address}
                                </p>
                            )}
                            <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
                                <span className="inline-flex items-center gap-1">
                                    <Shield size={14} />
                                    Account verified:{" "}
                                    <strong className="text-slate-700">
                                        {user.isAccountVerified ? "Yes" : "No"}
                                    </strong>
                                </span>
                                {user.createdAt && (
                                    <span className="inline-flex items-center gap-1">
                                        <Calendar size={14} />
                                        Joined {formatDate(user.createdAt)}
                                    </span>
                                )}
                                {user.googleId && (
                                    <span className="text-slate-500">Google-linked account</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ban details */}
                {(ban.isBanned || ban.reason || ban.at) && (
                    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Ban size={20} className="text-red-600" />
                            Ban & moderation
                        </h3>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                                <dt className="text-slate-500">Banned</dt>
                                <dd className="font-medium text-slate-900">{ban.isBanned ? "Yes" : "No"}</dd>
                            </div>
                            {ban.at && (
                                <div>
                                    <dt className="text-slate-500">Banned at</dt>
                                    <dd className="font-medium text-slate-900">{formatDate(ban.at)}</dd>
                                </div>
                            )}
                            {ban.reason && (
                                <div className="sm:col-span-2">
                                    <dt className="text-slate-500">Reason</dt>
                                    <dd className="font-medium text-slate-900 whitespace-pre-wrap">{ban.reason}</dd>
                                </div>
                            )}
                            {ban.bannedBy && (
                                <div>
                                    <dt className="text-slate-500">Banned by</dt>
                                    <dd className="font-medium text-slate-900">
                                        {typeof ban.bannedBy === "object" && ban.bannedBy?.name
                                            ? `${ban.bannedBy.name} (${ban.bannedBy.email || ""})`
                                            : String(ban.bannedBy)}
                                    </dd>
                                </div>
                            )}
                            {ban.unbannedAt && (
                                <div>
                                    <dt className="text-slate-500">Unbanned at</dt>
                                    <dd className="font-medium text-slate-900">{formatDate(ban.unbannedAt)}</dd>
                                </div>
                            )}
                            {ban.unbanReason && (
                                <div className="sm:col-span-2">
                                    <dt className="text-slate-500">Unban note</dt>
                                    <dd className="font-medium text-slate-900 whitespace-pre-wrap">
                                        {ban.unbanReason}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </section>
                )}

                {/* Licenses */}
                <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <IdCard size={20} className="text-blue-600" />
                        Driving licenses ({licenses.length})
                    </h3>
                    {licenses.length === 0 ? (
                        <p className="text-sm text-slate-500">No licenses uploaded.</p>
                    ) : (
                        <ul className="space-y-6">
                            {licenses.map((lic, index) => (
                                <li
                                    key={lic._id || index}
                                    className="border border-slate-200 rounded-lg p-4 md:p-5 bg-slate-50/50"
                                >
                                    <div className="flex flex-col lg:flex-row gap-4">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusBadgeClass(lic.status)}`}
                                                >
                                                    {lic.status || "pending"}
                                                </span>
                                                {lic.vehicleTypes?.length > 0 && (
                                                    <span className="text-sm text-slate-700">
                                                        {lic.vehicleTypes.join(", ")}
                                                    </span>
                                                )}
                                            </div>
                                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <dt className="text-slate-500 flex items-center gap-1">
                                                        <Clock size={14} /> Uploaded
                                                    </dt>
                                                    <dd className="font-medium text-slate-900">
                                                        {formatDate(lic.uploadedAt)}
                                                    </dd>
                                                </div>
                                                {lic.approvedAt && (
                                                    <div>
                                                        <dt className="text-slate-500 flex items-center gap-1">
                                                            <CheckCircle size={14} /> Reviewed
                                                        </dt>
                                                        <dd className="font-medium text-slate-900">
                                                            {formatDate(lic.approvedAt)}
                                                        </dd>
                                                    </div>
                                                )}
                                                {lic.approvedBy && (
                                                    <div className="sm:col-span-2">
                                                        <dt className="text-slate-500 flex items-center gap-1">
                                                            <User size={14} /> Approved by
                                                        </dt>
                                                        <dd className="font-medium text-slate-900">
                                                            {typeof lic.approvedBy === "object" && lic.approvedBy?.name
                                                                ? `${lic.approvedBy.name} (${lic.approvedBy.email || ""})`
                                                                : String(lic.approvedBy)}
                                                        </dd>
                                                    </div>
                                                )}
                                                {lic.status === "rejected" && lic.rejectionReason && (
                                                    <div className="sm:col-span-2">
                                                        <dt className="text-slate-500 flex items-center gap-1">
                                                            <XCircle size={14} /> Rejection reason
                                                        </dt>
                                                        <dd className="font-medium text-red-800 whitespace-pre-wrap">
                                                            {lic.rejectionReason}
                                                        </dd>
                                                    </div>
                                                )}
                                            </dl>
                                        </div>
                                        {lic.licenseImage && (
                                            <div className="shrink-0 lg:w-72">
                                                <p className="text-xs text-slate-500 mb-2">License image</p>
                                                <a
                                                    href={lic.licenseImage}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block rounded-lg border border-slate-200 overflow-hidden bg-white hover:ring-2 hover:ring-blue-400 transition"
                                                >
                                                    <img
                                                        src={lic.licenseImage}
                                                        alt={`License ${index + 1}`}
                                                        className="w-full max-h-56 object-contain"
                                                    />
                                                </a>
                                                <p className="text-xs text-blue-600 mt-2">Open full size in new tab</p>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
};

export default AdminUserDetailsPage;
