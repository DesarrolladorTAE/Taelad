import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  alpha,
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import EditCalendarOutlinedIcon from "@mui/icons-material/EditCalendarOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import RemoveCircleOutlineOutlinedIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";

import {
  assignTaecontaSystemEmpresa,
  deleteTaecontaSystemEmpresaCertificado,
  deleteTaecontaSystemEmpresaTimbres,
  getTaecontaSystemEmpresaPagos,
  getTaecontaSystemEmpresaSocio,
  getTaecontaSystemEmpresas,
  getTaecontaSystemIndicadores,
  getTaecontaSystemPaquetes,
  getTaecontaSystemPlanes,
  toggleTaecontaSystemEmpresaEstado,
  updateTaecontaSystemEmpresaContabilidad,
  updateTaecontaSystemEmpresaIndicadores,
  updateTaecontaSystemEmpresaVigencia,
} from "../../../services/superadminService";

import type {
  TaecontaEmpresaFilters,
} from "./types";

import TaecontaSocioEditor from "./TaecontaSocioEditor";

/*
|--------------------------------------------------------------------------
| PROPS
|--------------------------------------------------------------------------
*/

type Props = {
  filters: TaecontaEmpresaFilters;
};

/*
|--------------------------------------------------------------------------
| TIPOS
|--------------------------------------------------------------------------
*/

type Empresa = Record<
  string,
  any
>;

type Indicador = {
  id: number;
  nombre: string;
  color: string;
};

type EstadoEmpresa = {
  label: string;

  color:
    | "success"
    | "warning"
    | "error"
    | "info"
    | "default";
};

type CuentaVigenciaFilter =
  | "todas"
  | "vigentes"
  | "proximas7"
  | "proximas30"
  | "vencidas";

const CUENTA_FILTER_KEY =
  "taeconta_cuentas_vigencia";

const CUENTA_FOCUS_KEY =
  "taeconta_cuentas_focus";

const ROWS_PER_PAGE_OPTIONS = [
  10,
  20,
  50,
  100,
];

/*
|--------------------------------------------------------------------------
| HELPERS DE RESPUESTA
|--------------------------------------------------------------------------
*/

function extractArray(
  response: unknown,
): Empresa[] {
  const raw =
    response as any;

  if (Array.isArray(raw)) {
    return raw;
  }

  if (
    Array.isArray(raw?.data)
  ) {
    return raw.data;
  }

  if (
    Array.isArray(
      raw?.data?.data,
    )
  ) {
    return raw.data.data;
  }

  if (
    Array.isArray(
      raw?.empresas,
    )
  ) {
    return raw.empresas;
  }

  if (
    Array.isArray(
      raw?.data?.empresas,
    )
  ) {
    return raw.data.empresas;
  }

  /*
   * El endpoint de pagos responde:
   *
   * {
   *   success: true,
   *   data: {
   *     empresa: {...},
   *     gatewayPagos: [...]
   *   }
   * }
   */
  if (
    Array.isArray(
      raw?.gatewayPagos,
    )
  ) {
    return raw.gatewayPagos;
  }

  if (
    Array.isArray(
      raw?.data?.gatewayPagos,
    )
  ) {
    return raw.data.gatewayPagos;
  }

  return [];
}

function extractIndicadores(
  response: unknown,
): Indicador[] {
  const raw =
    response as any;

  let data: any[] = [];

  if (Array.isArray(raw)) {
    data = raw;
  } else if (
    Array.isArray(raw?.data)
  ) {
    data = raw.data;
  } else if (
    Array.isArray(
      raw?.data?.data,
    )
  ) {
    data =
      raw.data.data;
  }

  return data
    .map(
      (
        item,
      ): Indicador | null => {
        const id =
          Number(item?.id);

        const nombre =
          String(
            item?.nombre ??
              item?.name ??
              "",
          ).trim();

        const color =
          String(
            item?.color ??
              "#64748B",
          ).trim();

        if (
          !Number.isFinite(id) ||
          !nombre
        ) {
          return null;
        }

        return {
          id,
          nombre,

          color:
            isValidColor(color)
              ? color
              : "#64748B",
        };
      },
    )
    .filter(
      (
        item,
      ): item is Indicador =>
        item !== null,
    );
}

/*
|--------------------------------------------------------------------------
| HELPERS GENERALES
|--------------------------------------------------------------------------
*/

function firstValue(
  source: Empresa,
  ...keys: string[]
): unknown {
  for (const key of keys) {
    const value =
      source?.[key];

    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return value;
    }
  }

  return null;
}

function isValidColor(
  value: string,
): boolean {
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(
    value,
  );
}

/*
|--------------------------------------------------------------------------
| FECHAS
|--------------------------------------------------------------------------
*/

function parseDate(
  value: unknown,
): Date | null {
  if (!value) {
    return null;
  }

  const text =
    String(value).trim();

  const match =
    text.match(
      /^(\d{4})-(\d{2})-(\d{2})/,
    );

  if (!match) {
    return null;
  }

  const year =
    Number(match[1]);

  const month =
    Number(match[2]);

  const day =
    Number(match[3]);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  ) {
    return null;
  }

  const date =
    new Date(
      year,
      month - 1,
      day,
      12,
      0,
      0,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  return date;
}

function formatDate(
  value: unknown,
): string {
  const date =
    parseDate(value);

  if (!date) {
    return "Sin vigencia";
  }

  return new Intl.DateTimeFormat(
    "es-MX",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  ).format(date);
}

function getExpiration(
  empresa: Empresa,
): unknown {
  return firstValue(
    empresa,
    "expires_at",
    "fecha_vencimiento",
    "vencimiento",
    "vigencia",
  );
}

/*
|--------------------------------------------------------------------------
| DATOS DE EMPRESA
|--------------------------------------------------------------------------
*/

function getNombre(
  empresa: Empresa,
): string {
  return String(
    firstValue(
      empresa,
      "nombre",
      "name",
      "razon_social",
      "razonSocial",
    ) ?? "Sin nombre",
  );
}

function getRfc(
  empresa: Empresa,
): string {
  return String(
    firstValue(
      empresa,
      "rfc",
      "RFC",
    ) ?? "—",
  );
}

/*
|--------------------------------------------------------------------------
| CORREO
|--------------------------------------------------------------------------
|
| TAECONTA puede regresar el correo:
|
| correo
| email
| correo_usuario
| email_usuario
| usuario_correo
| usuario_email
|
| o dentro de:
|
| usuario
| user
| usuario_asociado
| usuarioAsociado
| propietario
| owner
|
*/

function extractEmailFromObject(
  value: unknown,
): string | null {
  if (
    !value ||
    typeof value !==
      "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  const record =
    value as Record<
      string,
      any
    >;

  const direct =
    firstValue(
      record,
      "correo",
      "email",
      "mail",
      "correo_electronico",
      "correoElectronico",
      "email_address",
      "emailAddress",
    );

  if (direct) {
    const text =
      String(direct).trim();

    if (text) {
      return text;
    }
  }

  return null;
}

function getCorreo(
  empresa: Empresa,
): string {
  /*
   * 1. Campos directos.
   */
  const direct =
    firstValue(
      empresa,
      "correo",
      "email",
      "mail",
      "correo_electronico",
      "correoElectronico",
      "correo_usuario",
      "correoUsuario",
      "email_usuario",
      "emailUsuario",
      "usuario_correo",
      "usuarioCorreo",
      "usuario_email",
      "usuarioEmail",
    );

  if (direct) {
    const text =
      String(direct).trim();

    if (text) {
      return text;
    }
  }

  /*
   * 2. Objetos relacionados conocidos.
   */
  const relatedObjects = [
    empresa.usuario,
    empresa.user,
    empresa.usuario_asociado,
    empresa.usuarioAsociado,
    empresa.usuario_relacionado,
    empresa.usuarioRelacionado,
    empresa.propietario,
    empresa.owner,
    empresa.cliente,
    empresa.customer,
  ];

  for (
    const related of
    relatedObjects
  ) {
    const email =
      extractEmailFromObject(
        related,
      );

    if (email) {
      return email;
    }
  }

  /*
   * 3. Último fallback:
   * revisar objetos de primer nivel
   * por si el backend cambia el nombre
   * de la relación.
   */
  for (
    const value of
    Object.values(empresa)
  ) {
    const email =
      extractEmailFromObject(
        value,
      );

    if (email) {
      return email;
    }
  }

  return "—";
}

function getTimbres(
  empresa: Empresa,
): number {
  const value =
    firstValue(
      empresa,
      "timbres",
      "timbres_disponibles",
      "timbresDisponibles",
    );

  if (
    value &&
    typeof value ===
      "object"
  ) {
    const parsed =
      Number(
        (value as any)
          .total ??
          (value as any)
            .disponibles ??
          (value as any)
            .cantidad ??
          (value as any)
            .saldo ??
          0,
      );

    return Number.isFinite(
      parsed,
    )
      ? parsed
      : 0;
  }

  const parsed =
    Number(value ?? 0);

  return Number.isFinite(
    parsed,
  )
    ? parsed
    : 0;
}

function getPersona(
  empresa: Empresa,
): string {
  const explicit =
    firstValue(
      empresa,
      "persona",
      "tipo_persona",
      "tipoPersona",
    );

  if (explicit) {
    return String(
      explicit,
    );
  }

  const rfc =
    getRfc(empresa)
      .replace(/\s/g, "")
      .toUpperCase();

  if (rfc.length === 13) {
    return "Física";
  }

  if (rfc.length === 12) {
    return "Moral";
  }

  return "—";
}

/*
|--------------------------------------------------------------------------
| ESTADO
|--------------------------------------------------------------------------
*/

function getDespacho(
  empresa: Empresa | null | undefined,
): Empresa | null {
  if (!empresa) {
    return null;
  }

  const despacho =
    empresa?.despacho;

  if (
    !despacho ||
    typeof despacho !== "object" ||
    Array.isArray(despacho)
  ) {
    return null;
  }

  const id =
    Number(
      firstValue(
        despacho,
        "id",
      ),
    );

  const nombre =
    String(
      firstValue(
        despacho,
        "nombre",
        "name",
      ) ?? "",
    ).trim();

  if (
    !Number.isFinite(id) ||
    id <= 0 ||
    !nombre
  ) {
    return null;
  }

  return despacho as Empresa;
}

function formatLongDate(
  value: unknown,
): string {
  const date =
    parseDate(value);

  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "es-MX",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(date);
}

function getEstado(
  empresa: Empresa,
): EstadoEmpresa {
  const explicit =
    firstValue(
      empresa,
      "estado",
      "estatus",
      "status",
    );

  if (explicit) {
    const text =
      String(explicit);

    const normalized =
      text
        .trim()
        .toLowerCase();

    if (
      normalized.includes(
        "venc",
      ) ||
      normalized.includes(
        "expir",
      ) ||
      normalized.includes(
        "inactiv",
      )
    ) {
      return {
        label: text,
        color: "error",
      };
    }

    if (
      normalized.includes(
        "pend",
      )
    ) {
      return {
        label: text,
        color: "warning",
      };
    }

    if (
      normalized.includes(
        "activ",
      ) ||
      normalized.includes(
        "vigent",
      )
    ) {
      return {
        label: text,
        color: "success",
      };
    }
  }

  const expiration =
    parseDate(
      getExpiration(
        empresa,
      ),
    );

  if (!expiration) {
    return {
      label:
        explicit
          ? String(explicit)
          : "Sin vigencia",

      color: "default",
    };
  }

  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0,
  );

  expiration.setHours(
    0,
    0,
    0,
    0,
  );

  if (
    expiration.getTime() <
    today.getTime()
  ) {
    return {
      label: "Vencida",
      color: "error",
    };
  }

  const days =
    Math.ceil(
      (
        expiration.getTime() -
        today.getTime()
      ) /
        (
          1000 *
          60 *
          60 *
          24
        ),
    );

  if (days <= 30) {
    return {
      label:
        "Próxima a vencer",

      color:
        "warning",
    };
  }

  return {
    label: "Vigente",
    color: "success",
  };
}

/*
|--------------------------------------------------------------------------
| INDICADORES
|--------------------------------------------------------------------------
*/

function getIndicadoresEmpresa(
  empresa: Empresa,
  catalogo: Map<
    number,
    Indicador
  >,
): Indicador[] {
  const result =
    new Map<
      string,
      Indicador
    >();

  const addIndicator = (
    value: unknown,
  ) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return;
    }

    /*
     * ARRAY
     */
    if (
      Array.isArray(value)
    ) {
      value.forEach(
        addIndicator,
      );

      return;
    }

    /*
     * ID NUMÉRICO
     */
    if (
      typeof value ===
        "number"
    ) {
      const catalog =
        catalogo.get(value);

      if (catalog) {
        result.set(
          `id:${catalog.id}`,
          catalog,
        );
      }

      return;
    }

    /*
     * STRING
     */
    if (
      typeof value ===
        "string"
    ) {
      const parts =
        value
          .split(",")
          .map(
            (item) =>
              item.trim(),
          )
          .filter(Boolean);

      parts.forEach(
        (part) => {
          const numeric =
            Number(part);

          if (
            Number.isFinite(
              numeric,
            )
          ) {
            const catalog =
              catalogo.get(
                numeric,
              );

            if (catalog) {
              result.set(
                `id:${catalog.id}`,
                catalog,
              );
            }

            return;
          }

          const found =
            Array.from(
              catalogo.values(),
            ).find(
              (
                indicador,
              ) =>
                indicador.nombre
                  .trim()
                  .toLowerCase() ===
                part
                  .trim()
                  .toLowerCase(),
            );

          if (found) {
            result.set(
              `id:${found.id}`,
              found,
            );

            return;
          }

          result.set(
            `nombre:${part.toLowerCase()}`,
            {
              id: 0,
              nombre: part,
              color:
                "#64748B",
            },
          );
        },
      );

      return;
    }

    /*
     * OBJETO
     */
    if (
      typeof value ===
        "object"
    ) {
      const record =
        value as Record<
          string,
          any
        >;

      if (
        record.indicador
      ) {
        addIndicator(
          record.indicador,
        );

        return;
      }

      if (
        record.indicator
      ) {
        addIndicator(
          record.indicator,
        );

        return;
      }

      const id =
        Number(
          record.id ??
            record.indicador_id ??
            record.indicator_id,
        );

      const catalog =
        Number.isFinite(id)
          ? catalogo.get(id)
          : undefined;

      const nombre =
        String(
          record.nombre ??
            record.name ??
            record.descripcion ??
            catalog?.nombre ??
            "",
        ).trim();

      if (!nombre) {
        return;
      }

      const rawColor =
        String(
          record.color ??
            catalog?.color ??
            "#64748B",
        );

      const indicador: Indicador =
        {
          id:
            Number.isFinite(id)
              ? id
              : catalog?.id ??
                0,

          nombre,

          color:
            isValidColor(
              rawColor,
            )
              ? rawColor
              : "#64748B",
        };

      result.set(
        indicador.id
          ? `id:${indicador.id}`
          : `nombre:${indicador.nombre.toLowerCase()}`,

        indicador,
      );
    }
  };

  [
    empresa.indicadores,
    empresa.indicators,

    empresa.indicador,
    empresa.indicator,

    empresa.indicador_id,
    empresa.indicator_id,

    empresa.indicador_ids,
    empresa.indicadores_ids,
    empresa.indicator_ids,
  ].forEach(
    addIndicator,
  );

  return Array.from(
    result.values(),
  );
}

/*
|--------------------------------------------------------------------------
| COMPONENTE INDICADORES
|--------------------------------------------------------------------------
*/

function IndicadoresEmpresa({
  indicadores,
}: {
  indicadores: Indicador[];
}) {
  const theme =
    useTheme();

  const isDark =
    theme.palette.mode ===
    "dark";

  if (
    indicadores.length ===
    0
  ) {
    return (
      <Typography
        color="text.disabled"
        fontSize={9.5}
        sx={{
          lineHeight: 1.2,
        }}
      >
        Sin indicadores
      </Typography>
    );
  }

  return (
    <Stack
      direction="row"
      spacing={0.35}
      useFlexGap
      flexWrap="wrap"
      sx={{
        width: "100%",
        minWidth: 0,
      }}
    >
      {indicadores.map(
        (
          indicador,
          index,
        ) => {
          const color =
            isValidColor(
              indicador.color,
            )
              ? indicador.color
              : "#64748B";

          return (
            <Chip
              key={
                indicador.id
                  ? indicador.id
                  : `${indicador.nombre}-${index}`
              }
              size="small"
              label={
                indicador.nombre
              }
              title={
                indicador.nombre
              }
              sx={{
                height: 21,

                minWidth: 0,

                maxWidth:
                  "100%",

                border:
                  "1px solid",

                borderColor:
                  alpha(
                    color,
                    0.65,
                  ),

                bgcolor:
                  alpha(
                    color,
                    isDark
                      ? 0.2
                      : 0.1,
                  ),

                color:
                  isDark
                    ? "text.primary"
                    : color,

                fontWeight: 800,

                fontSize: 8.5,

                "& .MuiChip-label":
                  {
                    px: 0.6,

                    minWidth: 0,

                    overflow:
                      "hidden",

                    textOverflow:
                      "ellipsis",
                  },
              }}
            />
          );
        },
      )}
    </Stack>
  );
}

/*
|--------------------------------------------------------------------------
| ACCIONES ADMINISTRATIVAS
|--------------------------------------------------------------------------
*/

type CuentaAccion =
  | "pagos"
  | "socio"
  | "vigencia"
  | "indicadores"
  | "asignacion"
  | "eliminar-timbres"
  | "estado"
  | "contabilidad"
  | "certificados";

type TipoAsignacion =
  | "timbres"
  | "paquete"
  | "plan";

type TipoCertificado =
  | "cert"
  | "llave"
  | "cert2"
  | "llave2";

function getEmpresaId(
  empresa: Empresa | null,
): number | null {
  const id = Number(
    empresa
      ? firstValue(
          empresa,
          "id",
        )
      : null,
  );

  return Number.isFinite(id) &&
    id > 0
    ? id
    : null;
}

function getRequestMessage(
  error: any,
  fallback: string,
): string {
  const responseData =
    error?.response?.data;

  const errors =
    responseData?.errors;

  if (
    errors &&
    typeof errors === "object"
  ) {
    const first = Object.values(
      errors,
    )
      .flat()
      .find(
        (item) =>
          typeof item ===
            "string" &&
          item.trim() !== "",
      );

    if (first) {
      return String(first);
    }
  }

  return (
    responseData?.message ||
    error?.message ||
    fallback
  );
}

function actionResponseMessage(
  response: any,
  fallback: string,
): string {
  return String(
    response?.message ??
      response?.mensaje ??
      fallback,
  );
}

function getBooleanValue(
  value: unknown,
): boolean {
  if (
    typeof value ===
    "boolean"
  ) {
    return value;
  }

  if (
    typeof value ===
    "number"
  ) {
    return value === 1;
  }

  const normalized =
    String(
      value ?? "",
    )
      .trim()
      .toLowerCase();

  return [
    "1",
    "true",
    "si",
    "sí",
    "activo",
    "activado",
    "habilitado",
  ].includes(
    normalized,
  );
}

function getPagoPagado(
  pago: Empresa,
): boolean {
  return getBooleanValue(
    firstValue(
      pago,
      "pagado",
    ),
  );
}

function getPagoEsConsulta(
  pago: Empresa,
): boolean {
  if (
    getPagoPagado(pago)
  ) {
    return false;
  }

  const gatewayId =
    firstValue(
      pago,
      "gateway_id",
    );

  const banco =
    String(
      firstValue(
        pago,
        "Banco",
        "banco",
      ) ?? "",
    )
      .trim()
      .toLowerCase();

  return Boolean(
    gatewayId ||
      banco === "conekta",
  );
}

function getPagoFechaMostrada(
  pago: Empresa,
): unknown {
  return getPagoPagado(
    pago,
  )
    ? firstValue(
        pago,
        "fecha_pagado",
        "fecha_pago",
      )
    : firstValue(
        pago,
        "fecha_link",
        "fecha",
      );
}

function getPagoFechaOrden(
  pago: Empresa,
): number {
  /*
   * Conserva la lógica del modal original de TAECONTA:
   * fecha_pagado tiene prioridad para ordenar; después fecha_link.
   */
  const value =
    firstValue(
      pago,
      "fecha_pagado",
      "fecha_link",
    );

  const date =
    parseDate(value);

  return date
    ? date.getTime()
    : 0;
}

function ordenarPagos(
  items: Empresa[],
): Empresa[] {
  return [...items].sort(
    (a, b) =>
      getPagoFechaOrden(b) -
      getPagoFechaOrden(a),
  );
}

function formatPagoFecha(
  value: unknown,
): string {
  const date =
    parseDate(value);

  if (!date) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat(
    "es-MX",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(date);
}

function getPagoMonto(
  pago: Empresa,
): string {
  const value = Number(
    firstValue(
      pago,
      "Monto",
      "monto",
      "total",
      "importe",
      "cantidad_pagada",
    ) ?? 0,
  );

  if (
    !Number.isFinite(value)
  ) {
    return "$0.00";
  }

  return new Intl.NumberFormat(
    "es-MX",
    {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(value);
}

function getPagoDetalle(
  pago: Empresa,
): string {
  if (
    getPagoPagado(pago)
  ) {
    return "Compra aplicada";
  }

  if (
    getPagoEsConsulta(pago)
  ) {
    return "Paquete consultado sin pago";
  }

  return "Pendiente";
}

function getPagoEstatus(
  pago: Empresa,
): string {
  if (
    getPagoPagado(pago)
  ) {
    return "Pagado";
  }

  if (
    getPagoEsConsulta(pago)
  ) {
    return "Consulta Conekta";
  }

  return "Sin pago";
}

function getPagoTooltip(
  pago: Empresa,
): string {
  if (
    getPagoPagado(pago)
  ) {
    return "Pago confirmado y aplicado correctamente.";
  }

  if (
    getPagoEsConsulta(pago)
  ) {
    return "El cliente consultó o generó un link de pago Conekta, pero no terminó el pago. El link es personal y puede expirar rápidamente.";
  }

  return "No hay pago confirmado para este registro.";
}

function formatCurrency(
  value: unknown,
): string {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    return "$0.00";
  }

  return new Intl.NumberFormat(
    "es-MX",
    {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(amount);
}

function getPaqueteImage(
  paquete: Empresa,
): string | null {
  const raw = firstValue(
    paquete,
    "ruta",
    "url_imagen",
    "imagen",
  );

  if (
    typeof raw !== "string" ||
    raw.trim() === ""
  ) {
    return null;
  }

  return raw
    .trim()
    .replace(
      /^http:\/\//i,
      "https://",
    );
}

type AssignmentPackageImageProps = {
  src: string | null;
  nombre: string;
};

function AssignmentPackageImage({
  src,
  nombre,
}: AssignmentPackageImageProps) {
  const [imageError, setImageError] =
    useState(false);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  const showImage =
    Boolean(src) && !imageError;

  return (
    <Box
      sx={{
        width: "100%",
        height: 132,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "action.hover",
        borderBottom: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      {showImage ? (
        <Box
          component="img"
          src={src ?? undefined}
          alt={nombre}
          loading="lazy"
          onError={() =>
            setImageError(true)
          }
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <Stack
          spacing={0.5}
          alignItems="center"
          justifyContent="center"
          sx={{
            width: "100%",
            height: "100%",
          }}
        >
          <ImageNotSupportedOutlinedIcon
            sx={{
              fontSize: 28,
              color: "text.disabled",
            }}
          />

          <Typography
            fontSize={10}
            fontWeight={700}
            color="text.secondary"
          >
            Sin imagen
          </Typography>
        </Stack>
      )}
    </Box>
  );
}

function isEmpresaActiva(
  empresa: Empresa | null,
): boolean {
  if (!empresa) {
    return false;
  }

  const activo = firstValue(
    empresa,
    "activo",
    "is_active",
  );

  if (activo !== null) {
    return getBooleanValue(
      activo,
    );
  }

  const estado = String(
    firstValue(
      empresa,
      "estado",
      "estatus",
      "status",
    ) ?? "",
  )
    .trim()
    .toLowerCase();

  return (
    estado.includes("activ") &&
    !estado.includes("desactiv") &&
    !estado.includes("inactiv")
  );
}

/*
|--------------------------------------------------------------------------
| COMPONENTE PRINCIPAL
|--------------------------------------------------------------------------
*/

export default function TaecontaSystemEmpresas({
  filters,
}: Props) {
  const theme =
    useTheme();

  const isDark =
    theme.palette.mode ===
    "dark";

  const isMobile =
    useMediaQuery(
      theme.breakpoints.down(
        "md",
      ),
    );

  /*
  |--------------------------------------------------------------------------
  | ESTADO
  |--------------------------------------------------------------------------
  */

  const [
    empresas,
    setEmpresas,
  ] =
    useState<Empresa[]>([]);

  const [
    indicadores,
    setIndicadores,
  ] =
    useState<
      Indicador[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    localSearch,
    setLocalSearch,
  ] =
    useState("");

  const [
    vigenciaFilter,
    setVigenciaFilter,
  ] =
    useState<CuentaVigenciaFilter>(
      () => {
        const stored =
          sessionStorage.getItem(
            CUENTA_FILTER_KEY,
          );

        if (
          stored === "vigentes" ||
          stored === "proximas7" ||
          stored === "proximas30" ||
          stored === "vencidas" ||
          stored === "todas"
        ) {
          return stored;
        }

        return "todas";
      },
    );

  const [
    vigenciaCounts,
    setVigenciaCounts,
  ] = useState({
    todas: 0,
    vigentes: 0,
    proximas7: 0,
    proximas30: 0,
    vencidas: 0,
  });

  const [
    page,
    setPage,
  ] =
    useState(0);

  const [
    rowsPerPage,
    setRowsPerPage,
  ] =
    useState(20);

  /*
  |--------------------------------------------------------------------------
  | ESTADO DE ACCIONES DE CUENTA
  |--------------------------------------------------------------------------
  */


  const [
    selectedEmpresa,
    setSelectedEmpresa,
  ] =
    useState<Empresa | null>(
      null,
    );

  const [
    activeAction,
    setActiveAction,
  ] =
    useState<CuentaAccion | null>(
      null,
    );

  const [
    actionLoading,
    setActionLoading,
  ] =
    useState(false);

  const [
    actionSaving,
    setActionSaving,
  ] =
    useState(false);

  const [
    actionError,
    setActionError,
  ] =
    useState("");

  const [
    notice,
    setNotice,
  ] =
    useState("");

  const [
    pagos,
    setPagos,
  ] =
    useState<Empresa[]>([]);

  const [
    socioData,
    setSocioData,
  ] =
    useState<Record<string, any> | null>(
      null,
    );

  const [
    socioEditorOpen,
    setSocioEditorOpen,
  ] =
    useState(false);

  const [
    despachoInfo,
    setDespachoInfo,
  ] =
    useState<Empresa | null>(
      null,
    );

  const [
    vigenciaValue,
    setVigenciaValue,
  ] =
    useState("");

  const [
    selectedIndicadores,
    setSelectedIndicadores,
  ] =
    useState<number[]>([]);

  const [
    assignmentType,
    setAssignmentType,
  ] =
    useState<TipoAsignacion>(
      "timbres",
    );

  const [
    assignmentCantidad,
    setAssignmentCantidad,
  ] =
    useState("1");

  const [
    assignmentMonto,
    setAssignmentMonto,
  ] =
    useState("0");

  const [
    assignmentMetodoPago,
    setAssignmentMetodoPago,
  ] =
    useState("");

  const [
    assignmentBanco,
    setAssignmentBanco,
  ] =
    useState("");

  const [
    assignmentPaqueteId,
    setAssignmentPaqueteId,
  ] =
    useState("");

  const [
    assignmentPlanId,
    setAssignmentPlanId,
  ] =
    useState("");

  const [
    paquetes,
    setPaquetes,
  ] =
    useState<Empresa[]>([]);

  const [
    planes,
    setPlanes,
  ] =
    useState<Empresa[]>([]);

  const [
    deleteTimbresCantidad,
    setDeleteTimbresCantidad,
  ] =
    useState("1");

  const [
    contabilidadHab,
    setContabilidadHab,
  ] =
    useState(true);

  const [
    certificadoTipo,
    setCertificadoTipo,
  ] =
    useState<TipoCertificado>(
      "cert",
    );

  /*
  |--------------------------------------------------------------------------
  | CATÁLOGO
  |--------------------------------------------------------------------------
  */

  const indicadorMap =
    useMemo(() => {
      return new Map<
        number,
        Indicador
      >(
        indicadores.map(
          (
            indicador,
          ) => [
            indicador.id,
            indicador,
          ],
        ),
      );
    }, [indicadores]);

  /*
  |--------------------------------------------------------------------------
  | CARGAR DATOS
  |--------------------------------------------------------------------------
  */

  const cargar =
    useCallback(async () => {
      setLoading(true);

      setError("");

      try {
        const [
          empresasResponse,
          indicadoresResponse,
        ] =
          await Promise.all([
            getTaecontaSystemEmpresas({
              vigencia:
                vigenciaFilter,
            }),
            getTaecontaSystemIndicadores(),
          ]);

        setEmpresas(
          extractArray(
            empresasResponse,
          ),
        );

        setIndicadores(
          extractIndicadores(
            indicadoresResponse,
          ),
        );

        const counts =
          empresasResponse
            ?.meta
            ?.counts;

        setVigenciaCounts({
          todas:
            Number(
              counts
                ?.todas ??
                0,
            ) || 0,

          vigentes:
            Number(
              counts
                ?.vigentes ??
                0,
            ) || 0,

          proximas7:
            Number(
              counts
                ?.proximas7 ??
                0,
            ) || 0,

          proximas30:
            Number(
              counts
                ?.proximas30 ??
                0,
            ) || 0,

          vencidas:
            Number(
              counts
                ?.vencidas ??
                0,
            ) || 0,
        });
      } catch (
        requestError: any
      ) {
        console.error(
          "ERROR CUENTAS TAECONTA:",
          requestError,
        );

        setEmpresas([]);

        setError(
          requestError
            ?.response
            ?.data
            ?.message ||
            requestError
              ?.message ||
            "No fue posible consultar las cuentas de TAECONTA.",
        );
      } finally {
        setLoading(false);
      }
    }, [vigenciaFilter]);

  /*
  |--------------------------------------------------------------------------
  | ACCIONES
  |--------------------------------------------------------------------------
  */

  const cerrarDialogoAccion = () => {
    if (actionSaving) {
      return;
    }

    setSocioEditorOpen(false);
    setActiveAction(null);
    setSelectedEmpresa(null);
    setActionError("");
    setActionLoading(false);
  };

  const abrirAccion = async (
    action: CuentaAccion,
    empresaSeleccionada?: Empresa,
  ) => {
    const empresa =
      empresaSeleccionada ??
      selectedEmpresa;

    const empresaId =
      getEmpresaId(
        empresa,
      );

    if (
      !empresa ||
      !empresaId
    ) {
      setNotice(
        "No fue posible identificar la cuenta seleccionada.",
      );

      return;
    }

    setSelectedEmpresa(empresa);
    setActionError("");
    setActiveAction(
      action,
    );

    setPagos([]);
    setSocioData(null);

    if (
      action === "vigencia"
    ) {
      const rawDate = String(
        getExpiration(
          empresa,
        ) ?? "",
      );

      setVigenciaValue(
        rawDate.slice(
          0,
          10,
        ),
      );
    }

    if (
      action === "indicadores"
    ) {
      setSelectedIndicadores(
        getIndicadoresEmpresa(
          empresa,
          indicadorMap,
        )
          .map(
            (item) =>
              item.id,
          )
          .filter(
            (id) => id > 0,
          ),
      );
    }

    if (
      action === "asignacion"
    ) {
      setAssignmentType(
        "timbres",
      );
      setAssignmentCantidad(
        "1",
      );
      setAssignmentMonto("0");
      setAssignmentMetodoPago("");
      setAssignmentBanco("");
      setAssignmentPaqueteId("");
      setAssignmentPlanId("");
    }

    if (
      action ===
      "eliminar-timbres"
    ) {
      setDeleteTimbresCantidad(
        "1",
      );
    }

    if (
      action ===
      "contabilidad"
    ) {
      setContabilidadHab(true);
    }

    if (
      action ===
      "certificados"
    ) {
      setCertificadoTipo(
        "cert",
      );
    }

    if (
      ![
        "pagos",
        "socio",
        "asignacion",
        "certificados",
      ].includes(action)
    ) {
      return;
    }

    setActionLoading(true);

    try {
      if (
        action === "pagos"
      ) {
        const response =
          await getTaecontaSystemEmpresaPagos(
            empresaId,
          );

        setPagos(
          extractArray(
            response,
          ),
        );
      }

      if (
        action === "socio" ||
        action === "certificados"
      ) {
        const response =
          await getTaecontaSystemEmpresaSocio(
            empresaId,
          );

        setSocioData(
          (response?.data ??
            null) as Record<
            string,
            any
          > | null,
        );
      }

      if (
        action ===
        "asignacion"
      ) {
        const [
          paquetesResponse,
          planesResponse,
        ] = await Promise.all([
          getTaecontaSystemPaquetes(),
          getTaecontaSystemPlanes(),
        ]);

        setPaquetes(
          extractArray(
            paquetesResponse,
          ),
        );

        setPlanes(
          extractArray(
            planesResponse,
          ),
        );
      }
    } catch (requestError: any) {
      setActionError(
        getRequestMessage(
          requestError,
          "No fue posible cargar la información de la cuenta.",
        ),
      );
    } finally {
      setActionLoading(false);
    }
  };

  const refrescarSocioDespuesDeEditar = async (
    message?: string,
  ) => {
    const empresaId =
      getEmpresaId(
        selectedEmpresa,
      );

    if (!empresaId) {
      if (message) {
        setNotice(message);
      }

      return;
    }

    try {
      const response =
        await getTaecontaSystemEmpresaSocio(
          empresaId,
        );

      setSocioData(
        (response?.data ??
          null) as Record<
          string,
          any
        > | null,
      );
    } catch (
      requestError: any
    ) {
      console.error(
        "ERROR REFRESCANDO SOCIO TAECONTA:",
        requestError,
      );
    }

    await cargar();

    if (message) {
      setNotice(message);
    }
  };

  const guardarAccion = async () => {
    const empresaId =
      getEmpresaId(
        selectedEmpresa,
      );

    if (
      !empresaId ||
      !activeAction
    ) {
      setActionError(
        "No fue posible identificar la cuenta seleccionada.",
      );

      return;
    }

    setActionError("");
    setActionSaving(true);

    try {
      let response: any;
      let fallback =
        "Operación realizada correctamente.";

      if (
        activeAction ===
        "vigencia"
      ) {
        if (!vigenciaValue) {
          throw new Error(
            "Selecciona la nueva fecha de vigencia.",
          );
        }

        response =
          await updateTaecontaSystemEmpresaVigencia(
            empresaId,
            {
              fecha:
                vigenciaValue,
            },
          );

        fallback =
          "Vigencia actualizada correctamente.";
      }

      if (
        activeAction ===
        "indicadores"
      ) {
        response =
          await updateTaecontaSystemEmpresaIndicadores(
            empresaId,
            {
              indicador:
                selectedIndicadores.join(
                  ",",
                ),
            },
          );

        fallback =
          "Indicadores actualizados correctamente.";
      }

      if (
        activeAction ===
        "estado"
      ) {
        response =
          await toggleTaecontaSystemEmpresaEstado(
            empresaId,
          );

        fallback =
          "Estado de la cuenta actualizado correctamente.";
      }

      if (
        activeAction ===
        "asignacion"
      ) {
        const cantidad = Number(
          assignmentCantidad,
        );

        const montoFolio = Number(
          assignmentMonto,
        );

        if (
          assignmentType ===
            "timbres" &&
          (!Number.isFinite(
            cantidad,
          ) ||
            cantidad <= 0)
        ) {
          throw new Error(
            "La cantidad de timbres debe ser mayor que cero.",
          );
        }

        if (
          assignmentType ===
            "paquete" &&
          !assignmentPaqueteId
        ) {
          throw new Error(
            "Selecciona un paquete.",
          );
        }

        if (
          assignmentType ===
            "plan" &&
          !assignmentPlanId
        ) {
          throw new Error(
            "Selecciona un plan.",
          );
        }

        response =
          await assignTaecontaSystemEmpresa(
            empresaId,
            {
              tipo_asignacion:
                assignmentType,
              ...(assignmentType ===
              "timbres"
                ? {
                    cantidad,
                    montoFolio:
                      Number.isFinite(
                        montoFolio,
                      )
                        ? montoFolio
                        : 0,
                  }
                : {}),
              ...(assignmentType ===
                "paquete" &&
              assignmentPaqueteId
                ? {
                    paquete_id:
                      Number(
                        assignmentPaqueteId,
                      ),
                  }
                : {}),
              ...(assignmentType ===
                "plan" &&
              assignmentPlanId
                ? {
                    plan_id:
                      Number(
                        assignmentPlanId,
                      ),
                  }
                : {}),
              ...(assignmentMetodoPago.trim()
                ? {
                    metodoPago:
                      assignmentMetodoPago.trim(),
                  }
                : {}),
              ...(assignmentBanco.trim()
                ? {
                    bancoSelect:
                      assignmentBanco.trim(),
                  }
                : {}),
            },
          );

        fallback =
          "Asignación realizada correctamente.";
      }

      if (
        activeAction ===
        "eliminar-timbres"
      ) {
        const cantidad = Number(
          deleteTimbresCantidad,
        );

        if (
          !Number.isInteger(
            cantidad,
          ) ||
          cantidad <= 0
        ) {
          throw new Error(
            "La cantidad a retirar debe ser un número entero mayor que cero.",
          );
        }

        response =
          await deleteTaecontaSystemEmpresaTimbres(
            empresaId,
            {
              cantidad,
            },
          );

        fallback =
          "Timbres retirados correctamente.";
      }

      if (
        activeAction ===
        "contabilidad"
      ) {
        response =
          await updateTaecontaSystemEmpresaContabilidad(
            empresaId,
            {
              hab:
                contabilidadHab,
            },
          );

        fallback = contabilidadHab
          ? "Contabilidad habilitada correctamente."
          : "Contabilidad deshabilitada correctamente.";
      }

      if (
        activeAction ===
        "certificados"
      ) {
        response =
          await deleteTaecontaSystemEmpresaCertificado(
            empresaId,
            {
              archivo:
                certificadoTipo,
            },
          );

        fallback =
          "Referencia del certificado eliminada correctamente.";
      }

      setNotice(
        actionResponseMessage(
          response,
          fallback,
        ),
      );

      setActiveAction(null);
      setSelectedEmpresa(null);

      await cargar();
    } catch (requestError: any) {
      setActionError(
        getRequestMessage(
          requestError,
          "No fue posible completar la operación.",
        ),
      );
    } finally {
      setActionSaving(false);
    }
  };

  useEffect(() => {
    void cargar();
  }, [cargar]);

  useEffect(() => {
    sessionStorage.setItem(
      CUENTA_FILTER_KEY,
      vigenciaFilter,
    );
  }, [vigenciaFilter]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (
      sessionStorage.getItem(
        CUENTA_FOCUS_KEY,
      ) !== "1"
    ) {
      return;
    }

    sessionStorage.removeItem(
      CUENTA_FOCUS_KEY,
    );

    window.setTimeout(() => {
      document
        .getElementById(
          "taeconta-cuentas",
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 120);
  }, [loading]);

  /*
  |--------------------------------------------------------------------------
  | FILTRADO
  |--------------------------------------------------------------------------
  */

  const filtered =
    useMemo(() => {
      const globalSearch =
        filters.search
          .trim()
          .toLowerCase();

      const tableSearch =
        localSearch
          .trim()
          .toLowerCase();

      return empresas.filter(
        (empresa) => {
          const companyIndicators =
            getIndicadoresEmpresa(
              empresa,
              indicadorMap,
            );

          const searchable =
            [
              getNombre(
                empresa,
              ),

              getRfc(
                empresa,
              ),

              getCorreo(
                empresa,
              ),

              getPersona(
                empresa,
              ),

              firstValue(
                empresa,
                "telefono",
                "phone",
              ),

              companyIndicators
                .map(
                  (
                    indicador,
                  ) =>
                    indicador.nombre,
                )
                .join(" "),
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

          if (
            globalSearch &&
            !searchable.includes(
              globalSearch,
            )
          ) {
            return false;
          }

          if (
            tableSearch &&
            !searchable.includes(
              tableSearch,
            )
          ) {
            return false;
          }

          /*
           * FILTRO INDICADOR
           */
          if (
            filters.indicadorId !==
            ""
          ) {
            const targetId =
              Number(
                filters.indicadorId,
              );

            const hasIndicator =
              companyIndicators.some(
                (
                  indicador,
                ) =>
                  indicador.id ===
                  targetId,
              );

            if (
              !hasIndicator
            ) {
              return false;
            }
          }

          /*
           * FILTRO VIGENCIA
           */
          if (
            filters.year !== "" ||
            filters.month !== ""
          ) {
            const expiration =
              parseDate(
                getExpiration(
                  empresa,
                ),
              );

            if (!expiration) {
              return false;
            }

            if (
              filters.year !==
                "" &&
              expiration.getFullYear() !==
                Number(
                  filters.year,
                )
            ) {
              return false;
            }

            if (
              filters.month !==
                "" &&
              expiration.getMonth() +
                1 !==
                Number(
                  filters.month,
                )
            ) {
              return false;
            }
          }

          return true;
        },
      );
    }, [
      empresas,
      indicadorMap,
      filters.search,
      filters.month,
      filters.year,
      filters.indicadorId,
      localSearch,
    ]);

  /*
  |--------------------------------------------------------------------------
  | RESET PÁGINA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setPage(0);
  }, [
    filters.search,
    filters.month,
    filters.year,
    filters.indicadorId,
    localSearch,
    vigenciaFilter,
    rowsPerPage,
  ]);

  /*
  |--------------------------------------------------------------------------
  | EVITAR PÁGINA INVÁLIDA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const maxPage =
      Math.max(
        0,

        Math.ceil(
          filtered.length /
            rowsPerPage,
        ) - 1,
      );

    if (
      page > maxPage
    ) {
      setPage(
        maxPage,
      );
    }
  }, [
    filtered.length,
    page,
    rowsPerPage,
  ]);

  /*
  |--------------------------------------------------------------------------
  | PAGINACIÓN LOCAL
  |--------------------------------------------------------------------------
  */

  const paginated =
    useMemo(() => {
      const start =
        page *
        rowsPerPage;

      return filtered.slice(
        start,
        start +
          rowsPerPage,
      );
    }, [
      filtered,
      page,
      rowsPerPage,
    ]);

  /*
  |--------------------------------------------------------------------------
  | CONTENIDO DE ACCIONES
  |--------------------------------------------------------------------------
  */

  const selectedEmpresaId =
    getEmpresaId(
      selectedEmpresa,
    );

  const selectedEmpresaNombre =
    selectedEmpresa
      ? getNombre(
          selectedEmpresa,
        )
      : "Cuenta";

  const currentActive =
    isEmpresaActiva(
      selectedEmpresa,
    );

  const actionTitle =
    activeAction === "pagos"
      ? "Pagos registrados"
      : activeAction === "socio"
        ? "Información del socio"
        : activeAction === "vigencia"
          ? "Vigencia"
          : activeAction === "indicadores"
            ? "Administrar indicadores"
            : activeAction === "asignacion"
              ? "Asignación administrativa"
              : activeAction === "eliminar-timbres"
                ? "Retirar timbres"
                : activeAction === "estado"
                  ? "Cambiar estado"
                  : activeAction === "contabilidad"
                    ? "Contabilidad"
                    : activeAction === "certificados"
                      ? "Eliminar certificado o llave"
                      : "Cuenta TAECONTA";

  const actionIsReadOnly =
    activeAction === "pagos" ||
    activeAction === "socio";


  const renderActionContent = () => {
    if (actionLoading) {
      return (
        <Box
          sx={{
            minHeight: 180,
            display: "grid",
            placeItems: "center",
          }}
        >
          <Stack
            spacing={1}
            alignItems="center"
          >
            <CircularProgress
              size={28}
            />

            <Typography
              fontSize={11}
              color="text.secondary"
            >
              Consultando TAECONTA...
            </Typography>
          </Stack>
        </Box>
      );
    }

    if (
      activeAction === "pagos"
    ) {
      const pagosOrdenados =
        ordenarPagos(
          pagos,
        );

      const totalPagados =
        pagosOrdenados.filter(
          (pago) =>
            getPagoPagado(
              pago,
            ),
        ).length;

      const totalConsultas =
        pagosOrdenados.filter(
          (pago) =>
            getPagoEsConsulta(
              pago,
            ),
        ).length;

      if (
        pagosOrdenados.length ===
        0
      ) {
        return (
          <Alert severity="info">
            Esta cuenta no tiene pagos registrados.
          </Alert>
        );
      }

      return (
        <Stack spacing={2}>
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1}
          >
            <Chip
              label={`Pagados: ${totalPagados}`}
              color="success"
              sx={{
                fontWeight: 900,
                width:
                  "fit-content",
              }}
            />

            <Chip
              label={`Consultas sin pago: ${totalConsultas}`}
              color="warning"
              variant="outlined"
              sx={{
                fontWeight: 900,
                width:
                  "fit-content",
              }}
            />
          </Stack>

          <TableContainer
            component={Paper}
            sx={{
              border:
                "1px solid",
              borderColor:
                "divider",
              borderRadius: 2,
              overflowX: "auto",
              bgcolor:
                "background.paper",
            }}
          >
            <Table
              size="small"
              sx={{
                minWidth: 980,
              }}
            >
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor:
                      "primary.main",
                  }}
                >
                  {[
                    "Fecha",
                    "Estatus",
                    "Detalle",
                    "Método",
                    "Banco",
                    "Créditos",
                    "Monto",
                    "CFDI",
                  ].map(
                    (label) => (
                      <TableCell
                        key={label}
                        align={
                          [
                            "Créditos",
                            "Monto",
                          ].includes(
                            label,
                          )
                            ? "right"
                            : "left"
                        }
                        sx={{
                          color:
                            "primary.contrastText",
                          fontWeight: 900,
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {label}
                      </TableCell>
                    ),
                  )}
                </TableRow>
              </TableHead>

              <TableBody>
                {pagosOrdenados.map(
                  (
                    pago,
                    index,
                  ) => {
                    const pagado =
                      getPagoPagado(
                        pago,
                      );

                    const consulta =
                      getPagoEsConsulta(
                        pago,
                      );

                    const gatewayId =
                      firstValue(
                        pago,
                        "gateway_id",
                      );

                    const folios =
                      Number(
                        firstValue(
                          pago,
                          "Folios",
                          "folios",
                          "cantidad_folios",
                          "cantidad_timbres",
                        ) ?? 0,
                      );

                    const cfdiId =
                      firstValue(
                        pago,
                        "cfdi_id",
                      );

                    return (
                      <TableRow
                        key={String(
                          firstValue(
                            pago,
                            "id",
                          ) ?? index,
                        )}
                        hover
                        sx={{
                          bgcolor:
                            pagado
                              ? alpha(
                                  theme.palette.success.main,
                                  0.06,
                                )
                              : consulta
                                ? alpha(
                                    theme.palette.warning.main,
                                    0.07,
                                  )
                                : "background.paper",
                        }}
                      >
                        <TableCell
                          sx={{
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          <Typography
                            fontWeight={800}
                            fontSize={12}
                          >
                            {formatPagoFecha(
                              getPagoFechaMostrada(
                                pago,
                              ),
                            )}
                          </Typography>

                          <Typography
                            color="text.secondary"
                            fontSize={10}
                          >
                            {pagado
                              ? "Fecha de pago"
                              : "Fecha de consulta"}
                          </Typography>
                        </TableCell>

                        <TableCell
                          sx={{
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          <Tooltip
                            arrow
                            title={getPagoTooltip(
                              pago,
                            )}
                          >
                            <Chip
                              size="small"
                              label={getPagoEstatus(
                                pago,
                              )}
                              color={
                                pagado
                                  ? "success"
                                  : consulta
                                    ? "warning"
                                    : "default"
                              }
                              variant={
                                pagado
                                  ? "filled"
                                  : "outlined"
                              }
                              sx={{
                                fontWeight: 900,
                              }}
                            />
                          </Tooltip>
                        </TableCell>

                        <TableCell>
                          <Box>
                            <>
                              <Typography
                                fontWeight={800}
                                fontSize={12}
                              >
                                {getPagoDetalle(
                                  pago,
                                )}
                              </Typography>

                              {Boolean(
                                gatewayId,
                              ) && (
                                <Typography
                                  color="text.secondary"
                                  fontSize={10}
                                  sx={{
                                    display:
                                      "block",
                                    maxWidth:
                                      220,
                                    overflowWrap:
                                      "anywhere",
                                  }}
                                >
                                  {`Gateway: ${String(
                                    gatewayId,
                                  )}`}
                                </Typography>
                              )}
                            </>
                          </Box>
                        </TableCell>

                        <TableCell
                          sx={{
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {String(
                            firstValue(
                              pago,
                              "metodo_pago",
                              "metodoPago",
                            ) ??
                              "No confirmado",
                          ) || "No confirmado"}
                        </TableCell>

                        <TableCell
                          sx={{
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {String(
                            firstValue(
                              pago,
                              "Banco",
                              "banco",
                              "bancoSelect",
                            ) ??
                              "Sin banco",
                          )}
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          <Typography
                            fontWeight={900}
                          >
                            {Number.isFinite(
                              folios,
                            )
                              ? folios.toLocaleString(
                                  "es-MX",
                                )
                              : "0"}
                          </Typography>
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          <Typography
                            fontWeight={900}
                          >
                            {getPagoMonto(
                              pago,
                            )}
                          </Typography>
                        </TableCell>

                        <TableCell
                          sx={{
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {cfdiId ? (
                            <Chip
                              size="small"
                              label={`#${String(
                                cfdiId,
                              )}`}
                              color="primary"
                              variant="outlined"
                              sx={{
                                fontWeight: 800,
                              }}
                            />
                          ) : (
                            <Typography
                              color="text.secondary"
                              fontSize={12}
                            >
                              —
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  },
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      );
    }

    if (
      activeAction === "socio"
    ) {
      const empresa =
        socioData?.empresa ?? {};
      const usuario =
        socioData?.usuario ?? {};
      const sellos =
        socioData?.sellos ?? {};

      const nombreEmpresa =
        firstValue(
          empresa,
          "nombre",
          "razon_social",
        );

      const rfcEmpresa =
        firstValue(
          empresa,
          "rfc",
        );

      const regimenEmpresa =
        firstValue(
          empresa,
          "regimen_nombre",
          "regimen",
        );

      const regimenCodigo =
        firstValue(
          empresa,
          "regimen_codigo",
        );

      const correoUsuario =
        firstValue(
          usuario,
          "correo",
          "email",
        );

      const nombreUsuario =
        firstValue(
          usuario,
          "nombre",
          "name",
        );

      const estadoCuenta =
        getEstado(
          selectedEmpresa ??
            empresa,
        );

      const logoNombre =
  String(
    firstValue(
      empresa,
      "logo_nombre",
      "logo",
    ) ?? "",
  ).trim();

const nombreParaLogo =
  String(
    firstValue(
      empresa,
      "nombre",
      "razon_social",
    ) ?? "",
  )
    .trim()
    .replace(/\s+/g, "_")
    .toLowerCase()
    .replace(/ñ/g, "Ñ");

const logoUrlDirecto =
  String(
    firstValue(
      empresa,
      "logo_url",
      "logoUrl",
    ) ?? "",
  ).trim();

const logoUrl =
  logoUrlDirecto ||
  (
    logoNombre &&
    nombreParaLogo
      ? `https://taeconta.com/api/public/api/mostrar-imagen/${nombreParaLogo}/${logoNombre}`
      : ""
  );

      return (
        <Grid
          container
          spacing={2}
        >
          <Grid
            item
            xs={12}
            md={8}
          >
            <Paper
              elevation={0}
              sx={{
                p: {
                  xs: 1.5,
                  md: 2,
                },
                border:
                  "1px solid",
                borderColor:
                  "divider",
                borderRadius: 2,
                height: "100%",
              }}
            >
              <Stack spacing={1.5}>
                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <BusinessOutlinedIcon
                      sx={{
                        color:
                          "text.secondary",
                        fontSize: 20,
                      }}
                    />

                    <Typography
                      color="text.secondary"
                      fontSize={11}
                    >
                      Nombre empresarial
                    </Typography>
                  </Stack>

                  <Typography
                    fontWeight={900}
                    fontSize={14}
                    mt={0.45}
                    sx={{
                      overflowWrap:
                        "anywhere",
                    }}
                  >
                    {String(
                      nombreEmpresa ??
                        "—",
                    ).toUpperCase()}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography
                    color="text.secondary"
                    fontSize={11}
                  >
                    RFC
                  </Typography>

                  <Typography
                    fontWeight={850}
                    mt={0.35}
                  >
                    {String(
                      rfcEmpresa ??
                        "—",
                    ).toUpperCase()}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography
                    color="text.secondary"
                    fontSize={11}
                  >
                    Régimen
                  </Typography>

                  <Typography
                    fontWeight={700}
                    mt={0.35}
                    sx={{
                      overflowWrap:
                        "anywhere",
                    }}
                  >
                    {regimenCodigo
                      ? `${String(regimenCodigo)} - ${String(
                          regimenEmpresa ??
                            "—",
                        )}`
                      : String(
                          regimenEmpresa ??
                            "—",
                        )}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <CalendarMonthOutlinedIcon
                      sx={{
                        color:
                          "text.secondary",
                        fontSize: 20,
                      }}
                    />

                    <Typography
                      color="text.secondary"
                      fontSize={11}
                    >
                      Fecha de registro
                    </Typography>
                  </Stack>

                  <Typography
                    fontWeight={700}
                    mt={0.4}
                  >
                    {formatLongDate(
                      firstValue(
                        empresa,
                        "created_at",
                      ),
                    )}
                  </Typography>
                </Box>

                <Divider />

                <Grid
                  container
                  spacing={2}
                >
                  <Grid
                    item
                    xs={12}
                    sm={7}
                  >
                    <Typography
                      color="text.secondary"
                      fontSize={11}
                    >
                      Correo
                    </Typography>

                    <Typography
                      fontWeight={700}
                      mt={0.35}
                      sx={{
                        overflowWrap:
                          "anywhere",
                      }}
                    >
                      {String(
                        correoUsuario ??
                          "—",
                      )}
                    </Typography>

                    <Typography
                      color="text.secondary"
                      fontSize={9.5}
                      mt={0.25}
                    >
                      Usuario: {String(
                        nombreUsuario ??
                          "—",
                      )}
                    </Typography>
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={5}
                  >
                    <Typography
                      color="text.secondary"
                      fontSize={11}
                    >
                      Estado de la cuenta
                    </Typography>

                    <Chip
                      size="small"
                      label={
                        estadoCuenta.label
                      }
                      color={
                        estadoCuenta.color
                      }
                      sx={{
                        mt: 0.5,
                        fontWeight: 850,
                      }}
                    />
                  </Grid>
                </Grid>

                <Divider />

                <Box>
                  <Typography
                    fontWeight={900}
                    fontSize={11}
                    mb={0.8}
                  >
                    Sellos
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={0.7}
                    useFlexGap
                    flexWrap="wrap"
                  >
                    <Chip
                      size="small"
                      variant="outlined"
                      color={
                        getBooleanValue(
                          firstValue(
                            sellos,
                            "certificado",
                          ),
                        )
                          ? "success"
                          : "default"
                      }
                      label={
                        getBooleanValue(
                          firstValue(
                            sellos,
                            "certificado",
                          ),
                        )
                          ? "CSD disponible"
                          : "Sin CSD"
                      }
                    />

                    <Chip
                      size="small"
                      variant="outlined"
                      color={
                        getBooleanValue(
                          firstValue(
                            sellos,
                            "llave",
                          ),
                        )
                          ? "success"
                          : "default"
                      }
                      label={
                        getBooleanValue(
                          firstValue(
                            sellos,
                            "llave",
                          ),
                        )
                          ? "Llave disponible"
                          : "Sin llave"
                      }
                    />

                    <Chip
                      size="small"
                      variant="outlined"
                      color={
                        getBooleanValue(
                          firstValue(
                            sellos,
                            "certificado2",
                          ),
                        )
                          ? "success"
                          : "default"
                      }
                      label={
                        getBooleanValue(
                          firstValue(
                            sellos,
                            "certificado2",
                          ),
                        )
                          ? "e.firma disponible"
                          : "Sin e.firma"
                      }
                    />
                  </Stack>
                </Box>

                <Divider />

                <Box>
                  <Typography
                    fontWeight={900}
                    fontSize={11}
                    mb={0.8}
                  >
                    Administración disponible
                  </Typography>

                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    spacing={0.8}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={
                        <AccountBalanceOutlinedIcon />
                      }
                      onClick={() =>
                        void abrirAccion(
                          "contabilidad",
                        )
                      }
                      sx={{
                        textTransform:
                          "none",
                        fontWeight: 800,
                      }}
                    >
                      Contabilidad
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={
                        <VpnKeyOutlinedIcon />
                      }
                      onClick={() =>
                        void abrirAccion(
                          "certificados",
                        )
                      }
                      sx={{
                        textTransform:
                          "none",
                        fontWeight: 800,
                      }}
                    >
                      Certificados / llaves
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid
            item
            xs={12}
            md={4}
          >
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                border:
                  "1px solid",
                borderColor:
                  "divider",
                borderRadius: 2,
                height: "100%",
                minHeight: 310,
              }}
            >
              <Typography
                color="text.secondary"
                fontSize={11}
                mb={1}
              >
                Logo
              </Typography>

              <Box
                sx={{
                  minHeight: 260,
                  height: "calc(100% - 28px)",
                  borderRadius: 1.5,
                  bgcolor:
                    "action.hover",
                  display: "grid",
                  placeItems:
                    "center",
                  overflow: "hidden",
                }}
              >
                {logoUrl ? (
                  <Box
                    component="img"
                    src={logoUrl}
                    alt={String(
                      logoNombre ??
                        "Logo",
                    )}
                    sx={{
                      width: "100%",
                      height: "100%",
                      maxHeight: 300,
                      objectFit:
                        "contain",
                      p: 1.5,
                    }}
                  />
                ) : (
                  <Stack
                    spacing={0.75}
                    alignItems="center"
                  >
                    <Box
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius:
                          "50%",
                        bgcolor:
                          "action.disabledBackground",
                        display:
                          "grid",
                        placeItems:
                          "center",
                      }}
                    >
                      <BusinessOutlinedIcon
                        sx={{
                          color:
                            "text.disabled",
                          fontSize: 30,
                        }}
                      />
                    </Box>

                    <Typography
                      color="text.secondary"
                      fontSize={11}
                      fontWeight={700}
                    >
                      {logoNombre
                        ? String(
                            logoNombre,
                          )
                        : "Sin logo"}
                    </Typography>
                  </Stack>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      );
    }

    if (
      activeAction === "vigencia"
    ) {
      return (
        <Box
          sx={{
            py: 0.5,
          }}
        >
          <TextField
            fullWidth
            type="date"
            value={vigenciaValue}
            onChange={(event) =>
              setVigenciaValue(
                event.target.value,
              )
            }
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                minHeight: 44,
                borderRadius: 1,
                bgcolor:
                  "background.paper",
              },
              "& input": {
                fontSize: 14,
              },
            }}
          />
        </Box>
      );
    }

    if (
      activeAction === "indicadores"
    ) {
      return (
        <Stack spacing={1.25}>
          <Alert severity="info">
            Selecciona los indicadores que debe conservar esta cuenta.
          </Alert>

          {indicadores.length ===
          0 ? (
            <Typography
              color="text.secondary"
              fontSize={11}
            >
              No hay indicadores disponibles.
            </Typography>
          ) : (
            <FormGroup>
              {indicadores.map(
                (indicador) => (
                  <FormControlLabel
                    key={
                      indicador.id
                    }
                    control={
                      <Checkbox
                        size="small"
                        checked={selectedIndicadores.includes(
                          indicador.id,
                        )}
                        onChange={(
                          event,
                        ) => {
                          setSelectedIndicadores(
                            (
                              current,
                            ) =>
                              event
                                .target
                                .checked
                                ? [
                                    ...current,
                                    indicador.id,
                                  ]
                                : current.filter(
                                    (
                                      id,
                                    ) =>
                                      id !==
                                      indicador.id,
                                  ),
                          );
                        }}
                      />
                    }
                    label={
                      <Stack
                        direction="row"
                        spacing={0.7}
                        alignItems="center"
                      >
                        <Box
                          sx={{
                            width: 9,
                            height: 9,
                            borderRadius:
                              "50%",
                            bgcolor:
                              indicador.color,
                          }}
                        />

                        <Typography
                          fontSize={11}
                        >
                          {
                            indicador.nombre
                          }
                        </Typography>
                      </Stack>
                    }
                  />
                ),
              )}
            </FormGroup>
          )}
        </Stack>
      );
    }

    if (
      activeAction === "asignacion"
    ) {
      const hasDespacho =
        Boolean(
          selectedEmpresa?.despacho,
        );

      const currentTimbres =
        getTimbres(
          selectedEmpresa ?? {},
        );

      const manualCantidad = Number(
        assignmentCantidad || 0,
      );

      const selectedPaquete =
        paquetes.find(
          (item) =>
            String(
              firstValue(
                item,
                "id",
              ) ?? "",
            ) ===
            assignmentPaqueteId,
        ) ?? null;

      const selectedPlan =
        planes.find(
          (item) =>
            String(
              firstValue(
                item,
                "id",
              ) ?? "",
            ) ===
            assignmentPlanId,
        ) ?? null;

      const assignmentPreviewTimbres =
        assignmentType === "timbres"
          ? Number.isFinite(
              manualCantidad,
            )
            ? manualCantidad
            : 0
          : assignmentType ===
                "paquete" &&
              selectedPaquete
            ? Number(
                firstValue(
                  selectedPaquete,
                  "cantidad_timbres",
                  "timbres",
                ) ?? 0,
              )
            : assignmentType ===
                  "plan" &&
                selectedPlan
              ? Number(
                  firstValue(
                    selectedPlan,
                    "folios_incluidos",
                    "folios_por_rfc",
                  ) ?? 0,
                )
              : 0;

      return (
        <Stack spacing={1.5}>
          <Alert severity="warning">
            Esta operación modifica timbres, vigencia y/o plan directamente en TAECONTA. Revisa los datos antes de confirmar.
          </Alert>

          <Grid container spacing={1.5}>
            <Grid item xs={12} md={3.4}>
              <Stack spacing={1}>
                <Box>
                  <Typography
                    fontWeight={900}
                    fontSize={14}
                  >
                    Tipo de operación
                  </Typography>

                  <Typography
                    color="text.secondary"
                    fontSize={10.5}
                  >
                    Selecciona qué deseas aplicar a la cuenta.
                  </Typography>
                </Box>

                <Paper
                  elevation={0}
                  onClick={() => {
                    setAssignmentType(
                      "paquete",
                    );
                    setAssignmentPlanId(
                      "",
                    );
                  }}
                  sx={{
                    p: 1.5,
                    cursor: "pointer",
                    border: "2px solid",
                    borderColor:
                      assignmentType ===
                      "paquete"
                        ? "primary.main"
                        : "divider",
                    bgcolor:
                      assignmentType ===
                      "paquete"
                        ? "action.selected"
                        : "background.paper",
                    borderRadius: 1.5,
                    transition:
                      "border-color 120ms ease, background-color 120ms ease",
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={1}
                  >
                    <Typography
                      fontWeight={900}
                      fontSize={12}
                    >
                      Paquete predefinido
                    </Typography>

                    <Chip
                      size="small"
                      color={
                        assignmentType ===
                        "paquete"
                          ? "primary"
                          : "default"
                      }
                      label={`${paquetes.length} paquetes`}
                      sx={{
                        height: 22,
                        fontSize: 9,
                        fontWeight: 800,
                      }}
                    />
                  </Stack>

                  <Typography
                    color="text.secondary"
                    fontSize={10.5}
                    mt={0.6}
                  >
                    Usa paquetes comerciales con imagen y precio.
                  </Typography>
                </Paper>

                <Paper
                  elevation={0}
                  onClick={() => {
                    if (!hasDespacho) {
                      return;
                    }

                    setAssignmentType(
                      "plan",
                    );
                    setAssignmentPaqueteId(
                      "",
                    );
                  }}
                  sx={{
                    p: 1.5,
                    cursor: hasDespacho
                      ? "pointer"
                      : "not-allowed",
                    opacity: hasDespacho
                      ? 1
                      : 0.55,
                    border: "2px solid",
                    borderColor:
                      assignmentType ===
                      "plan"
                        ? "primary.main"
                        : "divider",
                    bgcolor:
                      assignmentType ===
                      "plan"
                        ? "action.selected"
                        : "background.paper",
                    borderRadius: 1.5,
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={1}
                  >
                    <Typography
                      fontWeight={900}
                      fontSize={12}
                    >
                      Plan de despacho
                    </Typography>

                    <Chip
                      size="small"
                      color={
                        hasDespacho
                          ? "primary"
                          : "default"
                      }
                      label={
                        hasDespacho
                          ? "Disponible"
                          : "No disponible"
                      }
                      sx={{
                        height: 22,
                        fontSize: 9,
                        fontWeight: 800,
                      }}
                    />
                  </Stack>

                  <Typography
                    color="text.secondary"
                    fontSize={10.5}
                    mt={0.6}
                  >
                    Actualiza plan, vigencia y folios del despacho.
                  </Typography>
                </Paper>

                <Paper
                  elevation={0}
                  onClick={() => {
                    setAssignmentType(
                      "timbres",
                    );
                    setAssignmentPaqueteId(
                      "",
                    );
                    setAssignmentPlanId(
                      "",
                    );
                  }}
                  sx={{
                    p: 1.5,
                    cursor: "pointer",
                    border: "2px solid",
                    borderColor:
                      assignmentType ===
                      "timbres"
                        ? "primary.main"
                        : "divider",
                    bgcolor:
                      assignmentType ===
                      "timbres"
                        ? "action.selected"
                        : "background.paper",
                    borderRadius: 1.5,
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={1}
                  >
                    <Typography
                      fontWeight={900}
                      fontSize={12}
                    >
                      Folios manuales
                    </Typography>

                    <Chip
                      size="small"
                      color={
                        assignmentType ===
                        "timbres"
                          ? "primary"
                          : "default"
                      }
                      label="Libre"
                      sx={{
                        height: 22,
                        fontSize: 9,
                        fontWeight: 800,
                      }}
                    />
                  </Stack>

                  <Typography
                    color="text.secondary"
                    fontSize={10.5}
                    mt={0.6}
                  >
                    Carga directa indicando cantidad y monto.
                  </Typography>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1.5,
                    bgcolor: "action.hover",
                  }}
                >
                  <Typography
                    fontWeight={900}
                    fontSize={12}
                    mb={1}
                  >
                    Resumen rápido
                  </Typography>

                  <Stack spacing={0.55}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                    >
                      <Typography
                        color="text.secondary"
                        fontSize={10.5}
                      >
                        Actuales
                      </Typography>
                      <Typography
                        fontWeight={900}
                        fontSize={10.5}
                      >
                        {currentTimbres.toLocaleString(
                          "es-MX",
                        )}
                      </Typography>
                    </Stack>

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                    >
                      <Typography
                        color="text.secondary"
                        fontSize={10.5}
                      >
                        A asignar
                      </Typography>
                      <Typography
                        fontWeight={900}
                        fontSize={10.5}
                      >
                        {Number.isFinite(
                          assignmentPreviewTimbres,
                        )
                          ? assignmentPreviewTimbres.toLocaleString(
                              "es-MX",
                            )
                          : "0"}
                      </Typography>
                    </Stack>

                    <Divider />

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                    >
                      <Typography
                        color="text.secondary"
                        fontSize={10.5}
                      >
                        Resultado
                      </Typography>
                      <Typography
                        color="primary.main"
                        fontWeight={900}
                        fontSize={11}
                      >
                        {(
                          currentTimbres +
                          (Number.isFinite(
                            assignmentPreviewTimbres,
                          )
                            ? assignmentPreviewTimbres
                            : 0)
                        ).toLocaleString(
                          "es-MX",
                        )}
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>
              </Stack>
            </Grid>

            <Grid item xs={12} md={8.6}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 1.25, sm: 1.5 },
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1.5,
                  minHeight: 390,
                }}
              >
                {assignmentType ===
                  "paquete" && (
                  <Stack spacing={1.25}>
                    <Stack
                      direction={{
                        xs: "column",
                        sm: "row",
                      }}
                      justifyContent="space-between"
                      alignItems={{
                        xs: "flex-start",
                        sm: "center",
                      }}
                      spacing={1}
                    >
                      <Box>
                        <Typography
                          fontWeight={900}
                          fontSize={16}
                        >
                          Paquetes predefinidos
                        </Typography>
                        <Typography
                          color="text.secondary"
                          fontSize={10.5}
                        >
                          Selecciona un paquete comercial para cargar timbres y monto automáticamente.
                        </Typography>
                      </Box>

                      <Chip
                        size="small"
                        color="primary"
                        label={`${paquetes.length} disponibles`}
                        sx={{
                          fontWeight: 800,
                          fontSize: 9.5,
                        }}
                      />
                    </Stack>

                    {paquetes.length ===
                    0 ? (
                      <Alert severity="info">
                        No hay paquetes disponibles.
                      </Alert>
                    ) : (
                      <Grid
                        container
                        spacing={1.25}
                      >
                        {paquetes.map(
                          (paquete, index) => {
                            const paqueteId =
                              String(
                                firstValue(
                                  paquete,
                                  "id",
                                ) ?? "",
                              );

                            const selected =
                              assignmentPaqueteId ===
                              paqueteId;

                            const activo =
                              firstValue(
                                paquete,
                                "activo",
                              ) === null
                                ? true
                                : getBooleanValue(
                                    firstValue(
                                      paquete,
                                      "activo",
                                    ),
                                  );

                            const nombre =
                              String(
                                firstValue(
                                  paquete,
                                  "nombre",
                                  "name",
                                ) ??
                                  `Paquete ${
                                    index + 1
                                  }`,
                              );

                            return (
                              <Grid
                                item
                                xs={12}
                                sm={6}
                                lg={4}
                                xl={3}
                                key={
                                  paqueteId ||
                                  index
                                }
                              >
                                <Paper
                                  elevation={
                                    selected
                                      ? 3
                                      : 0
                                  }
                                  onClick={() => {
                                    if (
                                      !activo ||
                                      !paqueteId
                                    ) {
                                      return;
                                    }

                                    setAssignmentPaqueteId(
                                      paqueteId,
                                    );
                                  }}
                                  sx={{
                                    height: "100%",
                                    display: "flex",
                                    flexDirection:
                                      "column",
                                    cursor: activo
                                      ? "pointer"
                                      : "not-allowed",
                                    opacity: activo
                                      ? 1
                                      : 0.5,
                                    border: "2px solid",
                                    borderColor: selected
                                      ? "primary.main"
                                      : "divider",
                                    borderRadius: 1.5,
                                    overflow: "hidden",
                                    transition:
                                      "border-color 120ms ease, transform 120ms ease",
                                    "&:hover": activo
                                      ? {
                                          borderColor:
                                            "primary.main",
                                          transform:
                                            "translateY(-1px)",
                                        }
                                      : undefined,
                                  }}
                                >
                                  <AssignmentPackageImage
                                    src={getPaqueteImage(
                                      paquete,
                                    )}
                                    nombre={nombre}
                                  />

                                  <Stack
                                    spacing={0.8}
                                    sx={{
                                      p: 1.25,
                                      flex: 1,
                                    }}
                                  >
                                    <Typography
                                      fontWeight={900}
                                      fontSize={12.5}
                                    >
                                      {nombre}
                                    </Typography>

                                    <Chip
                                      size="small"
                                      variant="outlined"
                                      label={`${Number(
                                        firstValue(
                                          paquete,
                                          "cantidad_timbres",
                                        ) ?? 0,
                                      ).toLocaleString(
                                        "es-MX",
                                      )} timbres`}
                                      sx={{
                                        alignSelf:
                                          "flex-start",
                                        fontSize: 9,
                                        fontWeight: 800,
                                      }}
                                    />

                                    <Typography
                                      color="primary.main"
                                      fontWeight={900}
                                      fontSize={16}
                                    >
                                      {formatCurrency(
                                        firstValue(
                                          paquete,
                                          "costo",
                                        ),
                                      )}
                                    </Typography>

                                    {selected && (
                                      <Chip
                                        size="small"
                                        color="primary"
                                        label="Seleccionado"
                                        sx={{
                                          alignSelf:
                                            "flex-start",
                                          fontSize: 8.5,
                                          fontWeight: 800,
                                        }}
                                      />
                                    )}
                                  </Stack>
                                </Paper>
                              </Grid>
                            );
                          },
                        )}
                      </Grid>
                    )}
                  </Stack>
                )}

                {assignmentType ===
                  "plan" && (
                  <Stack spacing={1.25}>
                    <Box>
                      <Typography
                        fontWeight={900}
                        fontSize={16}
                      >
                        Planes de despacho
                      </Typography>
                      <Typography
                        color="text.secondary"
                        fontSize={10.5}
                      >
                        Actualiza el plan, vigencia anual, RFCs contratados y folios disponibles del despacho.
                      </Typography>
                    </Box>

                    {planes.length === 0 ? (
                      <Alert severity="info">
                        No hay planes disponibles.
                      </Alert>
                    ) : (
                      <Grid
                        container
                        spacing={1.25}
                      >
                        {planes.map(
                          (plan, index) => {
                            const planId =
                              String(
                                firstValue(
                                  plan,
                                  "id",
                                ) ?? "",
                              );

                            const selected =
                              assignmentPlanId ===
                              planId;

                            return (
                              <Grid
                                item
                                xs={12}
                                sm={6}
                                lg={4}
                                key={
                                  planId || index
                                }
                              >
                                <Paper
                                  elevation={
                                    selected
                                      ? 3
                                      : 0
                                  }
                                  onClick={() => {
                                    if (!planId) {
                                      return;
                                    }

                                    setAssignmentPlanId(
                                      planId,
                                    );
                                  }}
                                  sx={{
                                    height: "100%",
                                    p: 1.5,
                                    cursor: "pointer",
                                    border: "2px solid",
                                    borderColor: selected
                                      ? "primary.main"
                                      : "divider",
                                    borderRadius: 1.5,
                                    transition:
                                      "border-color 120ms ease, transform 120ms ease",
                                    "&:hover": {
                                      borderColor:
                                        "primary.main",
                                      transform:
                                        "translateY(-1px)",
                                    },
                                  }}
                                >
                                  <Typography
                                    fontWeight={900}
                                    fontSize={13}
                                  >
                                    {String(
                                      firstValue(
                                        plan,
                                        "nombre",
                                        "name",
                                      ) ??
                                        `Plan ${
                                          index + 1
                                        }`,
                                    )}
                                  </Typography>

                                  <Typography
                                    color="primary.main"
                                    fontWeight={900}
                                    fontSize={19}
                                    mt={0.7}
                                  >
                                    {formatCurrency(
                                      firstValue(
                                        plan,
                                        "precio_anual",
                                        "precio",
                                      ),
                                    )}
                                  </Typography>

                                  <Divider
                                    sx={{ my: 1 }}
                                  />

                                  <Stack spacing={0.5}>
                                    <Typography
                                      fontSize={10.5}
                                    >
                                      RFCs:{" "}
                                      <strong>
                                        {String(
                                          firstValue(
                                            plan,
                                            "max_rfcs",
                                          ) ?? "—",
                                        )}
                                      </strong>
                                    </Typography>

                                    <Typography
                                      fontSize={10.5}
                                    >
                                      Folios incluidos:{" "}
                                      <strong>
                                        {String(
                                          firstValue(
                                            plan,
                                            "folios_incluidos",
                                            "folios_por_rfc",
                                          ) ?? "—",
                                        )}
                                      </strong>
                                    </Typography>

                                    <Typography
                                      fontSize={10.5}
                                    >
                                      Soporte:{" "}
                                      <strong>
                                        {String(
                                          firstValue(
                                            plan,
                                            "nivel_soporte",
                                          ) ?? "—",
                                        )}
                                      </strong>
                                    </Typography>
                                  </Stack>

                                  {selected && (
                                    <Chip
                                      size="small"
                                      color="primary"
                                      label="Seleccionado"
                                      sx={{
                                        mt: 1,
                                        fontSize: 8.5,
                                        fontWeight: 800,
                                      }}
                                    />
                                  )}
                                </Paper>
                              </Grid>
                            );
                          },
                        )}
                      </Grid>
                    )}
                  </Stack>
                )}

                {assignmentType ===
                  "timbres" && (
                  <Grid container spacing={1.25}>
                    <Grid item xs={12} md={7}>
                      <Stack spacing={1.25}>
                        <Box>
                          <Typography
                            fontWeight={900}
                            fontSize={16}
                          >
                            Folios manuales
                          </Typography>
                          <Typography
                            color="text.secondary"
                            fontSize={10.5}
                          >
                            Captura una cantidad personalizada de timbres para esta cuenta.
                          </Typography>
                        </Box>

                        <Stack
                          direction={{
                            xs: "column",
                            sm: "row",
                          }}
                          spacing={1}
                        >
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="Cantidad de timbres"
                            value={
                              assignmentCantidad
                            }
                            onChange={(event) =>
                              setAssignmentCantidad(
                                event.target.value,
                              )
                            }
                            inputProps={{
                              min: 1,
                              step: 1,
                            }}
                          />

                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="Monto cobrado"
                            value={
                              assignmentMonto
                            }
                            onChange={(event) =>
                              setAssignmentMonto(
                                event.target.value,
                              )
                            }
                            inputProps={{
                              min: 0,
                              step: "0.01",
                            }}
                          />
                        </Stack>

                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.5,
                            border: "1px dashed",
                            borderColor: "divider",
                            borderRadius: 1.5,
                            bgcolor: "action.hover",
                          }}
                        >
                          <Typography
                            fontWeight={900}
                            fontSize={11.5}
                          >
                            Operación a registrar
                          </Typography>
                          <Typography
                            color="text.secondary"
                            fontSize={10.5}
                            mt={0.5}
                          >
                            Se agregarán {Number.isFinite(manualCantidad) ? manualCantidad : 0} timbres a la cuenta seleccionada y se registrará el movimiento en pagos e historial administrativo.
                          </Typography>
                        </Paper>
                      </Stack>
                    </Grid>

                    <Grid item xs={12} md={5}>
                      <Paper
                        elevation={0}
                        sx={{
                          height: "100%",
                          p: 1.5,
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                          borderRadius: 1.5,
                        }}
                      >
                        <Typography
                          fontWeight={900}
                          fontSize={13}
                        >
                          Vista previa
                        </Typography>

                        <Typography
                          fontSize={9.5}
                          sx={{
                            opacity: 0.8,
                            mt: 1.5,
                          }}
                        >
                          Timbres actuales
                        </Typography>
                        <Typography
                          fontWeight={900}
                          fontSize={31}
                        >
                          {currentTimbres.toLocaleString(
                            "es-MX",
                          )}
                        </Typography>

                        <Divider
                          sx={{
                            my: 1.25,
                            borderColor:
                              "rgba(255,255,255,.28)",
                          }}
                        />

                        <Typography
                          fontSize={9.5}
                          sx={{ opacity: 0.8 }}
                        >
                          Nuevos timbres
                        </Typography>
                        <Typography
                          fontWeight={900}
                          fontSize={27}
                        >
                          +{Number.isFinite(manualCantidad) ? manualCantidad : 0}
                        </Typography>

                        <Divider
                          sx={{
                            my: 1.25,
                            borderColor:
                              "rgba(255,255,255,.28)",
                          }}
                        />

                        <Typography
                          fontSize={9.5}
                          sx={{ opacity: 0.8 }}
                        >
                          Total resultante
                        </Typography>
                        <Typography
                          fontWeight={900}
                          fontSize={31}
                        >
                          {(
                            currentTimbres +
                            (Number.isFinite(manualCantidad)
                              ? manualCantidad
                              : 0)
                          ).toLocaleString(
                            "es-MX",
                          )}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                )}
              </Paper>
            </Grid>
          </Grid>

          <Paper
            elevation={0}
            sx={{
              p: 1.25,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.5,
            }}
          >
            <Grid container spacing={1}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Método de pago"
                  value={assignmentMetodoPago}
                  onChange={(event) =>
                    setAssignmentMetodoPago(
                      event.target.value,
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Banco"
                  value={assignmentBanco}
                  onChange={(event) =>
                    setAssignmentBanco(
                      event.target.value,
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    height: "100%",
                    px: 1,
                  }}
                >
                  <Box>
                    <Typography
                      color="text.secondary"
                      fontSize={9}
                    >
                      Resultado
                    </Typography>
                    <Typography
                      fontWeight={900}
                      fontSize={13}
                    >
                      {(
                        currentTimbres +
                        (Number.isFinite(
                          assignmentPreviewTimbres,
                        )
                          ? assignmentPreviewTimbres
                          : 0)
                      ).toLocaleString(
                        "es-MX",
                      )} timbres
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      textAlign: "right",
                    }}
                  >
                    <Typography
                      color="text.secondary"
                      fontSize={9}
                    >
                      Monto
                    </Typography>
                    <Typography
                      fontWeight={900}
                      fontSize={13}
                    >
                      {assignmentType ===
                      "timbres"
                        ? formatCurrency(
                            assignmentMonto,
                          )
                        : assignmentType ===
                              "paquete" &&
                            selectedPaquete
                          ? formatCurrency(
                              firstValue(
                                selectedPaquete,
                                "costo",
                              ),
                            )
                          : assignmentType ===
                                "plan" &&
                              selectedPlan
                            ? formatCurrency(
                                firstValue(
                                  selectedPlan,
                                  "precio_anual",
                                  "precio",
                                ),
                              )
                            : "$0.00"}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Stack>
      );
    }

    if (
      activeAction ===
      "eliminar-timbres"
    ) {
      return (
        <Stack spacing={1.25}>
          <Alert severity="warning">
            Se retirarán timbres reales de la cuenta. Esta acción no debe utilizarse para pruebas.
          </Alert>

          <TextField
            fullWidth
            size="small"
            type="number"
            label="Cantidad a retirar"
            value={
              deleteTimbresCantidad
            }
            onChange={(event) =>
              setDeleteTimbresCantidad(
                event.target.value,
              )
            }
            inputProps={{
              min: 1,
              step: 1,
            }}
            helperText={`Disponibles actualmente: ${getTimbres(
              selectedEmpresa ?? {},
            ).toLocaleString(
              "es-MX",
            )}`}
          />
        </Stack>
      );
    }

    if (
      activeAction === "estado"
    ) {
      return (
        <Alert severity="warning">
          La cuenta está actualmente {currentActive ? "activada" : "desactivada"}. Al confirmar se cambiará a {currentActive ? "desactivada" : "activada"} en TAECONTA.
        </Alert>
      );
    }

    if (
      activeAction ===
      "contabilidad"
    ) {
      return (
        <Stack spacing={1.25}>
          <Alert severity="info">
            Define el acceso al módulo de Contabilidad para esta cuenta.
          </Alert>

          <FormControl
            fullWidth
            size="small"
          >
            <InputLabel>
              Estado de Contabilidad
            </InputLabel>

            <Select
              label="Estado de Contabilidad"
              value={
                contabilidadHab
                  ? "1"
                  : "0"
              }
              onChange={(event) =>
                setContabilidadHab(
                  event.target
                    .value === "1",
                )
              }
            >
              <MenuItem value="1">
                Habilitada
              </MenuItem>

              <MenuItem value="0">
                Deshabilitada
              </MenuItem>
            </Select>
          </FormControl>
        </Stack>
      );
    }

    if (
      activeAction ===
      "certificados"
    ) {
      const sellos =
        socioData?.sellos ?? {};

      return (
        <Stack spacing={1.25}>
          <Alert severity="error">
            Esta acción elimina la referencia del certificado o llave seleccionada en TAECONTA. No elimina archivos físicos del servidor.
          </Alert>

          <Stack
            direction="row"
            spacing={0.7}
            useFlexGap
            flexWrap="wrap"
          >
            <Chip
              size="small"
              variant="outlined"
              label={`Certificado: ${
                getBooleanValue(
                  firstValue(
                    sellos,
                    "certificado",
                  ),
                )
                  ? "sí"
                  : "no"
              }`}
            />

            <Chip
              size="small"
              variant="outlined"
              label={`Llave: ${
                getBooleanValue(
                  firstValue(
                    sellos,
                    "llave",
                  ),
                )
                  ? "sí"
                  : "no"
              }`}
            />
          </Stack>

          <FormControl
            fullWidth
            size="small"
          >
            <InputLabel>
              Archivo
            </InputLabel>

            <Select
              label="Archivo"
              value={certificadoTipo}
              onChange={(event) =>
                setCertificadoTipo(
                  event.target
                    .value as TipoCertificado,
                )
              }
            >
              <MenuItem value="cert">
                Certificado principal
              </MenuItem>

              <MenuItem value="llave">
                Llave principal
              </MenuItem>

              <MenuItem value="cert2">
                Certificado secundario
              </MenuItem>

              <MenuItem value="llave2">
                Llave secundaria
              </MenuItem>
            </Select>
          </FormControl>
        </Stack>
      );
    }

    return null;
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <>
    <Paper
      id="taeconta-cuentas"
      elevation={0}
      sx={{
        width: "100%",

        minWidth: 0,

        border:
          "1px solid",

        borderColor:
          "divider",

        borderRadius:
          1.5,

        bgcolor:
          "background.paper",

        overflow:
          "hidden",
      }}
    >
      {/* =====================================================
          ENCABEZADO
      ===================================================== */}

      <Box
        sx={{
          px: {
            xs: 1.25,
            sm: 1.5,
            md: 1.75,
          },

          py: {
            xs: 1.25,
            md: 1.5,
          },

          borderBottom:
            "1px solid",

          borderColor:
            "divider",
        }}
      >
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1}
          alignItems={{
            xs: "stretch",
            sm: "center",
          }}
          justifyContent="space-between"
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            useFlexGap
            flexWrap="wrap"
          >
            <BusinessOutlinedIcon
              color="primary"
            />

            <Typography
              component="h2"
              sx={{
                fontSize: {
                  xs: 16,
                  md: 18,
                },

                fontWeight: 900,
              }}
            >
              Cuentas
            </Typography>

            <Chip
              size="small"
              label={`${filtered.length.toLocaleString(
                "es-MX",
              )} cuentas`}
              variant="outlined"
              sx={{
                fontWeight: 700,
              }}
            />
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              width: {
                xs: "100%",
                sm: "auto",
              },
            }}
          >
            <TextField
              fullWidth
              size="small"
              value={
                localSearch
              }
              placeholder="Buscar en cuentas"
              onChange={(
                event,
              ) => {
                setLocalSearch(
                  event.target
                    .value,
                );
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: {
                  xs: "100%",
                  sm: 280,
                  md: 320,
                },

                minWidth: 0,
              }}
            />

            <Tooltip title="Actualizar cuentas">
              <span>
                <IconButton
                  disabled={loading}
                  onClick={() =>
                    void cargar()
                  }
                  sx={{
                    width: 40,

                    height: 40,

                    flexShrink: 0,

                    border:
                      "1px solid",

                    borderColor:
                      "divider",

                    borderRadius:
                      1.25,
                  }}
                >
                  {loading ? (
                    <CircularProgress
                      size={17}
                    />
                  ) : (
                    <RefreshOutlinedIcon />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1}
          alignItems={{
            xs: "stretch",
            sm: "center",
          }}
          sx={{
            mt: 1.25,
          }}
        >
          <Box
            sx={{
              flexShrink: 0,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={800}
              display="block"
            >
              Vigencia de cuentas
            </Typography>

            <Typography
              variant="caption"
              color="text.disabled"
              sx={{
                fontSize: 9,
              }}
            >
              Filtro aplicado desde TAECONTA
            </Typography>
          </Box>

          <ToggleButtonGroup
            exclusive
            size="small"
            value={vigenciaFilter}
            onChange={(
              _event,
              value:
                | CuentaVigenciaFilter
                | null,
            ) => {
              if (value) {
                setVigenciaFilter(
                  value,
                );
              }
            }}
            sx={{
              maxWidth: "100%",
              overflowX: "auto",

              "& .MuiToggleButton-root":
                {
                  px: 1.1,
                  py: 0.55,
                  textTransform:
                    "none",
                  whiteSpace:
                    "nowrap",
                  fontSize:
                    10.5,
                  fontWeight:
                    800,
                },
            }}
          >
            <ToggleButton value="todas">
              Todas ({vigenciaCounts.todas.toLocaleString("es-MX")})
            </ToggleButton>

            <ToggleButton value="vigentes">
              Vigentes ({vigenciaCounts.vigentes.toLocaleString("es-MX")})
            </ToggleButton>

            <ToggleButton value="proximas7">
              Próx. 7 días ({vigenciaCounts.proximas7.toLocaleString("es-MX")})
            </ToggleButton>

            <ToggleButton value="proximas30">
              Próx. 30 días ({vigenciaCounts.proximas30.toLocaleString("es-MX")})
            </ToggleButton>

            <ToggleButton value="vencidas">
              Vencidas ({vigenciaCounts.vencidas.toLocaleString("es-MX")})
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Box>

      {notice && (
        <Box sx={{ px: 1.5, pt: 1.25 }}>
          <Alert
            severity="success"
            onClose={() =>
              setNotice("")
            }
          >
            {notice}
          </Alert>
        </Box>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <Box
          sx={{
            p: 1.5,
          }}
        >
          <Alert severity="warning">
            {error}
          </Alert>
        </Box>
      )}

      {/* =====================================================
          CARGANDO
      ===================================================== */}

      {loading ? (
        <Box
          sx={{
            minHeight: 280,

            display: "grid",

            placeItems:
              "center",
          }}
        >
          <Stack
            spacing={1}
            alignItems="center"
          >
            <CircularProgress />

            <Typography
              color="text.secondary"
              fontSize={11.5}
            >
              Consultando cuentas...
            </Typography>
          </Stack>
        </Box>
      ) : filtered.length ===
        0 ? (
        <Box
          sx={{
            py: 6,

            px: 2,

            textAlign:
              "center",
          }}
        >
          <BusinessOutlinedIcon
            sx={{
              fontSize: 42,

              color:
                "text.disabled",
            }}
          />

          <Typography
            mt={1}
            fontWeight={800}
          >
            Sin resultados
          </Typography>

          <Typography
            mt={0.3}
            color="text.secondary"
            fontSize={11.5}
          >
            No hay cuentas que coincidan
            con los filtros seleccionados.
          </Typography>
        </Box>
      ) : (
        <>
          {/* =================================================
              TABLA ESCRITORIO
          ================================================= */}

          {!isMobile && (
            <TableContainer
              sx={{
                width: "100%",

                maxWidth:
                  "100%",

                overflowX:
                  "hidden",
              }}
            >
              <Table
                size="small"
                stickyHeader
                sx={{
                  width: "100%",

                  maxWidth:
                    "100%",

                  tableLayout:
                    "fixed",

                  "& .MuiTableCell-root":
                    {
                      boxSizing:
                        "border-box",

                      px: {
                        md: 0.65,
                        lg: 0.8,
                        xl: 1,
                      },

                      py: 0.85,

                      overflow:
                        "hidden",
                    },
                }}
              >
                <TableHead>
                  <TableRow>
                    {[
                      ["Nombre", "15%"],
                      ["RFC", "8%"],
                      ["Correo", "17%"],
                      ["Vigencia", "10%"],
                      ["Timbres", "8%"],
                      ["Persona", "7%"],
                      ["Estado", "10%"],
                      ["Acciones", "8%"],
                      ["Indicadores", "17%"],
                    ].map(([label, width]) => (
                      <TableCell
                        key={label}
                        align={
                          label === "Timbres" ||
                          label === "Acciones"
                            ? "center"
                            : "left"
                        }
                        sx={{
                          width,
                          fontSize: 10.5,
                          lineHeight: 1.15,
                          fontWeight: 900,
                          bgcolor: isDark
                            ? alpha(
                                theme.palette.common.white,
                                0.045,
                              )
                            : alpha(
                                theme.palette.common.black,
                                0.025,
                              ),
                        }}
                      >
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginated.map(
                    (
                      empresa,
                      index,
                    ) => {
                      const estado =
                        getEstado(
                          empresa,
                        );

                      const despacho =
                        getDespacho(
                          empresa,
                        );

                      const companyIndicators =
                        getIndicadoresEmpresa(
                          empresa,
                          indicadorMap,
                        );

                      const nombre =
                        getNombre(
                          empresa,
                        );

                      const correo =
                        getCorreo(
                          empresa,
                        );

                      return (
                        <TableRow
                          key={String(
                            firstValue(
                              empresa,
                              "id",
                            ) ??
                              `${getRfc(
                                empresa,
                              )}-${index}`,
                          )}
                          hover
                          sx={{
                            verticalAlign:
                              "top",
                          }}
                        >
                          {/* NOMBRE */}

                          <TableCell>
                            <Tooltip
                              title={
                                nombre
                              }
                              placement="top-start"
                            >
                              <Typography
                                fontSize={
                                  10.5
                                }
                                fontWeight={
                                  800
                                }
                                sx={{
                                  lineHeight:
                                    1.25,

                                  whiteSpace:
                                    "normal",

                                  overflowWrap:
                                    "anywhere",

                                  wordBreak:
                                    "break-word",
                                }}
                              >
                                {nombre}
                              </Typography>
                            </Tooltip>
                          </TableCell>

                          {/* RFC */}

                          <TableCell>
                            <Typography
                              fontFamily="monospace"
                              fontSize={
                                9.7
                              }
                              fontWeight={
                                700
                              }
                              sx={{
                                lineHeight:
                                  1.25,

                                overflowWrap:
                                  "anywhere",
                              }}
                            >
                              {getRfc(
                                empresa,
                              )}
                            </Typography>
                          </TableCell>

                          {/* CORREO */}

                          <TableCell>
                            <Tooltip
                              title={
                                correo
                              }
                              placement="top-start"
                            >
                              <Typography
                                color="text.secondary"
                                fontSize={
                                  9.7
                                }
                                sx={{
                                  lineHeight:
                                    1.25,

                                  whiteSpace:
                                    "normal",

                                  overflowWrap:
                                    "anywhere",

                                  wordBreak:
                                    "break-word",
                                }}
                              >
                                {correo}
                              </Typography>
                            </Tooltip>
                          </TableCell>

                          {/* VIGENCIA */}

                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={0.3}
                              alignItems="center"
                            >
                              <Typography
                                fontSize={9.6}
                                sx={{
                                  lineHeight: 1.2,
                                  minWidth: 0,
                                }}
                              >
                                {formatDate(
                                  getExpiration(empresa),
                                )}
                              </Typography>

                              <Tooltip title="Cambiar vigencia">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    void abrirAccion(
                                      "vigencia",
                                      empresa,
                                    )
                                  }
                                  sx={{
                                    width: 24,
                                    height: 24,
                                    flexShrink: 0,
                                    color: "warning.main",
                                  }}
                                >
                                  <EditCalendarOutlinedIcon
                                    sx={{ fontSize: 16 }}
                                  />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>

                          {/* TIMBRES */}

                          <TableCell align="center">
                            <Stack
                              direction="row"
                              spacing={0.15}
                              alignItems="center"
                              justifyContent="center"
                            >
                              <Typography
                                fontSize={10.5}
                                fontWeight={900}
                                sx={{ minWidth: 22 }}
                              >
                                {getTimbres(empresa).toLocaleString(
                                  "es-MX",
                                )}
                              </Typography>

                              <Tooltip title="Asignar timbres, paquete o plan">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    void abrirAccion(
                                      "asignacion",
                                      empresa,
                                    )
                                  }
                                  sx={{
                                    width: 23,
                                    height: 23,
                                    color: "primary.main",
                                  }}
                                >
                                  <AddCircleOutlineOutlinedIcon
                                    sx={{ fontSize: 16 }}
                                  />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Retirar timbres">
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled={getTimbres(empresa) <= 0}
                                    onClick={() =>
                                      void abrirAccion(
                                        "eliminar-timbres",
                                        empresa,
                                      )
                                    }
                                    sx={{
                                      width: 23,
                                      height: 23,
                                      color: "error.main",
                                    }}
                                  >
                                    <RemoveCircleOutlineOutlinedIcon
                                      sx={{ fontSize: 16 }}
                                    />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Stack>
                          </TableCell>

                          {/* PERSONA */}

                          <TableCell>
                            <Chip
                              size="small"
                              label={getPersona(empresa)}
                              variant="outlined"
                              sx={{
                                maxWidth: "100%",
                                height: 21,
                                fontSize: 8.5,
                                fontWeight: 700,
                                "& .MuiChip-label": {
                                  px: 0.6,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                },
                              }}
                            />
                          </TableCell>

                          {/* ESTADO */}

                          <TableCell>
                            {despacho ? (
                              <Tooltip title="Ver información del despacho">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() =>
                                    setDespachoInfo(
                                      despacho,
                                    )
                                  }
                                  sx={{
                                    minWidth: 0,
                                    maxWidth: "100%",
                                    px: 0.8,
                                    py: 0.2,
                                    minHeight: 24,
                                    borderRadius: 1.5,
                                    textTransform: "uppercase",
                                    fontSize: 8.1,
                                    fontWeight: 900,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {String(
                                    firstValue(
                                      despacho,
                                      "nombre",
                                    ) ?? "Despacho",
                                  )}
                                </Button>
                              </Tooltip>
                            ) : (
                              <Tooltip
                                title={`${estado.label}. Clic para ${
                                  isEmpresaActiva(empresa)
                                    ? "desactivar"
                                    : "activar"
                                } la cuenta`}
                              >
                                <Chip
                                  size="small"
                                  clickable
                                  label={estado.label}
                                  color={estado.color}
                                  variant="outlined"
                                  onClick={() =>
                                    void abrirAccion(
                                      "estado",
                                      empresa,
                                    )
                                  }
                                  sx={{
                                    maxWidth: "100%",
                                    height: 22,
                                    fontSize: 8.2,
                                    fontWeight: 800,
                                    cursor: "pointer",
                                    "& .MuiChip-label": {
                                      px: 0.55,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    },
                                  }}
                                />
                              </Tooltip>
                            )}
                          </TableCell>

                          {/* ACCIONES */}

                          <TableCell align="center">
                            <Stack
                              direction="row"
                              spacing={0.25}
                              justifyContent="center"
                            >
                              <Tooltip title="Información del socio">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    void abrirAccion(
                                      "socio",
                                      empresa,
                                    )
                                  }
                                  sx={{
                                    width: 27,
                                    height: 27,
                                    color: "primary.main",
                                  }}
                                >
                                  <PersonOutlineOutlinedIcon
                                    sx={{ fontSize: 17 }}
                                  />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Pagos registrados">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    void abrirAccion(
                                      "pagos",
                                      empresa,
                                    )
                                  }
                                  sx={{
                                    width: 27,
                                    height: 27,
                                    color: "primary.main",
                                  }}
                                >
                                  <PaymentsOutlinedIcon
                                    sx={{ fontSize: 17 }}
                                  />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>

                          {/* INDICADORES */}

                          <TableCell>
                            <Stack spacing={0.45} alignItems="flex-start">
                              <IndicadoresEmpresa
                                indicadores={companyIndicators}
                              />

                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={
                                  <FlagOutlinedIcon
                                    sx={{ fontSize: "14px !important" }}
                                  />
                                }
                                onClick={() =>
                                  void abrirAccion(
                                    "indicadores",
                                    empresa,
                                  )
                                }
                                sx={{
                                  minWidth: 0,
                                  px: 0.65,
                                  py: 0.2,
                                  minHeight: 23,
                                  textTransform: "uppercase",
                                  fontSize: 8.5,
                                  fontWeight: 900,
                                }}
                              >
                                Indicadores
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    },
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* =================================================
              VISTA MÓVIL
          ================================================= */}

          {isMobile && (
            <Stack
              spacing={1}
              sx={{
                p: {
                  xs: 1,
                  sm: 1.25,
                },
              }}
            >
              {paginated.map(
                (
                  empresa,
                  index,
                ) => {
                  const estado =
                    getEstado(
                      empresa,
                    );

                  const despacho =
                    getDespacho(
                      empresa,
                    );

                  const companyIndicators =
                    getIndicadoresEmpresa(
                      empresa,
                      indicadorMap,
                    );

                  return (
                    <Paper
                      key={String(
                        firstValue(
                          empresa,
                          "id",
                        ) ??
                          `${getRfc(
                            empresa,
                          )}-${index}`,
                      )}
                      elevation={0}
                      sx={{
                        width:
                          "100%",

                        minWidth:
                          0,

                        p: 1.25,

                        border:
                          "1px solid",

                        borderColor:
                          "divider",

                        borderRadius:
                          1.5,

                        bgcolor:
                          "background.paper",
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={1}
                      >
                        <Box
                          minWidth={0}
                          flex={1}
                        >
                          <Typography
                            fontWeight={
                              900
                            }
                            fontSize={
                              13
                            }
                            sx={{
                              overflowWrap:
                                "anywhere",
                            }}
                          >
                            {getNombre(
                              empresa,
                            )}
                          </Typography>

                          <Typography
                            color="text.secondary"
                            fontFamily="monospace"
                            fontSize={
                              10.5
                            }
                            mt={0.2}
                          >
                            {getRfc(
                              empresa,
                            )}
                          </Typography>
                        </Box>

                        {despacho ? (
                          <Tooltip title="Ver información del despacho">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() =>
                                setDespachoInfo(
                                  despacho,
                                )
                              }
                              sx={{
                                flexShrink: 0,
                                maxWidth: 150,
                                minWidth: 0,
                                px: 0.8,
                                fontSize: 8.5,
                                fontWeight: 900,
                                textTransform: "uppercase",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {String(
                                firstValue(
                                  despacho,
                                  "nombre",
                                ) ?? "Despacho",
                              )}
                            </Button>
                          </Tooltip>
                        ) : (
                          <Tooltip
                            title={`${estado.label}. Clic para cambiar estado`}
                          >
                            <Chip
                              size="small"
                              clickable
                              label={estado.label}
                              color={estado.color}
                              variant="outlined"
                              onClick={() =>
                                void abrirAccion(
                                  "estado",
                                  empresa,
                                )
                              }
                              sx={{
                                flexShrink: 0,
                                maxWidth: 135,
                                fontSize: 9,
                                fontWeight: 800,
                              }}
                            />
                          </Tooltip>
                        )}
                      </Stack>

                      <Divider
                        sx={{
                          my: 1,
                        }}
                      />

                      <Stack
                        spacing={0.9}
                      >
                        {/* CORREO */}

                        <Stack
                          direction="row"
                          spacing={0.8}
                          alignItems="flex-start"
                        >
                          <EmailOutlinedIcon
                            sx={{
                              mt: 0.1,

                              fontSize:
                                16,

                              color:
                                "text.secondary",
                            }}
                          />

                          <Box
                            minWidth={0}
                          >
                            <Typography
                              color="text.secondary"
                              fontSize={
                                9
                              }
                            >
                              Correo
                            </Typography>

                            <Typography
                              fontSize={
                                10.5
                              }
                              sx={{
                                overflowWrap:
                                  "anywhere",
                              }}
                            >
                              {getCorreo(
                                empresa,
                              )}
                            </Typography>
                          </Box>
                        </Stack>

                        {/* VIGENCIA */}

                        <Stack
                          direction="row"
                          spacing={0.8}
                          alignItems="center"
                        >
                          <CalendarMonthOutlinedIcon
                            sx={{
                              fontSize: 16,
                              color: "text.secondary",
                            }}
                          />

                          <Box flex={1}>
                            <Typography
                              color="text.secondary"
                              fontSize={9}
                            >
                              Vigencia
                            </Typography>

                            <Typography
                              fontSize={10.5}
                              fontWeight={700}
                            >
                              {formatDate(
                                getExpiration(empresa),
                              )}
                            </Typography>
                          </Box>

                          <Tooltip title="Cambiar vigencia">
                            <IconButton
                              size="small"
                              onClick={() =>
                                void abrirAccion("vigencia", empresa)
                              }
                              sx={{ color: "warning.main" }}
                            >
                              <EditCalendarOutlinedIcon
                                sx={{ fontSize: 18 }}
                              />
                            </IconButton>
                          </Tooltip>
                        </Stack>

                        {/* TIMBRES */}

                        <Stack
                          direction="row"
                          spacing={0.8}
                          alignItems="center"
                        >
                          <ConfirmationNumberOutlinedIcon
                            sx={{
                              fontSize: 16,
                              color: "text.secondary",
                            }}
                          />

                          <Box flex={1}>
                            <Typography
                              color="text.secondary"
                              fontSize={9}
                            >
                              Timbres
                            </Typography>

                            <Typography
                              fontSize={10.5}
                              fontWeight={900}
                            >
                              {getTimbres(empresa).toLocaleString(
                                "es-MX",
                              )}
                            </Typography>
                          </Box>

                          <Stack direction="row" spacing={0.25}>
                            <Tooltip title="Asignar timbres, paquete o plan">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  void abrirAccion("asignacion", empresa)
                                }
                                sx={{ color: "primary.main" }}
                              >
                                <AddCircleOutlineOutlinedIcon
                                  sx={{ fontSize: 18 }}
                                />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Retirar timbres">
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={getTimbres(empresa) <= 0}
                                  onClick={() =>
                                    void abrirAccion(
                                      "eliminar-timbres",
                                      empresa,
                                    )
                                  }
                                  sx={{ color: "error.main" }}
                                >
                                  <RemoveCircleOutlineOutlinedIcon
                                    sx={{ fontSize: 18 }}
                                  />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Stack>
                        </Stack>

                        {/* PERSONA */}

                        <Stack
                          direction="row"
                          spacing={0.8}
                          alignItems="center"
                        >
                          <BadgeOutlinedIcon
                            sx={{
                              fontSize:
                                16,

                              color:
                                "text.secondary",
                            }}
                          />

                          <Box>
                            <Typography
                              color="text.secondary"
                              fontSize={
                                9
                              }
                            >
                              Persona
                            </Typography>

                            <Typography
                              fontSize={
                                10.5
                              }
                              fontWeight={
                                700
                              }
                            >
                              {getPersona(
                                empresa,
                              )}
                            </Typography>
                          </Box>
                        </Stack>

                        {/* INDICADORES */}

                        <Stack
                          direction="row"
                          spacing={0.8}
                          alignItems="flex-start"
                        >
                          <FlagOutlinedIcon
                            sx={{
                              mt: 0.1,

                              fontSize:
                                16,

                              color:
                                "text.secondary",
                            }}
                          />

                          <Box
                            minWidth={0}
                            flex={1}
                          >
                            <Typography
                              color="text.secondary"
                              fontSize={
                                9
                              }
                              mb={0.45}
                            >
                              Indicadores
                            </Typography>

                            <IndicadoresEmpresa
                              indicadores={
                                companyIndicators
                              }
                            />

                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<FlagOutlinedIcon />}
                              onClick={() =>
                                void abrirAccion("indicadores", empresa)
                              }
                              sx={{
                                mt: 0.6,
                                textTransform: "uppercase",
                                fontSize: 9,
                                fontWeight: 900,
                              }}
                            >
                              Indicadores
                            </Button>
                          </Box>
                        </Stack>
                      </Stack>

                      <Divider
                        sx={{
                          my: 1,
                        }}
                      />

                      <Stack
                        direction="row"
                        spacing={0.8}
                      >
                        <Button
                          fullWidth
                          size="small"
                          variant="outlined"
                          startIcon={<PersonOutlineOutlinedIcon />}
                          onClick={() =>
                            void abrirAccion("socio", empresa)
                          }
                          sx={{
                            textTransform: "none",
                            fontSize: 10.5,
                            fontWeight: 800,
                          }}
                        >
                          Información
                        </Button>

                        <Button
                          fullWidth
                          size="small"
                          variant="outlined"
                          startIcon={<PaymentsOutlinedIcon />}
                          onClick={() =>
                            void abrirAccion("pagos", empresa)
                          }
                          sx={{
                            textTransform: "none",
                            fontSize: 10.5,
                            fontWeight: 800,
                          }}
                        >
                          Pagos
                        </Button>
                      </Stack>
                    </Paper>
                  );
                },
              )}
            </Stack>
          )}

          {/* =================================================
              PAGINACIÓN
          ================================================= */}

          <TablePagination
            component="div"
            count={
              filtered.length
            }
            page={page}
            rowsPerPage={
              rowsPerPage
            }
            rowsPerPageOptions={
              ROWS_PER_PAGE_OPTIONS
            }
            onPageChange={(
              _event,
              nextPage,
            ) => {
              setPage(
                nextPage,
              );
            }}
            onRowsPerPageChange={(
              event,
            ) => {
              setRowsPerPage(
                Number(
                  event.target
                    .value,
                ),
              );

              setPage(0);
            }}
            labelRowsPerPage="Registros:"
            labelDisplayedRows={({
              from,
              to,
              count,
            }) =>
              `${from}-${to} de ${count}`
            }
            sx={{
              width: "100%",

              borderTop:
                "1px solid",

              borderColor:
                "divider",

              ".MuiTablePagination-toolbar":
                {
                  minHeight:
                    52,

                  flexWrap: {
                    xs: "wrap",
                    sm: "nowrap",
                  },
                },

              ".MuiTablePagination-displayedRows":
                {
                  m: 0,

                  fontSize:
                    10.5,
                },
            }}
          />
        </>
      )}
    </Paper>

    {/* =====================================================
        DIÁLOGO DE ACCIÓN
    ===================================================== */}

    <Dialog
      open={activeAction !== null}
      onClose={
        actionSaving
          ? undefined
          : cerrarDialogoAccion
      }
      fullWidth
      maxWidth={
        activeAction === "asignacion" ||
        activeAction === "pagos"
          ? "lg"
          : "sm"
      }
      fullScreen={isMobile}
    >
      <DialogTitle
        sx={{
          pr: 6,
          ...(activeAction === "vigencia"
            ? {
                bgcolor: "#1755B5",
                color: "#FFFFFF",
                px: 3,
                py: 2,
              }
            : {}),
        }}
      >
        <Typography
          component="div"
          fontSize={
            activeAction === "vigencia"
              ? 20
              : 15
          }
          fontWeight={900}
        >
          {actionTitle}
        </Typography>

        {activeAction !== "vigencia" && (
          <Typography
            component="div"
            color="text.secondary"
            fontSize={10.5}
            mt={0.2}
            sx={{
              overflowWrap:
                "anywhere",
            }}
          >
            {activeAction === "pagos"
              ? "Historial de pagos, consultas Conekta y créditos del asociado"
              : activeAction === "socio"
                ? "Información general, estatus y sellos"
                : (
                    <>
                      {selectedEmpresaNombre}
                      {selectedEmpresaId
                        ? ` · ID ${selectedEmpresaId}`
                        : ""}
                    </>
                  )}
          </Typography>
        )}

        {activeAction !== "vigencia" && (
          <IconButton
            size="small"
            disabled={actionSaving}
            onClick={
              cerrarDialogoAccion
            }
            sx={{
              position: "absolute",
              right: 12,
              top: 12,
            }}
          >
            <CloseOutlinedIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent
        dividers={
          activeAction !== "vigencia"
        }
        sx={{
          ...(activeAction === "vigencia"
            ? {
                px: 3,
                pt: 3,
                pb: 4,
                minHeight: 115,
              }
            : {}),
        }}
      >
        {actionError && (
          <Alert
            severity="error"
            sx={{ mb: 1.25 }}
          >
            {actionError}
          </Alert>
        )}

        {renderActionContent()}
      </DialogContent>

      <DialogActions
        sx={{
          px: activeAction === "vigencia"
            ? 3
            : 2,
          py: activeAction === "vigencia"
            ? 2
            : 1.25,
          justifyContent: "flex-end",
        }}
      >
        {activeAction === "vigencia" ? (
          <>
            <Button
              variant="outlined"
              disabled={actionSaving}
              onClick={
                cerrarDialogoAccion
              }
              sx={{
                minHeight: 38,
                px: 2,
                borderRadius: 1,
                textTransform: "uppercase",
                fontWeight: 900,
              }}
            >
              Cerrar
            </Button>

            <Button
              variant="contained"
              disabled={
                actionSaving ||
                actionLoading ||
                !vigenciaValue
              }
              onClick={() =>
                void guardarAccion()
              }
              sx={{
                minHeight: 38,
                px: 2.2,
                borderRadius: 1,
                bgcolor: "#FF7A00",
                color: "#FFFFFF",
                textTransform: "uppercase",
                fontWeight: 900,
                "&:hover": {
                  bgcolor: "#E96F00",
                },
              }}
            >
              {actionSaving
                ? "Actualizando..."
                : "Actualizar vigencia"}
            </Button>
          </>
        ) : (
          <>
            {activeAction === "socio" && (
              <Button
                variant="contained"
                startIcon={<EditOutlinedIcon />}
                disabled={
                  actionSaving ||
                  actionLoading ||
                  !selectedEmpresaId
                }
                onClick={() =>
                  setSocioEditorOpen(true)
                }
                sx={{
                  textTransform:
                    "none",
                  fontWeight: 850,
                }}
              >
                Editar socio
              </Button>
            )}

            <Button
              disabled={actionSaving}
              onClick={
                cerrarDialogoAccion
              }
              sx={{
                textTransform:
                  "none",
              }}
            >
              Cerrar
            </Button>

            {!actionIsReadOnly &&
              activeAction && (
                <Button
                  variant="contained"
                  disabled={
                    actionSaving ||
                    actionLoading
                  }
                  onClick={() =>
                    void guardarAccion()
                  }
                  sx={{
                    textTransform:
                      "none",
                    fontWeight: 800,
                  }}
                >
                  {actionSaving
                    ? "Guardando..."
                    : activeAction === "estado"
                      ? currentActive
                        ? "Desactivar"
                        : "Activar"
                      : activeAction === "asignacion"
                        ? "Aplicar asignación"
                        : activeAction === "eliminar-timbres"
                          ? "Retirar timbres"
                          : activeAction === "certificados"
                            ? "Eliminar referencia"
                            : "Guardar cambios"}
                </Button>
              )}
          </>
        )}
      </DialogActions>
    </Dialog>

    <Dialog
      open={Boolean(despachoInfo)}
      onClose={() =>
        setDespachoInfo(null)
      }
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
    >
      <DialogTitle
        sx={{
          bgcolor: "#1755B5",
          color: "#FFFFFF",
          px: 3,
          py: 2,
        }}
      >
        <Typography
          fontSize={18}
          fontWeight={900}
        >
          Información del despacho
        </Typography>
      </DialogTitle>

      <DialogContent
        sx={{
          pt: "24px !important",
          px: 3,
          pb: 2,
        }}
      >
        {despachoInfo && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.5,
            }}
          >
            <Stack spacing={2}>
              <Box>
                <Typography
                  color="text.secondary"
                  fontSize={10}
                >
                  Nombre
                </Typography>

                <Typography
                  fontWeight={900}
                  fontSize={15}
                >
                  {String(
                    firstValue(
                      despachoInfo,
                      "nombre",
                    ) ?? "—",
                  ).toUpperCase()}
                </Typography>
              </Box>

              <Grid
                container
                spacing={2}
              >
                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <Typography
                    color="text.secondary"
                    fontSize={10}
                  >
                    RFC
                  </Typography>

                  <Typography
                    fontWeight={800}
                  >
                    {String(
                      firstValue(
                        despachoInfo,
                        "rfc",
                      ) ?? "Sin RFC",
                    )}
                  </Typography>
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <Typography
                    color="text.secondary"
                    fontSize={10}
                  >
                    Teléfono
                  </Typography>

                  <Typography
                    fontWeight={800}
                  >
                    {String(
                      firstValue(
                        despachoInfo,
                        "telefono",
                      ) ?? "—",
                    )}
                  </Typography>
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <Typography
                    color="text.secondary"
                    fontSize={10}
                  >
                    Estado
                  </Typography>

                  <Typography
                    fontWeight={800}
                  >
                    {String(
                      firstValue(
                        despachoInfo,
                        "estado",
                      ) ?? "—",
                    )}
                  </Typography>
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <Typography
                    color="text.secondary"
                    fontSize={10}
                  >
                    Fecha de registro
                  </Typography>

                  <Typography
                    fontWeight={800}
                  >
                    {formatDate(
                      firstValue(
                        despachoInfo,
                        "created_at",
                      ),
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </Stack>
          </Paper>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
        }}
      >
        <Button
          variant="contained"
          onClick={() =>
            setDespachoInfo(null)
          }
          sx={{
            textTransform: "uppercase",
            fontWeight: 900,
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>

    <TaecontaSocioEditor
      open={socioEditorOpen}
      empresaId={selectedEmpresaId}
      socioData={socioData}
      fallbackEmpresa={selectedEmpresa}
      onClose={() =>
        setSocioEditorOpen(false)
      }
      onSaved={
        refrescarSocioDespuesDeEditar
      }
    />
    </>
  );
}