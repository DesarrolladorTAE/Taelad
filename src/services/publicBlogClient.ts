import axios, { AxiosInstance } from "axios";

const PUBLIC_API_BASE_URL =
  process.env.REACT_APP_PUBLIC_API_URL ||
  "https://api.tecnologiasadministrativas.com/api";

const publicBlogClient: AxiosInstance = axios.create({
  baseURL: PUBLIC_API_BASE_URL,
  timeout: 15000,
  withCredentials: false,
  headers: {
    Accept: "application/json",
  },
});

export default publicBlogClient;