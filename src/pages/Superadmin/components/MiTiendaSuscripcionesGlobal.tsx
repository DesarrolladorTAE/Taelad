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
  IconButton,
  InputAdornment,
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
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HistoryIcon from "@mui/icons-material/History";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";

import { suscripcionesGlobalService } from "../../../services/suscripcionesGlobalService";
import SuscripcionHistorialModal from "./SuscripcionesGlobal/SuscripcionHistorialModal";
import AgregarSuscripcionModal from "./SuscripcionesGlobal/AgregarSuscripcionModal";

type Props = {
  setView?: (view: string) => void;
};

type Tienda = {
  id: number;
  name: string;
  plan_id: number | null;
  trial_ends_at: string | null;
  plan_expiration: string | null;
  is_active: boolean;
};

const ROWS_PER_PAGE = 16;

function normalizarTexto(value?: string | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatDate(value: string | null) {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatPlan(planId: number | null) {
  if (planId === 1) return "Plan Demo";
  if (planId === 2) return "Plan Negocio";
  if (planId === 3) return "Plan Profesional";
  if (planId === 4) return "Plan Avanzado";
  if (planId === null) return "Sin plan";

  return `Plan ${planId}`;
}

export default function MiTiendaSuscripcionesGlobal({ setView }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [search, setSearch] = useState<string>("");

  const [tiendaSeleccionada, setTiendaSeleccionada] =
    useState<Tienda | null>(null);

  const [openAgregar, setOpenAgregar] = useState<boolean>(false);
  const [openHistorial, setOpenHistorial] = useState<boolean>(false);

  const cargarTiendas = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await suscripcionesGlobalService.obtenerTiendas();

      const data = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      setTiendas(data);
      setPage(0);
    } catch (err: any) {
      console.error("Error cargando tiendas:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "No se pudieron cargar las tiendas.";

      setError(message);
      setTiendas([]);
      setPage(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTiendas();
  }, []);

  const tiendasFiltradas = useMemo(() => {
    const term = normalizarTexto(search);

    if (!term) return tiendas;

    return tiendas.filter((tienda) => {
      const textoTienda = normalizarTexto(
        [
          tienda.name,
          formatPlan(tienda.plan_id),
          tienda.is_active ? "activo" : "inactivo",
          formatDate(tienda.trial_ends_at),
          formatDate(tienda.plan_expiration),
        ]
          .filter(Boolean)
          .join(" ")
      );

      return textoTienda.includes(term);
    });
  }, [search, tiendas]);

  const tiendasPaginadas = tiendasFiltradas.slice(
    page * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE + ROWS_PER_PAGE
  );

  const abrirAgregar = (tienda: Tienda) => {
    setTiendaSeleccionada(tienda);
    setOpenAgregar(true);
  };

  const cerrarAgregar = () => {
    setOpenAgregar(false);
    setTiendaSeleccionada(null);
  };

  const abrirHistorial = (tienda: Tienda) => {
    setTiendaSeleccionada(tienda);
    setOpenHistorial(true);
  };

  const cerrarHistorial = () => {
    setOpenHistorial(false);
    setTiendaSeleccionada(null);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Suscripciones Mi Tienda
          </Typography>

          <Typography color="text.secondary">
            Administración global de tiendas, planes y complementos.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => setView?.("mitienda-dashboard")}
          >
            Regresar
          </Button>

          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={cargarTiendas}
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

      <Card
        sx={{
          borderRadius: 5,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            spacing={2}
            mb={2}
          >
            <Typography fontWeight={900} fontSize={18}>
              Catálogo de tiendas
            </Typography>

            <TextField
              size="small"
              placeholder="Buscar tienda, plan, estado o fecha..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              sx={(theme) => ({
                width: { xs: "100%", md: 360 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  "& fieldset": {
                    borderColor: theme.palette.divider,
                  },
                  "&:hover fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: theme.palette.primary.main,
                    borderWidth: 2,
                  },
                  "& .MuiSvgIcon-root": {
                    color: theme.palette.text.secondary,
                  },
                },
                "& .MuiInputBase-input": {
                  color: theme.palette.text.primary,
                  "&::placeholder": {
                    color: theme.palette.text.secondary,
                    opacity: 1,
                  },
                },
              })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          {loading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : isMobile ? (
            <Stack spacing={2}>
              {tiendasPaginadas.map((tienda, index) => {
                const numero = page * ROWS_PER_PAGE + index + 1;

                return (
                  <Card
                    key={tienda.id}
                    variant="outlined"
                    sx={{ borderRadius: 3 }}
                  >
                    <CardContent>
                      <Stack spacing={1}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          spacing={2}
                        >
                          <Box>
                            <Typography fontSize={12} color="text.secondary">
                              #{numero}
                            </Typography>

                            <Typography fontWeight={900} fontSize={16}>
                              {tienda.name}
                            </Typography>
                          </Box>

                          <Chip
                            size="small"
                            label={tienda.is_active ? "Activo" : "Inactivo"}
                            color={tienda.is_active ? "success" : "default"}
                          />
                        </Stack>

                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography fontSize={12} color="text.secondary">
                              Plan
                            </Typography>
                            <Typography fontSize={14} fontWeight={700}>
                              {formatPlan(tienda.plan_id)}
                            </Typography>
                          </Grid>

                          <Grid item xs={6}>
                            <Typography fontSize={12} color="text.secondary">
                              Prueba
                            </Typography>
                            <Typography fontSize={14} fontWeight={700}>
                              {formatDate(tienda.trial_ends_at)}
                            </Typography>
                          </Grid>

                          <Grid item xs={6}>
                            <Typography fontSize={12} color="text.secondary">
                              Vence
                            </Typography>
                            <Typography fontSize={14} fontWeight={700}>
                              {formatDate(tienda.plan_expiration)}
                            </Typography>
                          </Grid>
                        </Grid>

                        <Stack direction="row" spacing={1} pt={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<AddCircleOutlineIcon />}
                            onClick={() => abrirAgregar(tienda)}
                          >
                            Agregar
                          </Button>

                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<HistoryIcon />}
                            onClick={() => abrirHistorial(tienda)}
                          >
                            Historial
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}

              {tiendasFiltradas.length === 0 && (
                <Typography align="center" color="text.secondary" py={4}>
                  No hay tiendas registradas.
                </Typography>
              )}

              <TablePagination
                component="div"
                count={tiendasFiltradas.length}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={ROWS_PER_PAGE}
                rowsPerPageOptions={[ROWS_PER_PAGE]}
                labelRowsPerPage="Filas por página"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                }
              />
            </Stack>
          ) : (
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{
                borderRadius: 3,
                overflowX: "hidden",
              }}
            >
              <Table size="small" sx={{ tableLayout: "fixed", width: "100%" }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 48 }}>No.</TableCell>
                    <TableCell>Tienda</TableCell>
                    <TableCell sx={{ width: 78 }}>Plan</TableCell>
                    <TableCell sx={{ width: 98 }}>Prueba</TableCell>
                    <TableCell sx={{ width: 98 }}>Vence</TableCell>
                    <TableCell sx={{ width: 82 }}>Estado</TableCell>
                    <TableCell align="center" sx={{ width: 96 }}>
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {tiendasPaginadas.map((tienda, index) => {
                    const numero = page * ROWS_PER_PAGE + index + 1;

                    return (
                      <TableRow hover key={tienda.id}>
                        <TableCell>{numero}</TableCell>

                        <TableCell>
                          <Tooltip title={tienda.name}>
                            <Typography
                              fontWeight={800}
                              noWrap
                              sx={{
                                maxWidth: "100%",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {tienda.name}
                            </Typography>
                          </Tooltip>
                        </TableCell>

                        <TableCell>{formatPlan(tienda.plan_id)}</TableCell>

                        <TableCell>
                          {formatDate(tienda.trial_ends_at)}
                        </TableCell>

                        <TableCell>
                          {formatDate(tienda.plan_expiration)}
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            label={tienda.is_active ? "Activo" : "Inactivo"}
                            color={tienda.is_active ? "success" : "default"}
                            sx={{ height: 22, fontSize: 11 }}
                          />
                        </TableCell>

                        <TableCell align="center">
                          <Tooltip title="Agregar suscripción o complemento">
                            <IconButton
                              size="small"
                              onClick={() => abrirAgregar(tienda)}
                            >
                              <AddCircleOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Ver historial">
                            <IconButton
                              size="small"
                              onClick={() => abrirHistorial(tienda)}
                            >
                              <HistoryIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {tiendasFiltradas.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No hay tiendas registradas.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <TablePagination
                component="div"
                count={tiendasFiltradas.length}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={ROWS_PER_PAGE}
                rowsPerPageOptions={[ROWS_PER_PAGE]}
                labelRowsPerPage="Filas por página"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                }
              />
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <AgregarSuscripcionModal
        open={openAgregar}
        tienda={tiendaSeleccionada}
        onClose={cerrarAgregar}
        onSuccess={cargarTiendas}
      />

      <SuscripcionHistorialModal
        open={openHistorial}
        tienda={tiendaSeleccionada}
        onClose={cerrarHistorial}
      />
    </Box>
  );
}