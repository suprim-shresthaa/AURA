import React, { useState } from 'react';
import { Car, DollarSign, Calendar, Users } from 'lucide-react';
import Sidebar from './Sidebar';

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, trend, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
            {trend && (
                <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
            )}
        </div>
        <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
);

// Main Dashboard Component
export default function VendorDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [vehicles] = useState([
        { id: 1, name: 'Tesla Model 3', type: 'Sedan', price: 120, status: 'Available', bookings: 45, rating: 4.8 },
        { id: 2, name: 'BMW X5', type: 'SUV', price: 180, status: 'Rented', bookings: 32, rating: 4.7 },
        { id: 3, name: 'Mercedes C-Class', type: 'Sedan', price: 150, status: 'Available', bookings: 28, rating: 4.9 },
        { id: 4, name: 'Audi Q7', type: 'SUV', price: 200, status: 'Maintenance', bookings: 41, rating: 4.6 }
    ]);

    const [bookings] = useState([
        { id: 1, vehicle: 'Tesla Model 3', customer: 'John Doe', startDate: '2025-11-15', endDate: '2025-11-18', amount: 360, status: 'Confirmed' },
        { id: 2, vehicle: 'BMW X5', customer: 'Jane Smith', startDate: '2025-11-13', endDate: '2025-11-20', amount: 1260, status: 'Active' },
        { id: 3, vehicle: 'Mercedes C-Class', customer: 'Mike Johnson', startDate: '2025-11-20', endDate: '2025-11-22', amount: 300, status: 'Pending' },
        { id: 4, vehicle: 'Tesla Model 3', customer: 'Sarah Williams', startDate: '2025-11-10', endDate: '2025-11-12', amount: 240, status: 'Completed' }
    ]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Available': return 'bg-green-100 text-green-800';
            case 'Rented': return 'bg-blue-100 text-blue-800';
            case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
            case 'Confirmed': return 'bg-green-100 text-green-800';
            case 'Active': return 'bg-blue-100 text-blue-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Completed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="ml-6 flex-1 p-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatsCard
                            title="Total Vehicles"
                            value={vehicles.length}
                            icon={Car}
                            trend={12}
                            color="bg-blue-600"
                        />
                        <StatsCard
                            title="Active Bookings"
                            value={bookings.filter(b => b.status === 'Active').length}
                            icon={Calendar}
                            trend={8}
                            color="bg-green-600"
                        />
                        <StatsCard
                            title="Monthly Earnings"
                            value="$8,420"
                            icon={DollarSign}
                            trend={15}
                            color="bg-purple-600"
                        />
                        <StatsCard
                            title="Total Customers"
                            value="147"
                            icon={Users}
                            trend={-3}
                            color="bg-orange-600"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Bookings</h3>
                            <div className="space-y-3">
                                {bookings.slice(0, 3).map(booking => (
                                    <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">{booking.vehicle}</p>
                                            <p className="text-sm text-gray-600">{booking.customer}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Top Performing Vehicles</h3>
                            <div className="space-y-3">
                                {vehicles.sort((a, b) => b.bookings - a.bookings).slice(0, 3).map(vehicle => (
                                    <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">{vehicle.name}</p>
                                            <p className="text-sm text-gray-600">{vehicle.bookings} bookings</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-gray-900">${vehicle.price}/day</p>
                                            <p className="text-sm text-yellow-600">★ {vehicle.rating}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}