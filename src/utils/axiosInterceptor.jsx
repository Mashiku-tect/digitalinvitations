import api from "./api";
import { toast } from "react-toastify";

let logoutHandler = null;
let isLoggingOut = false;

export const setLogoutHandler = (handler) => {
  logoutHandler = handler;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response?.status === 401 &&
      !isLoggingOut
    ) {
      isLoggingOut = true;

      toast.error("Session expired. Please log in again.");

      setTimeout(() => {
        localStorage.removeItem("token");

        if (logoutHandler) {
          logoutHandler();
        } else {
          window.location.replace("/login");
        }

        isLoggingOut = false;
      }, 1500); // ⏳ delay for toast
    }

    return Promise.reject(error);
  }
);

export default api;
