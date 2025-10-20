import React from "react";
import { Grid, Paper, Stack, Typography, Card, CardActionArea, Box, CardContent } from "@mui/material";
import Page from "./Page";

export default function SistemaDetalle({ title, image }: { title: string; image: string }) {
  return (
    <Page title={title} breadcrumbs={[{ label: "Dashboard", to: "/users" }]}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
              <img src={image} alt={title} style={{ width: 120, borderRadius: 12 }} />
              <Box>
                <Typography variant="h6">Bienvenido a {title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Accesos rápidos, KPIs y acciones frecuentes del sistema.
                </Typography>
              </Box>
            </Stack>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {["Resumen", "Reportes", "Usuarios", "Ajustes"].map((t) => (
                <Grid key={t} item xs={12} sm={6} lg={3}>
                  <Card>
                    <CardActionArea>
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight={700}>{t}</Typography>
                        <Typography variant="body2" color="text.secondary">Entrar</Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Estado</Typography>
            <Stack spacing={1}>
              <Typography variant="body2">Activo</Typography>
              <Typography variant="body2">Sin incidencias</Typography>
              <Typography variant="body2">Último acceso: hace 2h</Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Page>
  );
}
