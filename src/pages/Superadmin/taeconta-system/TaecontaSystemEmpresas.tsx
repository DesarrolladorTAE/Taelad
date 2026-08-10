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
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
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

import {
  getTaecontaSystemEmpresas,
  getTaecontaSystemIndicadores,
} from "../../../services/superadminService";

import type {
  TaecontaEmpresaFilters,
} from "./types";

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
            getTaecontaSystemEmpresas(),
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
      } catch (
        requestError: any
      ) {
        console.error(
          "ERROR EMPRESAS TAECONTA:",
          requestError,
        );

        setEmpresas([]);

        setIndicadores([]);

        setError(
          requestError
            ?.response
            ?.data
            ?.message ||
            requestError
              ?.message ||
            "No fue posible consultar las empresas de TAECONTA.",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

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
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <Paper
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
              Empresas
            </Typography>

            <Chip
              size="small"
              label={`${filtered.length.toLocaleString(
                "es-MX",
              )} registros`}
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
              placeholder="Buscar en empresas"
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

            <Tooltip title="Actualizar empresas">
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
      </Box>

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
              Consultando empresas...
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
            No hay empresas que coincidan
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
                    <TableCell
                      sx={{
                        width: "18%",

                        fontSize:
                          10.5,

                        lineHeight:
                          1.15,

                        fontWeight:
                          900,

                        bgcolor:
                          isDark
                            ? alpha(
                                theme
                                  .palette
                                  .common
                                  .white,
                                0.045,
                              )
                            : alpha(
                                theme
                                  .palette
                                  .common
                                  .black,
                                0.025,
                              ),
                      }}
                    >
                      Nombre
                    </TableCell>

                    <TableCell
                      sx={{
                        width: "11%",

                        fontSize:
                          10.5,

                        lineHeight:
                          1.15,

                        fontWeight:
                          900,

                        bgcolor:
                          isDark
                            ? alpha(
                                theme
                                  .palette
                                  .common
                                  .white,
                                0.045,
                              )
                            : alpha(
                                theme
                                  .palette
                                  .common
                                  .black,
                                0.025,
                              ),
                      }}
                    >
                      RFC
                    </TableCell>

                    <TableCell
                      sx={{
                        width: "18%",

                        fontSize:
                          10.5,

                        lineHeight:
                          1.15,

                        fontWeight:
                          900,

                        bgcolor:
                          isDark
                            ? alpha(
                                theme
                                  .palette
                                  .common
                                  .white,
                                0.045,
                              )
                            : alpha(
                                theme
                                  .palette
                                  .common
                                  .black,
                                0.025,
                              ),
                      }}
                    >
                      Correo
                    </TableCell>

                    <TableCell
                      sx={{
                        width: "10%",

                        fontSize:
                          10.5,

                        lineHeight:
                          1.15,

                        fontWeight:
                          900,

                        bgcolor:
                          isDark
                            ? alpha(
                                theme
                                  .palette
                                  .common
                                  .white,
                                0.045,
                              )
                            : alpha(
                                theme
                                  .palette
                                  .common
                                  .black,
                                0.025,
                              ),
                      }}
                    >
                      Vigencia
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{
                        width: "7%",

                        fontSize:
                          10.5,

                        lineHeight:
                          1.15,

                        fontWeight:
                          900,

                        bgcolor:
                          isDark
                            ? alpha(
                                theme
                                  .palette
                                  .common
                                  .white,
                                0.045,
                              )
                            : alpha(
                                theme
                                  .palette
                                  .common
                                  .black,
                                0.025,
                              ),
                      }}
                    >
                      Timbres
                    </TableCell>

                    <TableCell
                      sx={{
                        width: "8%",

                        fontSize:
                          10.5,

                        lineHeight:
                          1.15,

                        fontWeight:
                          900,

                        bgcolor:
                          isDark
                            ? alpha(
                                theme
                                  .palette
                                  .common
                                  .white,
                                0.045,
                              )
                            : alpha(
                                theme
                                  .palette
                                  .common
                                  .black,
                                0.025,
                              ),
                      }}
                    >
                      Persona
                    </TableCell>

                    <TableCell
                      sx={{
                        width: "9%",

                        fontSize:
                          10.5,

                        lineHeight:
                          1.15,

                        fontWeight:
                          900,

                        bgcolor:
                          isDark
                            ? alpha(
                                theme
                                  .palette
                                  .common
                                  .white,
                                0.045,
                              )
                            : alpha(
                                theme
                                  .palette
                                  .common
                                  .black,
                                0.025,
                              ),
                      }}
                    >
                      Estado
                    </TableCell>

                    <TableCell
                      sx={{
                        width: "19%",

                        fontSize:
                          10.5,

                        lineHeight:
                          1.15,

                        fontWeight:
                          900,

                        bgcolor:
                          isDark
                            ? alpha(
                                theme
                                  .palette
                                  .common
                                  .white,
                                0.045,
                              )
                            : alpha(
                                theme
                                  .palette
                                  .common
                                  .black,
                                0.025,
                              ),
                      }}
                    >
                      Indicadores
                    </TableCell>
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
                            <Typography
                              fontSize={
                                9.8
                              }
                              sx={{
                                lineHeight:
                                  1.25,

                                whiteSpace:
                                  "normal",
                              }}
                            >
                              {formatDate(
                                getExpiration(
                                  empresa,
                                ),
                              )}
                            </Typography>
                          </TableCell>

                          {/* TIMBRES */}

                          <TableCell
                            align="right"
                          >
                            <Typography
                              fontSize={
                                10.5
                              }
                              fontWeight={
                                900
                              }
                              sx={{
                                lineHeight:
                                  1.25,
                              }}
                            >
                              {getTimbres(
                                empresa,
                              ).toLocaleString(
                                "es-MX",
                              )}
                            </Typography>
                          </TableCell>

                          {/* PERSONA */}

                          <TableCell>
                            <Chip
                              size="small"
                              label={getPersona(
                                empresa,
                              )}
                              variant="outlined"
                              sx={{
                                maxWidth:
                                  "100%",

                                height:
                                  21,

                                fontSize:
                                  8.5,

                                fontWeight:
                                  700,

                                "& .MuiChip-label":
                                  {
                                    px: 0.6,

                                    overflow:
                                      "hidden",

                                    textOverflow:
                                      "ellipsis",
                                  },
                              }}
                            />
                          </TableCell>

                          {/* ESTADO */}

                          <TableCell>
                            <Tooltip
                              title={
                                estado.label
                              }
                            >
                              <Chip
                                size="small"
                                label={
                                  estado.label
                                }
                                color={
                                  estado.color
                                }
                                variant="outlined"
                                sx={{
                                  maxWidth:
                                    "100%",

                                  height:
                                    21,

                                  fontSize:
                                    8.2,

                                  fontWeight:
                                    800,

                                  "& .MuiChip-label":
                                    {
                                      px: 0.55,

                                      overflow:
                                        "hidden",

                                      textOverflow:
                                        "ellipsis",
                                    },
                                }}
                              />
                            </Tooltip>
                          </TableCell>

                          {/* INDICADORES */}

                          <TableCell>
                            <IndicadoresEmpresa
                              indicadores={
                                companyIndicators
                              }
                            />
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

                        <Chip
                          size="small"
                          label={
                            estado.label
                          }
                          color={
                            estado.color
                          }
                          variant="outlined"
                          sx={{
                            flexShrink:
                              0,

                            maxWidth:
                              135,

                            fontSize:
                              9,

                            fontWeight:
                              800,
                          }}
                        />
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
                              Vigencia
                            </Typography>

                            <Typography
                              fontSize={
                                10.5
                              }
                              fontWeight={
                                700
                              }
                            >
                              {formatDate(
                                getExpiration(
                                  empresa,
                                ),
                              )}
                            </Typography>
                          </Box>
                        </Stack>

                        {/* TIMBRES */}

                        <Stack
                          direction="row"
                          spacing={0.8}
                          alignItems="center"
                        >
                          <ConfirmationNumberOutlinedIcon
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
                              Timbres
                            </Typography>

                            <Typography
                              fontSize={
                                10.5
                              }
                              fontWeight={
                                900
                              }
                            >
                              {getTimbres(
                                empresa,
                              ).toLocaleString(
                                "es-MX",
                              )}
                            </Typography>
                          </Box>
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
                          </Box>
                        </Stack>
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
  );
}