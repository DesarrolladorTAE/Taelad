import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  SuperAdminUserFiscalPayload,
  usersApi,
} from "../../../services/api";

const REGIMENES_SAT = [
  { codigo: "601", nombre: "General de Ley Personas Morales" },
  { codigo: "603", nombre: "Personas Morales con Fines no Lucrativos" },
  { codigo: "605", nombre: "Sueldos y Salarios e Ingresos Asimilados a Salarios" },
  { codigo: "606", nombre: "Arrendamiento" },
  { codigo: "608", nombre: "Demás Ingresos" },
  { codigo: "610", nombre: "Residentes en el Extranjero sin Establecimiento Permanente en México" },
  { codigo: "611", nombre: "Ingresos por Dividendos" },
  { codigo: "612", nombre: "Personas Físicas con Actividades Empresariales y Profesionales" },
  { codigo: "614", nombre: "Ingresos por Intereses" },
  { codigo: "615", nombre: "Ingresos por Obtención de Premios" },
  { codigo: "616", nombre: "Sin Obligaciones Fiscales" },
  { codigo: "620", nombre: "Sociedades Cooperativas de Producción" },
  { codigo: "621", nombre: "Incorporación Fiscal" },
  { codigo: "622", nombre: "Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras" },
  { codigo: "623", nombre: "Opcional para Grupos de Sociedades" },
  { codigo: "624", nombre: "Coordinados" },
  { codigo: "625", nombre: "Actividades Empresariales mediante Plataformas Tecnológicas" },
  { codigo: "626", nombre: "Régimen Simplificado de Confianza" },
];

type UsuarioFiscal = {
  id: number;
  name: string;
  apellidos?: string | null;
  email: string;
};

type Props = {
  open: boolean;
  usuario: UsuarioFiscal | null;
  onClose: () => void;
  onSaved?: () => void;
};

const FORM_INICIAL: SuperAdminUserFiscalPayload = {
  razon_social: "",
  rfc: "",
  regimen_fiscal: "601",
  codigo_postal: "",
};

function obtenerMensajeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | {
          message?: string;
          errors?: Record<string, string[]>;
        }
      | undefined;

    const primerError = data?.errors
      ? Object.values(data.errors).flat()[0]
      : null;

    return (
      primerError ||
      data?.message ||
      "No fue posible completar la operación."
    );
  }

  return "No fue posible completar la operación.";
}

export default function DatosFiscalesUsuarioModal({
  open,
  usuario,
  onClose,
  onSaved,
}: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [form, setForm] =
    useState<SuperAdminUserFiscalPayload>(FORM_INICIAL);
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !usuario) return;

    let active = true;

    const cargarDatos = async () => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setForm(FORM_INICIAL);
      setExists(false);

      try {
        const response = await usersApi.getFiscal(usuario.id);
        const result = response.data;

        if (!active) return;

        setExists(result.exists);

        if (result.data) {
          setForm({
            razon_social: result.data.razon_social || "",
            rfc: result.data.rfc || "",
            regimen_fiscal: result.data.regimen_fiscal || "601",
            codigo_postal: result.data.codigo_postal || "",
          });
        }
      } catch (requestError) {
        if (active) {
          setError(obtenerMensajeError(requestError));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    cargarDatos();

    return () => {
      active = false;
    };
  }, [open, usuario]);

  const actualizarCampo = (
    campo: keyof SuperAdminUserFiscalPayload,
    valor: string
  ) => {
    setForm((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  };

  const validar = (): string | null => {
    if (!form.razon_social.trim()) {
      return "La razón social es obligatoria.";
    }

    if (
      !/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(
        form.rfc.trim()
      )
    ) {
      return "El RFC no tiene un formato válido.";
    }

    if (!/^[0-9]{3}$/.test(form.regimen_fiscal)) {
      return "El régimen fiscal no es válido.";
    }

    if (!/^[0-9]{5}$/.test(form.codigo_postal)) {
      return "El código postal debe contener cinco dígitos.";
    }

    return null;
  };

  const guardar = async () => {
    if (!usuario) return;

    const validationError = validar();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await usersApi.updateFiscal(usuario.id, {
        razon_social: form.razon_social.trim().toUpperCase(),
        rfc: form.rfc.trim().toUpperCase(),
        regimen_fiscal: form.regimen_fiscal,
        codigo_postal: form.codigo_postal,
      });

      setExists(true);
      setSuccess(response.data.message);
      onSaved?.();
    } catch (requestError) {
      setError(obtenerMensajeError(requestError));
    } finally {
      setSaving(false);
    }
  };

  const cerrar = () => {
    if (saving) return;

    setError(null);
    setSuccess(null);
    onClose();
  };

  const nombreCompleto = usuario
    ? `${usuario.name || ""} ${usuario.apellidos || ""}`.trim()
    : "";

  return (
    <Dialog
      open={open}
      onClose={cerrar}
      fullWidth
      maxWidth="sm"
      fullScreen={fullScreen}
      scroll="paper"
      PaperProps={{
        sx: {
          width: {
            xs: "100%",
            sm: "calc(100% - 48px)",
          },
          maxWidth: {
            xs: "100%",
            sm: 620,
          },
          maxHeight: {
            xs: "100%",
            sm: "calc(100vh - 64px)",
          },
          m: {
            xs: 0,
            sm: 3,
          },
          borderRadius: {
            xs: 0,
            sm: 3,
          },
        },
      }}
    >
      <DialogTitle sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
        {exists ? "Editar datos fiscales" : "Crear datos fiscales"}
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          px: {
            xs: 2,
            sm: 3,
          },
          py: {
            xs: 2,
            sm: 2.5,
          },
        }}
      >
        {usuario && (
          <Box sx={{ mb: 2.5 }}>
            <Typography fontWeight={700}>
              {nombreCompleto}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              {usuario.email}
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {loading ? (
          <Box
            sx={{
              minHeight: 220,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
              },
              gap: 2,
              pt: 0.5,
            }}
          >
            <TextField
              label="Razón social"
              value={form.razon_social}
              onChange={(event) =>
                actualizarCampo(
                  "razon_social",
                  event.target.value
                )
              }
              disabled={saving}
              required
              fullWidth
              sx={{
                gridColumn: {
                  sm: "span 2",
                },
              }}
            />

            <TextField
              label="RFC"
              value={form.rfc}
              onChange={(event) =>
                actualizarCampo(
                  "rfc",
                  event.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9Ñ&]/g, "")
                    .slice(0, 13)
                )
              }
              inputProps={{
                maxLength: 13,
              }}
              disabled={saving}
              required
              fullWidth
            />

            <TextField
              label="Código postal fiscal"
              value={form.codigo_postal}
              onChange={(event) =>
                actualizarCampo(
                  "codigo_postal",
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 5)
                )
              }
              inputProps={{
                inputMode: "numeric",
                maxLength: 5,
              }}
              disabled={saving}
              required
              fullWidth
            />

            <FormControl
              fullWidth
              required
              disabled={saving}
              sx={{
                gridColumn: {
                  sm: "span 2",
                },
              }}
            >
              <InputLabel id="regimen-fiscal-label">
                Régimen fiscal
              </InputLabel>

              <Select
                labelId="regimen-fiscal-label"
                label="Régimen fiscal"
                value={form.regimen_fiscal}
                onChange={(event) =>
                  actualizarCampo(
                    "regimen_fiscal",
                    String(event.target.value)
                  )
                }
                renderValue={(value) => {
                  const regimen = REGIMENES_SAT.find(
                    (item) =>
                      item.codigo === String(value)
                  );

                  return regimen
                    ? `${regimen.codigo} — ${regimen.nombre}`
                    : String(value);
                }}
                MenuProps={{
                  disableScrollLock: true,
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                  PaperProps: {
                    sx: {
                      mt: 0.5,
                      width: {
                        xs: "calc(100vw - 32px)",
                        sm: 480,
                      },
                      maxWidth: "calc(100vw - 32px)",
                      maxHeight: {
                        xs: 240,
                        sm: 280,
                      },
                      borderRadius: 2,
                      overflowY: "auto",
                      scrollbarWidth: "thin",
                      "&::-webkit-scrollbar": {
                        width: 7,
                      },
                      "&::-webkit-scrollbar-track": {
                        backgroundColor: "transparent",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        borderRadius: 8,
                        backgroundColor: "text.disabled",
                      },
                    },
                  },
                  MenuListProps: {
                    dense: true,
                    sx: {
                      py: 0.5,
                    },
                  },
                }}
                sx={{
                  "& .MuiSelect-select": {
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    pr: "38px !important",
                  },
                }}
              >
                {REGIMENES_SAT.map((regimen) => (
                  <MenuItem
                    key={regimen.codigo}
                    value={regimen.codigo}
                    sx={{
                      minHeight: "38px !important",
                      px: 1.5,
                      py: 0.75,
                      whiteSpace: "normal",
                      alignItems: "flex-start",
                    }}
                  >
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns:
                          "38px minmax(0, 1fr)",
                        gap: 1,
                        width: "100%",
                        alignItems: "start",
                      }}
                    >
                      <Typography
                        component="span"
                        fontSize={13}
                        fontWeight={800}
                      >
                        {regimen.codigo}
                      </Typography>

                      <Typography
                        component="span"
                        fontSize={13}
                        lineHeight={1.3}
                        sx={{
                          whiteSpace: "normal",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {regimen.nombre}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>

              <FormHelperText>
                Se guardará la clave SAT seleccionada.
              </FormHelperText>
            </FormControl>
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: {
            xs: 2,
            sm: 3,
          },
          py: 2,
          flexDirection: {
            xs: "column-reverse",
            sm: "row",
          },
          gap: 1,
        }}
      >
        <Button
          onClick={cerrar}
          disabled={saving}
          fullWidth={fullScreen}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={guardar}
          disabled={loading || saving || !usuario}
          fullWidth={fullScreen}
          startIcon={
            saving
              ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              )
              : undefined
          }
        >
          {saving
            ? "Guardando..."
            : exists
              ? "Actualizar datos"
              : "Crear datos"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}