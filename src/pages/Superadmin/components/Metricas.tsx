import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

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

import AppsIcon from "@mui/icons-material/Apps";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import RefreshIcon from "@mui/icons-material/Refresh";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

type Props = {
  darkMode?: boolean;
};

type SystemKey = "todos" | "mitienda" | "clicmenu";
type ApiSystemKey = "mitienda" | "clicmenu";

type Snapshot = {
  id: number;
  system_key: "consolidado" | ApiSystemKey;
  system_name: string;
  year: number;
  month: number;
  period_key: string;
  status: string;
  synced_at?: string | null;
  kpis?: Record<string, any> | any[];
  specific_metrics?: Record<string, any> | any[];
  consolidated?: Record<string, any> | any[];
  charts?: Record<string, any> | any[];
};

type MetricasResponse = {
  success: boolean;
  message?: string;
  data?: {
    snapshots: Snapshot[];
    alerts?: any[];
    sync_logs?: any[];
  };
};

const API_BASE_URL = "https://api.tecnologiasadministrativas.com/api";

const MONTHS = [
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

function getAuthToken() {
  const directKeys = [
    "token",
    "auth_token",
    "access_token",
    "sanctum_token",
    "admin_token",
    "superadmin_token",
    "user_token",
  ];

  for (const key of directKeys) {
    const value = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (value) return value.replace(/^"|"$/g, "");
  }

  const objectKeys = ["auth", "user", "session", "admin"];

  for (const key of objectKeys) {
    const raw = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      const token =
        parsed?.token ||
        parsed?.access_token ||
        parsed?.auth_token ||
        parsed?.data?.token ||
        parsed?.data?.access_token;

      if (token) return String(token);
    } catch {
      //
    }
  }

  return "";
}

function asObject(value: any): Record<string, any> {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return {};
  }

  return value;
}

function readNumber(source: any, keys: string[]): number | null {
  const object = asObject(source);

  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(object, key)) continue;

    const value = object[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value.replace(/[$,\s]/g, ""));
      if (Number.isFinite(parsed)) return parsed;
    }

    if (value === null || value === undefined || value === "") {
      return 0;
    }
  }

  return null;
}

function firstNumber(
  sources: Array<{ source: any; keys: string[] }>,
  fallback = 0
) {
  for (const item of sources) {
    const value = readNumber(item.source, item.keys);
    if (value !== null) return value;
  }

  return fallback;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatSignedPercent(value: number) {
  const sign = value > 0 ? "+" : "";

  return `${sign}${new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)}%`;
}

function getSnapshot(
  snapshots: Snapshot[],
  key: "consolidado" | ApiSystemKey
): Snapshot | null {
  return snapshots.find((item) => item.system_key === key) || null;
}

function getMonthlySeries(
  charts: Record<string, any>,
  systemKey: ApiSystemKey,
  selectedYear: number,
  currentYear: number,
  currentMonth: number
) {
  const ingresosPorMes = asObject(charts?.ingresos_por_mes);

  const raw = Array.isArray(ingresosPorMes?.[systemKey])
    ? ingresosPorMes[systemKey]
    : [];

  const values = Array.from({ length: 12 }, () => 0);

  raw.forEach((item: any) => {
    const monthText = String(item?.month || "");
    const [year, month] = monthText.split("-").map(Number);

    if (year !== selectedYear) return;
    if (!month || month < 1 || month > 12) return;

    values[month - 1] = Number(item?.value || 0);
  });

  if (systemKey === "clicmenu" && values.every((value) => value <= 0)) {
    const ingresosPorSistema = Array.isArray(charts?.ingresos_por_sistema)
      ? charts.ingresos_por_sistema
      : [];

    const clicIncome = ingresosPorSistema.find((item: any) =>
      String(item?.name || item?.system_name || "")
        .toLowerCase()
        .includes("clic")
    );

    const fallbackValue = Number(clicIncome?.value || clicIncome?.amount || 0);

    if (fallbackValue > 0 && selectedYear === currentYear) {
      values[currentMonth - 1] = fallbackValue;
    }
  }

  return values;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function getSystemAccounts(
  systemKey: ApiSystemKey,
  snapshot: Snapshot | null,
  consolidatedSnapshot: Snapshot | null
) {
  const specific = asObject(snapshot?.specific_metrics);
  const consolidated = asObject(consolidatedSnapshot?.consolidated);

  if (systemKey === "mitienda") {
    return firstNumber([
      {
        source: specific,
        keys: [
          "cuentas_activas",
          "cuentas_registradas",
          "total_cuentas",
          "tiendas_activas",
          "tiendas_registradas",
        ],
      },
    ]);
  }

  return firstNumber([
    {
      source: specific,
      keys: ["cuentas_registradas", "total_cuentas", "owners_count"],
    },
    {
      source: consolidated,
      keys: ["total_cuentas"],
    },
  ]);
}

function getSystemPlanActive(snapshot: Snapshot | null) {
  const kpis = asObject(snapshot?.kpis);

  return firstNumber([
    {
      source: kpis,
      keys: ["planes_activos", "total_planes_activos", "active_subscriptions"],
    },
  ]);
}

function getSystemPlanExpired(snapshot: Snapshot | null) {
  const kpis = asObject(snapshot?.kpis);

  return firstNumber([
    {
      source: kpis,
      keys: ["planes_vencidos", "total_planes_vencidos", "expired_subscriptions"],
    },
  ]);
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: ReactNode;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 4,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: "background.paper",
        boxShadow: isDark
          ? "0 12px 30px rgba(0,0,0,0.35)"
          : "0 12px 30px rgba(0,0,0,0.08)",
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <Typography variant="body2" color="text.secondary" fontWeight={700}>
            {title}
          </Typography>

          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              bgcolor: alpha(theme.palette.primary.main, isDark ? 0.18 : 0.1),
              color: theme.palette.primary.main,
            }}
          >
            {icon}
          </Box>
        </Stack>

        <Typography variant="h4" fontWeight={900}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function Metricas({ darkMode = false }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark" || darkMode;

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [systemFilter, setSystemFilter] = useState<SystemKey>("todos");
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const year = Number(selectedYear);
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

  const consolidatedSnapshot = getSnapshot(snapshots, "consolidado");
  const mitiendaSnapshot = getSnapshot(snapshots, "mitienda");
  const clicmenuSnapshot = getSnapshot(snapshots, "clicmenu");

  const consolidatedKpis = asObject(consolidatedSnapshot?.kpis);
  const consolidatedData = asObject(consolidatedSnapshot?.consolidated);
  const consolidatedCharts = asObject(consolidatedSnapshot?.charts);

  const visibleSystems: ApiSystemKey[] =
    systemFilter === "todos" ? ["mitienda", "clicmenu"] : [systemFilter];

  const mitiendaSeries = getMonthlySeries(
    consolidatedCharts,
    "mitienda",
    year,
    currentYear,
    currentMonth
  );

  const clicmenuSeries = getMonthlySeries(
    consolidatedCharts,
    "clicmenu",
    year,
    currentYear,
    currentMonth
  );

  const relationSeries = MONTHS.map((month, index) => {
    const mitienda = visibleSystems.includes("mitienda")
      ? Number(mitiendaSeries[index] || 0)
      : 0;

    const clicmenu = visibleSystems.includes("clicmenu")
      ? Number(clicmenuSeries[index] || 0)
      : 0;

    return {
      month,
      mitienda,
      clicmenu,
      total: mitienda + clicmenu,
    };
  });

  const maxSeriesValue = Math.max(
    ...relationSeries.map((item) => item.total),
    1
  );

  const ingresosAnuales = visibleSystems.reduce((total, key) => {
    if (key === "mitienda") return total + sum(mitiendaSeries);
    return total + sum(clicmenuSeries);
  }, 0);

  const previousMitiendaSeries = getMonthlySeries(
    consolidatedCharts,
    "mitienda",
    year - 1,
    currentYear,
    currentMonth
  );

  const previousClicMenuSeries = getMonthlySeries(
    consolidatedCharts,
    "clicmenu",
    year - 1,
    currentYear,
    currentMonth
  );

  const ingresosAnualesPrevios = visibleSystems.reduce((total, key) => {
    if (key === "mitienda") return total + sum(previousMitiendaSeries);
    return total + sum(previousClicMenuSeries);
  }, 0);

  const crecimientoAnual =
    ingresosAnualesPrevios > 0
      ? ((ingresosAnuales - ingresosAnualesPrevios) / ingresosAnualesPrevios) *
        100
      : 0;

  const sistemasActivos = visibleSystems.filter((key) => {
    const snapshot = key === "mitienda" ? mitiendaSnapshot : clicmenuSnapshot;
    return snapshot?.status === "ok";
  }).length;

  const totalEmpresas =
    systemFilter === "todos"
      ? firstNumber([{ source: consolidatedData, keys: ["total_cuentas"] }])
      : getSystemAccounts(
          systemFilter,
          systemFilter === "mitienda" ? mitiendaSnapshot : clicmenuSnapshot,
          consolidatedSnapshot
        );

  const planesActivos =
    systemFilter === "todos"
      ? firstNumber([
          { source: consolidatedData, keys: ["total_planes_activos"] },
          { source: consolidatedKpis, keys: ["planes_activos"] },
        ])
      : getSystemPlanActive(
          systemFilter === "mitienda" ? mitiendaSnapshot : clicmenuSnapshot
        );

  const planesVencidos =
    systemFilter === "todos"
      ? firstNumber([
          { source: consolidatedData, keys: ["total_planes_vencidos"] },
          { source: consolidatedKpis, keys: ["planes_vencidos"] },
        ])
      : getSystemPlanExpired(
          systemFilter === "mitienda" ? mitiendaSnapshot : clicmenuSnapshot
        );

  const fetchMetricas = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getAuthToken();

      const response = await fetch(
        `${API_BASE_URL}/superadmin/metricas-generales?year=${currentYear}&month=${currentMonth}&system=all`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const json: MetricasResponse = await response.json();

      if (!response.ok || !json?.success || !json?.data?.snapshots) {
        throw new Error(json?.message || "La respuesta de métricas no fue válida.");
      }

      setSnapshots(json.data.snapshots);
    } catch (err: any) {
      setSnapshots([]);
      setError(err?.message || "No fue posible cargar las métricas generales.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetricas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cards = useMemo(
    () => [
      {
        title: "Sistemas activos",
        value: formatNumber(sistemasActivos),
        icon: <AppsIcon />,
      },
      {
        title: "Total empresas",
        value: formatNumber(totalEmpresas),
        icon: <StorefrontIcon />,
      },
      {
        title: "Ingresos del año",
        value: formatMoney(ingresosAnuales),
        icon: <ReceiptLongIcon />,
      },
      {
        title: "Crecimiento anual",
        value: formatSignedPercent(crecimientoAnual),
        icon: <TrendingUpIcon />,
      },
    ],
    [sistemasActivos, totalEmpresas, ingresosAnuales, crecimientoAnual]
  );

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
          <Typography variant="h4" fontWeight={900}>
            Métricas generales
          </Typography>

          <Typography color="text.secondary" mt={1}>
            Comparación mensual real entre MiTiendaEnLineaMx y Clic Menú.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            select
            size="small"
            label="Año"
            value={selectedYear}
            onChange={(event) => setSelectedYear(event.target.value)}
            sx={{ minWidth: { xs: "100%", sm: 130 } }}
          >
            {yearOptions.map((item) => (
              <MenuItem key={item} value={String(item)}>
                {item}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Sistema"
            value={systemFilter}
            onChange={(event) =>
              setSystemFilter(event.target.value as SystemKey)
            }
            sx={{ minWidth: { xs: "100%", sm: 190 } }}
          >
            <MenuItem value="todos">Todos</MenuItem>
            <MenuItem value="mitienda">MiTiendaEnLineaMx</MenuItem>
            <MenuItem value="clicmenu">Clic Menú</MenuItem>
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

      {loading && snapshots.length === 0 ? (
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
              Cargando métricas generales...
            </Typography>
          </Stack>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {cards.map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.title}>
                <StatCard
                  title={item.title}
                  value={item.value}
                  icon={item.icon}
                />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3} sx={{ mt: 0.5 }}>
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
                      Relación de ventas por mes
                    </Typography>

                    <Typography color="text.secondary" fontSize={13}>
                      Comparación mensual durante {year}.
                    </Typography>
                  </Box>

                  <Chip
                    icon={<InfoOutlinedIcon />}
                    label={`${formatNumber(totalEmpresas)} empresas`}
                    size="small"
                    sx={{ fontWeight: 800 }}
                  />
                </Stack>

                {relationSeries.every((item) => item.total <= 0) ? (
                  <Alert severity="info">
                    No hay datos disponibles para los filtros seleccionados.
                  </Alert>
                ) : (
                  <Stack spacing={2}>
                    {relationSeries.map((item) => (
                      <Box key={item.month}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={0.7}
                        >
                          <Typography fontSize={13} fontWeight={800}>
                            {item.month}
                          </Typography>

                          <Typography fontSize={13} color="text.secondary">
                            {formatMoney(item.total)}
                          </Typography>
                        </Stack>

                        <LinearProgress
                          variant="determinate"
                          value={Math.min(
                            (item.total / maxSeriesValue) * 100,
                            100
                          )}
                          sx={{
                            height: 10,
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

                        <Stack direction="row" spacing={2} mt={0.6} flexWrap="wrap">
                          {visibleSystems.includes("mitienda") && (
                            <Typography fontSize={12} color="text.secondary">
                              MiTienda: {formatMoney(item.mitienda)}
                            </Typography>
                          )}

                          {visibleSystems.includes("clicmenu") && (
                            <Typography fontSize={12} color="text.secondary">
                              Clic Menú: {formatMoney(item.clicmenu)}
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    ))}
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
                          {formatNumber(planesActivos)}
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
                          {formatNumber(planesVencidos)}
                        </Typography>
                      </Box>

                      <ErrorIcon color="error" />
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}