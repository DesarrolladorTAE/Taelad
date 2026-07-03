import axios from "axios";

const API_BASE_URL = "https://api.tecnologiasadministrativas.com/api";

const TEA_REFERIDOS_DASHBOARD_URL = `${API_BASE_URL}/tea-referidos/dashboard`;

export type TeaReferidoStatus = "pendiente" | "confirmado" | "rechazado";

export type TeaReferidoSistema =
  | "mtelmx"
  | "taeconta"
  | "clicmenu"
  | "telorecargo"
  | "chatingbot";

export type TeaReferidoOrden = "asc" | "desc";

export type TeaReferidoDashboardParams = {
  sistema?: string;
  status?: string;
  mes?: number | string;
  anio?: number | string;
  orden?: TeaReferidoOrden;
  user_id?: number | string;
  usuarios_page?: number;
  referidos_page?: number;
};

export type TeaUsuario = {
  id?: number;
  name?: string | null;
  apellidos?: string | null;
  email?: string | null;
  phone?: string | null;
  codigo_ref?: string | null;
};

export type TeaReferido = {
  id: number;
  ganancia_id?: number | null;
  user_id: number;
  referido_user_id?: number | null;
  nombre_referido: string;
  codigo_ref_usado?: string | null;
  external_id?: string | null;
  sistema: string;
  status: TeaReferidoStatus | string;
  fecha_registro: string;
  fecha_confirmacion?: string | null;
  origen?: string | null;
  observaciones?: string | null;
  created_at?: string | null;
  updated_at?: string | null;

  nombre_producto?: string | null;
  costo_producto?: number | string | null;
  porcentaje_comision?: number | string | null;
  monto?: number | string | null;
  fecha_pago?: string | null;

  usuario?: TeaUsuario | null;
  referido_usuario?: TeaUsuario | null;
  referidoUsuario?: TeaUsuario | null;
};

export type TeaResumen = {
  total_referidos: number | string;
  total_confirmados: number | string;
  total_pendientes: number | string;
  total_rechazados: number | string;

  referidos_mes_seleccionado: number | string;
  confirmados_mes_seleccionado: number | string;
  pendientes_mes_seleccionado: number | string;
  rechazados_mes_seleccionado: number | string;

  referidos_mes_actual: number | string;
  confirmados_mes_actual: number | string;
  pendientes_mes_actual: number | string;
  rechazados_mes_actual: number | string;

  ganancia_total?: number | string;
  ganancia_confirmada?: number | string;
  ganancia_pendiente?: number | string;
  ganancia_mes_seleccionado?: number | string;
  ganancia_confirmada_mes_seleccionado?: number | string;
  ganancia_pendiente_mes_seleccionado?: number | string;
};

export type TeaRankingItem = {
  user_id: number;
  name?: string | null;
  apellidos?: string | null;
  email?: string | null;
  phone?: string | null;
  codigo_ref?: string | null;
  cantidad_referidos: number | string;
  ultimo_referido?: string | null;
};

export type TeaUsuarioTeaItem = {
  user_id: number;
  name?: string | null;
  apellidos?: string | null;
  email?: string | null;
  phone?: string | null;
  codigo_ref?: string | null;
  cantidad_referidos: number | string;
  confirmados: number | string;
  pendientes: number | string;
  rechazados: number | string;
  referidos_mes_seleccionado: number | string;
  confirmados_mes_seleccionado?: number | string;
  pendientes_mes_seleccionado?: number | string;
  referidos_mes_actual: number | string;
  sistemas?: string | null;
  ultimo_referido?: string | null;

  ganancia_total?: number | string;
  ganancia_confirmada?: number | string;
  ganancia_pendiente?: number | string;
};

export type TeaUsuariosTeaPaginated = {
  current_page: number;
  data: TeaUsuarioTeaItem[];
  first_page_url?: string | null;
  from?: number | null;
  last_page: number;
  last_page_url?: string | null;
  next_page_url?: string | null;
  path?: string;
  per_page: number;
  prev_page_url?: string | null;
  to?: number | null;
  total: number;
};

export type TeaPorSistemaItem = {
  sistema: string;
  total: number | string;
  confirmados: number | string;
  pendientes: number | string;
  rechazados: number | string;
  ganancia_total?: number | string;
  ganancia_confirmada?: number | string;
  ganancia_pendiente?: number | string;
};

export type TeaPorMesItem = {
  mes: string;
  total: number | string;
  confirmados: number | string;
  pendientes: number | string;
  rechazados: number | string;
  ganancia_total?: number | string;
  ganancia_confirmada?: number | string;
  ganancia_pendiente?: number | string;
};

export type TeaReferidosPaginated = {
  current_page: number;
  data: TeaReferido[];
  first_page_url?: string | null;
  from?: number | null;
  last_page: number;
  last_page_url?: string | null;
  next_page_url?: string | null;
  path?: string;
  per_page: number;
  prev_page_url?: string | null;
  to?: number | null;
  total: number;
};

export type TeaReferidosDashboardResponse = {
  ok: boolean;
  filters: {
    sistema?: string | null;
    status?: string | null;
    mes: number;
    anio: number;
    orden: TeaReferidoOrden;
    user_id?: number | string | null;
  };
  detalle_usuario?: TeaUsuario | null;
  resumen: TeaResumen;
  ranking_mayor_menor?: TeaRankingItem[];
  usuarios_tea: TeaUsuariosTeaPaginated;
  nuevos: TeaReferido[];
  recientes_mes_actual: TeaReferido[];
  referidos_mes_seleccionado: TeaReferidosPaginated;
  por_sistema: TeaPorSistemaItem[];
  por_mes: TeaPorMesItem[];
};

function getToken(): string | null {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("TOKEN") ||
    localStorage.getItem("auth_token") ||
    localStorage.getItem("access_token")
  );
}

function getHeaders() {
  const token = getToken();

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function limpiarParams(params?: TeaReferidoDashboardParams) {
  const cleanParams: Record<string, string | number> = {};

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      cleanParams[key] = value as string | number;
    }
  });

  return cleanParams;
}

export async function obtenerTeaReferidosDashboard(
  params?: TeaReferidoDashboardParams,
): Promise<TeaReferidosDashboardResponse> {
  const response = await axios.get<TeaReferidosDashboardResponse>(
    TEA_REFERIDOS_DASHBOARD_URL,
    {
      headers: getHeaders(),
      params: limpiarParams(params),
    },
  );

  return response.data;
}

export const teaReferidosService = {
  obtenerDashboard: obtenerTeaReferidosDashboard,
};