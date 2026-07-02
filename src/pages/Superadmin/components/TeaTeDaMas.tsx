import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
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
  CalendarMonth,
  CheckCircle,
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

function nombreSistema(value?: string | null) {
  if (!value) return "-";

  const item = sistemas.find((s) => s.value === value);
  return item?.label || value;
}

function sistemasBadges(value?: string | null) {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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

export default function TeaTeDaMas() {
  const now = new Date();
  const usuariosRef = useRef<HTMLDivElement | null>(null);
  const busquedaRef = useRef<HTMLInputElement | null>(null);

  const [data, setData] = useState<TeaReferidosDashboardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [sistema, setSistema] = useState("");
  const [status, setStatus] = useState("");
  const [mes, setMes] = useState<number>(now.getMonth() + 1);
  const [anio, setAnio] = useState<number>(now.getFullYear());
  const [orden, setOrden] = useState<"asc" | "desc">("desc");

  const [busquedaUsuario, setBusquedaUsuario] = useState("");
  const [usuariosPage, setUsuariosPage] = useState(0);

  const params = useMemo<TeaReferidoDashboardParams>(
    () => ({
      sistema,
      status,
      mes,
      anio,
      orden,
      usuarios_page: usuariosPage + 1,
    }),
    [sistema, status, mes, anio, orden, usuariosPage],
  );

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

  const consultarPorUsuario = () => {
    usuariosRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setTimeout(() => {
      busquedaRef.current?.focus();
    }, 350);
  };

  const abrirDetalleUsuario = (item: TeaUsuarioTeaItem) => {
    window.open(
      `/superadmin/tea-te-da-mas/usuario/${item.user_id}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

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
            Consulta referidos, usuarios TAE, estados, sistemas y movimientos recientes.
          </Typography>
        </Box>

        <Button variant="contained" onClick={cargarDatos} disabled={loading}>
          Actualizar
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 4, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Sistema"
              value={sistema}
              onChange={(e) => {
                setSistema(e.target.value);
                setUsuariosPage(0);
              }}
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
              onChange={(e) => {
                setStatus(e.target.value);
                setUsuariosPage(0);
              }}
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
              onChange={(e) => {
                setMes(Number(e.target.value));
                setUsuariosPage(0);
              }}
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
              onChange={(e) => {
                setAnio(Number(e.target.value));
                setUsuariosPage(0);
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Orden ranking"
              value={orden}
              onChange={(e) => {
                setOrden(e.target.value as "asc" | "desc");
                setUsuariosPage(0);
              }}
            >
              <MenuItem value="desc">Mayor a menor</MenuItem>
              <MenuItem value="asc">Menor a mayor</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

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
                onClick={consultarPorUsuario}
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
                      Busca un usuario TAE y abre su detalle en otra pestaña.
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={3}>
              <KpiCard
                title="Confirmados"
                value={resumen?.total_confirmados || 0}
                subtitle="Referidos válidos"
                icon={<CheckCircle />}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <KpiCard
                title="Mes actual"
                value={resumen?.referidos_mes_actual || 0}
                subtitle={`${resumen?.confirmados_mes_actual || 0} confirmados`}
                icon={<CalendarMonth />}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <KpiCard
                title="Mes seleccionado"
                value={resumen?.referidos_mes_seleccionado || 0}
                subtitle={`${resumen?.confirmados_mes_seleccionado || 0} confirmados`}
                icon={<TrendingUp />}
              />
            </Grid>
          </Grid>

          <Box ref={usuariosRef} mb={3}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 4 }}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                spacing={2}
                mb={2}
              >
                <Box>
                  <Typography variant="h6" fontWeight={900}>
                    Usuarios TAE
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Tabla general de usuarios con referidos. El detalle abre en otra pestaña.
                  </Typography>
                </Box>

                <TextField
                  inputRef={busquedaRef}
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

              <TableContainer
                sx={{
                  maxHeight: 460,
                  overflowY: "auto",
                  pr: 1,
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Usuario</TableCell>
                      <TableCell>Código</TableCell>
                      <TableCell>Sistemas</TableCell>
                      <TableCell align="right">Referidos</TableCell>
                      <TableCell align="right">Confirmados</TableCell>
                      <TableCell align="right">Pendientes</TableCell>
                      <TableCell align="right">Rechazados</TableCell>
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

                        <TableCell>
                          <Stack direction="row" spacing={0.5} flexWrap="wrap">
                            {sistemasBadges(item.sistemas).map((s) => (
                              <Chip
                                key={s}
                                size="small"
                                label={nombreSistema(s)}
                                variant="outlined"
                              />
                            ))}

                            {sistemasBadges(item.sistemas).length === 0 && "-"}
                          </Stack>
                        </TableCell>

                        <TableCell align="right">
                          <Typography fontWeight={900}>
                            {item.cantidad_referidos || 0}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Typography color="primary.main" fontWeight={900}>
                            {item.confirmados || 0}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Typography color="warning.main" fontWeight={900}>
                            {item.pendientes || 0}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Typography color="error.main" fontWeight={900}>
                            {item.rechazados || 0}
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
                        <TableCell colSpan={9} align="center">
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
            </Paper>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} lg={5}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 4 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={1}
                >
                  <Typography variant="h6" fontWeight={900}>
                    Usuarios nuevos
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Mostrando {Math.min(data?.nuevos?.length || 0, 3)} de{" "}
                    {data?.nuevos?.length || 0}
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    maxHeight: 238,
                    overflowY: "auto",
                    pr: 1,
                  }}
                >
                  {(data?.nuevos || []).map((item) => (
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
                          <Typography fontWeight={800} noWrap>
                            {nombreUsuarioReferido(item)}
                          </Typography>

                          <Typography variant="caption" color="text.secondary" noWrap>
                            {item.usuario
                              ? `Refirió: ${nombreUsuario(item.usuario)}`
                              : "-"}
                          </Typography>
                        </Box>

                        <Chip size="small" label={nombreSistema(item.sistema)} />
                        <StatusChip status={item.status} />
                      </Stack>
                    </Paper>
                  ))}

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
                <Typography variant="h6" fontWeight={900} mb={2}>
                  Recientes del mes
                </Typography>

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Usuario TAE</TableCell>
                        <TableCell>Cuenta referida</TableCell>
                        <TableCell>Sistema</TableCell>
                        <TableCell>Estado</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {(data?.recientes_mes_actual || []).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{formatoFecha(item.fecha_registro)}</TableCell>

                          <TableCell>
                            {item.usuario ? nombreUsuario(item.usuario) : "-"}
                          </TableCell>

                          <TableCell>{nombreUsuarioReferido(item)}</TableCell>

                          <TableCell>{nombreSistema(item.sistema)}</TableCell>

                          <TableCell>
                            <StatusChip status={item.status} />
                          </TableCell>
                        </TableRow>
                      ))}

                      {(data?.recientes_mes_actual || []).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
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
