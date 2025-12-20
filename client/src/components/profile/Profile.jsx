// src/pages/Profile.jsx
import React, { useContext, useState } from "react";
import Sidebar from "./Sidebar";
import ProfileInfo from "./ProfileInfo";
import Settings from './Settings'
import Bookings from './Bookings'
import Licenses from './Licenses'
import { AppContent } from "../context/AppContext";

const Profile = () => {
    const { userData } = useContext(AppContent);
    const [activeTab, setActiveTab] = useState("profile");

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    {/* Sidebar */}
                    <aside className="lg:col-span-3">
                        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userData={userData} />
                    </aside>

                    {/* Main Content */}
                    <main className="mt-8 lg:mt-0 lg:col-span-9">
                        {activeTab === "profile" && <ProfileInfo />}
                        {activeTab === "bookings" && <Bookings />}
                        {activeTab === "licenses" && <Licenses />}
                        {activeTab === "settings" && <Settings />}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Profile;