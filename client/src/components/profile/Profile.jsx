import React, { useContext } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { AppContent } from "../context/AppContext";

const Profile = () => {
    const { userData } = useContext(AppContent);

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    {/* Sidebar */}
                    <aside className="lg:col-span-3">
                        <Sidebar userData={userData} />
                    </aside>

                    {/* Main Content */}
                    <main className="mt-8 lg:mt-0 lg:col-span-9">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Profile;