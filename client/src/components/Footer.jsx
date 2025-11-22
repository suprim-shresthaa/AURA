    import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";

    export default function Footer() {
        return (
            <footer className="bg-gray-900 text-gray-300 pt-12 pb-8 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">

                    {/* Logo + About */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-3">AURA Rentals</h2>
                        <p className="text-gray-400 leading-relaxed">
                            Your trusted platform for renting vehicles and spare parts.
                            Reliable service. Affordable rates. Seamless experience.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 classname="text-lg font-semibold text-white mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-indigo-400 transition">Home</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition">Vehicles</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition">Spare Parts</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition">Become a Vendor</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition">Contact Us</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2">
                                <Phone size={18} className="text-indigo-400" />
                                +977-9876543210
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail size={18} className="text-indigo-400" />
                                support@aura.com
                            </li>
                            <li className="flex items-center gap-2">
                                <MapPin size={18} className="text-indigo-400" />
                                Kathmandu, Nepal
                            </li>
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
                        <div className="flex gap-4">
                            <a href="#" className="hover:text-indigo-400 transition"><Facebook size={22} /></a>
                            <a href="#" className="hover:text-indigo-400 transition"><Instagram size={22} /></a>
                        </div>
                    </div>

                </div>

                {/* Bottom */}
                <div className="mt-12 border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
                    © {new Date().getFullYear()} AURA Rentals — All Rights Reserved.
                </div>
            </footer>
        );
    }
