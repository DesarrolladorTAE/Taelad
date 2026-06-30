import { useCallback, useEffect, useState } from "react";
import axiosClient from "../../../services/axiosClient";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StorefrontIcon from "@mui/icons-material/Storefront";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import BarChartIcon from "@mui/icons-material/BarChart";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

type Props = {
  setView?: (view: string) => void;
};

type OverviewStats = {
  tiendas: number;
  ventas_planes: number;
  ventas_complementos: number;
};

type TiendaMes = {
  id?: number | string;
  store_id?: number | string;
  nombre?: string | null;
  name?: string | null;
  telefono?: string | null;
  numerotel?: string | null;
  phone_number?: string | null;
  plan?: string | null;
  plan_nombre?: string | null;
  nombre_plan?: string | null;
  fecha_creacion?: string | null;
  created_at?: string | null;
  fecha_vencimiento?: string | null;
  vence?: string | null;
  expires_at?: string | null;
  estado?: string | null;
  is_active?: boolean | null;
};

type TiendaPorVencer = {
  id?: number | string;
  store_id?: number | string;
  nombre?: string | null;
  name?: string | null;
  telefono?: string | null;
  numerotel?: string | null;
  phone_number?: string | null;
  vence?: string | null;
  fecha_vencimiento?: string | null;
  expires_at?: string | null;
  dias_restantes?: number | string | null;
  plan_id?: number | string | null;
  plan_nombre?: string | null;
  plan?: string | null;
  nombre_plan?: string | null;
};

type SerieMes = {
  mes: string;
  total: number;
};

type TopTienda = {
  name?: string | null;
  nombre?: string | null;
  ventas?: number | string | null;
  total?: number | string | null;
};

type DialogType = "tienda-mes" | "tienda-vencer" | null;

const ESTADISTICAS_ENDPOINT = "/superadmin/mitienda/estadisticas";

const EMPTY_OVERVIEW: OverviewStats = {
  tiendas: 0,
  ventas_planes: 0,
  ventas_complementos: 0,
};

function unwrapList<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.resultados)) return data.resultados;
  return [];
}

function normalizeText(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatCurrency(value: number | string | null | undefined) {
  const number = Number(value ?? 0);

  return `$${number.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatNumber(value: number | string | null | undefined) {
  return Number(value ?? 0).toLocaleString("es-MX");
}

function formatDate(value?: string | null) {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatMonth(value?: string | null) {
  if (!value) return "N/A";

  const [year, month] = String(value).split("-");

  if (!year || !month) return value;

  const date = new Date(Number(year), Number(month) - 1, 1);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-MX", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getRequestErrorMessage(error: unknown, fallback: string) {
  const err = error as {
    response?: {
      data?: {
        message?: string;
        errors?: Record<string, string[]>;
      };
    };
    message?: string;
  };

  const errors = err.response?.data?.errors;

  if (errors) {
    const firstError = Object.values(errors).flat()[0];
    if (firstError) return firstError;
  }

  return err.response?.data?.message || err.message || fallback;
}

function getNombreTienda(
  tienda?: TiendaMes | TiendaPorVencer | TopTienda | null
) {
  return tienda?.nombre ?? tienda?.name ?? "Sin nombre";
}

function getTelefonoTienda(tienda?: TiendaMes | TiendaPorVencer | null) {
  return tienda?.telefono ?? tienda?.numerotel ?? tienda?.phone_number ?? "N/A";
}

function getPlanTienda(tienda?: TiendaMes | TiendaPorVencer | null) {
  return (
    tienda?.plan_nombre ??
    tienda?.nombre_plan ??
    tienda?.plan ??
    "Sin plan"
  );
}

function getFechaVencimiento(tienda?: TiendaMes | TiendaPorVencer | null) {
  return tienda?.vence ?? tienda?.fecha_vencimiento ?? tienda?.expires_at ?? null;
}

function getFechaCreacion(tienda?: TiendaMes | null) {
  return tienda?.fecha_creacion ?? tienda?.created_at ?? null;
}

function getTiendaId(tienda?: TiendaMes | TiendaPorVencer | null) {
  return tienda?.store_id ?? tienda?.id ?? null;
}

function getEstadoTienda(tienda: TiendaMes) {
  if (typeof tienda.is_active === "boolean") {
    return tienda.is_active ? "Activa" : "Inactiva";
  }

  return tienda.estado ?? "N/A";
}

function isTiendaActiva(tienda: TiendaMes) {
  if (typeof tienda.is_active === "boolean") return tienda.is_active;

  const estado = normalizeText(tienda.estado);

  return estado === "activa" || estado === "activo";
}

function getDiasRestantes(tienda: TiendaPorVencer) {
  const dias = Number(tienda.dias_restantes ?? 0);

  if (Number.isNaN(dias)) {
    return 0;
  }

  return Math.trunc(dias);
}

function shortLabel(value: string, max = 24) {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}...`;
}

function SimpleBarChart({
  data,
  valueFormatter,
  height = 250,
}: {
  data: SerieMes[];
  valueFormatter?: (value: number) => string;
  height?: number;
}) {
  const maxValue = Math.max(...data.map((item) => Number(item.total || 0)), 1);

  return (
    <Box
      sx={{
        height,
        display: "flex",
        alignItems: "flex-end",
        gap: 1.2,
        px: 1,
        pt: 2,
        overflowX: "auto",
      }}
    >
      {data.map((item) => {
        const value = Number(item.total || 0);
        const percent = Math.max(4, (value / maxValue) * 100);

        return (
          <Tooltip
            key={item.mes}
            title={`${formatMonth(item.mes)}: ${
              valueFormatter ? valueFormatter(value) : formatNumber(value)
            }`}
          >
            <Box
              sx={{
                minWidth: 34,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: `${percent}%`,
                  borderRadius: "8px 8px 0 0",
                  bgcolor: "primary.main",
                  opacity: 0.9,
                }}
              />

              <Typography
                fontSize={11}
                color="text.secondary"
                sx={{
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                  height: 68,
                  whiteSpace: "nowrap",
                }}
              >
                {formatMonth(item.mes)}
              </Typography>
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}

function TopBarChart({ data }: { data: TopTienda[] }) {
  const normalized = data.map((item) => ({
    nombre: getNombreTienda(item),
    total: Number(item.ventas ?? item.total ?? 0),
  }));

  const maxValue = Math.max(...normalized.map((item) => item.total), 1);

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      {normalized.map((item) => {
        const percent = Math.max(4, (item.total / maxValue) * 100);

        return (
          <Box key={item.nombre}>
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography fontWeight={700} fontSize={13}>
                {shortLabel(item.nombre, 32)}
              </Typography>

              <Typography fontWeight={900} fontSize={13}>
                {formatCurrency(item.total)}
              </Typography>
            </Stack>

            <Box
              sx={{
                mt: 0.7,
                height: 14,
                borderRadius: 999,
                bgcolor: "action.hover",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  width: `${percent}%`,
                  height: "100%",
                  bgcolor: "success.main",
                  borderRadius: 999,
                }}
              />
            </Box>
          </Box>
        );
      })}

      {normalized.length === 0 && (
        <Typography color="text.secondary" fontSize={14}>
          Sin información disponible.
        </Typography>
      )}
    </Stack>
  );
}

export default function MiTiendaMetricas({ setView }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [overview, setOverview] = useState<OverviewStats>(EMPTY_OVERVIEW);
  const [tiendasMes, setTiendasMes] = useState<TiendaMes[]>([]);
  const [tiendasPorVencer, setTiendasPorVencer] = useState<TiendaPorVencer[]>(
    []
  );
  const [registrosPorMes, setRegistrosPorMes] = useState<SerieMes[]>([]);
  const [pagosPorMes, setPagosPorMes] = useState<SerieMes[]>([]);
  const [topTiendas, setTopTiendas] = useState<TopTienda[]>([]);
  const [tiendasNuevasTotal, setTiendasNuevasTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [tiendaMesSeleccionada, setTiendaMesSeleccionada] =
    useState<TiendaMes | null>(null);
  const [tiendaVencerSeleccionada, setTiendaVencerSeleccionada] =
    useState<TiendaPorVencer | null>(null);

  const cargarEstadisticas = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        overviewRes,
        tiendasMesRes,
        tiendasPorVencerRes,
        registrosRes,
        pagosRes,
        tiendasNuevasRes,
        topTiendasRes,
      ] = await Promise.allSettled([
        axiosClient.get(`${ESTADISTICAS_ENDPOINT}/overview`),
        axiosClient.get(`${ESTADISTICAS_ENDPOINT}/tiendas-del-mes`),
        axiosClient.get(`${ESTADISTICAS_ENDPOINT}/tiendas-por-vencer`),
        axiosClient.get(`${ESTADISTICAS_ENDPOINT}/registros-por-mes`),
        axiosClient.get(`${ESTADISTICAS_ENDPOINT}/pagos-por-mes`),
        axiosClient.get(`${ESTADISTICAS_ENDPOINT}/tiendas-nuevas`),
        axiosClient.get(`${ESTADISTICAS_ENDPOINT}/top-tiendas`),
      ]);

      let tiendasDelMesData: TiendaMes[] | null = null;

      if (overviewRes.status === "fulfilled") {
        const stats =
          overviewRes.value.data?.stats ??
          overviewRes.value.data?.data?.stats ??
          {};

        setOverview({
          tiendas: Number(stats.tiendas ?? 0),
          ventas_planes: Number(stats.ventas_planes ?? 0),
          ventas_complementos: Number(stats.ventas_complementos ?? 0),
        });
      }

      if (tiendasMesRes.status === "fulfilled") {
        tiendasDelMesData = unwrapList<TiendaMes>(tiendasMesRes.value.data);
        setTiendasMes(tiendasDelMesData);
      }

      if (tiendasPorVencerRes.status === "fulfilled") {
        setTiendasPorVencer(
          unwrapList<TiendaPorVencer>(tiendasPorVencerRes.value.data)
        );
      }

      if (registrosRes.status === "fulfilled") {
        setRegistrosPorMes(unwrapList<SerieMes>(registrosRes.value.data));
      }

      if (pagosRes.status === "fulfilled") {
        setPagosPorMes(unwrapList<SerieMes>(pagosRes.value.data));
      }

      if (tiendasNuevasRes.status === "fulfilled") {
        setTiendasNuevasTotal(
          Number(
            tiendasNuevasRes.value.data?.total ??
              tiendasDelMesData?.length ??
              0
          )
        );
      } else if (tiendasDelMesData) {
        setTiendasNuevasTotal(tiendasDelMesData.length);
      }

      if (topTiendasRes.status === "fulfilled") {
        setTopTiendas(unwrapList<TopTienda>(topTiendasRes.value.data));
      }

      const failedRequest = [
        overviewRes,
        tiendasMesRes,
        tiendasPorVencerRes,
        registrosRes,
        pagosRes,
        tiendasNuevasRes,
        topTiendasRes,
      ].find((result) => result.status === "rejected");

      if (failedRequest) {
        setError(
          "Algunas estadísticas no se pudieron actualizar. Se conservan los últimos datos cargados."
        );
      }
    } catch (err) {
      console.error("Error cargando estadísticas:", err);

      setError(
        getRequestErrorMessage(
          err,
          "No fue posible cargar las estadísticas de Mi Tienda."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  const abrirDetalleTiendaMes = (tienda: TiendaMes) => {
    setTiendaMesSeleccionada(tienda);
    setTiendaVencerSeleccionada(null);
    setDialogType("tienda-mes");
  };

  const abrirDetalleTiendaVencer = (tienda: TiendaPorVencer) => {
    setTiendaVencerSeleccionada(tienda);
    setTiendaMesSeleccionada(null);
    setDialogType("tienda-vencer");
  };

  const cerrarDetalle = () => {
    setDialogType(null);
    setTiendaMesSeleccionada(null);
    setTiendaVencerSeleccionada(null);
  };

  const notificarTiendas = async (tienda?: TiendaPorVencer | null) => {
    const storeId = getTiendaId(tienda);

    setSending(true);
    setError("");
    setSuccess("");

    try {
      const response = await axiosClient.post(
        `${ESTADISTICAS_ENDPOINT}/notificar-tiendas-por-vencer`,
        storeId ? { store_id: storeId } : {}
      );

      const resultados = response.data?.resultados ?? [];

      const errores = resultados.filter((item: any) => {
        const estado = String(item?.estado ?? "").toLowerCase();

        return (
          estado.includes("error") ||
          estado.includes("no configurado") ||
          estado.includes("sin teléfono")
        );
      });

      if (errores.length > 0) {
        setError(
          tienda
            ? errores[0]?.estado || "No fue posible enviar el WhatsApp."
            : `Algunas tiendas no pudieron notificarse: ${errores.length}`
        );
      } else {
        setSuccess(
          tienda
            ? `WhatsApp enviado a ${getNombreTienda(tienda)}.`
            : "Notificación enviada a todas las tiendas por vencer."
        );
      }

      if (tienda) {
        cerrarDetalle();
      }
    } catch (err) {
      console.error("Error enviando WhatsApp:", err);

      setError(
        getRequestErrorMessage(
          err,
          "No fue posible enviar la notificación por WhatsApp."
        )
      );
    } finally {
      setSending(false);
    }
  };

  const overviewCards = [
    {
      title: "Tiendas registradas",
      value: formatNumber(overview.tiendas),
      icon: <StorefrontIcon />,
      color: "secondary.main",
    },
    {
      title: "Ventas en Planes",
      value: formatCurrency(overview.ventas_planes),
      icon: <TrendingUpIcon />,
      color: "success.main",
    },
    {
      title: "Ventas en Complementos",
      value: formatCurrency(overview.ventas_complementos),
      icon: <BarChartIcon />,
      color: "primary.main",
    },
  ];

  if (loading && tiendasMes.length === 0 && tiendasPorVencer.length === 0) {
    return (
      <Box sx={{ width: "100%" }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => setView?.("mitienda-dashboard")}
          sx={{ borderRadius: 3, mb: 2 }}
        >
          Volver a Mi Tienda
        </Button>

        <Box
          sx={{
            minHeight: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => setView?.("mitienda-dashboard")}
        sx={{ borderRadius: 3, mb: 2 }}
      >
        Volver a Mi Tienda
      </Button>

      <Stack spacing={2} mb={3}>
        <Typography variant="h4" fontWeight={900}>
          Panel de Estadísticas Generales
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
      </Stack>

      <Grid container spacing={3} justifyContent="center">
        {overviewCards.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.title}>
            <Card
              sx={{
                borderRadius: 4,
                minHeight: 170,
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              }}
            >
              <CardContent>
                <Stack spacing={1.5} alignItems="center" textAlign="center">
                  <Avatar
                    sx={{
                      bgcolor: "transparent",
                      color: item.color,
                      width: 60,
                      height: 60,
                      "& svg": {
                        fontSize: 48,
                      },
                    }}
                  >
                    {item.icon}
                  </Avatar>

                  <Typography color="text.secondary">{item.title}</Typography>

                  <Typography fontSize={28} fontWeight={900}>
                    {item.value}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} md={5}>
          <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
            <NewReleasesIcon color="primary" />
            <Typography variant="h5" fontWeight={900}>
              Tiendas Nuevas del Mes
            </Typography>

            <Chip
              size="small"
              color="primary"
              label={tiendasNuevasTotal}
              sx={{ fontWeight: 800 }}
            />
          </Stack>

          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 3,
              maxHeight: 410,
              overflow: "auto",
              boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
            }}
          >
            <Table stickyHeader size={isMobile ? "small" : "medium"}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 900 }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 900, width: 120 }}>
                    ¿Activa?
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {tiendasMes.map((tienda, index) => (
                  <TableRow
                    key={`${getTiendaId(tienda) ?? index}`}
                    hover
                    onClick={() => abrirDetalleTiendaMes(tienda)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>{getNombreTienda(tienda)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={isTiendaActiva(tienda) ? "Sí" : "No"}
                        color={isTiendaActiva(tienda) ? "success" : "error"}
                        sx={{ fontWeight: 800 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}

                {tiendasMes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2}>
                      <Typography color="text.secondary">
                        Sin tiendas nuevas este mes.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={12} md={7}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
            spacing={2}
            mb={1.5}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <HourglassBottomIcon color="warning" />
              <Typography variant="h5" fontWeight={900}>
                Tiendas por Vencer este Mes
              </Typography>
            </Stack>

            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={() => notificarTiendas()}
              disabled={sending || tiendasPorVencer.length === 0}
              sx={{
                borderRadius: 2,
                fontWeight: 800,
                width: { xs: "100%", sm: "auto" },
              }}
            >
              {sending ? "Enviando..." : "Enviar a todas"}
            </Button>
          </Stack>

          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 3,
              maxHeight: 410,
              overflow: "auto",
              boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
            }}
          >
            <Table stickyHeader size={isMobile ? "small" : "medium"}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 900 }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 900, width: 150 }}>
                    Días restantes
                  </TableCell>
                  <TableCell sx={{ fontWeight: 900, width: 180 }}>
                    Plan
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {tiendasPorVencer.map((tienda, index) => {
                  const dias = getDiasRestantes(tienda);

                  return (
                    <TableRow
                      key={`${getTiendaId(tienda) ?? index}`}
                      hover
                      onClick={() => abrirDetalleTiendaVencer(tienda)}
                      sx={{
                        cursor: "pointer",
                        bgcolor:
                          dias < 0
                            ? "rgba(244, 67, 54, 0.10)"
                            : dias <= 7
                              ? "rgba(255, 193, 7, 0.12)"
                              : "inherit",
                      }}
                    >
                      <TableCell>{getNombreTienda(tienda)}</TableCell>
                      <TableCell>{dias}</TableCell>
                      <TableCell>{getPlanTienda(tienda)}</TableCell>
                    </TableRow>
                  );
                })}

                {tiendasPorVencer.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Typography color="text.secondary">
                        Sin tiendas por vencer este mes.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Stack direction="row" alignItems="center" spacing={1} mt={5} mb={2}>
        <BarChartIcon color="success" />
        <Typography variant="h5" fontWeight={900}>
          Gráficas Comparativas
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 3,
              height: "100%",
              boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarMonthIcon color="primary" />
                <Typography fontWeight={900}>
                  Tiendas Registradas por Mes
                </Typography>
              </Stack>

              <SimpleBarChart data={registrosPorMes} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 3,
              height: "100%",
              boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                <ReceiptLongIcon color="warning" />
                <Typography fontWeight={900}>Ventas por Mes</Typography>
              </Stack>

              <SimpleBarChart data={pagosPorMes} valueFormatter={formatCurrency} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 3,
              height: "100%",
              boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                <WorkspacePremiumIcon color="success" />
                <Typography fontWeight={900}>
                  Top 3 Tiendas con más Subscripciones
                </Typography>
              </Stack>

              <TopBarChart data={topTiendas} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={dialogType === "tienda-mes"}
        onClose={cerrarDetalle}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 3,
            m: { xs: 1.5, sm: 3 },
          },
        }}
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" spacing={1}>
            <Typography fontWeight={900}>
              {getNombreTienda(tiendaMesSeleccionada)}
            </Typography>

            <IconButton size="small" onClick={cerrarDetalle}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={1.3}>
            <Typography>
              <PhoneIcon fontSize="small" sx={{ mr: 1, verticalAlign: "middle" }} />
              <strong>Tel:</strong> {getTelefonoTienda(tiendaMesSeleccionada)}
            </Typography>

            <Typography>
              <ReceiptLongIcon
                fontSize="small"
                sx={{ mr: 1, verticalAlign: "middle" }}
              />
              <strong>Plan:</strong> {getPlanTienda(tiendaMesSeleccionada)}
            </Typography>

            <Typography>
              <CalendarMonthIcon
                fontSize="small"
                sx={{ mr: 1, verticalAlign: "middle" }}
              />
              <strong>Registro:</strong>{" "}
              {formatDate(getFechaCreacion(tiendaMesSeleccionada))}
            </Typography>

            <Typography>
              <HourglassBottomIcon
                fontSize="small"
                sx={{ mr: 1, verticalAlign: "middle" }}
              />
              <strong>Vencimiento:</strong>{" "}
              {formatDate(getFechaVencimiento(tiendaMesSeleccionada))}
            </Typography>

            <Typography>
              <strong>Estado:</strong>{" "}
              {tiendaMesSeleccionada
                ? getEstadoTienda(tiendaMesSeleccionada)
                : "N/A"}
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={cerrarDetalle}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialogType === "tienda-vencer"}
        onClose={cerrarDetalle}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 3,
            m: { xs: 1.5, sm: 3 },
          },
        }}
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" spacing={1}>
            <Typography fontWeight={900}>
              {getNombreTienda(tiendaVencerSeleccionada)}
            </Typography>

            <IconButton size="small" onClick={cerrarDetalle}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={1.3}>
            <Typography>
              <PhoneIcon fontSize="small" sx={{ mr: 1, verticalAlign: "middle" }} />
              <strong>Tel:</strong> {getTelefonoTienda(tiendaVencerSeleccionada)}
            </Typography>

            <Typography>
              <ReceiptLongIcon
                fontSize="small"
                sx={{ mr: 1, verticalAlign: "middle" }}
              />
              <strong>Plan:</strong> {getPlanTienda(tiendaVencerSeleccionada)}
            </Typography>

            <Typography>
              <HourglassBottomIcon
                fontSize="small"
                sx={{ mr: 1, verticalAlign: "middle" }}
              />
              {getDiasRestantes(tiendaVencerSeleccionada ?? {}) < 0
                ? `Venció el ${formatDate(
                    getFechaVencimiento(tiendaVencerSeleccionada)
                  )}`
                : `Vence el ${formatDate(
                    getFechaVencimiento(tiendaVencerSeleccionada)
                  )}`}
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            flexDirection: { xs: "column-reverse", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            gap: 1,
          }}
        >
          <Button onClick={cerrarDetalle} disabled={sending}>
            Cerrar
          </Button>

          <Button
            variant="contained"
            startIcon={<WhatsAppIcon />}
            onClick={() => notificarTiendas(tiendaVencerSeleccionada)}
            disabled={sending || !tiendaVencerSeleccionada}
          >
            {sending ? "Enviando..." : "Enviar WhatsApp"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}