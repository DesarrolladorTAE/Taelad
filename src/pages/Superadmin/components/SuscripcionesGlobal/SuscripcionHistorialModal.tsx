import type { ReactNode } from "react";
import { useEffect, useState } from "react";
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
  Divider,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import DateRangeIcon from "@mui/icons-material/DateRange";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import StorefrontIcon from "@mui/icons-material/Storefront";

import { suscripcionesGlobalService } from "../../../../services/suscripcionesGlobalService";

type Tienda = {
  id: number;
  name: string;
};

type Suscripcion = {
  id?: number;
  store_id?: number;
  plan_id?: number | null;
  complemento_id?: number | null;
  storecomplemento_id?: number | null;
  meses_pagados?: number | string | null;
  meses_obtenidos?: number | string | null;
  meses_bonificados?: number | string | null;
  cantidad?: number | string | null;

  plan?: {
    id?: number;
    name?: string;
    nombre?: string;
  } | null;

  complemento?: {
    id?: number;
    name?: string;
    nombre?: string;
    precio?: number | string | null;
    tipo?: string | null;
    nota?: string | null;
  } | null;

  store_complemento?: {
    id?: number;
    store_id?: number;
    complemento_id?: number;
    status?: string;
    cantidad?: number | string | null;
    fecha_inicio?: string | null;
    fecha_fin?: string | null;
    notas?: string | null;
    complemento?: {
      id?: number;
      nombre?: string;
      precio?: number | string | null;
      tipo?: string | null;
      nota?: string | null;
    } | null;
  } | null;

  status?: string;
  estado?: string;
  starts_at?: string | null;
  ends_at?: string | null;
  monto?: number | string | null;
  created_at?: string | null;
};

type Props = {
  open: boolean;
  tienda: Tienda | null;
  onClose: () => void;
};

function normalizarTipo(tipo?: string | null) {
  return String(tipo ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function capitalizarTexto(value?: string | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function esPagoUnico(item: Suscripcion) {
  const tipo =
    item.store_complemento?.complemento?.tipo || item.complemento?.tipo || "";

  return normalizarTipo(tipo) === "unico";
}

function formatDate(value?: string | null) {
  if (!value) return "N/A";

  const clean = value.split("T")[0];
  const [year, month, day] = clean.split("-");

  if (!year || !month || !day) return "N/A";

  return `${day}/${month}/${year}`;
}

function formatMoney(value?: number | string | null) {
  const numberValue = Number(value ?? 0);

  return numberValue.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

function formatPlan(planId?: number | null) {
  if (planId === 1) return "Plan Demo";
  if (planId === 2) return "Plan Negocio";
  if (planId === 3) return "Plan Profesional";
  if (planId === 4) return "Plan Avanzado";
  if (planId === null || planId === undefined) return "Sin plan";

  return `Plan ${planId}`;
}

function getConcepto(item: Suscripcion) {
  if (item.storecomplemento_id || item.store_complemento) {
    return (
      item.store_complemento?.complemento?.nombre ||
      `Complemento ${
        item.store_complemento?.complemento_id ??
        item.storecomplemento_id ??
        ""
      }`
    );
  }

  if (item.complemento_id || item.complemento) {
    return (
      item.complemento?.nombre ||
      item.complemento?.name ||
      `Complemento ${item.complemento_id ?? item.complemento?.id ?? ""}`
    );
  }

  if (item.plan_id || item.plan) {
    const nombrePlan =
      item.plan?.nombre ||
      item.plan?.name ||
      formatPlan(item.plan_id ?? item.plan?.id ?? null);

    return capitalizarTexto(nombrePlan);
  }

  return "N/A";
}

function getTipo(item: Suscripcion) {
  if (item.storecomplemento_id || item.store_complemento) {
    return "Complemento";
  }

  if (item.complemento_id || item.complemento) {
    return "Complemento";
  }

  if (item.plan_id || item.plan) {
    return "Plan";
  }

  return "N/A";
}

function getFechaInicio(item: Suscripcion) {
  return item.starts_at || item.store_complemento?.fecha_inicio || null;
}

function getFechaFin(item: Suscripcion) {
  return item.ends_at || item.store_complemento?.fecha_fin || null;
}

function getMonto(item: Suscripcion) {
  return (
    item.monto ??
    item.store_complemento?.complemento?.precio ??
    item.complemento?.precio ??
    0
  );
}

function getTipoPago(item: Suscripcion) {
  return item.status || item.estado || item.store_complemento?.status || "N/A";
}

function parseDate(value?: string | null) {
  if (!value) return null;

  const clean = value.split("T")[0];
  const [year, month, day] = clean.split("-").map(Number);

  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) return null;

  return date;
}

function diffMeses(inicio?: string | null, fin?: string | null) {
  const start = parseDate(inicio);
  const end = parseDate(fin);

  if (!start || !end) return 0;

  let meses =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  if (end.getDate() < start.getDate()) {
    meses -= 1;
  }

  return meses > 0 ? meses : 1;
}

function getMesesPagadosNumero(item: Suscripcion) {
  if (esPagoUnico(item)) return 0;

  const mesesDirectos = Number(item.meses_pagados ?? 0);

  if (mesesDirectos > 0) {
    return mesesDirectos;
  }

  const cantidadDirecta = Number(
    item.cantidad ?? item.store_complemento?.cantidad ?? 0
  );

  if (cantidadDirecta > 0) {
    return cantidadDirecta;
  }

  const mesesCalculados = diffMeses(getFechaInicio(item), getFechaFin(item));

  if (mesesCalculados > 0) {
    return mesesCalculados;
  }

  return 0;
}

function getMesesObtenidosNumero(item: Suscripcion) {
  if (esPagoUnico(item)) return 0;

  const mesesObtenidosDirectos = Number(item.meses_obtenidos ?? 0);

  if (mesesObtenidosDirectos > 0) {
    return mesesObtenidosDirectos;
  }

  const mesesPagados = getMesesPagadosNumero(item);

  if (mesesPagados <= 0) {
    return 0;
  }

  return mesesPagados + Math.floor(mesesPagados / 5);
}

function getTextoMeses(item: Suscripcion) {
  if (esPagoUnico(item)) {
    return {
      pagados: "Pago único",
      obtenidos: "No aplica",
    };
  }

  const mesesPagados = getMesesPagadosNumero(item);
  const mesesObtenidos = getMesesObtenidosNumero(item);

  return {
    pagados: mesesPagados > 0 ? `${mesesPagados} mes(es)` : "N/A",
    obtenidos: mesesObtenidos > 0 ? `${mesesObtenidos} mes(es)` : "N/A",
  };
}

export default function SuscripcionHistorialModal({
  open,
  tienda,
  onClose,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [historial, setHistorial] = useState<Suscripcion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cargarHistorial = async () => {
    if (!tienda?.id) return;

    try {
      setLoading(true);
      setError("");

      const response =
        await suscripcionesGlobalService.obtenerSuscripcionesPorTienda(
          tienda.id
        );

      const data = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      setHistorial(data);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "No se pudo cargar el historial.";

      setError(message);
      setHistorial([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && tienda?.id) {
      cargarHistorial();
    }
  }, [open, tienda?.id]);

  const handleClose = () => {
    if (loading) return;

    setError("");
    setHistorial([]);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      fullScreen={isMobile}
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 4 },
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography fontWeight={900} fontSize={{ xs: 20, sm: 24 }}>
          Historial de suscripciones
        </Typography>
      </DialogTitle>

      <DialogContent
        sx={{
          p: { xs: 2, sm: 3 },
          bgcolor: "#fbfcfe",
        }}
      >
        <Stack spacing={2.5}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: "#fff",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  bgcolor: "#eaf3ff",
                  color: "primary.main",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <StorefrontIcon />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  fontSize={12}
                  fontWeight={800}
                  color="primary"
                  textTransform="uppercase"
                  letterSpacing={0.4}
                >
                  Tienda seleccionada
                </Typography>

                <Tooltip title={tienda?.name || ""}>
                  <Typography
                    fontWeight={900}
                    fontSize={18}
                    noWrap
                    sx={{
                      maxWidth: { xs: "calc(100vw - 110px)", sm: 560 },
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {tienda?.name || "N/A"}
                  </Typography>
                </Tooltip>
              </Box>
            </Stack>
          </Paper>

          {error && <Alert severity="error">{error}</Alert>}

          {loading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {historial.map((item, index) => {
                const tipo = getTipo(item);
                const concepto = getConcepto(item);
                const unico = esPagoUnico(item);
                const meses = getTextoMeses(item);

                return (
                  <Paper
                    key={item.id ?? index}
                    variant="outlined"
                    sx={{
                      p: { xs: 1.8, sm: 2 },
                      borderRadius: 3,
                      bgcolor: "#fff",
                      transition: "0.2s ease",
                      "&:hover": {
                        borderColor: "primary.light",
                        boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          md: "1.1fr 1fr 1fr 0.95fr",
                        },
                        gap: { xs: 2, md: 2.5 },
                        alignItems: "start",
                      }}
                    >
                      <Stack spacing={0.7}>
                        <Chip
                          label={tipo}
                          size="small"
                          color={tipo === "Plan" ? "primary" : "default"}
                          sx={{
                            width: "fit-content",
                            fontWeight: 800,
                            height: 24,
                          }}
                        />

                        <Tooltip title={concepto}>
                          <Typography
                            fontWeight={900}
                            fontSize={16}
                            noWrap
                            sx={{
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {concepto}
                          </Typography>
                        </Tooltip>

                        <Typography fontSize={12} color="text.secondary">
                          Registro: {formatDate(item.created_at)}
                        </Typography>
                      </Stack>

                      <InfoBlock
                        icon={<DateRangeIcon fontSize="small" />}
                        title="Vigencia"
                        rows={[
                          {
                            label: "Inicio",
                            value: formatDate(getFechaInicio(item)),
                          },
                          {
                            label: "Fin",
                            value: unico ? "N/A" : formatDate(getFechaFin(item)),
                          },
                        ]}
                      />

                      <InfoBlock
                        icon={<EventAvailableIcon fontSize="small" />}
                        title="Meses"
                        rows={[
                          {
                            label: "Pagados",
                            value: meses.pagados,
                          },
                          {
                            label: "Obtenidos",
                            value: meses.obtenidos,
                          },
                        ]}
                      />

                      <InfoBlock
                        icon={<CreditCardIcon fontSize="small" />}
                        title="Pago"
                        rows={[
                          {
                            label: "Monto",
                            value: formatMoney(getMonto(item)),
                            strong: true,
                          },
                          {
                            label: "Tipo de pago",
                            value: getTipoPago(item),
                            chip: true,
                          },
                        ]}
                      />
                    </Box>
                  </Paper>
                );
              })}

              {historial.length === 0 && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    textAlign: "center",
                    bgcolor: "#fff",
                  }}
                >
                  <CheckCircleIcon color="disabled" sx={{ fontSize: 42 }} />

                  <Typography mt={1} fontWeight={800}>
                    No hay historial registrado.
                  </Typography>
                </Paper>
              )}
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "#fff",
        }}
      >
        <Button onClick={handleClose} disabled={loading} sx={{ fontWeight: 800 }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

type InfoRow = {
  label: string;
  value: string;
  strong?: boolean;
  chip?: boolean;
};

type InfoBlockProps = {
  icon: ReactNode;
  title: string;
  rows: InfoRow[];
};

function InfoBlock({ icon, title, rows }: InfoBlockProps) {
  return (
    <Stack
      spacing={1}
      sx={{
        p: 1.5,
        borderRadius: 2.5,
        bgcolor: "#f8fafc",
        minHeight: 104,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: 2,
            bgcolor: "#eaf3ff",
            color: "primary.main",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        <Typography fontWeight={900} fontSize={14}>
          {title}
        </Typography>
      </Stack>

      <Divider />

      <Stack spacing={0.7}>
        {rows.map((row) => (
          <Stack
            key={row.label}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1.5}
          >
            <Typography fontSize={12.5} color="text.secondary">
              {row.label}
            </Typography>

            {row.chip ? (
              <Chip
                size="small"
                label={row.value}
                sx={{
                  height: 22,
                  fontSize: 11,
                  fontWeight: 700,
                  bgcolor: "#eef2f7",
                }}
              />
            ) : (
              <Typography
                fontSize={13}
                fontWeight={row.strong ? 900 : 800}
                textAlign="right"
              >
                {row.value}
              </Typography>
            )}
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}