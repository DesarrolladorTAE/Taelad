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
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import axiosClient from "../../../services/axiosClient";
import {
  SuperAdminUserFiscalPayload,
  usersApi,
} from "../../../services/api";

type RegimenFiscalOption = {
  codigo: string;
  descripcion: string;
};

type TipoPersonaFiscal =
  | "fisica"
  | "moral";

type FiscalRegimesResponse = {
  success: boolean;
  message: string;
  data: {
    rfc: string;
    tipo_persona: TipoPersonaFiscal;
    tipo_persona_label: string;
    regimenes: RegimenFiscalOption[];
  };
};

type FiscalDataResponse = {
  success?: boolean;
  message: string;
  exists: boolean;
  tipo_persona?: TipoPersonaFiscal | null;
  tipo_persona_label?: string | null;
  regimenes_disponibles?: RegimenFiscalOption[];
  data?: {
    razon_social?: string | null;
    rfc?: string | null;
    regimen_fiscal?: string | null;
    codigo_postal?: string | null;
    tipo_persona?: TipoPersonaFiscal | null;
    tipo_persona_label?: string | null;
  } | null;
};

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
  regimen_fiscal: "",
  codigo_postal: "",
};

function normalizarRfc(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9Ñ&]/g, "")
    .slice(0, 13);
}

function longitudRfcValida(rfc: string): boolean {
  return rfc.length === 12 || rfc.length === 13;
}

function tipoPersonaEsperado(
  rfc: string,
): TipoPersonaFiscal | null {
  if (rfc.length === 13) {
    return "fisica";
  }

  if (rfc.length === 12) {
    return "moral";
  }

  return null;
}

function obtenerMensajeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | {
          message?: string;
          errors?:
            | Record<string, string[]>
            | string[];
        }
      | undefined;

    let primerError: string | null = null;

    if (
      data &&
      Array.isArray(data.errors)
    ) {
      primerError =
        data.errors.find(
          (item) =>
            typeof item === "string" &&
            item.trim() !== "",
        ) ?? null;
    } else if (data?.errors) {
      primerError =
        Object.values(data.errors)
          .flat()
          .find(
            (item) =>
              typeof item === "string" &&
              item.trim() !== "",
          ) ?? null;
    }

    return (
      primerError ||
      data?.message ||
      "No fue posible completar la operación."
    );
  }

  if (
    error instanceof Error &&
    error.message.trim() !== ""
  ) {
    return error.message;
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
  const fullScreen = useMediaQuery(
    theme.breakpoints.down("sm"),
  );

  const [form, setForm] =
    useState<SuperAdminUserFiscalPayload>(
      FORM_INICIAL,
    );

  const [exists, setExists] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [
    loadingRegimenes,
    setLoadingRegimenes,
  ] = useState(false);

  const [
    tipoPersona,
    setTipoPersona,
  ] =
    useState<TipoPersonaFiscal | null>(
      null,
    );

  const [
    tipoPersonaLabel,
    setTipoPersonaLabel,
  ] = useState("");

  const [
    regimenes,
    setRegimenes,
  ] = useState<RegimenFiscalOption[]>(
    [],
  );

  const [
    rfcError,
    setRfcError,
  ] = useState<string | null>(null);

  const [
    regimenError,
    setRegimenError,
  ] = useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const rfcNormalizado = useMemo(
    () => normalizarRfc(form.rfc),
    [form.rfc],
  );

  /*
   * Carga inicial de datos fiscales.
   */
  useEffect(() => {
    if (!open || !usuario) {
      return;
    }

    let active = true;

    const cargarDatos = async () => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setRfcError(null);
      setRegimenError(null);
      setForm(FORM_INICIAL);
      setExists(false);
      setTipoPersona(null);
      setTipoPersonaLabel("");
      setRegimenes([]);

      try {
        const response =
          await usersApi.getFiscal(
            usuario.id,
          );

        const result =
          response.data as FiscalDataResponse;

        if (!active) {
          return;
        }

        setExists(Boolean(result.exists));

        const data = result.data;

        if (!data) {
          return;
        }

        const rfc = normalizarRfc(
          data.rfc || "",
        );

        const regimenSeleccionado =
          data.regimen_fiscal || "";

        const opciones =
          result.regimenes_disponibles ??
          [];

        const tipo =
          result.tipo_persona ??
          data.tipo_persona ??
          tipoPersonaEsperado(rfc);

        const tipoLabel =
          result.tipo_persona_label ??
          data.tipo_persona_label ??
          (
            tipo === "fisica"
              ? "física"
              : tipo === "moral"
                ? "moral"
                : ""
          );

        const regimenCompatible =
          opciones.length === 0 ||
          opciones.some(
            (item) =>
              item.codigo ===
              regimenSeleccionado,
          );

        setTipoPersona(tipo);
        setTipoPersonaLabel(tipoLabel);
        setRegimenes(opciones);

        setForm({
          razon_social:
            data.razon_social || "",
          rfc,
          regimen_fiscal:
            regimenCompatible
              ? regimenSeleccionado
              : "",
          codigo_postal:
            data.codigo_postal || "",
        });

        if (
          regimenSeleccionado &&
          !regimenCompatible
        ) {
          setRegimenError(
            `El régimen fiscal ${regimenSeleccionado} guardado no corresponde a una persona ${tipoLabel}. Selecciona un régimen compatible.`,
          );
        }
      } catch (requestError) {
        if (active) {
          setError(
            obtenerMensajeError(
              requestError,
            ),
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void cargarDatos();

    return () => {
      active = false;
    };
  }, [open, usuario]);

  /*
   * Consulta al backend cada vez que el RFC queda completo.
   * El backend determina el tipo de persona y devuelve únicamente
   * los regímenes fiscales compatibles.
   */
  useEffect(() => {
    if (!open || loading) {
      return;
    }

    if (!longitudRfcValida(rfcNormalizado)) {
      setTipoPersona(null);
      setTipoPersonaLabel("");
      setRegimenes([]);
      setLoadingRegimenes(false);
      setRegimenError(null);

      setForm((actual) => (
        actual.regimen_fiscal
          ? {
              ...actual,
              regimen_fiscal: "",
            }
          : actual
      ));

      if (rfcNormalizado.length === 0) {
        setRfcError(null);
      } else {
        setRfcError(
          "El RFC debe contener exactamente 12 caracteres para persona moral o 13 para persona física.",
        );
      }

      return;
    }

    let active = true;

    const controller =
      new AbortController();

    const timer = window.setTimeout(
      async () => {
        setLoadingRegimenes(true);
        setRfcError(null);
        setRegimenError(null);

        try {
          const response =
            await axiosClient.get<FiscalRegimesResponse>(
              "/superadmin/users/fiscal-regimes",
              {
                params: {
                  rfc: rfcNormalizado,
                },
                signal: controller.signal,
              },
            );

          if (!active) {
            return;
          }

          const result = response.data;

          setTipoPersona(
            result.data.tipo_persona,
          );

          setTipoPersonaLabel(
            result.data.tipo_persona_label,
          );

          setRegimenes(
            result.data.regimenes ?? [],
          );

          setForm((actual) => {
            const compatible =
              result.data.regimenes.some(
                (item) =>
                  item.codigo ===
                  actual.regimen_fiscal,
              );

            if (
              actual.regimen_fiscal &&
              !compatible
            ) {
              setRegimenError(
                `El régimen fiscal seleccionado no corresponde a una persona ${result.data.tipo_persona_label}. Selecciona uno de los regímenes disponibles.`,
              );

              return {
                ...actual,
                regimen_fiscal: "",
              };
            }

            return actual;
          });
        } catch (requestError) {
          if (
            !active ||
            axios.isCancel(requestError)
          ) {
            return;
          }

          setTipoPersona(null);
          setTipoPersonaLabel("");
          setRegimenes([]);

          setForm((actual) => ({
            ...actual,
            regimen_fiscal: "",
          }));

          setRfcError(
            obtenerMensajeError(
              requestError,
            ),
          );
        } finally {
          if (active) {
            setLoadingRegimenes(false);
          }
        }
      },
      450,
    );

    return () => {
      active = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [
    loading,
    open,
    rfcNormalizado,
  ]);

  const actualizarCampo = (
    campo:
      keyof SuperAdminUserFiscalPayload,
    valor: string,
  ) => {
    setSuccess(null);

    if (campo === "rfc") {
      setError(null);
      setRfcError(null);
      setRegimenError(null);

      const rfc = normalizarRfc(valor);

      setForm((actual) => ({
        ...actual,
        rfc,
        regimen_fiscal:
          rfc === actual.rfc
            ? actual.regimen_fiscal
            : "",
      }));

      return;
    }

    if (campo === "regimen_fiscal") {
      setRegimenError(null);
    }

    setForm((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  };

  const validar = (): string | null => {
    if (!form.razon_social.trim()) {
      return "La razón social es obligatoria.";
    }

    if (!longitudRfcValida(rfcNormalizado)) {
      return "El RFC debe contener 12 caracteres para persona moral o 13 para persona física.";
    }

    if (rfcError) {
      return rfcError;
    }

    if (!tipoPersona) {
      return "Primero debe validarse el RFC.";
    }

    if (loadingRegimenes) {
      return "Espera a que termine la validación del RFC.";
    }

    if (
      !/^[0-9]{3}$/.test(
        form.regimen_fiscal,
      )
    ) {
      return "Selecciona un régimen fiscal.";
    }

    const regimenCompatible =
      regimenes.some(
        (item) =>
          item.codigo ===
          form.regimen_fiscal,
      );

    if (!regimenCompatible) {
      return `El régimen fiscal seleccionado no corresponde a una persona ${tipoPersonaLabel}.`;
    }

    if (
      !/^[0-9]{5}$/.test(
        form.codigo_postal,
      )
    ) {
      return "El código postal debe contener cinco dígitos.";
    }

    return null;
  };

  const guardar = async () => {
    if (!usuario) {
      return;
    }

    const validationError =
      validar();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response =
        await usersApi.updateFiscal(
          usuario.id,
          {
            razon_social:
              form.razon_social
                .trim()
                .toUpperCase(),
            rfc: rfcNormalizado,
            regimen_fiscal:
              form.regimen_fiscal,
            codigo_postal:
              form.codigo_postal,
          },
        );

      const result =
        response.data as FiscalDataResponse;

      setExists(true);
      setSuccess(
        result.message,
      );

      if (result.tipo_persona) {
        setTipoPersona(
          result.tipo_persona,
        );
      }

      if (result.tipo_persona_label) {
        setTipoPersonaLabel(
          result.tipo_persona_label,
        );
      }

      if (
        result.regimenes_disponibles
      ) {
        setRegimenes(
          result.regimenes_disponibles,
        );
      }

      onSaved?.();
    } catch (requestError) {
      setError(
        obtenerMensajeError(
          requestError,
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const cerrar = () => {
    if (saving) {
      return;
    }

    setError(null);
    setSuccess(null);
    setRfcError(null);
    setRegimenError(null);
    onClose();
  };

  const nombreCompleto = usuario
    ? `${usuario.name || ""} ${usuario.apellidos || ""}`.trim()
    : "";

  const regimenSeleccionado =
    regimenes.find(
      (item) =>
        item.codigo ===
        form.regimen_fiscal,
    );

  const selectorRegimenDeshabilitado =
    saving ||
    loadingRegimenes ||
    !tipoPersona ||
    regimenes.length === 0;

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
      <DialogTitle
        sx={{
          px: {
            xs: 2,
            sm: 3,
          },
          py: 2,
        }}
      >
        {exists
          ? "Editar datos fiscales"
          : "Crear datos fiscales"}
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
          <Alert
            severity="error"
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
          >
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
                  event.target.value,
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
                  event.target.value,
                )
              }
              inputProps={{
                maxLength: 13,
              }}
              InputProps={{
                endAdornment:
                  loadingRegimenes
                    ? (
                        <CircularProgress
                          size={18}
                        />
                      )
                    : undefined,
              }}
              error={Boolean(rfcError)}
              helperText={
                rfcError ||
                (
                  loadingRegimenes
                    ? "Validando RFC en el servidor..."
                    : tipoPersona
                      ? `RFC identificado como persona ${tipoPersonaLabel}.`
                      : "12 caracteres: persona moral. 13 caracteres: persona física."
                )
              }
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
                    .slice(0, 5),
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

            {tipoPersona && (
              <Alert
                severity="info"
                sx={{
                  gridColumn: {
                    sm: "span 2",
                  },
                }}
              >
                Tipo de persona detectado:{" "}
                <strong>
                  Persona {tipoPersonaLabel}
                </strong>
              </Alert>
            )}

            <FormControl
              fullWidth
              required
              disabled={
                selectorRegimenDeshabilitado
              }
              error={Boolean(regimenError)}
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
                    String(
                      event.target.value,
                    ),
                  )
                }
                renderValue={(value) => (
                  regimenSeleccionado
                    ? `${regimenSeleccionado.codigo} — ${regimenSeleccionado.descripcion}`
                    : String(value)
                )}
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
                        xs:
                          "calc(100vw - 32px)",
                        sm: 480,
                      },
                      maxWidth:
                        "calc(100vw - 32px)",
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
                        backgroundColor:
                          "transparent",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        borderRadius: 8,
                        backgroundColor:
                          "text.disabled",
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
                {regimenes.map(
                  (regimen) => (
                    <MenuItem
                      key={regimen.codigo}
                      value={regimen.codigo}
                      sx={{
                        minHeight:
                          "38px !important",
                        px: 1.5,
                        py: 0.75,
                        whiteSpace: "normal",
                        alignItems:
                          "flex-start",
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
                            whiteSpace:
                              "normal",
                            overflowWrap:
                              "anywhere",
                          }}
                        >
                          {regimen.descripcion}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ),
                )}
              </Select>

              <FormHelperText>
                {regimenError ||
                  (
                    loadingRegimenes
                      ? "Consultando regímenes fiscales..."
                      : tipoPersona
                        ? `Solo se muestran regímenes aplicables a persona ${tipoPersonaLabel}.`
                        : "Captura primero un RFC válido."
                  )}
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
          disabled={
            loading ||
            saving ||
            loadingRegimenes ||
            !usuario ||
            !tipoPersona ||
            Boolean(rfcError) ||
            !form.regimen_fiscal
          }
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