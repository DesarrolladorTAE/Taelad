export const TAE_CONTA_SERIE = "TAE-WEB" as const;

export type TaecontaSerie = typeof TAE_CONTA_SERIE;

export type TaecontaTimbradoEstatus =
  | "pendiente"
  | "procesando"
  | "timbrada"
  | "rechazado"
  | "error"
  | "cancelada";

export type TaecontaTipoFactor = "Tasa" | "Cuota" | "Exento";

export type TaecontaMetodoPago = "PUE" | "PPD";

export interface TaecontaProducto {
  descripcion: string;
  cantidad: number | string;
  claveUnidad: string;
  claveProducto: string;
  precio: number | string;
  iva: string;
  riva: string;
  risr: string;
  ieps: string;
  ish: string;
  total: number | string;
  descuento: number | string;
  tipoFactor: TaecontaTipoFactor;
}

/**
 * Payload completo construido exclusivamente por el backend.
 * El frontend no debe enviarlo al endpoint de timbrado.
 */
export interface TimbrarCfdiTaecontaPayload {
  correo?: string;
  contrasena?: string;
  folio: string;
  serie: TaecontaSerie;
  fecha: string;
  metodoPago: TaecontaMetodoPago;
  formaPago: string;
  usoCfdi: string;
  TotalIVA: number | string;
  clienteRFC: string;
  RegimenFiscalReceptor: string;
  DomicilioFiscalReceptor: string;
  clienteCorreo?: string | null;
  Nombre: string;

  /**
   * Puede conservarse como arreglo normalizado o como la cadena JSON
   * exacta enviada a TaeConta.
   */
  productos: TaecontaProducto[] | string;
}

/**
 * Único payload permitido desde el frontend.
 *
 * historial_cliente_id corresponde al movimiento original de
 * historial_clientes. El backend genera internamente el snapshot
 * fiscal de historial_compras.
 */
export interface TimbrarCompraTaecontaPayload {
  historial_cliente_id: number;
  uso_cfdi?: string;
  metodo_pago?: TaecontaMetodoPago;
  forma_pago?: string;
}

export interface TaecontaTimbradoUsuario {
  id: number;
  name: string;
  apellidos?: string | null;
  email: string;
}

export interface TaecontaHistorialClienteResumen {
  id: number;
  cliente_id: number;
  producto_id: number | null;
  producto_nombre: string;
  status: string;
  fecha_operacion: string;
  folio: string | null;
  uuid_fiscal: string | null;
}

export interface TaecontaTimbradoCompra {
  id: number;
  historial_cliente_id: number | null;
  id_user: number;
  fecha: string;
  subtotal?: string;
  iva?: string;
  total: string;
  moneda: string;
  estatus_pago: string;
  metodo_pago?: string | null;
  referencia_pago?: string | null;
  fecha_pago?: string | null;
  historial_cliente?: TaecontaHistorialClienteResumen | null;
}

export interface TaecontaTimbrado {
  id: number;

  /**
   * Identificador interno del snapshot fiscal.
   */
  historial_compra_id: number | null;

  user_id: number | null;
  serie: TaecontaSerie;
  folio: string | null;

  receptor_rfc: string;
  receptor_nombre: string;
  receptor_regimen_fiscal: string;
  receptor_codigo_postal: string;
  receptor_correo: string | null;

  uso_cfdi: string;
  metodo_pago: TaecontaMetodoPago;
  forma_pago: string;
  moneda: string;

  subtotal: string;
  descuento_total: string;
  iva_total: string;
  total: string;

  uuid: string | null;

  /**
   * TaeConta puede devolver un identificador numérico o alfanumérico.
   */
  factura_taeconta_id: string | null;

  estatus: TaecontaTimbradoEstatus;
  codigo_http: number | null;
  mensaje_error: string | null;

  payload: TimbrarCfdiTaecontaPayload | null;
  respuesta: Record<string, unknown> | null;

  pdf_path: string | null;
  xml_path: string | null;
  timbrado_at: string | null;

  user?: TaecontaTimbradoUsuario | null;
  compra?: TaecontaTimbradoCompra | null;

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

    /**
     * Snapshot fiscal creado internamente por el backend.
     */
    historial_compra_id: number;

    factura_id?: string | null;
    folio?: string | null;
    serie: TaecontaSerie;
    uuid?: string | null;
    estatus: TaecontaTimbradoEstatus;
  };
}

export interface TaecontaTimbradoDetalleResponse {
  ok: boolean;
  message?: string;
  data: TaecontaTimbrado;
}
export interface TaecontaFacturaPreviewCliente {
  id: number | null;
  nombre: string | null;
  rfc: string | null;
  regimen_fiscal: string | null;
  codigo_postal_fiscal: string | null;
  correo: string | null;
}

export interface TaecontaFacturaPreviewProducto {
  id: number | null;
  nombre: string | null;
  descripcion: string | null;
  clave_producto: string | null;
  clave_unidad: string | null;
  cantidad: string;
  precio_unitario_con_iva: string;
  precio_unitario_sin_iva: string;
  tasa_iva: string;
  tipo_factor: TaecontaTipoFactor;
  iva_taeconta: string;
}

export interface TaecontaFacturaPreviewTotales {
  subtotal: string;
  iva: string;
  total: string;
  moneda: string;
}

export interface TaecontaFacturaPreviewOpciones {
  uso_cfdi: string;
  metodo_pago: TaecontaMetodoPago;
  forma_pago: string;
}

export interface TaecontaFacturaPreviewTimbrado {
  id: number;
  estatus: TaecontaTimbradoEstatus;
  serie: TaecontaSerie;
  folio: string | null;
  uuid: string | null;
  pdf_path: string | null;
  xml_path: string | null;
  timbrado_at: string | null;
}

export interface TaecontaFacturaPreviewResponse {
  ok: boolean;
  can_invoice: boolean;
  message: string;

  data: {
    historial_cliente_id: number;
    estatus: string;
    fecha_operacion: string | null;
    folio_comercial: string | null;
    cliente: TaecontaFacturaPreviewCliente;
    producto: TaecontaFacturaPreviewProducto;
    totales: TaecontaFacturaPreviewTotales;
    opciones_sugeridas: TaecontaFacturaPreviewOpciones;
    timbrado: TaecontaFacturaPreviewTimbrado | null;
    faltantes: string[];
    advertencias: string[];
  };
}