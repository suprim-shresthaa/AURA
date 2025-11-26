import { Search, CreditCard, Car, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HowItWorks() {
    const steps = [
        {
            id: 1,
            icon: Search,
            title: "Choose Vehicle",
            description: "Browse our extensive fleet and select from a wide range of premium vehicles that suit your needs."
        },
        {
            id: 2,
            icon: CreditCard,
            title: "Book & Pay",
            description: "Complete your booking with our secure payment system. Quick, easy, and completely safe."
        },
        {
            id: 3,
            icon: Car,
            title: "Pick Up",
            description: "Collect your vehicle from our convenient locations or enjoy free delivery to your doorstep."
        },
        {
            id: 4,
            icon: CheckCircle,
            title: "Drive Away",
            description: "Hit the road with confidence knowing you're covered with our comprehensive insurance and 24/7 support."
        }
    ];

    return (
        <section className="bg-white py-16 lg:py-24 relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 20% 80%, rgba(37, 99, 235, 0.03) 0%, transparent 50%),
                         radial-gradient(circle at 80% 20%, rgba(37, 99, 235, 0.03) 0%, transparent 50%)`
            }}></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                        How It Works
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Get started with AURA in just a few simple steps. Our streamlined process makes
                        vehicle rental quick, easy, and hassle-free.
                    </p>
                </div>

                {/* Steps Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
                    {steps.map((step, index) => {
                        const IconComponent = step.icon;
                        return (
                            <div
                                key={step.id}
                                className="relative group"
                            >
                                {/* Connecting Line (desktop only) */}
                                {index < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-blue-100 transform translate-x-0 z-0">
                                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1">
                                            <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                                        </div>
                                    </div>
                                )}

                                {/* Step Card */}
                                <div className="relative z-10 bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group-hover:border-blue-200">
                                    {/* Step Number */}
                                    <div className="absolute -top-4 left-8">
                                        <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                                            {step.id}
                                        </div>
                                    </div>

                                    {/* Icon Container */}
                                    <div className="bg-blue-50 group-hover:bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 mx-auto md:mx-0">
                                        <IconComponent className="h-8 w-8 text-blue-600" />
                                    </div>

                                    {/* Content */}
                                    <div className="text-center md:text-left">
                                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                                            {step.title}
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}