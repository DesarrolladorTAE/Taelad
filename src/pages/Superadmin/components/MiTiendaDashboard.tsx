import { useParams, useNavigate } from "react-router-dom";
import { Grid, Card, CardContent, Typography, Box } from "@mui/material";

export default function MiTiendaDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const basePath = `/superadmin/mitienda/${id}`;

  return (
    <Box sx={{ width: "100%" }}>
      
      {/* HEADER */}
      <Box mb={3}>
        <Typography variant="h5" fontWeight={800}>
          Dashboard Mi Tienda
        </Typography>

        <Typography color="text.secondary">
          Gestión general del sistema
        </Typography>
      </Box>

      {/* CARDS */}
      <Grid container spacing={3}>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            onClick={() => navigate(`${basePath}/usuarios`)}
            sx={{
              cursor: "pointer",
              borderRadius: 3,
              transition: "0.2s",
              "&:hover": { transform: "translateY(-4px)" },
            }}
          >
            <CardContent>
              <Typography fontWeight={700}>Usuarios</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            onClick={() => navigate(`${basePath}/tiendas`)}
            sx={{
              cursor: "pointer",
              borderRadius: 3,
              transition: "0.2s",
              "&:hover": { transform: "translateY(-4px)" },
            }}
          >
            <CardContent>
              <Typography fontWeight={700}>Tiendas</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            onClick={() => navigate(`${basePath}/ventas`)}
            sx={{
              cursor: "pointer",
              borderRadius: 3,
              transition: "0.2s",
              "&:hover": { transform: "translateY(-4px)" },
            }}
          >
            <CardContent>
              <Typography fontWeight={700}>Ventas</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            onClick={() => navigate(`${basePath}/metricas`)}
            sx={{
              cursor: "pointer",
              borderRadius: 3,
              transition: "0.2s",
              "&:hover": { transform: "translateY(-4px)" },
            }}
          >
            <CardContent>
              <Typography fontWeight={700}>Métricas</Typography>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
}