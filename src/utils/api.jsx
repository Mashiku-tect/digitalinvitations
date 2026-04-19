import axios from "axios";

const SERVER_URL='https://ecards.mashikutech.co.tz/digitalinvitations';

//const SERVER_URL='http://10.104.229.77:5002';


const api = axios.create({
  baseURL: SERVER_URL,
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
