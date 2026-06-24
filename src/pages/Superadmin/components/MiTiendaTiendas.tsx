import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../../services/axiosClient";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@mui/material";

export default function MiTiendaTiendas() {
  const { id } = useParams();
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const ITEMS_PER_PAGE = 16;
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get("/superadmin/mitienda/tiendas");
        setData(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (error) {
        console.error(error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = page * ITEMS_PER_PAGE;
  const paginated = data.slice(start, end);

  const basePath = `/superadmin/mitienda/${id}`;

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h5" fontWeight={800} mb={2}>
        Tiendas
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : isMobile ? (
        <Grid container spacing={2}>
          {paginated.map((t, i) => (
            <Grid item xs={12} key={i}>
              <Card
                sx={{
                  borderRadius: 3,
                  cursor: "pointer",
                  backgroundColor:
                    theme.palette.mode === "dark" ? "#1f1f1f" : "#fff",
                }}
              >
                <CardContent>
                  <Typography fontWeight={700}>{t.nombre}</Typography>
                  <Typography variant="body2">Tel: {t.telefono ?? "N/A"}</Typography>
                  <Chip
                    label={t.plan?.estado ?? "Sin plan"}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ ml: 1 }}
                    onClick={() =>
                      navigate(`${basePath}/tiendas/${t.id}`)
                    }
                  >
                    Detalles
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Teléfono</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.map((t, i) => (
                <TableRow
                  key={i}
                  hover
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>{t.nombre}</TableCell>
                  <TableCell>{t.telefono}</TableCell>
                  <TableCell>
                    <Chip
                      label={t.plan?.estado ?? "Sin plan"}
                      size="small"
                      color={t.plan?.estado === "Activa" ? "success" : "default"}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`${basePath}/tiendas/${t.id}`)}
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

      {/* PAGINACIÓN */}
      <Box mt={3} display="flex" gap={2} alignItems="center">
        <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Anterior
        </Button>
        <Typography>Página {page}</Typography>
        <Button disabled={end >= data.length} onClick={() => setPage(page + 1)}>
          Siguiente
        </Button>
      </Box>
    </Box>
  );
}