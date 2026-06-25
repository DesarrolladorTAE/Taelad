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
  Grid,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

type Props = {
  setView?: (view: string) => void;
};

type Metricas = {
  ventas: number;
  ingresos: number;
  facturadas: number;
  sin_facturar: number;
  crecimiento: number;
  actividad: number;
  uso: number;
};

const getCurrentMonth = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
};

const formatCurrency = (value: number) => {
  return `$${Number(value || 0).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function MiTiendaMetricas({ setView }: Props) {
  const [data, setData] = useState<Metricas>({
    ventas: 0,
    ingresos: 0,
    facturadas: 0,
    sin_facturar: 0,
    crecimiento: 0,
    actividad: 0,
    uso: 0,
  });

  const [mes, setMes] = useState(getCurrentMonth());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMetricas = async () => {
      setLoading(true);

      try {
        const res = await axiosClient.get("/superadmin/mitienda/metricas", {
          params: { mes },
        });

        setData({
          ventas: Number(res.data?.data?.ventas ?? 0),
          ingresos: Number(res.data?.data?.ingresos ?? 0),
          facturadas: Number(res.data?.data?.facturadas ?? 0),
          sin_facturar: Number(res.data?.data?.sin_facturar ?? 0),
          crecimiento: Number(res.data?.data?.crecimiento ?? 0),
          actividad: Number(res.data?.data?.actividad ?? 0),
          uso: Number(res.data?.data?.uso ?? 0),
        });
      } catch (error) {
        console.error("Error cargando métricas:", error);

        setData({
          ventas: 0,
          ingresos: 0,
          facturadas: 0,
          sin_facturar: 0,
          crecimiento: 0,
          actividad: 0,
          uso: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMetricas();
  }, [mes]);

  const avanceFacturacion = useMemo(() => {
    if (!data.ventas) return 0;
    return Math.round((data.facturadas / data.ventas) * 100);
  }, [data]);

  const avancePendientes = useMemo(() => {
    if (!data.ventas) return 0;
    return Math.round((data.sin_facturar / data.ventas) * 100);
  }, [data]);

  const cards = [
    {
      titulo: "Ventas del mes",
      valor: data.ventas,
      icon: <ShoppingCartIcon />,
      color: "primary.main",
    },
    {
      titulo: "Ingresos generados",
      valor: formatCurrency(data.ingresos),
      icon: <AttachMoneyIcon />,
      color: "success.main",
    },
    {
      titulo: "Facturadas",
      valor: data.facturadas,
      icon: <CheckCircleIcon />,
      color: "success.main",
    },
    {
      titulo: "Sin facturar",
      valor: data.sin_facturar,
      icon: <PendingActionsIcon />,
      color: "warning.main",
    },
  ];

  if (loading) {
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

        <Box
          sx={{
            minHeight: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

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
            Métricas
          </Typography>

          <Typography color="text.secondary">
            Estadísticas mensuales de ventas y facturación de Mi Tienda.
          </Typography>
        </Box>

        <TextField
          size="small"
          label="Mes"
          type="month"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          sx={{
            width: { xs: "100%", sm: 190 },
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
            },
          }}
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            startAdornment: <CalendarMonthIcon fontSize="small" sx={{ mr: 1 }} />,
          }}
        />
      </Stack>

      <Grid container spacing={3}>
        {cards.map((item) => (
          <Grid item xs={12} md={3} key={item.titulo}>
            <Card
              sx={{
                borderRadius: 5,
                height: "100%",
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: item.color,
                      width: 55,
                      height: 55,
                    }}
                  >
                    {item.icon}
                  </Avatar>

                  <Box>
                    <Typography fontSize={13} color="text.secondary">
                      {item.titulo}
                    </Typography>

                    <Typography fontSize={26} fontWeight={900}>
                      {item.valor}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} mt={1}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 5,
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Box>
                  <Typography fontSize={18} fontWeight={900}>
                    Avance de facturación
                  </Typography>

                  <Typography color="text.secondary" fontSize={13}>
                    Porcentaje de operaciones ya facturadas.
                  </Typography>
                </Box>

                <Chip
                  label={`${avanceFacturacion}%`}
                  color="success"
                  sx={{ fontWeight: 800 }}
                />
              </Stack>

              <LinearProgress
                variant="determinate"
                value={avanceFacturacion}
                sx={{ height: 12, borderRadius: 6 }}
              />

              <Stack direction="row" justifyContent="space-between" mt={2}>
                <Typography fontSize={13} color="text.secondary">
                  Facturadas: {data.facturadas}
                </Typography>

                <Typography fontSize={13} color="text.secondary">
                  Total: {data.ventas}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 5,
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Box>
                  <Typography fontSize={18} fontWeight={900}>
                    Operaciones pendientes
                  </Typography>

                  <Typography color="text.secondary" fontSize={13}>
                    Porcentaje de registros sin facturar.
                  </Typography>
                </Box>

                <Chip
                  label={`${avancePendientes}%`}
                  color="warning"
                  sx={{ fontWeight: 800 }}
                />
              </Stack>

              <LinearProgress
                variant="determinate"
                value={avancePendientes}
                sx={{ height: 12, borderRadius: 6 }}
              />

              <Stack direction="row" justifyContent="space-between" mt={2}>
                <Typography fontSize={13} color="text.secondary">
                  Sin facturar: {data.sin_facturar}
                </Typography>

                <Typography fontSize={13} color="text.secondary">
                  Total: {data.ventas}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}