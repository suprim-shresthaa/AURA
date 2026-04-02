/** Display spare part pickup: string (new) or legacy { address, city }. */
export function formatSparePartPickup(pickup) {
    if (pickup == null) return "";
    if (typeof pickup === "string") return pickup.trim();
    if (typeof pickup === "object") {
        const a = pickup.address != null ? String(pickup.address).trim() : "";
        const c = pickup.city != null ? String(pickup.city).trim() : "";
        return [a, c].filter(Boolean).join(", ").trim();
    }
    return String(pickup);
}
