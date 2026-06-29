import axios from "axios";
import axiosClient from "./axiosClient";

export type TaecontaConfigResponse = {
  id?: number;
  tienda_id?: number;
  email?: string | null;
  password?: string | null;
  correo?: string | null;
  contrasena?: string | null;
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
    email: data?.email ?? data?.correo ?? data?.taeconta_email ?? "",
    password:
      data?.password ?? data?.contrasena ?? data?.taeconta_password ?? "",
  };
}

export function hasTaecontaAccess(
  data: TaecontaConfigResponse | null | undefined
): boolean {
  return Boolean(
    data?.has_access ??
      data?.exists ??
      data?.email ??
      data?.correo ??
      data?.taeconta_email
  );
}

export async function getTaecontaConfigTienda(
  tiendaId: number | string
): Promise<TaecontaConfigResponse> {
  const response = await axiosClient.get<TaecontaConfigResponse>(
    `/external/tiendas/${tiendaId}/taeconta`
  );

  return response.data;
}

export async function updateTaecontaConfigTienda(
  tiendaId: number | string,
  payload: TaecontaConfigForm
): Promise<TaecontaConfigResponse> {
  const response = await axiosClient.put<TaecontaConfigResponse>(
    `/external/tiendas/${tiendaId}/taeconta`,
    {
      email: payload.email,
      password: payload.password,
    }
  );

  return response.data;
}