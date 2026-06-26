import axios, { AxiosInstance } from "axios";

const BASE_URL = "https://mitiendaenlineamx.com.mx/api";

const EXTERNAL_TOKEN = "tecnologiaseladA1-";

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
  config.headers.Authorization = `Bearer ${EXTERNAL_TOKEN}`;
  return config;
});

export default miTiendaExternalClient;