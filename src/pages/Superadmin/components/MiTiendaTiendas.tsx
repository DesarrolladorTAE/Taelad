import { useEffect, useMemo, useState } from "react";
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
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import StorefrontIcon from "@mui/icons-material/Storefront";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

type Props = {
  setView?: (view: string) => void;
};

export default function MiTiendaTiendas({ setView }: Props) {
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [openDetalle, setOpenDetalle] = useState(false);
  const [detalle, setDetalle] = useState<any>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const ITEMS_PER_PAGE = 16;
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchTiendas = async () => {
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
    };

    fetchTiendas();
  }, []);

  const filteredData = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return data;

    return data.filter((t) => {
      const nombre = String(t.nombre ?? "").toLowerCase();
      const telefono = String(t.telefono ?? "").toLowerCase();
      const email = String(t.email ?? "").toLowerCase();

      return (
        nombre.includes(value) ||
        telefono.includes(value) ||
        email.includes(value)
      );
    });
  }, [data, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  );

  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = page * ITEMS_PER_PAGE;

    return filteredData.slice(start, end);
  }, [filteredData, page]);

  const getEstadoColor = (estado?: string) => {
    if (!estado) return "default";
    if (estado === "Activa" || estado === "Activo") return "success";
    if (estado === "Vencida" || estado === "Inactiva") return "error";
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
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Tiendas
          </Typography>

          <Typography color="text.secondary">
            Listado general de tiendas registradas en Mi Tienda.
          </Typography>
        </Box>

        <TextField
          size="small"
          placeholder="Buscar tienda, teléfono o correo"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          sx={{
            width: { xs: "100%", md: 360 },
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ bgcolor: "primary.main" }}>
                <StorefrontIcon />
              </Avatar>

              <Box>
                <Typography fontSize={13} color="text.secondary">
                  Total de tiendas
                </Typography>
                <Typography fontSize={24} fontWeight={900}>
                  {data.length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography fontSize={13} color="text.secondary">
                Resultados filtrados
              </Typography>
              <Typography fontSize={24} fontWeight={900}>
                {filteredData.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography fontSize={13} color="text.secondary">
                Página actual
              </Typography>
              <Typography fontSize={24} fontWeight={900}>
                {page} / {totalPages}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
          {paginated.map((t) => (
            <Grid item xs={12} key={t.id}>
              <Card
                sx={{
                  borderRadius: 4,
                  backgroundColor:
                    theme.palette.mode === "dark" ? "#1f1f1f" : "#fff",
                }}
              >
                <CardContent>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography fontWeight={900}>
                        {t.nombre ?? "Sin nombre"}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {t.email ?? "Sin correo"}
                      </Typography>
                    </Box>

                    <Typography variant="body2">
                      Teléfono: {t.telefono ?? "N/A"}
                    </Typography>

                    <Chip
                      label={t.plan?.estado ?? "Sin plan"}
                      size="small"
                      color={getEstadoColor(t.plan?.estado) as any}
                      sx={{ width: "fit-content" }}
                    />

                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => abrirDetalle(t.id)}
                      sx={{ borderRadius: 3 }}
                    >
                      Detalles
                    </Button>
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
                <TableCell sx={{ fontWeight: 900 }}>Tienda</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Correo</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Teléfono</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 900 }} align="right">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        <StorefrontIcon fontSize="small" />
                      </Avatar>

                      <Box>
                        <Typography fontWeight={800}>
                          {t.nombre ?? "Sin nombre"}
                        </Typography>

                        <Typography fontSize={12} color="text.secondary">
                          ID: {t.id}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  <TableCell>{t.email ?? "Sin correo"}</TableCell>
                  <TableCell>{t.telefono ?? "N/A"}</TableCell>

                  <TableCell>
                    <Chip
                      label={t.plan?.estado ?? "Sin plan"}
                      size="small"
                      color={getEstadoColor(t.plan?.estado) as any}
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => abrirDetalle(t.id)}
                      sx={{ borderRadius: 3 }}
                    >
                      Detalles
                    </Button>
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
          onClick={() => setPage((prev) => prev - 1)}
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
          onClick={() => setPage((prev) => prev + 1)}
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
                    {detalle.nombre ?? "Sin nombre"}
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
                    {detalle.telefono ?? "N/A"}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography fontSize={13} color="text.secondary">
                    Plan
                  </Typography>
                  <Typography fontWeight={800}>
                    {detalle.plan?.nombre_plan ?? "Sin plan"}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography fontSize={13} color="text.secondary">
                    Estado del plan
                  </Typography>
                  <Chip
                    label={detalle.plan?.estado ?? "Sin plan"}
                    size="small"
                    color={getEstadoColor(detalle.plan?.estado) as any}
                    sx={{ mt: 0.5 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography fontSize={13} color="text.secondary">
                    Vencimiento
                  </Typography>
                  <Typography fontWeight={800}>
                    {detalle.plan?.vence ?? "N/A"}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography fontSize={13} color="text.secondary">
                    Correo TAECONTA
                  </Typography>
                  <Typography fontWeight={800}>
                    {detalle.taeconta?.correo_tae ?? "N/A"}
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
    </Box>
  );
}