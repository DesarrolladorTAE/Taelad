import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { ArrowBack, CalendarMonth, CheckCircle, Error, HourglassTop } from "@mui/icons-material";
import {
  obtenerTeaReferidosDashboard,
  type TeaReferidosDashboardResponse,
} from "../../../services/teaReferidosService";

function nombreSistema(value?: string | null) {
  const sistemas: Record<string, string> = {
    mtelmx: "MiTienda",
    taeconta: "TAECONTA",
    clicmenu: "ClicMenu",
    telorecargo: "Telorecargo",
    chatingbot: "ChatingBot",
  };

  return value ? sistemas[value] || value : "-";
}

function nombreUsuario(item: any) {
  const name = item?.name || "";
  const apellidos = item?.apellidos || "";
  return `${name} ${apellidos}`.trim() || item?.email || "-";
}

function iniciales(value?: string | null) {
  if (!value) return "TA";

  const partes = value.trim().split(" ").filter(Boolean);

  if (partes.length === 1) {
    return partes[0].substring(0, 2).toUpperCase();
  }

  return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
}

function formatoFecha(value?: string | null) {
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

function StatusChip({ status }: { status?: string | null }) {
  if (status === "confirmado") {
    return <Chip size="small" label="Confirmado" color="success" />;
  }

  if (status === "rechazado") {
    return <Chip size="small" label="Rechazado" color="error" />;
  }

  return <Chip size="small" label="Pendiente" color="warning" />;
}

function KpiCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 4 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar sx={{ bgcolor: "primary.main", width: 50, height: 50 }}>
          {icon}
        </Avatar>

        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={800}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={900}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export default function TeaUsuarioDetalle() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const now = new Date();

  const [data, setData] = useState<TeaReferidosDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);

  const params = useMemo(
    () => ({
      user_id: userId,
      mes: now.getMonth() + 1,
      anio: now.getFullYear(),
      orden: "desc" as const,
      referidos_page: page + 1,
    }),
    [userId, page]
  );

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await obtenerTeaReferidosDashboard(params);
        setData(response);
      } catch (err: any) {
        console.error("Error cargando detalle usuario TEA:", err);
        setError(
          err?.response?.data?.message ||
            "No fue posible cargar el detalle del usuario."
        );
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [params]);

  const usuario = data?.detalle_usuario;
  const resumen = data?.resumen;
  const referidos = data?.referidos_mes_seleccionado;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "background.default", minHeight: "100vh" }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => {
            if (window.opener) {
              window.close();
            } else {
              navigate("/superadmin");
            }
          }}
        >
          Regresar
        </Button>

        <Box>
          <Typography variant="h4" fontWeight={900}>
            Detalle del usuario
          </Typography>
          <Typography color="text.secondary">
            Información global independiente del usuario seleccionado.
          </Typography>
        </Box>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, mb: 3 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="center">
              <Avatar sx={{ width: 72, height: 72, fontSize: 24 }}>
                {iniciales(nombreUsuario(usuario))}
              </Avatar>

              <Box flex={1}>
                <Typography variant="h5" fontWeight={900}>
                  {nombreUsuario(usuario)}
                </Typography>
                <Typography color="text.secondary">
                  {usuario?.email || "-"}
                </Typography>
                <Typography color="text.secondary">
                  Teléfono: {usuario?.phone || "-"}
                </Typography>
                <Typography color="text.secondary">
                  Código referido: {usuario?.codigo_ref || "-"}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} md={3}>
              <KpiCard
                title="Total referidos"
                value={resumen?.total_referidos || 0}
                icon={<CalendarMonth />}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <KpiCard
                title="Confirmados"
                value={resumen?.total_confirmados || 0}
                icon={<CheckCircle />}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <KpiCard
                title="Pendientes"
                value={resumen?.total_pendientes || 0}
                icon={<HourglassTop />}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <KpiCard
                title="Rechazados"
                value={resumen?.total_rechazados || 0}
                icon={<Error />}
              />
            </Grid>
          </Grid>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={900} mb={2}>
              Referidos del usuario
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Cuenta referida</TableCell>
                    <TableCell>Sistema</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Fecha registro</TableCell>
                    <TableCell>Fecha confirmación</TableCell>
                    <TableCell>Origen</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {(referidos?.data || []).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Typography fontWeight={800}>
                          {item.nombre_referido}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          External ID: {item.external_id || "-"}
                        </Typography>
                      </TableCell>

                      <TableCell>{nombreSistema(item.sistema)}</TableCell>

                      <TableCell>
                        <StatusChip status={item.status} />
                      </TableCell>

                      <TableCell>{formatoFecha(item.fecha_registro)}</TableCell>

                      <TableCell>{formatoFecha(item.fecha_confirmacion)}</TableCell>

                      <TableCell>{item.origen || "-"}</TableCell>
                    </TableRow>
                  ))}

                  {(referidos?.data || []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Sin referidos para este usuario.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={referidos?.total || 0}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={referidos?.per_page || 20}
              rowsPerPageOptions={[20]}
            />
          </Paper>
        </>
      )}
    </Box>
  );
}