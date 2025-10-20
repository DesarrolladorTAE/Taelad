import React, { useState } from "react";
import { Paper, Tabs, Tab, Box, Grid, TextField, FormControlLabel, Switch, Button, Stack } from "@mui/material";
import Page from "./Page";

export default function Configuracion() {
  const [tab, setTab] = useState(0);
  return (
    <Page title="Configuración">
      <Paper sx={{ p: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label="General" />
          <Tab label="Notificaciones" />
          <Tab label="Integraciones" />
          <Tab label="Avanzado" />
        </Tabs>
        <Box sx={{ mt: 2 }}>
          {tab === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Nombre comercial" placeholder="Tecnologías Administrativas ELAD" /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Dominio" placeholder="mitiendaenlineamx.com.mx" /></Grid>
              <Grid item xs={12} sm={6}><FormControlLabel control={<Switch defaultChecked />} label="Modo oscuro por defecto" /></Grid>
              <Grid item xs={12} sm={6}><FormControlLabel control={<Switch />} label="Habilitar beta features" /></Grid>
              <Grid item xs={12}><Button variant="contained">Guardar</Button></Grid>
            </Grid>
          )}
          {tab === 1 && (
            <Stack spacing={2}>
              <FormControlLabel control={<Switch defaultChecked />} label="WhatsApp" />
              <FormControlLabel control={<Switch />} label="Correo electrónico" />
              <FormControlLabel control={<Switch />} label="SMS" />
              <Button variant="contained">Guardar preferencias</Button>
            </Stack>
          )}
          {tab === 2 && (
            <Stack spacing={2}>
              <TextField fullWidth label="API Key (Conekta)" placeholder="ck_test_xxx" />
              <TextField fullWidth label="Webhook URL" placeholder="https://api.tu-dominio.com/webhooks/conekta" />
              <Button variant="contained">Guardar integraciones</Button>
            </Stack>
          )}
          {tab === 3 && (
            <Stack spacing={2}>
              <FormControlLabel control={<Switch />} label="Activar modo mantenimiento" />
              <Button color="error" variant="outlined">Reiniciar caché</Button>
            </Stack>
          )}
        </Box>
      </Paper>
    </Page>
  );
}
