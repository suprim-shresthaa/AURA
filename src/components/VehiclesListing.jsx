import React, { useState, useMemo, useContext, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Car, Users, Fuel, Settings } from 'lucide-react';
import { AppContent } from './context/AppContext';

const VehicleListing = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedTransmission, setSelectedTransmission] = useState('all');
    const [priceRange, setPriceRange] = useState('all');
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const { userData } = useContext(AppContent);

    // Fetch vehicles from API
    useEffect(() => {
        const fetchVehicles = async () => {
            if (!userData?.userId) return;

            try {
                setLoading(true);
                const response = await axios.get(
                    'http://localhost:3000/api/vehicles/vendor-vehicles',
                    { params: { vendorId: userData.userId } }
                );
                setVehicles(response.data.data); // API returns { success, data }
            } catch (error) {
                console.error('Error fetching vehicles:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVehicles();
    }, [userData?.userId]);

    const filteredVehicles = useMemo(() => {
        return vehicles.filter(vehicle => {
            const matchesSearch =
                vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vehicle.category.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = selectedType === 'all' || vehicle.category === selectedType;
            const matchesTransmission =
                selectedTransmission === 'all' || vehicle.transmission === selectedTransmission; // assuming you may add transmission later
            const matchesPrice =
                priceRange === 'all' ||
                (priceRange === 'low' && vehicle.rentPerDay < 50) ||
                (priceRange === 'medium' && vehicle.rentPerDay >= 50 && vehicle.rentPerDay < 80) ||
                (priceRange === 'high' && vehicle.rentPerDay >= 80);

            return matchesSearch && matchesType && matchesTransmission && matchesPrice;
        });
    }, [searchTerm, selectedType, selectedTransmission, priceRange, vehicles]);

    const types = ['all', ...new Set(vehicles.map(v => v.category))];

    if (loading) {
        return <div className="text-center py-12">Loading vehicles...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Search and Filters */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex items-center space-x-2 mb-6">
                        <Filter className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-xl font-semibold text-gray-800">Find Your Perfect Vehicle</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search vehicles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            />
                        </div>

                        {/* Type Filter */}
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        >
                            {types.map(type => (
                                <option key={type} value={type}>
                                    {type === 'all' ? 'All Types' : type}
                                </option>
                            ))}
                        </select>

                        {/* Transmission Filter */}
                        <select
                            value={selectedTransmission}
                            onChange={(e) => setSelectedTransmission(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        >
                            <option value="all">All Transmission</option>
                            <option value="Automatic">Automatic</option>
                            <option value="Manual">Manual</option>
                        </select>

                        {/* Price Range */}
                        <select
                            value={priceRange}
                            onChange={(e) => setPriceRange(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        >
                            <option value="all">All Prices</option>
                            <option value="low">Under $50/day</option>
                            <option value="medium">$50 - $80/day</option>
                            <option value="high">$80+/day</option>
                        </select>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-gray-600">
                        Showing <span className="font-semibold text-indigo-600">{filteredVehicles.length}</span> vehicles
                    </p>
                </div>

                {/* Vehicle Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVehicles.map(vehicle => (
                        <div key={vehicle._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="relative">
                                <img
                                    src={vehicle.mainImage}
                                    alt={vehicle.name}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="absolute top-4 right-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                    {vehicle.category}
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{vehicle.name} ({vehicle.modelYear})</h3>

                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <Users className="w-4 h-4" />
                                        <span className="text-sm">Seats N/A</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <Settings className="w-4 h-4" />
                                        <span className="text-sm">{vehicle.condition}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <Fuel className="w-4 h-4" />
                                        <span className="text-sm">Fuel N/A</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                                        Plate: {vehicle.plateNumber}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div>
                                        <span className="text-3xl font-bold text-indigo-600">${vehicle.rentPerDay}</span>
                                        <span className="text-gray-500 text-sm">/day</span>
                                    </div>
                                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200">
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredVehicles.length === 0 && (
                    <div className="text-center py-12">
                        <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No vehicles found</h3>
                        <p className="text-gray-500">Try adjusting your filters or search term</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VehicleListing;
