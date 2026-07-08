import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import type { ClicMenuRestaurantPayload } from "./clicMenuService";

type Restaurant = {
  id: number;
  trade_name?: string;
  description?: string;
  contact_phone?: string;
  contact_email?: string;
  status?: string;
};

type RestaurantFormState = {
  trade_name: string;
  description: string;
  contact_phone: string;
  contact_email: string;
  status: string;
};

type Props = {
  open: boolean;
  editing: Restaurant | null;
  ownerName?: string;
  error?: string;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (payload: ClicMenuRestaurantPayload) => void | Promise<void>;
};

const emptyForm: RestaurantFormState = {
  trade_name: "",
  description: "",
  contact_phone: "",
  contact_email: "",
  status: "active",
};

function cleanText(value?: string | null) {
  return String(value || "").trim();
}

export default function ClicMenuRestaurantFormDialog({
  open,
  editing,
  ownerName,
  error,
  saving = false,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<RestaurantFormState>(emptyForm);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!open) return;

    if (editing) {
      setForm({
        trade_name: editing.trade_name || "",
        description: editing.description || "",
        contact_phone: editing.contact_phone || "",
        contact_email: editing.contact_email || "",
        status: editing.status || "active",
      });
    } else {
      setForm(emptyForm);
    }

    setLocalError("");
  }, [open, editing]);

  const changeForm = (field: keyof RestaurantFormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const submit = async () => {
    setLocalError("");

    if (!cleanText(form.trade_name)) {
      setLocalError("El nombre comercial del restaurante es obligatorio.");
      return;
    }

    const payload: ClicMenuRestaurantPayload = {
      trade_name: cleanText(form.trade_name),
      description: cleanText(form.description),
      contact_phone: cleanText(form.contact_phone),
      contact_email: cleanText(form.contact_email),
      status: form.status || "active",
    };

    if (!payload.description) delete payload.description;
    if (!payload.contact_phone) delete payload.contact_phone;
    if (!payload.contact_email) delete payload.contact_email;

    await onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography fontWeight={900} fontSize={20}>
              {editing ? "Editar restaurante" : "Nuevo restaurante"}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {editing
                ? "Actualiza los datos del restaurante seleccionado."
                : ownerName
                ? `Registra un restaurante para ${ownerName}.`
                : "Registra un restaurante para el propietario seleccionado."}
            </Typography>
          </Box>

          <IconButton onClick={onClose} disabled={saving}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2.5 }}>
        <Stack spacing={2}>
          {(error || localError) && (
            <Alert severity="error">{error || localError}</Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Nombre comercial"
                value={form.trade_name}
                onChange={(event) =>
                  changeForm("trade_name", event.target.value)
                }
                fullWidth
                required
                disabled={saving}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Descripción"
                value={form.description}
                onChange={(event) =>
                  changeForm("description", event.target.value)
                }
                fullWidth
                multiline
                minRows={3}
                disabled={saving}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Teléfono de contacto"
                value={form.contact_phone}
                onChange={(event) =>
                  changeForm("contact_phone", event.target.value)
                }
                fullWidth
                disabled={saving}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Correo de contacto"
                type="email"
                value={form.contact_email}
                onChange={(event) =>
                  changeForm("contact_email", event.target.value)
                }
                fullWidth
                disabled={saving}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Estado"
                select
                value={form.status}
                onChange={(event) => changeForm("status", event.target.value)}
                fullWidth
                disabled={saving}
              >
                <MenuItem value="active">Activo</MenuItem>
                <MenuItem value="inactive">Inactivo</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={saving}
          sx={{ fontWeight: 800, borderRadius: 2 }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={submit}
          disabled={saving}
          sx={{ fontWeight: 800, borderRadius: 2, minWidth: 120 }}
        >
          {saving ? "Guardando..." : editing ? "Actualizar" : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
export {};