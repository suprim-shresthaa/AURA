import React, { useState, useMemo, useContext, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, Car, Users, Settings, MapPin } from 'lucide-react';
import { AppContent } from './context/AppContext';

const VehicleListing = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedTransmission, setSelectedTransmission] = useState('all');
    const [priceRange, setPriceRange] = useState('all');
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const { userData } = useContext(AppContent);

    useEffect(() => {
        const fetchVehicles = async () => {
            if (!userData?.userId) return;

            try {
                setLoading(true);
                const response = await axios.get(
                    'http://localhost:3000/api/vehicles/vendor-vehicles',
                    { params: { vendorId: userData.userId } }
                );
                setVehicles(response.data.data);
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
                selectedTransmission === 'all' || vehicle.transmission === selectedTransmission;
            const matchesPrice =
                priceRange === 'all' ||
                (priceRange === 'low' && vehicle.rentPerDay < 500) ||
                (priceRange === 'medium' && vehicle.rentPerDay >= 500 && vehicle.rentPerDay < 1500) ||
                (priceRange === 'high' && vehicle.rentPerDay >= 1500);

            return matchesSearch && matchesType && matchesTransmission && matchesPrice;
        });
    }, [searchTerm, selectedType, selectedTransmission, priceRange, vehicles]);

    const types = ['all', ...new Set(vehicles.map(v => v.category))];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading vehicles...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Available Vehicles</h1>
                    <p className="text-sm text-gray-600">Find the perfect vehicle for your journey</p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search vehicles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>

                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                        >
                            {types.map(type => (
                                <option key={type} value={type}>
                                    {type === 'all' ? 'All Categories' : type}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedTransmission}
                            onChange={(e) => setSelectedTransmission(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                        >
                            <option value="all">All Transmission</option>
                            <option value="Automatic">Automatic</option>
                            <option value="Manual">Manual</option>
                        </select>

                        <select
                            value={priceRange}
                            onChange={(e) => setPriceRange(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                        >
                            <option value="all">All Prices</option>
                            <option value="low">Under Rs. 500/day</option>
                            <option value="medium">Rs. 500 - 1500/day</option>
                            <option value="high">Rs. 1500+/day</option>
                        </select>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-4">
                    <p className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">{filteredVehicles.length}</span> vehicle{filteredVehicles.length !== 1 ? 's' : ''} found
                    </p>
                </div>

                {/* Vehicle Grid */}
                {filteredVehicles.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredVehicles.map(vehicle => (
                            <Link
                                key={vehicle._id}
                                to={`/vehicles/${vehicle._id}`}
                                className="group"
                            >
                                <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
                                    {/* Image */}
                                    <div className="relative h-40 overflow-hidden bg-gray-100">
                                        <img
                                            src={vehicle.mainImage}
                                            alt={vehicle.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        {vehicle.isAvailable && (
                                            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                                                Available
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-3">
                                        <h3 className="font-semibold text-gray-900 mb-0.5 group-hover:text-blue-600 transition-colors line-clamp-1">
                                            {vehicle.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 mb-2">{vehicle.modelYear} • {vehicle.category}</p>

                                        {/* Quick Info */}
                                        <div className="flex items-center gap-3 mb-3 text-xs text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Users className="w-3.5 h-3.5" />
                                                <span>{vehicle.seatingCapacity}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Settings className="w-3.5 h-3.5" />
                                                <span>{vehicle.transmission}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5" />
                                                <span>{vehicle.pickupLocation.city}</span>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                            <div>
                                                <span className="text-lg font-bold text-blue-600">
                                                    Rs. {vehicle.rentPerDay}
                                                </span>
                                                <span className="text-xs text-gray-500">/day</span>
                                            </div>
                                            <span className="text-xs text-blue-600 font-medium group-hover:underline">
                                                View →
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg">
                        <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-1">No vehicles found</h3>
                        <p className="text-sm text-gray-500">Try adjusting your filters</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VehicleListing;