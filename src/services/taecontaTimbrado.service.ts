import axiosClient from "./axiosClient";
import {
  TaecontaTimbradoDetalleResponse,
  TaecontaTimbradosParams,
  TaecontaTimbradosResponse,
  TimbrarCompraTaecontaPayload,
  TimbrarCfdiTaecontaResponse,
  TaecontaFacturaPreviewResponse
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

export async function timbrarCompraTaeconta(
  payload: TimbrarCompraTaecontaPayload
): Promise<TimbrarCfdiTaecontaResponse> {
  const response = await axiosClient.post<TimbrarCfdiTaecontaResponse>(
    `${BASE_URL}/timbrar`,
    {
      historial_cliente_id: payload.historial_cliente_id,
      uso_cfdi: payload.uso_cfdi?.trim().toUpperCase() || "G03",
      metodo_pago: payload.metodo_pago || "PUE",
      forma_pago: payload.forma_pago?.trim() || undefined,
    }
  );

  return response.data;
}
export async function obtenerPrevisualizacionFacturaTaeconta(
  historialClienteId: number
): Promise<TaecontaFacturaPreviewResponse> {
  const response =
    await axiosClient.get<TaecontaFacturaPreviewResponse>(
      `${BASE_URL}/historial-clientes/${historialClienteId}/previsualizacion`
    );

  return response.data;
}