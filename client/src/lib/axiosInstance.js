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
      
      // Handle 401 Unauthorized errors (invalid/expired token)
      if (error.response.status === 401) {
        const message = error.response.data?.message || "Session expired. Please login again.";
        
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes("/login")) {
          // Clear any stored user data
          localStorage.removeItem("user");
          
          // Show error message
          if (typeof window !== "undefined" && window.toast) {
            window.toast.error(message);
          }
          
          // Redirect to login after a short delay
          setTimeout(() => {
            window.location.href = "/login";
          }, 1500);
        }
      }
    } else {
      console.error("Network Error:", error.message);
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;

