import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Package, Box, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function SparePartCard({ part }) {
    const {
        _id,
        name,
        category,
        brand,
        rentPrice,
        stock,
        images,
        isAvailable,
    } = part;

    const imageUrl = images && images.length > 0 ? images[0] : null;
    const isInStock = isAvailable && stock > 0;
    const link = `/spare-parts/${_id}`;

    return (
        <Card className="w-full group pt-0 rounded-2xl overflow-hidden border border-gray-200/80 shadow-sm bg-white gap-0 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:border-gray-300">
            {/* Image Section */}
            <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                {/* Image with overlay gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-gray-400" />
                    </div>
                )}
                <Link
                    to={link}
                    aria-label={name}
                    className="absolute inset-0 z-10"
                />

                {/* Stock Status Badge */}
                <div className="absolute top-3 right-3 z-20">
                    {isInStock ? (
                        <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            In Stock
                        </Badge>
                    ) : (
                        <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Out of Stock
                        </Badge>
                    )}
                </div>
            </div>

            {/* Card Content */}
            <CardContent className="px-6 space-y-2">
                {/* Category Badge */}
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {category}
                    </Badge>
                </div>

                <h3 className="font-bold group-hover:text-primary transition-colors duration-300 text-lg leading-tight line-clamp-2 min flex items-start" title={name}>
                    <Link to={link} className="hover:underline decoration-2 underline-offset-2">
                        {name}
                    </Link>
                </h3>

                <p className="text-gray-600 text-sm">
                    {brand}
                </p>
            </CardContent>

            {/* Card Footer */}
            <CardFooter className="px-6 gap-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex flex-col">
                    <p className="text-sm font-bold text-gray-900">
                        {rentPrice && `Rent Price: Rs. ${rentPrice?.toLocaleString()}`}<br />
                    </p>
                </div>
                <Link 
                    className={`${buttonVariants({ variant: 'default', size: 'sm' })} group/btn transition-all duration-300 hover:scale-105`} 
                    to={link}
                >
                    View
                    <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </Link>
            </CardFooter>
        </Card>
    );
}

