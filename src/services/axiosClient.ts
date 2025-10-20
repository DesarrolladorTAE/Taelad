// src/services/axiosClient.ts
import axios, { AxiosError, AxiosInstance } from "axios";

const BASE_URL = "https://api.tecnologiasadministrativas.com/api";

let AUTH_TOKEN: string | null = null;
type UnauthorizedHandler = () => void;
let onUnauthorizedCb: UnauthorizedHandler | null = null;

/** ======================
 *  Helpers de Token
 * ====================== */

/** Lee el token directamente de memoria o localStorage */
function getAuthToken(): string | null {
  if (AUTH_TOKEN) return AUTH_TOKEN;
  if (typeof window !== "undefined") {
    const t = localStorage.getItem("token");
    if (t) AUTH_TOKEN = t;
    return t;
  }
  return null;
}

/** Inyecta o limpia el token manualmente */
export function setAuthToken(token: string | null) {
  AUTH_TOKEN = token;
  if (typeof window !== "undefined") {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }
}

/** Hook para reaccionar a 401 (redirigir a /login, etc.) */
export function onUnauthorized(handler: UnauthorizedHandler) {
  onUnauthorizedCb = handler;
}

/** ======================
 *  Configuración Axios
 * ====================== */

const axiosClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ----- Request interceptor: refresca token siempre
axiosClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ----- Response interceptor: manejo de errores comunes
axiosClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError<any>) => {
    const status = error.response?.status;
    if (status === 401 || status === 419) {
      if (onUnauthorizedCb) onUnauthorizedCb();
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
