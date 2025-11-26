import axiosInstance from "@/lib/axiosInstance";

export const fetchAllVehicles = async () => {
  const { data } = await axiosInstance.get("/vehicles/all-vehicles");
  return data?.data ?? [];
};

export default fetchAllVehicles;

