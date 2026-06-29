import { useCallback, useEffect, useMemo, useState } from "react";
import axiosClient from "../../../services/axiosClient";

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import StorefrontIcon from "@mui/icons-material/Storefront";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockIcon from "@mui/icons-material/Lock";

import TaecontaTiendaModal from "./../TaecontaTiendaModal";

type Props = {
  setView?: (view: string) => void;
};

type ChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

type Tienda = {
  id: number | string;
  nombre?: string | null;
  name?: string | null;
  email?: string | null;
  telefono?: string | null;
  phone_number?: string | null;
  created_at?: string | null;
  fecha_creacion?: string | null;
  fecha?: string | null;
  plan?: {
    estado?: string | null;
    nombre_plan?: string | null;
    nombre?: string | null;
    plan?: string | null;
    vence?: string | null;
    fecha_vencimiento?: string | null;
  } | null;
};

const ITEMS_PER_PAGE = 16;

function normalizeText(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getNombreTienda(tienda: Tienda) {
  return tienda.nombre ?? tienda.name ?? "Sin nombre";
}

function getEmailTienda(tienda: Tienda) {
  return tienda.email ?? "Sin correo";
}

function getTelefonoTienda(tienda: Tienda) {
  return tienda.telefono ?? tienda.phone_number ?? "N/A";
}

function getPlanTienda(tienda: Tienda) {
  return (
    tienda.plan?.nombre_plan ??
    tienda.plan?.nombre ??
    tienda.plan?.plan ??
    "Sin plan"
  );
}

function getFechaFiltro(tienda: Tienda) {
  return (
    tienda.created_at ??
    tienda.fecha_creacion ??
    tienda.fecha ??
    tienda.plan?.vence ??
    tienda.plan?.fecha_vencimiento ??
    null
  );
}

export default function MiTiendaTiendas({ setView }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [data, setData] = useState<Tienda[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");
  const [plan, setPlan] = useState("");

  const [page, setPage] = useState(1);

  const [openDetalle, setOpenDetalle] = useState(false);
  const [detalle, setDetalle] = useState<any>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const [openTaeconta, setOpenTaeconta] = useState(false);
  const [tiendaTaeconta, setTiendaTaeconta] = useState<Tienda | null>(null);

  const cargarTiendas = useCallback(async () => {
    setLoading(true);

    try {
      const res = await axiosClient.get("/superadmin/mitienda/tiendas");
      setData(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (error) {
      console.error("Error cargando tiendas:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarTiendas();
  }, [cargarTiendas]);

  const planesDisponibles = useMemo(() => {
    const planes = data
      .map((tienda) => getPlanTienda(tienda))
      .filter((value) => value && value !== "Sin plan");

    return Array.from(new Set(planes)).sort((a, b) => a.localeCompare(b));
  }, [data]);

  const aniosDisponibles = useMemo(() => {
    const anios = data
      .map((tienda) => {
        const fecha = getFechaFiltro(tienda);
        if (!fecha) return null;

        const date = new Date(fecha);
        if (Number.isNaN(date.getTime())) return null;

        return String(date.getFullYear());
      })
      .filter(Boolean) as string[];

    return Array.from(new Set(anios)).sort((a, b) => Number(b) - Number(a));
  }, [data]);

  const filteredData = useMemo(() => {
    const value = normalizeText(search);

    return data.filter((tienda) => {
      const nombre = normalizeText(getNombreTienda(tienda));
      const telefono = normalizeText(getTelefonoTienda(tienda));
      const email = normalizeText(getEmailTienda(tienda));
      const planNombre = getPlanTienda(tienda);

      const coincideBusqueda =
        !value ||
        nombre.includes(value) ||
        telefono.includes(value) ||
        email.includes(value);

      const coincidePlan = !plan || planNombre === plan;

      let coincideFecha = true;

      if (mes || anio) {
        const fecha = getFechaFiltro(tienda);

        if (!fecha) {
          coincideFecha = false;
        } else {
          const date = new Date(fecha);

          if (Number.isNaN(date.getTime())) {
            coincideFecha = false;
          } else {
            const mesTienda = String(date.getMonth() + 1).padStart(2, "0");
            const anioTienda = String(date.getFullYear());

            coincideFecha =
              (!mes || mesTienda === mes) && (!anio || anioTienda === anio);
          }
        }
      }

      return coincideBusqueda && coincidePlan && coincideFecha;
    });
  }, [data, search, mes, anio, plan]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  );

  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = page * ITEMS_PER_PAGE;

    return filteredData.slice(start, end);
  }, [filteredData, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const getEstadoColor = (estado?: string | null): ChipColor => {
    if (!estado) return "default";

    const value = normalizeText(estado);

    if (value === "activa" || value === "activo") return "success";
    if (value === "vencida" || value === "inactiva") return "error";

    return "default";
  };

  const abrirDetalle = async (tiendaId: number | string) => {
    setOpenDetalle(true);
    setDetalle(null);
    setLoadingDetalle(true);

    try {
      const res = await axiosClient.get(
        `/superadmin/mitienda/tiendas/${tiendaId}`
      );

      setDetalle(res.data?.data ?? null);
    } catch (error) {
      console.error("Error cargando detalle de tienda:", error);
      setDetalle(null);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const cerrarDetalle = () => {
    setOpenDetalle(false);
    setDetalle(null);
  };

  const abrirModalTaeconta = (tienda: Tienda) => {
    setTiendaTaeconta(tienda);
    setOpenTaeconta(true);
  };

  const cerrarModalTaeconta = () => {
    setOpenTaeconta(false);
    setTiendaTaeconta(null);
  };

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
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Lista de Tiendas
          </Typography>

          <Typography color="text.secondary">
            Listado general de tiendas registradas en Mi Tienda.
          </Typography>
        </Box>

        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: "background.paper",
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por nombre, teléfono o correo"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                select
                fullWidth
                size="small"
                label="Mes"
                value={mes}
                onChange={(e) => {
                  setMes(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="01">Enero</MenuItem>
                <MenuItem value="02">Febrero</MenuItem>
                <MenuItem value="03">Marzo</MenuItem>
                <MenuItem value="04">Abril</MenuItem>
                <MenuItem value="05">Mayo</MenuItem>
                <MenuItem value="06">Junio</MenuItem>
                <MenuItem value="07">Julio</MenuItem>
                <MenuItem value="08">Agosto</MenuItem>
                <MenuItem value="09">Septiembre</MenuItem>
                <MenuItem value="10">Octubre</MenuItem>
                <MenuItem value="11">Noviembre</MenuItem>
                <MenuItem value="12">Diciembre</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                select
                fullWidth
                size="small"
                label="Año"
                value={anio}
                onChange={(e) => {
                  setAnio(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                {aniosDisponibles.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Plan"
                value={plan}
                onChange={(e) => {
                  setPlan(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                {planesDisponibles.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Paper>
      </Stack>

      {loading ? (
        <Box
          sx={{
            minHeight: 240,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : paginated.length === 0 ? (
        <Card sx={{ borderRadius: 4 }}>
          <CardContent>
            <Typography fontWeight={800}>Sin resultados</Typography>
            <Typography color="text.secondary">
              No se encontraron tiendas con los filtros actuales.
            </Typography>
          </CardContent>
        </Card>
      ) : isMobile ? (
        <Grid container spacing={2}>
          {paginated.map((tienda) => (
            <Grid item xs={12} key={tienda.id}>
              <Card
                sx={{
                  borderRadius: 4,
                  bgcolor: theme.palette.mode === "dark" ? "#1f1f1f" : "#fff",
                }}
              >
                <CardContent>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography fontWeight={900}>
                        {getNombreTienda(tienda)}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        ID: {tienda.id}
                      </Typography>
                    </Box>

                    <Chip
                      label={tienda.plan?.estado ?? "Sin plan"}
                      size="small"
                      color={getEstadoColor(tienda.plan?.estado)}
                      sx={{ width: "fit-content" }}
                    />

                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Detalle de tienda">
                        <IconButton
                          size="small"
                          onClick={() => abrirDetalle(tienda.id)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Acceso TAECONTA">
                        <IconButton
                          size="small"
                          onClick={() => abrirModalTaeconta(tienda)}
                        >
                          <LockIcon sx={{ color: "#f4b400" }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 4,
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, width: 90 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 900 }} align="right">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.map((tienda, index) => (
                <TableRow key={tienda.id} hover>
                  <TableCell>{(page - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        <StorefrontIcon fontSize="small" />
                      </Avatar>

                      <Box>
                        <Typography fontWeight={800}>
                          {getNombreTienda(tienda)}
                        </Typography>

                        <Typography fontSize={12} color="text.secondary">
                          ID: {tienda.id}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={tienda.plan?.estado ?? "Sin plan"}
                      size="small"
                      color={getEstadoColor(tienda.plan?.estado)}
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={0.5}
                      justifyContent="flex-end"
                    >
                      <Tooltip title="Detalle de tienda">
                        <IconButton
                          size="small"
                          onClick={() => abrirDetalle(tienda.id)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Acceso TAECONTA">
                        <IconButton
                          size="small"
                          onClick={() => abrirModalTaeconta(tienda)}
                        >
                          <LockIcon sx={{ color: "#f4b400" }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Stack
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
        spacing={2}
        mt={3}
      >
        <Button
          variant="outlined"
          disabled={page === 1}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          sx={{ borderRadius: 3 }}
        >
          Anterior
        </Button>

        <Typography fontWeight={700}>
          Página {page} de {totalPages}
        </Typography>

        <Button
          variant="outlined"
          disabled={page >= totalPages}
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          sx={{ borderRadius: 3 }}
        >
          Siguiente
        </Button>
      </Stack>

      <Dialog
        open={openDetalle}
        onClose={cerrarDetalle}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
          },
        }}
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography fontWeight={900}>Detalle de tienda</Typography>

            <IconButton onClick={cerrarDetalle}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          {loadingDetalle ? (
            <Box
              sx={{
                minHeight: 220,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : detalle ? (
            <Stack spacing={3}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: "primary.main",
                  }}
                >
                  <StorefrontIcon />
                </Avatar>

                <Box>
                  <Typography variant="h5" fontWeight={900}>
                    {detalle.nombre ?? detalle.name ?? "Sin nombre"}
                  </Typography>

                  <Typography color="text.secondary">
                    ID: {detalle.id ?? "N/A"}
                  </Typography>
                </Box>
              </Stack>

              <Divider />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography fontSize={13} color="text.secondary">
                    Correo
                  </Typography>
                  <Typography fontWeight={800}>
                    {detalle.email ?? "Sin correo"}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography fontSize={13} color="text.secondary">
                    Teléfono
                  </Typography>
                  <Typography fontWeight={800}>
                    {detalle.telefono ?? detalle.phone_number ?? "N/A"}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography fontSize={13} color="text.secondary">
                    Plan
                  </Typography>
                  <Typography fontWeight={800}>
                    {detalle.plan?.nombre_plan ??
                      detalle.plan?.nombre ??
                      "Sin plan"}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography fontSize={13} color="text.secondary">
                    Estado del plan
                  </Typography>
                  <Chip
                    label={detalle.plan?.estado ?? "Sin plan"}
                    size="small"
                    color={getEstadoColor(detalle.plan?.estado)}
                    sx={{ mt: 0.5 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography fontSize={13} color="text.secondary">
                    Vencimiento
                  </Typography>
                  <Typography fontWeight={800}>
                    {detalle.plan?.vence ??
                      detalle.plan?.fecha_vencimiento ??
                      "N/A"}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography fontSize={13} color="text.secondary">
                    Correo TAECONTA
                  </Typography>
                  <Typography fontWeight={800}>
                    {detalle.taeconta?.correo_tae ??
                      detalle.taeconta?.email ??
                      "N/A"}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography fontSize={13} color="text.secondary">
                    RFC
                  </Typography>
                  <Typography fontWeight={800}>
                    {detalle.datos_fiscales?.rfc ?? "N/A"}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography fontSize={13} color="text.secondary">
                    Razón social
                  </Typography>
                  <Typography fontWeight={800}>
                    {detalle.datos_fiscales?.razon_social ?? "N/A"}
                  </Typography>
                </Grid>
              </Grid>
            </Stack>
          ) : (
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography fontWeight={900}>
                  No se encontró información
                </Typography>
                <Typography color="text.secondary">
                  No fue posible cargar el detalle de la tienda.
                </Typography>
              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>

      <TaecontaTiendaModal
        open={openTaeconta}
        tiendaId={tiendaTaeconta?.id ?? null}
        tiendaNombre={
          tiendaTaeconta
            ? tiendaTaeconta.nombre ?? tiendaTaeconta.name ?? "Sin nombre"
            : ""
        }
        onClose={cerrarModalTaeconta}
        onUpdated={cargarTiendas}
      />
    </Box>
  );
}