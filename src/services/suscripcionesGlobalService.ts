import miTiendaExternalClient from "./miTiendaExternalClient";

export const suscripcionesGlobalService = {
  obtenerTiendas: async () => {
    const response = await miTiendaExternalClient.get(
      "/external/suscripciones-global/tiendas"
    );

    return response.data;
  },

  obtenerSuscripcionesPorTienda: async (storeId: number) => {
    const response = await miTiendaExternalClient.get(
      `/external/suscripciones-global/tiendas/${storeId}/suscripciones`
    );

    return response.data;
  },

  agregarSuscripcion: async (payload: any) => {
    const response = await miTiendaExternalClient.post(
      "/external/suscripciones-global/agregar",
      payload
    );

    return response.data;
  },
};