import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAllVehicles } from "@/data/api";
import { howItWorksSteps, testimonials } from "@/data/mockdata";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  Car,
  CreditCard,
  Search,
  Star,
} from "lucide-react";
import HeroSection from "./HeroSection";
import VehicleCard from "@/components/VehicleCard";

const stepIcons = {
  search: Search,
  calendar: Calendar,
  "credit-card": CreditCard,
  car: Car,
};

const vehicleCategories = ["Car", "Bike", "Scooter", "Jeep", "Van"];

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
    <div className=" text-[#0d141b] min-h-screen">
      <div className="flex justify-center">
        <div className="flex flex-col gap-6 mx-auto">
          <HeroSection />

          <section className="max-w-7xl mx-auto space-y-6">

            <div className="flex flex-col gap-8 max-w-7xl mx-auto">
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
                      <Button
                        variant="secondary"
                        className="text-xs sm:text-sm"
                        asChild
                      >
                        <Link to="/vehicles">View all</Link>
                      </Button>
                    </div>

                    {loading ? (
                      <Card className="border border-[#cfdbe7] bg-slate-50">
                        <CardContent className="py-10 text-center text-[#4c739a]">
                          Loading {category.toLowerCase()} vehicles...
                        </CardContent>
                      </Card>
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
                      <Card className="border border-dashed border-[#cfdbe7] bg-slate-50">
                        <CardContent className="py-10 text-center space-y-2">
                          <Car className="w-10 h-10 text-[#a0b8cf] mx-auto" />
                          <p className="text-base font-semibold">
                            No {category.toLowerCase()} data found
                          </p>
                          <p className="text-sm text-[#4c739a]">
                            Check back later or explore another category.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="py-6 max-w-7xl mx-auto">
            <h2 className="text-[22px] max-w-7xl mx-auto font-bold tracking-[-0.015em] mb-4">
              How It Works
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {howItWorksSteps.map((step) => {
                const Icon = stepIcons[step.icon];
                return (
                  <Card
                    key={step.title}
                    className="border border-[#cfdbe7] bg-slate-50"
                  >
                    <CardHeader className="flex flex-row items-start gap-3 px-4 pt-4">
                      <div className="text-[#0d141b]">
                        {Icon && <Icon className="h-6 w-6" />}
                      </div>
                      <CardTitle className="text-base font-bold leading-tight">
                        {step.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <CardDescription className="text-sm text-[#4c739a] leading-normal">
                        {step.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          <section className="px-1 pb-10 max-w-7xl mx-auto">
            <h2 className="text-[22px] max-w-7xl mx-auto font-bold tracking-[-0.015em] mb-4">
              Testimonials
            </h2>
            <div className="flex flex-col gap-8 overflow-x-hidden bg-slate-50 p-4 rounded-lg">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.name} className="flex flex-col gap-3">
                  <CardHeader className="flex flex-row items-center gap-3">
                    <div
                      className="size-10 rounded-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${testimonial.avatar})` }}
                    />
                    <div>
                      <CardTitle className="text-base font-medium leading-normal">
                        {testimonial.name}
                      </CardTitle>
                      <CardDescription className="text-sm text-[#4c739a] leading-normal">
                        {testimonial.date}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={`size-5 ${
                            index < testimonial.rating
                              ? "text-[#1380ec] fill-[#1380ec]"
                              : "text-[#adc2d7]"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-base leading-normal">
                      “{testimonial.quote}”
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;
