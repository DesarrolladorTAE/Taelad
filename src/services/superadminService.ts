import axios from "axios";
import axiosClient from "./axiosClient";

const API_URL =
  "https://api.tecnologiasadministrativas.com/api";

function headers() {
  const token =
    localStorage.getItem("TOKEN") ||
    localStorage.getItem("token") ||
    localStorage.getItem("AUTH_TOKEN");

  return {
    Accept: "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
}

// =========================
// TAECONTA
// =========================

export const getEmpresasTaeconta = async () => {
  const res = await axiosClient.get(
    "/superadmin/taeconta/empresas",
  );

  return res.data;
};

// =========================
// TAECONTA EMPRESAS
// =========================

export async function fetchTaecontaEmpresas(
  page = 1,
) {
  const res = await axiosClient.get(
    "/taeconta/empresas",
    {
      params: {
        page,
      },
    },
  );

  return res.data;
}

// =========================
// DASHBOARD
// =========================

export async function getSuperAdminDashboard() {
  const res = await axios.get(
    `${API_URL}/superadmin/dashboard`,
    {
      headers: headers(),
    },
  );

  return res.data;
}

// =========================
// SYSTEMS
// =========================

export async function getSuperAdminSystems() {
  const res = await axios.get(
    `${API_URL}/superadmin/systems`,
    {
      headers: headers(),
    },
  );

  return res.data;
}

// =========================
// USERS
// =========================

export type GetSuperAdminUsersParams = {
  page?: number;
  perPage?: number;
  search?: string;
  role?: number | string;
};

export async function getSuperAdminUsers(
  params: GetSuperAdminUsersParams = {},
) {
  const {
    page = 1,
    perPage = 16,
    search,
    role,
  } = params;

  const res = await axiosClient.get(
    "/superadmin/users",
    {
      params: {
        page,
        per_page: perPage,
        search: search?.trim() || undefined,
        role: role || undefined,
      },
    },
  );

  return res.data;
}

// =========================
// CREATE USER
// =========================

export async function createUser(data: any) {
  try {
    const res = await axiosClient.post(
      "/superadmin/users",
      data,
    );

    return res.data;
  } catch (error: any) {
    console.error(
      "CREATE USER ERROR:",
      error.response?.data || error,
    );

    throw error;
  }
}

// =========================
// UPDATE USER
// =========================

export async function updateUser(
  id: number,
  data: any,
) {
  try {
    const res = await axiosClient.put(
      `/superadmin/users/${id}`,
      data,
    );

    return res.data;
  } catch (error: any) {
    console.error(
      "UPDATE USER ERROR:",
      error.response?.data || error,
    );

    throw error;
  }
}

// =========================
// DELETE USER
// =========================

export async function deleteUser(id: number) {
  try {
    const res = await axiosClient.delete(
      `/superadmin/users/${id}`,
    );

    return res.data;
  } catch (error: any) {
    console.error(
      "DELETE USER ERROR:",
      error.response?.data || error,
    );

    throw error;
  }
}

// =========================
// CÓDIGO ESPECIAL
// =========================

export type AsignarCodigoEspecialPayload = {
  codigo_ref: string;
  aplica_comision: boolean;
};

export async function asignarCodigoEspecial(
  userId: number,
  data: AsignarCodigoEspecialPayload,
) {
  try {
    const payload: AsignarCodigoEspecialPayload = {
      codigo_ref: data.codigo_ref
        .trim()
        .toUpperCase(),
      aplica_comision: Boolean(
        data.aplica_comision,
      ),
    };

    const res = await axiosClient.post(
      `/superadmin/users/${userId}/codigo-ref-especial`,
      payload,
    );

    return res.data;
  } catch (error: any) {
    console.error(
      "ASIGNAR CODIGO ESPECIAL ERROR:",
      error.response?.data || error,
    );

    throw error;
  }
}

// =========================
// ADMINISTRATORS - LEGACY
// =========================

export async function getSuperAdminAdministrators() {
  const res = await axios.get(
    `${API_URL}/superadmin/administrators`,
    {
      headers: headers(),
    },
  );

  return res.data;
}

// =========================
// SERVICE CATEGORIES
// =========================

export type SuperAdminServiceCategory = {
  id: number;
  nombre: string;
  slug: string;
  productos_count: number;
  created_at: string | null;
  updated_at: string | null;
};

export type ServiceCategoryPayload = {
  nombre: string;
};

export type SuperAdminServiceCategoriesResponse = {
  message: string;
  data: SuperAdminServiceCategory[];
};

export type SuperAdminServiceCategoryResponse = {
  message: string;
  data: SuperAdminServiceCategory;
};

export type SuperAdminServiceCategoryDeleteProduct = {
  id: number;
  name: string;
  categoria_id: number | null;
};

export type SuperAdminServiceCategoryDeletePreview = {
  categoria: SuperAdminServiceCategory;
  productos_count: number;
  productos: SuperAdminServiceCategoryDeleteProduct[];
};

export type SuperAdminServiceCategoryDeletePreviewResponse = {
  message: string;
  data: SuperAdminServiceCategoryDeletePreview;
};

export type DeleteSuperAdminServiceCategoryResponse = {
  message: string;
  data: {
    productos_desvinculados: number;
  };
};

export async function getSuperAdminServiceCategories(): Promise<SuperAdminServiceCategoriesResponse> {
  const response = await axiosClient.get(
    "/superadmin/service-categories",
  );

  return response.data;
}

export async function createSuperAdminServiceCategory(
  data: ServiceCategoryPayload,
): Promise<SuperAdminServiceCategoryResponse> {
  const response = await axiosClient.post(
    "/superadmin/service-categories",
    data,
  );

  return response.data;
}

export async function updateSuperAdminServiceCategory(
  id: number | string,
  data: ServiceCategoryPayload,
): Promise<SuperAdminServiceCategoryResponse> {
  const response = await axiosClient.put(
    `/superadmin/service-categories/${id}`,
    data,
  );

  return response.data;
}

export async function getSuperAdminServiceCategoryDeletePreview(
  id: number | string,
): Promise<SuperAdminServiceCategoryDeletePreviewResponse> {
  const response = await axiosClient.get(
    `/superadmin/service-categories/${id}/delete-preview`,
  );

  return response.data;
}

export async function deleteSuperAdminServiceCategory(
  id: number | string,
): Promise<DeleteSuperAdminServiceCategoryResponse> {
  const response = await axiosClient.delete(
    `/superadmin/service-categories/${id}`,
    {
      data: {
        confirmar: true,
      },
    },
  );

  return response.data;
}
// =========================
// SERVICES
// =========================

export type SuperAdminService = {
  id: number;
  name: string;
  descripcion: string | null;
  categoria_id: number | null;
  categoria: SuperAdminServiceCategory | null;
  precio: number | string;
  clave_producto: string | null;
  clave_unidad: string | null;
  url_imagen: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type SuperAdminServiceResponse = {
  message: string;
  data: SuperAdminService;
};

export type DeleteSuperAdminServiceResponse = {
  message: string;
  data: {
    id: number;
    categoria_id: number | null;
  };
};

export type GetSuperAdminServicesParams = {
  page?: number;
  perPage?: number;
  search?: string;
  categoriaId?: number | string;
};

export async function getSuperAdminServices(
  params: GetSuperAdminServicesParams = {},
) {
  const {
    page = 1,
    perPage = 16,
    search,
    categoriaId,
  } = params;

  const response = await axiosClient.get(
    "/superadmin/services",
    {
      params: {
        page,
        per_page: perPage,
        search: search?.trim() || undefined,
        categoria_id:
          categoriaId !== undefined &&
          categoriaId !== null &&
          categoriaId !== "" &&
          categoriaId !== "todos"
            ? categoriaId
            : undefined,
      },
    },
  );

  return response.data;
}

export async function createSuperAdminService(
  data: FormData,
): Promise<SuperAdminServiceResponse> {
  const response = await axiosClient.post(
    "/superadmin/services",
    data,
  );

  return response.data;
}

export async function updateSuperAdminService(
  id: number | string,
  data: FormData,
): Promise<SuperAdminServiceResponse> {
  data.set("_method", "PUT");

  const response = await axiosClient.post(
    `/superadmin/services/${id}`,
    data,
  );

  return response.data;
}

export async function deleteSuperAdminService(
  id: number | string,
): Promise<DeleteSuperAdminServiceResponse> {
  const response = await axiosClient.delete(
    `/superadmin/services/${id}`,
  );

  return response.data;
}
// =========================
// PAYMENT METHODS
// =========================

export type SuperAdminPaymentMethod = {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  activo: boolean;
  historiales_count: number;
  created_at: string | null;
  updated_at: string | null;
};

export type SuperAdminPaymentMethodPayload = {
  nombre: string;
  descripcion?: string | null;
  activo?: boolean;
};

export type SuperAdminPaymentMethodsResponse = {
  message: string;
  data: SuperAdminPaymentMethod[];
};

export type SuperAdminPaymentMethodResponse = {
  message: string;
  data: SuperAdminPaymentMethod;
};

export async function getSuperAdminPaymentMethods(
  onlyActive = false,
): Promise<SuperAdminPaymentMethodsResponse> {
  const response = await axiosClient.get(
    "/superadmin/payment-methods",
    {
      params: {
        solo_activos: onlyActive
          ? 1
          : undefined,
      },
    },
  );

  return response.data;
}

export async function createSuperAdminPaymentMethod(
  data: SuperAdminPaymentMethodPayload,
): Promise<SuperAdminPaymentMethodResponse> {
  const response = await axiosClient.post(
    "/superadmin/payment-methods",
    {
      nombre: data.nombre.trim(),
      descripcion:
        data.descripcion?.trim() || null,
      activo:
        data.activo === undefined
          ? true
          : Boolean(data.activo),
    },
  );

  return response.data;
}

export async function updateSuperAdminPaymentMethod(
  id: number | string,
  data: Pick<
    SuperAdminPaymentMethodPayload,
    "nombre" | "descripcion"
  >,
): Promise<SuperAdminPaymentMethodResponse> {
  const response = await axiosClient.put(
    `/superadmin/payment-methods/${id}`,
    {
      nombre: data.nombre.trim(),
      descripcion:
        data.descripcion?.trim() || null,
    },
  );

  return response.data;
}

export async function updateSuperAdminPaymentMethodStatus(
  id: number | string,
  activo: boolean,
): Promise<SuperAdminPaymentMethodResponse> {
  const response = await axiosClient.patch(
    `/superadmin/payment-methods/${id}/status`,
    {
      activo,
    },
  );

  return response.data;
}

export async function deleteSuperAdminPaymentMethod(
  id: number | string,
): Promise<{ message: string }> {
  const response = await axiosClient.delete(
    `/superadmin/payment-methods/${id}`,
  );

  return response.data;
}

// =========================
// CLIENT HISTORY
// =========================

export type ClientHistoryPeriod =
  | "mes"
  | "anio";

export type ClientHistoryStatus =
  | "pendiente"
  | "pagado"
  | "cancelado"
  | "vencido"
  | "reembolsado";

export type ClientHistoryClient = {
  id: number;
  name: string | null;
  apellidos: string | null;
  email: string | null;
  phone: string | null;
};

export type ClientHistoryProduct = {
  id: number;
  name: string;
  descripcion: string | null;
  categoria_id: number | null;
  precio: number | string;
  url_imagen: string | null;
};

export type ClientHistoryRecord = {
  id: number;
  cliente_id: number;
  producto_id: number | null;
  metodo_pago_id: number;
  producto_nombre: string;
  tipo_producto: string | null;
  concepto: string | null;
  cantidad: number | string;
  precio_unitario: number | string;
  importe: number | string;
  status: ClientHistoryStatus;
  fecha_operacion: string;
  folio: string | null;
  uuid_fiscal: string | null;
  factura_pdf: string | null;
  factura_xml: string | null;
  observaciones: string | null;
  pdf_disponible: boolean;
  factura_pdf_disponible: boolean;
  xml_disponible: boolean;
  cliente: ClientHistoryClient;
  producto: ClientHistoryProduct | null;
  metodo_pago: SuperAdminPaymentMethod;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
};

export type ClientHistorySummary = {
  registros: number;
  cantidad_total: number;
  importe_total: number;
  importe_pagado: number;
  importe_pendiente: number;
  importe_cancelado: number;
  importe_vencido: number;
  importe_reembolsado: number;
};

export type ClientHistoryMonthlySummary = {
  mes: number;
  nombre: string;
  registros: number;
  cantidad_total: number;
  importe_total: number;
};

export type ClientHistoryPagination = {
  current_page: number;
  data: ClientHistoryRecord[];
  first_page_url: string | null;
  from: number | null;
  last_page: number;
  last_page_url: string | null;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
};

export type GetClientHistoryParams = {
  clienteId?: number | string;
  periodo?: ClientHistoryPeriod;
  anio?: number;
  mes?: number;
  status?: ClientHistoryStatus | "";
  search?: string;
  page?: number;
  perPage?: number;
};

export type GetClientHistoryResponse = {
  message: string;
  data: {
    periodo: {
      tipo: ClientHistoryPeriod;
      anio: number;
      mes: number | null;
    };
    summary: ClientHistorySummary;
    monthly_summary: ClientHistoryMonthlySummary[];
    records: ClientHistoryPagination;
  };
};

export type CreateClientHistoryPayload = {
  cliente_id: number;
  producto_id: number;
  metodo_pago_id: number;
  concepto?: string | null;
  cantidad: number;
  precio_unitario?: number | null;
  status: ClientHistoryStatus;
  fecha_operacion: string;
  folio?: string | null;
  uuid_fiscal?: string | null;
  observaciones?: string | null;
};

export type ClientHistoryRecordResponse = {
  message: string;
  data: ClientHistoryRecord;
};

export type ClientHistoryClientSearchItem = {
  id: number;
  name: string | null;
  apellidos: string | null;
  email: string | null;
  phone: string | null;
};

export type ClientHistoryProductSearchItem = {
  id: number;
  name: string;
  precio: number | string;
  descripcion: string | null;
  categoria_id: number | null;
  url_imagen: string | null;
};

export type ClientHistoryClientSearchResponse = {
  message: string;
  data: ClientHistoryClientSearchItem[];
};

export type ClientHistoryProductSearchResponse = {
  message: string;
  data: ClientHistoryProductSearchItem[];
};

export async function searchSuperAdminClientHistoryClients(
  query: string,
): Promise<ClientHistoryClientSearchResponse> {
  const q = query.trim();

  if (q.length < 3) {
    return {
      message:
        "Escribe al menos 3 caracteres.",
      data: [],
    };
  }

  const response = await axiosClient.get(
    "/superadmin/client-history/search-clients",
    {
      params: {
        q,
      },
    },
  );

  return response.data;
}

export async function searchSuperAdminClientHistoryProducts(
  query: string,
): Promise<ClientHistoryProductSearchResponse> {
  const q = query.trim();

  if (q.length < 3) {
    return {
      message:
        "Escribe al menos 3 caracteres.",
      data: [],
    };
  }

  const response = await axiosClient.get(
    "/superadmin/client-history/search-products",
    {
      params: {
        q,
      },
    },
  );

  return response.data;
}

export async function getSuperAdminClientHistory(
  params: GetClientHistoryParams = {},
): Promise<GetClientHistoryResponse> {
  const {
    clienteId,
    periodo = "mes",
    anio,
    mes,
    status,
    search,
    page = 1,
    perPage = 16,
  } = params;

  const response = await axiosClient.get(
    "/superadmin/client-history",
    {
      params: {
        cliente_id:
          clienteId !== undefined &&
          clienteId !== null &&
          clienteId !== ""
            ? clienteId
            : undefined,
        periodo,
        anio,
        mes:
          periodo === "mes"
            ? mes
            : undefined,
        status: status || undefined,
        search: search?.trim() || undefined,
        page,
        per_page: perPage,
      },
    },
  );

  return response.data;
}

export async function createSuperAdminClientHistory(
  data: CreateClientHistoryPayload,
): Promise<ClientHistoryRecordResponse> {
  const response = await axiosClient.post(
    "/superadmin/client-history",
    {
      ...data,
      concepto:
        data.concepto?.trim() || null,
      folio: data.folio?.trim() || null,
      uuid_fiscal:
        data.uuid_fiscal?.trim() || null,
      observaciones:
        data.observaciones?.trim() || null,
      precio_unitario:
        data.precio_unitario ?? undefined,
    },
  );

  return response.data;
}

export async function getSuperAdminClientHistoryById(
  id: number | string,
): Promise<ClientHistoryRecordResponse> {
  const response = await axiosClient.get(
    `/superadmin/client-history/${id}`,
  );

  return response.data;
}

export async function uploadSuperAdminClientHistoryInvoicePdf(
  id: number | string,
  file: File,
): Promise<{
  message: string;
  data: {
    historial_id: number;
    factura_pdf_disponible: boolean;
  };
}> {
  const formData = new FormData();

  formData.append(
    "factura_pdf",
    file,
  );

  const response = await axiosClient.post(
    `/superadmin/client-history/${id}/invoice-pdf`,
    formData,
  );

  return response.data;
}

export async function uploadSuperAdminClientHistoryXml(
  id: number | string,
  file: File,
): Promise<{
  message: string;
  data: {
    historial_id: number;
    xml_disponible: boolean;
  };
}> {
  const formData = new FormData();

  formData.append(
    "factura_xml",
    file,
  );

  const response = await axiosClient.post(
    `/superadmin/client-history/${id}/xml`,
    formData,
  );

  return response.data;
}

// =========================
// CLIENT HISTORY FILES
// =========================

function ensureBrowser(): void {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined"
  ) {
    throw new Error(
      "Esta acción solo está disponible en el navegador.",
    );
  }
}

function downloadBlob(
  blob: Blob,
  fileName: string,
): void {
  ensureBrowser();

  const url =
    window.URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}

export async function viewSuperAdminClientHistoryPdf(
  id: number | string,
): Promise<Blob> {
  const response = await axiosClient.get(
    `/superadmin/client-history/${id}/pdf/view`,
    {
      responseType: "blob",
      headers: {
        Accept: "application/pdf",
      },
    },
  );

  return response.data;
}

export async function downloadSuperAdminClientHistoryPdf(
  id: number | string,
  fileName?: string,
): Promise<void> {
  const response = await axiosClient.get(
    `/superadmin/client-history/${id}/pdf/download`,
    {
      responseType: "blob",
      headers: {
        Accept: "application/pdf",
      },
    },
  );

  downloadBlob(
    response.data,
    fileName ||
      `comprobante-historial-${id}.pdf`,
  );
}

export async function viewSuperAdminClientHistoryInvoicePdf(
  id: number | string,
): Promise<Blob> {
  const response = await axiosClient.get(
    `/superadmin/client-history/${id}/invoice-pdf/view`,
    {
      responseType: "blob",
      headers: {
        Accept: "application/pdf",
      },
    },
  );

  return response.data;
}

export async function downloadSuperAdminClientHistoryInvoicePdf(
  id: number | string,
  fileName?: string,
): Promise<void> {
  const response = await axiosClient.get(
    `/superadmin/client-history/${id}/invoice-pdf/download`,
    {
      responseType: "blob",
      headers: {
        Accept: "application/pdf",
      },
    },
  );

  downloadBlob(
    response.data,
    fileName ||
      `factura-historial-${id}.pdf`,
  );
}

export async function viewSuperAdminClientHistoryXml(
  id: number | string,
): Promise<string> {
  const response = await axiosClient.get(
    `/superadmin/client-history/${id}/xml/view`,
    {
      responseType: "text",
      transformResponse: [
        (data) => data,
      ],
      headers: {
        Accept:
          "application/xml,text/xml",
      },
    },
  );

  return typeof response.data === "string"
    ? response.data
    : String(response.data ?? "");
}

export async function downloadSuperAdminClientHistoryXml(
  id: number | string,
  fileName?: string,
): Promise<void> {
  const response = await axiosClient.get(
    `/superadmin/client-history/${id}/xml/download`,
    {
      responseType: "blob",
      headers: {
        Accept: "application/xml",
      },
    },
  );

  downloadBlob(
    response.data,
    fileName ||
      `factura-historial-${id}.xml`,
  );


  
}