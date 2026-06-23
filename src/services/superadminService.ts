import axios from "axios";
import axiosClient from "./axiosClient";

export const getEmpresasTaeconta = async () => {
  const res = await axiosClient.get("/superadmin/taeconta/empresas");
  return res.data;
}
export async function fetchMiTiendaTiendas() {
  const res = await axiosClient.get("/superadmin/mitienda/tiendas");
  return res.data;
}


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
// DASHBOARD
// =========================
export async function getSuperAdminDashboard() {
  const res = await axios.get(`${API_URL}/superadmin/dashboard`, {
    headers: headers(),
  });

  return res.data;
}

// =========================
// SYSTEMS
// =========================
export async function getSuperAdminSystems() {
  const res = await axios.get(`${API_URL}/superadmin/systems`, {
    headers: headers(),
  });

  return res.data;
}

// =========================
// USERS
// =========================

// LISTAR (ESTÁNDAR)
export async function getSuperAdminUsers(page = 1, perPage = 16) {
  const res = await axios.get(
    `${API_URL}/superadmin/users?page=${page}&per_page=${perPage}`,
    {
      headers: headers(),
    }
  );

  return res.data;
}


// =========================
// CREATE USER
// =========================
export async function createUser(data: any) {
  try {
    const res = await axios.post(
      `${API_URL}/superadmin/users`,
      data,
      { headers: headers() }
    );

    return res.data;
  } catch (error: any) {
    console.log("CREATE USER ERROR:", error.response?.data);
    throw error;
  }
}

// =========================
// UPDATE USER
// =========================
export async function updateUser(id: number, data: any) {
  try {
    const res = await axios.put(
      `${API_URL}/superadmin/users/${id}`,
      data,
      { headers: headers() }
    );

    return res.data;
  } catch (error: any) {
    console.log("UPDATE USER ERROR:", error.response?.data);
    throw error;
  }
}

// =========================
// DELETE USER
// =========================
export async function deleteUser(id: number) {
  try {
    const res = await axios.delete(
      `${API_URL}/superadmin/users/${id}`,
      { headers: headers() }
    );

    return res.data;
  } catch (error: any) {
    console.log("DELETE USER ERROR:", error.response?.data);
    throw error;
  }
}

// =========================
// ADMINISTRATORS
// =========================
export async function getSuperAdminAdministrators() {
  const res = await axios.get(`${API_URL}/superadmin/administrators`, {
    headers: headers(),
  });

  return res.data;
}
export async function getsuperadminService(page = 1) {
  const res = await axios.get(
    `${API_URL}/services/superadminService?page=${page}`,
    {
      headers: headers(),
    }
  );

  return res.data;
}; 

export async function fetchTaecontaEmpresas(page = 1) {
  const res = await axios.get(`${API_URL}/taeconta/empresas`, {
    headers: headers(),
  });

  return res.data;
  
}


