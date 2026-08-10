import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import {
  Alert,
  Box,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";

import {
  getTaecontaSystemEmpresas,
  getTaecontaSystemIndicadores,
} from "../../../services/superadminService";

import type {
  TaecontaEmpresaFilters,
  TaecontaIndicador,
} from "./types";

type Props = {
  filters: TaecontaEmpresaFilters;

  onFiltersChange: Dispatch<
    SetStateAction<TaecontaEmpresaFilters>
  >;
};

type Empresa =
  Record<string, any>;

function extractArray(
  response: any,
): any[] {
  if (
    Array.isArray(response)
  ) {
    return response;
  }

  if (
    Array.isArray(
      response?.data,
    )
  ) {
    return response.data;
  }

  if (
    Array.isArray(
      response?.data?.data,
    )
  ) {
    return response.data.data;
  }

  return [];
}

function parseDate(
  value: unknown,
): Date | null {
  if (!value) {
    return null;
  }

  const match =
    String(value).match(
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

  const date =
    new Date(
      year,
      month - 1,
      day,
      12,
      0,
      0,
    );

  return Number.isNaN(
    date.getTime(),
  )
    ? null
    : date;
}

function getExpiration(
  empresa: Empresa,
): unknown {
  return (
    empresa.expires_at ??
    empresa.fecha_vencimiento ??
    empresa.vencimiento ??
    empresa.vigencia ??
    null
  );
}

function getSearchableText(
  empresa: Empresa,
): string {
  return [
    empresa.nombre,
    empresa.name,
    empresa.razon_social,
    empresa.rfc,
    empresa.correo,
    empresa.email,
    empresa.telefono,
  ]
    .filter(
      (
        value,
      ) =>
        value !==
          undefined &&
        value !== null,
    )
    .join(" ")
    .toLowerCase();
}

function collectIndicatorIds(
  empresa: Empresa,
): number[] {
  const ids =
    new Set<number>();

  const add = (
    value: unknown,
  ) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return;
    }

    if (
      Array.isArray(value)
    ) {
      value.forEach(add);
      return;
    }

    if (
      typeof value ===
        "number"
    ) {
      if (
        Number.isFinite(
          value,
        )
      ) {
        ids.add(value);
      }

      return;
    }

    if (
      typeof value ===
        "string"
    ) {
      value
        .split(",")
        .map(
          (item) =>
            Number(
              item.trim(),
            ),
        )
        .filter(
          Number.isFinite,
        )
        .forEach(
          (id) =>
            ids.add(id),
        );

      return;
    }

    if (
      typeof value ===
        "object"
    ) {
      const record =
        value as Record<
          string,
          unknown
        >;

      const id =
        Number(
          record.id ??
          record.indicador_id ??
          record.indicator_id,
        );

      if (
        Number.isFinite(id)
      ) {
        ids.add(id);
      }
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
  ].forEach(add);

  return Array.from(ids);
}

export default function TaecontaResumen({
  filters,
  onFiltersChange,
}: Props) {
  const [
    empresas,
    setEmpresas,
  ] =
    useState<Empresa[]>([]);

  const [
    indicadores,
    setIndicadores,
  ] =
    useState<TaecontaIndicador[]>(
      [],
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

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
          extractArray(
            indicadoresResponse,
          )
            .map(
              (
                item,
              ): TaecontaIndicador => ({
                id:
                  Number(
                    item.id,
                  ),

                nombre:
                  String(
                    item.nombre ??
                      item.name ??
                      "",
                  ),

                color:
                  String(
                    item.color ??
                      "#64748B",
                  ),
              }),
            )
            .filter(
              (item) =>
                Number.isFinite(
                  item.id,
                ) &&
                Boolean(
                  item.nombre,
                ),
            ),
        );
      } catch (error: any) {
        console.error(
          "ERROR RESUMEN TAECONTA:",
          error,
        );

        setError(
          error?.response?.data
            ?.message ||
            error?.message ||
            "No fue posible consultar el resumen.",
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
  | AÑOS
  |--------------------------------------------------------------------------
  */

  const years =
    useMemo(() => {
      const values =
        new Set<number>();

      empresas.forEach(
        (empresa) => {
          const date =
            parseDate(
              getExpiration(
                empresa,
              ),
            );

          if (date) {
            values.add(
              date.getFullYear(),
            );
          }
        },
      );

      values.add(
        new Date().getFullYear(),
      );

      return Array.from(
        values,
      ).sort(
        (a, b) =>
          b - a,
      );
    }, [empresas]);

  /*
  |--------------------------------------------------------------------------
  | EMPRESAS FILTRADAS
  |--------------------------------------------------------------------------
  */

  const filtered =
    useMemo(() => {
      const search =
        filters.search
          .trim()
          .toLowerCase();

      return empresas.filter(
        (empresa) => {
          if (
            search &&
            !getSearchableText(
              empresa,
            ).includes(search)
          ) {
            return false;
          }

          if (
            filters.indicadorId !==
            ""
          ) {
            const ids =
              collectIndicatorIds(
                empresa,
              );

            if (
              !ids.includes(
                Number(
                  filters.indicadorId,
                ),
              )
            ) {
              return false;
            }
          }

          if (
            filters.month !==
              "" ||
            filters.year !==
              ""
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
      filters,
    ]);

  /*
  |--------------------------------------------------------------------------
  | MÉTRICAS
  |--------------------------------------------------------------------------
  */

  const metrics =
    useMemo(() => {
      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0,
      );

      let vigentes = 0;
      let vencidas = 0;
      let proximas = 0;

      filtered.forEach(
        (empresa) => {
          const expiration =
            parseDate(
              getExpiration(
                empresa,
              ),
            );

          if (!expiration) {
            return;
          }

          expiration.setHours(
            0,
            0,
            0,
            0,
          );

          if (
            expiration <
            today
          ) {
            vencidas++;
            return;
          }

          vigentes++;

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

          if (
            days <= 30
          ) {
            proximas++;
          }
        },
      );

      return {
        total:
          filtered.length,

        vigentes,
        vencidas,
        proximas,
      };
    }, [filtered]);

  const months = [
    [1, "Enero"],
    [2, "Febrero"],
    [3, "Marzo"],
    [4, "Abril"],
    [5, "Mayo"],
    [6, "Junio"],
    [7, "Julio"],
    [8, "Agosto"],
    [9, "Septiembre"],
    [10, "Octubre"],
    [11, "Noviembre"],
    [12, "Diciembre"],
  ] as const;

  const cards = [
    {
      label:
        "Resultados",

      value:
        metrics.total,

      icon:
        <BusinessOutlinedIcon />,

      color:
        "primary.main",
    },
    {
      label:
        "Vigentes",

      value:
        metrics.vigentes,

      icon:
        <CheckCircleOutlineOutlinedIcon />,

      color:
        "success.main",
    },
    {
      label:
        "Vencidas",

      value:
        metrics.vencidas,

      icon:
        <ErrorOutlineOutlinedIcon />,

      color:
        "error.main",
    },
    {
      label:
        "Próximas 30 días",

      value:
        metrics.proximas,

      icon:
        <AccessTimeOutlinedIcon />,

      color:
        "warning.main",
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        minWidth: 0,

        p: {
          xs: 1.25,
          sm: 1.5,
          md: 1.75,
        },

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
      {error && (
        <Alert
          severity="warning"
          sx={{
            mb: 1.25,
          }}
        >
          {error}
        </Alert>
      )}

      {/* FILTROS */}

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: {
            xs:
              "minmax(0, 1fr)",

            sm:
              "minmax(0, 2fr) repeat(3, minmax(130px, 1fr))",
          },

          gap: 1,
        }}
      >
        <TextField
          fullWidth
          size="small"
          value={
            filters.search
          }
          placeholder="Buscar empresa, RFC, correo..."
          onChange={(
            event,
          ) =>
            onFiltersChange(
              (current) => ({
                ...current,

                search:
                  event.target
                    .value,
              }),
            )
          }
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          select
          size="small"
          label="Mes"
          value={
            filters.month
          }
          onChange={(
            event,
          ) =>
            onFiltersChange(
              (current) => ({
                ...current,

                month:
                  event.target
                    .value ===
                  ""
                    ? ""
                    : Number(
                        event
                          .target
                          .value,
                      ),
              }),
            )
          }
        >
          <MenuItem value="">
            Todos
          </MenuItem>

          {months.map(
            ([
              value,
              label,
            ]) => (
              <MenuItem
                key={value}
                value={value}
              >
                {label}
              </MenuItem>
            ),
          )}
        </TextField>

        <TextField
          select
          size="small"
          label="Año"
          value={
            filters.year
          }
          onChange={(
            event,
          ) =>
            onFiltersChange(
              (current) => ({
                ...current,

                year:
                  event.target
                    .value ===
                  ""
                    ? ""
                    : Number(
                        event
                          .target
                          .value,
                      ),
              }),
            )
          }
        >
          <MenuItem value="">
            Todos
          </MenuItem>

          {years.map(
            (year) => (
              <MenuItem
                key={year}
                value={year}
              >
                {year}
              </MenuItem>
            ),
          )}
        </TextField>

        <TextField
          select
          size="small"
          label="Indicador"
          value={
            filters.indicadorId
          }
          onChange={(
            event,
          ) =>
            onFiltersChange(
              (current) => ({
                ...current,

                indicadorId:
                  event.target
                    .value ===
                  ""
                    ? ""
                    : Number(
                        event
                          .target
                          .value,
                      ),
              }),
            )
          }
        >
          <MenuItem value="">
            Todos
          </MenuItem>

          {indicadores.map(
            (
              indicador,
            ) => (
              <MenuItem
                key={
                  indicador.id
                }
                value={
                  indicador.id
                }
              >
                <Stack
                  direction="row"
                  spacing={0.75}
                  alignItems="center"
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,

                      flexShrink: 0,

                      borderRadius:
                        "50%",

                      bgcolor:
                        indicador.color,
                    }}
                  />

                  <span>
                    {
                      indicador.nombre
                    }
                  </span>
                </Stack>
              </MenuItem>
            ),
          )}
        </TextField>
      </Box>

      {/* MÉTRICAS */}

      {loading ? (
        <Box
          sx={{
            minHeight: 125,

            display: "grid",

            placeItems:
              "center",
          }}
        >
          <CircularProgress
            size={26}
          />
        </Box>
      ) : (
        <Box
          sx={{
            mt: 1.25,

            display: "grid",

            gridTemplateColumns: {
              xs:
                "repeat(2, minmax(0, 1fr))",

              sm:
                "repeat(4, minmax(0, 1fr))",
            },

            gap: 1,
          }}
        >
          {cards.map(
            (card) => (
              <Box
                key={
                  card.label
                }
                sx={{
                  minWidth: 0,

                  p: 1.15,

                  border:
                    "1px solid",

                  borderColor:
                    "divider",

                  borderRadius:
                    1.25,

                  bgcolor:
                    "background.default",
                }}
              >
                <Stack
                  direction="row"
                  spacing={0.75}
                  alignItems="center"
                >
                  <Box
                    sx={{
                      color:
                        card.color,

                      display:
                        "grid",

                      placeItems:
                        "center",

                      "& svg":
                        {
                          fontSize:
                            18,
                        },
                    }}
                  >
                    {card.icon}
                  </Box>

                  <Box minWidth={0}>
                    <Typography
                      fontWeight={900}
                      sx={{
                        fontSize: {
                          xs: 18,
                          md: 21,
                        },

                        lineHeight: 1,
                      }}
                    >
                      {card.value.toLocaleString(
                        "es-MX",
                      )}
                    </Typography>

                    <Typography
                      color="text.secondary"
                      fontSize={9.5}
                      fontWeight={700}
                      mt={0.3}
                    >
                      {card.label}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            ),
          )}
        </Box>
      )}
    </Paper>
  );
}