import {
  type ChangeEvent,
  type DragEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

import {
  getTaecontaSystemConfiguracionLogin,
  updateTaecontaSystemConfiguracionLogin,
  type TaecontaSystemConfiguracionLogin,
} from "../../../services/superadminService";

const MAX_FILE_BYTES = 80 * 1024 * 1024;

const ACCEPTED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
]);

function getErrorMessage(
  err: any,
  fallback: string,
): string {
  const validationErrors =
    err?.response?.data?.errors;

  const firstValidationError =
    validationErrors &&
    typeof validationErrors === "object"
      ? Object.values(validationErrors)
          .flat()
          .find(
            (value) =>
              typeof value === "string" &&
              value.trim() !== "",
          )
      : null;

  return typeof firstValidationError === "string"
    ? firstValidationError
    : err?.response?.data?.message ||
        err?.message ||
        fallback;
}

function isVideoMime(mime: string): boolean {
  return mime.startsWith("video/");
}

export default function TaecontaConfiguracionLogin() {
  const [media, setMedia] =
    useState<TaecontaSystemConfiguracionLogin | null>(
      null,
    );

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [dragging, setDragging] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [confirmOpen, setConfirmOpen] =
    useState(false);

  const cargar = useCallback(
    async (showLoader = true) => {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      try {
        const response =
          await getTaecontaSystemConfiguracionLogin();

        setMedia(
          response?.data ?? null,
        );
      } catch (err: any) {
        console.error(
          "ERROR CONFIGURACION LOGIN TAECONTA:",
          err,
        );

        setError(
          getErrorMessage(
            err,
            "No fue posible consultar el archivo de acceso.",
          ),
        );
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const selectedPreviewUrl =
    useMemo(() => {
      if (!selectedFile) {
        return "";
      }

      return URL.createObjectURL(
        selectedFile,
      );
    }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (selectedPreviewUrl) {
        URL.revokeObjectURL(
          selectedPreviewUrl,
        );
      }
    };
  }, [selectedPreviewUrl]);

  const validateFile = (
    file: File,
  ): string | null => {
    if (
      file.size >
      MAX_FILE_BYTES
    ) {
      return "El archivo no debe pesar más de 80 MB.";
    }

    if (
      !ACCEPTED_MIME_TYPES.has(
        file.type,
      )
    ) {
      return "Formato no compatible. Usa JPG, PNG, GIF, SVG, MP4, WEBM, OGG o MOV.";
    }

    return null;
  };

  const selectFile = (
    file: File | null,
  ) => {
    setError("");
    setSuccess("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const validationError =
      validateFile(file);

    if (validationError) {
      setSelectedFile(null);
      setError(validationError);
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInput = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0] ??
      null;

    selectFile(file);

    event.target.value = "";
  };

  const handleDragOver = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    setDragging(false);
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    setDragging(false);

    const file =
      event.dataTransfer.files?.[0] ??
      null;

    selectFile(file);
  };

  const upload = async () => {
    if (!selectedFile) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await updateTaecontaSystemConfiguracionLogin({
          archivo: selectedFile,
        });

      if (
        response?.success !== true
      ) {
        throw new Error(
          response?.message ||
            "No fue posible actualizar el archivo de acceso.",
        );
      }

      setSelectedFile(null);
      setConfirmOpen(false);

      setSuccess(
        response?.message ||
          "Archivo de acceso actualizado correctamente.",
      );

      await cargar(false);
    } catch (err: any) {
      console.error(
        "ERROR ACTUALIZANDO LOGIN TAECONTA:",
        err,
      );

      setError(
        getErrorMessage(
          err,
          "No fue posible actualizar el archivo de acceso.",
        ),
      );

      setConfirmOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const previewUrl =
    selectedPreviewUrl ||
    media?.url ||
    "";

  const previewIsVideo =
    selectedFile
      ? isVideoMime(
          selectedFile.type,
        )
      : media?.type === "video";

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: {
            xs: 2,
            md: 3,
          },
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          justifyContent="space-between"
          alignItems={{
            xs: "stretch",
            sm: "center",
          }}
          spacing={2}
          sx={{ mb: 2.5 }}
        >
          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <ImageOutlinedIcon />

              <Typography
                variant="h6"
                fontWeight={900}
              >
                Imagen login
              </Typography>
            </Stack>

            <Typography
              color="text.secondary"
              fontSize={14}
              sx={{ mt: 0.5 }}
            >
              Personalización visual del acceso al sistema.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            size="small"
            onClick={() =>
              void cargar()
            }
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress
                  size={15}
                />
              ) : (
                <RefreshOutlinedIcon />
              )
            }
          >
            Actualizar
          </Button>
        </Stack>

        {success ? (
          <Alert
            severity="success"
            onClose={() =>
              setSuccess("")
            }
            sx={{ mb: 2 }}
          >
            {success}
          </Alert>
        ) : null}

        {error ? (
          <Alert
            severity="error"
            onClose={() =>
              setError("")
            }
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        ) : null}

        {loading ? (
          <Box
            minHeight={360}
            display="grid"
            sx={{
              placeItems: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                lg: "minmax(0, 1.55fr) minmax(280px, 0.9fr)",
              },
              gap: 2.5,
              alignItems: "stretch",
            }}
          >
            <Box
              onDragOver={
                handleDragOver
              }
              onDragLeave={
                handleDragLeave
              }
              onDrop={
                handleDrop
              }
              sx={{
                minHeight: {
                  xs: 280,
                  md: 360,
                },
                p: {
                  xs: 1.5,
                  md: 2,
                },
                border: "2px dashed",
                borderColor: dragging
                  ? "primary.main"
                  : "divider",
                borderRadius: 2,
                bgcolor: dragging
                  ? "action.hover"
                  : "transparent",
                display: "grid",
                placeItems: "center",
                overflow: "hidden",
                transition:
                  "border-color 150ms ease, background-color 150ms ease",
              }}
            >
              {previewUrl ? (
                previewIsVideo ? (
                  <Box
                    component="video"
                    src={previewUrl}
                    controls
                    playsInline
                    sx={{
                      display: "block",
                      width: "100%",
                      maxWidth: 560,
                      maxHeight: 420,
                      borderRadius: 1.5,
                      objectFit:
                        "contain",
                    }}
                  />
                ) : (
                  <Box
                    component="img"
                    src={previewUrl}
                    alt="Archivo de acceso TAECONTA"
                    sx={{
                      display: "block",
                      width: "100%",
                      maxWidth: 560,
                      maxHeight: 420,
                      objectFit:
                        "contain",
                    }}
                  />
                )
              ) : (
                <Stack
                  spacing={1}
                  alignItems="center"
                  textAlign="center"
                >
                  <ImageOutlinedIcon
                    sx={{
                      fontSize: 52,
                      color:
                        "text.disabled",
                    }}
                  />

                  <Typography
                    fontWeight={800}
                  >
                    Sin archivo de acceso
                  </Typography>

                  <Typography
                    color="text.secondary"
                    fontSize={13}
                  >
                    Selecciona una imagen, GIF o video.
                  </Typography>
                </Stack>
              )}
            </Box>

            <Stack
              spacing={1.5}
              justifyContent="center"
            >
              <Box>
                <Typography
                  fontWeight={900}
                >
                  Archivo de acceso
                </Typography>

                <Typography
                  color="text.secondary"
                  fontSize={14}
                  sx={{ mt: 0.75 }}
                >
                  Arrastra una imagen, GIF o video para actualizar la
                  pantalla de login.
                </Typography>
              </Box>

              <Alert
                severity="info"
                icon={
                  <InfoOutlinedIcon />
                }
              >
                Para una mejor visualización, se recomienda una
                proporción 1:1, es decir, formato cuadrado.
              </Alert>

              <Paper
                elevation={0}
                sx={{
                  px: 1.5,
                  py: 1,
                  border: "1px solid",
                  borderColor:
                    "divider",
                  borderRadius: 999,
                }}
              >
                <Typography
                  fontSize={12}
                  fontWeight={800}
                >
                  {selectedFile
                    ? `Seleccionado: ${selectedFile.name}`
                    : media?.exists
                      ? "Archivo actual del sistema"
                      : "Sin archivo actual"}
                </Typography>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  px: 1.5,
                  py: 1,
                  border: "1px solid",
                  borderColor:
                    "divider",
                  borderRadius: 999,
                }}
              >
                <Typography
                  fontSize={12}
                  fontWeight={800}
                >
                  Límite máximo: 80 MB
                </Typography>
              </Paper>

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                  lg: "column",
                  xl: "row",
                }}
                spacing={1}
              >
                <Button
                  component="label"
                  variant="contained"
                  startIcon={
                    <CloudUploadOutlinedIcon />
                  }
                  disabled={saving}
                  fullWidth
                >
                  Seleccionar archivo
                  <input
                    hidden
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/svg+xml,video/mp4,video/webm,video/ogg,video/quicktime,.mov"
                    onChange={
                      handleFileInput
                    }
                  />
                </Button>

                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={
                    <DeleteSweepOutlinedIcon />
                  }
                  disabled={
                    !selectedFile ||
                    saving
                  }
                  onClick={() =>
                    setSelectedFile(
                      null,
                    )
                  }
                  fullWidth
                >
                  Limpiar selección
                </Button>
              </Stack>

              <Button
                variant="contained"
                disabled={
                  !selectedFile ||
                  saving
                }
                onClick={() =>
                  setConfirmOpen(
                    true,
                  )
                }
                startIcon={
                  saving ? (
                    <CircularProgress
                      size={16}
                      color="inherit"
                    />
                  ) : (
                    <CloudUploadOutlinedIcon />
                  )
                }
              >
                {saving
                  ? "Subiendo..."
                  : "Subir archivo"}
              </Button>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                “Limpiar selección” solo descarta el archivo elegido en
                esta pantalla; no elimina el archivo actual de TAECONTA.
              </Typography>
            </Stack>
          </Box>
        )}
      </Paper>

      <Dialog
        open={confirmOpen}
        onClose={() => {
          if (!saving) {
            setConfirmOpen(false);
          }
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          Reemplazar archivo de acceso
        </DialogTitle>

        <DialogContent>
          <Alert severity="warning">
            El archivo seleccionado reemplazará el archivo de login
            actualmente utilizado por TAECONTA.
          </Alert>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setConfirmOpen(false)
            }
            disabled={saving}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={() =>
              void upload()
            }
            disabled={saving}
          >
            {saving
              ? "Actualizando..."
              : "Sí, reemplazar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}