import axios from "axios";

const api = axios.create({
  baseURL: 'https://ecards.mashikutech.co.tz/digitalinvitations',
  timeout: 10000, // 10 seconds
});

// Attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
