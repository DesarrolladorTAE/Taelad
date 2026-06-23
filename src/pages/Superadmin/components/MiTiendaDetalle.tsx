import { Box, Card, Typography, Grid, Divider } from "@mui/material";
import { useLocation, useParams } from "react-router-dom";

export default function MiTiendaDetalle() {
  const { state } = useLocation();
  const { id } = useParams();

  const user = state;

  if (!user) {
    return (
      <Box p={3}>
        <Typography>No hay datos (ID: {id})</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Card sx={{ p: 3 }}>
        <Typography fontWeight={800}>Detalle Mi Tienda</Typography>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography>ID: {user.id}</Typography>
            <Typography>Nombre: {user.name} {user.apellidos}</Typography>
            <Typography>Email: {user.email}</Typography>
            <Typography>Teléfono: {user.phone}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography>Ganancias: {user.ganancias}</Typography>
            <Typography>Rol: {user.role}</Typography>
            <Typography>Código: {user.codigo_ref ?? "N/A"}</Typography>
            <Typography>Terminos: {user.terminos ? "Sí" : "No"}</Typography>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}