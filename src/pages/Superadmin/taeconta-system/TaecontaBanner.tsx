import {
  useCallback,
  useEffect,
  useMemo,
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
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import {
  createTaecontaSystemBanner,
  getTaecontaSystemBanners,
  toggleTaecontaSystemBannerActivo,
  updateTaecontaSystemBanner,
  type TaecontaSystemBanner,
} from "../../../services/superadminService";

type EditorMode = "create" | "edit";

function texto(value: unknown, fallback = "—"): string {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  return String(value);
}

function fechaLocalISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function estadoTemporal(
  banner: TaecontaSystemBanner,
): {
  label: string;
  color: "success" | "warning" | "info" | "default";
} {
  if (!banner.activo) {
    return { label: "Inactivo", color: "default" };
  }

  const hoy = fechaLocalISO();

  if (banner.fecha_inicio && hoy < banner.fecha_inicio) {
    return { label: "Programado", color: "info" };
  }

  if (banner.fecha_fin && hoy > banner.fecha_fin) {
    return { label: "Vencido", color: "warning" };
  }

  return { label: "Vigente", color: "success" };
}

export default function TaecontaBanner() {
  const [banners, setBanners] = useState<TaecontaSystemBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [openEditor, setOpenEditor] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>("create");
  const [bannerEditando, setBannerEditando] = useState<TaecontaSystemBanner | null>(null);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [activo, setActivo] = useState(true);
  const [imagen, setImagen] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [editorError, setEditorError] = useState("");
  const [toggleBusyId, setToggleBusyId] = useState<number | null>(null);

  const cargar = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }
    setError("");

    try {
      const response = await getTaecontaSystemBanners();
      setBanners(Array.isArray(response?.data) ? response.data : []);
    } catch (err: any) {
      console.error("ERROR BANNERS TAECONTA:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No fue posible consultar los banners.",
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

  const vigente = useMemo(
    () =>
      banners.find(
        (item) => estadoTemporal(item).label === "Vigente",
      ) ?? null,
    [banners],
  );

  const abrirCrear = () => {
    const hoy = fechaLocalISO();
    setEditorMode("create");
    setBannerEditando(null);
    setFechaInicio(hoy);
    setFechaFin(hoy);
    setActivo(true);
    setImagen(null);
    setEditorError("");
    setOpenEditor(true);
  };

  const abrirEditar = (item: TaecontaSystemBanner) => {
    setEditorMode("edit");
    setBannerEditando(item);
    setFechaInicio(item.fecha_inicio ?? "");
    setFechaFin(item.fecha_fin ?? "");
    setActivo(Boolean(item.activo));
    setImagen(null);
    setEditorError("");
    setOpenEditor(true);
  };

  const cerrarEditor = () => {
    if (saving) return;
    setOpenEditor(false);
    setBannerEditando(null);
    setImagen(null);
    setEditorError("");
  };

  const guardar = async () => {
    if (!fechaInicio) {
      setEditorError("Selecciona la fecha de inicio.");
      return;
    }

    if (!fechaFin) {
      setEditorError("Selecciona la fecha de finalización.");
      return;
    }

    if (fechaFin < fechaInicio) {
      setEditorError("La fecha final no puede ser menor a la fecha de inicio.");
      return;
    }

    if (editorMode === "create" && !imagen) {
      setEditorError("Selecciona una imagen para el nuevo banner.");
      return;
    }

    if (editorMode === "edit" && !bannerEditando) {
      setEditorError("No se pudo determinar el banner a editar.");
      return;
    }

    setSaving(true);
    setEditorError("");
    setSuccessMessage("");

    try {
      const response =
        editorMode === "create"
          ? await createTaecontaSystemBanner({
              imagen: imagen as File,
              fecha_inicio: fechaInicio,
              fecha_fin: fechaFin,
              activo,
            })
          : await updateTaecontaSystemBanner(
              bannerEditando!.id,
              {
                imagen,
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin,
                activo,
              },
            );

      if (response?.success !== true) {
        throw new Error(response?.message || "No fue posible guardar el banner.");
      }

      setSuccessMessage(
        response.message ||
          (editorMode === "create"
            ? "Banner creado correctamente."
            : "Banner actualizado correctamente."),
      );

      setOpenEditor(false);
      setBannerEditando(null);
      setImagen(null);

      // Refetch: Tecnologías muestra exactamente lo persistido en TAECONTA.
      await cargar(false);
    } catch (err: any) {
      console.error("ERROR GUARDANDO BANNER TAECONTA:", err);

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
              "No fue posible guardar el banner.",
      );
    } finally {
      setSaving(false);
    }
  };

  const cambiarActivo = async (item: TaecontaSystemBanner) => {
    setToggleBusyId(item.id);
    setError("");
    setSuccessMessage("");

    try {
      const response = await toggleTaecontaSystemBannerActivo(item.id);

      if (response?.success !== true) {
        throw new Error(
          response?.message ||
            "No fue posible cambiar el estado del banner.",
        );
      }

      setSuccessMessage(
        response.message ||
          "Estado del banner actualizado correctamente.",
      );

      await cargar(false);
    } catch (err: any) {
      console.error("ERROR CAMBIANDO ESTADO BANNER:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "No fue posible cambiar el estado del banner.",
      );
    } finally {
      setToggleBusyId(null);
    }
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
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
              Banner principal
            </Typography>
            <Typography color="text.secondary" fontSize={14}>
              Administra los banners de TAECONTA directamente desde Tecnologías.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={loading ? <CircularProgress size={15} /> : <RefreshOutlinedIcon />}
              onClick={() => void cargar()}
              disabled={loading}
            >
              Actualizar
            </Button>

            <Button
              variant="contained"
              size="small"
              startIcon={<AddPhotoAlternateOutlinedIcon />}
              onClick={abrirCrear}
            >
              Nuevo banner
            </Button>
          </Stack>
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

        {!loading && !vigente && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Actualmente no hay un banner vigente. Los banners históricos o programados se muestran abajo y pueden editarse.
          </Alert>
        )}

        {loading ? (
          <Box minHeight={220} display="grid" sx={{ placeItems: "center" }}>
            <CircularProgress />
          </Box>
        ) : banners.length === 0 ? (
          <Alert severity="info">TAECONTA no tiene banners registrados.</Alert>
        ) : (
          <Grid container spacing={2}>
            {banners.map((item) => {
              const estado = estadoTemporal(item);
              const busy = toggleBusyId === item.id;

              return (
                <Grid item xs={12} md={6} key={item.id}>
                  <Paper
                    elevation={0}
                    sx={{
                      height: "100%",
                      border: "1px solid",
                      borderColor: estado.label === "Vigente" ? "success.main" : "divider",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    {item.url_imagen ? (
                      <Box
                        sx={{
                          width: "100%",
                          height: 190,
                          bgcolor: "action.hover",
                          display: "grid",
                          placeItems: "center",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          component="img"
                          src={item.url_imagen}
                          alt={item.nombre_imagen || "Banner TAECONTA"}
                          sx={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          height: 190,
                          bgcolor: "action.hover",
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        <Typography color="text.secondary" fontSize={12}>
                          Sin imagen
                        </Typography>
                      </Box>
                    )}

                    <Box p={2}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        spacing={1}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography fontWeight={900} sx={{ overflowWrap: "anywhere" }}>
                            {texto(item.nombre_imagen, `Banner #${item.id}`)}
                          </Typography>
                          <Typography color="text.secondary" fontSize={11}>
                            ID: {item.id}
                          </Typography>
                        </Box>

                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                          <Chip
                            size="small"
                            label={item.activo ? "Activo" : "Inactivo"}
                            color={item.activo ? "success" : "default"}
                            variant="outlined"
                          />
                          <Chip size="small" label={estado.label} color={estado.color} />
                        </Stack>
                      </Stack>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={2}>
                        <Typography fontSize={12}>
                          <strong>Inicio:</strong> {texto(item.fecha_inicio)}
                        </Typography>
                        <Typography fontSize={12}>
                          <strong>Fin:</strong> {texto(item.fecha_fin)}
                        </Typography>
                      </Stack>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} mt={2}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<EditOutlinedIcon />}
                          onClick={() => abrirEditar(item)}
                        >
                          Editar
                        </Button>

                        <Button
                          variant={item.activo ? "outlined" : "contained"}
                          color={item.activo ? "inherit" : "success"}
                          size="small"
                          disabled={busy}
                          startIcon={busy ? <CircularProgress size={15} color="inherit" /> : undefined}
                          onClick={() => void cambiarActivo(item)}
                        >
                          {busy
                            ? "Guardando..."
                            : item.activo
                              ? "Desactivar"
                              : "Activar"}
                        </Button>
                      </Stack>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Paper>

      <Dialog open={openEditor} onClose={cerrarEditor} fullWidth maxWidth="sm">
        <DialogTitle>
          {editorMode === "create" ? "Nuevo banner" : "Editar banner"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {editorError && <Alert severity="error">{editorError}</Alert>}

            {editorMode === "edit" && bannerEditando?.url_imagen && (
              <Box
                sx={{
                  height: 160,
                  bgcolor: "action.hover",
                  borderRadius: 2,
                  overflow: "hidden",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Box
                  component="img"
                  src={bannerEditando.url_imagen}
                  alt={bannerEditando.nombre_imagen || "Banner actual"}
                  sx={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </Box>
            )}

            <TextField
              label="Fecha de inicio"
              type="date"
              value={fechaInicio}
              onChange={(event) => setFechaInicio(event.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
              disabled={saving}
            />

            <TextField
              label="Fecha de finalización"
              type="date"
              value={fechaFin}
              onChange={(event) => setFechaFin(event.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
              disabled={saving}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={activo}
                  onChange={(_event, checked) => setActivo(checked)}
                  disabled={saving}
                />
              }
              label="Banner activo"
            />

            <Paper elevation={0} sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
              <Stack spacing={1}>
                <Typography fontSize={13} fontWeight={800}>
                  Imagen
                </Typography>

                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<AddPhotoAlternateOutlinedIcon />}
                  disabled={saving}
                  sx={{ alignSelf: "flex-start" }}
                >
                  Seleccionar imagen
                  <input
                    hidden
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/svg+xml"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      setImagen(file);
                      event.target.value = "";
                    }}
                  />
                </Button>

                <Typography fontSize={12} color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
                  {imagen
                    ? `Archivo seleccionado: ${imagen.name}`
                    : editorMode === "create"
                      ? "La imagen es obligatoria para crear un banner."
                      : "Opcional. Si no seleccionas otra imagen, se conserva la actual."}
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
            onClick={() => void guardar()}
            disabled={saving}
          >
            {saving
              ? "Guardando..."
              : editorMode === "create"
                ? "Crear banner"
                : "Guardar cambios"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
