import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE
  ? `${import.meta.env.VITE_API_BASE}/api`
  : "/api";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});
