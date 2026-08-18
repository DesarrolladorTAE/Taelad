import { useCallback, useEffect, useMemo, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";

import { useNavigate } from "react-router-dom";

import {
  Alert,
  alpha,
  Avatar,
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
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import StorefrontIcon from "@mui/icons-material/Storefront";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import RefreshIcon from "@mui/icons-material/Refresh";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import InsightsIcon from "@mui/icons-material/Insights";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";

type Props = {
  darkMode?: boolean;
  setView?: (view: string) => void;
};

type TaecontaCuentaVigenciaFilter =
  | "todas"
  | "vigentes"
  | "proximas7"
  | "proximas30"
  | "vencidas";

type MiTiendaFiltro =
  | "todas"
  | "activas"
  | "vencidas"
  | "demo_activo"
  | "demo_vencido"
  | "plan_activo"
  | "plan_vencido";

type ClicMenuFiltro =
  | "todas"
  | "activas"
  | "vencidas";

type SystemKey = "todos" | "mitienda" | "clicmenu" | "taeconta";
type ApiSystemKey = "mitienda" | "clicmenu" | "taeconta";

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

type FilterOption = {
  value: string | number;
  label: string;
  short_label?: string;
  period_key?: string;
};

type MetricsFilters = {
  year: number;
  month: number | "all";
  system: string;
  period_key: string;
  last_available_month: number;
  available_years: FilterOption[];
  available_months: FilterOption[];
  available_systems?: FilterOption[];
};

type MetricsPeriod = {
  mode: "month" | "range";
  year: number;
  month: number | null;
  start_month: number;
  end_month: number;
  period_key: string;
  label: string;
  short_label: string;
};

type AutoSyncInfo = {
  enabled: boolean;
  system: string;
  interval_minutes: number;
  attempted: boolean;
  refreshed: boolean;
  reason?: string | null;
  snapshot_id?: number | null;
  synced_at?: string | null;
  message?: string | null;
};

type MetricasResponse = {
  success: boolean;
  message?: string;
  auto_sync?: AutoSyncInfo;
  filters?: MetricsFilters;
  period?: MetricsPeriod;
  data?: {
    snapshots: Snapshot[];
    snapshots_by_month?: Array<{
      year: number;
      month: number;
      period_key: string;
      label: string;
      short_label: string;
      snapshots: Snapshot[];
    }>;
    alerts?: any[];
    sync_logs?: any[];
  };
};

type StatCardProps = {
  title: string;
  value: string;
  helper: string;
  icon: ReactNode;
  tone: "primary" | "success" | "warning" | "info";
};

const API_BASE_URL = "https://api.tecnologiasadministrativas.com/api";


const SYSTEM_LABELS: Record<ApiSystemKey, string> = {
  mitienda: "MiTiendaEnLineaMx",
  clicmenu: "Clic Menú",
  taeconta: "TAECONTA",
};

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

    if (value) {
      return value.replace(/^"|"$/g, "");
    }
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

      if (token) {
        return String(token);
      }
    } catch {
      // El valor no contiene JSON válido.
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

      if (Number.isFinite(parsed)) {
        return parsed;
      }
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

    if (value !== null) {
      return value;
    }
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

function formatCompactMoney(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    notation: "compact",
    maximumFractionDigits: 1,
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

function formatSyncDate(value?: string | null) {
  if (!value) {
    return "Sin sincronización";
  }

  const date = new Date(value.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function getSnapshot(
  snapshots: Snapshot[],
  key: "consolidado" | ApiSystemKey
): Snapshot | null {
  return (
    snapshots
      .filter((item) => item.system_key === key)
      .sort((a, b) => Number(b.month) - Number(a.month))[0] || null
  );
}

function getMonthlySeries(
  charts: Record<string, any>,
  systemKey: ApiSystemKey,
  selectedYear: number,
  fallbackMonth: number
) {
  const ingresosPorMes = asObject(charts?.ingresos_por_mes);

  const raw = Array.isArray(ingresosPorMes?.[systemKey])
    ? ingresosPorMes[systemKey]
    : [];

  const values = Array.from({ length: 12 }, () => 0);

  raw.forEach((item: any) => {
    const monthText = String(item?.month || "");
    const [itemYear, itemMonth] = monthText.split("-").map(Number);

    if (itemYear !== selectedYear) return;
    if (!itemMonth || itemMonth < 1 || itemMonth > 12) return;

    values[itemMonth - 1] = Number(item?.value || item?.amount || 0);
  });

  if (values.every((value) => value <= 0)) {
    const ingresosPorSistema = Array.isArray(charts?.ingresos_por_sistema)
      ? charts.ingresos_por_sistema
      : [];

    const match = ingresosPorSistema.find((item: any) => {
      const candidate = String(
        item?.system_key || item?.name || item?.system_name || ""
      ).toLowerCase();

      if (systemKey === "mitienda") {
        return (
          candidate.includes("mitienda") ||
          candidate.includes("mi tienda") ||
          candidate.includes("tiendaenlinea")
        );
      }

      if (systemKey === "clicmenu") {
        return candidate.includes("clic");
      }

      return candidate.includes("taeconta") || candidate.includes("tae conta");
    });

    const fallbackValue = Number(match?.value || match?.amount || 0);

    if (fallbackValue > 0 && fallbackMonth >= 1 && fallbackMonth <= 12) {
      values[fallbackMonth - 1] = fallbackValue;
    }
  }

  return values;
}

function getMonthlySeriesFromSnapshots(
  snapshots: Snapshot[],
  systemKey: ApiSystemKey,
  selectedYear: number
) {
  const values = Array.from({ length: 12 }, () => 0);
  const consolidatedSnapshots = snapshots
    .filter(
      (snapshot) =>
        snapshot.system_key === "consolidado" &&
        Number(snapshot.year) === selectedYear
    )
    .sort((a, b) => Number(a.month) - Number(b.month));

  consolidatedSnapshots.forEach((snapshot) => {
    const snapshotSeries = getMonthlySeries(
      asObject(snapshot.charts),
      systemKey,
      selectedYear,
      Number(snapshot.month)
    );

    snapshotSeries.forEach((value, index) => {
      if (Number(value) > 0) {
        values[index] = Number(value);
      }
    });

    const month = Number(snapshot.month);
    const systemSnapshot = snapshots.find(
      (item) =>
        item.system_key === systemKey &&
        Number(item.year) === selectedYear &&
        Number(item.month) === month
    );

    if (month >= 1 && month <= 12 && values[month - 1] <= 0) {
      values[month - 1] = firstNumber([
        {
          source: asObject(systemSnapshot?.kpis),
          keys: ["ingresos_periodo_actual", "ingresos_mes", "ventas_mes"],
        },
      ]);
    }
  });

  return values;
}

function getSystemPeriodIncome(
  snapshot: Snapshot | null,
  series: number[],
  months: number[]
) {
  const chartTotal = sum(
    months.map((month) => Number(series[month - 1] || 0))
  );

  if (chartTotal > 0) {
    return chartTotal;
  }

  if (months.length === 1) {
    return firstNumber([
      {
        source: asObject(snapshot?.kpis),
        keys: ["ingresos_periodo_actual", "ingresos_mes", "ventas_mes"],
      },
    ]);
  }

  return firstNumber([
    {
      source: asObject(snapshot?.kpis),
      keys: ["total_ingresos_planes", "total_ingresos", "ingreso_total"],
    },
  ]);
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
          "tiendas_registradas",
          "cuentas_registradas",
          "total_cuentas",
          "cuentas_activas",
          "tiendas_activas",
        ],
      },
      {
        source: consolidated,
        keys: ["total_tiendas_mitienda"],
      },
    ]);
  }

  if (systemKey === "clicmenu") {
    return firstNumber([
      {
        source: specific,
        keys: ["cuentas_registradas", "total_cuentas", "owners_count"],
      },
      {
        source: consolidated,
        keys: ["total_cuentas_clicmenu"],
      },
    ]);
  }

  const empresas = asObject(specific?.empresas);

  return firstNumber([
    {
      source: empresas,
      keys: ["total"],
    },
    {
      source: asObject(snapshot?.kpis),
      keys: ["empresas_total"],
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

function getSystemAnnualIncome(
  snapshot: Snapshot | null,
  series: number[]
) {
  const kpiTotal = firstNumber([
    {
      source: asObject(snapshot?.kpis),
      keys: ["total_ingresos_planes", "total_ingresos", "ingreso_total"],
    },
  ]);

  return kpiTotal > 0 ? kpiTotal : sum(series);
}

function StatCard({
  title,
  value,
  helper,
  icon,
  tone,
}: StatCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const palette = {
    primary: theme.palette.primary,
    success: theme.palette.success,
    warning: theme.palette.warning,
    info: theme.palette.info,
  }[tone];

  return (
    <Card
      sx={{
        position: "relative",
        height: "100%",
        overflow: "hidden",
        borderRadius: 4,
        border: `1px solid ${alpha(palette.main, isDark ? 0.24 : 0.16)}`,
        bgcolor: "background.paper",
        boxShadow: isDark
          ? "0 18px 42px rgba(0,0,0,0.26)"
          : "0 18px 42px rgba(15,23,42,0.08)",
        transition: "transform .2s ease, box-shadow .2s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: isDark
            ? "0 22px 50px rgba(0,0,0,0.34)"
            : "0 22px 50px rgba(15,23,42,0.12)",
        },
        "&::before": {
          content: '""',
          position: "absolute",
          inset: "0 auto 0 0",
          width: 5,
          bgcolor: palette.main,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          width: 120,
          height: 120,
          right: -42,
          top: -48,
          borderRadius: "50%",
          bgcolor: alpha(palette.main, isDark ? 0.12 : 0.08),
        },
      }}
    >
      <CardContent sx={{ position: "relative", zIndex: 1, p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={800}
              mb={1.2}
            >
              {title}
            </Typography>

            <Typography
              variant="h4"
              fontWeight={950}
              lineHeight={1.05}
              sx={{ fontSize: { xs: 28, sm: 34 } }}
            >
              {value}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mt={1.2}
            >
              {helper}
            </Typography>
          </Box>

          <Avatar
            sx={{
              width: 46,
              height: 46,
              bgcolor: alpha(palette.main, isDark ? 0.18 : 0.12),
              color: palette.main,
            }}
          >
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}

function SystemSummary({
  title,
  icon,
  income,
  currentIncome,
  periodIncomeLabel,
  accounts,
  activePlans,
  expiredPlans,
  accent,
  onAccountsClick,
  onActiveClick,
  onExpiredClick,
  breakdown = [],
}: {
  title: string;
  icon: ReactNode;
  income: number;
  currentIncome: number;
  periodIncomeLabel: string;
  accounts: number;
  activePlans: number;
  expiredPlans: number;
  accent: string;
  onAccountsClick?: () => void;
  onActiveClick?: () => void;
  onExpiredClick?: () => void;
  breakdown?: Array<{
    label: string;
    value: number;
    color: "success" | "error";
    onClick?: () => void;
  }>;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const metricBoxSx = (
    color: string,
    enabled: boolean,
  ) => ({
    p: { xs: 1.1, sm: 1.25 },
    height: "100%",
    minHeight: 72,
    borderRadius: 2.5,
    border: `1px solid ${alpha(color, isDark ? 0.5 : 0.34)}`,
    bgcolor: alpha(color, isDark ? 0.1 : 0.045),
    cursor: enabled ? "pointer" : "default",
    transition:
      "background-color .18s ease, transform .18s ease, border-color .18s ease, box-shadow .18s ease",
    "&:hover": enabled
      ? {
          bgcolor: alpha(color, isDark ? 0.16 : 0.075),
          borderColor: alpha(color, isDark ? 0.72 : 0.5),
          transform: "translateY(-1px)",
          boxShadow: `0 8px 20px ${alpha(color, isDark ? 0.12 : 0.08)}`,
        }
      : undefined,
    "&:focus-visible": enabled
      ? {
          outline: `2px solid ${alpha(color, 0.7)}`,
          outlineOffset: 2,
        }
      : undefined,
  });

  const activateWithKeyboard = (
    event: KeyboardEvent<HTMLDivElement>,
    callback?: () => void
  ) => {
    if (!callback) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      callback();
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        height: "100%",
        borderRadius: 4,
        border: `1.5px solid ${alpha(accent, isDark ? 0.48 : 0.32)}`,
        background: `linear-gradient(145deg, ${alpha(
          accent,
          isDark ? 0.12 : 0.06
        )}, ${theme.palette.background.paper} 42%)`,
        boxShadow: isDark
          ? `0 14px 30px ${alpha(accent, 0.08)}`
          : `0 14px 30px ${alpha(accent, 0.06)}`,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
        <Avatar sx={{ bgcolor: alpha(accent, 0.14), color: accent }}>
          {icon}
        </Avatar>

        <Box>
          <Typography fontWeight={900}>{title}</Typography>
          <Typography variant="caption" color="text.secondary">
            Resumen del sistema
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={1.5}>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">
            Ingreso anual
          </Typography>
          <Typography fontWeight={900}>{formatMoney(income)}</Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">
            {periodIncomeLabel}
          </Typography>
          <Typography fontWeight={900}>{formatMoney(currentIncome)}</Typography>
        </Grid>

        <Grid item xs={4}>
          <Box
            role={onAccountsClick ? "button" : undefined}
            tabIndex={onAccountsClick ? 0 : undefined}
            onClick={onAccountsClick}
            onKeyDown={(event) =>
              activateWithKeyboard(event, onAccountsClick)
            }
            sx={metricBoxSx(accent, Boolean(onAccountsClick))}
          >
            <Typography variant="caption" color="text.secondary">
              Cuentas
            </Typography>
            <Typography variant="h6" fontWeight={900}>
              {formatNumber(accounts)}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={4}>
          <Box
            role={onActiveClick ? "button" : undefined}
            tabIndex={onActiveClick ? 0 : undefined}
            onClick={onActiveClick}
            onKeyDown={(event) =>
              activateWithKeyboard(event, onActiveClick)
            }
            sx={metricBoxSx(theme.palette.success.main, Boolean(onActiveClick))}
          >
            <Typography variant="caption" color="text.secondary">
              Activos
            </Typography>
            <Typography variant="h6" fontWeight={900} color="success.main">
              {formatNumber(activePlans)}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={4}>
          <Box
            role={onExpiredClick ? "button" : undefined}
            tabIndex={onExpiredClick ? 0 : undefined}
            onClick={onExpiredClick}
            onKeyDown={(event) =>
              activateWithKeyboard(event, onExpiredClick)
            }
            sx={metricBoxSx(theme.palette.error.main, Boolean(onExpiredClick))}
          >
            <Typography variant="caption" color="text.secondary">
              Vencidos
            </Typography>
            <Typography variant="h6" fontWeight={900} color="error.main">
              {formatNumber(expiredPlans)}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {breakdown.length > 0 && (
        <>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            mt={2.5}
            mb={1.25}
          >
            Desglose por tipo. Selecciona una categoría para abrir las tiendas.
          </Typography>

          <Grid container spacing={1.25}>
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  p: 1.25,
                  height: "100%",
                  borderRadius: 2.5,
                  border: `1px solid ${alpha(
                    theme.palette.primary.main,
                    theme.palette.mode === "dark" ? 0.28 : 0.18
                  )}`,
                  bgcolor: alpha(
                    theme.palette.primary.main,
                    theme.palette.mode === "dark" ? 0.07 : 0.035
                  ),
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={900}
                  display="block"
                  mb={1}
                >
                  Planes
                </Typography>

                <Stack spacing={1}>
                  {breakdown
                    .filter((item) =>
                      item.label.toLowerCase().includes("plan")
                    )
                    .map((item) => (
                      <Chip
                        key={item.label}
                        label={`${item.label}: ${formatNumber(item.value)}`}
                        color={item.color}
                        variant="outlined"
                        size="small"
                        onClick={item.onClick}
                        sx={{
                          width: "100%",
                          height: "auto",
                          justifyContent: "flex-start",
                          fontWeight: 850,
                          cursor: item.onClick ? "pointer" : "default",
                          "& .MuiChip-label": {
                            width: "100%",
                            py: 0.55,
                            whiteSpace: "normal",
                            textAlign: "left",
                          },
                        }}
                      />
                    ))}
                </Stack>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  p: 1.25,
                  height: "100%",
                  borderRadius: 2.5,
                  border: `1px solid ${alpha(
                    theme.palette.warning.main,
                    theme.palette.mode === "dark" ? 0.28 : 0.18
                  )}`,
                  bgcolor: alpha(
                    theme.palette.warning.main,
                    theme.palette.mode === "dark" ? 0.07 : 0.035
                  ),
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={900}
                  display="block"
                  mb={1}
                >
                  Demos
                </Typography>

                <Stack spacing={1}>
                  {breakdown
                    .filter((item) =>
                      item.label.toLowerCase().includes("demo")
                    )
                    .map((item) => (
                      <Chip
                        key={item.label}
                        label={`${item.label}: ${formatNumber(item.value)}`}
                        color={item.color}
                        variant="outlined"
                        size="small"
                        onClick={item.onClick}
                        sx={{
                          width: "100%",
                          height: "auto",
                          justifyContent: "flex-start",
                          fontWeight: 850,
                          cursor: item.onClick ? "pointer" : "default",
                          "& .MuiChip-label": {
                            width: "100%",
                            py: 0.55,
                            whiteSpace: "normal",
                            textAlign: "left",
                          },
                        }}
                      />
                    ))}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </>
      )}
    </Paper>
  );
}

function TaecontaSummary({
  income,
  currentIncome,
  periodIncomeLabel,
  empresas,
  vigentes,
  vencidas,
  proximas30,
  operaciones,
  ticketPromedio,
  cfdiTimbrados,
  cfdiCancelados,
  timbresPac,
  timbresAsignados,
  timbresDisponibles,
  accent,
  onTodasClick,
  onVigentesClick,
  onVencidasClick,
  onProximas30Click,
}: {
  income: number;
  currentIncome: number;
  periodIncomeLabel: string;
  empresas: number;
  vigentes: number;
  vencidas: number;
  proximas30: number;
  operaciones: number;
  ticketPromedio: number;
  cfdiTimbrados: number;
  cfdiCancelados: number;
  timbresPac: number;
  timbresAsignados: number;
  timbresDisponibles: number;
  accent: string;
  onTodasClick?: () => void;
  onVigentesClick?: () => void;
  onVencidasClick?: () => void;
  onProximas30Click?: () => void;
}) {
  const theme = useTheme();

  const isDark =
    theme.palette.mode === "dark";

  const clickableSx = (
    callback?: () => void,
    color: string = accent,
  ) => ({
    minWidth: 0,
    p: { xs: 1, sm: 1.15 },
    height: "100%",
    minHeight: 72,
    borderRadius: 2.5,
    border: `1px solid ${alpha(color, isDark ? 0.5 : 0.34)}`,
    bgcolor: alpha(color, isDark ? 0.1 : 0.045),
    cursor: callback ? "pointer" : "default",
    transition:
      "background-color .18s ease, transform .18s ease, border-color .18s ease, box-shadow .18s ease",
    "&:hover": callback
      ? {
          bgcolor: alpha(color, isDark ? 0.16 : 0.075),
          borderColor: alpha(color, isDark ? 0.72 : 0.5),
          transform: "translateY(-1px)",
          boxShadow: `0 8px 20px ${alpha(color, isDark ? 0.12 : 0.08)}`,
        }
      : undefined,
    "&:focus-visible": callback
      ? {
          outline: `2px solid ${alpha(color, 0.7)}`,
          outlineOffset: 2,
        }
      : undefined,
  });

  const activateWithKeyboard = (
    event: KeyboardEvent<HTMLDivElement>,
    callback?: () => void,
  ) => {
    if (!callback) {
      return;
    }

    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();

      callback();
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,

        height: "100%",

        minWidth: 0,

        overflow: "hidden",

        borderRadius: 4,

        border: `1.5px solid ${alpha(
          accent,
          isDark ? 0.48 : 0.32,
        )}`,

        boxShadow: isDark
          ? `0 14px 30px ${alpha(accent, 0.08)}`
          : `0 14px 30px ${alpha(accent, 0.06)}`,

        background: `linear-gradient(
          145deg,
          ${alpha(
            accent,
            isDark
              ? 0.12
              : 0.06,
          )},
          ${theme.palette.background.paper} 42%
        )`,
      }}
    >
      {/* HEADER */}

      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        mb={2.5}
        sx={{
          minWidth: 0,
        }}
      >
        <Avatar
          sx={{
            flexShrink: 0,

            bgcolor: alpha(
              accent,
              0.14,
            ),

            color: accent,
          }}
        >
          <BusinessCenterIcon />
        </Avatar>

        <Box
          sx={{
            minWidth: 0,
          }}
        >
          <Typography
            fontWeight={900}
          >
            TAECONTA
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",

              lineHeight: 1.45,

              overflowWrap:
                "anywhere",
            }}
          >
            Resumen financiero, cuentas,
            CFDI y timbres
          </Typography>
        </Box>
      </Stack>

      <Grid
        container
        spacing={1.5}
        sx={{
          minWidth: 0,
        }}
      >
        {/* INGRESOS */}

        <Grid
          item
          xs={6}
          sx={{
            minWidth: 0,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
          >
            Ingreso anual
          </Typography>

          <Typography
            fontWeight={900}
            sx={{
              fontSize: {
                xs: 15,
                sm: 16,
              },

              whiteSpace:
                "nowrap",
            }}
          >
            {formatMoney(income)}
          </Typography>
        </Grid>

        <Grid
          item
          xs={6}
          sx={{
            minWidth: 0,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
          >
            {periodIncomeLabel}
          </Typography>

          <Typography
            fontWeight={900}
            sx={{
              fontSize: {
                xs: 15,
                sm: 16,
              },

              whiteSpace:
                "nowrap",
            }}
          >
            {formatMoney(
              currentIncome,
            )}
          </Typography>
        </Grid>

        {/* CUENTAS */}

        <Grid
          item
          xs={4}
          sx={{
            minWidth: 0,
          }}
        >
          <Box
            role={
              onTodasClick
                ? "button"
                : undefined
            }
            tabIndex={
              onTodasClick
                ? 0
                : undefined
            }
            onClick={
              onTodasClick
            }
            onKeyDown={(
              event,
            ) =>
              activateWithKeyboard(
                event,
                onTodasClick,
              )
            }
            sx={clickableSx(
              onTodasClick,
              accent,
            )}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Cuentas
            </Typography>

            <Typography
              variant="h6"
              fontWeight={900}
            >
              {formatNumber(
                empresas,
              )}
            </Typography>
          </Box>
        </Grid>

        <Grid
          item
          xs={4}
          sx={{
            minWidth: 0,
          }}
        >
          <Box
            role={
              onVigentesClick
                ? "button"
                : undefined
            }
            tabIndex={
              onVigentesClick
                ? 0
                : undefined
            }
            onClick={
              onVigentesClick
            }
            onKeyDown={(
              event,
            ) =>
              activateWithKeyboard(
                event,
                onVigentesClick,
              )
            }
            sx={clickableSx(
              onVigentesClick,
              theme.palette.success.main,
            )}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Vigentes
            </Typography>

            <Typography
              variant="h6"
              fontWeight={900}
              color="success.main"
            >
              {formatNumber(
                vigentes,
              )}
            </Typography>
          </Box>
        </Grid>

        <Grid
          item
          xs={4}
          sx={{
            minWidth: 0,
          }}
        >
          <Box
            role={
              onVencidasClick
                ? "button"
                : undefined
            }
            tabIndex={
              onVencidasClick
                ? 0
                : undefined
            }
            onClick={
              onVencidasClick
            }
            onKeyDown={(
              event,
            ) =>
              activateWithKeyboard(
                event,
                onVencidasClick,
              )
            }
            sx={clickableSx(
              onVencidasClick,
              theme.palette.error.main,
            )}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Vencidas
            </Typography>

            <Typography
              variant="h6"
              fontWeight={900}
              color="error.main"
            >
              {formatNumber(
                vencidas,
              )}
            </Typography>
          </Box>
        </Grid>

        {/* PRÓXIMAS + OPERACIONES */}

        <Grid
          item
          xs={6}
          sx={{
            minWidth: 0,
          }}
        >
          <Box
            role={
              onProximas30Click
                ? "button"
                : undefined
            }
            tabIndex={
              onProximas30Click
                ? 0
                : undefined
            }
            onClick={
              onProximas30Click
            }
            onKeyDown={(
              event,
            ) =>
              activateWithKeyboard(
                event,
                onProximas30Click,
              )
            }
            sx={clickableSx(
              onProximas30Click,
              theme.palette.warning.main,
            )}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{
                whiteSpace:
                  "normal",

                lineHeight:
                  1.35,
              }}
            >
              Próx. 30 días
            </Typography>

            <Typography
              variant="h6"
              fontWeight={900}
              color="warning.main"
            >
              {formatNumber(
                proximas30,
              )}
            </Typography>
          </Box>
        </Grid>

        <Grid
          item
          xs={6}
          sx={{
            minWidth: 0,
          }}
        >
          <Box sx={clickableSx(undefined, accent)}>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Operaciones
            </Typography>

            <Typography
              variant="h6"
              fontWeight={900}
            >
              {formatNumber(
                operaciones,
              )}
            </Typography>
          </Box>
        </Grid>

        {/* TICKET */}

        <Grid
          item
          xs={12}
          sx={{
            minWidth: 0,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
          >
            Ticket promedio
          </Typography>

          <Typography
            fontWeight={900}
          >
            {formatMoney(
              ticketPromedio,
            )}
          </Typography>
        </Grid>

        {/* CFDI */}

        <Grid
          item
          xs={12}
        >
          <Box
            sx={{
              p: 1.5,

              borderRadius: 2.5,

              minWidth: 0,

              border:
                "1px solid",

              borderColor: alpha(
                theme.palette.info.main,
                0.2,
              ),

              bgcolor: alpha(
                theme.palette.info.main,
                isDark
                  ? 0.09
                  : 0.04,
              ),
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={900}
              display="block"
              mb={0.75}
            >
              CFDI
            </Typography>

            <Stack
              direction="row"
              justifyContent="space-between"
              spacing={1}
            >
              <Typography
                variant="body2"
              >
                Timbrados
              </Typography>

              <Typography
                variant="body2"
                fontWeight={900}
              >
                {formatNumber(
                  cfdiTimbrados,
                )}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              justifyContent="space-between"
              spacing={1}
              mt={0.45}
            >
              <Typography
                variant="body2"
              >
                Cancelados
              </Typography>

              <Typography
                variant="body2"
                fontWeight={900}
              >
                {formatNumber(
                  cfdiCancelados,
                )}
              </Typography>
            </Stack>
          </Box>
        </Grid>

        {/* TIMBRES */}

        <Grid
          item
          xs={12}
        >
          <Box
            sx={{
              p: 1.5,

              borderRadius: 2.5,

              minWidth: 0,

              border:
                "1px solid",

              borderColor: alpha(
                theme.palette.success.main,
                0.2,
              ),

              bgcolor: alpha(
                theme.palette.success.main,
                isDark
                  ? 0.09
                  : 0.04,
              ),
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={900}
              display="block"
              mb={0.75}
            >
              Timbres
            </Typography>

            <Stack
              direction="row"
              justifyContent="space-between"
              spacing={1}
            >
              <Typography
                variant="body2"
              >
                PAC
              </Typography>

              <Typography
                variant="body2"
                fontWeight={900}
              >
                {formatNumber(
                  timbresPac,
                )}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              justifyContent="space-between"
              spacing={1}
              mt={0.45}
            >
              <Typography
                variant="body2"
              >
                Asignados
              </Typography>

              <Typography
                variant="body2"
                fontWeight={900}
              >
                {formatNumber(
                  timbresAsignados,
                )}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              justifyContent="space-between"
              spacing={1}
              mt={0.45}
            >
              <Typography
                variant="body2"
              >
                Disponibles
              </Typography>

              <Typography
                variant="body2"
                fontWeight={900}
                color="success.main"
              >
                {formatNumber(
                  timbresDisponibles,
                )}
              </Typography>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default function Metricas({ darkMode = false, setView }: Props) {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === "dark" || darkMode;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [systemFilter, setSystemFilter] = useState<SystemKey>("todos");
  const [filters, setFilters] = useState<MetricsFilters | null>(null);
  const [period, setPeriod] = useState<MetricsPeriod | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [syncMessage, setSyncMessage] = useState("");
  const [autoSyncInfo, setAutoSyncInfo] = useState<AutoSyncInfo | null>(null);

  const year = Number(selectedYear || filters?.year || period?.year || 0);
  const monthOptions = filters?.available_months || [];
  const yearOptions = filters?.available_years || [];
  const availableMonthNumbers = monthOptions
    .map((item) => Number(item.value))
    .filter((value) => Number.isInteger(value) && value >= 1 && value <= 12);
  const selectedMonthNumber =
    selectedMonth && selectedMonth !== "all" ? Number(selectedMonth) : null;
  const periodMonthNumbers = selectedMonthNumber
    ? [selectedMonthNumber]
    : availableMonthNumbers;
  const lastAvailableMonth =
    filters?.last_available_month ||
    availableMonthNumbers[availableMonthNumbers.length - 1] ||
    1;
  const periodLabel =
    period?.short_label || period?.label || filters?.period_key || "Cargando";
  const periodIncomeLabel =
    period?.mode === "range" ? "Ingreso del periodo" : "Ingreso del mes";

  const consolidatedSnapshot = getSnapshot(snapshots, "consolidado");
  const mitiendaSnapshot = getSnapshot(snapshots, "mitienda");
  const clicmenuSnapshot = getSnapshot(snapshots, "clicmenu");
  const taecontaSnapshot = getSnapshot(snapshots, "taeconta");

  const consolidatedKpis = asObject(consolidatedSnapshot?.kpis);
  const consolidatedData = asObject(consolidatedSnapshot?.consolidated);
  const consolidatedCharts = asObject(consolidatedSnapshot?.charts);
  const mitiendaSpecific = asObject(mitiendaSnapshot?.specific_metrics);
  const taecontaKpis = asObject(taecontaSnapshot?.kpis);
  const taecontaSpecific = asObject(taecontaSnapshot?.specific_metrics);
  const taecontaEmpresas = asObject(taecontaSpecific?.empresas);
  const taecontaCfdi = asObject(taecontaSpecific?.cfdi);
  const taecontaTimbres = asObject(taecontaSpecific?.timbres);

  const visibleSystems: ApiSystemKey[] =
    systemFilter === "todos"
      ? ["mitienda", "clicmenu", "taeconta"]
      : [systemFilter];

  const mitiendaSeries = getMonthlySeriesFromSnapshots(
    snapshots,
    "mitienda",
    year
  );

  const clicmenuSeries = getMonthlySeriesFromSnapshots(
    snapshots,
    "clicmenu",
    year
  );

  const taecontaSeries = getMonthlySeriesFromSnapshots(
    snapshots,
    "taeconta",
    year
  );

  const relationSeries = periodMonthNumbers.map((monthNumber) => {
    const monthOption = monthOptions.find(
      (item) => Number(item.value) === monthNumber
    );
    const mitienda = visibleSystems.includes("mitienda")
      ? Number(mitiendaSeries[monthNumber - 1] || 0)
      : 0;
    const clicmenu = visibleSystems.includes("clicmenu")
      ? Number(clicmenuSeries[monthNumber - 1] || 0)
      : 0;
    const taeconta = visibleSystems.includes("taeconta")
      ? Number(taecontaSeries[monthNumber - 1] || 0)
      : 0;

    return {
      month: monthOption?.short_label || monthOption?.label || String(monthNumber),
      monthNumber,
      mitienda,
      clicmenu,
      taeconta,
      total: mitienda + clicmenu + taeconta,
    };
  });

  const maxBarValue = Math.max(
    ...relationSeries.flatMap((item) => [
      item.mitienda,
      item.clicmenu,
      item.taeconta,
    ]),
    1
  );

  const mitiendaIncomeAnnual = getSystemAnnualIncome(
    mitiendaSnapshot,
    mitiendaSeries
  );

  const clicmenuIncomeAnnual = getSystemAnnualIncome(
    clicmenuSnapshot,
    clicmenuSeries
  );

  const taecontaIncomeAnnual = getSystemAnnualIncome(
    taecontaSnapshot,
    taecontaSeries
  );

  const incomeAnnualBySystem: Record<ApiSystemKey, number> = {
    mitienda: mitiendaIncomeAnnual,
    clicmenu: clicmenuIncomeAnnual,
    taeconta: taecontaIncomeAnnual,
  };

  const ingresosAnuales = visibleSystems.reduce(
    (total, key) => total + incomeAnnualBySystem[key],
    0
  );

  const mitiendaCurrentIncome = getSystemPeriodIncome(
    mitiendaSnapshot,
    mitiendaSeries,
    periodMonthNumbers
  );

  const clicmenuCurrentIncome = getSystemPeriodIncome(
    clicmenuSnapshot,
    clicmenuSeries,
    periodMonthNumbers
  );

  const taecontaCurrentIncome = getSystemPeriodIncome(
    taecontaSnapshot,
    taecontaSeries,
    periodMonthNumbers
  );

  const currentIncomeBySystem: Record<ApiSystemKey, number> = {
    mitienda: mitiendaCurrentIncome,
    clicmenu: clicmenuCurrentIncome,
    taeconta: taecontaCurrentIncome,
  };

  const ingresosMes = visibleSystems.reduce(
    (total, key) => total + currentIncomeBySystem[key],
    0
  );

  const previousMitiendaSeries = getMonthlySeries(
    consolidatedCharts,
    "mitienda",
    year - 1,
    lastAvailableMonth
  );

  const previousClicmenuSeries = getMonthlySeries(
    consolidatedCharts,
    "clicmenu",
    year - 1,
    lastAvailableMonth
  );

  const previousTaecontaSeries = getMonthlySeries(
    consolidatedCharts,
    "taeconta",
    year - 1,
    lastAvailableMonth
  );

  const previousIncomeBySystem: Record<ApiSystemKey, number> = {
    mitienda: sum(previousMitiendaSeries),
    clicmenu: sum(previousClicmenuSeries),
    taeconta: sum(previousTaecontaSeries),
  };

  const ingresosAnualesPrevios = visibleSystems.reduce(
    (total, key) => total + previousIncomeBySystem[key],
    0
  );

  const crecimientoAnual =
    ingresosAnualesPrevios > 0
      ? ((ingresosAnuales - ingresosAnualesPrevios) / ingresosAnualesPrevios) *
        100
      : 0;

  const snapshotBySystem: Record<ApiSystemKey, Snapshot | null> = {
    mitienda: mitiendaSnapshot,
    clicmenu: clicmenuSnapshot,
    taeconta: taecontaSnapshot,
  };

  const sistemasActivos = visibleSystems.filter(
    (key) => snapshotBySystem[key]?.status === "ok"
  ).length;

  const mitiendaAccounts = getSystemAccounts(
    "mitienda",
    mitiendaSnapshot,
    consolidatedSnapshot
  );

  const clicmenuAccounts = getSystemAccounts(
    "clicmenu",
    clicmenuSnapshot,
    consolidatedSnapshot
  );

  const taecontaAccounts = getSystemAccounts(
    "taeconta",
    taecontaSnapshot,
    consolidatedSnapshot
  );

  const totalEmpresas =
    systemFilter === "todos"
      ? mitiendaAccounts + clicmenuAccounts + taecontaAccounts
      : getSystemAccounts(
          systemFilter,
          snapshotBySystem[systemFilter],
          consolidatedSnapshot
        );

  const subscriptionSnapshot =
    systemFilter === "mitienda"
      ? mitiendaSnapshot
      : systemFilter === "clicmenu"
        ? clicmenuSnapshot
        : null;

  const planesActivos =
    systemFilter === "todos"
      ? firstNumber([
          { source: consolidatedData, keys: ["total_planes_activos"] },
          { source: consolidatedKpis, keys: ["planes_activos"] },
        ])
      : subscriptionSnapshot
        ? getSystemPlanActive(subscriptionSnapshot)
        : 0;

  const planesVencidos =
    systemFilter === "todos"
      ? firstNumber([
          { source: consolidatedData, keys: ["total_planes_vencidos"] },
          { source: consolidatedKpis, keys: ["planes_vencidos"] },
        ])
      : subscriptionSnapshot
        ? getSystemPlanExpired(subscriptionSnapshot)
        : 0;

  const proximosVencer7 =
    systemFilter === "todos"
      ? firstNumber([
          {
            source: consolidatedKpis,
            keys: ["planes_proximos_vencer_7"],
          },
        ])
      : subscriptionSnapshot
        ? firstNumber([
            {
              source: asObject(subscriptionSnapshot?.kpis),
              keys: ["planes_proximos_vencer_7"],
            },
          ])
        : 0;

  const mitiendaPlansActive = getSystemPlanActive(mitiendaSnapshot);
  const clicmenuPlansActive = getSystemPlanActive(clicmenuSnapshot);
  const mitiendaPlansExpired = getSystemPlanExpired(mitiendaSnapshot);
  const clicmenuPlansExpired = getSystemPlanExpired(clicmenuSnapshot);

  const mitiendaDemoActivos = firstNumber([
    {
      source: mitiendaSpecific,
      keys: ["demostraciones_activas"],
    },
  ]);

  const mitiendaDemoVencidos = firstNumber([
    {
      source: mitiendaSpecific,
      keys: ["demostraciones_vencidas"],
    },
  ]);

  const mitiendaPlanesPagadosActivos = firstNumber([
    {
      source: mitiendaSpecific,
      keys: ["planes_pagados_activos"],
    },
  ]);

  const mitiendaPlanesPagadosVencidos = firstNumber([
    {
      source: mitiendaSpecific,
      keys: ["planes_pagados_vencidos"],
    },
  ]);

  const taecontaEmpresasTotal = firstNumber([
    { source: taecontaEmpresas, keys: ["total"] },
    { source: taecontaKpis, keys: ["empresas_total"] },
  ]);

  const taecontaEmpresasVencidas = firstNumber([
    { source: taecontaEmpresas, keys: ["vencidas"] },
    { source: consolidatedKpis, keys: ["taeconta_empresas_vencidas"] },
  ]);

  const taecontaEmpresasVigentes = firstNumber(
    [
      { source: taecontaEmpresas, keys: ["vigentes"] },
      { source: consolidatedKpis, keys: ["taeconta_empresas_vigentes"] },
    ],
    Math.max(taecontaEmpresasTotal - taecontaEmpresasVencidas, 0)
  );

  const taecontaProximas30 = firstNumber([
    { source: taecontaEmpresas, keys: ["proximas_vencer_30"] },
    { source: consolidatedKpis, keys: ["taeconta_empresas_proximas_vencer_30"] },
  ]);

  const taecontaProximas7 = firstNumber([
    { source: taecontaEmpresas, keys: ["proximas_vencer_7"] },
  ]);

  const taecontaOperaciones = firstNumber([
    { source: taecontaKpis, keys: ["operaciones_mes"] },
  ]);

  const taecontaTicketPromedio = firstNumber([
    { source: taecontaKpis, keys: ["ticket_promedio_mes"] },
  ]);

  const taecontaCfdiTimbrados = firstNumber([
    { source: taecontaCfdi, keys: ["timbrados"] },
    { source: taecontaKpis, keys: ["cfdi_timbrados_total"] },
  ]);

  const taecontaCfdiCancelados = firstNumber([
    { source: taecontaCfdi, keys: ["cancelados"] },
    { source: taecontaKpis, keys: ["cfdi_cancelados_total"] },
  ]);

  const taecontaTimbresPac = firstNumber([
    { source: taecontaTimbres, keys: ["pac"] },
    { source: taecontaKpis, keys: ["timbres_pac"] },
  ]);

  const taecontaTimbresAsignados = firstNumber([
    { source: taecontaTimbres, keys: ["asignados"] },
    { source: taecontaKpis, keys: ["timbres_asignados"] },
  ]);

  const taecontaTimbresDisponibles = firstNumber([
    { source: taecontaTimbres, keys: ["disponibles"] },
    { source: taecontaKpis, keys: ["timbres_disponibles"] },
  ]);

  const abrirTiendasMiTienda = (filtro: MiTiendaFiltro) => {
    sessionStorage.setItem(
      "mitienda_filtro_tiendas",
      filtro
    );

    setView?.("mitienda-tiendas");
  };

  const abrirClicMenu = (filtro: ClicMenuFiltro) => {
    sessionStorage.setItem(
      "clicmenu_metricas_filtro",
      filtro
    );

    sessionStorage.setItem(
      "clicmenu_metricas_focus",
      "1"
    );

    setView?.("clicmenu");
  };

  const abrirCuentasTaeconta = (
    filtro: TaecontaCuentaVigenciaFilter
  ) => {
    sessionStorage.setItem(
      "taeconta_cuentas_vigencia",
      filtro
    );

    sessionStorage.setItem(
      "taeconta_cuentas_focus",
      "1"
    );

    navigate("/superadmin/systems/taeconta");
  };

  const totalIncomeForParticipation =
    mitiendaIncomeAnnual + clicmenuIncomeAnnual + taecontaIncomeAnnual;

  const mitiendaParticipation =
    totalIncomeForParticipation > 0
      ? (mitiendaIncomeAnnual / totalIncomeForParticipation) * 100
      : 0;

  const clicmenuParticipation =
    totalIncomeForParticipation > 0
      ? (clicmenuIncomeAnnual / totalIncomeForParticipation) * 100
      : 0;

  const taecontaParticipation =
    totalIncomeForParticipation > 0
      ? (taecontaIncomeAnnual / totalIncomeForParticipation) * 100
      : 0;

  const fetchMetricas = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
          setError("");
        }

        const token = getAuthToken();
        const params = new URLSearchParams({ system: "all" });

        if (selectedYear) {
          params.set("year", selectedYear);
        }

        if (selectedMonth) {
          params.set("month", selectedMonth);
        }

        const response = await fetch(
          `${API_BASE_URL}/superadmin/metricas-generales?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        const json: MetricasResponse = await response.json();

        if (
          !response.ok ||
          !json?.success ||
          !json?.filters ||
          !json?.period ||
          !json?.data?.snapshots
        ) {
          throw new Error(
            json?.message || "La respuesta de métricas no fue válida."
          );
        }

        setFilters(json.filters);
        setPeriod(json.period);
        setSelectedYear(String(json.filters.year));
        setSelectedMonth(String(json.filters.month));
        setSnapshots(json.data.snapshots);
        setAutoSyncInfo(json.auto_sync || null);
      } catch (err: any) {
        if (!silent) {
          setSnapshots([]);
          setError(
            err?.message || "No fue posible cargar las métricas generales."
          );
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [selectedMonth, selectedYear]
  );

  const syncMetricas = useCallback(async () => {
    try {
      setSyncing(true);
      setError("");
      setSyncMessage("");

      const token = getAuthToken();
      const syncSystem = systemFilter === "todos" ? "all" : systemFilter;

      /*
       * Si el usuario está viendo "Todos" los meses, el botón manual
       * refresca el último mes disponible. Así evitamos lanzar una
       * resincronización histórica completa de forma accidental.
       */
      const syncMonth =
        selectedMonth && selectedMonth !== "all"
          ? Number(selectedMonth)
          : lastAvailableMonth;

      const syncYear = Number(
        selectedYear || filters?.year || new Date().getFullYear()
      );

      const response = await fetch(
        `${API_BASE_URL}/superadmin/metrics/sync`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            system: syncSystem,
            year: syncYear,
            month: syncMonth,
          }),
        }
      );

      const json = await response.json();

      if (!response.ok || !json?.success) {
        throw new Error(
          json?.message || "No fue posible sincronizar las métricas."
        );
      }

      setSyncMessage(
        syncSystem === "all"
          ? "Mi Tienda, Clic Menú y TAECONTA se actualizaron correctamente."
          : `${SYSTEM_LABELS[syncSystem as ApiSystemKey]} se actualizó correctamente.`
      );

      await fetchMetricas(true);
    } catch (err: any) {
      setError(err?.message || "No fue posible actualizar las métricas.");
    } finally {
      setSyncing(false);
    }
  }, [
    fetchMetricas,
    filters?.year,
    lastAvailableMonth,
    selectedMonth,
    selectedYear,
    systemFilter,
  ]);

  useEffect(() => {
    fetchMetricas();
  }, [fetchMetricas]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void fetchMetricas(true);
      }
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, [fetchMetricas]);

  const cards = useMemo(
    () => [
      {
        title: "Ingresos acumulados",
        value: formatMoney(ingresosAnuales),
        helper: `Total registrado en ${year || "el año seleccionado"}`,
        icon: <AccountBalanceWalletIcon />,
        tone: "primary" as const,
      },
      {
        title: "Ingresos del periodo",
        value: formatMoney(ingresosMes),
        helper: `Periodo consultado: ${periodLabel}`,
        icon: <ReceiptLongIcon />,
        tone: "info" as const,
      },
      {
        title: "Empresas registradas",
        value: formatNumber(totalEmpresas),
        helper: `${formatNumber(sistemasActivos)} sistema(s) con información`,
        icon: <BusinessCenterIcon />,
        tone: "success" as const,
      },
      {
        title: "Crecimiento anual",
        value: formatSignedPercent(crecimientoAnual),
        helper:
          ingresosAnualesPrevios > 0
            ? "Comparado con el año anterior"
            : "Sin base histórica comparable",
        icon:
          crecimientoAnual < 0 ? <TrendingDownIcon /> : <TrendingUpIcon />,
        tone: crecimientoAnual < 0 ? ("warning" as const) : ("success" as const),
      },
    ],
    [
      crecimientoAnual,
      ingresosAnuales,
      ingresosAnualesPrevios,
      ingresosMes,
      periodLabel,
      sistemasActivos,
      totalEmpresas,
      year,
    ]
  );

  const chartEmpty = relationSeries.every((item) => item.total <= 0);

  const selectedSystemLabel =
    systemFilter === "todos" ? "Todos los sistemas" : SYSTEM_LABELS[systemFilter];

  return (
    <Box sx={{ pb: { xs: 2, md: 4 }, width: "100%", minWidth: 0 }}>
      <Paper
        sx={{
          position: "relative",
          overflow: "hidden",
          p: { xs: 2, sm: 2.5, md: 4 },
          mb: { xs: 2, md: 3 },
          borderRadius: { xs: 3, sm: 4, md: 5 },
          color: "#fff",
          border: "1px solid",
          borderColor: alpha("#ffffff", 0.12),
          background: isDark
            ? "linear-gradient(135deg, #0F172A 0%, #0B3B67 55%, #0B6E8E 100%)"
            : "linear-gradient(135deg, #0F4C81 0%, #0B78C4 55%, #13A3B8 100%)",
          boxShadow: isDark
            ? "0 24px 60px rgba(0,0,0,.35)"
            : "0 24px 60px rgba(15,76,129,.22)",
          "&::before": {
            content: '""',
            position: "absolute",
            width: 260,
            height: 260,
            right: -70,
            top: -120,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,.08)",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            width: 180,
            height: 180,
            right: 140,
            bottom: -110,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,.06)",
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr)",
            gap: { xs: 2, md: 2.5 },
            width: "100%",
            minWidth: 0,
          }}
        >
          <Box sx={{ width: "100%", minWidth: 0 }}>
            <Chip
              icon={<InsightsIcon />}
              label="Panel ejecutivo"
              size="small"
              sx={{
                mb: 1.5,
                color: "#fff",
                fontWeight: 800,
                bgcolor: "rgba(255,255,255,.14)",
                "& .MuiChip-icon": { color: "#fff" },
              }}
            />

            <Typography
              variant="h3"
              fontWeight={950}
              sx={{
                fontSize: { xs: 28, sm: 34, md: 42 },
                lineHeight: 1.08,
                letterSpacing: { xs: -0.4, md: -1 },
                whiteSpace: { xs: "normal", md: "nowrap" },
              }}
            >
              Métricas generales
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: "rgba(255,255,255,.82)",
                fontSize: { xs: 14, sm: 16 },
              }}
            >
              Comparación ejecutiva de MiTiendaEnLineaMx, Clic Menú y TAECONTA.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              mt={2.5}
              flexWrap="wrap"
              useFlexGap
            >
              <Chip
                icon={<CalendarMonthIcon />}
                label={`Periodo ${periodLabel}`}
                sx={{
                  color: "#fff",
                  bgcolor: "rgba(255,255,255,.12)",
                  "& .MuiChip-icon": { color: "#fff" },
                }}
              />

              <Chip
                label={`Actualizado: ${formatSyncDate(
                  systemFilter === "taeconta"
                    ? taecontaSnapshot?.synced_at
                    : consolidatedSnapshot?.synced_at
                )}`}
                sx={{
                  color: "#fff",
                  bgcolor: "rgba(255,255,255,.12)",
                }}
              />
            </Stack>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "120px 160px minmax(220px, 1fr) 160px",
              },
              gap: 1.5,
              width: "100%",
              minWidth: 0,
              p: { xs: 1, sm: 1.5 },
              borderRadius: 3,
              bgcolor: "rgba(255,255,255,.1)",
              backdropFilter: "blur(10px)",
              boxSizing: "border-box",
            }}
          >
            <TextField
              select
              size="small"
              label="Año"
              value={selectedYear}
              onChange={(event) => {
                setSelectedYear(event.target.value);
                setSelectedMonth("");
              }}
              disabled={yearOptions.length === 0}
              sx={{
                width: "100%",
                minWidth: 0,
                "& .MuiInputBase-root": { bgcolor: "background.paper" },
              }}
            >
              {yearOptions.map((item) => (
                <MenuItem key={String(item.value)} value={String(item.value)}>
                  {item.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="Mes"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              disabled={monthOptions.length === 0}
              sx={{
                width: "100%",
                minWidth: 0,
                "& .MuiInputBase-root": { bgcolor: "background.paper" },
              }}
            >
              {monthOptions.map((item) => (
                <MenuItem key={String(item.value)} value={String(item.value)}>
                  {item.label}
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
              sx={{
                width: "100%",
                minWidth: 0,
                "& .MuiInputBase-root": { bgcolor: "background.paper" },
              }}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="mitienda">MiTiendaEnLineaMx</MenuItem>
              <MenuItem value="clicmenu">Clic Menú</MenuItem>
              <MenuItem value="taeconta">TAECONTA</MenuItem>
            </TextField>

            <Button
              variant="contained"
              startIcon={
                syncing ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <RefreshIcon />
                )
              }
              onClick={syncMetricas}
              disabled={loading || syncing}
              sx={{
                width: "100%",
                minWidth: 0,
                minHeight: 40,
                whiteSpace: "nowrap",
                overflow: "visible",
                bgcolor: isDark ? "rgba(255,255,255,.16)" : "#fff",
                color: isDark ? "#fff" : "#0F4C81",
                border: isDark
                  ? "1px solid rgba(255,255,255,.22)"
                  : "1px solid rgba(255,255,255,.7)",
                fontWeight: 900,
                "& .MuiButton-startIcon": { flexShrink: 0 },
                "&:hover": {
                  bgcolor: isDark ? "rgba(255,255,255,.24)" : "#F8FAFC",
                },
              }}
            >
              Actualizar
            </Button>
          </Box>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {syncMessage && (
        <Alert
          severity="success"
          onClose={() => setSyncMessage("")}
          sx={{ mb: 2, borderRadius: 3 }}
        >
          {syncMessage}
        </Alert>
      )}

      {autoSyncInfo?.enabled && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 3 }}>
          Actualización automática de TAECONTA activa cada{" "}
          {autoSyncInfo.interval_minutes} minutos al consultar métricas.
          {autoSyncInfo.refreshed
            ? " TAECONTA se actualizó automáticamente en esta consulta."
            : ""}
        </Alert>
      )}

      {loading && snapshots.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            p: 5,
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
          <Grid container spacing={{ xs: 2, md: 2.5 }}>
            {cards.map((item) => (
              <Grid item xs={12} sm={6} xl={3} key={item.title}>
                <StatCard {...item} />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mt: { xs: 0, md: 0.5 } }}>
            <Grid item xs={12} xl={8}>
              <Paper
                variant="outlined"
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: 4,
                  height: "100%",
                  bgcolor: "background.paper",
                  borderColor: theme.palette.divider,
                  boxShadow: isDark
                    ? "0 16px 36px rgba(0,0,0,.2)"
                    : "0 16px 36px rgba(15,23,42,.06)",
                }}
              >
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                  spacing={2}
                  mb={3}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={950}>
                      Evolución mensual de ingresos
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {selectedSystemLabel} · {periodLabel}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    {visibleSystems.includes("mitienda") && (
                      <Stack direction="row" spacing={0.8} alignItems="center">
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: "success.main",
                          }}
                        />
                        <Typography variant="caption" fontWeight={800}>
                          MiTienda
                        </Typography>
                      </Stack>
                    )}

                    {visibleSystems.includes("clicmenu") && (
                      <Stack direction="row" spacing={0.8} alignItems="center">
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: "warning.main",
                          }}
                        />
                        <Typography variant="caption" fontWeight={800}>
                          Clic Menú
                        </Typography>
                      </Stack>
                    )}

                    {visibleSystems.includes("taeconta") && (
                      <Stack direction="row" spacing={0.8} alignItems="center">
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: "primary.main",
                          }}
                        />
                        <Typography variant="caption" fontWeight={800}>
                          TAECONTA
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Stack>

                {chartEmpty ? (
                  <Alert severity="info">
                    No hay datos disponibles para los filtros seleccionados.
                  </Alert>
                ) : isMobile ? (
                  <Stack spacing={2}>
                    {relationSeries.map((item) => (
                      <Box
                        key={item.month}
                        sx={{
                          p: 1.5,
                          borderRadius: 3,
                          border: `1px solid ${theme.palette.divider}`,
                          bgcolor: alpha(
                            theme.palette.background.default,
                            isDark ? 0.26 : 0.58
                          ),
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={1.25}
                        >
                          <Typography fontWeight={950}>{item.month}</Typography>
                          <Typography fontWeight={950}>
                            {formatMoney(item.total)}
                          </Typography>
                        </Stack>

                        {visibleSystems.includes("mitienda") && (
                          <Box mb={visibleSystems.length > 1 ? 1.4 : 0}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              mb={0.55}
                            >
                              <Typography variant="caption" fontWeight={800}>
                                MiTienda
                              </Typography>
                              <Typography variant="caption" fontWeight={900}>
                                {formatMoney(item.mitienda)}
                              </Typography>
                            </Stack>
                            <LinearProgress
                              color="success"
                              variant="determinate"
                              value={Math.min(
                                (item.mitienda / maxBarValue) * 100,
                                100
                              )}
                              sx={{
                                height: 9,
                                borderRadius: 99,
                                bgcolor: alpha(
                                  theme.palette.success.main,
                                  isDark ? 0.16 : 0.1
                                ),
                                "& .MuiLinearProgress-bar": {
                                  borderRadius: 99,
                                },
                              }}
                            />
                          </Box>
                        )}

                        {visibleSystems.includes("clicmenu") && (
                          <Box mb={visibleSystems.includes("taeconta") ? 1.4 : 0}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              mb={0.55}
                            >
                              <Typography variant="caption" fontWeight={800}>
                                Clic Menú
                              </Typography>
                              <Typography variant="caption" fontWeight={900}>
                                {formatMoney(item.clicmenu)}
                              </Typography>
                            </Stack>
                            <LinearProgress
                              color="warning"
                              variant="determinate"
                              value={Math.min(
                                (item.clicmenu / maxBarValue) * 100,
                                100
                              )}
                              sx={{
                                height: 9,
                                borderRadius: 99,
                                bgcolor: alpha(
                                  theme.palette.warning.main,
                                  isDark ? 0.16 : 0.1
                                ),
                                "& .MuiLinearProgress-bar": {
                                  borderRadius: 99,
                                },
                              }}
                            />
                          </Box>
                        )}

                        {visibleSystems.includes("taeconta") && (
                          <Box>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              mb={0.55}
                            >
                              <Typography variant="caption" fontWeight={800}>
                                TAECONTA
                              </Typography>
                              <Typography variant="caption" fontWeight={900}>
                                {formatMoney(item.taeconta)}
                              </Typography>
                            </Stack>
                            <LinearProgress
                              color="primary"
                              variant="determinate"
                              value={Math.min(
                                (item.taeconta / maxBarValue) * 100,
                                100
                              )}
                              sx={{
                                height: 9,
                                borderRadius: 99,
                                bgcolor: alpha(
                                  theme.palette.primary.main,
                                  isDark ? 0.16 : 0.1
                                ),
                                "& .MuiLinearProgress-bar": {
                                  borderRadius: 99,
                                },
                              }}
                            />
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Box sx={{ overflowX: "auto", pb: 1 }}>
                    <Box
                      sx={{
                        minWidth: Math.max(680, relationSeries.length * 88),
                        height: 330,
                        position: "relative",
                        display: "flex",
                        alignItems: "flex-end",
                        gap: 1,
                        px: 1,
                        pt: 3,
                        borderRadius: 3,
                        backgroundImage: `repeating-linear-gradient(
                          to top,
                          ${alpha(theme.palette.divider, 0.5)} 0,
                          ${alpha(theme.palette.divider, 0.5)} 1px,
                          transparent 1px,
                          transparent 64px
                        )`,
                      }}
                    >
                      {relationSeries.map((item) => (
                        <Box
                          key={item.month}
                          sx={{
                            flex: 1,
                            minWidth: 70,
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-end",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            variant="caption"
                            fontWeight={900}
                            color="text.secondary"
                            mb={1}
                          >
                            {formatCompactMoney(item.total)}
                          </Typography>

                          <Stack
                            direction="row"
                            alignItems="flex-end"
                            justifyContent="center"
                            spacing={0.8}
                            sx={{ height: 240, width: "100%" }}
                          >
                            {visibleSystems.includes("mitienda") && (
                              <Tooltip
                                arrow
                                title={`MiTienda · ${item.month}: ${formatMoney(
                                  item.mitienda
                                )}`}
                              >
                                <Box
                                  sx={{
                                    width: visibleSystems.length === 1 ? 28 : 22,
                                    height: `${Math.max(
                                      item.mitienda > 0
                                        ? (item.mitienda / maxBarValue) * 100
                                        : 0,
                                      item.mitienda > 0 ? 2 : 0
                                    )}%`,
                                    minHeight: item.mitienda > 0 ? 5 : 0,
                                    borderRadius: "8px 8px 3px 3px",
                                    bgcolor: "success.main",
                                    boxShadow: `0 8px 20px ${alpha(
                                      theme.palette.success.main,
                                      0.25
                                    )}`,
                                    transition: "height .25s ease",
                                  }}
                                />
                              </Tooltip>
                            )}

                            {visibleSystems.includes("clicmenu") && (
                              <Tooltip
                                arrow
                                title={`Clic Menú · ${item.month}: ${formatMoney(
                                  item.clicmenu
                                )}`}
                              >
                                <Box
                                  sx={{
                                    width: visibleSystems.length === 1 ? 28 : 22,
                                    height: `${Math.max(
                                      item.clicmenu > 0
                                        ? (item.clicmenu / maxBarValue) * 100
                                        : 0,
                                      item.clicmenu > 0 ? 2 : 0
                                    )}%`,
                                    minHeight: item.clicmenu > 0 ? 5 : 0,
                                    borderRadius: "8px 8px 3px 3px",
                                    bgcolor: "warning.main",
                                    boxShadow: `0 8px 20px ${alpha(
                                      theme.palette.warning.main,
                                      0.25
                                    )}`,
                                    transition: "height .25s ease",
                                  }}
                                />
                              </Tooltip>
                            )}

                            {visibleSystems.includes("taeconta") && (
                              <Tooltip
                                arrow
                                title={`TAECONTA · ${item.month}: ${formatMoney(
                                  item.taeconta
                                )}`}
                              >
                                <Box
                                  sx={{
                                    width: visibleSystems.length === 1 ? 28 : 22,
                                    height: `${Math.max(
                                      item.taeconta > 0
                                        ? (item.taeconta / maxBarValue) * 100
                                        : 0,
                                      item.taeconta > 0 ? 2 : 0
                                    )}%`,
                                    minHeight: item.taeconta > 0 ? 5 : 0,
                                    borderRadius: "8px 8px 3px 3px",
                                    bgcolor: "primary.main",
                                    boxShadow: `0 8px 20px ${alpha(
                                      theme.palette.primary.main,
                                      0.25
                                    )}`,
                                    transition: "height .25s ease",
                                  }}
                                />
                              </Tooltip>
                            )}
                          </Stack>

                          <Typography
                            variant="caption"
                            fontWeight={900}
                            mt={1.2}
                          >
                            {item.month}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} xl={4}>
              <Stack spacing={3} height="100%">
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    bgcolor: "background.paper",
                    borderColor: theme.palette.divider,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.2} mb={3}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.info.main, 0.12),
                        color: "info.main",
                      }}
                    >
                      <DonutLargeIcon />
                    </Avatar>

                    <Box>
                      <Typography fontWeight={950}>
                        Participación de ingresos
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Distribución anual por sistema
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack
                    direction={{ xs: "column", sm: "row", xl: "column" }}
                    alignItems="center"
                    spacing={3}
                  >
                    <Box
                      sx={{
                        width: 156,
                        height: 156,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        background: `conic-gradient(
                          ${theme.palette.success.main} 0 ${mitiendaParticipation}%,
                          ${theme.palette.warning.main} ${mitiendaParticipation}% ${
                            mitiendaParticipation + clicmenuParticipation
                          }%,
                          ${theme.palette.primary.main} ${
                            mitiendaParticipation + clicmenuParticipation
                          }% 100%
                        )`,
                        position: "relative",
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          inset: 22,
                          borderRadius: "50%",
                          bgcolor: "background.paper",
                        },
                      }}
                    >
                      <Box textAlign="center" position="relative" zIndex={1}>
                        <Typography
                          variant="h5"
                          fontWeight={950}
                          sx={{ fontSize: { xs: 17, sm: 20 } }}
                        >
                          {formatMoney(totalIncomeForParticipation)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Total anual
                        </Typography>
                      </Box>
                    </Box>

                    <Stack spacing={1.5} width="100%">
                      <Box>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          mb={0.6}
                        >
                          <Typography variant="body2" fontWeight={850}>
                            MiTienda
                          </Typography>
                          <Typography variant="body2" fontWeight={900}>
                            {mitiendaParticipation.toFixed(1)}%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          color="success"
                          variant="determinate"
                          value={mitiendaParticipation}
                          sx={{ height: 8, borderRadius: 99 }}
                        />
                      </Box>

                      <Box>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          mb={0.6}
                        >
                          <Typography variant="body2" fontWeight={850}>
                            Clic Menú
                          </Typography>
                          <Typography variant="body2" fontWeight={900}>
                            {clicmenuParticipation.toFixed(1)}%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          color="warning"
                          variant="determinate"
                          value={clicmenuParticipation}
                          sx={{ height: 8, borderRadius: 99 }}
                        />
                      </Box>

                      <Box>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          mb={0.6}
                        >
                          <Typography variant="body2" fontWeight={850}>
                            TAECONTA
                          </Typography>
                          <Typography variant="body2" fontWeight={900}>
                            {taecontaParticipation.toFixed(1)}%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          color="primary"
                          variant="determinate"
                          value={taecontaParticipation}
                          sx={{ height: 8, borderRadius: 99 }}
                        />
                      </Box>
                    </Stack>
                  </Stack>
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    flex: 1,
                    borderRadius: 4,
                    bgcolor: "background.paper",
                    borderColor: theme.palette.divider,
                  }}
                >
                  <Typography fontWeight={950} mb={0.5}>
                    {systemFilter === "taeconta"
                      ? "Estado de cuentas TAECONTA"
                      : "Estado de suscripciones"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {systemFilter === "taeconta"
                      ? "Vigencia de las cuentas registradas"
                      : systemFilter === "todos"
                        ? "Mi Tienda y Clic Menú; TAECONTA se muestra por separado"
                        : "Indicadores para el sistema filtrado"}
                  </Typography>

                  <Stack spacing={2} mt={3}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: alpha(
                          theme.palette.success.main,
                          isDark ? 0.14 : 0.08
                        ),
                        border: `1px solid ${alpha(
                          theme.palette.success.main,
                          0.2
                        )}`,
                        cursor:
                          systemFilter === "taeconta"
                            ? "pointer"
                            : "default",
                        transition:
                          "transform .18s ease, box-shadow .18s ease",
                        "&:hover":
                          systemFilter === "taeconta"
                            ? {
                                transform: "translateY(-2px)",
                                boxShadow: `0 10px 24px ${alpha(
                                  theme.palette.success.main,
                                  0.14
                                )}`,
                              }
                            : undefined,
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between">
                        <Box
                      role={systemFilter === "taeconta" ? "button" : undefined}
                      tabIndex={systemFilter === "taeconta" ? 0 : undefined}
                      onClick={() => {
                        if (systemFilter === "taeconta") {
                          abrirCuentasTaeconta("vigentes");
                        }
                      }}
                      onKeyDown={(event) => {
                        if (
                          systemFilter === "taeconta" &&
                          (event.key === "Enter" || event.key === " ")
                        ) {
                          event.preventDefault();
                          abrirCuentasTaeconta("vigentes");
                        }
                      }}>
                          <Typography variant="caption" color="text.secondary">
                            {systemFilter === "taeconta"
                              ? "Cuentas vigentes"
                              : "Planes activos"}
                          </Typography>
                          <Typography variant="h4" fontWeight={950}>
                            {formatNumber(
                              systemFilter === "taeconta"
                                ? taecontaEmpresasVigentes
                                : planesActivos
                            )}
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
                          isDark ? 0.14 : 0.08
                        ),
                        border: `1px solid ${alpha(
                          theme.palette.error.main,
                          0.2
                        )}`,
                        cursor:
                          systemFilter === "taeconta"
                            ? "pointer"
                            : "default",
                        transition:
                          "transform .18s ease, box-shadow .18s ease",
                        "&:hover":
                          systemFilter === "taeconta"
                            ? {
                                transform: "translateY(-2px)",
                                boxShadow: `0 10px 24px ${alpha(
                                  theme.palette.error.main,
                                  0.14
                                )}`,
                              }
                            : undefined,
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between">
                        <Box
                      role={systemFilter === "taeconta" ? "button" : undefined}
                      tabIndex={systemFilter === "taeconta" ? 0 : undefined}
                      onClick={() => {
                        if (systemFilter === "taeconta") {
                          abrirCuentasTaeconta("vencidas");
                        }
                      }}
                      onKeyDown={(event) => {
                        if (
                          systemFilter === "taeconta" &&
                          (event.key === "Enter" || event.key === " ")
                        ) {
                          event.preventDefault();
                          abrirCuentasTaeconta("vencidas");
                        }
                      }}>
                          <Typography variant="caption" color="text.secondary">
                            {systemFilter === "taeconta"
                              ? "Cuentas vencidas"
                              : "Planes vencidos"}
                          </Typography>
                          <Typography variant="h4" fontWeight={950}>
                            {formatNumber(
                              systemFilter === "taeconta"
                                ? taecontaEmpresasVencidas
                                : planesVencidos
                            )}
                          </Typography>
                        </Box>
                        <ErrorIcon color="error" />
                      </Stack>
                    </Box>

                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: alpha(
                          theme.palette.warning.main,
                          isDark ? 0.14 : 0.08
                        ),
                        border: `1px solid ${alpha(
                          theme.palette.warning.main,
                          0.2
                        )}`,
                        cursor:
                          systemFilter === "taeconta"
                            ? "pointer"
                            : "default",
                        transition:
                          "transform .18s ease, box-shadow .18s ease",
                        "&:hover":
                          systemFilter === "taeconta"
                            ? {
                                transform: "translateY(-2px)",
                                boxShadow: `0 10px 24px ${alpha(
                                  theme.palette.warning.main,
                                  0.14
                                )}`,
                              }
                            : undefined,
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between">
                        <Box
                      role={systemFilter === "taeconta" ? "button" : undefined}
                      tabIndex={systemFilter === "taeconta" ? 0 : undefined}
                      onClick={() => {
                        if (systemFilter === "taeconta") {
                          abrirCuentasTaeconta("proximas7");
                        }
                      }}
                      onKeyDown={(event) => {
                        if (
                          systemFilter === "taeconta" &&
                          (event.key === "Enter" || event.key === " ")
                        ) {
                          event.preventDefault();
                          abrirCuentasTaeconta("proximas7");
                        }
                      }}>
                          <Typography variant="caption" color="text.secondary">
                            {systemFilter === "taeconta"
                              ? "Próximas a vencer (7 días)"
                              : "Próximos a vencer"}
                          </Typography>
                          <Typography variant="h4" fontWeight={950}>
                            {formatNumber(
                              systemFilter === "taeconta"
                                ? taecontaProximas7
                                : proximosVencer7
                            )}
                          </Typography>
                        </Box>
                        <WarningAmberIcon color="warning" />
                      </Stack>
                    </Box>
                  </Stack>
                </Paper>
              </Stack>
            </Grid>
          </Grid>

          <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mt: { xs: 0, md: 0.5 } }}>
            {(systemFilter === "todos" || systemFilter === "mitienda") && (
              <Grid item xs={12} lg={systemFilter === "todos" ? 4 : 12}>
                <SystemSummary
                  title="MiTiendaEnLineaMx"
                  icon={<StorefrontIcon />}
                  income={mitiendaIncomeAnnual}
                  currentIncome={mitiendaCurrentIncome}
                  periodIncomeLabel={periodIncomeLabel}
                  accounts={mitiendaAccounts}
                  activePlans={mitiendaPlansActive}
                  expiredPlans={mitiendaPlansExpired}
                  accent={theme.palette.success.main}
                  onAccountsClick={() =>
                    abrirTiendasMiTienda("todas")
                  }
                  onActiveClick={() =>
                    abrirTiendasMiTienda("activas")
                  }
                  onExpiredClick={() =>
                    abrirTiendasMiTienda("vencidas")
                  }
                  breakdown={[
                    {
                      label: "Demo activos",
                      value: mitiendaDemoActivos,
                      color: "success",
                      onClick: () =>
                        abrirTiendasMiTienda("demo_activo"),
                    },
                    {
                      label: "Demo vencidos",
                      value: mitiendaDemoVencidos,
                      color: "error",
                      onClick: () =>
                        abrirTiendasMiTienda("demo_vencido"),
                    },
                    {
                      label: "Planes activos",
                      value: mitiendaPlanesPagadosActivos,
                      color: "success",
                      onClick: () =>
                        abrirTiendasMiTienda("plan_activo"),
                    },
                    {
                      label: "Planes vencidos",
                      value: mitiendaPlanesPagadosVencidos,
                      color: "error",
                      onClick: () =>
                        abrirTiendasMiTienda("plan_vencido"),
                    },
                  ]}
                />
              </Grid>
            )}

            {(systemFilter === "todos" || systemFilter === "clicmenu") && (
              <Grid item xs={12} lg={systemFilter === "todos" ? 4 : 12}>
                <SystemSummary
                  title="Clic Menú"
                  icon={<RestaurantIcon />}
                  income={clicmenuIncomeAnnual}
                  currentIncome={clicmenuCurrentIncome}
                  periodIncomeLabel={periodIncomeLabel}
                  accounts={clicmenuAccounts}
                  activePlans={clicmenuPlansActive}
                  expiredPlans={clicmenuPlansExpired}
                  accent={theme.palette.warning.main}
                  onAccountsClick={() =>
                    abrirClicMenu("todas")
                  }
                  onActiveClick={() =>
                    abrirClicMenu("activas")
                  }
                  onExpiredClick={() =>
                    abrirClicMenu("vencidas")
                  }
                />
              </Grid>
            )}

            {(systemFilter === "todos" || systemFilter === "taeconta") && (
              <Grid item xs={12} lg={systemFilter === "todos" ? 4 : 12}>
                <TaecontaSummary
                  income={taecontaIncomeAnnual}
                  currentIncome={taecontaCurrentIncome}
                  periodIncomeLabel={periodIncomeLabel}
                  empresas={taecontaEmpresasTotal}
                  vigentes={taecontaEmpresasVigentes}
                  vencidas={taecontaEmpresasVencidas}
                  proximas30={taecontaProximas30}
                  operaciones={taecontaOperaciones}
                  ticketPromedio={taecontaTicketPromedio}
                  cfdiTimbrados={taecontaCfdiTimbrados}
                  cfdiCancelados={taecontaCfdiCancelados}
                  timbresPac={taecontaTimbresPac}
                  timbresAsignados={taecontaTimbresAsignados}
                  timbresDisponibles={taecontaTimbresDisponibles}
                  accent={theme.palette.primary.main}
                  onTodasClick={() =>
                    abrirCuentasTaeconta("todas")
                  }
                  onVigentesClick={() =>
                    abrirCuentasTaeconta("vigentes")
                  }
                  onVencidasClick={() =>
                    abrirCuentasTaeconta("vencidas")
                  }
                  onProximas30Click={() =>
                    abrirCuentasTaeconta("proximas30")
                  }
                />
              </Grid>
            )}
          </Grid>

          <Paper
            variant="outlined"
            sx={{
              mt: 3,
              px: 2.5,
              py: 2,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.info.main, isDark ? 0.08 : 0.04),
              borderColor: alpha(theme.palette.info.main, 0.18),
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              spacing={1.5}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <InfoOutlinedIcon color="info" fontSize="small" />
                <Typography variant="body2">
                  Los meses disponibles y el periodo mostrado son definidos por el backend.
                </Typography>
              </Stack>

              <Typography variant="body2" color="text.secondary">
                Fuente: snapshots locales sincronizados con Mi Tienda, Clic Menú y TAECONTA.
              </Typography>
            </Stack>
          </Paper>
        </>
      )}
    </Box>
  );
}