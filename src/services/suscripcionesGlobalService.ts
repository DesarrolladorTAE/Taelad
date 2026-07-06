import axios from "axios";

const API_BASE_URL = "https://api.tecnologiasadministrativas.com/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("AUTH_TOKEN") ||
    localStorage.getItem("token") ||
    localStorage.getItem("TOKEN") ||
    localStorage.getItem("auth_token") ||
    localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

function getErrorMessage(error: any, fallback: string): string {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

const SUSCRIPCIONES_GLOBAL_PREFIX =
  "/superadmin/mtelmx/suscripciones-global";

export const suscripcionesGlobalService = {
  obtenerTiendas: async () => {
    try {
      const response = await apiClient.get(
        `${SUSCRIPCIONES_GLOBAL_PREFIX}/tiendas`,
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        getErrorMessage(error, "No fue posible cargar las tiendas."),
      );
    }
  },

  obtenerSuscripcionesPorTienda: async (storeId: number) => {
    try {
      const response = await apiClient.get(
        `${SUSCRIPCIONES_GLOBAL_PREFIX}/tiendas/${storeId}/suscripciones`,
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        getErrorMessage(
          error,
          "No fue posible cargar las suscripciones de la tienda.",
        ),
      );
    }
  },

  agregarSuscripcion: async (payload: any) => {
    try {
      const response = await apiClient.post(
        `${SUSCRIPCIONES_GLOBAL_PREFIX}/agregar`,
        payload,
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        getErrorMessage(error, "No fue posible agregar la suscripción."),
      );
    }
  },
};