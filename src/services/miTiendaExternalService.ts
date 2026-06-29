import axios from "axios";
import axiosClient from "./axiosClient";

export type Id = number | string;

export type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

export type TiendaExternal = {
  id: Id;
  nombre?: string | null;
  name?: string | null;
  slug?: string | null;
  email?: string | null;
  telefono?: string | null;
  phone_number?: string | null;
  estado?: string | null;
  is_active?: boolean;
  created_at?: string | null;
  fecha_creacion?: string | null;
  plan?: PlanTienda | null;
  datos_fiscales?: DatosFiscalesTienda | null;
  taeconta?: TaecontaTienda | null;
};

export type DatosPersonalesTienda = {
  id?: Id;
  slug: string;
  email: string;
  phone_number: string;
};

export type DatosFiscalesTienda = {
  id?: Id;
  rfc: string;
  razon_social: string;
  codigo_postal_fiscal: string;
  domicilio_fiscal?: string;
  regimen_fiscal: string;
};

export type TaecontaTienda = {
  id?: Id;
  email?: string | null;
  correo?: string | null;
  correo_tae?: string | null;
  taeconta_email?: string | null;
  password?: string | null;
  contrasena?: string | null;
  contra_tae?: string | null;
  taeconta_password?: string | null;
  has_access?: boolean;
  exists?: boolean;
  message?: string;
};

export type TaecontaForm = {
  email: string;
  password: string;
};

export type PlanTienda = {
  id?: Id;
  plan_id?: Id;
  nombre?: string | null;
  nombre_plan?: string | null;
  plan?: string | null;
  fecha_vencimiento?: string | null;
  vence?: string | null;
  expires_at?: string | null;
  estado?: string | null;
  productos_registrados?: number | null;
  productos_count?: number | null;
  limite_productos?: number | null;
  limite_permitido?: number | null;
  dentro_del_rango?: boolean | null;
};

const TIENDAS_ENDPOINT = "/external/tiendas";

function unwrap<T>(data: any): T {
  return (data?.data ?? data) as T;
}

function unwrapList<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.tiendas)) return data.tiendas;
  return [];
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const errors = error.response?.data?.errors;

    if (errors) {
      const firstError = Object.values(errors).flat()[0];
      if (firstError) return firstError;
    }

    return (
      error.response?.data?.message ||
      error.message ||
      "Error en la petición."
    );
  }

  return "Error inesperado.";
}

export async function getTiendasExternal(): Promise<TiendaExternal[]> {
  const response = await axiosClient.get(TIENDAS_ENDPOINT);
  return unwrapList<TiendaExternal>(response.data);
}

export async function getDetalleTiendaExternal(id: Id): Promise<TiendaExternal> {
  const response = await axiosClient.get(`${TIENDAS_ENDPOINT}/${id}`);
  return unwrap<TiendaExternal>(response.data);
}

export async function getDatosPersonalesTienda(
  id: Id
): Promise<DatosPersonalesTienda> {
  const response = await axiosClient.get(
    `${TIENDAS_ENDPOINT}/${id}/datos-personales`
  );

  const data: any = unwrap(response.data);

  return {
    id: data.id,
    slug: data.slug ?? "",
    email: data.email ?? "",
    phone_number: data.phone_number ?? data.telefono ?? "",
  };
}

export async function updateDatosPersonalesTienda(
  id: Id,
  payload: DatosPersonalesTienda
): Promise<DatosPersonalesTienda> {
  const response = await axiosClient.put(
    `${TIENDAS_ENDPOINT}/${id}/datos-personales`,
    {
      slug: payload.slug,
      email: payload.email,
      phone_number: payload.phone_number,
    }
  );

  return unwrap<DatosPersonalesTienda>(response.data);
}

export async function getDatosFiscalesTienda(
  id: Id
): Promise<DatosFiscalesTienda> {
  const response = await axiosClient.get(
    `${TIENDAS_ENDPOINT}/${id}/datos-fiscales`
  );

  const data: any = unwrap(response.data);

  return {
    id: data.id,
    rfc: data.rfc ?? "",
    razon_social: data.razon_social ?? "",
    codigo_postal_fiscal:
      data.codigo_postal_fiscal ??
      data.codigo_postal ??
      data.cp_fiscal ??
      data.domicilio_fiscal ??
      "",
    domicilio_fiscal:
      data.domicilio_fiscal ??
      data.codigo_postal_fiscal ??
      data.codigo_postal ??
      "",
    regimen_fiscal: data.regimen_fiscal ?? "",
  };
}

export async function updateDatosFiscalesTienda(
  id: Id,
  payload: DatosFiscalesTienda
): Promise<DatosFiscalesTienda> {
  const response = await axiosClient.put(
    `${TIENDAS_ENDPOINT}/${id}/datos-fiscales`,
    {
      rfc: payload.rfc,
      razon_social: payload.razon_social,
      codigo_postal_fiscal: payload.codigo_postal_fiscal,
      domicilio_fiscal:
        payload.domicilio_fiscal || payload.codigo_postal_fiscal,
      regimen_fiscal: payload.regimen_fiscal,
    }
  );

  return unwrap<DatosFiscalesTienda>(response.data);
}

export async function getTaecontaTienda(id: Id): Promise<TaecontaForm> {
  const response = await axiosClient.get(`${TIENDAS_ENDPOINT}/${id}/taeconta`);
  const data: any = unwrap(response.data);

  return {
    email:
      data.email ??
      data.correo ??
      data.correo_tae ??
      data.taeconta_email ??
      "",
    password:
      data.password ??
      data.contrasena ??
      data.contra_tae ??
      data.taeconta_password ??
      "",
  };
}

export async function updateTaecontaTienda(
  id: Id,
  payload: TaecontaForm
): Promise<TaecontaTienda> {
  const response = await axiosClient.put(`${TIENDAS_ENDPOINT}/${id}/taeconta`, {
    email: payload.email,
    password: payload.password,
    correo_tae: payload.email,
    correo: payload.email,
    contrasena: payload.password,
    contra_tae: payload.password,
  });

  return unwrap<TaecontaTienda>(response.data);
}

export async function getPlanTienda(id: Id): Promise<PlanTienda> {
  const response = await axiosClient.get(`${TIENDAS_ENDPOINT}/${id}/plan`);
  return unwrap<PlanTienda>(response.data);
}