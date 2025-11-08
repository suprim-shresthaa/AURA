import React, { useState, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Car, User, Settings, LogOut } from "lucide-react";
import { AppContent } from "./context/AppContext";
import useLogout from "../hooks/useLogout";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const closeTimeout = useRef(null);

    const { isLoggedin, userData } = useContext(AppContent);
    const logout = useLogout();

    const toggleMenu = () => setIsMenuOpen((prev) => !prev);

    const navLinks = [
        { name: "Home", path: "/" },
        { name: "Vehicles", path: "/vehicles" },
        { name: "Products", path: "/products" },
        { name: "Cart", path: "/cart" },
    ];

    const dropdownLinks = [
        { name: "Profile", path: "/profile", icon: <User className="h-4 w-4" /> },
        { name: "Settings", path: "/settings", icon: <Settings className="h-4 w-4" /> },
    ];

    return (
        <nav className="bg-white shadow-md fixed w-full top-0 z-50 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Navbar Container */}
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
                            <Car className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex flex-col leading-tight">
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">AURA</h1>
                            <p className="text-xs text-gray-500">Vehicle & Spare Parts</p>
                        </div>
                    </Link>

                    {/* Centered Nav Links */}
                    <div className="hidden md:flex items-center space-x-8 mx-auto">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200 hover:bg-blue-50 rounded-md"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Profile / Auth Section */}
                    <div className="hidden md:flex items-center">
                        {isLoggedin ? (
                            <div
                                className="relative"
                                onMouseEnter={() => {
                                    clearTimeout(closeTimeout.current);
                                    setIsDropdownOpen(true);
                                }}
                                onMouseLeave={() => {
                                    closeTimeout.current = setTimeout(() => setIsDropdownOpen(false), 150);
                                }}
                            >
                                {/* Profile Button */}
                                <div className="flex items-center space-x-2 cursor-pointer">
                                    <img
                                        src={userData?.image || "https://via.placeholder.com/40"}
                                        alt="Profile"
                                        className="h-10 w-10 rounded-full object-cover border-2 border-blue-600"
                                    />
                                    <span className="text-gray-700 font-medium text-sm">
                                        {userData?.name || "Profile"}
                                    </span>
                                </div>

                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-lg z-50 py-1">
                                        {dropdownLinks.map((link) => (
                                            <Link
                                                key={link.name}
                                                to={link.path}
                                                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 text-sm font-medium transition-colors duration-200"
                                            >
                                                {link.icon}
                                                <span>{link.name}</span>
                                            </Link>
                                        ))}

                                        <button
                                            onClick={logout}
                                            className="flex items-center w-full space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 text-sm font-medium transition-colors duration-200 rounded-b-lg"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                Get Started
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMenu}
                        className="md:hidden text-gray-700 hover:text-blue-600 p-2 rounded-md transition-colors duration-200 focus:outline-none"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div
                className={`md:hidden bg-white border-t border-gray-100 overflow-hidden transition-all duration-300 ${isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="px-4 pt-2 pb-4 space-y-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            onClick={() => setIsMenuOpen(false)}
                            className="block text-gray-700 hover:text-blue-600 px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 hover:bg-blue-50"
                        >
                            {link.name}
                        </Link>
                    ))}

                    {isLoggedin ? (
                        <>
                            <div className="flex items-center space-x-2 px-3 py-2">
                                <img
                                    src={userData?.image || "https://via.placeholder.com/40"}
                                    alt="Profile"
                                    className="h-8 w-8 rounded-full object-cover border-2 border-blue-600"
                                />
                                <span className="text-gray-700 font-medium text-base">
                                    {userData?.name || "Profile"}
                                </span>
                            </div>

                            {dropdownLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 text-base font-medium rounded-md transition-colors duration-200"
                                >
                                    {link.icon}
                                    <span>{link.name}</span>
                                </Link>
                            ))}

                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);       
                                    logout();
                                }}
                                className="flex items-center w-full space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 text-base font-medium rounded-md transition-colors duration-200"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Get Started
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
