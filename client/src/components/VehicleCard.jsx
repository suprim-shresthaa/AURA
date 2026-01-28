import { MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function VehicleCard(
    { imageUrl, altText, title, location, price, link }
) {
    return (
        <div className="w-full group pt-0 rounded-2xl overflow-hidden border border-gray-200/80 shadow-sm bg-white gap-0 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50  hover:border-gray-300">
            {/* Image Section */}
            <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                {/* Image with overlay gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
                <img
                    src={imageUrl}
                    alt={altText}
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                />
                <Link
                    to={link}
                    aria-label={title}
                    className="absolute inset-0 z-10"
                />

            </div>

            {/* Card Content */}
            <div className="px-6 space-y-2 py-5">
                <h3 className="font-bold group-hover:text-primary transition-colors duration-300 text-lg leading-tight line-clamp-2 min flex items-start" title={title}>
                    <Link to={link} className="hover:underline decoration-2 underline-offset-2">
                        {title}
                    </Link>
                </h3>
                <p className="text-gray-600 text-sm flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="line-clamp-1">{location}</span>
                </p>
            </div>

            {/* Card Footer */}
            <div className="px-6 gap-3 py-5 border-t border-gray-100  flex items-center justify-between">
                <div className="flex flex-col">
                    <p className="text-xl font-bold text-gray-900">{price}<span className="text-sm text-gray-500">/day</span></p>
                </div>
                <Link 
                   className={`inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:scale-105`} 
                    to={link}
                >
                    View
                    <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </Link>
            </div>
        </div>
    );
}
