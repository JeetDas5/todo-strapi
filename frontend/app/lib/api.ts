import axios from "axios";

export const api = axios.create({
  baseURL: process.env.API_BASE_URL || "http://localhost:1337/api",
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error?.message || error.message;
    return Promise.reject(new Error(message));
  }
);
