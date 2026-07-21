import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

const BASE_URL =
  "https://api.tecnologiasadministrativas.com/api";

let AUTH_TOKEN: string | null = null;

type UnauthorizedHandler = () => void;

let onUnauthorizedCb: UnauthorizedHandler | null =
  null;

/* =========================
   TOKEN
========================= */

function getAuthToken(): string | null {
  if (AUTH_TOKEN) {
    return AUTH_TOKEN;
  }

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (token) {
      AUTH_TOKEN = token;
    }

    return token;
  }

  return null;
}

export function setAuthToken(
  token: string | null
): void {
  AUTH_TOKEN = token;

  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }
}

export function onUnauthorized(
  handler: UnauthorizedHandler
): void {
  onUnauthorizedCb = handler;
}

/* =========================
   AXIOS CLIENT
========================= */

const axiosClient: AxiosInstance =
  axios.create({
    baseURL: BASE_URL,
    timeout: 60000,
    withCredentials: false,

    headers: {
      Accept: "application/json",
    },
  });

/* =========================
   REQUEST
========================= */

axiosClient.interceptors.request.use(
  (
    config: InternalAxiosRequestConfig
  ) => {
    const token = getAuthToken();

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    /*
     * FormData necesita que el navegador genere:
     * multipart/form-data; boundary=...
     */
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }

    return config;
  },

  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE ERRORS
========================= */

axiosClient.interceptors.response.use(
  (response) => response,

  (error: AxiosError<unknown>) => {
    const status = error.response?.status;

    if (status === 401 || status === 419) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }

      AUTH_TOKEN = null;

      if (onUnauthorizedCb) {
        onUnauthorizedCb();
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;