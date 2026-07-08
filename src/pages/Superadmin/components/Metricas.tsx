import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";

import StorefrontIcon from "@mui/icons-material/Storefront";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import AppsIcon from "@mui/icons-material/Apps";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import RefreshIcon from "@mui/icons-material/Refresh";

import api from "../../../services/axiosClient";

type SistemaKey = "todos" | "mitienda" | "clicmenu";

type ApiSistemaKey = Exclude<SistemaKey, "todos">;

type ApiSistemaData = {
  key: ApiSistemaKey;
  name: string;
  monthly_income: number[];
  total_income: number;
  monthly_companies: number[];
  total_companies: number;
  active_subscriptions: number;
  expired_subscriptions: number;
};

type MetricasResponse = {
  ok: boolean;
  year: number;
  systems: ApiSistemaData[];
  summary: {
    total_income: number;
    total_companies: number;
    total_active_subscriptions: number;
    total_expired_subscriptions: number;
  };
};

type SistemaData = {
  key: ApiSistemaKey;
  label: string;
  icon: JSX.Element;
  empresas: number[];
  ingresos: number[];
  totalIngresos: number;
  totalEmpresas: number;
  activas: number;
  vencidas: number;
};

const meses = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

function normalizeMonthlyValues(values: unknown): number[] {
  const arrayValues = Array.isArray(values) ? values : [];

  return Array.from({ length: 12 }, (_, index) => {
    const value = Number(arrayValues[index] ?? 0);

    return Number.isFinite(value) ? value : 0;
  });
}

function getSistemaIcon(key: ApiSistemaKey) {
  if (key === "mitienda") {
    return <StorefrontIcon />;
  }

  return <RestaurantMenuIcon />;
}

function getSistemaLabel(key: ApiSistemaKey, fallback: string) {
  if (key === "mitienda") return "Mi Tienda";
  if (key === "clicmenu") return "ClicMenu";

  return fallback;
}

function formatMoney(value: number) {
  return Number(value || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

function getUltimoValor(values: number[]) {
  return values[values.length - 1] ?? 0;
}

function getMaxValue(
  sistemasFiltrados: SistemaData[],
  field: "empresas" | "ingresos"
) {
  return Math.max(...sistemasFiltrados.flatMap((sistema) => sistema[field]), 1);
}

function getTotalPorMes(
  sistemasFiltrados: SistemaData[],
  index: number,
  field: "empresas" | "ingresos"
) {
  return sistemasFiltrados.reduce((total, sistema) => {
    return total + (sistema[field][index] ?? 0);
  }, 0);
}

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as any).response?.data?.message === "string"
  ) {
    return (error as any).response.data.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "No fue posible cargar las métricas generales.";
}

function normalizeSistemas(apiSystems: ApiSistemaData[]): SistemaData[] {
  return apiSystems
    .filter((sistema) => sistema.key === "mitienda" || sistema.key === "clicmenu")
    .map((sistema) => {
      const ingresos = normalizeMonthlyValues(sistema.monthly_income);
      const empresas = normalizeMonthlyValues(sistema.monthly_companies);

      return {
        key: sistema.key,
        label: getSistemaLabel(sistema.key, sistema.name),
        icon: getSistemaIcon(sistema.key),
        empresas,
        ingresos,
        totalIngresos: Number(sistema.total_income ?? 0),
        totalEmpresas: Number(sistema.total_companies ?? getUltimoValor(empresas)),
        activas: Number(sistema.active_subscriptions ?? 0),
        vencidas: Number(sistema.expired_subscriptions ?? 0),
      };
    });
}

export default function Metricas() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const currentYear = new Date().getFullYear();

  const [anio, setAnio] = useState(String(currentYear));
  const [sistemaFiltro, setSistemaFiltro] = useState<SistemaKey>("todos");
  const [sistemas, setSistemas] = useState<SistemaData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMetricas = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get<MetricasResponse>(
  "/superadmin/metricas-generales",
  {
    params: {
      year: Number(anio),
      refresh: 1,
      t: Date.now(),
    },
  }
);

      const payload = response.data;

      if (!payload?.ok) {
        throw new Error("La respuesta de métricas no fue válida.");
      }

      setSistemas(normalizeSistemas(payload.systems ?? []));
    } catch (err) {
      setSistemas([]);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetricas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anio]);

  const sistemasFiltrados = useMemo(() => {
    if (sistemaFiltro === "todos") return sistemas;

    return sistemas.filter((sistema) => sistema.key === sistemaFiltro);
  }, [sistemas, sistemaFiltro]);

  const totalEmpresas = useMemo(() => {
    return sistemasFiltrados.reduce(
      (total, sistema) => total + sistema.totalEmpresas,
      0
    );
  }, [sistemasFiltrados]);

  const totalActivas = useMemo(() => {
    return sistemasFiltrados.reduce(
      (total, sistema) => total + sistema.activas,
      0
    );
  }, [sistemasFiltrados]);

  const totalVencidas = useMemo(() => {
    return sistemasFiltrados.reduce(
      (total, sistema) => total + sistema.vencidas,
      0
    );
  }, [sistemasFiltrados]);

  const ingresosDelAnio = useMemo(() => {
    return sistemasFiltrados.reduce(
      (total, sistema) => total + sistema.totalIngresos,
      0
    );
  }, [sistemasFiltrados]);

  const crecimientoAnual = useMemo(() => {
    return sistemasFiltrados.reduce((total, sistema) => {
      const primero = sistema.empresas.find((value) => value > 0) ?? 0;
      const ultimo = sistema.totalEmpresas || getUltimoValor(sistema.empresas);

      return total + Math.max(ultimo - primero, 0);
    }, 0);
  }, [sistemasFiltrados]);

  const maxEmpresas = getMaxValue(sistemasFiltrados, "empresas");
  const maxIngresos = getMaxValue(sistemasFiltrados, "ingresos");

  const years = useMemo(() => {
    return [currentYear, currentYear - 1, currentYear - 2];
  }, [currentYear]);

  const cards = [
    {
      title: "Sistemas activos",
      value: sistemasFiltrados.length.toString(),
      icon: <AppsIcon />,
    },
    {
      title: "Total empresas",
      value: totalEmpresas.toString(),
      icon: <StorefrontIcon />,
    },
    {
      title: "Ingresos del año",
      value: formatMoney(ingresosDelAnio),
      icon: <ReceiptLongIcon />,
    },
    {
      title: "Crecimiento anual",
      value: `+${crecimientoAnual}`,
      icon: <TrendingUpIcon />,
    },
  ];

  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
        mb={4}
      >
        <Box>
          <Typography variant="h5" fontWeight={900}>
            Métricas generales
          </Typography>

          <Typography color="text.secondary" mt={1}>
            Comparación mensual real entre Mi Tienda y ClicMenu.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            select
            size="small"
            label="Año"
            value={anio}
            onChange={(event) => setAnio(event.target.value)}
            sx={{ minWidth: { xs: "100%", sm: 130 } }}
          >
            {years.map((year) => (
              <MenuItem key={year} value={String(year)}>
                {year}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Sistema"
            value={sistemaFiltro}
            onChange={(event) =>
              setSistemaFiltro(event.target.value as SistemaKey)
            }
            sx={{ minWidth: { xs: "100%", sm: 190 } }}
          >
            <MenuItem value="todos">Todos</MenuItem>
            <MenuItem value="mitienda">Mi Tienda</MenuItem>
            <MenuItem value="clicmenu">ClicMenu</MenuItem>
          </TextField>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchMetricas}
            disabled={loading}
            sx={{ minWidth: { xs: "100%", sm: 130 } }}
          >
            Actualizar
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && sistemas.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            p: 4,
            borderRadius: 4,
            bgcolor: "background.paper",
            borderColor: theme.palette.divider,
          }}
        >
          <Stack alignItems="center" spacing={2}>
            <CircularProgress />
            <Typography color="text.secondary">
              Cargando métricas reales...
            </Typography>
          </Stack>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {cards.map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.title}>
                <Card
                  sx={{
                    height: "100%",
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 4,
                    bgcolor: "background.paper",
                    color: "text.primary",
                    boxShadow: isDark
                      ? "0 12px 30px rgba(0,0,0,0.35)"
                      : "0 12px 30px rgba(0,0,0,0.08)",
                  }}
                >
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" mb={2}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={700}
                      >
                        {item.title}
                      </Typography>

                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          display: "grid",
                          placeItems: "center",
                          bgcolor: alpha(
                            theme.palette.primary.main,
                            isDark ? 0.18 : 0.1
                          ),
                          color: theme.palette.primary.main,
                        }}
                      >
                        {item.icon}
                      </Box>
                    </Stack>

                    <Typography variant="h4" fontWeight={900}>
                      {item.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3} mt={0}>
            <Grid item xs={12} lg={8}>
              <Paper
                variant="outlined"
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: 4,
                  bgcolor: "background.paper",
                  borderColor: theme.palette.divider,
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={1}
                  mb={3}
                >
                  <Box>
                    <Typography fontWeight={900} fontSize={18}>
                      Empresas por mes
                    </Typography>

                    <Typography color="text.secondary" fontSize={13}>
                      Comparación mensual de registros durante {anio}.
                    </Typography>
                  </Box>

                  <Chip
                    icon={<StorefrontIcon />}
                    label={`${totalEmpresas} empresas`}
                    size="small"
                    sx={{ fontWeight: 800 }}
                  />
                </Stack>

                {sistemasFiltrados.length === 0 ? (
                  <Alert severity="info">
                    No hay datos disponibles para los filtros seleccionados.
                  </Alert>
                ) : (
                  <Stack spacing={2.2}>
                    {meses.map((mes, index) => {
                      const totalMes = getTotalPorMes(
                        sistemasFiltrados,
                        index,
                        "empresas"
                      );

                      return (
                        <Box key={mes}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={0.7}
                          >
                            <Typography fontSize={13} fontWeight={800}>
                              {mes}
                            </Typography>

                            <Typography fontSize={13} color="text.secondary">
                              {totalMes} empresas
                            </Typography>
                          </Stack>

                          <Stack spacing={0.8}>
                            {sistemasFiltrados.map((sistema) => {
                              const value = sistema.empresas[index] ?? 0;
                              const percent = Math.min(
                                (value / maxEmpresas) * 100,
                                100
                              );

                              return (
                                <Box key={`${sistema.key}-${mes}`}>
                                  <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    mb={0.3}
                                  >
                                    <Typography
                                      fontSize={12}
                                      color="text.secondary"
                                    >
                                      {sistema.label}
                                    </Typography>

                                    <Typography fontSize={12} fontWeight={800}>
                                      {value}
                                    </Typography>
                                  </Stack>

                                  <LinearProgress
                                    variant="determinate"
                                    value={percent}
                                    sx={{
                                      height: 9,
                                      borderRadius: 99,
                                      bgcolor: alpha(
                                        theme.palette.primary.main,
                                        isDark ? 0.15 : 0.08
                                      ),
                                      "& .MuiLinearProgress-bar": {
                                        borderRadius: 99,
                                      },
                                    }}
                                  />
                                </Box>
                              );
                            })}
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Paper
                variant="outlined"
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: 4,
                  height: "100%",
                  bgcolor: "background.paper",
                  borderColor: theme.palette.divider,
                }}
              >
                <Typography fontWeight={900} fontSize={18}>
                  Estado de suscripciones
                </Typography>

                <Typography color="text.secondary" fontSize={13} mb={3}>
                  Activas y vencidas de los sistemas filtrados.
                </Typography>

                <Stack spacing={2}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: alpha(
                        theme.palette.success.main,
                        isDark ? 0.15 : 0.08
                      ),
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between">
                      <Box>
                        <Typography fontSize={13} color="text.secondary">
                          Activas
                        </Typography>

                        <Typography fontSize={32} fontWeight={900}>
                          {totalActivas}
                        </Typography>
                      </Box>

                      <CheckCircleIcon color="success" />
                    </Stack>
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: alpha(
                        theme.palette.error.main,
                        isDark ? 0.15 : 0.08
                      ),
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between">
                      <Box>
                        <Typography fontSize={13} color="text.secondary">
                          Vencidas
                        </Typography>

                        <Typography fontSize={32} fontWeight={900}>
                          {totalVencidas}
                        </Typography>
                      </Box>

                      <ErrorIcon color="error" />
                    </Stack>
                  </Box>

                  {sistemasFiltrados.map((sistema) => {
                    const total = sistema.activas + sistema.vencidas;
                    const percent = total > 0 ? (sistema.activas / total) * 100 : 0;

                    return (
                      <Box key={sistema.key}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          mb={0.8}
                        >
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 2,
                                display: "grid",
                                placeItems: "center",
                                bgcolor: alpha(
                                  theme.palette.primary.main,
                                  isDark ? 0.18 : 0.1
                                ),
                                color: "primary.main",
                              }}
                            >
                              {sistema.icon}
                            </Box>

                            <Box>
                              <Typography fontWeight={900}>
                                {sistema.label}
                              </Typography>

                              <Typography fontSize={11} color="text.secondary">
                                {sistema.activas} activas / {sistema.vencidas}{" "}
                                vencidas / {total} total
                              </Typography>
                            </Box>
                          </Stack>

                          <Typography fontWeight={900}>
                            {Math.round(percent)}%
                          </Typography>
                        </Stack>

                        <LinearProgress
                          variant="determinate"
                          value={percent}
                          sx={{
                            height: 10,
                            borderRadius: 99,
                            bgcolor: alpha(
                              theme.palette.success.main,
                              isDark ? 0.16 : 0.09
                            ),
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 99,
                              bgcolor: theme.palette.success.main,
                            },
                          }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: 4,
                  bgcolor: "background.paper",
                  borderColor: theme.palette.divider,
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={1}
                  mb={3}
                >
                  <Box>
                    <Typography fontWeight={900} fontSize={18}>
                      Tendencia de ingresos
                    </Typography>

                    <Typography color="text.secondary" fontSize={13}>
                      Ingresos mensuales reales por sistema.
                    </Typography>
                  </Box>

                  <Chip
                    icon={<ReceiptLongIcon />}
                    label={formatMoney(ingresosDelAnio)}
                    size="small"
                    sx={{ fontWeight: 800 }}
                  />
                </Stack>

                <Grid container spacing={2}>
                  {sistemasFiltrados.map((sistema) => (
                    <Grid item xs={12} md={6} key={sistema.key}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          border: `1px solid ${theme.palette.divider}`,
                          bgcolor: isDark
                            ? alpha(theme.palette.common.white, 0.03)
                            : alpha(theme.palette.common.black, 0.015),
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={2}
                        >
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: 2,
                                display: "grid",
                                placeItems: "center",
                                bgcolor: alpha(
                                  theme.palette.primary.main,
                                  isDark ? 0.18 : 0.1
                                ),
                                color: "primary.main",
                              }}
                            >
                              {sistema.icon}
                            </Box>

                            <Typography fontWeight={900}>
                              {sistema.label}
                            </Typography>
                          </Stack>

                          <Typography fontWeight={900}>
                            {formatMoney(sistema.totalIngresos)}
                          </Typography>
                        </Stack>

                        <Stack spacing={1.1}>
                          {meses.map((mes, index) => {
                            const value = sistema.ingresos[index] ?? 0;
                            const percent = Math.min(
                              (value / maxIngresos) * 100,
                              100
                            );

                            return (
                              <Stack
                                key={`${sistema.key}-ingreso-${mes}`}
                                direction="row"
                                alignItems="center"
                                spacing={1}
                              >
                                <Typography
                                  fontSize={12}
                                  color="text.secondary"
                                  sx={{ width: 32 }}
                                >
                                  {mes}
                                </Typography>

                                <Box sx={{ flex: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={percent}
                                    sx={{
                                      height: 8,
                                      borderRadius: 99,
                                      bgcolor: alpha(
                                        theme.palette.secondary.main,
                                        isDark ? 0.15 : 0.08
                                      ),
                                      "& .MuiLinearProgress-bar": {
                                        borderRadius: 99,
                                        bgcolor: theme.palette.secondary.main,
                                      },
                                    }}
                                  />
                                </Box>

                                <Typography
                                  fontSize={12}
                                  fontWeight={800}
                                  sx={{ width: 90, textAlign: "right" }}
                                >
                                  {formatMoney(value)}
                                </Typography>
                              </Stack>
                            );
                          })}
                        </Stack>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}