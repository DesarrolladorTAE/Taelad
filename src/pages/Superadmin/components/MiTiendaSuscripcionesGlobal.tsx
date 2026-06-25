import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";

import { suscripcionesGlobalService } from "../../../services/suscripcionesGlobalService";

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

function formatDate(value: string | null) {
  if (!value) return "N/A";

  return new Date(value).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function MiTiendaSuscripcionesGlobal({ setView }: Props) {
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarTiendas = async () => {
    try {
      setLoading(true);

      const response = await suscripcionesGlobalService.obtenerTiendas();

      setTiendas(response?.data ?? []);
    } catch (error) {
      console.error("Error cargando tiendas:", error);
      setTiendas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTiendas();
  }, []);

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

      <Card
        sx={{
          borderRadius: 5,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent>
          <Typography fontWeight={900} fontSize={18} mb={2}>
            Catálogo de tiendas
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{
                borderRadius: 3,
                overflowX: "auto",
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Tienda</TableCell>
                    <TableCell>Plan actual</TableCell>
                    <TableCell>Fin de prueba</TableCell>
                    <TableCell>Expiración</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {tiendas.map((tienda) => (
                    <TableRow hover key={tienda.id}>
                      <TableCell>{tienda.id}</TableCell>

                      <TableCell>
                        <Typography fontWeight={800}>
                          {tienda.name}
                        </Typography>
                      </TableCell>

                      <TableCell>{tienda.plan_id ?? "Sin plan"}</TableCell>

                      <TableCell>{formatDate(tienda.trial_ends_at)}</TableCell>

                      <TableCell>{formatDate(tienda.plan_expiration)}</TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={tienda.is_active ? "Activo" : "Inactivo"}
                          color={tienda.is_active ? "success" : "default"}
                        />
                      </TableCell>
                    </TableRow>
                  ))}

                  {tiendas.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No hay tiendas registradas.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}