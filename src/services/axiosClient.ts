// src/services/axiosClient.ts

import axios, { AxiosError, AxiosInstance } from "axios";

const BASE_URL = "https://api.tecnologiasadministrativas.com/api";

let AUTH_TOKEN: string | null = null;

type UnauthorizedHandler = () => void;

let onUnauthorizedCb: UnauthorizedHandler | null = null;


/* =========================
   TOKEN
========================= */

function getAuthToken(): string | null {

  if (AUTH_TOKEN) {
    return AUTH_TOKEN;
  }


  if (typeof window !== "undefined") {

    const token = localStorage.getItem("token");

    if (token) {
      AUTH_TOKEN = token;
    }

    return token;

  }


  return null;
}



export function setAuthToken(token: string | null) {

  AUTH_TOKEN = token;


  if (typeof window !== "undefined") {

    if (token) {

      localStorage.setItem("token", token);

    } else {

      localStorage.removeItem("token");

    }

  }

}




export function onUnauthorized(handler: UnauthorizedHandler) {

  onUnauthorizedCb = handler;

}



/* =========================
   AXIOS CLIENT
========================= */


const axiosClient: AxiosInstance = axios.create({

  baseURL: BASE_URL,

  timeout: 20000,

  withCredentials: false,

  headers: {

    "Content-Type": "application/json",

    Accept: "application/json",

  },

});



/* =========================
   REQUEST TOKEN
========================= */


axiosClient.interceptors.request.use(

  (config) => {


    const token = getAuthToken();


    if (token) {

      config.headers.Authorization = `Bearer ${token}`;

    }


    return config;

  },

  (error) => Promise.reject(error)

);



/* =========================
   RESPONSE ERRORS
========================= */


axiosClient.interceptors.response.use(

  (response) => response,


  (error: AxiosError<any>) => {


    const status = error.response?.status;


    if (status === 401 || status === 419) {


      localStorage.removeItem("token");


      if (onUnauthorizedCb) {

        onUnauthorizedCb();

      }

    }


    return Promise.reject(error);

  }

);


export default axiosClient;