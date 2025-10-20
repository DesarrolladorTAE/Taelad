// src/services/api/index.ts
import axiosClient from "../axiosClient";
import { setAuthToken } from "../axiosClient";

/** =======================
 *  Tipos base
 * ======================= */
export type ApiResponse<T> = {
  ok?: boolean;
  message?: string;
  data?: T;
  [k: string]: any;
};

export type PaginationParams = {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
};

export type User = {
  id: number;
  name: string;
  apellidos?: string | null;
  email: string;
  phone?: string | null;
  ganancias?: string; // decimal en backend → string aquí
  role?: number;
  codigo_ref?: string | null;
  terminos?: boolean;
  temspace?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Producto = {
  id: number;
  name: string;
  descripcion?: string | null;
  tipo_produc?: string | null;
  precio: string; // decimal → string
  url_imagen?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type HistorialCompra = {
  id: number;
  id_user: number;
  id_producto: number;
  fecha: string; // ISO
  cantidad: number;
  created_at?: string;
  updated_at?: string;
};

/** =======================
 *  Rutas (constantes)
 * ======================= */
export const API_ROUTES = {
  auth: {
    requestCode: "/auth/request-code",
    verifyCode: "/auth/verify-code",
    register: "/auth/register",
    login: "/auth/login",
    changePassword: "/auth/password/change",
    resetPasswordByCode: "/auth/password/reset",
  },
  users: {
    me: "/user", // Laravel Sanctum por defecto: GET /api/user
  },
  productos: {
    root: "/productos",
    byId: (id: number | string) => `/productos/${id}`,
  },
  historial: {
    root: "/historial-compras",
    byUser: (userId: number | string) => `/historial-compras?user_id=${userId}`,
  },
  // Externo (WhatsApp vía TeLoRecargo):
  external: {
    whatsappSend: "https://telorecargo.com/api/enviar-documentos-whatsapp",
  },
} as const;

/** =======================
 *  Auth services
 * ======================= */
export const authApi = {
  requestCode: (phone: string) =>
    axiosClient.post(API_ROUTES.auth.requestCode, { phone }),

  verifyCode: (phone: string, code: string) =>
    axiosClient.post(API_ROUTES.auth.verifyCode, { phone, code }),

  register: (payload: {
    name: string;
    apellidos?: string;
    email: string;
    password: string;
    phone: string; // 10 dígitos
    code: string;
    terminos: boolean;
    codigo_ref?: string;
  }) =>
    axiosClient.post<ApiResponse<{ user: User; token: string }>>(
      API_ROUTES.auth.register,
      payload
    ),

  login: (email_or_phone: string, password: string) =>
    axiosClient.post<ApiResponse<{ user: User; token: string }>>(
      API_ROUTES.auth.login,
      { email_or_phone, password }
    ),

  changePassword: (current_password: string, new_password: string) =>
    axiosClient.post<ApiResponse<unknown>>(
      API_ROUTES.auth.changePassword,
      { current_password, new_password }
    ),

  resetPasswordByCode: (phone: string, code: string, new_password: string) =>
    axiosClient.post<ApiResponse<unknown>>(
      API_ROUTES.auth.resetPasswordByCode,
      { phone, code, new_password }
    ),
};

/** =======================
 *  Users services
 * ======================= */
export const usersApi = {
  getMe: () => axiosClient.get<ApiResponse<User>>(API_ROUTES.users.me),
};

/** =======================
 *  Productos services (CRUD)
 * ======================= */
export const productosApi = {
  list: (params?: PaginationParams) =>
    axiosClient.get<ApiResponse<{ data: Producto[]; total?: number }>>(
      API_ROUTES.productos.root,
      { params }
    ),

  get: (id: number | string) =>
    axiosClient.get<ApiResponse<Producto>>(API_ROUTES.productos.byId(id)),

  create: (payload: Omit<Producto, "id" | "created_at" | "updated_at">) =>
    axiosClient.post<ApiResponse<Producto>>(API_ROUTES.productos.root, payload),

  update: (
    id: number | string,
    payload: Partial<Omit<Producto, "id" | "created_at" | "updated_at">>
  ) =>
    axiosClient.put<ApiResponse<Producto>>(API_ROUTES.productos.byId(id), payload),

  remove: (id: number | string) =>
    axiosClient.delete<ApiResponse<unknown>>(API_ROUTES.productos.byId(id)),
};

/** =======================
 *  Historial Compras
 * ======================= */
export const historialApi = {
  listByUser: (userId: number | string, params?: PaginationParams) =>
    axiosClient.get<ApiResponse<{ data: HistorialCompra[]; total?: number }>>(
      API_ROUTES.historial.byUser(userId),
      { params }
    ),

  create: (payload: Omit<HistorialCompra, "id" | "created_at" | "updated_at">) =>
    axiosClient.post<ApiResponse<HistorialCompra>>(
      API_ROUTES.historial.root,
      payload
    ),
};

/** =======================
 *  WhatsApp externo (opcional)
 * ======================= */
export const whatsappApi = {
  sendMessage: (params: {
    phone: string; // uno o varios separados por coma (10 dígitos)
    message?: string;
    pdf_url?: string;
    xml_url?: string;
  }) =>
    // Nota: endpoint externo fuera del BASE_URL
    fetch(API_ROUTES.external.whatsappSend, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(params),
    }).then(async (r) => {
      if (!r.ok) throw new Error(`WhatsApp API error: ${r.status}`);
      return r.json();
    }),
};

// (opcional) pequeño helper para extraer data
export function extract<T>(r: { data: ApiResponse<T> }): T {
  return (r.data?.data as T) ?? (r.data as unknown as T);
}

/** =======================
 *  Helpers de sesión (login, logout, register auto-login)
 * ======================= */
export const authSession = {
  /**
   * REGISTRO + login automático
   */
  async register(payload: {
    name: string;
    apellidos?: string;
    email: string;
    password: string;
    phone: string;
    code: string;
    terminos: boolean;
    codigo_ref?: string;
  }) {
    const { data } = await authApi.register(payload);
    const res = data?.data as { user: User; token: string };
    if (!res?.token || !res?.user) {
      throw new Error(data?.message || "Respuesta inválida del servidor");
    }

    // Persistir token para siguientes requests
    setAuthToken(res.token);

    // Usar SOLO 'token' en localStorage
    localStorage.setItem("token", res.token);
    localStorage.setItem("auth_user", JSON.stringify(res.user));

    // Limpieza de llaves viejas (si existían)
    localStorage.removeItem("auth_token");

    return res;
  },

  /**
   * Login y persistencia del token/usuario
   */
  async login(email_or_phone: string, password: string) {
    const { data } = await authApi.login(email_or_phone, password);
    const res = data?.data as { user: User; token: string };
    if (!res?.token || !res?.user) {
      throw new Error(data?.message || "Respuesta inválida del servidor");
    }

    setAuthToken(res.token);
    localStorage.setItem("token", res.token); // única clave
    localStorage.setItem("auth_user", JSON.stringify(res.user));

    // Limpieza de llaves viejas (si existían)
    localStorage.removeItem("auth_token");

    return res;
  },

  /**
   * Limpia sesión local (solo front).
   */
  logout() {
    localStorage.removeItem("token");     // única clave
    localStorage.removeItem("auth_user");
    setAuthToken(""); // o crea/usa clearAuthToken en axiosClient
  },

  /**
   * Lee sesión de localStorage (si existe)
   */
  getSession(): { token: string; user: User } | null {
    const token = localStorage.getItem("token"); // única clave
    const userRaw = localStorage.getItem("auth_user");
    if (!token || !userRaw) return null;
    try {
      const user = JSON.parse(userRaw) as User;
      return { token, user };
    } catch {
      return null;
    }
  },
};

// --- Helpers extra para "Olvidé mi contraseña" ---

/**
 * Solicita código de verificación por WhatsApp para el teléfono dado (10 dígitos).
 */
export async function requestResetCode(phone: string) {
  const clean = (phone || "").replace(/\D/g, "").slice(0, 10);
  if (!/^\d{10}$/.test(clean)) {
    throw new Error("El teléfono debe tener 10 dígitos");
  }
  return authApi.requestCode(clean);
}

/**
 * Resetea la contraseña con código y luego inicia sesión automáticamente.
 * Devuelve { user, token } si todo sale bien.
 */
export async function resetPasswordByCodeAndLogin(params: {
  phone: string;
  code: string;
  new_password: string;
}) {
  const phone = params.phone.replace(/\D/g, "").slice(0, 10);

  // 1) Reset en backend
  await authApi.resetPasswordByCode(phone, params.code, params.new_password);

  // 2) Auto-login con phone + nueva password
  const { user, token } = await authSession.login(phone, params.new_password);
  return { user, token };
}

