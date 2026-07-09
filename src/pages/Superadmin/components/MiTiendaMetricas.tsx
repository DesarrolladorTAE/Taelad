import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

type Props = {
  setView?: (view: string) => void;
};

type Snapshot = {
  id: number;
  system_key: string;
  system_name: string;
  year: number;
  month: number;
  period_key: string;
  status: string;
  synced_at?: string | null;
  kpis?: Record<string, any> | any[];
  specific_metrics?: Record<string, any> | any[];
  charts?: Record<string, any> | any[];
};

type DashboardResponse = {
  success: boolean;
  message?: string;
  data?: {
    consolidated: Snapshot | null;
    systems: {
      mitienda: Snapshot | null;
      clicmenu: Snapshot | null;
    };
    alerts: any[];
    sync_logs: any[];
  };
};

const API_BASE_URL = "https://api.tecnologiasadministrativas.com/api";

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

function getAuthToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("auth_token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("sanctum_token") ||
    ""
  ).replace(/^"|"$/g, "");
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

    if (typeof value === "number" && Number.isFinite(value)) return value;

    if (typeof value === "string") {
      const parsed = Number(value.replace(/[$,\s]/g, ""));
      if (Number.isFinite(parsed)) return parsed;
    }

    if (value === null || value === undefined || value === "") return 0;
  }

  return null;
}

function firstNumber(items: Array<{ source: any; keys: string[] }>, fallback = 0) {
  for (const item of items) {
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

function getMonthlySeries(charts: Record<string, any>, year: number) {
  const ingresosPorMes = asObject(charts?.ingresos_por_mes);
  const raw = Array.isArray(ingresosPorMes?.mitienda)
    ? ingresosPorMes.mitienda
    : [];

  const values = Array.from({ length: 12 }, () => 0);

  raw.forEach((item: any) => {
    const [itemYear, itemMonth] = String(item?.month || "")
      .split("-")
      .map(Number);

    if (itemYear !== year) return;
    if (!itemMonth || itemMonth < 1 || itemMonth > 12) return;

    values[itemMonth - 1] = Number(item?.value || 0);
  });

  return values;
}

export default function MiTiendaMetricas({ setView }: Props) {
  const theme = useTheme();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [consolidado, setConsolidado] = useState<Snapshot | null>(null);
  const [mitienda, setMitienda] = useState<Snapshot | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getAuthToken();

      const response = await fetch(
        `${API_BASE_URL}/superadmin/dashboard?year=${currentYear}&month=${currentMonth}&system=all`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const json: DashboardResponse = await response.json();

      if (!response.ok || !json?.success || !json?.data) {
        throw new Error(json?.message || "No fue posible cargar métricas de MiTienda.");
      }

      setConsolidado(json.data.consolidated || null);
      setMitienda(json.data.systems?.mitienda || null);
    } catch (err: any) {
      setError(err?.message || "No fue posible cargar métricas de MiTienda.");
      setConsolidado(null);
      setMitienda(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const kpis = asObject(mitienda?.kpis);
  const specific = asObject(mitienda?.specific_metrics);
  const consolidatedCharts = asObject(consolidado?.charts);

  const monthlySales = useMemo(
    () => getMonthlySeries(consolidatedCharts, currentYear),
    [consolidatedCharts, currentYear]
  );

  const ventasMes = monthlySales[currentMonth - 1] || 0;
  const ventasAnio = monthlySales.reduce((total, value) => total + Number(value || 0), 0);

  const planesActivos = firstNumber([
    { source: kpis, keys: ["planes_activos", "total_planes_activos"] },
  ]);

  const planesVencidos = firstNumber([
    { source: kpis, keys: ["planes_vencidos", "total_planes_vencidos"] },
  ]);

  const proximos7 = firstNumber([
    { source: kpis, keys: ["planes_proximos_vencer_7"] },
  ]);

  const renovacionesMes = firstNumber([
    { source: kpis, keys: ["renovaciones_mes"] },
  ]);

  const mrr = firstNumber([
    { source: specific, keys: ["mrr", "monthly_recurring_revenue"] },
  ]);

  const antiguedadPromedio = firstNumber([
    { source: specific, keys: ["antiguedad_promedio", "antiguedad_promedio_dias"] },
  ]);

  const maxVentas = Math.max(...monthlySales, 1);

  const cards = [
    {
      title: "Ventas del mes",
      value: formatMoney(ventasMes),
      icon: <ReceiptLongIcon />,
    },
    {
      title: "Ventas del año",
      value: formatMoney(ventasAnio),
      icon: <TrendingUpIcon />,
    },
    {
      title: "Planes activos",
      value: formatNumber(planesActivos),
      icon: <CheckCircleIcon />,
    },
    {
      title: "Planes vencidos",
      value: formatNumber(planesVencidos),
      icon: <ErrorIcon />,
    },
    {
      title: "Próximos 7 días",
      value: formatNumber(proximos7),
      icon: <WarningAmberIcon />,
    },
    {
      title: "Renovaciones del mes",
      value: formatNumber(renovacionesMes),
      icon: <RefreshIcon />,
    },
    {
      title: "MRR",
      value: formatMoney(mrr),
      icon: <ReceiptLongIcon />,
    },
    {
      title: "Antigüedad promedio",
      value: `${formatNumber(antiguedadPromedio)} días`,
      icon: <StorefrontIcon />,
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
        mb={4}
      >
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Métricas MiTienda
          </Typography>

          <Typography color="text.secondary" mt={0.5}>
            Indicadores propios de MiTiendaEnLineaMx. No muestra métricas generales.
          </Typography>

          <Typography variant="caption" color="text.secondary">
            Última sincronización: {mitienda?.synced_at || "Sin registro"}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => setView?.("mitienda-dashboard")}
          >
            Volver
          </Button>

          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
            onClick={fetchData}
            disabled={loading}
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

      {loading ? (
        <Paper
          variant="outlined"
          sx={{ p: 4, borderRadius: 4, bgcolor: "background.paper" }}
        >
          <Stack alignItems="center" spacing={2}>
            <CircularProgress />
            <Typography color="text.secondary">Cargando métricas de MiTienda...</Typography>
          </Stack>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {cards.map((card) => (
              <Grid item xs={12} sm={6} md={3} key={card.title}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 4,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: "background.paper",
                  }}
                >
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" mb={2}>
                      <Typography color="text.secondary" fontWeight={700}>
                        {card.title}
                      </Typography>

                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          display: "grid",
                          placeItems: "center",
                          bgcolor: "action.hover",
                          color: "primary.main",
                        }}
                      >
                        {card.icon}
                      </Box>
                    </Stack>

                    <Typography variant="h4" fontWeight={900}>
                      {card.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Paper
            variant="outlined"
            sx={{
              mt: 3,
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
                  Ventas por mes
                </Typography>

                <Typography color="text.secondary" fontSize={13}>
                  Histórico mensual de ventas de MiTienda durante {currentYear}.
                </Typography>
              </Box>

              <Chip
                label={formatMoney(ventasAnio)}
                size="small"
                sx={{ fontWeight: 800 }}
              />
            </Stack>

            <Stack spacing={2}>
              {meses.map((mes, index) => {
                const value = monthlySales[index] || 0;
                const percent = Math.min((value / maxVentas) * 100, 100);

                return (
                  <Box key={mes}>
                    <Stack direction="row" justifyContent="space-between" mb={0.6}>
                      <Typography fontSize={13} fontWeight={800}>
                        {mes}
                      </Typography>

                      <Typography fontSize={13} color="text.secondary">
                        {formatMoney(value)}
                      </Typography>
                    </Stack>

                    <LinearProgress
                      variant="determinate"
                      value={percent}
                      sx={{
                        height: 10,
                        borderRadius: 10,
                      }}
                    />
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        </>
      )}
    </Box>
  );
}