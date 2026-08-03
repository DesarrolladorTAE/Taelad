import axios, {
  AxiosError,
  AxiosResponse,
} from "axios";

import axiosClient from "./axiosClient";

import {
  TaecontaFacturaPreviewResponse,
  TaecontaTimbradoDetalleResponse,
  TaecontaTimbradosParams,
  TaecontaTimbradosResponse,
  TimbrarCompraTaecontaPayload,
  TimbrarCfdiTaecontaResponse,
} from "../types/taecontaTimbrado";

const BASE_URL = "/superadmin/taeconta";

type ApiErrorPayload = {
  message?: string;
  user_message?: string;
  technical_message?: string;
  error?: string;
  error_code?: string | number | null;
  provider?: string | null;
  errors?:
    | Record<string, string[]>
    | string[];
};

function firstValidationError(
  errors?:
    | Record<string, string[]>
    | string[],
): string | null {
  if (!errors) {
    return null;
  }

  if (Array.isArray(errors)) {
    const first = errors.find(
      (message) =>
        typeof message === "string" &&
        message.trim() !== "",
    );

    return first?.trim() || null;
  }

  for (const messages of Object.values(errors)) {
    const first = messages?.find(
      (message) =>
        typeof message === "string" &&
        message.trim() !== "",
    );

    if (first) {
      return first.trim();
    }
  }

  return null;
}

function errorMessageFromPayload(
  payload: unknown,
  fallback: string,
): string {
  if (
    !payload ||
    typeof payload !== "object"
  ) {
    return fallback;
  }

  const data =
    payload as ApiErrorPayload;

  /*
   * Los errores específicos del PAC tienen prioridad sobre
   * el mensaje genérico "Falló timbrado...".
   */
  const validationMessage =
    firstValidationError(
      data.errors,
    );

  if (validationMessage) {
    return validationMessage;
  }

  if (
    typeof data.user_message ===
      "string" &&
    data.user_message.trim() !== ""
  ) {
    return data.user_message.trim();
  }

  if (
    typeof data.technical_message ===
      "string" &&
    data.technical_message.trim() !== ""
  ) {
    return data.technical_message.trim();
  }

  if (
    typeof data.message === "string" &&
    data.message.trim() !== ""
  ) {
    return data.message.trim();
  }

  if (
    typeof data.error === "string" &&
    data.error.trim() !== ""
  ) {
    return data.error.trim();
  }

  return fallback;
}

async function extractRequestErrorMessage(
  error: unknown,
  fallback: string,
): Promise<string> {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error &&
      error.message.trim() !== ""
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
        return errorMessageFromPayload(
          JSON.parse(text),
          fallback,
        );
      } catch {
        const cleanText = text
          .replace(/<style[\s\S]*?<\/style>/gi, " ")
          .replace(/<script[\s\S]*?<\/script>/gi, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        return cleanText
          ? cleanText.slice(0, 300)
          : fallback;
      }
    } catch {
      return fallback;
    }
  }

  return errorMessageFromPayload(
    responseData,
    axiosError.message || fallback,
  );
}

function fileNameFromDisposition(
  disposition: unknown,
  fallback: string,
): string {
  if (
    typeof disposition !== "string" ||
    disposition.trim() === ""
  ) {
    return fallback;
  }

  const utf8Match =
    disposition.match(
      /filename\*\s*=\s*UTF-8''([^;]+)/i,
    );

  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(
        utf8Match[1]
          .trim()
          .replace(/^["']|["']$/g, ""),
      );
    } catch {
      return utf8Match[1]
        .trim()
        .replace(/^["']|["']$/g, "");
    }
  }

  const standardMatch =
    disposition.match(
      /filename\s*=\s*"([^"]+)"/i,
    ) ??
    disposition.match(
      /filename\s*=\s*([^;]+)/i,
    );

  return standardMatch?.[1]
    ? standardMatch[1]
        .trim()
        .replace(/^["']|["']$/g, "")
    : fallback;
}

function triggerBlobDownload(
  blob: Blob,
  fileName: string,
): void {
  const url =
    window.URL.createObjectURL(blob);

  const anchor =
    document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  anchor.style.display = "none";

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 100);
}

function assertNonEmptyBlob(
  blob: Blob,
  message: string,
): void {
  if (
    !(blob instanceof Blob) ||
    blob.size === 0
  ) {
    throw new Error(message);
  }
}

function downloadFileName(
  response: AxiosResponse<Blob>,
  fallback: string,
): string {
  return fileNameFromDisposition(
    response.headers[
      "content-disposition"
    ],
    fallback,
  );
}

/*
|--------------------------------------------------------------------------
| LISTADO Y DETALLE
|--------------------------------------------------------------------------
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

export async function obtenerTimbradoTaeconta(
  id: number,
): Promise<TaecontaTimbradoDetalleResponse> {
  const response =
    await axiosClient.get<TaecontaTimbradoDetalleResponse>(
      `${BASE_URL}/timbrados/${id}`,
    );

  return response.data;
}

/*
|--------------------------------------------------------------------------
| PREVISUALIZACIÓN Y TIMBRADO
|--------------------------------------------------------------------------
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

export async function timbrarCompraTaeconta(
  payload: TimbrarCompraTaecontaPayload,
): Promise<TimbrarCfdiTaecontaResponse> {
  try {
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
           * Este flujo fiscal solamente permite PUE.
           */
          metodo_pago: "PUE",

          forma_pago:
            payload.forma_pago
              ?.trim() ||
            "03",
        },
      );

    return response.data;
  } catch (error) {
    const message =
      await extractRequestErrorMessage(
        error,
        "No fue posible timbrar el CFDI.",
      );

    throw new Error(message);
  }
}

/*
|--------------------------------------------------------------------------
| VISUALIZACIÓN DE DOCUMENTOS
|--------------------------------------------------------------------------
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

    assertNonEmptyBlob(
      response.data,
      "El servidor devolvió un PDF vacío.",
    );

    const contentType = String(
      response.headers[
        "content-type"
      ] ??
        response.data.type ??
        "",
    ).toLowerCase();

    if (
      contentType &&
      !contentType.includes(
        "application/pdf",
      )
    ) {
      const message =
        await extractRequestErrorMessage(
          new AxiosError(
            "Respuesta PDF inválida.",
            undefined,
            undefined,
            undefined,
            response,
          ),
          "El servidor no devolvió un PDF válido.",
        );

      throw new Error(message);
    }

    return response.data.type ===
      "application/pdf"
      ? response.data
      : new Blob(
          [response.data],
          {
            type: "application/pdf",
          },
        );
  } catch (error) {
    const message =
      await extractRequestErrorMessage(
        error,
        "No fue posible obtener el PDF de la factura.",
      );

    throw new Error(message);
  }
}

export async function obtenerFacturaXmlTaeconta(
  historialClienteId: number,
): Promise<string> {
  try {
    const response =
      await axiosClient.get<string>(
        `${BASE_URL}/historial-clientes/${historialClienteId}/factura/xml`,
        {
          responseType: "text",
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
        const parsed =
          JSON.parse(normalized);

        throw new Error(
          errorMessageFromPayload(
            parsed,
            "El servidor no devolvió un XML válido.",
          ),
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
      await extractRequestErrorMessage(
        error,
        "No fue posible obtener el XML de la factura.",
      );

    throw new Error(message);
  }
}

/*
|--------------------------------------------------------------------------
| DESCARGAS CONTROLADAS POR LARAVEL
|--------------------------------------------------------------------------
*/

export async function descargarFacturaPdfTaeconta(
  historialClienteId: number,
): Promise<void> {
  try {
    const response =
      await axiosClient.get<Blob>(
        `${BASE_URL}/historial-clientes/${historialClienteId}/factura/pdf/download`,
        {
          responseType: "blob",
          headers: {
            Accept:
              "application/pdf",
          },
        },
      );

    assertNonEmptyBlob(
      response.data,
      "El servidor devolvió un PDF vacío.",
    );

    const contentType = String(
      response.headers[
        "content-type"
      ] ??
        response.data.type ??
        "",
    ).toLowerCase();

    if (
      contentType &&
      !contentType.includes(
        "application/pdf",
      )
    ) {
      const message =
        await extractRequestErrorMessage(
          new AxiosError(
            "Respuesta PDF inválida.",
            undefined,
            undefined,
            undefined,
            response,
          ),
          "El servidor no devolvió un PDF válido.",
        );

      throw new Error(message);
    }

    const fileName =
      downloadFileName(
        response,
        `factura-${historialClienteId}.pdf`,
      );

    triggerBlobDownload(
      response.data.type ===
        "application/pdf"
        ? response.data
        : new Blob(
            [response.data],
            {
              type: "application/pdf",
            },
          ),
      fileName,
    );
  } catch (error) {
    const message =
      await extractRequestErrorMessage(
        error,
        "No fue posible descargar el PDF de la factura.",
      );

    throw new Error(message);
  }
}

export async function descargarFacturaXmlTaeconta(
  historialClienteId: number,
): Promise<void> {
  try {
    const response =
      await axiosClient.get<Blob>(
        `${BASE_URL}/historial-clientes/${historialClienteId}/factura/xml/download`,
        {
          responseType: "blob",
          headers: {
            Accept:
              "application/xml,text/xml",
          },
        },
      );

    assertNonEmptyBlob(
      response.data,
      "El servidor devolvió un XML vacío.",
    );

    const contentType = String(
      response.headers[
        "content-type"
      ] ??
        response.data.type ??
        "",
    ).toLowerCase();

    if (
      contentType &&
      !contentType.includes("xml")
    ) {
      const message =
        await extractRequestErrorMessage(
          new AxiosError(
            "Respuesta XML inválida.",
            undefined,
            undefined,
            undefined,
            response,
          ),
          "El servidor no devolvió un XML válido.",
        );

      throw new Error(message);
    }

    const fileName =
      downloadFileName(
        response,
        `factura-${historialClienteId}.xml`,
      );

    triggerBlobDownload(
      response.data.type
        ? response.data
        : new Blob(
            [response.data],
            {
              type:
                "application/xml;charset=UTF-8",
            },
          ),
      fileName,
    );
  } catch (error) {
    const message =
      await extractRequestErrorMessage(
        error,
        "No fue posible descargar el XML de la factura.",
      );

    throw new Error(message);
  }
}