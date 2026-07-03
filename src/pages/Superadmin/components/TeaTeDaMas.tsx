import { useEffect, useMemo, useState, type ReactNode } from "react";
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

function sistemaChipSx(value?: string | null) {
  const key = String(value || "").toLowerCase();

  const colors: Record<string, { bg: string; color: string; border: string }> = {
    mtelmx: {
      bg: "rgba(25, 118, 210, 0.12)",
      color: "#1565c0",
      border: "rgba(25, 118, 210, 0.35)",
    },
    taeconta: {
      bg: "rgba(237, 108, 2, 0.13)",
      color: "#c45100",
      border: "rgba(237, 108, 2, 0.38)",
    },
    clicmenu: {
      bg: "rgba(46, 125, 50, 0.13)",
      color: "#2e7d32",
      border: "rgba(46, 125, 50, 0.35)",
    },
    telorecargo: {
      bg: "rgba(123, 31, 162, 0.13)",
      color: "#7b1fa2",
      border: "rgba(123, 31, 162, 0.35)",
    },
    chatingbot: {
      bg: "rgba(0, 150, 136, 0.13)",
      color: "#00897b",
      border: "rgba(0, 150, 136, 0.35)",
    },
  };

  const selected = colors[key] || {
    bg: "action.hover",
    color: "text.primary",
    border: "divider",
  };

  return {
    bgcolor: selected.bg,
    color: selected.color,
    borderColor: selected.border,
    fontWeight: 800,
  };
}

function SistemaChip({ sistema }: { sistema?: string | null }) {
  return (
    <Chip
      size="small"
      variant="outlined"
      label={nombreSistema(sistema)}
      sx={sistemaChipSx(sistema)}
    />
  );
}

function StatusChip({ status }: { status?: string | null }) {
  const value = status || "pendiente";

  if (value === "confirmado") {
    return <Chip size="small" label="Confirmado" color="success" />;
  }

  if (value === "rechazado") {
    return <Chip size="small" label="Rechazado" color="error" />;
  }

  return <Chip size="small" label="Pendiente" color="warning" />;
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
        p: 2.5,
        borderRadius: 4,
        height: "100%",
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar
          sx={{
            width: 52,
            height: 52,
            bgcolor: "primary.main",
          }}
        >
          {icon}
        </Avatar>

        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={800}>
            {title}
          </Typography>

          <Typography variant="h4" fontWeight={900} lineHeight={1.15}>
            {value}
          </Typography>

          {subtitle && (
            <Typography variant="caption" color="text.secondary">
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
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 4, mb: 3 }}>
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
    <Grid item xs={12} md={6}>
      <Typography variant="caption" color="text.secondary" fontWeight={800}>
        {label}
      </Typography>
      <Typography fontWeight={700} sx={{ wordBreak: "break-word" }}>
        {value || "-"}
      </Typography>
    </Grid>
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography fontWeight={900}>Detalle del referido</Typography>
            <Typography variant="body2" color="text.secondary">
              Información general del movimiento seleccionado.
            </Typography>
          </Box>
          <SistemaChip sistema={item.sistema} />
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
              <DetailRow label="Usuario TAE" value={usuarioSeleccionado ? nombreUsuario(usuarioSeleccionado) : "-"} />
              <DetailRow label="User ID" value={item.user_id} />
              <DetailRow label="Nombre referido" value={nombreUsuarioReferido(item)} />
              <DetailRow label="Referido User ID" value={item.referido_user_id || "-"} />
              <DetailRow label="External ID" value={item.external_id || "-"} />
              <DetailRow label="Código usado" value={item.codigo_ref_usado || "-"} />
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" fontWeight={900} mb={1}>
              Producto y ganancia
            </Typography>
            <Grid container spacing={2}>
              <DetailRow label="Sistema" value={<SistemaChip sistema={item.sistema} />} />
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
              Fechas y origen
            </Typography>
            <Grid container spacing={2}>
              <DetailRow label="Fecha registro" value={formatoFechaHora(item.fecha_registro)} />
              <DetailRow label="Fecha confirmación" value={formatoFechaHora(item.fecha_confirmacion)} />
              <DetailRow label="Fecha pago" value={formatoFechaHora(item.fecha_pago)} />
              <DetailRow label="Origen" value={item.origen || "-"} />
              <DetailRow label="Creado" value={formatoFechaHora(item.created_at)} />
              <DetailRow label="Actualizado" value={formatoFechaHora(item.updated_at)} />
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" fontWeight={900} mb={1}>
              Observaciones
            </Typography>
            <Typography color="text.secondary">
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

export default function TeaTeDaMas() {
  const now = new Date();

  const [data, setData] = useState<TeaReferidosDashboardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [vista, setVista] = useState<VistaTea>("principal");
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
    usuarioSeleccionado,
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

  const abrirVistaUsuarios = () => {
    setVista("usuarios");
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
    setVista("detalle");
  };

  const regresarAPrincipal = () => {
    setVista("principal");
    setUsuarioSeleccionado(null);
    setRegistroDetalle(null);
    setUsuariosPage(0);
    setReferidosPage(0);
  };

  const regresarAUsuarios = () => {
    setVista("usuarios");
    setUsuarioSeleccionado(null);
    setRegistroDetalle(null);
    setReferidosPage(0);
  };

  if (vista === "usuarios") {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
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
              <Typography variant="h4" fontWeight={900}>
                Usuarios TAE
              </Typography>

              <Typography color="text.secondary">
                Selecciona un usuario para consultar su detalle sin salir de /superadmin.
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

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 4 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={2}
            mb={2}
          >
            <Box>
              <Typography variant="h6" fontWeight={900}>
                Tabla de usuarios
              </Typography>

              <Typography variant="body2" color="text.secondary">
                La tabla no depende de los filtros de la vista principal.
              </Typography>
            </Box>

            <TextField
              size="small"
              placeholder="Buscar por nombre, correo, teléfono o código"
              value={busquedaUsuario}
              onChange={(e) => setBusquedaUsuario(e.target.value)}
              InputProps={{
                startAdornment: (
                  <ManageSearch sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
              sx={{ minWidth: { xs: "100%", md: 380 } }}
            />
          </Stack>

          {loading && !data ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer
                sx={{
                  maxHeight: 560,
                  overflowY: "auto",
                  overflowX: "auto",
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
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
                            <Avatar sx={{ width: 34, height: 34 }}>
                              {iniciales(nombreUsuario(item))}
                            </Avatar>

                            <Box>
                              <Typography fontWeight={800}>
                                {nombreUsuario(item)}
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
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
                          >
                            Ver detalle
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
      <Box sx={{ p: { xs: 2, md: 3 } }}>
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
              <Typography variant="h4" fontWeight={900}>
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

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, mb: 3 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
            <Avatar sx={{ width: 72, height: 72, fontSize: 24 }}>
              {iniciales(nombreUsuario(usuarioSeleccionado))}
            </Avatar>

            <Box flex={1}>
              <Typography variant="h5" fontWeight={900}>
                {nombreUsuario(usuarioSeleccionado)}
              </Typography>

              <Typography color="text.secondary">
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
              <Grid item xs={12} md={4}>
                <KpiCard
                  title="Total referidos"
                  value={toNumber(resumen?.referidos_mes_seleccionado)}
                  subtitle={`Referidos de ${nombreMes(detalleMes)} ${detalleAnio}`}
                  icon={<TrendingUp />}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <KpiCard
                  title="Confirmados"
                  value={toNumber(resumen?.confirmados_mes_seleccionado)}
                  subtitle={`Confirmados de ${nombreMes(detalleMes)} ${detalleAnio}`}
                  icon={<CheckCircle />}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <KpiCard
                  title="Pendientes"
                  value={toNumber(resumen?.pendientes_mes_seleccionado)}
                  subtitle={`Pendientes de ${nombreMes(detalleMes)} ${detalleAnio}`}
                  icon={<HourglassTop />}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <KpiCard
                  title="Ganancia total"
                  value={formatoMoneda((resumen as any)?.ganancia_mes_seleccionado)}
                  subtitle={`Ganancia de ${nombreMes(detalleMes)} ${detalleAnio}`}
                  icon={<AttachMoney />}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <KpiCard
                  title="Ganancia confirmada"
                  value={formatoMoneda((resumen as any)?.ganancia_confirmada_mes_seleccionado)}
                  subtitle="Comisiones confirmadas"
                  icon={<AttachMoney />}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <KpiCard
                  title="Ganancia pendiente"
                  value={formatoMoneda((resumen as any)?.ganancia_pendiente_mes_seleccionado)}
                  subtitle="Comisiones pendientes"
                  icon={<AttachMoney />}
                />
              </Grid>
            </Grid>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 4 }}>
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

              <TableContainer sx={{ overflowX: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Cuenta referida</TableCell>
                      <TableCell>Producto</TableCell>
                      <TableCell>Ganancia</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Fechas</TableCell>
                      <TableCell>Origen</TableCell>
                      <TableCell align="right">Acción</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {(data?.referidos_mes_seleccionado?.data || []).map(
                      (itemOriginal) => {
                        const item = itemOriginal as TeaReferidoConGanancia;

                        return (
                          <TableRow key={item.id}>
                            <TableCell sx={{ minWidth: 260 }}>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                                flexWrap="wrap"
                              >
                                <SistemaChip sistema={item.sistema} />
                                <Typography fontWeight={900}>
                                  {nombreUsuarioReferido(item)}
                                </Typography>
                              </Stack>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                External ID: {item.external_id || "-"}
                              </Typography>
                            </TableCell>

                            <TableCell sx={{ minWidth: 220 }}>
                              <Typography fontWeight={800}>
                                {item.nombre_producto || "-"}
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Costo: {formatoMoneda(item.costo_producto)}
                              </Typography>
                            </TableCell>

                            <TableCell sx={{ minWidth: 190 }}>
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                flexWrap="wrap"
                              >
                                <Typography fontWeight={900}>
                                  {formatoMoneda(item.monto)}
                                </Typography>

                                <GananciaChip item={item} />
                              </Stack>
                            </TableCell>

                            <TableCell>
                              <StatusChip status={item.status} />
                            </TableCell>

                            <TableCell sx={{ minWidth: 220 }}>
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

                            <TableCell>{item.origen || "-"}</TableCell>

                            <TableCell align="right">
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<InfoOutlined />}
                                onClick={() => setRegistroDetalle(item)}
                              >
                                Detalles
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      },
                    )}

                    {(data?.referidos_mes_seleccionado?.data || []).length ===
                      0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
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
            </Paper>
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
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={900}>
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
        subtitulo="Aplican solo a Usuarios nuevos y Recientes del mes."
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
            <Grid item xs={12} md={3}>
              <Paper
                variant="outlined"
                onClick={abrirVistaUsuarios}
                sx={{
                  p: 2.5,
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
                      width: 56,
                      height: 56,
                      bgcolor: "rgba(255,255,255,0.18)",
                    }}
                  >
                    <PersonSearch />
                  </Avatar>

                  <Box flex={1}>
                    <Typography fontWeight={900} fontSize={18}>
                      Consultar por usuario
                    </Typography>

                    <Typography fontSize={13} sx={{ opacity: 0.9 }}>
                      Abre la tabla de Usuarios TAE dentro del mismo módulo.
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={3}>
              <KpiCard
                title="Confirmados"
                value={toNumber(resumen?.confirmados_mes_seleccionado)}
                subtitle={`Confirmados de ${nombreMes(mes)} ${anio}`}
                icon={<CheckCircle />}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <KpiCard
                title="Ganancia confirmada"
                value={formatoMoneda((resumen as any)?.ganancia_confirmada_mes_seleccionado)}
                subtitle={`${nombreMes(mes)} ${anio}`}
                icon={<AttachMoney />}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <KpiCard
                title="Mes seleccionado"
                value={toNumber(resumen?.referidos_mes_seleccionado)}
                subtitle={`${toNumber(
                  resumen?.confirmados_mes_seleccionado,
                )} confirmados`}
                icon={<TrendingUp />}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} lg={5}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 4 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={1}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={900}>
                      Usuarios nuevos
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {nombreMes(mes)} {anio}
                    </Typography>
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    Mostrando {data?.nuevos?.length || 0}
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    maxHeight: 300,
                    overflowY: "auto",
                    pr: 1,
                  }}
                >
                  {(data?.nuevos || []).map((itemOriginal) => {
                    const item = itemOriginal as TeaReferidoConGanancia;

                    return (
                      <Paper
                        key={item.id}
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          borderRadius: 3,
                          mb: 1,
                        }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ width: 36, height: 36 }}>
                            {iniciales(nombreUsuarioReferido(item))}
                          </Avatar>

                          <Box flex={1} minWidth={0}>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              flexWrap="wrap"
                            >
                              <SistemaChip sistema={item.sistema} />
                              <Typography fontWeight={800} noWrap>
                                {nombreUsuarioReferido(item)}
                              </Typography>
                            </Stack>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                            >
                              {item.usuario
                                ? `Refirió: ${nombreUsuario(item.usuario)}`
                                : "-"}
                            </Typography>
                          </Box>

                          <StatusChip status={item.status} />
                        </Stack>
                      </Paper>
                    );
                  })}

                  {(data?.nuevos || []).length === 0 && (
                    <Typography color="text.secondary" align="center" py={3}>
                      Sin usuarios nuevos.
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={7}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 4 }}>
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
                </Stack>

                <TableContainer sx={{ overflowX: "auto" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Usuario TAE</TableCell>
                        <TableCell>Cuenta referida</TableCell>
                        <TableCell>Producto</TableCell>
                        <TableCell>Ganancia</TableCell>
                        <TableCell>Estado</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {(data?.recientes_mes_actual || []).map((itemOriginal) => {
                        const item = itemOriginal as TeaReferidoConGanancia;

                        return (
                          <TableRow key={item.id}>
                            <TableCell>{formatoFecha(item.fecha_registro)}</TableCell>

                            <TableCell>
                              {item.usuario ? nombreUsuario(item.usuario) : "-"}
                            </TableCell>

                            <TableCell sx={{ minWidth: 220 }}>
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                flexWrap="wrap"
                              >
                                <SistemaChip sistema={item.sistema} />
                                <Typography fontWeight={800}>
                                  {nombreUsuarioReferido(item)}
                                </Typography>
                              </Stack>
                            </TableCell>

                            <TableCell>{item.nombre_producto || "-"}</TableCell>

                            <TableCell sx={{ minWidth: 170 }}>
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                flexWrap="wrap"
                              >
                                <Typography fontWeight={900}>
                                  {formatoMoneda(item.monto)}
                                </Typography>
                                <GananciaChip item={item} />
                              </Stack>
                            </TableCell>

                            <TableCell>
                              <StatusChip status={item.status} />
                            </TableCell>
                          </TableRow>
                        );
                      })}

                      {(data?.recientes_mes_actual || []).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            Sin recientes del mes.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}
