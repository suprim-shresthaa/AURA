import React from "react";
import {
    Users,
    Calendar,
    Wrench,
    Car,
    TrendingUp,
} from "lucide-react";

const Dashboard = () => {
    const metrics = [
        {
            title: "Total Users",
            value: 150,
            icon: Users,
            color: "from-blue-500 to-blue-600",
            lightBg: "bg-blue-50",
            trend: "+12% from last month"
        },
        {
            title: "Active Reservations",
            value: 45,
            icon: Calendar,
            color: "from-purple-500 to-purple-600",
            lightBg: "bg-purple-50",
            trend: "+8% from last month"
        },
        {
            title: "Available Vehicles",
            value: 20,
            icon: Car,
            color: "from-emerald-500 to-emerald-600",
            lightBg: "bg-emerald-50",
            trend: "3 new added"
        },
        {
            title: "Spare Parts in Stock",
            value: 300,
            icon: Wrench,
            color: "from-orange-500 to-orange-600",
            lightBg: "bg-orange-50",
            trend: "+45 units"
        },
    ];

    return (
        <div className="p-8 min-h-screen">
            <div className="max-w-7xl mx-auto">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric) => {
                    const Icon = metric.icon;
                    return (
                        <div
                            key={metric.title}
                            className="relative overflow-hidden rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-5`}></div>

                            <div className="relative p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`${metric.lightBg} p-3 rounded-lg`}>
                                        <Icon className={`w-6 h-6 text-${metric.color.split('-')[1]}-600`} />
                                    </div>
                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                </div>

                                <h3 className="text-sm font-medium text-gray-600 mb-1">{metric.title}</h3>
                                <p className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</p>
                                <p className="text-xs text-emerald-600 font-medium">{metric.trend}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <div className="lg:col-span-2 bg-green-100 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="flex items-center justify-between p-4 bg-white rounded-lg hover:bg-gray-100 transition">
                                <div>
                                    <p className="font-medium text-gray-900">User activity #{item}</p>
                                    <p className="text-sm text-gray-600">2 hours ago</p>
                                </div>
                                <div className="h-3 w-3 bg-emerald-500 rounded-full"></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className=" rounded-2xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Avg Reservation</span>
                            <span className="font-bold text-gray-900">3.2 days</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Occupancy Rate</span>
                            <span className="font-bold text-gray-900">85%</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Revenue (This Month)</span>
                            <span className="font-bold text-gray-900">$12.5K</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
};

const AdminDashboard = () => {
    return <Dashboard />;
};

export default AdminDashboard;