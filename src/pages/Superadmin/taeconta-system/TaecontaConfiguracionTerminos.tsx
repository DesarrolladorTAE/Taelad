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
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";

import {
  getTaecontaSystemConfiguracionTerminos,
  updateTaecontaSystemConfiguracionTerminos,
} from "../../../services/superadminService";

const MAX_LENGTH = 65535;

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

export default function TaecontaConfiguracionTerminos() {
  const [contenido, setContenido] =
    useState("");

  const [
    contenidoOriginal,
    setContenidoOriginal,
  ] = useState("");

  const [updatedAt, setUpdatedAt] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
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
          await getTaecontaSystemConfiguracionTerminos();

        const nextContent =
          response?.data?.contenido ??
          "";

        setContenido(nextContent);
        setContenidoOriginal(
          nextContent,
        );

        setUpdatedAt(
          response?.data
            ?.updated_at ??
            null,
        );
      } catch (err: any) {
        console.error(
          "ERROR TERMINOS TAECONTA:",
          err,
        );

        setError(
          getErrorMessage(
            err,
            "No fue posible consultar los términos y condiciones.",
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

  const changed =
    contenido !==
    contenidoOriginal;

  const invalid =
    contenido.trim().length ===
      0 ||
    contenido.length >
      MAX_LENGTH;

  const remaining =
    MAX_LENGTH -
    contenido.length;

  const formattedUpdatedAt =
    useMemo(() => {
      if (!updatedAt) {
        return "—";
      }

      const date =
        new Date(updatedAt);

      if (
        Number.isNaN(
          date.getTime(),
        )
      ) {
        return updatedAt;
      }

      return date.toLocaleString(
        "es-MX",
      );
    }, [updatedAt]);

  const guardar = async () => {
    if (invalid) {
      setError(
        contenido.trim().length ===
          0
          ? "El contenido de los términos no puede quedar vacío."
          : "El contenido no debe exceder 65,535 caracteres.",
      );
      setConfirmOpen(false);
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await updateTaecontaSystemConfiguracionTerminos({
          contenido,
        });

      if (
        response?.success !== true
      ) {
        throw new Error(
          response?.message ||
            "No fue posible actualizar los términos y condiciones.",
        );
      }

      setConfirmOpen(false);

      setSuccess(
        response?.message ||
          "Términos y condiciones actualizados correctamente.",
      );

      await cargar(false);
    } catch (err: any) {
      console.error(
        "ERROR ACTUALIZANDO TERMINOS:",
        err,
      );

      setError(
        getErrorMessage(
          err,
          "No fue posible actualizar los términos y condiciones.",
        ),
      );

      setConfirmOpen(false);
    } finally {
      setSaving(false);
    }
  };

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
              <ArticleOutlinedIcon />

              <Typography
                variant="h6"
                fontWeight={900}
              >
                Términos
              </Typography>
            </Stack>

            <Typography
              color="text.secondary"
              fontSize={14}
              sx={{ mt: 0.5 }}
            >
              Contenido legal visible para los usuarios finales.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            size="small"
            startIcon={
              loading ? (
                <CircularProgress
                  size={15}
                />
              ) : (
                <RefreshOutlinedIcon />
              )
            }
            disabled={
              loading ||
              saving
            }
            onClick={() =>
              void cargar()
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

        <Alert
          severity="warning"
          icon={
            <WarningAmberOutlinedIcon />
          }
          sx={{ mb: 2 }}
        >
          Al guardar cambios, TAECONTA reiniciará la aceptación de
          términos para sus usuarios y deberán aceptarlos nuevamente.
        </Alert>

        {loading ? (
          <Box
            minHeight={320}
            display="grid"
            sx={{
              placeItems: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={1.5}>
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              justifyContent="space-between"
              spacing={0.5}
            >
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Última actualización: {formattedUpdatedAt}
              </Typography>

              <Typography
                variant="caption"
                color={
                  remaining < 0
                    ? "error.main"
                    : "text.secondary"
                }
                fontWeight={800}
              >
                {contenido.length.toLocaleString("es-MX")} /{" "}
                {MAX_LENGTH.toLocaleString("es-MX")}
              </Typography>
            </Stack>

            <TextField
              value={contenido}
              onChange={(event) =>
                setContenido(
                  event.target.value,
                )
              }
              multiline
              minRows={18}
              maxRows={32}
              fullWidth
              disabled={saving}
              error={
                contenido.length >
                MAX_LENGTH
              }
              helperText={
                contenido.length >
                MAX_LENGTH
                  ? `Excede el límite por ${Math.abs(
                      remaining,
                    ).toLocaleString(
                      "es-MX",
                    )} caracteres.`
                  : "Máximo 65,535 caracteres."
              }
              inputProps={{
                maxLength:
                  MAX_LENGTH + 1000,
              }}
              sx={{
                "& textarea": {
                  fontFamily:
                    "inherit",
                  lineHeight: 1.6,
                },
              }}
            />

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              justifyContent="flex-end"
              spacing={1}
            >
              <Button
                variant="outlined"
                color="inherit"
                disabled={
                  !changed ||
                  saving
                }
                onClick={() =>
                  setContenido(
                    contenidoOriginal,
                  )
                }
              >
                Descartar cambios
              </Button>

              <Button
                variant="contained"
                startIcon={
                  <SaveOutlinedIcon />
                }
                disabled={
                  !changed ||
                  invalid ||
                  saving
                }
                onClick={() =>
                  setConfirmOpen(
                    true,
                  )
                }
              >
                Guardar cambios
              </Button>
            </Stack>
          </Stack>
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
        maxWidth="sm"
      >
        <DialogTitle>
          Confirmar actualización de términos
        </DialogTitle>

        <DialogContent>
          <Stack spacing={1.5}>
            <Typography>
              Los cambios se guardarán directamente en TAECONTA.
            </Typography>

            <Alert severity="warning">
              Esta operación hará que los usuarios de TAECONTA deban
              aceptar nuevamente los términos y condiciones.
            </Alert>
          </Stack>
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
              void guardar()
            }
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress
                  size={16}
                  color="inherit"
                />
              ) : (
                <SaveOutlinedIcon />
              )
            }
          >
            {saving
              ? "Guardando..."
              : "Sí, guardar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}