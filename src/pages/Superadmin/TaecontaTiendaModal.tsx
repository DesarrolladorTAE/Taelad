import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import {
  getApiErrorMessage,
  getTaecontaConfigTienda,
  hasTaecontaAccess,
  normalizeTaecontaConfig,
  updateTaecontaConfigTienda,
  type TaecontaConfigForm,
} from "../../services/miTiendaTaecontaService";

type Props = {
  open: boolean;
  tiendaId: number | string | null;
  tiendaNombre?: string;
  onClose: () => void;
  onUpdated?: () => void | Promise<void>;
};

const EMPTY_FORM: TaecontaConfigForm = {
  email: "",
  password: "",
};

export default function TaecontaTiendaModal({
  open,
  tiendaId,
  tiendaNombre,
  onClose,
  onUpdated,
}: Props) {
  const [form, setForm] = useState<TaecontaConfigForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const autocompleteKey = useMemo(() => {
    return `taeconta_${tiendaId ?? "nuevo"}_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}`;
  }, [open, tiendaId]);

  const cargarTaeconta = async () => {
    if (!tiendaId) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await getTaecontaConfigTienda(tiendaId);

      setForm(normalizeTaecontaConfig(data));
      setHasAccess(hasTaecontaAccess(data));
    } catch (err) {
      setForm(EMPTY_FORM);
      setHasAccess(false);
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const guardar = async () => {
    if (!tiendaId) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await updateTaecontaConfigTienda(tiendaId, {
        email: form.email.trim(),
        password: form.password.trim(),
      });

      setSuccess("Credenciales de TAECONTA actualizadas correctamente.");
      setHasAccess(true);

      if (onUpdated) {
        await onUpdated();
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const cerrar = () => {
    if (saving) return;

    setShowPassword(false);
    setError("");
    setSuccess("");
    onClose();
  };

  useEffect(() => {
    if (open && tiendaId) {
      cargarTaeconta();
    }

    if (!open) {
      setForm(EMPTY_FORM);
      setHasAccess(false);
      setShowPassword(false);
      setError("");
      setSuccess("");
    }
  }, [open, tiendaId]);

  return (
    <Dialog open={open} onClose={cerrar} fullWidth maxWidth="sm">
      <Box
        component="form"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          guardar();
        }}
      >
        <input
          type="text"
          name={`${autocompleteKey}_fake_user`}
          autoComplete="username"
          tabIndex={-1}
          style={{
            position: "absolute",
            opacity: 0,
            height: 0,
            width: 0,
            pointerEvents: "none",
          }}
        />

        <input
          type="password"
          name={`${autocompleteKey}_fake_pass`}
          autoComplete="current-password"
          tabIndex={-1}
          style={{
            position: "absolute",
            opacity: 0,
            height: 0,
            width: 0,
            pointerEvents: "none",
          }}
        />

        <DialogTitle>
          Acceso TAECONTA
          {tiendaNombre ? ` - ${tiendaNombre}` : ""}
        </DialogTitle>

        <DialogContent dividers>
          {loading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 4 }}>
              <CircularProgress size={32} />
            </Stack>
          ) : (
            <Stack spacing={2}>
              {!hasAccess && (
                <Alert severity="warning">
                  Esta tienda no tiene acceso TAECONTA registrado.
                </Alert>
              )}

              {error && <Alert severity="error">{error}</Alert>}

              {success && <Alert severity="success">{success}</Alert>}

              <Typography variant="body2" color="text.secondary">
                Configura el correo y contraseña de acceso TAECONTA para esta
                tienda.
              </Typography>

              <TextField
                fullWidth
                label="Correo de acceso"
                type="text"
                value={form.email}
                disabled={saving}
                autoComplete="new-password"
                name={`${autocompleteKey}_correo_acceso`}
                inputProps={{
                  autoComplete: "new-password",
                  name: `${autocompleteKey}_correo_acceso`,
                  spellCheck: "false",
                  autoCorrect: "off",
                  autoCapitalize: "none",
                  inputMode: "email",
                }}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
              />

              <TextField
                fullWidth
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                value={form.password}
                disabled={saving}
                autoComplete="new-password"
                name={`${autocompleteKey}_clave_acceso`}
                inputProps={{
                  autoComplete: "new-password",
                  name: `${autocompleteKey}_clave_acceso`,
                  spellCheck: "false",
                  autoCorrect: "off",
                  autoCapitalize: "none",
                }}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        disabled={saving}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button type="button" onClick={cerrar} disabled={saving}>
            Cerrar
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={
              loading ||
              saving ||
              !form.email.trim() ||
              !form.password.trim()
            }
          >
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}