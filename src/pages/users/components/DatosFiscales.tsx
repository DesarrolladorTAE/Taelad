import React from "react";
import { Grid, Paper, Typography, TextField, Button, Stack, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import Page from "./Page";

export default function DatosFiscales() {
  return (
    <Page title="Datos fiscales">
      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Razón social" placeholder="ELAD y Asociados Consultores, S.C." /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="RFC" placeholder="EAC123456789" /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Régimen fiscal" placeholder="601 - General de Ley Personas Morales" /></Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Uso CFDI</InputLabel>
                  <Select label="Uso CFDI" defaultValue="G03">
                    <MenuItem value="G03">G03 - Gastos en general</MenuItem>
                    <MenuItem value="P01">P01 - Por definir</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}><Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>Domicilio fiscal</Typography></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Calle" /></Grid>
              <Grid item xs={12} sm={3}><TextField fullWidth label="No. ext" /></Grid>
              <Grid item xs={12} sm={3}><TextField fullWidth label="No. int" /></Grid>
              <Grid item xs={12} sm={4}><TextField fullWidth label="Colonia" /></Grid>
              <Grid item xs={12} sm={4}><TextField fullWidth label="Municipio" /></Grid>
              <Grid item xs={12} sm={4}><TextField fullWidth label="CP" /></Grid>

              <Grid item xs={12}>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained">Guardar</Button>
                  <Button variant="outlined">Validar con SAT</Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Archivos de certificados</Typography>
            <Stack spacing={1}>
              <Button variant="outlined">Subir .CER</Button>
              <Button variant="outlined">Subir .KEY</Button>
              <TextField label="Contraseña de sello" type="password" />
              <Button variant="contained">Guardar llaves</Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Page>
  );
}
