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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import complementos from "../../../../utils/complementos";
import { suscripcionesGlobalService } from "../../../../services/suscripcionesGlobalService";

type Tienda = {
  id: number;
  name: string;
  plan_id: number | null;
  trial_ends_at: string | null;
  plan_expiration: string | null;
  is_active: boolean;
};

type Props = {
  open: boolean;
  tienda: Tienda | null;
  onClose: () => void;
  onSuccess?: () => void;
};

type Complemento = {
  complemento_id: number;
  nombre: string;
  precio: number;
  tipo: string;
  nota?: string;
};

// =======================
// PLANES CON PRECIO REAL
// =======================
const planes = [
  { id: 1, nombre: "Plan Demo", precio: 0 },
  { id: 2, nombre: "Plan Negocio", precio: 199 },
  { id: 3, nombre: "Plan Profesional", precio: 449 },
  { id: 4, nombre: "Plan Avanzado", precio: 899},
];

// =======================
// DURACIÓN PLAN
// =======================
const getPlanDuration = (planId: number) => {
  switch (planId) {
    case 1:
    case 2:
      return { type: "month", value: 1 };
    case 3:
    case 4:
      return { type: "year", value: 1 };
    default:
      return { type: "month", value: 1 };
  }
};

const addTime = (date: string, type: string, value: number) => {
  const d = new Date(date);

  if (type === "month") d.setMonth(d.getMonth() + value);
  if (type === "year") d.setFullYear(d.getFullYear() + value);

  return d.toISOString().split("T")[0];
};

export default function AgregarSuscripcionModal({
  open,
  tienda,
  onClose,
  onSuccess,
}: Props) {
  const [tipo, setTipo] = useState<"plan" | "complemento">("plan");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [planId, setPlanId] = useState("1");
  const [complementoId, setComplementoId] = useState("");
  const [cantidad, setCantidad] = useState("1");

  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  const [monto, setMonto] = useState("");
  const [notas, setNotas] = useState("");

  const complementoSeleccionado = (complementos as Complemento[]).find(
    (item) => String(item.complemento_id) === complementoId
  );

  // =========================
  // INICIO AUTOMÁTICO
  // =========================
  useEffect(() => {
    if (!tienda?.plan_expiration) return;

    setStartsAt(tienda.plan_expiration.split("T")[0]);
  }, [tienda?.plan_expiration]);

  // =========================
  // FIN AUTOMÁTICO
  // =========================
  useEffect(() => {
    if (!startsAt || !planId) return;

    const plan = getPlanDuration(Number(planId));
    const end = addTime(startsAt, plan.type, plan.value);

    setEndsAt(end);
  }, [startsAt, planId]);

  // =========================
  // MONTO AUTOMÁTICO PLAN
  // =========================
  useEffect(() => {
    if (tipo === "plan") {
      const plan = planes.find((p) => String(p.id) === planId);

      if (plan) {
        setMonto(String(plan.precio));
      }
    }
  }, [tipo, planId]);

  // =========================
  // MONTO AUTOMÁTICO COMPLEMENTO
  // =========================
  useEffect(() => {
    if (tipo === "complemento" && complementoSeleccionado) {
      setMonto(String(complementoSeleccionado.precio));
    }
  }, [tipo, complementoSeleccionado]);

  const resetForm = () => {
    setTipo("plan");
    setPlanId("1");
    setComplementoId("");
    setCantidad("1");
    setStartsAt("");
    setEndsAt("");
    setMonto("");
    setNotas("");
    setError("");
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      if (!tienda) return setError("Sin tienda");
      if (!startsAt || !endsAt || !monto)
        return setError("Completa fechas y monto");

      const payload =
        tipo === "plan"
          ? {
              store_id: tienda.id,
              plan_id: Number(planId),
              starts_at: startsAt,
              ends_at: endsAt,
              monto: Number(monto),
            }
          : {
              store_id: tienda.id,
              complemento_id: Number(complementoId),
              cantidad: Number(cantidad),
              starts_at: startsAt,
              ends_at: endsAt,
              monto: Number(monto),
              notas,
            };

      await suscripcionesGlobalService.agregarSuscripcion(payload);

      onSuccess?.();
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Agregar suscripción o complemento</DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}

          <FormControl fullWidth size="small">
            <InputLabel>Tipo</InputLabel>
            <Select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as any)}
            >
              <MenuItem value="plan">Suscripción</MenuItem>
              <MenuItem value="complemento">Complemento</MenuItem>
            </Select>
          </FormControl>

          {tipo === "plan" ? (
            <FormControl fullWidth size="small">
              <InputLabel>Plan</InputLabel>
              <Select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
              >
                {planes.map((p) => (
                  <MenuItem key={p.id} value={String(p.id)}>
                    {p.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <FormControl fullWidth size="small">
              <InputLabel>Complemento</InputLabel>
              <Select
                value={complementoId}
                onChange={(e) => setComplementoId(e.target.value)}
              >
                {(complementos as Complemento[]).map((c) => (
                  <MenuItem
                    key={c.complemento_id}
                    value={String(c.complemento_id)}
                  >
                    {c.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Stack direction="row" spacing={2}>
            <TextField value={startsAt} fullWidth label="Inicio" />
            <TextField value={endsAt} fullWidth label="Fin" />
          </Stack>

          <TextField
            label="Monto (auto)"
            value={monto}
            fullWidth
            InputProps={{ readOnly: true }}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Aplicar
        </Button>
      </DialogActions>
    </Dialog>
  );
}