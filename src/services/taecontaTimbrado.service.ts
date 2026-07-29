import axiosClient from "./axiosClient";
import {
  TaecontaTimbradoDetalleResponse,
  TaecontaTimbradosParams,
  TaecontaTimbradosResponse,
  TimbrarCfdiTaecontaPayload,
  TimbrarCfdiTaecontaResponse,
} from "../types/taecontaTimbrado";

const BASE_URL = "/superadmin/taeconta";

export async function obtenerTimbradosTaeconta(
  params: TaecontaTimbradosParams = {}
): Promise<TaecontaTimbradosResponse> {
  const response = await axiosClient.get<TaecontaTimbradosResponse>(
    `${BASE_URL}/timbrados`,
    {
      params: {
        page: params.page,
        per_page: params.per_page,
        search: params.search?.trim() || undefined,
        estatus: params.estatus || undefined,
        fecha_desde: params.fecha_desde || undefined,
        fecha_hasta: params.fecha_hasta || undefined,
      },
    }
  );

  return response.data;
}

export async function obtenerTimbradoTaeconta(
  id: number
): Promise<TaecontaTimbradoDetalleResponse> {
  const response =
    await axiosClient.get<TaecontaTimbradoDetalleResponse>(
      `${BASE_URL}/timbrados/${id}`
    );

  return response.data;
}

export async function timbrarCfdiTaeconta(
  payload: TimbrarCfdiTaecontaPayload
): Promise<TimbrarCfdiTaecontaResponse> {
  const response = await axiosClient.post<TimbrarCfdiTaecontaResponse>(
    `${BASE_URL}/timbrar`,
    payload
  );

  return response.data;
}