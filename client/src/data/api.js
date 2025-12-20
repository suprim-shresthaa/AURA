import axiosInstance from "@/lib/axiosInstance";

export const fetchAllVehicles = async () => {
  const { data } = await axiosInstance.get("/vehicles/all-vehicles");
  return data?.data ?? [];
};

// Admin API functions
export const fetchAdminStats = async () => {
  const { data } = await axiosInstance.get("/admin/dashboard/stats");
  return data?.data ?? null;
};

export const fetchAllPayments = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append("status", filters.status);
  if (filters.paymentStatus) params.append("paymentStatus", filters.paymentStatus);
  if (filters.paymentMethod) params.append("paymentMethod", filters.paymentMethod);
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate) params.append("endDate", filters.endDate);
  if (filters.page) params.append("page", filters.page);
  if (filters.limit) params.append("limit", filters.limit);
  if (filters.sortBy) params.append("sortBy", filters.sortBy);
  if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

  const { data } = await axiosInstance.get(`/admin/payments?${params.toString()}`);
  return data?.data ?? null;
};

export const fetchPaymentById = async (id) => {
  const { data } = await axiosInstance.get(`/admin/payments/${id}`);
  return data?.data ?? null;
};

// Vehicle verification API functions
export const fetchPendingVehicles = async () => {
  const { data } = await axiosInstance.get("/admin/vehicles/pending");
  return data?.data ?? [];
};

export const approveVehicle = async (vehicleId) => {
  const { data } = await axiosInstance.post(`/admin/vehicles/${vehicleId}/approve`);
  return data;
};

export const rejectVehicle = async (vehicleId, rejectionReason) => {
  const { data } = await axiosInstance.post(`/admin/vehicles/${vehicleId}/reject`, {
    rejectionReason
  });
  return data;
};

// License management API functions
export const uploadLicense = async (formData) => {
  const { data } = await axiosInstance.post("/user/license/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return data;
};

export const fetchMyLicenses = async () => {
  const { data } = await axiosInstance.get("/user/license/my-licenses");
  return data?.data ?? [];
};

export const fetchPendingLicenses = async () => {
  const { data } = await axiosInstance.get("/admin/licenses/pending");
  return data?.data ?? [];
};

export const approveLicense = async (licenseId) => {
  const { data } = await axiosInstance.post(`/admin/licenses/${licenseId}/approve`);
  return data;
};

export const rejectLicense = async (licenseId, rejectionReason) => {
  const { data } = await axiosInstance.post(`/admin/licenses/${licenseId}/reject`, {
    rejectionReason
  });
  return data;
};

export default fetchAllVehicles;

