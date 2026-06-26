import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
} from "@mui/material";

import { suscripcionesGlobalService } from "../../../../services/suscripcionesGlobalService";

type Tienda = {
  id: number;
  name: string;
};

type Suscripcion = {
  id?: number;
  store_id?: number;
  plan_id?: number | null;
  complemento_id?: number | null;
  storecomplemento_id?: number | null;

  plan?: {
    id?: number;
    name?: string;
    nombre?: string;
  } | null;

  complemento?: {
    id?: number;
    name?: string;
    nombre?: string;
    precio?: number | string | null;
    tipo?: string | null;
    nota?: string | null;
  } | null;

  store_complemento?: {
    id?: number;
    store_id?: number;
    complemento_id?: number;
    status?: string;
    cantidad?: number;
    fecha_inicio?: string | null;
    fecha_fin?: string | null;
    notas?: string | null;
    complemento?: {
      id?: number;
      nombre?: string;
      precio?: number | string | null;
      tipo?: string | null;
      nota?: string | null;
    } | null;
  } | null;

  status?: string;
  estado?: string;
  starts_at?: string | null;
  ends_at?: string | null;
  monto?: number | string | null;
  created_at?: string | null;
};

type Props = {
  open: boolean;
  tienda: Tienda | null;
  onClose: () => void;
};

function formatDate(value?: string | null) {
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

function formatMoney(value?: number | string | null) {
  const numberValue = Number(value ?? 0);

  return numberValue.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

function formatPlan(planId?: number | null) {
  if (planId === 1) return "Plan Demo";
  if (planId === 2) return "Plan Negocio";
  if (planId === 3) return "Plan Profesional";
  if (planId === 4) return "Plan Avanzado";
  if (planId === null || planId === undefined) return "Sin plan";

  return `Plan ${planId}`;
}

function getConcepto(item: Suscripcion) {
  if (item.storecomplemento_id || item.store_complemento) {
    return (
      item.store_complemento?.complemento?.nombre ||
      `Complemento ${
        item.store_complemento?.complemento_id ??
        item.storecomplemento_id ??
        ""
      }`
    );
  }

  if (item.complemento_id || item.complemento) {
    return (
      item.complemento?.nombre ||
      item.complemento?.name ||
      `Complemento ${item.complemento_id ?? item.complemento?.id ?? ""}`
    );
  }

  if (item.plan_id || item.plan) {
    return (
      item.plan?.nombre ||
      item.plan?.name ||
      formatPlan(item.plan_id ?? item.plan?.id ?? null)
    );
  }

  return "N/A";
}

function getTipo(item: Suscripcion) {
  if (item.storecomplemento_id || item.store_complemento) {
    return "Complemento";
  }

  if (item.complemento_id || item.complemento) {
    return "Complemento";
  }

  if (item.plan_id || item.plan) {
    return "Plan";
  }

  return "N/A";
}

export default function SuscripcionHistorialModal({
  open,
  tienda,
  onClose,
}: Props) {
  const [historial, setHistorial] = useState<Suscripcion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cargarHistorial = async () => {
    if (!tienda?.id) return;

    try {
      setLoading(true);
      setError("");

      const response =
        await suscripcionesGlobalService.obtenerSuscripcionesPorTienda(
          tienda.id
        );

      const data = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      setHistorial(data);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "No se pudo cargar el historial.";

      setError(message);
      setHistorial([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && tienda?.id) {
      cargarHistorial();
    }
  }, [open, tienda?.id]);

  const handleClose = () => {
    if (loading) return;

    setError("");
    setHistorial([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle fontWeight={900}>Historial de suscripciones</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Box>
            <Typography fontSize={13} color="text.secondary">
              Tienda seleccionada
            </Typography>

            <Tooltip title={tienda?.name || ""}>
              <Typography
                fontWeight={900}
                noWrap
                sx={{
                  maxWidth: 360,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {tienda?.name || "N/A"}
              </Typography>
            </Tooltip>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          {loading ? (
            <Box display="flex" justifyContent="center" py={5}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small" sx={{ tableLayout: "fixed" }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Tipo</TableCell>
                    <TableCell sx={{ width: 100 }}>Inicio</TableCell>
                    <TableCell sx={{ width: 100 }}>Fin</TableCell>
                    <TableCell sx={{ width: 110 }}>Monto</TableCell>
                    <TableCell sx={{ width: 120 }}>Estado</TableCell>
                    <TableCell sx={{ width: 100 }}>Registro</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {historial.map((item, index) => {
                    const tipo = getTipo(item);
                    const concepto = getConcepto(item);

                    return (
                      <TableRow key={item.id ?? index}>
                        <TableCell>
                          <Tooltip title={`${tipo} - ${concepto}`}>
                            <Box>
                              <Typography fontWeight={800} noWrap>
                                {tipo}
                              </Typography>

                              <Typography
                                fontSize={12}
                                color="text.secondary"
                                noWrap
                              >
                                {concepto}
                              </Typography>
                            </Box>
                          </Tooltip>
                        </TableCell>

                        <TableCell>{formatDate(item.starts_at)}</TableCell>
                        <TableCell>{formatDate(item.ends_at)}</TableCell>
                        <TableCell>{formatMoney(item.monto)}</TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            label={item.status || item.estado || "N/A"}
                            sx={{ height: 22, fontSize: 11 }}
                          />
                        </TableCell>

                        <TableCell>{formatDate(item.created_at)}</TableCell>
                      </TableRow>
                    );
                  })}

                  {historial.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No hay historial registrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}