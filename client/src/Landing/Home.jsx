import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAllVehicles } from "@/data/api";
import {
  Car,
} from "lucide-react";
import HeroSection from "./HeroSection";
import VehicleCard from "@/components/VehicleCard";


const vehicleCategories = ["Car", "Bike", "Scooter", "Van"];

const Home = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadVehicles = async () => {
      try {
        setLoading(true);
        const fetched = await fetchAllVehicles();
        if (isMounted) {
          setVehicles(fetched);
        }
      } catch (error) {
        console.error("Failed to load vehicles:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadVehicles();
    return () => {
      isMounted = false;
    };
  }, []);

  const categorizedVehicles = useMemo(() => {
    return vehicleCategories.reduce((acc, category) => {
      acc[category] = vehicles.filter(
        (vehicle) => vehicle.category === category,
      );
      return acc;
    }, {});
  }, [vehicles]);

  return (
    <div className="w-full text-[#0d141b] min-h-screen">
      <HeroSection />
      <div className="flex justify-center">
        <div className="flex flex-col gap-6 mx-auto w-full">

          <section className="max-w-7xl mx-auto space-y-6">

            <div className="flex flex-col gap-8 max-w-7xl mx-auto py-10">
              {vehicleCategories.map((category) => {
                const items = categorizedVehicles[category] ?? [];

                return (
                  <div key={category} className="space-y-3">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">
                          Rent {category}s
                        </h3>
                      </div>
                      <button
                        className="text-xs hover:text-primary sm:text-sm"
                        asChild
                      >
                        <Link to="/vehicles">View all</Link>
                      </button>
                    </div>

                    {loading ? (
                      <div className="border border-[#cfdbe7] bg-slate-50">
                        <div className="py-10 text-center text-[#4c739a]">
                          Loading {category.toLowerCase()} vehicles...
                        </div>
                      </div>
                    ) : items.length ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {items.map((vehicle) => (
                          <VehicleCard
                            key={vehicle._id}
                            imageUrl={vehicle.mainImage}
                            altText={vehicle.name}
                            title={vehicle.name}
                            location={vehicle.pickupLocation?.city || 'Location not specified'}
                            price={`Rs. ${vehicle.rentPerDay}`}
                            link={`/vehicles/${vehicle._id}`}
                          />
                        ))}
                      </div>
                    ) : ( 
                      <div className="border border-dashed border-[#cfdbe7] bg-slate-50">
                        <div className="py-10 text-center space-y-2">
                          <Car className="w-10 h-10 text-[#a0b8cf] mx-auto" />
                          <p className="text-base font-semibold">
                            No {category.toLowerCase()} data found
                          </p>
                          <p className="text-sm text-[#4c739a]">
                            Check back later or explore another category.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;
