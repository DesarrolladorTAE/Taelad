export type TaecontaTimbradoEstatus =
  | "pendiente"
  | "timbrado"
  | "rechazado"
  | "error";

export type TaecontaTipoFactor = "Tasa" | "Cuota" | "Exento";

export interface TaecontaProducto {
  descripcion: string;
  cantidad: number;
  claveUnidad: string;
  claveProducto: string;
  precio: number;
  iva: string;
  riva: string;
  risr: string;
  ieps: string;
  ish: string;
  total: number;
  descuento: number;
  tipoFactor: TaecontaTipoFactor;
}

export interface TimbrarCfdiTaecontaPayload {
  folio: string;
  serie: string;
  fecha: string;
  metodoPago: "PUE" | "PPD";
  formaPago: string;
  usoCfdi: string;
  clienteRFC: string;
  RegimenFiscalReceptor: string;
  DomicilioFiscalReceptor: string;
  clienteCorreo?: string | null;
  Nombre: string;
  productos: TaecontaProducto[];
}

export interface TaecontaTimbradoUsuario {
  id: number;
  name: string;
  email: string;
}

export interface TaecontaTimbrado {
  id: number;
  user_id: number | null;
  folio: string;
  serie: string;
  receptor_rfc: string;
  receptor_nombre: string;
  receptor_regimen_fiscal: string;
  receptor_codigo_postal: string;
  receptor_correo: string | null;
  subtotal: string;
  descuento_total: string;
  iva_total: string;
  total: string;
  uuid: string | null;
  factura_taeconta_id: number | null;
  estatus: TaecontaTimbradoEstatus;
  codigo_http: number | null;
  mensaje_error: string | null;
  payload: TimbrarCfdiTaecontaPayload | null;
  respuesta: Record<string, unknown> | null;
  user?: TaecontaTimbradoUsuario | null;
  created_at: string;
  updated_at: string;
}

export interface TaecontaTimbradosResponse {
  current_page: number;
  data: TaecontaTimbrado[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
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
}

export interface TaecontaTimbradosParams {
  page?: number;
  per_page?: number;
  search?: string;
  estatus?: TaecontaTimbradoEstatus | "";
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface TimbrarCfdiTaecontaResponse {
  ok: boolean;
  message: string;
  data: {
    registro_id: number;
    factura_id?: number | null;
    uuid?: string | null;
    estatus: TaecontaTimbradoEstatus;
  };
}

export interface TaecontaTimbradoDetalleResponse {
  ok: boolean;
  data: TaecontaTimbrado;
}