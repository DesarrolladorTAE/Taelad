import React, { useEffect, useState } from "react";
import {
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
} from "@mui/material";
import Page from "./Page";
import axiosClient from "../../../services/axiosClient";
import { accountApi } from "../../../services/api";

/** Regímenes fiscales SAT: código + nombre
 *  Solo se enviará el "codigo" al backend en regimen_fiscal
 */
const REGIMENES_SAT: { codigo: string; nombre: string }[] = [
  { codigo: "601", nombre: "Régimen General de Ley Personas Morales" },
  { codigo: "603", nombre: "Personas Morales con Fines no Lucrativos" },
  { codigo: "605", nombre: "Sueldos y Salarios e Ingresos Asimilados a Salarios" },
  { codigo: "606", nombre: "Arrendamiento" },
  { codigo: "608", nombre: "Demás Ingresos" },
  { codigo: "609", nombre: "Consolidación" },
  { codigo: "610", nombre: "Residentes en el Extranjero sin Establecimiento Permanente en México" },
  { codigo: "611", nombre: "Ingresos por Dividendos (socios y accionistas)" },
  { codigo: "612", nombre: "Personas Físicas con Actividades Empresariales y Profesionales" },
  { codigo: "614", nombre: "Ingresos por Intereses" },
  { codigo: "615", nombre: "Régimen de los ingresos por obtención de premios" },
  { codigo: "616", nombre: "Sin obligaciones fiscales" },
  { codigo: "620", nombre: "Sociedades Cooperativas de Producción que optan por diferir sus ingresos" },
  { codigo: "621", nombre: "Incorporación Fiscal (derogado, histórico)" },
  { codigo: "622", nombre: "Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras" },
  { codigo: "623", nombre: "Opcional para Grupos de Sociedades" },
  { codigo: "624", nombre: "Coordinados" },
  { codigo: "625", nombre: "Actividades Empresariales con ingresos a través de Plataformas Tecnológicas" },
  { codigo: "626", nombre: "Régimen Simplificado de Confianza (RESICO)" },
];

export default function DatosFiscales() {
  const [form, setForm] = useState({
    razon_social: "",
    rfc: "",
    regimen_fiscal: "601", // por defecto
    codigo_postal: "",
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleChange = (key: keyof typeof form, val: string) =>
    setForm((p) => ({ ...p, [key]: val }));

  // ===== Cargar datos fiscales guardados =====
  const fetchFiscal = async () => {
    try {
      setLoading(true);
      const { data } = await accountApi.getFiscal();
      // data.data puede ser null si aún no hay registro
      const f = (data?.data as any) || {};
      setForm({
        razon_social: f.razon_social || "",
        rfc: f.rfc || "",
        regimen_fiscal: f.regimen_fiscal || "601",
        codigo_postal: f.codigo_postal || "",
      });
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiscal();
  }, []);

  // ===== Guardar =====
  const handleGuardar = async () => {
    try {
      setSaving(true);
      const payload = {
        razon_social: form.razon_social || null,
        rfc: form.rfc || null,
        regimen_fiscal: form.regimen_fiscal || null, // 👈 solo código
        codigo_postal: form.codigo_postal || null,
      };
      await axiosClient.put("/account/fiscal", payload);
      alert("✅ Datos fiscales guardados");
      // Opcional: refrescar desde servidor tras guardar
      fetchFiscal();
    } catch (e: any) {
      alert(`❌ Error al guardar: ${e?.message || "Error desconocido"}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page title="Datos fiscales">
      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Razón social"
                  placeholder="ELAD y Asociados Consultores, S.C."
                  value={form.razon_social}
                  onChange={(e) => handleChange("razon_social", e.target.value)}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="RFC"
                  placeholder="EAC123456789"
                  value={form.rfc}
                  onChange={(e) =>
                    handleChange("rfc", e.target.value.toUpperCase())
                  }
                  inputProps={{ maxLength: 13 }}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={loading}>
                  <InputLabel>Régimen fiscal</InputLabel>
                  <Select
                    label="Régimen fiscal"
                    value={form.regimen_fiscal}
                    onChange={(e) =>
                      handleChange("regimen_fiscal", e.target.value as string)
                    }
                  >
                    {REGIMENES_SAT.map((r) => (
                      <MenuItem key={r.codigo} value={r.codigo}>
                        {r.codigo} — {r.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    Se enviará solo el <strong>código</strong> del régimen.
                  </FormHelperText>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Código postal"
                  placeholder="00000"
                  value={form.codigo_postal}
                  onChange={(e) =>
                    handleChange(
                      "codigo_postal",
                      e.target.value.replace(/\D/g, "").slice(0, 5)
                    )
                  }
                  inputProps={{ inputMode: "numeric", maxLength: 5 }}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12}>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    onClick={handleGuardar}
                    disabled={saving || loading}
                  >
                    {saving ? "Guardando..." : "Guardar"}
                  </Button>
                  <Button variant="outlined" onClick={fetchFiscal} disabled={loading}>
                    Recargar
                  </Button>
                </Stack>
              </Grid>

            </Grid>
          </Paper>
        </Grid>

        {/* Columna derecha opcional */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Ayuda
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Completa tu razón social, RFC, selecciona tu régimen fiscal y agrega tu código postal.
              El sistema guarda únicamente el <strong>código</strong> del régimen (por ejemplo, 601).
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Page>
  );
}
