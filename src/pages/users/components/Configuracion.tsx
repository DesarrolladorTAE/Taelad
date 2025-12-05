import React, { useEffect, useMemo, useState } from "react";
import {
  Paper, Tabs, Tab, Box, Grid, TextField, FormControlLabel, Switch,
  Button, Stack, Typography, Chip, Divider, Select, MenuItem, InputLabel, FormControl,
  IconButton, InputAdornment, Avatar
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Page from "./Page";
import { accountApi } from "../../../services/api";

type SystemKey = "taeconta" | "telorecargo" | "mitiendaenlinea";
type LoginType = "email" | "phone" | "username";

// Map de logos en /public/logo/*
const SYSTEM_LOGOS: Record<SystemKey, string> = {
  mitiendaenlinea: "/logo/mitienda.png",
  taeconta: "/logo/taeconta.png",
  telorecargo: "/logo/telorecargo.png",
};

function CredentialPane({
  system,
  title,
  logoSrc,
}: {
  system: SystemKey;
  title: string;
  logoSrc: string;
}) {
  const [loginType, setLoginType] = useState<LoginType>("email");
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [extra, setExtra] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await accountApi.getCredential(system);
      const cred = data?.data;
      if (cred) {
        setLoginType(cred.login_type as LoginType);
        setLoginValue(cred.login_value || "");
        setPassword(cred.credential_password ? "••••••••" : "");
        setExtra(cred.extra ? JSON.stringify(cred.extra, null, 2) : "");
        setIsActive(!!cred.is_active);
      } else {
        setLoginType("email");
        setLoginValue("");
        setPassword("");
        setExtra("");
        setIsActive(true);
      }
    } catch {
      setLoginType("email");
      setLoginValue("");
      setPassword("");
      setExtra("");
      setIsActive(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [system]);

  const parsedExtra = useMemo(() => {
    if (!extra.trim()) return undefined;
    try {
      return JSON.parse(extra);
    } catch {
      return "__INVALID_JSON__";
    }
  }, [extra]);

  const handleSave = async () => {
    if (parsedExtra === "__INVALID_JSON__") {
      alert("El campo EXTRA debe ser un JSON válido (o déjalo vacío).");
      return;
    }
    try {
      setSaving(true);
      await accountApi.upsertCredential({
        system,
        login_type: loginType,
        login_value: loginValue,
        credential_password: password && password !== "••••••••" ? password : undefined,
        extra: parsedExtra as any,
        is_active: isActive,
      });
      alert("✅ Credencial guardada");
      setPassword("••••••••");
    } catch (e: any) {
      alert(`❌ Error al guardar: ${e?.message || "Error desconocido"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const ok = window.confirm(`¿Eliminar credencial de "${title}"?`);
    if (!ok) return;
    try {
      setSaving(true);
      await accountApi.deleteCredential(system);
      alert("🗑️ Credencial eliminada");
      setLoginType("email");
      setLoginValue("");
      setPassword("");
      setExtra("");
      setIsActive(true);
    } catch (e: any) {
      alert(`❌ Error al eliminar: ${e?.message || "Error desconocido"}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Avatar
            src={logoSrc}
            alt={title}
            variant="rounded"
            sx={{ width: 36, height: 36, borderRadius: 1 }}
          />
          <Typography variant="h6">{title}</Typography>
        </Stack>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          Registra tus credenciales de <b>{title}</b>. Si ya tienes una guardada, se mostrará automáticamente.
        </Typography>
        <Divider sx={{ my: 1 }} />
      </Grid>

      <Grid item xs={12}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label="Asociada a tu usuario" variant="outlined" color="primary" />
          {loading && <Chip label="Cargando..." size="small" />}
        </Stack>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth disabled={loading}>
          <InputLabel>Tipo de acceso</InputLabel>
          <Select
            label="Tipo de acceso"
            value={loginType}
            onChange={(e) => setLoginType(e.target.value as LoginType)}
          >
            <MenuItem value="email">Correo electrónico</MenuItem>
            <MenuItem value="phone">Teléfono</MenuItem>
            <MenuItem value="username">Usuario</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label={loginType === "email" ? "Correo" : loginType === "phone" ? "Teléfono" : "Usuario"}
          value={loginValue}
          onChange={(e) => setLoginValue(e.target.value)}
          disabled={loading}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Contraseña"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          helperText="Puedes visualizar u ocultar la contraseña con el ícono."
          disabled={loading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControlLabel
          control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />}
          label="Activo"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          minRows={4}
          label="Extra (JSON opcional)"
          placeholder='{"nota":"credencial usada para..."}'
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
          disabled={loading}
        />
      </Grid>

      <Grid item xs={12}>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={handleSave} disabled={saving || loading}>
            {saving ? "Guardando..." : "Guardar credencial"}
          </Button>
          <Button color="error" variant="outlined" onClick={handleDelete} disabled={saving || loading}>
            Eliminar credencial
          </Button>
          <Button variant="text" onClick={load} disabled={loading}>
            Recargar
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
}

export default function Configuracion() {
  const [tab, setTab] = useState<number>(0);

  return (
    <Page title="Configuración">
      <Paper sx={{ p: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="General" />
          <Tab
            icon={<Avatar src={SYSTEM_LOGOS.mitiendaenlinea} variant="rounded" sx={{ width: 20, height: 20, mr: 1 }} />}
            iconPosition="start"
            label="Mi Tienda en Línea"
          />
          <Tab
            icon={<Avatar src={SYSTEM_LOGOS.taeconta} variant="rounded" sx={{ width: 20, height: 20, mr: 1 }} />}
            iconPosition="start"
            label="TAEConta"
          />
          <Tab
            icon={<Avatar src={SYSTEM_LOGOS.telorecargo} variant="rounded" sx={{ width: 20, height: 20, mr: 1 }} />}
            iconPosition="start"
            label="Te Lo Recargo"
          />
        </Tabs>

        <Box sx={{ mt: 2 }}>
          {tab === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Nombre comercial" placeholder="Tecnologías Administrativas ELAD" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Dominio" placeholder="mitiendaenlineamx.com.mx" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel control={<Switch defaultChecked />} label="Modo oscuro por defecto" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel control={<Switch />} label="Habilitar beta features" />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained">Guardar</Button>
              </Grid>
            </Grid>
          )}

          {tab === 1 && (
            <CredentialPane
              system="mitiendaenlinea"
              title="Mi Tienda en Línea"
              logoSrc={SYSTEM_LOGOS.mitiendaenlinea}
            />
          )}
          {tab === 2 && (
            <CredentialPane
              system="taeconta"
              title="TAEConta"
              logoSrc={SYSTEM_LOGOS.taeconta}
            />
          )}
          {tab === 3 && (
            <CredentialPane
              system="telorecargo"
              title="Te Lo Recargo"
              logoSrc={SYSTEM_LOGOS.telorecargo}
            />
          )}
        </Box>
      </Paper>
    </Page>
  );
}
