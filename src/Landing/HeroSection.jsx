import { ArrowRight, Car, Wrench, Shield, Clock } from 'lucide-react';
import Button from '../components/ui/Button';
import { AppContent } from '../components/context/AppContext';
import { useContext } from 'react';

export default function HeroSection() {
    const {userData} = useContext(AppContent);

    // console.log(userData);
    
    return (
        <div className="bg-white relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white opacity-70"></div>
            <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, rgba(37, 99, 235, 0.05) 0%, transparent 50%),
                                 radial-gradient(circle at 75% 75%, rgba(37, 99, 235, 0.05) 0%, transparent 50%)`
            }}></div>

            {/* Main content */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-24 lg:pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                    {/* Left side - Content */}
                    <div className="text-center lg:text-left">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                            Rent Your Vehicle,
                            <span className="text-blue-600 block">Fast & Easy</span>
                        </h1>

                        <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl lg:max-w-none">
                            AURA makes vehicle rental and spare parts convenient, reliable, and fast.
                            Get on the road quickly with our premium fleet and quality components.
                        </p>

                        {/* CTA Buttons using reusable Button component */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                            <Button
                                variant="primary"
                                size="lg"
                                icon={ArrowRight}
                                iconPosition="right"
                            >
                                Get Started
                            </Button>

                            <Button
                                variant="secondary"
                                size="lg"
                            >
                                Learn More
                            </Button>
                        </div>

                        {/* Feature highlights */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center lg:text-left">
                            <div className="flex items-center justify-center lg:justify-start space-x-3">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                </div>
                                <span className="text-gray-700 font-medium">24/7 Service</span>
                            </div>
                            <div className="flex items-center justify-center lg:justify-start space-x-3">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <Shield className="h-5 w-5 text-blue-600" />
                                </div>
                                <span className="text-gray-700 font-medium">Fully Insured</span>
                            </div>
                            <div className="flex items-center justify-center lg:justify-start space-x-3">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <Wrench className="h-5 w-5 text-blue-600" />
                                </div>
                                <span className="text-gray-700 font-medium">Quality Parts</span>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Visual */}
                    <div className="relative">
                        <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 shadow-xl">
                            <div className="relative h-64 sm:h-80 flex items-center justify-center">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-48 h-48 bg-blue-200 rounded-full opacity-30"></div>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-32 h-32 bg-blue-300 rounded-full opacity-40"></div>
                                </div>
                                <div className="relative z-10 bg-white p-8 rounded-2xl shadow-lg">
                                    <Car className="h-24 w-24 text-blue-600" />
                                </div>
                                <div className="absolute top-8 right-8 bg-white p-3 rounded-full shadow-md animate-bounce" style={{ animationDelay: '0.5s' }}>
                                    <Wrench className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="absolute bottom-8 left-8 bg-white p-3 rounded-full shadow-md animate-bounce" style={{ animationDelay: '1s' }}>
                                    <Shield className="h-6 w-6 text-green-500" />
                                </div>
                                <div className="absolute top-16 left-12 bg-white p-3 rounded-full shadow-md animate-bounce" style={{ animationDelay: '1.5s' }}>
                                    <Clock className="h-6 w-6 text-orange-500" />
                                </div>
                            </div>
                        </div>

                        <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">1000+</div>
                                <div className="text-sm text-gray-600">Happy Customers</div>
                            </div>
                        </div>

                        <div className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">24/7</div>
                                <div className="text-sm text-gray-600">Available</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
