export const TAE_CONTA_SERIE = "TAE-WEB" as const;

export type TaecontaSerie =
  typeof TAE_CONTA_SERIE;

export type TaecontaTimbradoEstatus =
  | "pendiente"
  | "procesando"
  | "timbrada"
  | "rechazado"
  | "error"
  | "cancelada";

export type TaecontaFacturacionEstatus =
  | "disponible"
  | "facturado"
  | "vencido"
  | "no_disponible";

export type TaecontaTipoFactor =
  | "Tasa"
  | "Cuota"
  | "Exento";

export type TaecontaMetodoPago =
  | "PUE"
  | "PPD";

/*
|--------------------------------------------------------------------------
| PRODUCTOS Y PAYLOAD INTERNO
|--------------------------------------------------------------------------
*/

/**
 * Producto normalizado para el payload enviado a TaeConta.
 *
 * Este objeto lo construye exclusivamente el backend.
 */
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
 * Payload completo construido por el backend.
 *
 * El frontend no debe enviarlo directamente al endpoint de timbrado.
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
   * El backend puede conservarlo como arreglo o serializarlo
   * antes de enviarlo a TaeConta.
   */
  productos: TaecontaProducto[] | string;
}

/*
|--------------------------------------------------------------------------
| PAYLOAD PERMITIDO DESDE EL FRONTEND
|--------------------------------------------------------------------------
*/

/**
 * Único payload que React puede enviar para facturar.
 *
 * historial_cliente_id corresponde al movimiento original de
 * historial_clientes.
 *
 * El backend crea internamente el snapshot en historial_compras.
 */
export interface TimbrarCompraTaecontaPayload {
  historial_cliente_id: number;
  uso_cfdi?: string;

  /**
   * En este flujo solamente se permite PUE.
   */
  metodo_pago?: "PUE";

  forma_pago?: string;
}

/*
|--------------------------------------------------------------------------
| USUARIO Y COMPRA
|--------------------------------------------------------------------------
*/

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

  historial_cliente?:
    | TaecontaHistorialClienteResumen
    | null;
}

/*
|--------------------------------------------------------------------------
| TIMBRADO
|--------------------------------------------------------------------------
*/

export interface TaecontaTimbrado {
  id: number;

  /**
   * ID interno del snapshot fiscal.
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
   * TaeConta puede devolver un ID numérico o alfanumérico.
   */
  factura_taeconta_id: string | null;

  estatus: TaecontaTimbradoEstatus;
  codigo_http: number | null;
  mensaje_error: string | null;

  payload:
    | TimbrarCfdiTaecontaPayload
    | Record<string, unknown>
    | null;

  respuesta:
    | Record<string, unknown>
    | null;

  /**
   * Se conservan únicamente por compatibilidad con registros
   * anteriores. El flujo nuevo no depende de estas rutas.
   */
  pdf_path?: string | null;
  xml_path?: string | null;

  timbrado_at: string | null;

  user?: TaecontaTimbradoUsuario | null;
  compra?: TaecontaTimbradoCompra | null;

  created_at: string;
  updated_at: string;
}

/*
|--------------------------------------------------------------------------
| LISTADO DE TIMBRADOS
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| RESPUESTA DE TIMBRADO
|--------------------------------------------------------------------------
*/

export interface TimbrarCfdiTaecontaResponse {
  ok: boolean;
  message: string;

  data: {
    registro_id: number;

    /**
     * Snapshot fiscal creado internamente por Laravel.
     */
    historial_compra_id: number;

    /**
     * Nombre utilizado actualmente por el backend.
     */
    factura_id?: string | null;

    /**
     * Se conserva como alternativa para futuras respuestas.
     */
    factura_taeconta_id?: string | null;

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

/*
|--------------------------------------------------------------------------
| PREVISUALIZACIÓN DEL CFDI
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| VIGENCIA DE FACTURACIÓN
|--------------------------------------------------------------------------
*/

export interface TaecontaFacturaVigencia {
  estatus: TaecontaFacturacionEstatus;

  puede_facturar: boolean;
  vencida: boolean;

  fecha_creacion: string | null;
  fecha_limite: string | null;

  /**
   * Horas restantes antes de que se cumplan las 72 horas.
   */
  horas_restantes: number;
}

/*
|--------------------------------------------------------------------------
| FACTURA YA TIMBRADA
|--------------------------------------------------------------------------
*/

export interface TaecontaFacturaPreviewTimbrado {
  id: number;
  estatus: TaecontaTimbradoEstatus;

  serie: TaecontaSerie;
  folio: string | null;
  uuid: string | null;

  factura_taeconta_id: string | null;

  /**
   * Indica que el backend puede consultar PDF y XML
   * directamente desde TaeConta.
   */
  documentos_disponibles: boolean;

  timbrado_at: string | null;
}

/*
|--------------------------------------------------------------------------
| RESPUESTA DEL PREVIEW
|--------------------------------------------------------------------------
*/

export interface TaecontaFacturaPreviewResponse {
  ok: boolean;
  can_invoice: boolean;
  message: string;

  data: {
    historial_cliente_id: number;

    /**
     * Estado comercial del movimiento:
     * pagado, pendiente, cancelado, etc.
     */
    estatus: string;

    fecha_operacion: string | null;
    folio_comercial: string | null;

    /**
     * Estado fiscal derivado:
     * disponible, facturado, vencido o no_disponible.
     */
    facturacion: TaecontaFacturaVigencia;

    cliente: TaecontaFacturaPreviewCliente;
    producto: TaecontaFacturaPreviewProducto;
    totales: TaecontaFacturaPreviewTotales;

    opciones_sugeridas:
      TaecontaFacturaPreviewOpciones;

    timbrado:
      | TaecontaFacturaPreviewTimbrado
      | null;

    faltantes: string[];
    advertencias: string[];
  };
}