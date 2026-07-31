import axios, {
  AxiosError,
} from "axios";

import axiosClient from "./axiosClient";

import {
  TaecontaTimbradoDetalleResponse,
  TaecontaTimbradosParams,
  TaecontaTimbradosResponse,
  TimbrarCompraTaecontaPayload,
  TimbrarCfdiTaecontaResponse,
  TaecontaFacturaPreviewResponse,
} from "../types/taecontaTimbrado";

const BASE_URL = "/superadmin/taeconta";

/**
 * Obtiene el mensaje contenido dentro de una respuesta Blob.
 *
 * Cuando se solicita un PDF con responseType "blob",
 * los errores JSON del backend también llegan como Blob.
 */
async function extractBlobErrorMessage(
  error: unknown,
  fallback: string,
): Promise<string> {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error
      ? error.message
      : fallback;
  }

  const axiosError =
    error as AxiosError<unknown>;

  const responseData =
    axiosError.response?.data;

  if (responseData instanceof Blob) {
    try {
      const text =
        await responseData.text();

      if (!text.trim()) {
        return fallback;
      }

      try {
        const parsed = JSON.parse(
          text,
        ) as {
          message?: string;
          errors?: Record<
            string,
            string[]
          >;
        };

        if (
          typeof parsed.message ===
            "string" &&
          parsed.message.trim() !== ""
        ) {
          return parsed.message;
        }

        const firstError =
          parsed.errors
            ? Object.values(
                parsed.errors,
              )[0]?.[0]
            : null;

        if (firstError) {
          return firstError;
        }
      } catch {
        return text
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 300) || fallback;
      }
    } catch {
      return fallback;
    }
  }

  if (
    responseData &&
    typeof responseData === "object"
  ) {
    const data =
      responseData as {
        message?: string;
        errors?: Record<
          string,
          string[]
        >;
      };

    if (
      typeof data.message ===
        "string" &&
      data.message.trim() !== ""
    ) {
      return data.message;
    }

    const firstError =
      data.errors
        ? Object.values(
            data.errors,
          )[0]?.[0]
        : null;

    if (firstError) {
      return firstError;
    }
  }

  return (
    axiosError.message ||
    fallback
  );
}

/**
 * Lista los procesos de timbrado.
 */
export async function obtenerTimbradosTaeconta(
  params: TaecontaTimbradosParams = {},
): Promise<TaecontaTimbradosResponse> {
  const response =
    await axiosClient.get<TaecontaTimbradosResponse>(
      `${BASE_URL}/timbrados`,
      {
        params: {
          page: params.page,
          per_page:
            params.per_page,
          search:
            params.search?.trim() ||
            undefined,
          estatus:
            params.estatus ||
            undefined,
          fecha_desde:
            params.fecha_desde ||
            undefined,
          fecha_hasta:
            params.fecha_hasta ||
            undefined,
        },
      },
    );

  return response.data;
}

/**
 * Obtiene el detalle de un proceso de timbrado.
 */
export async function obtenerTimbradoTaeconta(
  id: number,
): Promise<TaecontaTimbradoDetalleResponse> {
  const response =
    await axiosClient.get<TaecontaTimbradoDetalleResponse>(
      `${BASE_URL}/timbrados/${id}`,
    );

  return response.data;
}

/**
 * Obtiene la información fiscal previa al timbrado.
 */
export async function obtenerPrevisualizacionFacturaTaeconta(
  historialClienteId: number,
): Promise<TaecontaFacturaPreviewResponse> {
  const response =
    await axiosClient.get<TaecontaFacturaPreviewResponse>(
      `${BASE_URL}/historial-clientes/${historialClienteId}/previsualizacion`,
    );

  return response.data;
}

/**
 * Genera y timbra el CFDI de un movimiento.
 */
export async function timbrarCompraTaeconta(
  payload: TimbrarCompraTaecontaPayload,
): Promise<TimbrarCfdiTaecontaResponse> {
  const response =
    await axiosClient.post<TimbrarCfdiTaecontaResponse>(
      `${BASE_URL}/timbrar`,
      {
        historial_cliente_id:
          payload.historial_cliente_id,

        uso_cfdi:
          payload.uso_cfdi
            ?.trim()
            .toUpperCase() ||
          "G03",

        /*
         * Este flujo trabaja únicamente con PUE.
         */
        metodo_pago: "PUE",

        forma_pago:
          payload.forma_pago
            ?.trim() ||
          "03",
      },
    );

  return response.data;
}

/**
 * Obtiene el PDF fiscal directamente desde el proxy Laravel.
 *
 * No descarga ni almacena el archivo. Devuelve un Blob para
 * crear una URL temporal y mostrarlo dentro de un iframe.
 */
export async function obtenerFacturaPdfTaeconta(
  historialClienteId: number,
): Promise<Blob> {
  try {
    const response =
      await axiosClient.get<Blob>(
        `${BASE_URL}/historial-clientes/${historialClienteId}/factura/pdf`,
        {
          responseType: "blob",
          headers: {
            Accept:
              "application/pdf",
          },
        },
      );

    const blob =
      response.data;

    if (
      !(blob instanceof Blob) ||
      blob.size === 0
    ) {
      throw new Error(
        "El servidor devolvió un PDF vacío.",
      );
    }

    const contentType =
      String(
        response.headers[
          "content-type"
        ] ??
          blob.type ??
          "",
      ).toLowerCase();

    /*
     * Laravel ya valida la firma PDF.
     * Aquí se conserva una validación adicional del cliente.
     */
    if (
      contentType &&
      !contentType.includes(
        "application/pdf",
      )
    ) {
      const possibleMessage =
        await blob.text();

      try {
        const parsed = JSON.parse(
          possibleMessage,
        ) as {
          message?: string;
        };

        throw new Error(
          parsed.message ||
            "El servidor no devolvió un PDF válido.",
        );
      } catch (parseError) {
        if (
          parseError instanceof Error &&
          parseError.message !==
            "Unexpected end of JSON input"
        ) {
          throw parseError;
        }

        throw new Error(
          "El servidor no devolvió un PDF válido.",
        );
      }
    }

    return blob.type ===
      "application/pdf"
      ? blob
      : new Blob(
          [blob],
          {
            type: "application/pdf",
          },
        );
  } catch (error) {
    const message =
      await extractBlobErrorMessage(
        error,
        "No fue posible obtener el PDF de la factura.",
      );

    throw new Error(message);
  }
}

/**
 * Obtiene el XML fiscal directamente desde el proxy Laravel.
 *
 * Se devuelve como texto para mostrarlo dentro del panel.
 */
export async function obtenerFacturaXmlTaeconta(
  historialClienteId: number,
): Promise<string> {
  try {
    const response =
      await axiosClient.get<string>(
        `${BASE_URL}/historial-clientes/${historialClienteId}/factura/xml`,
        {
          responseType: "text",

          /*
           * Evita que Axios intente interpretar automáticamente
           * el XML como JSON.
           */
          transformResponse: [
            (data) => data,
          ],

          headers: {
            Accept:
              "application/xml,text/xml,text/plain",
          },
        },
      );

    const content =
      typeof response.data ===
      "string"
        ? response.data
        : String(
            response.data ?? "",
          );

    if (!content.trim()) {
      throw new Error(
        "El servidor devolvió un XML vacío.",
      );
    }

    const normalized =
      content
        .replace(
          /^\uFEFF/,
          "",
        )
        .trimStart();

    const looksLikeXml =
      normalized.startsWith(
        "<?xml",
      ) ||
      normalized.includes(
        "<cfdi:Comprobante",
      ) ||
      normalized.includes(
        "<Comprobante",
      );

    if (!looksLikeXml) {
      try {
        const parsed = JSON.parse(
          normalized,
        ) as {
          message?: string;
        };

        throw new Error(
          parsed.message ||
            "El servidor no devolvió un XML válido.",
        );
      } catch (parseError) {
        if (
          parseError instanceof Error &&
          !parseError.message.includes(
            "JSON",
          )
        ) {
          throw parseError;
        }

        throw new Error(
          "El servidor no devolvió un XML válido.",
        );
      }
    }

    return content;
  } catch (error) {
    if (
      error instanceof Error &&
      !axios.isAxiosError(error)
    ) {
      throw error;
    }

    const message =
      await extractBlobErrorMessage(
        error,
        "No fue posible obtener el XML de la factura.",
      );

    throw new Error(message);
  }
}