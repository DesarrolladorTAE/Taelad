import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  MenuItem,
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
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  ArrowBack,
  AttachMoney,
  CalendarMonth,
  CheckCircle,
  HourglassTop,
  InfoOutlined,
  ManageSearch,
  PersonSearch,
  TrendingUp,
} from "@mui/icons-material";
import {
  obtenerTeaReferidosDashboard,
  type TeaReferido,
  type TeaReferidoDashboardParams,
  type TeaReferidosDashboardResponse,
  type TeaUsuarioTeaItem,
} from "../../../services/teaReferidosService";
import TeaHistorialGlobalUsuario from "./TeaHistorialGlobalUsuario";

const sistemas = [
  { value: "", label: "Todos los sistemas" },
  { value: "mtelmx", label: "MiTienda" },
  { value: "taeconta", label: "TAECONTA" },
  { value: "clicmenu", label: "ClicMenu" },
  { value: "telorecargo", label: "Telorecargo" },
  { value: "chatingbot", label: "ChatingBot" },
];

const estados = [
  { value: "", label: "Todos los estados" },
  { value: "pendiente", label: "Pendientes" },
  { value: "confirmado", label: "Confirmados" },
  { value: "rechazado", label: "Rechazados" },
];

const meses = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

type VistaTea = "principal" | "usuarios" | "detalle";

type TeaTeDaMasProps = {
  resetKey?: number;
};

type TeaReferidoConGanancia = TeaReferido & {
  ganancia_id?: number | string | null;
  nombre_producto?: string | null;
  costo_producto?: number | string | null;
  tipo?: string | null;
  porcentaje_comision?: number | string | null;
  monto?: number | string | null;
  fecha_pago?: string | null;
};

function toNumber(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatoMoneda(value?: unknown) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(toNumber(value));
}

function nombreSistema(value?: string | null) {
  if (!value) return "-";

  const item = sistemas.find((s) => s.value === value);
  return item?.label || value;
}

function nombreMes(value?: number | string | null) {
  const mes = Number(value);
  return meses.find((item) => item.value === mes)?.label || "-";
}

function nombreUsuario(item: any) {
  const name = item?.name || "";
  const apellidos = item?.apellidos || "";
  const nombreCompleto = `${name} ${apellidos}`.trim();

  return nombreCompleto || item?.email || "-";
}

function iniciales(value?: string | null) {
  if (!value) return "TA";

  const partes = value.trim().split(" ").filter(Boolean);

  if (partes.length === 1) {
    return partes[0].substring(0, 2).toUpperCase();
  }

  return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
}

function nombreUsuarioReferido(item: TeaReferido) {
  const usuario = item.referido_usuario || item.referidoUsuario;

  if (usuario) {
    return nombreUsuario(usuario);
  }

  return item.nombre_referido || "-";
}

function formatoFecha(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatoFechaHora(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function logoSistema(value?: string | null) {
  const key = String(value || "").toLowerCase();

  const logos: Record<string, string> = {
    mtelmx: "/app/mitienda.png",
    taeconta: "/app/taeconta.png",
    clicmenu: "/app/clicmenu.png",
    telorecargo: "/app/telorecargo.png",
    chatingbot: "/app/chatingbot.png",
  };

  return logos[key] || "/logo/logo.png";
}

function SistemaLogo({
  sistema,
  size = 34,
}: {
  sistema?: string | null;
  size?: number;
}) {
  return (
    <Box
      component="img"
      src={logoSistema(sistema)}
      alt={nombreSistema(sistema)}
      sx={{
        width: size,
        height: size,
        objectFit: "contain",
        flexShrink: 0,
      }}
      onError={(e) => {
        e.currentTarget.src = "/logo/logo.png";
      }}
    />
  );
}

function NombreConSistema({
  item,
  compact = false,
}: {
  item: TeaReferidoConGanancia;
  compact?: boolean;
}) {
  return (
    <Stack direction="row" spacing={1.2} alignItems="flex-start" minWidth={0}>
      <SistemaLogo sistema={item.sistema} size={compact ? 28 : 36} />

      <Box minWidth={0}>
        <Typography
          fontWeight={900}
          lineHeight={1.2}
          sx={{ wordBreak: "break-word" }}
        >
          {nombreUsuarioReferido(item)}
        </Typography>
      </Box>
    </Stack>
  );
}
function StatusChip({ status }: { status?: string | null }) {
  const value = (status || "pendiente").toLowerCase().trim();

  const chipSx = {
    minWidth: 104,
    maxWidth: "none",
    flexShrink: 0,
    fontWeight: 800,
    justifyContent: "center",
    "& .MuiChip-label": {
      px: 1.25,
      overflow: "visible",
      textOverflow: "clip",
      whiteSpace: "nowrap",
    },
  };

  if (value === "confirmado") {
    return (
      <Chip
        size="small"
        label="Confirmado"
        color="success"
        sx={chipSx}
      />
    );
  }

  if (value === "rechazado") {
    return (
      <Chip
        size="small"
        label="Rechazado"
        color="error"
        sx={chipSx}
      />
    );
  }

  return (
    <Chip
      size="small"
      label="Pendiente"
      color="warning"
      sx={chipSx}
    />
  );
}

function tipoGananciaLabel(item: TeaReferidoConGanancia) {
  const tipo = String(item.tipo || "").trim().toLowerCase();
  const porcentaje = toNumber(item.porcentaje_comision);

  if (tipo.includes("renov") || porcentaje === 5) {
    return `Renovación ${porcentaje || 5}%`;
  }

  if (tipo.includes("comision") || tipo.includes("comisión") || porcentaje === 20) {
    return `Comisión ${porcentaje || 20}%`;
  }

  if (porcentaje > 0) {
    return `${item.tipo || "Comisión"} ${porcentaje}%`;
  }

  return item.tipo || "Sin comisión";
}

function tipoGananciaSx(item: TeaReferidoConGanancia) {
  const label = tipoGananciaLabel(item).toLowerCase();

  if (label.includes("renov")) {
    return {
      bgcolor: "rgba(123, 31, 162, 0.12)",
      color: "#7b1fa2",
      borderColor: "rgba(123, 31, 162, 0.35)",
      fontWeight: 800,
    };
  }

  if (label.includes("comisión") || label.includes("comision")) {
    return {
      bgcolor: "rgba(46, 125, 50, 0.12)",
      color: "#2e7d32",
      borderColor: "rgba(46, 125, 50, 0.35)",
      fontWeight: 800,
    };
  }

  return {
    bgcolor: "action.hover",
    color: "text.primary",
    borderColor: "divider",
    fontWeight: 800,
  };
}

function GananciaChip({ item }: { item: TeaReferidoConGanancia }) {
  return (
    <Chip
      size="small"
      variant="outlined"
      label={tipoGananciaLabel(item)}
      sx={tipoGananciaSx(item)}
    />
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: ReactNode;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.5, md: 2 },
        borderRadius: 4,
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
        <Avatar
          sx={{
            width: { xs: 40, md: 48 },
            height: { xs: 40, md: 48 },
            bgcolor: "primary.main",
            flexShrink: 0,
          }}
        >
          {icon}
        </Avatar>

        <Box minWidth={0} flex={1}>
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight={800}
            lineHeight={1.2}
          >
            {title}
          </Typography>

          <Typography
            fontWeight={900}
            lineHeight={1.1}
            sx={{
              fontSize: "clamp(1.25rem, 6vw, 2rem)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {value}
          </Typography>

          {subtitle && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", lineHeight: 1.25 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}

function FiltrosTea({
  sistema,
  status,
  mes,
  anio,
  orden,
  onSistemaChange,
  onStatusChange,
  onMesChange,
  onAnioChange,
  onOrdenChange,
  titulo,
  subtitulo,
}: {
  sistema: string;
  status: string;
  mes: number;
  anio: number;
  orden: "asc" | "desc";
  onSistemaChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onMesChange: (value: number) => void;
  onAnioChange: (value: number) => void;
  onOrdenChange: (value: "asc" | "desc") => void;
  titulo?: string;
  subtitulo?: string;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.5, md: 2 },
        borderRadius: 4,
        mb: 3,
      }}
    >
      {(titulo || subtitulo) && (
        <Box mb={2}>
          {titulo && (
            <Typography variant="h6" fontWeight={900}>
              {titulo}
            </Typography>
          )}

          {subtitulo && (
            <Typography variant="body2" color="text.secondary">
              {subtitulo}
            </Typography>
          )}
        </Box>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={2.4}>
          <TextField
            select
            fullWidth
            size="small"
            label="Sistema"
            value={sistema}
            onChange={(e) => onSistemaChange(e.target.value)}
          >
            {sistemas.map((item) => (
              <MenuItem key={item.value || "todos"} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <TextField
            select
            fullWidth
            size="small"
            label="Estado"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            {estados.map((item) => (
              <MenuItem key={item.value || "todos"} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <TextField
            select
            fullWidth
            size="small"
            label="Mes"
            value={mes}
            onChange={(e) => onMesChange(Number(e.target.value))}
          >
            {meses.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <TextField
            fullWidth
            size="small"
            label="Año"
            type="number"
            value={anio}
            onChange={(e) => onAnioChange(Number(e.target.value))}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <TextField
            select
            fullWidth
            size="small"
            label="Orden"
            value={orden}
            onChange={(e) => onOrdenChange(e.target.value as "asc" | "desc")}
          >
            <MenuItem value="desc">Mayor a menor</MenuItem>
            <MenuItem value="asc">Menor a mayor</MenuItem>
          </TextField>
        </Grid>
      </Grid>
    </Paper>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Grid item xs={12} sm={6}>
      <Typography variant="caption" color="text.secondary" fontWeight={800}>
        {label}
      </Typography>
      <Typography fontWeight={700} sx={{ wordBreak: "break-word" }}>
        {value || "-"}
      </Typography>
    </Grid>
  );
}

function InfoLine({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ textAlign: "right", minWidth: 0 }}>{value}</Box>
    </Stack>
  );
}

function MovimientoCard({
  item,
  usuarioSeleccionado,
  mostrarUsuarioTae = false,
  showAction = false,
  onDetails,
}: {
  item: TeaReferidoConGanancia;
  usuarioSeleccionado?: TeaUsuarioTeaItem | null;
  mostrarUsuarioTae?: boolean;
  showAction?: boolean;
  onDetails?: (item: TeaReferidoConGanancia) => void;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 3 }}>
      <Stack spacing={1.25}>
        <Stack direction="row" spacing={1.2} alignItems="flex-start">
          <SistemaLogo sistema={item.sistema} size={34} />

          <Box minWidth={0} flex={1}>
            <Typography fontWeight={900} lineHeight={1.2}>
              {nombreUsuarioReferido(item)}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-word" }}>
              {item.nombre_producto || "-"}
            </Typography>
          </Box>

          <StatusChip status={item.status} />
        </Stack>

        {mostrarUsuarioTae && (
          <InfoLine
            label="Usuario TAE"
            value={
              <Typography variant="body2" fontWeight={800}>
                {item.usuario ? nombreUsuario(item.usuario) : "-"}
              </Typography>
            }
          />
        )}

        {usuarioSeleccionado && (
          <InfoLine
            label="Usuario TAE"
            value={
              <Typography variant="body2" fontWeight={800}>
                {nombreUsuario(usuarioSeleccionado)}
              </Typography>
            }
          />
        )}

        <Divider />

        <InfoLine
          label="Costo"
          value={<Typography variant="body2">{formatoMoneda(item.costo_producto)}</Typography>}
        />

        <InfoLine
          label="Ganancia"
          value={
            <Stack alignItems="flex-end" spacing={0.5}>
              <Typography fontWeight={900}>{formatoMoneda(item.monto)}</Typography>
              <GananciaChip item={item} />
            </Stack>
          }
        />

        <InfoLine
          label="Registro"
          value={<Typography variant="body2">{formatoFechaHora(item.fecha_registro)}</Typography>}
        />

        <InfoLine
          label="Confirmación"
          value={<Typography variant="body2">{formatoFechaHora(item.fecha_confirmacion)}</Typography>}
        />

        <InfoLine
          label="Pago"
          value={<Typography variant="body2">{formatoFechaHora(item.fecha_pago)}</Typography>}
        />

        {showAction && (
          <Button
            fullWidth
            variant="outlined"
            startIcon={<InfoOutlined />}
            onClick={() => onDetails?.(item)}
            sx={{ textTransform: "none" }}
          >
            Detalles
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

function UsuarioTeaCard({
  item,
  onDetails,
}: {
  item: TeaUsuarioTeaItem;
  onDetails: (item: TeaUsuarioTeaItem) => void;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 1.5, borderRadius: 3, cursor: "pointer" }}
      onClick={() => onDetails(item)}
    >
      <Stack spacing={1.25}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 42, height: 42 }}>
            {iniciales(nombreUsuario(item))}
          </Avatar>

          <Box minWidth={0} flex={1}>
            <Typography fontWeight={900} lineHeight={1.2}>
              {nombreUsuario(item)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-word" }}>
              {item.email || "-"}
            </Typography>
          </Box>
        </Stack>

        <Divider />

        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Código
            </Typography>
            <Typography fontWeight={800}>{item.codigo_ref || "-"}</Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Último referido
            </Typography>
            <Typography fontWeight={800}>{formatoFecha(item.ultimo_referido)}</Typography>
          </Grid>

          <Grid item xs={4}>
            <Typography variant="caption" color="text.secondary">
              Referidos
            </Typography>
            <Typography fontWeight={900}>{toNumber(item.cantidad_referidos)}</Typography>
          </Grid>

          <Grid item xs={4}>
            <Typography variant="caption" color="text.secondary">
              Confirmados
            </Typography>
            <Typography color="primary.main" fontWeight={900}>
              {toNumber(item.confirmados)}
            </Typography>
          </Grid>

          <Grid item xs={4}>
            <Typography variant="caption" color="text.secondary">
              Pendientes
            </Typography>
            <Typography color="warning.main" fontWeight={900}>
              {toNumber(item.pendientes)}
            </Typography>
          </Grid>
        </Grid>

        <Button
          fullWidth
          variant="outlined"
          onClick={(e) => {
            e.stopPropagation();
            onDetails(item);
          }}
          sx={{ textTransform: "none" }}
        >
          Detalles
        </Button>
      </Stack>
    </Paper>
  );
}

function DetalleRegistroDialog({
  open,
  item,
  usuarioSeleccionado,
  onClose,
}: {
  open: boolean;
  item: TeaReferidoConGanancia | null;
  usuarioSeleccionado: TeaUsuarioTeaItem | null;
  onClose: () => void;
}) {
  if (!item) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={false}>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography fontWeight={900}>Detalle del referido</Typography>
            <Typography variant="body2" color="text.secondary">
              Información general del movimiento seleccionado.
            </Typography>
          </Box>
          <SistemaLogo sistema={item.sistema} size={38} />
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle1" fontWeight={900} mb={1}>
              Datos del referido
            </Typography>
            <Grid container spacing={2}>
              <DetailRow label="ID referido" value={item.id} />
              <DetailRow label="ID ganancia" value={item.ganancia_id || "-"} />
              <DetailRow
                label="Usuario TAE"
                value={usuarioSeleccionado ? nombreUsuario(usuarioSeleccionado) : "-"}
              />
              <DetailRow label="User ID" value={item.user_id} />
              <DetailRow label="Nombre referido" value={nombreUsuarioReferido(item)} />
              <DetailRow label="Referido User ID" value={item.referido_user_id || "-"} />
              <DetailRow label="Código usado" value={item.codigo_ref_usado || "-"} />
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" fontWeight={900} mb={1}>
              Producto y ganancia
            </Typography>
            <Grid container spacing={2}>
              <DetailRow
                label="Sistema"
                value={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <SistemaLogo sistema={item.sistema} size={28} />
                    <span>{nombreSistema(item.sistema)}</span>
                  </Stack>
                }
              />
              <DetailRow label="Producto" value={item.nombre_producto || "-"} />
              <DetailRow label="Tipo" value={item.tipo || "-"} />
              <DetailRow label="Costo producto" value={formatoMoneda(item.costo_producto)} />
              <DetailRow label="Porcentaje comisión" value={`${toNumber(item.porcentaje_comision)}%`} />
              <DetailRow label="Monto ganancia" value={formatoMoneda(item.monto)} />
              <DetailRow label="Clasificación" value={<GananciaChip item={item} />} />
              <DetailRow label="Estado" value={<StatusChip status={item.status} />} />
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" fontWeight={900} mb={1}>
              Fechas
            </Typography>
            <Grid container spacing={2}>
              <DetailRow label="Fecha registro" value={formatoFechaHora(item.fecha_registro)} />
              <DetailRow label="Fecha confirmación" value={formatoFechaHora(item.fecha_confirmacion)} />
              <DetailRow label="Fecha pago" value={formatoFechaHora(item.fecha_pago)} />
              <DetailRow label="Creado" value={formatoFechaHora(item.created_at)} />
              <DetailRow label="Actualizado" value={formatoFechaHora(item.updated_at)} />
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" fontWeight={900} mb={1}>
              Observaciones
            </Typography>
            <Typography color="text.secondary" sx={{ wordBreak: "break-word" }}>
              {item.observaciones || "-"}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function TeaTeDaMas({ resetKey = 0 }: TeaTeDaMasProps = {}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const now = new Date();

  const [data, setData] = useState<TeaReferidosDashboardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [vista, setVista] = useState<VistaTea>("principal");
  const [modoDetalle, setModoDetalle] = useState<"mensual" | "historico">("mensual");
  const [usuarioSeleccionado, setUsuarioSeleccionado] =
    useState<TeaUsuarioTeaItem | null>(null);
  const [registroDetalle, setRegistroDetalle] =
    useState<TeaReferidoConGanancia | null>(null);

  const [sistema, setSistema] = useState("");
  const [status, setStatus] = useState("");
  const [mes, setMes] = useState<number>(now.getMonth() + 1);
  const [anio, setAnio] = useState<number>(now.getFullYear());
  const [orden, setOrden] = useState<"asc" | "desc">("desc");

  const [detalleSistema, setDetalleSistema] = useState("");
  const [detalleStatus, setDetalleStatus] = useState("");
  const [detalleMes, setDetalleMes] = useState<number>(now.getMonth() + 1);
  const [detalleAnio, setDetalleAnio] = useState<number>(now.getFullYear());
  const [detalleOrden, setDetalleOrden] = useState<"asc" | "desc">("desc");

  const [busquedaUsuario, setBusquedaUsuario] = useState("");
  const [usuariosPage, setUsuariosPage] = useState(0);
  const [referidosPage, setReferidosPage] = useState(0);

  const params = useMemo<TeaReferidoDashboardParams>(() => {
    if (vista === "detalle" && usuarioSeleccionado) {
      return {
        sistema: detalleSistema,
        status: detalleStatus,
        mes: detalleMes,
        anio: detalleAnio,
        orden: detalleOrden,
        user_id: usuarioSeleccionado.user_id,
        referidos_page: referidosPage + 1,
      };
    }

    if (vista === "usuarios") {
      return {
        orden,
        usuarios_page: usuariosPage + 1,
      };
    }

    return {
      sistema,
      status,
      mes,
      anio,
      orden,
      referidos_page: 1,
      usuarios_page: 1,
    };
  }, [
    vista,
    sistema,
    status,
    mes,
    anio,
    orden,
    detalleSistema,
    detalleStatus,
    detalleMes,
    detalleAnio,
    detalleOrden,
    usuarioSeleccionado?.user_id,
    usuariosPage,
    referidosPage,
  ]);

  const cargarDatos = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await obtenerTeaReferidosDashboard(params);
      setData(response);
    } catch (err: any) {
      console.error("Error cargando TEA te da más:", err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          `No fue posible cargar los datos de TEA te da más. ${
            err?.response?.status ? `Status: ${err.response.status}` : ""
          }`,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [params]);

  const resumen = data?.resumen;

  const usuariosFiltrados = useMemo(() => {
    const rows = data?.usuarios_tea?.data || [];

    if (!busquedaUsuario.trim()) return rows;

    const q = busquedaUsuario.trim().toLowerCase();

    return rows.filter((item) => {
      const fullName = nombreUsuario(item).toLowerCase();

      return (
        fullName.includes(q) ||
        String(item.codigo_ref || "").toLowerCase().includes(q) ||
        String(item.email || "").toLowerCase().includes(q) ||
        String(item.phone || "").toLowerCase().includes(q)
      );
    });
  }, [data?.usuarios_tea?.data, busquedaUsuario]);

  const nuevos = useMemo(
    () => (data?.nuevos || []) as TeaReferidoConGanancia[],
    [data?.nuevos],
  );

  const recientes = useMemo(
    () => (data?.recientes_mes_actual || []) as TeaReferidoConGanancia[],
    [data?.recientes_mes_actual],
  );

  const referidosDetalle = useMemo(
    () =>
      (data?.referidos_mes_seleccionado?.data || []) as TeaReferidoConGanancia[],
    [data?.referidos_mes_seleccionado?.data],
  );

  const resetearDashboardPrincipal = useCallback(() => {
    setVista("principal");
    setModoDetalle("mensual");
    setUsuarioSeleccionado(null);
    setRegistroDetalle(null);
    setUsuariosPage(0);
    setReferidosPage(0);
    setBusquedaUsuario("");
  }, []);

  useEffect(() => {
    resetearDashboardPrincipal();
  }, [resetKey, resetearDashboardPrincipal]);

  useEffect(() => {
    const handler = () => resetearDashboardPrincipal();

    window.addEventListener("tea-te-da-mas:reset", handler);

    return () => {
      window.removeEventListener("tea-te-da-mas:reset", handler);
    };
  }, [resetearDashboardPrincipal]);

  const abrirVistaUsuarios = () => {
    setVista("usuarios");
    setModoDetalle("mensual");
    setUsuarioSeleccionado(null);
    setRegistroDetalle(null);
    setUsuariosPage(0);
    setReferidosPage(0);
    setBusquedaUsuario("");
  };

  const abrirDetalleUsuario = (item: TeaUsuarioTeaItem) => {
    setUsuarioSeleccionado(item);
    setRegistroDetalle(null);
    setDetalleSistema("");
    setDetalleStatus("");
    setDetalleMes(mes);
    setDetalleAnio(anio);
    setDetalleOrden(orden);
    setReferidosPage(0);
    setModoDetalle("mensual");
    setVista("detalle");
  };

  const regresarAPrincipal = () => {
    resetearDashboardPrincipal();
  };

  const regresarAUsuarios = () => {
    setVista("usuarios");
    setModoDetalle("mensual");
    setUsuarioSeleccionado(null);
    setRegistroDetalle(null);
    setReferidosPage(0);
  };

  if (vista === "usuarios") {
    return (
      <Box sx={{ p: { xs: 1.5, md: 3 }, width: "100%", overflowX: "hidden" }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
          mb={3}
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={regresarAPrincipal}
              sx={{ width: { xs: "100%", sm: "fit-content" } }}
            >
              Regresar
            </Button>

            <Box>
              <Typography variant={isMobile ? "h5" : "h4"} fontWeight={900}>
                Usuarios TAE
              </Typography>

              <Typography color="text.secondary">
                Selecciona un usuario para consultar su detalle.
              </Typography>
            </Box>
          </Stack>

          <Button variant="contained" onClick={cargarDatos} disabled={loading}>
            Actualizar
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 4 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={2}
            mb={2}
          >
            <Box>
              <Typography variant="h6" fontWeight={900}>
                Usuarios
              </Typography>

              <Typography variant="body2" color="text.secondary">
                La consulta no depende de los filtros principales.
              </Typography>
            </Box>

            <TextField
              size="small"
              placeholder="Buscar"
              value={busquedaUsuario}
              onChange={(e) => setBusquedaUsuario(e.target.value)}
              InputProps={{
                startAdornment: (
                  <ManageSearch sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
              sx={{ width: { xs: "100%", md: 380 } }}
            />
          </Stack>

          {loading && !data ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress />
            </Box>
          ) : isMobile ? (
            <Stack spacing={1.25}>
              {usuariosFiltrados.map((item) => (
                <UsuarioTeaCard
                  key={item.user_id}
                  item={item}
                  onDetails={abrirDetalleUsuario}
                />
              ))}

              {usuariosFiltrados.length === 0 && (
                <Typography color="text.secondary" align="center" py={3}>
                  Sin usuarios TAE.
                </Typography>
              )}
            </Stack>
          ) : (
            <>
              <TableContainer
                sx={{
                  maxHeight: 560,
                  overflowY: "auto",
                  overflowX: "hidden",
                  pr: 1,
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Usuario</TableCell>
                      <TableCell>Código</TableCell>
                      <TableCell align="right">Referidos</TableCell>
                      <TableCell align="right">Confirmados</TableCell>
                      <TableCell align="right">Pendientes</TableCell>
                      <TableCell>Último referido</TableCell>
                      <TableCell align="right">Acción</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {usuariosFiltrados.map((item) => (
                      <TableRow
                        key={item.user_id}
                        hover
                        sx={{ cursor: "pointer" }}
                        onClick={() => abrirDetalleUsuario(item)}
                      >
                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar sx={{ width: 34, height: 34 }}>
                              {iniciales(nombreUsuario(item))}
                            </Avatar>

                            <Box>
                              <Typography fontWeight={800}>
                                {nombreUsuario(item)}
                              </Typography>

                              <Typography variant="caption" color="text.secondary">
                                {item.email || "-"}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        <TableCell>{item.codigo_ref || "-"}</TableCell>

                        <TableCell align="right">
                          <Typography fontWeight={900}>
                            {toNumber(item.cantidad_referidos)}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Typography color="primary.main" fontWeight={900}>
                            {toNumber(item.confirmados)}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Typography color="warning.main" fontWeight={900}>
                            {toNumber(item.pendientes)}
                          </Typography>
                        </TableCell>

                        <TableCell>{formatoFecha(item.ultimo_referido)}</TableCell>

                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={(e) => {
                              e.stopPropagation();
                              abrirDetalleUsuario(item);
                            }}
                            sx={{ textTransform: "none" }}
                          >
                            Detalles
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}

                    {usuariosFiltrados.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          Sin usuarios TAE.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={data?.usuarios_tea?.total || 0}
                page={usuariosPage}
                onPageChange={(_, newPage) => setUsuariosPage(newPage)}
                rowsPerPage={data?.usuarios_tea?.per_page || 20}
                rowsPerPageOptions={[20]}
              />
            </>
          )}
        </Paper>
      </Box>
    );
  }

  if (vista === "detalle" && usuarioSeleccionado) {
    const detalleCargado =
      String(data?.filters?.user_id ?? "") === String(usuarioSeleccionado.user_id);

    return (
      <Box sx={{ p: { xs: 1.5, md: 3 }, width: "100%", overflowX: "hidden" }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
          mb={3}
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={regresarAUsuarios}
              sx={{ width: { xs: "100%", sm: "fit-content" } }}
            >
              Regresar
            </Button>

            <Box>
              <Typography variant={isMobile ? "h5" : "h4"} fontWeight={900}>
                Detalle del usuario
              </Typography>

              <Typography color="text.secondary">
                Filtros, ganancias y referidos del usuario seleccionado.
              </Typography>
            </Box>
          </Stack>

          <Button variant="contained" onClick={cargarDatos} disabled={loading}>
            Actualizar
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper
          variant="outlined"
          sx={{ p: { xs: 1.5, md: 3 }, borderRadius: 4, mb: 3 }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Avatar sx={{ width: 64, height: 64, fontSize: 22 }}>
              {iniciales(nombreUsuario(usuarioSeleccionado))}
            </Avatar>

            <Box flex={1} minWidth={0}>
              <Typography variant="h5" fontWeight={900} sx={{ wordBreak: "break-word" }}>
                {nombreUsuario(usuarioSeleccionado)}
              </Typography>

              <Typography color="text.secondary" sx={{ wordBreak: "break-word" }}>
                {usuarioSeleccionado.email || "-"}
              </Typography>

              <Typography color="text.secondary">
                Teléfono: {usuarioSeleccionado.phone || "-"}
              </Typography>

              <Typography color="text.secondary">
                Código referido: {usuarioSeleccionado.codigo_ref || "-"}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {modoDetalle === "historico" ? (
          <TeaHistorialGlobalUsuario
            userId={usuarioSeleccionado.user_id}
            onBack={() => setModoDetalle("mensual")}
          />
        ) : (
          <>
        <FiltrosTea
          titulo="Filtros del usuario"
          subtitulo="Estos filtros solo afectan el detalle de este usuario."
          sistema={detalleSistema}
          status={detalleStatus}
          mes={detalleMes}
          anio={detalleAnio}
          orden={detalleOrden}
          onSistemaChange={(value) => {
            setDetalleSistema(value);
            setReferidosPage(0);
          }}
          onStatusChange={(value) => {
            setDetalleStatus(value);
            setReferidosPage(0);
          }}
          onMesChange={(value) => {
            setDetalleMes(value);
            setReferidosPage(0);
          }}
          onAnioChange={(value) => {
            setDetalleAnio(value);
            setReferidosPage(0);
          }}
          onOrdenChange={(value) => {
            setDetalleOrden(value);
            setReferidosPage(0);
          }}
        />

        {loading || !detalleCargado ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} sm={6} md={4}>
                <KpiCard
                  title="Total referidos"
                  value={toNumber(resumen?.referidos_mes_seleccionado)}
                  subtitle={`Referidos de ${nombreMes(detalleMes)} ${detalleAnio}`}
                  icon={<TrendingUp />}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <KpiCard
                  title="Confirmados"
                  value={toNumber(resumen?.confirmados_mes_seleccionado)}
                  subtitle={`Confirmados de ${nombreMes(detalleMes)} ${detalleAnio}`}
                  icon={<CheckCircle />}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <KpiCard
                  title="Pendientes"
                  value={toNumber(resumen?.pendientes_mes_seleccionado)}
                  subtitle={`Pendientes de ${nombreMes(detalleMes)} ${detalleAnio}`}
                  icon={<HourglassTop />}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <KpiCard
                  title="Ganancia total"
                  value={formatoMoneda((resumen as any)?.ganancia_mes_seleccionado)}
                  subtitle={`Ganancia de ${nombreMes(detalleMes)} ${detalleAnio}`}
                  icon={<AttachMoney />}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: { xs: 1.5, md: 2 },
                    borderRadius: 4,
                    height: "100%",
                    overflow: "hidden",
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
                    <Avatar
                      sx={{
                        width: { xs: 40, md: 48 },
                        height: { xs: 40, md: 48 },
                        bgcolor: "primary.main",
                        flexShrink: 0,
                      }}
                    >
                      <CalendarMonth />
                    </Avatar>

                    <Box minWidth={0} flex={1}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={800}
                        lineHeight={1.2}
                      >
                        Historial total
                      </Typography>

                      <Typography
                        fontWeight={900}
                        lineHeight={1.1}
                        sx={{
                          fontSize: "clamp(1.25rem, 6vw, 2rem)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        Global
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", lineHeight: 1.25, mb: 1 }}
                      >
                        Acumulado por mes desde el inicio.
                      </Typography>

                      <Button
                        fullWidth
                        size="small"
                        variant="contained"
                        onClick={() => {
                          setRegistroDetalle(null);
                          setModoDetalle("historico");
                        }}
                        sx={{ textTransform: "none" }}
                      >
                        Ver histórica
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>

            <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 4 }}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                spacing={2}
                mb={2}
              >
                <Box>
                  <Typography variant="h6" fontWeight={900}>
                    Referidos del usuario
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Periodo: {nombreMes(detalleMes)} {detalleAnio}
                  </Typography>
                </Box>
              </Stack>

              {isMobile ? (
                <Stack spacing={1.25}>
                  {referidosDetalle.map((item) => (
                    <MovimientoCard
                      key={item.id}
                      item={item}
                      usuarioSeleccionado={usuarioSeleccionado}
                      showAction
                      onDetails={setRegistroDetalle}
                    />
                  ))}

                  {referidosDetalle.length === 0 && (
                    <Typography color="text.secondary" align="center" py={3}>
                      Sin referidos para este usuario.
                    </Typography>
                  )}
                </Stack>
              ) : (
                <>
                  <TableContainer
                    sx={{
                      width: "100%",
                      overflowX: "hidden",
                    }}
                  >
                    <Table
                      size="small"
                      sx={{
                        tableLayout: "fixed",
                        width: "100%",
                        "& td, & th": {
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                          verticalAlign: "top",
                        },
                        "& th:last-of-type, & td:last-of-type": {
                          whiteSpace: "nowrap",
                          wordBreak: "normal",
                          overflow: "visible",
                        },
                      }}
                    >
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ width: "34%" }}>
                            Referido / Producto
                          </TableCell>
                          <TableCell sx={{ width: "13%" }}>Ganancia</TableCell>
                          <TableCell
                            sx={{
                              width: "15%",
                              minWidth: 130,
                              whiteSpace: "nowrap",
                              wordBreak: "normal",
                            }}
                          >
                            Estado
                          </TableCell>
                          <TableCell sx={{ width: "24%" }}>Fechas</TableCell>
                          <TableCell sx={{ width: "14%", minWidth: 120 }} align="right">
                            Acción
                          </TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {referidosDetalle.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <NombreConSistema item={item} />

                              <Box mt={0.8}>
                                <Typography fontWeight={800} lineHeight={1.25}>
                                  {item.nombre_producto || "-"}
                                </Typography>

                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                >
                                  Costo: {formatoMoneda(item.costo_producto)}
                                </Typography>
                              </Box>
                            </TableCell>

                            <TableCell>
                              <Stack direction="column" spacing={0.6} alignItems="flex-start">
                                <Typography fontWeight={900}>
                                  {formatoMoneda(item.monto)}
                                </Typography>

                                <GananciaChip item={item} />
                              </Stack>
                            </TableCell>

                            <TableCell>
                              <StatusChip status={item.status} />
                            </TableCell>

                            <TableCell>
                              <Typography variant="caption" display="block">
                                Registro: {formatoFechaHora(item.fecha_registro)}
                              </Typography>

                              <Typography variant="caption" display="block">
                                Confirmación: {formatoFechaHora(item.fecha_confirmacion)}
                              </Typography>

                              <Typography variant="caption" display="block">
                                Pago: {formatoFechaHora(item.fecha_pago)}
                              </Typography>
                            </TableCell>

                            <TableCell align="right">
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => setRegistroDetalle(item)}
                                sx={{
                                  minWidth: 92,
                                  whiteSpace: "nowrap",
                                  textTransform: "none",
                                  px: 1.5,
                                }}
                              >
                                Detalles
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}

                        {referidosDetalle.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              Sin referidos para este usuario.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <TablePagination
                    component="div"
                    count={data?.referidos_mes_seleccionado?.total || 0}
                    page={referidosPage}
                    onPageChange={(_, newPage) => setReferidosPage(newPage)}
                    rowsPerPage={data?.referidos_mes_seleccionado?.per_page || 20}
                    rowsPerPageOptions={[20]}
                  />
                </>
              )}
            </Paper>
          </>
        )}
          </>
        )}

        <DetalleRegistroDialog
          open={Boolean(registroDetalle)}
          item={registroDetalle}
          usuarioSeleccionado={usuarioSeleccionado}
          onClose={() => setRegistroDetalle(null)}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, width: "100%", overflowX: "hidden" }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant={isMobile ? "h5" : "h4"} fontWeight={900}>
            TEA te da más
          </Typography>

          <Typography color="text.secondary">
            Consulta usuarios nuevos, movimientos recientes y detalle por usuario.
          </Typography>
        </Box>

        <Button variant="contained" onClick={cargarDatos} disabled={loading}>
          Actualizar
        </Button>
      </Stack>

      <FiltrosTea
        titulo="Filtros de movimientos"
        subtitulo="Aplican solo a Nuevos Referidos y Recientes del mes."
        sistema={sistema}
        status={status}
        mes={mes}
        anio={anio}
        orden={orden}
        onSistemaChange={(value) => {
          setSistema(value);
          setReferidosPage(0);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setReferidosPage(0);
        }}
        onMesChange={(value) => {
          setMes(value);
          setReferidosPage(0);
        }}
        onAnioChange={(value) => {
          setAnio(value);
          setReferidosPage(0);
        }}
        onOrdenChange={(value) => {
          setOrden(value);
          setReferidosPage(0);
        }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && !data ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                variant="outlined"
                onClick={abrirVistaUsuarios}
                sx={{
                  p: 2,
                  borderRadius: 4,
                  height: "100%",
                  cursor: "pointer",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  transition: "0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 4,
                  },
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      width: 50,
                      height: 50,
                      bgcolor: "rgba(255,255,255,0.18)",
                    }}
                  >
                    <PersonSearch />
                  </Avatar>

                  <Box flex={1} minWidth={0}>
                    <Typography fontWeight={900} fontSize={17}>
                      Consultar por usuario
                    </Typography>

                    <Typography fontSize={13} sx={{ opacity: 0.9 }}>
                      Abre la tabla de Usuarios TAE.
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <KpiCard
                title="Confirmados"
                value={toNumber(resumen?.confirmados_mes_seleccionado)}
                subtitle={`Confirmados de ${nombreMes(mes)} ${anio}`}
                icon={<CheckCircle />}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <KpiCard
                title="Ganancia confirmada"
                value={formatoMoneda((resumen as any)?.ganancia_confirmada_mes_seleccionado)}
                subtitle={`${nombreMes(mes)} ${anio}`}
                icon={<AttachMoney />}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <KpiCard
                title="Mes seleccionado"
                value={toNumber(resumen?.referidos_mes_seleccionado)}
                subtitle={`${toNumber(resumen?.confirmados_mes_seleccionado)} confirmados`}
                icon={<TrendingUp />}
              />
            </Grid>
          </Grid>

          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 4 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "stretch", sm: "center" }}
                justifyContent="space-between"
                spacing={1}
                mb={2}
              >
                <Box>
                  <Typography variant="h6" fontWeight={900}>
                    Nuevos Referidos
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {nombreMes(mes)} {anio}
                  </Typography>
                </Box>

                <Typography variant="caption" color="text.secondary">
               Mostrando {Math.min(3, data?.nuevos?.length || 0)} visibles de{" "}
               {data?.nuevos?.length || 0}
              </Typography>
              </Stack>

              {isMobile ? (
                <Stack
                  spacing={1.25}
                  sx={{
                    maxHeight: 390,
                    overflowY: "auto",
                    pr: 0.5,
                  }}
                >
                  {nuevos.map((item) => (
                    <MovimientoCard
                      key={item.id}
                      item={item}
                      mostrarUsuarioTae
                    />
                  ))}

                  {nuevos.length === 0 && (
                    <Typography color="text.secondary" align="center" py={3}>
                      Sin usuarios nuevos.
                    </Typography>
                  )}
                </Stack>
              ) : (
                <TableContainer
                  sx={{
                    maxHeight: 230,
                    overflowY: "auto",
                    overflowX: "hidden",
                    pr: 1,
                    scrollbarGutter: "stable",
                  }}
                >
                  <Table
                    size="small"
                    stickyHeader
                    sx={{
                      tableLayout: "fixed",
                      width: "100%",
                      "& td, & th": {
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        verticalAlign: "top",
                      },
                      "& td:last-of-type, & th:last-of-type": {
                        whiteSpace: "nowrap",
                        wordBreak: "normal",
                        overflow: "visible",
                      },
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: "12%" }}>Fecha</TableCell>
                        <TableCell sx={{ width: "27%" }}>Cuenta referida</TableCell>
                        <TableCell sx={{ width: "19%" }}>Refirió</TableCell>
                        <TableCell sx={{ width: "15%" }}>Producto</TableCell>
                        <TableCell sx={{ width: "13%" }}>Ganancia</TableCell>
                        <TableCell
                          sx={{
                            width: "14%",
                            minWidth: 130,
                            whiteSpace: "nowrap",
                            wordBreak: "normal",
                          }}
                        >
                          Estado
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {nuevos.map((item) => (
                        <TableRow key={item.id} hover>
                          <TableCell>{formatoFecha(item.fecha_registro)}</TableCell>

                          <TableCell>
                            <NombreConSistema item={item} compact />
                          </TableCell>

                          <TableCell>
                            {item.usuario ? nombreUsuario(item.usuario) : "-"}
                          </TableCell>

                          <TableCell>
                            <Typography fontWeight={700} lineHeight={1.25}>
                              {item.nombre_producto || "-"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Costo: {formatoMoneda(item.costo_producto)}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography fontWeight={900}>
                              {formatoMoneda(item.monto)}
                            </Typography>
                            <Box mt={0.5}>
                              <GananciaChip item={item} />
                            </Box>
                          </TableCell>

                          <TableCell
                            sx={{
                              width: 130,
                              minWidth: 130,
                              whiteSpace: "nowrap",
                              wordBreak: "normal",
                              overflow: "visible",
                            }}
                          >
                            <StatusChip status={item.status} />
                          </TableCell>
                        </TableRow>
                      ))}

                      {nuevos.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            Sin usuarios nuevos.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>

            <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 4 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                spacing={1}
                mb={2}
              >
                <Box>
                  <Typography variant="h6" fontWeight={900}>
                    Recientes del mes
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {nombreMes(mes)} {anio}
                  </Typography>
                </Box>

                <Typography variant="caption" color="text.secondary">
                    Se muestran {Math.min(7, data?.recientes_mes_actual?.length || 0)} visibles de{" "}
                   {data?.recientes_mes_actual?.length || 0}
                  </Typography>
              </Stack>

              {isMobile ? (
                <Stack
                  spacing={1.25}
                  sx={{
                    maxHeight: 620,
                    overflowY: "auto",
                    pr: 0.5,
                  }}
                >
                  {recientes.map((item) => (
                    <MovimientoCard
                      key={item.id}
                      item={item}
                      mostrarUsuarioTae
                    />
                  ))}

                  {recientes.length === 0 && (
                    <Typography color="text.secondary" align="center" py={3}>
                      Sin recientes del mes.
                    </Typography>
                  )}
                </Stack>
              ) : (
                <TableContainer
                  sx={{
                    maxHeight: 520,
                    overflowY: "auto",
                    overflowX: "hidden",
                    pr: 1,
                    scrollbarGutter: "stable",
                  }}
                >
                  <Table
                    size="small"
                    stickyHeader
                    sx={{
                      tableLayout: "fixed",
                      width: "100%",
                      "& td, & th": {
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        verticalAlign: "top",
                      },
                      "& td:last-of-type, & th:last-of-type": {
                        whiteSpace: "nowrap",
                        wordBreak: "normal",
                        overflow: "visible",
                      },
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: "13%" }}>Fecha</TableCell>
                        <TableCell sx={{ width: "18%" }}>Usuario TAE</TableCell>
                        <TableCell sx={{ width: "25%" }}>Cuenta referida</TableCell>
                        <TableCell sx={{ width: "15%" }}>Producto</TableCell>
                        <TableCell sx={{ width: "13%" }}>Ganancia</TableCell>
                        <TableCell
                          sx={{
                            width: "16%",
                            minWidth: 130,
                            whiteSpace: "nowrap",
                            wordBreak: "normal",
                          }}
                        >
                          Estado
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {recientes.map((item) => (
                        <TableRow key={item.id} hover>
                          <TableCell>{formatoFechaHora(item.fecha_registro)}</TableCell>

                          <TableCell>
                            {item.usuario ? nombreUsuario(item.usuario) : "-"}
                          </TableCell>

                          <TableCell>
                            <NombreConSistema item={item} compact />
                          </TableCell>

                          <TableCell>
                            <Typography fontWeight={700} lineHeight={1.25}>
                              {item.nombre_producto || "-"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Costo: {formatoMoneda(item.costo_producto)}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography fontWeight={900}>
                              {formatoMoneda(item.monto)}
                            </Typography>
                            <Box mt={0.5}>
                              <GananciaChip item={item} />
                            </Box>
                          </TableCell>

                          <TableCell
                            sx={{
                              width: 130,
                              minWidth: 130,
                              whiteSpace: "nowrap",
                              wordBreak: "normal",
                              overflow: "visible",
                            }}
                          >
                            <StatusChip status={item.status} />
                          </TableCell>
                        </TableRow>
                      ))}

                      {recientes.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            Sin recientes del mes.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Stack>
        </>
      )}
    </Box>
  );
}
