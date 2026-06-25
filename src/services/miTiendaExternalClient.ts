import axios, { AxiosInstance } from "axios";

const BASE_URL = "https://mitiendaenlineamx.com.mx/api";

const EXTERNAL_TOKEN = import.meta.env.VITE_MITIENDA_EXTERNAL_TOKEN;

const miTiendaExternalClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

miTiendaExternalClient.interceptors.request.use((config) => {
  if (EXTERNAL_TOKEN) {
    config.headers.Authorization = `Bearer ${EXTERNAL_TOKEN}`;
  }

  return config;
});

export default miTiendaExternalClient;