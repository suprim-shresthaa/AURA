import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5001/api",
  withCredentials: true,
  timeout: 10000,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        "API Error:",
        error.response.status,
        error.response.data?.message ?? error.response.statusText,
      );
    } else {
      console.error("Network Error:", error.message);
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;

