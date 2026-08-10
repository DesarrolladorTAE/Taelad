import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
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

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";

import {
  getTaecontaSystemEmpresas,
  getTaecontaSystemTimbrados,
} from "../../../services/superadminService";

import type {
  TaecontaTimbreDetail,
} from "./types";

/*
|--------------------------------------------------------------------------
| PAC DE TAECONTA
|--------------------------------------------------------------------------
|
| 6 = PAC principal
| 7 = PAC respaldo
|
*/

const PAC_PRINCIPAL_ID = 6;
const PAC_RESPALDO_ID = 7;

const ROWS_PER_PAGE_OPTIONS = [
  10,
  20,
  50,
  100,
];

/*
|--------------------------------------------------------------------------
| PROPS
|--------------------------------------------------------------------------
*/

type Props = {
  type: TaecontaTimbreDetail;

  onBack: () => void;

  onChangeType: (
    type: TaecontaTimbreDetail,
  ) => void;
};

/*
|--------------------------------------------------------------------------
| TIPOS
|--------------------------------------------------------------------------
*/

type GenericRecord =
  Record<string, unknown>;

type EmpresaAsignada = {
  id: string;

  nombre: string;

  rfc: string;

  timbresAsignados: number;
};

/*
|--------------------------------------------------------------------------
| HELPERS GENERALES
|--------------------------------------------------------------------------
*/

function firstValue(
  source: GenericRecord,
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

function extractArray(
  response: unknown,
): GenericRecord[] {
  const raw =
    response as any;

  if (
    Array.isArray(raw)
  ) {
    return raw;
  }

  if (
    Array.isArray(
      raw?.data,
    )
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

function toNumber(
  value: unknown,
): number {
  const parsed =
    Number(value ?? 0);

  return Number.isFinite(
    parsed,
  )
    ? parsed
    : 0;
}

/*
|--------------------------------------------------------------------------
| EMPRESA
|--------------------------------------------------------------------------
*/

function getEmpresaNombre(
  item: GenericRecord,
): string {
  const empresa =
    item.empresa;

  if (
    empresa &&
    typeof empresa ===
      "object" &&
    !Array.isArray(
      empresa,
    )
  ) {
    const record =
      empresa as GenericRecord;

    return String(
      firstValue(
        record,
        "nombre",
        "name",
        "razon_social",
      ) ?? "—",
    );
  }

  return String(
    firstValue(
      item,
      "empresa_nombre",
      "nombre_empresa",
      "razon_social",
      "receptor_nombre",
      "nombre",
    ) ?? "—",
  );
}

function getRfc(
  item: GenericRecord,
): string {
  const empresa =
    item.empresa;

  if (
    empresa &&
    typeof empresa ===
      "object" &&
    !Array.isArray(
      empresa,
    )
  ) {
    const record =
      empresa as GenericRecord;

    const nestedRfc =
      firstValue(
        record,
        "rfc",
        "RFC",
      );

    if (nestedRfc) {
      return String(
        nestedRfc,
      );
    }
  }

  return String(
    firstValue(
      item,
      "rfc",
      "empresa_rfc",
      "receptor_rfc",
      "RFC",
    ) ?? "—",
  );
}

/*
|--------------------------------------------------------------------------
| CFDI
|--------------------------------------------------------------------------
*/

function getUuid(
  item: GenericRecord,
): string {
  return String(
    firstValue(
      item,
      "uuid",
      "UUID",
    ) ?? "—",
  );
}

function getSerieFolio(
  item: GenericRecord,
): string {
  const serie =
    String(
      firstValue(
        item,
        "serie",
      ) ?? "",
    ).trim();

  const folio =
    String(
      firstValue(
        item,
        "folio",
      ) ?? "",
    ).trim();

  if (
    serie &&
    folio
  ) {
    return `${serie}-${folio}`;
  }

  if (serie) {
    return serie;
  }

  if (folio) {
    return folio;
  }

  return "—";
}

/*
|--------------------------------------------------------------------------
| FECHA
|--------------------------------------------------------------------------
*/

function getFechaRaw(
  item: GenericRecord,
): unknown {
  return firstValue(
    item,
    "fecha",
    "fecha_timbrado",
    "timbrado_at",
    "pac_created_at",
    "created_at",
  );
}

function formatDate(
  value: unknown,
): string {
  if (!value) {
    return "—";
  }

  const text =
    String(value);

  const date =
    new Date(text);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return text;
  }

  return new Intl.DateTimeFormat(
    "es-MX",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",

      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

/*
|--------------------------------------------------------------------------
| PAC
|--------------------------------------------------------------------------
*/

function getPacId(
  item: GenericRecord,
): number | null {
  const direct =
    toNumber(
      firstValue(
        item,
        "pac_id",
        "timbre_sistema_id",
      ),
    );

  if (direct > 0) {
    return direct;
  }

  const pac =
    item.pac;

  if (
    pac &&
    typeof pac ===
      "object" &&
    !Array.isArray(pac)
  ) {
    const record =
      pac as GenericRecord;

    const nested =
      toNumber(
        record.id,
      );

    if (nested > 0) {
      return nested;
    }
  }

  return null;
}

function getPacLabel(
  item: GenericRecord,
): string {
  const pacId =
    getPacId(item);

  if (
    pacId ===
    PAC_PRINCIPAL_ID
  ) {
    return "Facturalo";
  }

  if (
    pacId ===
    PAC_RESPALDO_ID
  ) {
    return "TechBlThree";
  }

  const pac =
    item.pac;

  if (
    pac &&
    typeof pac ===
      "object" &&
    !Array.isArray(pac)
  ) {
    const record =
      pac as GenericRecord;

    const label =
      firstValue(
        record,
        "nombre",
        "name",
        "rfc_pac",
      );

    if (label) {
      return String(
        label,
      );
    }
  }

  return String(
    firstValue(
      item,
      "pac_nombre",
      "rfc_pac",
    ) ?? "PAC",
  );
}

/*
|--------------------------------------------------------------------------
| TIMBRES ASIGNADOS POR EMPRESA
|--------------------------------------------------------------------------
*/

function getTimbresAsignados(
  empresa: GenericRecord,
): number {
  /*
   * Priorizamos los campos que realmente
   * significan asignados.
   */
  const direct =
    firstValue(
      empresa,
      "timbresAsignados",
      "timbres_asignados",
      "total_asignados",
      "folios_asignados",
    );

  if (
    direct !== null
  ) {
    return toNumber(
      direct,
    );
  }

  /*
   * Fallback solamente si el endpoint
   * expone "timbres" como cantidad actual.
   */
  const timbres =
    empresa.timbres;

  if (
    timbres &&
    typeof timbres ===
      "object" &&
    !Array.isArray(
      timbres,
    )
  ) {
    const record =
      timbres as GenericRecord;

    return toNumber(
      firstValue(
        record,
        "asignados",
        "total_asignados",
        "cantidad",
        "total",
      ),
    );
  }

  return toNumber(
    timbres,
  );
}

function normalizeEmpresaAsignada(
  empresa: GenericRecord,
  index: number,
): EmpresaAsignada {
  return {
    id: String(
      firstValue(
        empresa,
        "id",
      ) ??
        `${getRfc(
          empresa,
        )}-${index}`,
    ),

    nombre:
      getEmpresaNombre(
        empresa,
      ),

    rfc:
      getRfc(
        empresa,
      ),

    timbresAsignados:
      getTimbresAsignados(
        empresa,
      ),
  };
}

/*
|--------------------------------------------------------------------------
| COMPONENTE
|--------------------------------------------------------------------------
*/

export default function TaecontaSystemTimbrados({
  type,
  onBack,
  onChangeType,
}: Props) {
  const theme =
    useTheme();

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
    timbrados,
    setTimbrados,
  ] =
    useState<
      GenericRecord[]
    >([]);

  const [
    empresasAsignadas,
    setEmpresasAsignadas,
  ] =
    useState<
      EmpresaAsignada[]
    >([]);

  const [
    total,
    setTotal,
  ] =
    useState(0);

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

  const [
    searchInput,
    setSearchInput,
  ] =
    useState("");

  const [
    search,
    setSearch,
  ] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | CONFIGURACIÓN DE LA VISTA
  |--------------------------------------------------------------------------
  */

  const title =
    useMemo(() => {
      switch (type) {
        case "asignados":
          return "Timbres asignados";

        case "disponibles":
          return "PAC principal";

        case "respaldo":
          return "PAC respaldo";

        case "total":
        default:
          return "Historial CFDI";
      }
    }, [type]);

  const subtitle =
    useMemo(() => {
      switch (type) {
        case "asignados":
          return "Empresas con timbres asignados.";

        case "disponibles":
          return "CFDI procesados mediante el PAC principal.";

        case "respaldo":
          return "CFDI procesados mediante el PAC de respaldo.";

        case "total":
        default:
          return "Histórico de CFDI registrado en TAECONTA.";
      }
    }, [type]);

  /*
  |--------------------------------------------------------------------------
  | CARGAR TIMBRADOS
  |--------------------------------------------------------------------------
  */

  const cargarTimbrados =
    useCallback(
      async (
        detail:
          TaecontaTimbreDetail,
      ) => {
        let pacId:
          | number
          | undefined;

        if (
          detail ===
          "disponibles"
        ) {
          pacId =
            PAC_PRINCIPAL_ID;
        }

        if (
          detail ===
          "respaldo"
        ) {
          pacId =
            PAC_RESPALDO_ID;
        }

        const response =
          await getTaecontaSystemTimbrados(
            {
              page:
                page + 1,

              perPage:
                rowsPerPage,

              pacId,

              search:
                search ||
                undefined,

              orderBy:
                "created_at",

              order:
                "desc",
            },
          );

        const data =
          Array.isArray(
            response.data,
          )
            ? response.data
            : [];

        setTimbrados(
          data as GenericRecord[],
        );

        setTotal(
          Number(
            response
              .pagination
              ?.total ??
              data.length,
          ) || 0,
        );

        setEmpresasAsignadas(
          [],
        );
      },
      [
        page,
        rowsPerPage,
        search,
      ],
    );

  /*
  |--------------------------------------------------------------------------
  | CARGAR EMPRESAS ASIGNADAS
  |--------------------------------------------------------------------------
  */

  const cargarAsignados =
    useCallback(
      async () => {
        const response =
          await getTaecontaSystemEmpresas();

        const empresas =
          extractArray(
            response,
          );

        const normalized =
          empresas
            .map(
              (
                empresa,
                index,
              ) =>
                normalizeEmpresaAsignada(
                  empresa,
                  index,
                ),
            )
            .filter(
              (empresa) =>
                empresa
                  .timbresAsignados >
                0,
            )
            .sort(
              (a, b) =>
                b.timbresAsignados -
                a.timbresAsignados,
            );

        setEmpresasAsignadas(
          normalized,
        );

        setTimbrados([]);

        setTotal(
          normalized.length,
        );
      },
      [],
    );

  /*
  |--------------------------------------------------------------------------
  | CARGA GENERAL
  |--------------------------------------------------------------------------
  */

  const cargar =
    useCallback(
      async () => {
        setLoading(true);

        setError("");

        try {
          if (
            type ===
            "asignados"
          ) {
            await cargarAsignados();
          } else {
            await cargarTimbrados(
              type,
            );
          }
        } catch (
          requestError: any
        ) {
          console.error(
            "ERROR DETALLE TIMBRES TAECONTA:",
            requestError,
          );

          setTimbrados([]);

          setEmpresasAsignadas(
            [],
          );

          setTotal(0);

          setError(
            requestError
              ?.response
              ?.data
              ?.message ||
              requestError
                ?.message ||
              "No fue posible consultar el detalle de timbres.",
          );
        } finally {
          setLoading(false);
        }
      },
      [
        type,
        cargarAsignados,
        cargarTimbrados,
      ],
    );

  useEffect(() => {
    void cargar();
  }, [cargar]);

  /*
  |--------------------------------------------------------------------------
  | REINICIAR AL CAMBIAR TIPO
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setPage(0);

    setSearchInput("");

    setSearch("");
  }, [type]);

  /*
  |--------------------------------------------------------------------------
  | ASIGNADOS FILTRADOS
  |--------------------------------------------------------------------------
  */

  const filteredAsignados =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return empresasAsignadas;
      }

      return empresasAsignadas.filter(
        (empresa) => {
          const searchable =
            `${empresa.nombre} ${empresa.rfc}`
              .toLowerCase();

          return searchable.includes(
            query,
          );
        },
      );
    }, [
      empresasAsignadas,
      search,
    ]);

  /*
  |--------------------------------------------------------------------------
  | PAGINACIÓN LOCAL DE ASIGNADOS
  |--------------------------------------------------------------------------
  */

  const paginatedAsignados =
    useMemo(() => {
      const start =
        page *
        rowsPerPage;

      return filteredAsignados.slice(
        start,
        start +
          rowsPerPage,
      );
    }, [
      filteredAsignados,
      page,
      rowsPerPage,
    ]);

  /*
  |--------------------------------------------------------------------------
  | TOTAL DE TIMBRES ASIGNADOS
  |--------------------------------------------------------------------------
  */

  const totalTimbresAsignados =
    useMemo(() => {
      return filteredAsignados.reduce(
        (
          accumulator,
          empresa,
        ) =>
          accumulator +
          empresa.timbresAsignados,
        0,
      );
    }, [
      filteredAsignados,
    ]);

  /*
  |--------------------------------------------------------------------------
  | BUSCAR
  |--------------------------------------------------------------------------
  */

  const aplicarBusqueda =
    () => {
      setPage(0);

      setSearch(
        searchInput.trim(),
      );
    };

  const limpiarBusqueda =
    () => {
      setPage(0);

      setSearchInput("");

      setSearch("");
    };

  /*
  |--------------------------------------------------------------------------
  | TABS
  |--------------------------------------------------------------------------
  */

  const tabs: Array<{
    value: TaecontaTimbreDetail;
    label: string;
  }> = [
    {
      value: "total",
      label: "Todos",
    },
    {
      value: "asignados",
      label: "Asignados",
    },
    {
      value: "disponibles",
      label: "PAC principal",
    },
    {
      value: "respaldo",
      label: "PAC respaldo",
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
      }}
    >
      {/* =====================================================
          CABECERA
      ===================================================== */}

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={1.25}
        justifyContent="space-between"
        alignItems={{
          xs: "stretch",
          sm: "center",
        }}
        sx={{
          mb: 1.5,
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="flex-start"
          minWidth={0}
        >
          <Button
            size="small"
            variant="outlined"
            startIcon={
              <ArrowBackOutlinedIcon />
            }
            onClick={onBack}
            sx={{
              minHeight: 36,

              flexShrink: 0,

              textTransform:
                "none",

              fontWeight: 800,

              color:
                "text.primary",

              borderColor:
                "divider",
            }}
          >
            Regresar
          </Button>

          <Box
            minWidth={0}
          >
            <Typography
              component="h2"
              sx={{
                fontSize: {
                  xs: 16,
                  md: 19,
                },

                fontWeight: 900,

                lineHeight: 1.2,
              }}
            >
              {title}
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.25,

                fontSize: 11,
              }}
            >
              {subtitle}
            </Typography>
          </Box>
        </Stack>

        <Tooltip title="Actualizar">
          <span>
            <IconButton
              onClick={() =>
                void cargar()
              }
              disabled={loading}
              sx={{
                width: 36,
                height: 36,

                alignSelf: {
                  xs: "flex-start",
                  sm: "center",
                },

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
                <RefreshOutlinedIcon fontSize="small" />
              )}
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      {/* =====================================================
          NAVEGACIÓN DE DETALLES
      ===================================================== */}

      <Stack
        direction="row"
        spacing={0.75}
        useFlexGap
        flexWrap="wrap"
        sx={{
          mb: 1.5,
        }}
      >
        {tabs.map(
          (tab) => {
            const active =
              type ===
              tab.value;

            return (
              <Chip
                key={
                  tab.value
                }
                label={
                  tab.label
                }
                clickable
                onClick={() =>
                  onChangeType(
                    tab.value,
                  )
                }
                color={
                  active
                    ? "primary"
                    : "default"
                }
                variant={
                  active
                    ? "filled"
                    : "outlined"
                }
                sx={{
                  fontWeight:
                    active
                      ? 800
                      : 700,
                }}
              />
            );
          },
        )}
      </Stack>

      {/* =====================================================
          BUSCADOR
      ===================================================== */}

      <Paper
        elevation={0}
        sx={{
          p: 1,

          mb: 1.5,

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
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1}
        >
          <TextField
            fullWidth
            size="small"
            value={
              searchInput
            }
            placeholder={
              type ===
              "asignados"
                ? "Buscar empresa o RFC"
                : "Buscar UUID, empresa, RFC o folio"
            }
            onChange={(
              event,
            ) => {
              setSearchInput(
                event.target
                  .value,
              );
            }}
            onKeyDown={(
              event,
            ) => {
              if (
                event.key ===
                "Enter"
              ) {
                aplicarBusqueda();
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <Button
            size="small"
            variant="contained"
            onClick={
              aplicarBusqueda
            }
            sx={{
              minWidth: {
                xs: "100%",
                sm: 90,
              },

              textTransform:
                "none",

              fontWeight: 800,
            }}
          >
            Buscar
          </Button>

          {search && (
            <Button
              size="small"
              variant="outlined"
              onClick={
                limpiarBusqueda
              }
              sx={{
                minWidth: {
                  xs: "100%",
                  sm: 80,
                },

                textTransform:
                  "none",

                fontWeight: 700,
              }}
            >
              Limpiar
            </Button>
          )}
        </Stack>
      </Paper>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <Alert
          severity="warning"
          sx={{
            mb: 1.5,
          }}
        >
          {error}
        </Alert>
      )}

      {/* =====================================================
          CARGANDO
      ===================================================== */}

      {loading ? (
        <Box
          sx={{
            minHeight: 320,

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
              Consultando información...
            </Typography>
          </Stack>
        </Box>
      ) : type ===
        "asignados" ? (
        /*
        |--------------------------------------------------------------------------
        | TIMBRES ASIGNADOS
        |--------------------------------------------------------------------------
        */
        <>
          <Paper
            elevation={0}
            sx={{
              mb: 1.25,

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
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={0.5}
              justifyContent="space-between"
            >
              <Box>
                <Typography
                  color="text.secondary"
                  fontSize={10.5}
                  fontWeight={700}
                >
                  Empresas con timbres
                </Typography>

                <Typography
                  fontWeight={900}
                  fontSize={18}
                >
                  {filteredAsignados.length.toLocaleString(
                    "es-MX",
                  )}
                </Typography>
              </Box>

              <Box
                sx={{
                  textAlign: {
                    xs: "left",
                    sm: "right",
                  },
                }}
              >
                <Typography
                  color="text.secondary"
                  fontSize={10.5}
                  fontWeight={700}
                >
                  Timbres asignados
                </Typography>

                <Typography
                  color="warning.main"
                  fontWeight={900}
                  fontSize={18}
                >
                  {totalTimbresAsignados.toLocaleString(
                    "es-MX",
                  )}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {filteredAsignados.length ===
          0 ? (
            <Box
              sx={{
                py: 7,

                textAlign:
                  "center",
              }}
            >
              <BusinessOutlinedIcon
                sx={{
                  fontSize: 44,

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
                color="text.secondary"
                fontSize={11.5}
                mt={0.3}
              >
                No se encontraron empresas con timbres asignados.
              </Typography>
            </Box>
          ) : (
            <>
              {!isMobile ? (
                <TableContainer
                  sx={{
                    overflowX:
                      "auto",
                  }}
                >
                  <Table
                    size="small"
                    sx={{
                      minWidth:
                        680,
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight:
                              900,
                          }}
                        >
                          Empresa
                        </TableCell>

                        <TableCell
                          sx={{
                            fontWeight:
                              900,
                          }}
                        >
                          RFC
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            fontWeight:
                              900,
                          }}
                        >
                          Timbres asignados
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {paginatedAsignados.map(
                        (
                          empresa,
                        ) => (
                          <TableRow
                            key={
                              empresa.id
                            }
                            hover
                          >
                            <TableCell>
                              <Typography
                                fontWeight={
                                  800
                                }
                                fontSize={
                                  12
                                }
                              >
                                {
                                  empresa.nombre
                                }
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography
                                fontFamily="monospace"
                                fontSize={
                                  11.5
                                }
                              >
                                {
                                  empresa.rfc
                                }
                              </Typography>
                            </TableCell>

                            <TableCell
                              align="right"
                            >
                              <Chip
                                size="small"
                                icon={
                                  <ConfirmationNumberOutlinedIcon />
                                }
                                label={empresa.timbresAsignados.toLocaleString(
                                  "es-MX",
                                )}
                                color="warning"
                                variant="outlined"
                                sx={{
                                  fontWeight:
                                    800,
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Stack
                  spacing={1}
                >
                  {paginatedAsignados.map(
                    (
                      empresa,
                    ) => (
                      <Paper
                        key={
                          empresa.id
                        }
                        elevation={0}
                        sx={{
                          p: 1.25,

                          border:
                            "1px solid",

                          borderColor:
                            "divider",

                          borderRadius:
                            1.5,
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          spacing={1}
                        >
                          <Box
                            minWidth={0}
                          >
                            <Typography
                              fontWeight={
                                900
                              }
                              fontSize={
                                13
                              }
                            >
                              {
                                empresa.nombre
                              }
                            </Typography>

                            <Typography
                              color="text.secondary"
                              fontFamily="monospace"
                              fontSize={
                                10.5
                              }
                              mt={0.2}
                            >
                              {
                                empresa.rfc
                              }
                            </Typography>
                          </Box>

                          <Chip
                            size="small"
                            label={empresa.timbresAsignados.toLocaleString(
                              "es-MX",
                            )}
                            color="warning"
                            variant="outlined"
                            sx={{
                              flexShrink:
                                0,

                              fontWeight:
                                800,
                            }}
                          />
                        </Stack>
                      </Paper>
                    ),
                  )}
                </Stack>
              )}

              <TablePagination
                component="div"
                count={
                  filteredAsignados.length
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
              />
            </>
          )}
        </>
      ) : (
        /*
        |--------------------------------------------------------------------------
        | HISTÓRICO CFDI
        |--------------------------------------------------------------------------
        */
        <>
          {timbrados.length ===
          0 ? (
            <Box
              sx={{
                py: 7,

                textAlign:
                  "center",
              }}
            >
              <ReceiptLongOutlinedIcon
                sx={{
                  fontSize: 46,

                  color:
                    "text.disabled",
                }}
              />

              <Typography
                mt={1}
                fontWeight={800}
              >
                Sin CFDI
              </Typography>

              <Typography
                color="text.secondary"
                fontSize={11.5}
                mt={0.3}
              >
                No se encontraron registros para esta selección.
              </Typography>
            </Box>
          ) : (
            <>
              {/* ===============================================
                  TABLA ESCRITORIO
              =============================================== */}

              {!isMobile ? (
                <TableContainer
                  sx={{
                    width: "100%",

                    overflowX:
                      "auto",
                  }}
                >
                  <Table
                    size="small"
                    stickyHeader
                    sx={{
                      minWidth:
                        1050,
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight:
                              900,
                          }}
                        >
                          UUID
                        </TableCell>

                        <TableCell
                          sx={{
                            fontWeight:
                              900,
                          }}
                        >
                          Empresa
                        </TableCell>

                        <TableCell
                          sx={{
                            fontWeight:
                              900,
                          }}
                        >
                          RFC
                        </TableCell>

                        <TableCell
                          sx={{
                            fontWeight:
                              900,
                          }}
                        >
                          Fecha
                        </TableCell>

                        <TableCell
                          sx={{
                            fontWeight:
                              900,
                          }}
                        >
                          Serie / Folio
                        </TableCell>

                        <TableCell
                          sx={{
                            fontWeight:
                              900,
                          }}
                        >
                          PAC
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {timbrados.map(
                        (
                          item,
                          index,
                        ) => (
                          <TableRow
                            key={String(
                              firstValue(
                                item,
                                "id",
                              ) ??
                                `${getUuid(
                                  item,
                                )}-${index}`,
                            )}
                            hover
                          >
                            <TableCell
                              sx={{
                                maxWidth:
                                  260,
                              }}
                            >
                              <Typography
                                fontFamily="monospace"
                                fontSize={
                                  10.5
                                }
                                sx={{
                                  wordBreak:
                                    "break-all",
                                }}
                              >
                                {getUuid(
                                  item,
                                )}
                              </Typography>
                            </TableCell>

                            <TableCell
                              sx={{
                                minWidth:
                                  190,
                              }}
                            >
                              <Typography
                                fontWeight={
                                  800
                                }
                                fontSize={
                                  11.5
                                }
                              >
                                {getEmpresaNombre(
                                  item,
                                )}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography
                                fontFamily="monospace"
                                fontSize={
                                  11
                                }
                              >
                                {getRfc(
                                  item,
                                )}
                              </Typography>
                            </TableCell>

                            <TableCell
                              sx={{
                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              <Typography
                                fontSize={
                                  11
                                }
                              >
                                {formatDate(
                                  getFechaRaw(
                                    item,
                                  ),
                                )}
                              </Typography>
                            </TableCell>

                            <TableCell
                              sx={{
                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              <Typography
                                fontWeight={
                                  800
                                }
                                fontSize={
                                  11.5
                                }
                              >
                                {getSerieFolio(
                                  item,
                                )}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Chip
                                size="small"
                                label={getPacLabel(
                                  item,
                                )}
                                variant="outlined"
                                sx={{
                                  fontWeight:
                                    700,

                                  fontSize:
                                    10,
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                /* =============================================
                   MÓVIL
                ============================================= */

                <Stack
                  spacing={1}
                >
                  {timbrados.map(
                    (
                      item,
                      index,
                    ) => (
                      <Paper
                        key={String(
                          firstValue(
                            item,
                            "id",
                          ) ??
                            `${getUuid(
                              item,
                            )}-${index}`,
                        )}
                        elevation={0}
                        sx={{
                          p: 1.25,

                          border:
                            "1px solid",

                          borderColor:
                            "divider",

                          borderRadius:
                            1.5,
                        }}
                      >
                        <Stack
                          spacing={0.8}
                        >
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            spacing={1}
                          >
                            <Box
                              minWidth={0}
                            >
                              <Typography
                                fontWeight={
                                  900
                                }
                                fontSize={
                                  13
                                }
                              >
                                {getEmpresaNombre(
                                  item,
                                )}
                              </Typography>

                              <Typography
                                color="text.secondary"
                                fontFamily="monospace"
                                fontSize={
                                  10.5
                                }
                                mt={0.15}
                              >
                                {getRfc(
                                  item,
                                )}
                              </Typography>
                            </Box>

                            <Chip
                              size="small"
                              label={getPacLabel(
                                item,
                              )}
                              variant="outlined"
                              sx={{
                                flexShrink:
                                  0,

                                fontSize:
                                  9.5,
                              }}
                            />
                          </Stack>

                          <Divider />

                          <Box>
                            <Typography
                              color="text.secondary"
                              fontSize={
                                9
                              }
                            >
                              UUID
                            </Typography>

                            <Typography
                              fontFamily="monospace"
                              fontSize={
                                10
                              }
                              sx={{
                                wordBreak:
                                  "break-all",
                              }}
                            >
                              {getUuid(
                                item,
                              )}
                            </Typography>
                          </Box>

                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            spacing={1}
                          >
                            <Box>
                              <Typography
                                color="text.secondary"
                                fontSize={
                                  9
                                }
                              >
                                Fecha
                              </Typography>

                              <Typography
                                fontSize={
                                  10.5
                                }
                              >
                                {formatDate(
                                  getFechaRaw(
                                    item,
                                  ),
                                )}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                textAlign:
                                  "right",
                              }}
                            >
                              <Typography
                                color="text.secondary"
                                fontSize={
                                  9
                                }
                              >
                                Serie / Folio
                              </Typography>

                              <Typography
                                fontWeight={
                                  800
                                }
                                fontSize={
                                  10.5
                                }
                              >
                                {getSerieFolio(
                                  item,
                                )}
                              </Typography>
                            </Box>
                          </Stack>
                        </Stack>
                      </Paper>
                    ),
                  )}
                </Stack>
              )}

              {/* ===============================================
                  PAGINACIÓN DEL HISTÓRICO
              =============================================== */}

              <TablePagination
                component="div"
                count={total}
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
                  `${from}-${to} de ${
                    count === -1
                      ? `más de ${to}`
                      : count
                  }`
                }
                sx={{
                  mt: 1,

                  borderTop:
                    "1px solid",

                  borderColor:
                    "divider",
                }}
              />
            </>
          )}
        </>
      )}
    </Box>
  );
}