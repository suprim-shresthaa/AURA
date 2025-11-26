import React, { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import { Link } from 'react-router-dom';
import { Search, Package, DollarSign, Box, Filter } from 'lucide-react';

const SparePartsListing = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('all');
    const [brand, setBrand] = useState('all');
    const [priceRange, setPriceRange] = useState('all');
    const [inStock, setInStock] = useState('all');
    const [spareParts, setSpareParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [allBrands, setAllBrands] = useState([]);

    const categories = [
        'all',
        'Engine',
        'Electrical',
        'Tires',
        'Filters',
        'Body',
        'Accessories',
        'Brakes',
        'Suspension'
    ];

    // Fetch all spare parts and brands on mount
    useEffect(() => {
        const fetchSpareParts = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/spare-parts/all');
                const partsData = response.data.data || [];
                setSpareParts(partsData);
                
                // Extract unique brands
                const brands = [...new Set(partsData
                    .map(p => p.brand)
                    .filter(Boolean)
                )].sort();
                setAllBrands(brands);
            } catch (error) {
                console.error('Error fetching spare parts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSpareParts();
    }, []);

    // Fetch filtered spare parts when filters change
    useEffect(() => {
        const fetchFilteredParts = async () => {
            try {
                setLoading(true);
                const params = {
                    search: searchTerm || undefined,
                    category: category !== 'all' ? category : undefined,
                    brand: brand !== 'all' ? brand : undefined,
                    priceRange: priceRange !== 'all' ? priceRange : undefined,
                    inStock: inStock !== 'all' ? inStock : undefined
                };

                // Handle price ranges
                if (priceRange === 'low') {
                    params.minPrice = 0;
                    params.maxPrice = 1000;
                } else if (priceRange === 'medium') {
                    params.minPrice = 1000;
                    params.maxPrice = 5000;
                } else if (priceRange === 'high') {
                    params.minPrice = 5000;
                }

                // Remove undefined values
                Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

                const response = await axiosInstance.get('/spare-parts/search', { params });
                setSpareParts(response.data.data || []);
            } catch (error) {
                console.error('Error searching spare parts:', error);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchFilteredParts();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, category, brand, priceRange, inStock]);

    if (loading && spareParts.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading spare parts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Spare Parts</h1>
                    <p className="text-sm text-gray-600">Find the parts you need for your vehicle</p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                        {/* Search */}
                        <div className="relative md:col-span-2">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search parts, brands, or compatible vehicles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>

                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat === 'all' ? 'All Categories' : cat}
                                </option>
                            ))}
                        </select>

                        <select
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                        >
                            <option value="all">All Brands</option>
                            {allBrands.map(brandName => (
                                <option key={brandName} value={brandName}>{brandName}</option>
                            ))}
                        </select>

                        <select
                            value={priceRange}
                            onChange={(e) => setPriceRange(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                        >
                            <option value="all">All Prices</option>
                            <option value="low">Under Rs. 1,000</option>
                            <option value="medium">Rs. 1,000 - 5,000</option>
                            <option value="high">Rs. 5,000+</option>
                        </select>
                    </div>
                    
                    {/* Stock Filter */}
                    <div className="mt-3">
                        <select
                            value={inStock}
                            onChange={(e) => setInStock(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white w-full md:w-auto"
                        >
                            <option value="all">All Items</option>
                            <option value="true">In Stock Only</option>
                            <option value="false">Out of Stock</option>
                        </select>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-4">
                    <p className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">{spareParts.length}</span> part{spareParts.length !== 1 ? 's' : ''} found
                    </p>
                </div>

                {/* Spare Parts Grid */}
                {spareParts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {spareParts.map(part => (
                            <Link
                                key={part._id}
                                to={`/spare-parts/${part._id}`}
                                className="group"
                            >
                                <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
                                    {/* Image */}
                                    <div className="relative h-40 overflow-hidden bg-gray-100">
                                        {part.images && part.images.length > 0 ? (
                                            <img
                                                src={part.images[0]}
                                                alt={part.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                <Package className="w-12 h-12 text-gray-400" />
                                            </div>
                                        )}
                                        {part.isAvailable && part.stock > 0 ? (
                                            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                                                In Stock
                                            </div>
                                        ) : (
                                            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                                                Out of Stock
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-3">
                                        <div className="mb-2">
                                            <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">
                                                {part.category}
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-0.5 group-hover:text-blue-600 transition-colors line-clamp-1">
                                            {part.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 mb-2">{part.brand}</p>

                                        {part.compatibleVehicles && (
                                            <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                                                Compatible: {part.compatibleVehicles}
                                            </p>
                                        )}

                                        {/* Stock Info */}
                                        <div className="flex items-center gap-2 mb-3 text-xs text-gray-600">
                                            <Box className="w-3.5 h-3.5" />
                                            <span>Stock: {part.stock}</span>
                                        </div>

                                        {/* Price */}
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                            <div>
                                                <span className="text-lg font-bold text-blue-600">
                                                    Rs. {part.price}
                                                </span>
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
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-1">No spare parts found</h3>
                        <p className="text-sm text-gray-500">
                            {loading ? 'Loading spare parts...' : 'Try adjusting your filters'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SparePartsListing;

