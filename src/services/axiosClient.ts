// src/services/axiosClient.ts
import axios, { AxiosError, AxiosInstance } from "axios";

const BASE_URL =
  "https://api.tecnologiasadministrativas.com/api";

let AUTH_TOKEN: string | null =
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

type UnauthorizedHandler = () => void;
let onUnauthorizedCb: UnauthorizedHandler | null = null;

/** Permite inyectar/actualizar el token en runtime */
export function setAuthToken(token: string | null) {
  AUTH_TOKEN = token;
  if (typeof window !== "undefined") {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }
}

/** Hook para reaccionar a 401 (p. ej., redirigir a /login) */
export function onUnauthorized(handler: UnauthorizedHandler) {
  onUnauthorizedCb = handler;
}

const axiosClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  withCredentials: false, // pon true si usas cookies/Sanctum same-site
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ----- Request interceptor: Bearer token
axiosClient.interceptors.request.use((config) => {
  if (AUTH_TOKEN) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${AUTH_TOKEN}`;
  }
  return config;
});

// ----- Response interceptor: manejo de errores comunes
axiosClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError<any>) => {
    const status = error.response?.status;
    if (status === 401 || status === 419) {
      // 419: Laravel CSRF/expired; 401: no autorizado
      if (onUnauthorizedCb) onUnauthorizedCb();
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
