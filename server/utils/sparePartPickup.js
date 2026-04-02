/**
 * Maps spare part pickup (string or legacy { address, city }) to booking.pickupLocation shape.
 */
export function sparePartPickupToBookingShape(pickup) {
    if (typeof pickup === "string" && pickup.trim()) {
        return { address: pickup.trim(), city: "" };
    }
    if (pickup && typeof pickup === "object") {
        const address = pickup.address != null ? String(pickup.address).trim() : "";
        const city = pickup.city != null ? String(pickup.city).trim() : "";
        if (address || city) {
            return { address, city };
        }
    }
    return {
        address: "Store Location",
        city: "Kathmandu",
    };
}
