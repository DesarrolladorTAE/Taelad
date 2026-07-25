import axios from "axios";
import axiosClient from "./axiosClient";

const API_URL = "https://api.tecnologiasadministrativas.com/api";

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
// SERVICES
// =========================

export type SuperAdminService = {
  id: number;
  name: string;
  descripcion: string | null;
  tipo_product: string;
  precio: number | string;
  url_imagen: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type SuperAdminServicePayload = {
  name: string;
  descripcion: string | null;
  tipo_product: string;
  precio: number;
  url_imagen: string | null;
};

export type GetSuperAdminServicesParams = {
  page?: number;
  perPage?: number;
  search?: string;
  tipoProduct?: string;
};

export async function getSuperAdminServices(
  params: GetSuperAdminServicesParams = {},
) {
  const {
    page = 1,
    perPage = 100,
    search,
    tipoProduct,
  } = params;

  const res = await axiosClient.get(
    "/superadmin/services",
    {
      params: {
        page,
        per_page: perPage,
        search: search?.trim() || undefined,
        tipo_product:
          tipoProduct && tipoProduct !== "todos"
            ? tipoProduct
            : undefined,
      },
    },
  );

  return res.data;
}

export async function createSuperAdminService(
  data: SuperAdminServicePayload,
) {
  const res = await axiosClient.post(
    "/superadmin/services",
    data,
  );

  return res.data;
}

export async function updateSuperAdminService(
  id: number,
  data: SuperAdminServicePayload,
) {
  const res = await axiosClient.put(
    `/superadmin/services/${id}`,
    data,
  );

  return res.data;
}

export async function deleteSuperAdminService(
  id: number,
) {
  const res = await axiosClient.delete(
    `/superadmin/services/${id}`,
  );

  return res.data;
}