import axios from "axios";
import axiosClient from "./axiosClient";

export type TaecontaConfigResponse = {
  id?: number;
  tienda_id?: number;

  email?: string | null;
  password?: string | null;

  correo?: string | null;
  contrasena?: string | null;

  correo_tae?: string | null;
  contra_tae?: string | null;

  taeconta_email?: string | null;
  taeconta_password?: string | null;

  has_access?: boolean;
  exists?: boolean;
  message?: string;
};

export type TaecontaConfigForm = {
  email: string;
  password: string;
};

type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

function unwrap<T>(data: any): T {
  return (data?.data ?? data) as T;
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const errors = error.response?.data?.errors;

    if (errors) {
      const firstError = Object.values(errors).flat()[0];

      if (firstError) {
        return firstError;
      }
    }

    return (
      error.response?.data?.message ||
      error.message ||
      "Error en la petición."
    );
  }

  return "Error inesperado.";
}

export function normalizeTaecontaConfig(
  data: TaecontaConfigResponse | null | undefined
): TaecontaConfigForm {
  return {
    email:
      data?.email ??
      data?.correo ??
      data?.correo_tae ??
      data?.taeconta_email ??
      "",
    password:
      data?.password ??
      data?.contrasena ??
      data?.contra_tae ??
      data?.taeconta_password ??
      "",
  };
}

export function hasTaecontaAccess(
  data: TaecontaConfigResponse | null | undefined
): boolean {
  const normalized = normalizeTaecontaConfig(data);

  return Boolean(
    data?.has_access ||
      data?.exists ||
      normalized.email ||
      normalized.password
  );
}

export async function getTaecontaConfigTienda(
  tiendaId: number | string
): Promise<TaecontaConfigResponse> {
  const response = await axiosClient.get(`/external/tiendas/${tiendaId}/taeconta`);

  return unwrap<TaecontaConfigResponse>(response.data);
}

export async function updateTaecontaConfigTienda(
  tiendaId: number | string,
  payload: TaecontaConfigForm
): Promise<TaecontaConfigResponse> {
  const response = await axiosClient.put(`/external/tiendas/${tiendaId}/taeconta`, {
    email: payload.email,
    password: payload.password,

    correo: payload.email,
    correo_tae: payload.email,
    taeconta_email: payload.email,

    contrasena: payload.password,
    contra_tae: payload.password,
    taeconta_password: payload.password,
  });

  return unwrap<TaecontaConfigResponse>(response.data);
}