import React from "react";
import { Grid, Card, CardContent, Typography, Chip, Stack, CardActionArea } from "@mui/material";
import Page from "./Page";

const novedades = [
  { id: 1, titulo: "Nuevo módulo de reportes en TAECONTA", tag: "TAECONTA", desc: "Exporta PDF y Excel por periodo y RFC.", fecha: "2025-10-10" },
  { id: 2, titulo: "Conekta Embedded Checkout en MiTienda", tag: "MiTienda", desc: "Pagos embebidos sin salir de tu panel.", fecha: "2025-10-08" },
  { id: 3, titulo: "Botón de recargas rápidas", tag: "TeLoRecargo", desc: "Flujo en 3 pasos y ticket directo a WhatsApp.", fecha: "2025-10-05" },
];

export default function Dashboard() {
  return (
    <Page title="Dashboard">
      <Typography variant="h6" sx={{ mb: 1 }}>Últimas novedades</Typography>
      <Grid container spacing={2}>
        {novedades.map((n) => (
          <Grid item xs={12} md={4} key={n.id}>
            <Card>
              <CardActionArea>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: .5 }}>
                    <Chip size="small" label={n.tag} color="primary" />
                    <Typography variant="caption" color="text.secondary">{n.fecha}</Typography>
                  </Stack>
                  <Typography variant="subtitle1" fontWeight={700}>{n.titulo}</Typography>
                  <Typography variant="body2" color="text.secondary">{n.desc}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Page>
  );
}
