import axios from "axios";
import axiosClient from "./axiosClient";

const API_URL = "https://api.tecnologiasadministrativas.com/api";

function headers() {
  const token =
    localStorage.getItem("TOKEN") ||
    localStorage.getItem("token") ||
    localStorage.getItem("AUTH_TOKEN");

  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
}

// =========================
// TAECONTA
// =========================

export const getEmpresasTaeconta = async () => {
  const res = await axiosClient.get(
    "/superadmin/taeconta/empresas"
  );

  return res.data;
};

// =========================
// DASHBOARD
// =========================

export async function getSuperAdminDashboard() {
  const res = await axios.get(
    `${API_URL}/superadmin/dashboard`,
    {
      headers: headers(),
    }
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
    }
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

// LISTAR
export async function getSuperAdminUsers(
  params: GetSuperAdminUsersParams = {}
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
        search: search || undefined,
        role: role || undefined,
      },
    }
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
      data
    );

    return res.data;
  } catch (error: any) {
    console.log(
      "CREATE USER ERROR:",
      error.response?.data
    );

    throw error;
  }
}

// =========================
// UPDATE USER
// =========================

export async function updateUser(
  id: number,
  data: any
) {
  try {
    const res = await axiosClient.put(
      `/superadmin/users/${id}`,
      data
    );

    return res.data;
  } catch (error: any) {
    console.log(
      "UPDATE USER ERROR:",
      error.response?.data
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
      `/superadmin/users/${id}`
    );

    return res.data;
  } catch (error: any) {
    console.log(
      "DELETE USER ERROR:",
      error.response?.data
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
  data: AsignarCodigoEspecialPayload
) {
  try {
    const payload: AsignarCodigoEspecialPayload = {
      codigo_ref: data.codigo_ref
        .trim()
        .toUpperCase(),
      aplica_comision:
        data.aplica_comision,
    };

    const res = await axiosClient.post(
      `/superadmin/users/${userId}/codigo-ref-especial`,
      payload
    );

    return res.data;
  } catch (error: any) {
    console.log(
      "ASIGNAR CODIGO ESPECIAL ERROR:",
      error.response?.data
    );

    throw error;
  }
}

// =========================
// ADMINISTRATORS
// =========================

export async function getSuperAdminAdministrators() {
  const res = await axios.get(
    `${API_URL}/superadmin/administrators`,
    {
      headers: headers(),
    }
  );

  return res.data;
}

// =========================
// SERVICES
// =========================

export async function getsuperadminService(
  page = 1
) {
  const res = await axios.get(
    `${API_URL}/services/superadminService?page=${page}`,
    {
      headers: headers(),
    }
  );

  return res.data;
}

// =========================
// TAECONTA EMPRESAS
// =========================

export async function fetchTaecontaEmpresas(
  page = 1
) {
  const res = await axios.get(
    `${API_URL}/taeconta/empresas`,
    {
      headers: headers(),
      params: {
        page,
      },
    }
  );

  return res.data;
}