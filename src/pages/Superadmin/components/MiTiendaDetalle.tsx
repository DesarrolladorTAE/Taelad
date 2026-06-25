import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../../services/axiosClient";

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StorefrontIcon from "@mui/icons-material/Storefront";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LinkIcon from "@mui/icons-material/Link";

export default function MiTiendaDetalle() {
  const { tiendaId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTienda = async () => {
      setLoading(true);

      try {
        const res = await axiosClient.get(
          `/superadmin/mitienda/tiendas/${tiendaId}`
        );

        setData(res.data?.data ?? res.data ?? null);
      } catch (error) {
        console.error("Error cargando detalle de tienda:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    if (tiendaId) fetchTienda();
  }, [tiendaId]);

  const estadoPlan = data?.plan?.estado ?? "Sin plan";

  const getEstadoColor = (estado?: string) => {
    if (!estado) return "default";
    if (estado === "Activa" || estado === "Activo") return "success";
    if (estado === "Vencida" || estado === "Inactiva") return "error";
    return "default";
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 350,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return (
      <Card sx={{ borderRadius: 4 }}>
        <CardContent>
          <Typography fontWeight={900}>No se encontró la tienda</Typography>
          <Typography color="text.secondary" mt={1}>
            No fue posible cargar la información solicitada.
          </Typography>

          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ mt: 2, borderRadius: 3 }}
          >
            Regresar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
        mb={3}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ borderRadius: 3 }}
        >
          Regresar
        </Button>

        <Chip
          label={estadoPlan}
          color={getEstadoColor(estadoPlan) as any}
          sx={{ fontWeight: 700 }}
        />
      </Stack>

      <Card
        sx={{
          borderRadius: 5,
          mb: 3,
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <Box
          sx={{
            p: { xs: 3, md: 4 },
            background:
              "linear-gradient(135deg, rgba(25,118,210,0.18), rgba(156,39,176,0.12))",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={3}
          >
            <Avatar
              sx={{
                width: 82,
                height: 82,
                bgcolor: "primary.main",
              }}
            >
              <StorefrontIcon sx={{ fontSize: 42 }} />
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h4" fontWeight={900}>
                {data.nombre ?? "Tienda sin nombre"}
              </Typography>

              <Typography color="text.secondary" mt={0.5}>
                ID de tienda: {data.id ?? tiendaId}
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                mt={2}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <EmailIcon fontSize="small" />
                  <Typography fontSize={14}>
                    {data.email ?? "Sin correo"}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <PhoneIcon fontSize="small" />
                  <Typography fontSize={14}>
                    {data.telefono ?? "Sin teléfono"}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 5, height: "100%" }}>
            <CardContent>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <WorkspacePremiumIcon />
                </Avatar>

                <Typography fontWeight={900} fontSize={18}>
                  Plan
                </Typography>
              </Stack>

              <Divider sx={{ mb: 2 }} />

              <Typography fontSize={13} color="text.secondary">
                Nombre del plan
              </Typography>
              <Typography fontWeight={800} mb={2}>
                {data.plan?.nombre_plan ?? "Sin plan"}
              </Typography>

              <Typography fontSize={13} color="text.secondary">
                Estado
              </Typography>
              <Chip
                label={estadoPlan}
                color={getEstadoColor(estadoPlan) as any}
                size="small"
                sx={{ my: 1 }}
              />

              <Typography fontSize={13} color="text.secondary" mt={2}>
                Fecha de vencimiento
              </Typography>
              <Typography fontWeight={800}>
                {data.plan?.vence ?? "N/A"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 5, height: "100%" }}>
            <CardContent>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <ReceiptLongIcon />
                </Avatar>

                <Typography fontWeight={900} fontSize={18}>
                  Datos fiscales
                </Typography>
              </Stack>

              <Divider sx={{ mb: 2 }} />

              <Typography fontSize={13} color="text.secondary">
                RFC
              </Typography>
              <Typography fontWeight={800} mb={2}>
                {data.datos_fiscales?.rfc ?? "N/A"}
              </Typography>

              <Typography fontSize={13} color="text.secondary">
                Razón social
              </Typography>
              <Typography fontWeight={800}>
                {data.datos_fiscales?.razon_social ?? "N/A"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 5, height: "100%" }}>
            <CardContent>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <LinkIcon />
                </Avatar>

                <Typography fontWeight={900} fontSize={18}>
                  TAECONTA
                </Typography>
              </Stack>

              <Divider sx={{ mb: 2 }} />

              <Typography fontSize={13} color="text.secondary">
                Correo vinculado
              </Typography>
              <Typography fontWeight={800}>
                {data.taeconta?.correo_tae ?? "N/A"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}