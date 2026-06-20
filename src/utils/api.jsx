import axios from "axios";

const SERVER_URL='https://ecards.mashikutech.co.tz/digitalinvitations';

//const SERVER_URL='http://192.168.1.242:5002';

//increase timeout to handle sending of invitations messages which can take a while depending on the number of invitations being sent
const api = axios.create({
  baseURL: SERVER_URL,
  timeout: 180000, // 3 minutes
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
