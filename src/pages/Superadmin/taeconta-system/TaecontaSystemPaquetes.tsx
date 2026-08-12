import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";

import {
  getTaecontaSystemPaquetes,
  updateTaecontaSystemPaquete,
  type TaecontaSystemPaquete,
} from "../../../services/superadminService";

function texto(value: unknown, fallback = "—"): string {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  return String(value);
}

function obtenerImagen(item: TaecontaSystemPaquete): string | null {
  const value = item.ruta;
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  // Se normaliza únicamente en Tecnologías; no modifica TAECONTA.
  return value.trim().replace(/^http:\/\//i, "https://");
}

function formatearMoneda(value: unknown): string {
  const number = Number(value ?? 0);
  if (!Number.isFinite(number)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
}

type PaqueteImagenProps = {
  src: string | null;
  nombre: string;
};

function PaqueteImagen({ src, nombre }: PaqueteImagenProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  const mostrarImagen = Boolean(src) && !imageError;

  return (
    <Box
      sx={{
        width: "100%",
        height: 150,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "action.hover",
        borderBottom: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        p: mostrarImagen ? 1.5 : 2,
      }}
    >
      {mostrarImagen ? (
        <Box
          component="img"
          src={src ?? undefined}
          alt={nombre}
          loading="lazy"
          onError={() => setImageError(true)}
          sx={{
            display: "block",
            width: "100%",
            height: "100%",
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />
      ) : (
        <Stack spacing={0.75} alignItems="center" justifyContent="center" sx={{ width: "100%", height: "100%" }}>
          <ImageNotSupportedOutlinedIcon sx={{ fontSize: 32, color: "text.disabled" }} />
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: "text.secondary" }}>
            Sin imagen
          </Typography>
        </Stack>
      )}
    </Box>
  );
}

export default function TaecontaPaquetes() {
  const [items, setItems] = useState<TaecontaSystemPaquete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [openEditor, setOpenEditor] = useState(false);
  const [paqueteEditando, setPaqueteEditando] = useState<TaecontaSystemPaquete | null>(null);
  const [nombre, setNombre] = useState("");
  const [costo, setCosto] = useState("");
  const [cantidadTimbres, setCantidadTimbres] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [editorError, setEditorError] = useState("");

  const cargar = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }
    setError("");

    try {
      const response = await getTaecontaSystemPaquetes();
      setItems(Array.isArray(response?.data) ? response.data : []);
    } catch (err: any) {
      console.error("ERROR PAQUETES TAECONTA:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No fue posible consultar los paquetes.",
      );
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const abrirEditor = (item: TaecontaSystemPaquete) => {
    setPaqueteEditando(item);
    setNombre(item.nombre ?? "");
    setCosto(item.costo == null ? "" : String(item.costo));
    setCantidadTimbres(item.cantidad_timbres == null ? "" : String(item.cantidad_timbres));
    setImagen(null);
    setEditorError("");
    setOpenEditor(true);
  };

  const cerrarEditor = () => {
    if (saving) return;
    setOpenEditor(false);
    setPaqueteEditando(null);
    setImagen(null);
    setEditorError("");
  };

  const guardarCambios = async () => {
    if (!paqueteEditando) return;

    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) {
      setEditorError("El nombre del paquete es obligatorio.");
      return;
    }

    const costoNumero = Number(costo);
    if (costo.trim() === "" || !Number.isFinite(costoNumero) || costoNumero < 0) {
      setEditorError("Ingresa un costo válido igual o mayor a 0.");
      return;
    }

    const timbresNumero = Number(cantidadTimbres);
    if (
      cantidadTimbres.trim() === "" ||
      !Number.isInteger(timbresNumero) ||
      timbresNumero < 0
    ) {
      setEditorError("La cantidad de timbres debe ser un número entero igual o mayor a 0.");
      return;
    }

    setSaving(true);
    setEditorError("");
    setSuccessMessage("");

    try {
      const response = await updateTaecontaSystemPaquete(paqueteEditando.id, {
        nombre: nombreLimpio,
        costo: costoNumero,
        cantidad_timbres: timbresNumero,
        imagen,
      });

      if (response?.success !== true) {
        throw new Error(response?.message || "No fue posible actualizar el paquete.");
      }

      setSuccessMessage(response.message || "Paquete actualizado correctamente.");
      setOpenEditor(false);
      setPaqueteEditando(null);
      setImagen(null);

      // Refetch: muestra exactamente lo que quedó guardado en TAECONTA.
      await cargar(false);
    } catch (err: any) {
      console.error("ERROR ACTUALIZANDO PAQUETE TAECONTA:", err);

      const validationErrors = err?.response?.data?.errors;
      const firstValidationError =
        validationErrors && typeof validationErrors === "object"
          ? Object.values(validationErrors)
              .flat()
              .find(
                (value) =>
                  typeof value === "string" && value.trim() !== "",
              )
          : null;

      setEditorError(
        typeof firstValidationError === "string"
          ? firstValidationError
          : err?.response?.data?.message ||
              err?.message ||
              "No fue posible actualizar el paquete.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          minWidth: 0,
          p: { xs: 1.5, sm: 2, md: 3 },
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          bgcolor: "background.paper",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
          mb={3}
        >
          <Box>
            <Typography variant="h6" fontWeight={900}>
              Paquetes
            </Typography>
            <Typography color="text.secondary" fontSize={14}>
              Catálogo de paquetes de TAECONTA. Los cambios se guardan directamente en TAECONTA.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            size="small"
            startIcon={loading ? <CircularProgress size={15} /> : <RefreshOutlinedIcon />}
            onClick={() => void cargar()}
            disabled={loading}
            sx={{ alignSelf: { xs: "stretch", sm: "center" }, whiteSpace: "nowrap" }}
          >
            Actualizar
          </Button>
        </Stack>

        {successMessage && (
          <Alert severity="success" onClose={() => setSuccessMessage("")} sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ minHeight: 260, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 1 }}>
            <CircularProgress />
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
              Consultando paquetes...
            </Typography>
          </Box>
        ) : items.length === 0 ? (
          <Alert severity="info">No hay paquetes registrados.</Alert>
        ) : (
          <Grid container spacing={2}>
            {items.map((item) => {
              const activo = Boolean(item.activo);
              const imagenUrl = obtenerImagen(item);
              const nombrePaquete = texto(item.nombre, "Sin nombre");

              return (
                <Grid item xs={12} sm={6} md={4} xl={3} key={String(item.id)}>
                  <Paper
                    elevation={0}
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      overflow: "hidden",
                      bgcolor: "background.paper",
                      transition: "border-color 120ms ease",
                      "&:hover": { borderColor: "primary.main" },
                    }}
                  >
                    <PaqueteImagen src={imagenUrl} nombre={nombrePaquete} />

                    <Box sx={{ flex: 1, p: 2, display: "flex", flexDirection: "column" }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                        <Typography
                          sx={{
                            minWidth: 0,
                            flex: 1,
                            fontSize: 14,
                            lineHeight: 1.35,
                            fontWeight: 900,
                            color: "text.primary",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {nombrePaquete}
                        </Typography>

                        <Chip
                          size="small"
                          color={activo ? "success" : "default"}
                          variant="outlined"
                          label={activo ? "Activo" : "Inactivo"}
                          sx={{ flexShrink: 0, height: 23, fontSize: 10, fontWeight: 800 }}
                        />
                      </Stack>

                      <Typography color="text.secondary" fontSize={11} mt={0.6}>
                        ID: {texto(item.id)}
                      </Typography>

                      <Box sx={{ my: 1.5, borderTop: "1px solid", borderColor: "divider" }} />

                      <Stack direction="row" alignItems="baseline" justifyContent="space-between" spacing={1}>
                        <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 700 }}>
                          Costo
                        </Typography>
                        <Typography sx={{ fontSize: 16, fontWeight: 900, color: "primary.main" }}>
                          {formatearMoneda(item.costo)}
                        </Typography>
                      </Stack>

                      <Stack direction="row" justifyContent="space-between" spacing={1} mt={1}>
                        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                          Timbres
                        </Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 800 }}>
                          {texto(item.cantidad_timbres, "0")}
                        </Typography>
                      </Stack>

                      <Stack direction="row" justifyContent="space-between" spacing={1} mt={0.75}>
                        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                          Tipo de timbre
                        </Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
                          {texto(item.tipo_timbre_id)}
                        </Typography>
                      </Stack>

                      <Box sx={{ mt: "auto", pt: 2 }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          startIcon={<EditOutlinedIcon />}
                          onClick={() => abrirEditor(item)}
                        >
                          Editar
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Paper>

      <Dialog open={openEditor} onClose={cerrarEditor} fullWidth maxWidth="sm">
        <DialogTitle>Editar paquete</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {editorError && <Alert severity="error">{editorError}</Alert>}

            <TextField
              label="Nombre"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              fullWidth
              required
              disabled={saving}
            />

            <TextField
              label="Costo"
              type="number"
              value={costo}
              onChange={(event) => setCosto(event.target.value)}
              fullWidth
              required
              disabled={saving}
              inputProps={{ min: 0, step: "0.01" }}
            />

            <TextField
              label="Cantidad de timbres"
              type="number"
              value={cantidadTimbres}
              onChange={(event) => setCantidadTimbres(event.target.value)}
              fullWidth
              required
              disabled={saving}
              inputProps={{ min: 0, step: 1 }}
            />

            <Paper elevation={0} sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
              <Stack spacing={1}>
                <Typography fontSize={13} fontWeight={800}>
                  Imagen
                </Typography>

                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<UploadFileOutlinedIcon />}
                  disabled={saving}
                  sx={{ alignSelf: "flex-start" }}
                >
                  Seleccionar imagen
                  <input
                    hidden
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      setImagen(file);
                      event.target.value = "";
                    }}
                  />
                </Button>

                <Typography fontSize={12} color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
                  {imagen
                    ? `Nueva imagen: ${imagen.name}`
                    : "Opcional. Si no seleccionas una imagen, se conserva la actual."}
                </Typography>
              </Stack>
            </Paper>

            <Paper elevation={0} sx={{ p: 1.5, bgcolor: "action.hover", borderRadius: 2 }}>
              <Stack spacing={0.5}>
                <Typography fontSize={12} color="text.secondary">
                  Estado actual: <strong>{paqueteEditando?.activo ? "Activo" : "Inactivo"}</strong>
                </Typography>
                <Typography fontSize={12} color="text.secondary">
                  Tipo de timbre: <strong>{texto(paqueteEditando?.tipo_timbre_id)}</strong>
                </Typography>
                <Typography fontSize={11} color="text.secondary">
                  Estos dos campos son informativos porque TAECONTA todavía no los admite en la edición del paquete.
                </Typography>
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={cerrarEditor} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon />}
            onClick={() => void guardarCambios()}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
