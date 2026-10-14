// client/src/axiosInstance.js
import axios from "axios";

// Base URL for the backend API – taken from VITE_API_URL env variable
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
});

// Attach ID token to every request if present in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("idToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
