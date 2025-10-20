import React, { useEffect, useState } from "react";
import {
  Grid,
  Paper,
  Stack,
  Avatar,
  Button,
  TextField,
  Typography,
  Chip,
  FormControlLabel,
  Switch,
  Box,
} from "@mui/material";
import Page from "./Page";
import { brandBlue } from "./Shell";
import { authSession, User } from "../../../services/api";

export default function MiCuenta() {
  // const [user, setUser] = useState<{ name: string; apellidos?: string; email: string; phone?: string } | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Cargar usuario del localStorage al montar
  useEffect(() => {
    const session = authSession.getSession();
    if (session?.user) {
      setUser(session.user);
    }
  }, []);

  // Maneja cambios de input
  const handleChange = (field: string, value: string) => {
    setUser((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  // Guardar cambios localmente (por ahora sin backend)
  const handleSave = () => {
    if (!user) return;
    const session = authSession.getSession();
    if (session) {
      localStorage.setItem("auth_user", JSON.stringify({ ...session.user, ...user }));
      alert("✅ Datos actualizados localmente.");
    }
  };

  return (
    <Page title="Mi cuenta">
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Stack spacing={2} alignItems="center">
              <Avatar
                sx={{ width: 96, height: 96, bgcolor: brandBlue, fontSize: 32 }}
              >
                {user?.name?.[0]?.toUpperCase() || "U"}
              </Avatar>
              <Button variant="outlined">Cambiar foto</Button>
              <Stack spacing={1} sx={{ width: "100%" }}>
                <TextField
                  label="Nombre"
                  fullWidth
                  value={user?.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
                <TextField
                  label="Apellidos"
                  fullWidth
                  value={user?.apellidos || ""}
                  onChange={(e) => handleChange("apellidos", e.target.value)}
                />
                <TextField
                  label="Email"
                  fullWidth
                  value={user?.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
                <TextField
                  label="Teléfono"
                  fullWidth
                  value={user?.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
                <Button variant="contained" size="large" onClick={handleSave}>
                  Guardar cambios
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Accesos rápidos
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label="Seguridad" variant="outlined" />
              <Chip label="Privacidad" variant="outlined" />
              <Chip label="Notificaciones" variant="outlined" />
              <Chip label="Suscripciones" variant="outlined" />
            </Stack>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Preferencias
            </Typography>
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
