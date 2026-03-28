import React, { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

const pageMetaEntries = [
    ["/admin/edit-spare-parts", { title: "Edit Spare Part", subtitle: "Parts Management" }],
    ["/admin/add-spare-parts", { title: "Add Spare Part", subtitle: "Parts Management" }],
    ["/admin/spare-parts", { title: "Manage Spare Parts", subtitle: "Parts Management" }],
    ["/admin/licenses", { title: "Manage Licenses", subtitle: "License Approval" }],
    ["/admin/vehicles", { title: "Manage Vehicles", subtitle: "Vehicle Verification" }],
    ["/admin/applications", { title: "Applications", subtitle: "Vendor Onboarding" }],
    ["/admin/reservations", { title: "Reservations", subtitle: "Booking Management" }],
    ["/admin/users", { title: "Manage Users", subtitle: "User Management" }],
    ["/admin/dashboard", { title: "Dashboard", subtitle: "Admin" }],
];

function resolvePageMeta(pathname) {
    if (pathname.startsWith("/admin/users/") && pathname !== "/admin/users") {
        return { title: "User details", subtitle: "User Management" };
    }
    for (const [prefix, meta] of pageMetaEntries) {
        if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
            return meta;
        }
    }
    return { title: "Admin", subtitle: "Control Center" };
}

const AdminLayout = () => {
    const location = useLocation();

    const meta = useMemo(() => resolvePageMeta(location.pathname), [location.pathname]);

    return (
        <div className="flex min-h-screen bg-slate-100 w-full">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <header className="flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 shrink-0">
                    <div>
                        <p className="text-sm text-gray-500">{meta.subtitle}</p>
                        <h1 className="text-xl font-semibold text-gray-900">{meta.title}</h1>
                    </div>
                </header>

                <div className="flex-1 w-full bg-slate-100 min-h-0">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
