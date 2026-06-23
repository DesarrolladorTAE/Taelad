import axios from "axios";

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



export async function getSuperAdminDashboard() {

  const res = await axios.get(
    `${API_URL}/superadmin/dashboard`,
    {
      headers: headers(),
    }
  );

  return res.data;

}



export async function getSuperAdminSystems() {

  const res = await axios.get(
    `${API_URL}/superadmin/systems`,
    {
      headers: headers(),
    }
  );

  return res.data;

}




export async function getSuperAdminUsers() {

  const res = await axios.get(
    `${API_URL}/superadmin/users`,
    {
      headers: headers(),
    }
  );

  return res.data;

}




export async function getSuperAdminAdministrators() {

  const res = await axios.get(
    `${API_URL}/superadmin/administrators`,
    {
      headers: headers(),
    }
  );

  return res.data;

}