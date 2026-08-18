import { useCallback, useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  GlobalStyles,
  Grid,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  AdminPanelSettings,
  People,
  ReceiptLong,
  MonetizationOn,
  TrendingUp,
  AutoGraph,
  Storefront,
  Restaurant,
  WarningAmber,
  Refresh,
  CheckCircle,
} from "@mui/icons-material";

type Props = {
  darkMode: boolean;
  setView?: (view: string) => void;
};

type TaecontaCuentaVigenciaFilter =
  | "todas"
  | "vigentes"
  | "proximas7"
  | "proximas30"
  | "vencidas";

type ClicMenuAlertaFiltro =
  | "todas"
  | "activas"
  | "vencidas";

type MiTiendaAlertaFiltro =
  | "todas"
  | "activas"
  | "vencidas"
  | "demo_activo"
  | "demo_vencido"
  | "plan_activo"
  | "plan_vencido";

type DashboardAlertAction =
  | {
      system: "taeconta";
      filter: TaecontaCuentaVigenciaFilter;
    }
  | {
      system: "clicmenu";
      filter: ClicMenuAlertaFiltro;
    }
  | {
      system: "mitienda";
      filter: MiTiendaAlertaFiltro;
    };

type MetricSnapshot = {
  id: number;
  system_key: string;
  system_name: string;
  year: number;
  month: number;
  period_key: string;
  status: string;
  error_message?: string | null;
  synced_at?: string | null;
  kpis?: Record<string, any> | any[];
  specific_metrics?: Record<string, any> | any[];
  consolidated?: Record<string, any> | any[];
  charts?: Record<string, any> | any[];
};

type DashboardAlert = {
  id: number;
  system_key: string;
  alert_type: string;
  severity: string;
  title: string;
  message?: string | null;
  detected_at?: string | null;
};

type SyncLog = {
  id: number;
  system_key: string;
  status: string;
  year: number;
  month: number;
  period_key?: string | null;
  records_processed: number;
  error_message?: string | null;
  created_at?: string | null;
};

type DashboardResponse = {
  success: boolean;
  message: string;
  filters: {
    year: number;
    month: number;
    period_key: string;
    system: string;
  };
  data: {
    selected: MetricSnapshot[];
    consolidated: MetricSnapshot | null;
    systems: {
      mitienda: MetricSnapshot | null;
      clicmenu: MetricSnapshot | null;
      taeconta?: MetricSnapshot | null;
    };
    alerts: DashboardAlert[];
    sync_logs: SyncLog[];
  };
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

const API_BASE_URL = "https://api.tecnologiasadministrativas.com/api";

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

function formatPercent(value: number) {
  return `${new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)}%`;
}

function currentPeriod(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function monthlySeries(
  charts: Record<string, any>,
  systemKey: "mitienda" | "clicmenu" | "taeconta",
  year: number
) {
  const ingresosPorMes = asObject(charts?.ingresos_por_mes);

  const list = Array.isArray(ingresosPorMes?.[systemKey])
    ? ingresosPorMes[systemKey]
    : [];

  const values = Array.from({ length: 12 }, () => 0);

  list.forEach((item: any) => {
    const monthText = String(item?.month || "");
    const [itemYear, itemMonth] = monthText.split("-").map(Number);

    if (itemYear !== year) return;
    if (!itemMonth || itemMonth < 1 || itemMonth > 12) return;

    values[itemMonth - 1] = Number(item?.value || 0);
  });

  return values;
}

function monthlyValue(
  charts: Record<string, any>,
  systemKey: "mitienda" | "clicmenu" | "taeconta",
  year: number,
  month: number
) {
  return monthlySeries(charts, systemKey, year)[month - 1] || 0;
}

function annualValue(
  charts: Record<string, any>,
  systemKey: "mitienda" | "clicmenu" | "taeconta",
  year: number,
  maximumMonth = 12
) {
  return monthlySeries(charts, systemKey, year)
    .slice(0, Math.max(0, Math.min(maximumMonth, 12)))
    .reduce((total, value) => total + Number(value || 0), 0);
}

function normalizeSystemText(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function chartIncomeBySystem(
  charts: Record<string, any>,
  searches: string | string[]
) {
  const list = Array.isArray(charts?.ingresos_por_sistema)
    ? charts.ingresos_por_sistema
    : [];

  const aliases = (Array.isArray(searches) ? searches : [searches])
    .map(normalizeSystemText)
    .filter(Boolean);

  const found = list.find((item: any) => {
    const candidates = [
      item?.system_key,
      item?.system,
      item?.key,
      item?.name,
      item?.system_name,
      item?.label,
    ]
      .map(normalizeSystemText)
      .filter(Boolean);

    return candidates.some((candidate) =>
      aliases.some(
        (alias) =>
          candidate === alias ||
          candidate.includes(alias) ||
          alias.includes(candidate)
      )
    );
  });

  return firstNumber(
    [
      {
        source: found,
        keys: [
          "value",
          "amount",
          "total",
          "income",
          "ingresos",
          "total_ingresos_planes",
        ],
      },
    ],
    0
  );
}

function normalizeAlertText(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function dashboardAlertAction(
  alert: DashboardAlert
): DashboardAlertAction | null {
  const rawSystem = normalizeAlertText(
    alert.system_key
  ).replace(/[^a-z0-9]/g, "");

  const text = normalizeAlertText(
    [
      alert.alert_type,
      alert.title,
      alert.message,
    ].join(" ")
  );

  const compactText = text.replace(
    /[^a-z0-9]/g,
    ""
  );

  /*
   * Primero intentamos usar system_key.
   * Si el backend envía una alerta "consolidada", únicamente la
   * asociamos a un sistema cuando el propio texto lo identifica.
   *
   * Una alerta consolidada como "Planes vencidos entre los sistemas"
   * permanece fuera del panel porque no existe un único filtro que
   * pueda mostrar exactamente esos registros.
   */
  let system = rawSystem;

  if (
    ![
      "taeconta",
      "clicmenu",
      "clicmenuapp",
      "mitienda",
      "mitiendaenlineamx",
      "mtelmx",
    ].includes(system)
  ) {
    if (compactText.includes("taeconta")) {
      system = "taeconta";
    } else if (compactText.includes("clicmenu")) {
      system = "clicmenu";
    } else if (
      compactText.includes("mitiendaenlineamx") ||
      compactText.includes("mitienda") ||
      compactText.includes("mtelmx")
    ) {
      system = "mitienda";
    } else {
      return null;
    }
  }

  const isExpired =
    text.includes("vencid") ||
    text.includes("expir");

  const isUpcoming =
    text.includes("proxim") &&
    text.includes("venc");

  const isActive =
    text.includes("activ") ||
    text.includes("vigent");

  const isAccount =
    text.includes("cuenta") ||
    text.includes("empresa");

  const isPlanOrSubscription =
    text.includes("plan") ||
    text.includes("suscrip");

  const isDemo =
    text.includes("demo") ||
    text.includes("demostr");

  const isRestaurant =
    text.includes("restaurante");

  const withoutActivePlan =
    text.includes("sin plan") ||
    text.includes("sin suscrip");

  const mentions7Days =
    text.includes("7 dia") ||
    text.includes("7 dias") ||
    text.includes("_7") ||
    text.includes("-7");

  const mentions30Days =
    text.includes("30 dia") ||
    text.includes("30 dias") ||
    text.includes("_30") ||
    text.includes("-30");

  /*
   * TAECONTA
   *
   * Filtros existentes:
   * todas | vigentes | proximas7 | proximas30 | vencidas
   *
   * Solo aceptamos alertas relacionadas con cuentas/empresas y cuyo
   * estado tenga una correspondencia exacta con esos filtros.
   */
  if (system === "taeconta") {
    if (!isAccount) {
      return null;
    }

    if (isUpcoming) {
      if (mentions7Days) {
        return {
          system: "taeconta",
          filter: "proximas7",
        };
      }

      if (mentions30Days) {
        return {
          system: "taeconta",
          filter: "proximas30",
        };
      }

      return null;
    }

    if (isExpired) {
      return {
        system: "taeconta",
        filter: "vencidas",
      };
    }

    if (isActive) {
      return {
        system: "taeconta",
        filter: "vigentes",
      };
    }

    return null;
  }

  /*
   * CLIC MENÚ
   *
   * Filtros existentes:
   * todas | activas | vencidas
   *
   * No mostramos por ahora:
   * - demos vencidos;
   * - restaurantes sin plan;
   * - próximas a vencer.
   *
   * Esas alertas requieren filtros específicos que todavía no existen.
   */
  if (
    system === "clicmenu" ||
    system === "clicmenuapp"
  ) {
    if (
      isDemo ||
      (isRestaurant && withoutActivePlan) ||
      isUpcoming
    ) {
      return null;
    }

    if (
      isPlanOrSubscription &&
      isExpired
    ) {
      return {
        system: "clicmenu",
        filter: "vencidas",
      };
    }

    if (
      isPlanOrSubscription &&
      isActive
    ) {
      return {
        system: "clicmenu",
        filter: "activas",
      };
    }

    return null;
  }

  /*
   * MI TIENDA
   *
   * Filtros existentes:
   * todas | activas | vencidas |
   * demo_activo | demo_vencido |
   * plan_activo | plan_vencido
   *
   * Una alerta de "próximos a vencer" no se redirige a "activos",
   * porque ese filtro mostraría registros adicionales que no forman
   * parte exacta de la advertencia.
   */
  if (
    system === "mitienda" ||
    system === "mitiendaenlineamx" ||
    system === "mtelmx"
  ) {
    if (isUpcoming) {
      return null;
    }

    if (isDemo && isExpired) {
      return {
        system: "mitienda",
        filter: "demo_vencido",
      };
    }

    if (isDemo && isActive) {
      return {
        system: "mitienda",
        filter: "demo_activo",
      };
    }

    if (
      isPlanOrSubscription &&
      isExpired
    ) {
      return {
        system: "mitienda",
        filter: "plan_vencido",
      };
    }

    if (
      isPlanOrSubscription &&
      isActive
    ) {
      return {
        system: "mitienda",
        filter: "plan_activo",
      };
    }

    if (isExpired) {
      return {
        system: "mitienda",
        filter: "vencidas",
      };
    }

    if (isActive) {
      return {
        system: "mitienda",
        filter: "activas",
      };
    }

    return null;
  }

  return null;
}

function taecontaVisibleText(
  value: string | null | undefined
): string {
  return String(value ?? "")
    .replace(/Empresas TAECONTA/gi, "Cuentas TAECONTA")
    .replace(/empresa\(s\)/gi, "cuenta(s)")
    .replace(/empresas/gi, "cuentas");
}

function alertSeverity(
  severity: string
): "error" | "warning" | "success" | "info" {
  const normalized = String(severity || "").toLowerCase();

  if (
    normalized.includes("critical") ||
    normalized.includes("danger") ||
    normalized.includes("error")
  ) {
    return "error";
  }

  if (normalized.includes("warning") || normalized.includes("warn")) {
    return "warning";
  }

  if (normalized.includes("success") || normalized.includes("ok")) {
    return "success";
  }

  return "info";
}

export default function Dashboard({ darkMode, setView }: Props) {
  const navigate = useNavigate();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [autoSyncInfo, setAutoSyncInfo] = useState<AutoSyncInfo | null>(null);

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

  const abrirClicMenuDesdeAlerta = (
    filtro: ClicMenuAlertaFiltro
  ) => {
    sessionStorage.setItem(
      "clicmenu_metricas_filtro",
      filtro
    );

    sessionStorage.setItem(
      "clicmenu_metricas_focus",
      "1"
    );

    localStorage.setItem(
      "superadmin_view",
      "clicmenu"
    );

    if (setView) {
      setView("clicmenu");
      return;
    }

    /*
     * Fallback de compatibilidad:
     * si Dashboard todavía fue montado sin setView desde panel.tsx,
     * recargamos /superadmin/ para que el Shell lea superadmin_view.
     */
    window.location.assign(
      "/superadmin/"
    );
  };

  const abrirMiTiendaDesdeAlerta = (
    filtro: MiTiendaAlertaFiltro
  ) => {
    sessionStorage.setItem(
      "mitienda_filtro_tiendas",
      filtro
    );

    localStorage.setItem(
      "superadmin_view",
      "mitienda-tiendas"
    );

    if (setView) {
      setView("mitienda-tiendas");
      return;
    }

    window.location.assign(
      "/superadmin/"
    );
  };

  const ejecutarAlerta = (
    action: DashboardAlertAction
  ) => {
    if (action.system === "taeconta") {
      abrirCuentasTaeconta(
        action.filter
      );
      return;
    }

    if (action.system === "clicmenu") {
      abrirClicMenuDesdeAlerta(
        action.filter
      );
      return;
    }

    abrirMiTiendaDesdeAlerta(
      action.filter
    );
  };

  const fetchDashboard = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
          setError(null);
        }

        const token = getAuthToken();
        const headers = {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        /*
         * GeneralMetricsController ya contiene la regla de auto-sync
         * oportunista de TAECONTA (5 minutos). Esta llamada la activa
         * también cuando el usuario está únicamente en el Dashboard.
         *
         * Si TAECONTA no necesita sincronización, el backend reutiliza
         * el snapshot local y no consulta nuevamente al sistema origen.
         */
        try {
          const autoResponse = await fetch(
            `${API_BASE_URL}/superadmin/metricas-generales?year=${currentYear}&month=${currentMonth}&system=taeconta`,
            {
              method: "GET",
              headers,
            }
          );

          if (autoResponse.ok) {
            const autoJson = await autoResponse.json();
            setAutoSyncInfo(autoJson?.auto_sync || null);
          }
        } catch {
          // El Dashboard continúa usando el último snapshot local disponible.
        }

        const response = await fetch(
          `${API_BASE_URL}/superadmin/dashboard?year=${currentYear}&month=${currentMonth}&system=all`,
          {
            method: "GET",
            headers,
          }
        );

        const json = await response.json();

        if (!response.ok || !json?.success || !json?.data) {
          throw new Error(
            json?.message || "La respuesta del Dashboard no fue válida."
          );
        }

        setDashboard(json);
      } catch (err: any) {
        if (!silent) {
          setError(err?.message || "No fue posible cargar el Dashboard.");
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [currentYear, currentMonth]
  );

  const syncDashboard = useCallback(async () => {
    try {
      setSyncing(true);
      setError(null);

      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/superadmin/metrics/sync`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          system: "all",
          year: currentYear,
          month: currentMonth,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json?.success) {
        throw new Error(json?.message || "No fue posible sincronizar métricas.");
      }

      await fetchDashboard();
    } catch (err: any) {
      setError(err?.message || "No fue posible sincronizar métricas.");
    } finally {
      setSyncing(false);
    }
  }, [currentYear, currentMonth, fetchDashboard]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void fetchDashboard(true);
      }
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, [fetchDashboard]);

  const consolidatedSnapshot = dashboard?.data?.consolidated ?? null;
  const mitiendaSnapshot = dashboard?.data?.systems?.mitienda ?? null;
  const clicmenuSnapshot = dashboard?.data?.systems?.clicmenu ?? null;
  const taecontaSnapshot =
    dashboard?.data?.systems?.taeconta ??
    dashboard?.data?.selected?.find(
      (snapshot) => snapshot.system_key === "taeconta"
    ) ??
    null;

  const alerts = dashboard?.data?.alerts ?? [];

  const actionableAlerts = alerts.reduce<
    Array<{
      alert: DashboardAlert;
      action: DashboardAlertAction;
    }>
  >((items, alert) => {
    const action =
      dashboardAlertAction(alert);

    if (action) {
      items.push({
        alert,
        action,
      });
    }

    return items;
  }, []);

  const logs = dashboard?.data?.sync_logs ?? [];

  const consolidatedKpis = asObject(consolidatedSnapshot?.kpis);
  const consolidatedData = asObject(consolidatedSnapshot?.consolidated);
  const consolidatedCharts = asObject(consolidatedSnapshot?.charts);

  const mitiendaKpis = asObject(mitiendaSnapshot?.kpis);
  const mitiendaSpecific = asObject(mitiendaSnapshot?.specific_metrics);

  const clicmenuKpis = asObject(clicmenuSnapshot?.kpis);
  const clicmenuSpecific = asObject(clicmenuSnapshot?.specific_metrics);

  const taecontaKpis = asObject(taecontaSnapshot?.kpis);
  const taecontaSpecific = asObject(taecontaSnapshot?.specific_metrics);
  const taecontaEmpresas = asObject(taecontaSpecific?.empresas);
  const taecontaCfdi = asObject(taecontaSpecific?.cfdi);
  const taecontaTimbres = asObject(taecontaSpecific?.timbres);

  const totalIngresosPlanes = firstNumber([
    {
      source: consolidatedKpis,
      keys: ["total_ingresos_planes", "total_ingresos", "ingreso_total"],
    },
  ]);

  const totalCuentas = firstNumber([
    { source: consolidatedData, keys: ["total_cuentas"] },
  ]);

  const totalRestaurantes = firstNumber([
    { source: consolidatedData, keys: ["total_restaurantes"] },
  ]);

  const totalPlanesActivos = firstNumber([
    { source: consolidatedData, keys: ["total_planes_activos"] },
    { source: consolidatedKpis, keys: ["planes_activos"] },
  ]);

  const totalPlanesVencidos = firstNumber([
    { source: consolidatedData, keys: ["total_planes_vencidos"] },
    { source: consolidatedKpis, keys: ["planes_vencidos"] },
  ]);

  const proximosVencer7 = firstNumber([
    { source: consolidatedKpis, keys: ["planes_proximos_vencer_7"] },
  ]);

  const renovacionesMes = firstNumber([
    { source: consolidatedData, keys: ["total_renovaciones"] },
    { source: consolidatedKpis, keys: ["renovaciones_mes"] },
  ]);

  const tasaRenovacion = firstNumber([
    { source: consolidatedData, keys: ["tasa_renovacion_general"] },
    { source: consolidatedKpis, keys: ["tasa_renovacion"] },
  ]);

  const ventasMitiendaMes =
    monthlyValue(consolidatedCharts, "mitienda", currentYear, currentMonth) ||
    firstNumber([
      {
        source: mitiendaKpis,
        keys: [
          "ingresos_periodo_actual",
          "ventas_mes",
          "ingresos_mes",
        ],
      },
    ]);

  const ventasClicMenuMes =
    monthlyValue(consolidatedCharts, "clicmenu", currentYear, currentMonth) ||
    firstNumber([
      {
        source: clicmenuKpis,
        keys: [
          "ingresos_periodo_actual",
          "ventas_mes",
          "ingresos_mes",
        ],
      },
    ]);

  const ventasTaecontaMes =
    monthlyValue(consolidatedCharts, "taeconta", currentYear, currentMonth) ||
    firstNumber([
      {
        source: taecontaKpis,
        keys: [
          "ingresos_periodo_actual",
          "ventas_mes",
          "ingresos_mes",
        ],
      },
      {
        source: consolidatedKpis,
        keys: ["taeconta_ingresos_periodo"],
      },
    ]);

  const ventasMitiendaAnual =
    annualValue(
      consolidatedCharts,
      "mitienda",
      currentYear,
      currentMonth
    ) ||
    firstNumber([
      {
        source: mitiendaKpis,
        keys: [
          "total_ingresos_planes",
          "total_ingresos",
          "ingreso_total",
        ],
      },
    ]);

  const ventasClicMenuAnual =
    annualValue(
      consolidatedCharts,
      "clicmenu",
      currentYear,
      currentMonth
    ) ||
    firstNumber([
      {
        source: clicmenuKpis,
        keys: [
          "total_ingresos_planes",
          "total_ingresos",
          "ingreso_total",
        ],
      },
    ]);

  const ventasTaecontaAnual =
    annualValue(
      consolidatedCharts,
      "taeconta",
      currentYear,
      currentMonth
    ) ||
    firstNumber([
      {
        source: taecontaKpis,
        keys: [
          "total_ingresos_planes",
          "total_ingresos",
          "ventas_anio",
        ],
      },
      {
        source: consolidatedKpis,
        keys: ["taeconta_ingresos_anuales"],
      },
    ]);

  const incomeBySystem = [
    {
      key: "mitienda",
      name: "MiTiendaEnLineaMx",
      value:
        chartIncomeBySystem(consolidatedCharts, [
          "mitienda",
          "mi tienda",
          "mitiendaenlineamx",
        ]) || ventasMitiendaAnual,
    },
    {
      key: "clicmenu",
      name: "Clic Menú",
      value:
        chartIncomeBySystem(consolidatedCharts, [
          "clicmenu",
          "clic menu",
          "clic menú",
        ]) || ventasClicMenuAnual,
    },
    {
      key: "taeconta",
      name: "TAECONTA",
      value:
        chartIncomeBySystem(consolidatedCharts, [
          "taeconta",
          "tae conta",
        ]) || ventasTaecontaAnual,
    },
  ];

  const monthLabels = [
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

  const monthlyMitienda = monthlySeries(
    consolidatedCharts,
    "mitienda",
    currentYear
  ).slice(0, currentMonth);

  const monthlyClicMenu = monthlySeries(
    consolidatedCharts,
    "clicmenu",
    currentYear
  ).slice(0, currentMonth);

  const monthlyTaeconta = monthlySeries(
    consolidatedCharts,
    "taeconta",
    currentYear
  ).slice(0, currentMonth);

  const monthlyComparison = Array.from(
    { length: currentMonth },
    (_, index) => ({
      month: monthLabels[index],
      mitienda: Number(monthlyMitienda[index] || 0),
      clicmenu: Number(monthlyClicMenu[index] || 0),
      taeconta: Number(monthlyTaeconta[index] || 0),
    })
  );

  const maxMonthlyIncome = Math.max(
    ...monthlyComparison.flatMap((item) => [
      item.mitienda,
      item.clicmenu,
      item.taeconta,
    ]),
    1
  );

  const maxIncome = Math.max(...incomeBySystem.map((item) => item.value), 1);

  const clicmenuRestaurantes =
    firstNumber([
      { source: clicmenuSpecific, keys: ["restaurantes_registrados"] },
      { source: consolidatedData, keys: ["total_restaurantes"] },
    ]) || 0;

  const clicmenuRestaurantesActivos = firstNumber([
    {
      source: clicmenuSpecific,
      keys: ["restaurantes_con_plan_activo", "restaurantes_activos"],
    },
  ]);

  const promedioRestaurantesCuenta = firstNumber([
    {
      source: clicmenuSpecific,
      keys: [
        "promedio_restaurantes_por_cuenta",
        "promedio_restaurantes_cuenta",
      ],
    },
  ]);

  const mitiendaMrr = firstNumber([
    { source: mitiendaSpecific, keys: ["mrr", "monthly_recurring_revenue"] },
  ]);

  const mitiendaAntiguedad = firstNumber([
    {
      source: mitiendaSpecific,
      keys: ["antiguedad_promedio", "antiguedad_promedio_dias"],
    },
  ]);

  const mitiendaPlanesActivos = firstNumber([
    { source: mitiendaKpis, keys: ["planes_activos", "total_planes_activos"] },
  ]);

  const mitiendaPlanesVencidos = firstNumber([
    { source: mitiendaKpis, keys: ["planes_vencidos", "total_planes_vencidos"] },
  ]);

  const clicmenuPlanesActivos = firstNumber([
    { source: clicmenuKpis, keys: ["planes_activos", "total_planes_activos"] },
  ]);

  const clicmenuPlanesVencidos = firstNumber([
    { source: clicmenuKpis, keys: ["planes_vencidos", "total_planes_vencidos"] },
  ]);

  const taecontaEmpresasTotal = firstNumber([
    { source: taecontaEmpresas, keys: ["total"] },
    { source: taecontaKpis, keys: ["empresas_total"] },
    { source: consolidatedKpis, keys: ["taeconta_empresas_total"] },
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

  const taecontaOperacionesMes = firstNumber([
    { source: taecontaKpis, keys: ["operaciones_mes"] },
    { source: consolidatedKpis, keys: ["taeconta_operaciones_mes"] },
  ]);

  const taecontaTicketPromedio = firstNumber([
    { source: taecontaKpis, keys: ["ticket_promedio_mes"] },
    { source: consolidatedKpis, keys: ["taeconta_ticket_promedio_mes"] },
  ]);

  const taecontaCfdiTimbrados = firstNumber([
    { source: taecontaCfdi, keys: ["timbrados"] },
    { source: taecontaKpis, keys: ["cfdi_timbrados_total"] },
    { source: consolidatedKpis, keys: ["taeconta_cfdi_timbrados_total"] },
  ]);

  const taecontaCfdiCancelados = firstNumber([
    { source: taecontaCfdi, keys: ["cancelados"] },
    { source: taecontaKpis, keys: ["cfdi_cancelados_total"] },
    { source: consolidatedKpis, keys: ["taeconta_cfdi_cancelados_total"] },
  ]);

  const taecontaTimbresPac = firstNumber([
    { source: taecontaTimbres, keys: ["pac"] },
    { source: taecontaKpis, keys: ["timbres_pac"] },
    { source: consolidatedKpis, keys: ["taeconta_timbres_pac"] },
  ]);

  const taecontaTimbresAsignados = firstNumber([
    { source: taecontaTimbres, keys: ["asignados"] },
    { source: taecontaKpis, keys: ["timbres_asignados"] },
    { source: consolidatedKpis, keys: ["taeconta_timbres_asignados"] },
  ]);

  const taecontaTimbresDisponibles = firstNumber([
    { source: taecontaTimbres, keys: ["disponibles"] },
    { source: taecontaKpis, keys: ["timbres_disponibles"] },
    { source: consolidatedKpis, keys: ["taeconta_timbres_disponibles"] },
  ]);

  const metrics = [
    {
      title: "Ingresos consolidados",
      value: formatMoney(totalIngresosPlanes),
      icon: <MonetizationOn />,
    },
    {
      title: "Cuentas totales",
      value: formatNumber(totalCuentas),
      icon: <People />,
    },
    {
      title: "Restaurantes",
      value: formatNumber(totalRestaurantes),
      icon: <Restaurant />,
    },
    {
      title: "Planes activos",
      value: formatNumber(totalPlanesActivos),
      icon: <CheckCircle />,
    },
    {
      title: "Planes vencidos",
      value: formatNumber(totalPlanesVencidos),
      icon: <WarningAmber />,
    },
    {
      title: "Próximos 7 días",
      value: formatNumber(proximosVencer7),
      icon: <ReceiptLong />,
    },
    {
      title: "Renovaciones del mes",
      value: formatNumber(renovacionesMes),
      icon: <TrendingUp />,
    },
    {
      title: "Tasa de renovación",
      value: formatPercent(tasaRenovacion),
      icon: <AutoGraph />,
    },
  ];

  return (
    <>
      <GlobalStyles
        styles={(theme) => ({
          "*": {
            scrollbarWidth: "thin",
            scrollbarColor:
              theme.palette.mode === "dark"
                ? "#334155 transparent"
                : "#CBD5E1 transparent",
          },
          "*::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "*::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "*::-webkit-scrollbar-thumb": {
            backgroundColor:
              theme.palette.mode === "dark" ? "#334155" : "#CBD5E1",
            borderRadius: "10px",
            border: "2px solid transparent",
            backgroundClip: "padding-box",
          },
          "*::-webkit-scrollbar-thumb:hover": {
            backgroundColor:
              theme.palette.mode === "dark" ? "#475569" : "#94A3B8",
          },
          body: {
            overflowX: "hidden",
            backgroundColor: theme.palette.background.default,
          },
          "#root": {
            minHeight: "100vh",
            backgroundColor: theme.palette.background.default,
          },
        })}
      />

      <Box
        sx={(theme) => ({
          width: "100%",
          minHeight: "100vh",
          overflowX: "hidden",
          bgcolor: theme.palette.background.default,
          color: theme.palette.text.primary,
        })}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            mb: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                background: "linear-gradient(135deg,#1577CE,#C77B1C)",
              }}
            >
              <AdminPanelSettings />
            </Avatar>

            <Box>
              <Typography variant="h4" fontWeight={800}>
                Panel SuperAdministrador
              </Typography>

              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Resumen ejecutivo consolidado de MiTiendaEnLineaMx, Clic Menú y TAECONTA.
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Periodo: {currentPeriod(currentYear, currentMonth)} · Última
                sincronización: {consolidatedSnapshot?.synced_at || "Sin registro"}
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => fetchDashboard()}
              disabled={loading || syncing}
            >
              Recargar
            </Button>

            <Button
              variant="contained"
              startIcon={
                syncing ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <Refresh />
                )
              }
              onClick={syncDashboard}
              disabled={loading || syncing}
            >
              {syncing ? "Sincronizando" : "Sincronizar"}
            </Button>
          </Stack>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {autoSyncInfo?.enabled && (
          <Alert severity="info" sx={{ mb: 3 }}>
            TAECONTA tiene actualización automática cada{" "}
            {autoSyncInfo.interval_minutes} minutos al consultar el Dashboard.
            {autoSyncInfo.refreshed
              ? " Los datos se actualizaron automáticamente en esta consulta."
              : ""}
          </Alert>
        )}

        {loading ? (
          <Card
            sx={(theme) => ({
              borderRadius: 4,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.background.paper,
            })}
          >
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <CircularProgress size={24} />
                <Typography>Cargando métricas locales...</Typography>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <>
            <Grid container spacing={3}>
              {metrics.map((item) => (
                <Grid item xs={12} sm={6} md={3} key={item.title}>
                  <Card
                    sx={(theme) => ({
                      height: "100%",
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 4,
                      boxShadow: darkMode
                        ? "0 16px 40px rgba(0,0,0,.35)"
                        : "0 14px 35px rgba(15,23,42,.08)",
                    })}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={700}
                        >
                          {item.title}
                        </Typography>

                        <Avatar
                          sx={(theme) => ({
                            width: 38,
                            height: 38,
                            backgroundColor: theme.palette.action.hover,
                            color: theme.palette.primary.main,
                          })}
                        >
                          {item.icon}
                        </Avatar>
                      </Box>

                      <Typography variant="h4" fontWeight={900}>
                        {item.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Card
              sx={(theme) => ({
                mt: 3,
                overflow: "hidden",
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 4,
                boxShadow: darkMode
                  ? "0 18px 45px rgba(0,0,0,.28)"
                  : "0 16px 40px rgba(15,23,42,.07)",
              })}
            >
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                  spacing={2}
                  mb={3}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar
                      sx={(theme) => ({
                        width: 42,
                        height: 42,
                        backgroundColor: theme.palette.action.hover,
                        color: theme.palette.primary.main,
                      })}
                    >
                      <TrendingUp />
                    </Avatar>

                    <Box>
                      <Typography variant="h6" fontWeight={900}>
                        Evolución mensual de ingresos
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Comparativo de ingresos por planes hasta el mes actual.
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <Chip
                      size="small"
                      label="MiTiendaEnLineaMx"
                      sx={(theme) => ({
                        fontWeight: 800,
                        color: theme.palette.success.main,
                        borderColor: theme.palette.success.main,
                      })}
                      variant="outlined"
                    />
                    <Chip
                      size="small"
                      label="Clic Menú"
                      sx={(theme) => ({
                        fontWeight: 800,
                        color: theme.palette.warning.main,
                        borderColor: theme.palette.warning.main,
                      })}
                      variant="outlined"
                    />
                    <Chip
                      size="small"
                      label="TAECONTA"
                      sx={(theme) => ({
                        fontWeight: 800,
                        color: theme.palette.primary.main,
                        borderColor: theme.palette.primary.main,
                      })}
                      variant="outlined"
                    />
                  </Stack>
                </Stack>

                <Box
                  sx={{
                    overflowX: "auto",
                    pb: 1,
                  }}
                >
                  <Box
                    sx={{
                      minWidth: Math.max(currentMonth * 96, 680),
                      height: 290,
                      display: "flex",
                      alignItems: "flex-end",
                      gap: 1.5,
                      px: 1,
                      pt: 2,
                      borderBottom: (theme) =>
                        `1px solid ${theme.palette.divider}`,
                      background: (theme) =>
                        `linear-gradient(to top, ${theme.palette.action.hover}, transparent 42%)`,
                    }}
                  >
                    {monthlyComparison.map((item) => {
                      const mitiendaHeight = Math.max(
                        (item.mitienda / maxMonthlyIncome) * 210,
                        item.mitienda > 0 ? 8 : 2
                      );
                      const clicmenuHeight = Math.max(
                        (item.clicmenu / maxMonthlyIncome) * 210,
                        item.clicmenu > 0 ? 8 : 2
                      );
                      const taecontaHeight = Math.max(
                        (item.taeconta / maxMonthlyIncome) * 210,
                        item.taeconta > 0 ? 8 : 2
                      );

                      return (
                        <Box
                          key={item.month}
                          sx={{
                            flex: 1,
                            minWidth: 78,
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-end",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={700}
                            sx={{ mb: 1 }}
                          >
                            {formatMoney(
                              item.mitienda + item.clicmenu + item.taeconta
                            )}
                          </Typography>

                          <Box
                            sx={{
                              height: 215,
                              width: "100%",
                              display: "flex",
                              alignItems: "flex-end",
                              justifyContent: "center",
                              gap: 0.8,
                            }}
                          >
                            <Tooltip
                              arrow
                              title={`MiTiendaEnLineaMx: ${formatMoney(
                                item.mitienda
                              )}`}
                            >
                              <Box
                                sx={(theme) => ({
                                  width: 24,
                                  height: mitiendaHeight,
                                  borderRadius: "8px 8px 2px 2px",
                                  bgcolor: theme.palette.success.main,
                                  opacity: item.mitienda > 0 ? 1 : 0.18,
                                  transition: "height .25s ease",
                                })}
                              />
                            </Tooltip>

                            <Tooltip
                              arrow
                              title={`Clic Menú: ${formatMoney(
                                item.clicmenu
                              )}`}
                            >
                              <Box
                                sx={(theme) => ({
                                  width: 24,
                                  height: clicmenuHeight,
                                  borderRadius: "8px 8px 2px 2px",
                                  bgcolor: theme.palette.warning.main,
                                  opacity: item.clicmenu > 0 ? 1 : 0.18,
                                  transition: "height .25s ease",
                                })}
                              />
                            </Tooltip>

                            <Tooltip
                              arrow
                              title={`TAECONTA: ${formatMoney(
                                item.taeconta
                              )}`}
                            >
                              <Box
                                sx={(theme) => ({
                                  width: 24,
                                  height: taecontaHeight,
                                  borderRadius: "8px 8px 2px 2px",
                                  bgcolor: theme.palette.primary.main,
                                  opacity: item.taeconta > 0 ? 1 : 0.18,
                                  transition: "height .25s ease",
                                })}
                              />
                            </Tooltip>
                          </Box>

                          <Typography fontWeight={900} sx={{ mt: 1 }}>
                            {item.month}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={8}>
                <Card
                  sx={(theme) => ({
                    height: "100%",
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 4,
                  })}
                >
                  <CardContent>
                    <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                      <Avatar
                        sx={(theme) => ({
                          width: 38,
                          height: 38,
                          backgroundColor: theme.palette.action.hover,
                          color: theme.palette.primary.main,
                        })}
                      >
                        <AutoGraph />
                      </Avatar>

                      <Box>
                        <Typography variant="h6" fontWeight={800}>
                          Ingresos por sistema
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Ingresos por planes del periodo sincronizado.
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack spacing={2}>
                      {incomeBySystem.map((item) => {
                        const percent = Math.min(
                          (item.value / maxIncome) * 100,
                          100
                        );

                        return (
                          <Box key={item.key}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mb: 0.8,
                              }}
                            >
                              <Typography fontWeight={800}>{item.name}</Typography>
                              <Typography fontWeight={900}>
                                {formatMoney(item.value)}
                              </Typography>
                            </Box>

                            <LinearProgress
                              variant="determinate"
                              value={percent}
                              sx={(theme) => {
                                const barColor =
                                  item.key === "mitienda"
                                    ? theme.palette.success.main
                                    : item.key === "taeconta"
                                      ? theme.palette.primary.main
                                      : theme.palette.warning.main;

                                return {
                                  height: 10,
                                  borderRadius: 10,
                                  bgcolor:
                                    item.key === "mitienda"
                                      ? theme.palette.success.light
                                      : item.key === "taeconta"
                                        ? theme.palette.primary.light
                                        : theme.palette.warning.light,
                                  "& .MuiLinearProgress-bar": {
                                    borderRadius: 10,
                                    backgroundColor: barColor,
                                  },
                                };
                              }}
                            />
                          </Box>
                        );
                      })}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card
                  sx={(theme) => ({
                    height: "100%",
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 4,
                  })}
                >
                  <CardContent>
                    <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                      <Avatar
                        sx={(theme) => ({
                          width: 38,
                          height: 38,
                          backgroundColor: theme.palette.action.hover,
                          color: theme.palette.warning.main,
                        })}
                      >
                        <WarningAmber />
                      </Avatar>

                      <Box>
                        <Typography variant="h6" fontWeight={800}>
                          Alertas activas
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Vencimientos y riesgos detectados.
                        </Typography>
                      </Box>
                    </Stack>

                    {actionableAlerts.length === 0 ? (
                      <Box
                        sx={(theme) => ({
                          p: 2,
                          borderRadius: 3,
                          border: `1px dashed ${theme.palette.divider}`,
                          bgcolor: theme.palette.action.hover,
                        })}
                      >
                        <Typography
                          fontWeight={800}
                          fontSize={13}
                        >
                          No hay alertas accionables.
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          mt={0.4}
                        >
                          Solo se muestran advertencias que pueden abrir
                          directamente una vista con el filtro correspondiente.
                        </Typography>
                      </Box>
                    ) : (
                      <Stack
                        spacing={1.5}
                        sx={(theme) => ({
                          maxHeight: {
                            xs: 360,
                            sm: 420,
                          },
                          overflowY: "auto",
                          pr: 0.5,
                          scrollbarWidth: "thin",
                          scrollbarColor:
                            theme.palette.mode === "dark"
                              ? "#475569 transparent"
                              : "#94A3B8 transparent",
                          "&::-webkit-scrollbar": {
                            width: 8,
                          },
                          "&::-webkit-scrollbar-track": {
                            background: "transparent",
                          },
                          "&::-webkit-scrollbar-thumb": {
                            backgroundColor:
                              theme.palette.mode === "dark"
                                ? "#475569"
                                : "#94A3B8",
                            borderRadius: 8,
                            border: "2px solid transparent",
                            backgroundClip: "padding-box",
                          },
                          "&::-webkit-scrollbar-thumb:hover": {
                            backgroundColor:
                              theme.palette.mode === "dark"
                                ? "#64748B"
                                : "#64748B",
                          },
                        })}
                      >
                        {actionableAlerts.map(
                          ({
                            alert,
                            action,
                          }) => {
                            const isTaeconta =
                              action.system ===
                              "taeconta";

                            const actionLabel =
                              action.system ===
                              "taeconta"
                                ? "Ver cuentas"
                                : action.system ===
                                    "clicmenu"
                                  ? "Ver suscripciones"
                                  : "Ver tiendas";

                            return (
                              <Alert
                                key={alert.id}
                                severity={alertSeverity(
                                  alert.severity
                                )}
                                variant="outlined"
                                role="button"
                                tabIndex={0}
                                onClick={() =>
                                  ejecutarAlerta(
                                    action
                                  )
                                }
                                onKeyDown={(
                                  event
                                ) => {
                                  if (
                                    event.key ===
                                      "Enter" ||
                                    event.key ===
                                      " "
                                  ) {
                                    event.preventDefault();

                                    ejecutarAlerta(
                                      action
                                    );
                                  }
                                }}
                                sx={(theme) => ({
                                  cursor:
                                    "pointer",
                                  borderRadius: 3,
                                  transition:
                                    "transform .18s ease, box-shadow .18s ease, background-color .18s ease",
                                  "&:hover": {
                                    transform:
                                      "translateY(-2px)",
                                    bgcolor:
                                      theme.palette
                                        .action.hover,
                                    boxShadow:
                                      theme.palette
                                        .mode ===
                                      "dark"
                                        ? "0 8px 20px rgba(0,0,0,.24)"
                                        : "0 8px 20px rgba(15,23,42,.10)",
                                  },
                                  "&:focus-visible":
                                    {
                                      outline:
                                        `2px solid ${theme.palette.primary.main}`,
                                      outlineOffset:
                                        2,
                                    },
                                })}
                              >
                                <Typography
                                  fontWeight={800}
                                  fontSize={13}
                                >
                                  {isTaeconta
                                    ? taecontaVisibleText(
                                        alert.title
                                      )
                                    : alert.title}
                                </Typography>

                                {alert.message && (
                                  <Typography
                                    fontSize={12}
                                    sx={{
                                      mt: 0.35,
                                    }}
                                  >
                                    {isTaeconta
                                      ? taecontaVisibleText(
                                          alert.message
                                        )
                                      : alert.message}
                                  </Typography>
                                )}

                                <Typography
                                  variant="caption"
                                  color="primary.main"
                                  fontWeight={900}
                                  display="block"
                                  mt={0.75}
                                >
                                  {actionLabel} →
                                </Typography>
                              </Alert>
                            );
                          }
                        )}
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <Card
                  sx={(theme) => ({
                    height: "100%",
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 4,
                  })}
                >
                  <CardContent>
                    <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                      <Avatar
                        sx={(theme) => ({
                          width: 38,
                          height: 38,
                          backgroundColor: theme.palette.action.hover,
                          color: theme.palette.success.main,
                        })}
                      >
                        <Storefront />
                      </Avatar>

                      <Box>
                        <Typography variant="h6" fontWeight={800}>
                          MiTiendaEnLineaMx
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Snapshot ID: {mitiendaSnapshot?.id || "N/A"} ·{" "}
                          {mitiendaSnapshot?.status || "sin datos"}
                        </Typography>
                      </Box>
                    </Stack>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography color="text.secondary" variant="body2">
                          Ventas del mes
                        </Typography>
                        <Typography fontWeight={900}>
                          {formatMoney(ventasMitiendaMes)}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography color="text.secondary" variant="body2">
                          Ventas del año
                        </Typography>
                        <Typography fontWeight={900}>
                          {formatMoney(ventasMitiendaAnual)}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography color="text.secondary" variant="body2">
                          Planes activos
                        </Typography>
                        <Typography fontWeight={900}>
                          {formatNumber(mitiendaPlanesActivos)}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography color="text.secondary" variant="body2">
                          Planes vencidos
                        </Typography>
                        <Typography fontWeight={900}>
                          {formatNumber(mitiendaPlanesVencidos)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card
                  sx={(theme) => ({
                    height: "100%",
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 4,
                  })}
                >
                  <CardContent>
                    <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                      <Avatar
                        sx={(theme) => ({
                          width: 38,
                          height: 38,
                          backgroundColor: theme.palette.action.hover,
                          color: theme.palette.warning.main,
                        })}
                      >
                        <Restaurant />
                      </Avatar>

                      <Box>
                        <Typography variant="h6" fontWeight={800}>
                          Clic Menú
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Snapshot ID: {clicmenuSnapshot?.id || "N/A"} ·{" "}
                          {clicmenuSnapshot?.status || "sin datos"}
                        </Typography>
                      </Box>
                    </Stack>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography color="text.secondary" variant="body2">
                          Ventas del mes
                        </Typography>
                        <Typography fontWeight={900}>
                          {formatMoney(ventasClicMenuMes)}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography color="text.secondary" variant="body2">
                          Ventas del año
                        </Typography>
                        <Typography fontWeight={900}>
                          {formatMoney(ventasClicMenuAnual)}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography color="text.secondary" variant="body2">
                          Planes activos
                        </Typography>
                        <Typography fontWeight={900}>
                          {formatNumber(clicmenuPlanesActivos)}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography color="text.secondary" variant="body2">
                          Planes vencidos
                        </Typography>
                        <Typography fontWeight={900}>
                          {formatNumber(clicmenuPlanesVencidos)}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography color="text.secondary" variant="body2">
                          Restaurantes
                        </Typography>
                        <Typography fontWeight={900}>
                          {formatNumber(clicmenuRestaurantes)}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography color="text.secondary" variant="body2">
                          Restaurantes activos
                        </Typography>
                        <Typography fontWeight={900}>
                          {formatNumber(clicmenuRestaurantesActivos)}
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <Typography color="text.secondary" variant="body2">
                          Promedio restaurantes por cuenta
                        </Typography>
                        <Typography fontWeight={900}>
                          {formatNumber(promedioRestaurantesCuenta)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card
                  sx={(theme) => ({
                    height: "100%",
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 4,
                  })}
                >
                  <CardContent>
                    <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                      <Avatar
                        sx={(theme) => ({
                          width: 38,
                          height: 38,
                          backgroundColor: theme.palette.action.hover,
                          color: theme.palette.primary.main,
                        })}
                      >
                        <ReceiptLong />
                      </Avatar>

                      <Box>
                        <Typography variant="h6" fontWeight={800}>
                          TAECONTA
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Snapshot ID: {taecontaSnapshot?.id || "N/A"} ·{" "}
                          {taecontaSnapshot?.status || "sin datos"}
                        </Typography>
                      </Box>
                    </Stack>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography color="text.secondary" variant="body2">
                          Ventas del mes
                        </Typography>
                        <Typography fontWeight={900}>
                          {formatMoney(ventasTaecontaMes)}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography color="text.secondary" variant="body2">
                          Ventas del año
                        </Typography>
                        <Typography fontWeight={900}>
                          {formatMoney(ventasTaecontaAnual)}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography color="text.secondary" variant="body2">
                          Cuentas
                        </Typography>
                        <Typography fontWeight={900}>
                          {formatNumber(taecontaEmpresasTotal)}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography color="text.secondary" variant="body2">
                          Vigentes
                        </Typography>
                        <Typography fontWeight={900} color="success.main">
                          {formatNumber(taecontaEmpresasVigentes)}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography color="text.secondary" variant="body2">
                          Vencidas
                        </Typography>
                        <Typography fontWeight={900} color="error.main">
                          {formatNumber(taecontaEmpresasVencidas)}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography color="text.secondary" variant="body2">
                          Próx. 30 días
                        </Typography>
                        <Typography fontWeight={900} color="warning.main">
                          {formatNumber(taecontaProximas30)}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography color="text.secondary" variant="body2">
                          Operaciones
                        </Typography>
                        <Typography fontWeight={900}>
                          {formatNumber(taecontaOperacionesMes)}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography color="text.secondary" variant="body2">
                          Ticket promedio
                        </Typography>
                        <Typography fontWeight={900}>
                          {formatMoney(taecontaTicketPromedio)}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography color="text.secondary" variant="body2">
                          CFDI timbrados
                        </Typography>
                        <Typography fontWeight={900}>
                          {formatNumber(taecontaCfdiTimbrados)}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography color="text.secondary" variant="body2">
                          CFDI cancelados
                        </Typography>
                        <Typography fontWeight={900}>
                          {formatNumber(taecontaCfdiCancelados)}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography color="text.secondary" variant="body2">
                          Timbres PAC
                        </Typography>
                        <Typography fontWeight={900}>
                          {formatNumber(taecontaTimbresPac)}
                        </Typography>
                      </Grid>

                      <Grid item xs={6}>
                        <Typography color="text.secondary" variant="body2">
                          Disponibles
                        </Typography>
                        <Typography fontWeight={900} color="success.main">
                          {formatNumber(taecontaTimbresDisponibles)}
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <Typography color="text.secondary" variant="body2">
                          Timbres asignados
                        </Typography>
                        <Typography fontWeight={900}>
                          {formatNumber(taecontaTimbresAsignados)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Card
              sx={(theme) => ({
                mt: 3,
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 4,
              })}
            >
              <CardContent>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                  mb={2}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={800}>
                      Últimas sincronizaciones
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ejecuciones del comando y sincronizaciones manuales.
                    </Typography>
                  </Box>

                  <Chip label={`${logs.length} registros`} variant="outlined" size="small" />
                </Stack>

                <Divider sx={{ mb: 2 }} />

                {logs.length === 0 ? (
                  <Typography color="text.secondary">
                    No hay logs de sincronización.
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {logs.slice(0, 6).map((log) => (
                      <Box
                        key={log.id}
                        sx={(theme) => ({
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 2,
                          p: 1.5,
                          borderRadius: 2,
                          border: `1px solid ${theme.palette.divider}`,
                        })}
                      >
                        <Box>
                          <Typography fontWeight={800}>
                            {log.system_key} ·{" "}
                            {log.period_key ||
                              `${log.year}-${String(log.month).padStart(2, "0")}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Procesados: {formatNumber(log.records_processed)} ·{" "}
                            {log.created_at || "Sin fecha"}
                          </Typography>
                        </Box>

                        <Chip
                          label={log.status}
                          color={log.status === "ok" ? "success" : "default"}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </Box>
    </>
  );
}