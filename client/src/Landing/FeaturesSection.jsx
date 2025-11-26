import {
    Car,
    Shield,
    Clock,
    MapPin,
    CreditCard,
    Headphones,
    Star,
    Wrench,
    Users
} from 'lucide-react';

export default function FeaturesSection() {
    const features = [
        {
            id: 1,
            icon: Car,
            title: "Premium Fleet",
            description: "Access to a diverse range of well-maintained, premium vehicles from economy to luxury cars, ensuring the perfect ride for every occasion.",
            color: "blue",
            gradient: "from-blue-500 to-blue-600"
        },
        {
            id: 2,
            icon: Shield,
            title: "Comprehensive Insurance",
            description: "Drive with complete peace of mind. All our vehicles come with full insurance coverage and 24/7 roadside assistance included.",
            color: "green",
            gradient: "from-green-500 to-green-600"
        },
        {
            id: 3,
            icon: Clock,
            title: "Instant Booking",
            description: "Book your vehicle in under 2 minutes with our streamlined process. No paperwork hassles, just quick and efficient service.",
            color: "orange",
            gradient: "from-orange-500 to-orange-600"
        },
        {
            id: 4,
            icon: MapPin,
            title: "Multiple Locations",
            description: "Convenient pickup and drop-off points across the city. Choose the location that works best for your schedule.",
            color: "purple",
            gradient: "from-purple-500 to-purple-600"
        },
        {
            id: 5,
            icon: CreditCard,
            title: "Flexible Payments",
            description: "Multiple payment options including credit cards, digital wallets, and installment plans. Pay the way that suits you best.",
            color: "indigo",
            gradient: "from-indigo-500 to-indigo-600"
        },
        {
            id: 6,
            icon: Headphones,
            title: "24/7 Support",
            description: "Round-the-clock customer support to assist you whenever you need help. Our team is always ready to serve you.",
            color: "pink",
            gradient: "from-pink-500 to-pink-600"
        }
    ];

    const colorClasses = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', hover: 'group-hover:bg-blue-100' },
        green: { bg: 'bg-green-50', text: 'text-green-600', hover: 'group-hover:bg-green-100' },
        orange: { bg: 'bg-orange-50', text: 'text-orange-600', hover: 'group-hover:bg-orange-100' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-600', hover: 'group-hover:bg-purple-100' },
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', hover: 'group-hover:bg-indigo-100' },
        pink: { bg: 'bg-pink-50', text: 'text-pink-600', hover: 'group-hover:bg-pink-100' }
    };

    return (
        <section className="py-16 lg:py-24 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 10% 20%, rgba(37, 99, 235, 0.05) 0%, transparent 50%),
                         radial-gradient(circle at 90% 80%, rgba(37, 99, 235, 0.05) 0%, transparent 50%)`
            }}></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium mb-6">
                        <Star className="w-4 h-4 mr-2 text-yellow-500" />
                        Why Choose AURA
                    </div>

                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                        Premium
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 block sm:inline sm:ml-4">
                            Features
                        </span>
                    </h2>

                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Experience the difference with our comprehensive vehicle rental service.
                        We've designed every feature with your convenience and satisfaction in mind.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {features.map((feature, index) => {
                        const IconComponent = feature.icon;
                        const colors = colorClasses[feature.color];

                        return (
                            <div
                                key={feature.id}
                                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 hover:border-gray-200"
                                style={{
                                    animationDelay: `${index * 0.1}s`,
                                    animation: 'fadeInUp 0.6s ease-out both'
                                }}
                            >
                                {/* Background decoration */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-transparent rounded-2xl opacity-50"></div>

                                {/* Icon Container */}
                                <div className={`relative z-10 ${colors.bg} ${colors.hover} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 group-hover:scale-110 transform`}>
                                    <IconComponent className={`h-8 w-8 ${colors.text}`} />
                                </div>

                                {/* Content */}
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed mb-6">
                                        {feature.description}
                                    </p>

                                    {/* Learn More Link */}
                                    <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:text-blue-700 transition-colors duration-300">
                                        <span className="mr-2">Learn More</span>
                                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
                                            <svg className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Hover effect overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* CSS Animation Keyframes */}
            <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </section>
    );
}