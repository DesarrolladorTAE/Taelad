import React from "react";
import { Grid, Paper, Stack, Avatar, Button, TextField, Typography, Chip, FormControlLabel, Switch, Box } from "@mui/material";
import Page from "./Page";
import { brandBlue } from "./Shell";

export default function MiCuenta() {
  return (
    <Page title="Mi cuenta">
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Stack spacing={2} alignItems="center">
              <Avatar sx={{ width: 96, height: 96, bgcolor: brandBlue }}>RA</Avatar>
              <Button variant="outlined">Cambiar foto</Button>
              <Stack spacing={1} sx={{ width: "100%" }}>
                <TextField label="Nombre" fullWidth defaultValue="Raúl Alvarez" />
                <TextField label="Email" fullWidth defaultValue="raul@ejemplo.com" />
                <TextField label="Teléfono" fullWidth defaultValue="+52 221 691 9071" />
                <Button variant="contained" size="large">Guardar cambios</Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Accesos rápidos</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label="Seguridad" variant="outlined" />
              <Chip label="Privacidad" variant="outlined" />
              <Chip label="Notificaciones" variant="outlined" />
              <Chip label="Suscripciones" variant="outlined" />
            </Stack>
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Preferencias</Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControlLabel control={<Switch defaultChecked />} label="Modo compacto" />
              <FormControlLabel control={<Switch />} label="Recordar sesión" />
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Page>
  );
}
