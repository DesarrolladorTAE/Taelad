// src/pages/TaeTeDaMas.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Grid, Card, CardContent, Typography, Stack, Chip, Button, Box,
  Divider, Snackbar, Alert, IconButton, Tooltip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, Checkbox,
  Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper, Pagination
} from "@mui/material";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import PercentIcon from "@mui/icons-material/Percent";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LinkIcon from "@mui/icons-material/Link";
import HistoryIcon from "@mui/icons-material/History";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";
import Page from "./Page";
import { usersApi, referidosApi, type Ganancia, type RetiroGanancia } from "../../../services/api";

const perks = [
  { icon: <WorkspacePremiumIcon />, titulo: "Referidos TAE", desc: "Gana comisiones por recomendar nuestros sistemas.", tag: "Nuevo" },
  { icon: <PercentIcon />, titulo: "Descuentos por volumen", desc: "Mejor precio al contratar más módulos.", tag: "Proximamente" },
  { icon: <HeadsetMicIcon />, titulo: "Soporte prioritario", desc: "Atención preferente para planes anuales.", tag: "Prioridad" },
];

// Paleta TAE
const TAE = {
  blue: "#0B57D0",
  orange: "#FF6A00",
  black: "#0f1115",
  white: "#ffffff",
};

// URLs base solicitadas
const URLS_BASE = {
  MTLMX: "https://mitiendaenlineamx.com.mx/login-register",
  TAECONTA: "https://www.taeconta.com/autenticacion/crear-cuenta",
  RECHARGES: "https://telorecargo.com/loginmui",
  // Página principal (por si la usas en otra parte)
  TAE_HOME: typeof window !== "undefined" ? window.location.origin : "https://taeconta.com",
};

// Helper para anexar ?ref=codigo respetando query existente
function linkWithRef(baseUrl: string, ref?: string | null) {
  try {
    const u = new URL(baseUrl);
    if (ref) u.searchParams.set("ref", ref);
    return u.toString();
  } catch {
    // Fallback si por alguna razón no parsea
    if (!ref) return baseUrl;
    return baseUrl.includes("?") ? `${baseUrl}&ref=${encodeURIComponent(ref)}` : `${baseUrl}?ref=${encodeURIComponent(ref)}`;
  }
}

function currency(n: string | number) {
  const v = typeof n === "string" ? parseFloat(n || "0") : n || 0;
  return v.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

export default function TaeTeDaMas() {
  const [me, setMe] = useState<{ id: number; name: string; codigo_ref?: string | null } | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [codigo, setCodigo] = useState<string | null>(null);

  // Enlaces con ref dinámico
  const links = useMemo(() => {
    return {
      mtlmx: linkWithRef(URLS_BASE.MTLMX, codigo),
      taeconta: linkWithRef(URLS_BASE.TAECONTA, codigo),
      telorecargo: linkWithRef(URLS_BASE.RECHARGES, codigo),
      home: linkWithRef(URLS_BASE.TAE_HOME, codigo),
    };
  }, [codigo]);

  // Mensaje para compartir con enlaces que incluyen el código
  const promoMsg = useMemo(() => {
    return [
      "💙🧡 TAE te da más",
      "",
      "¡Increíbles promociones en nuestros sistemas! 🚀",
      "• MiTiendaEnLineaMX (POS + Tienda): " + links.mtlmx,
      "• TAEConta (Contabilidad + CFDI): " + links.taeconta,
      "• TeLoRecargo (Tiempo aire): " + links.telorecargo,
      "• Plataforma TAE: " + links.home,
      "",
      "Beneficios: comisiones por altas y compras, bonos por volumen, soporte prioritario y promos exclusivas. 🎁",
      "",
      "¿Listo para ganar más con TAE? 😉",
    ].join("\n");
  }, [links]);

  const [openTC, setOpenTC] = useState(false);
  const [aceptaTC, setAceptaTC] = useState(false);
  const [genLoading, setGenLoading] = useState(false);

  const [ganancias, setGanancias] = useState<Ganancia[]>([]);
  const [retiros, setRetiros] = useState<RetiroGanancia[]>([]);
  const [pagG, setPagG] = useState({ page: 1, last: 1, per_page: 10 });
  const [pagR, setPagR] = useState({ page: 1, last: 1, per_page: 10 });
  const [loadingTablas, setLoadingTablas] = useState(false);

  const [toast, setToast] = useState<{ open: boolean; msg: string; sev: "success" | "info" | "warning" | "error" }>({ open: false, msg: "", sev: "success" });

  // Cargar usuario
  useEffect(() => {
    (async () => {
      try {
        const { data } = await usersApi.getMe();
        const user = (data?.data || data) as any;
        setMe({ id: user.id, name: user.name, codigo_ref: user.codigo_ref });
        setCodigo(user.codigo_ref || null);
      } catch (e: any) {
        setToast({ open: true, msg: "No se pudo cargar el usuario", sev: "error" });
      } finally {
        setLoadingUser(false);
      }
    })();
  }, []);

  // Cargar historiales
  const fetchHistoriales = async (pageG = pagG.page, pageR = pagR.page) => {
    if (!me?.id) return;
    setLoadingTablas(true);
    try {
      const [g, r] = await Promise.all([
        referidosApi.verGanancias({ user_id: me.id, per_page: pagG.per_page, page: pageG }),
        referidosApi.verRetiros({ user_id: me.id, per_page: pagR.per_page, page: pageR }),
      ]);
      const gd = g.data?.data || [];
      const rd = r.data?.data || [];
      setGanancias(gd as Ganancia[]);
      setRetiros(rd as RetiroGanancia[]);
      setPagG((p) => ({ ...p, page: (g.data?.pagination?.current_page ?? 1), last: (g.data?.pagination?.last_page ?? 1) }));
      setPagR((p) => ({ ...p, page: (r.data?.pagination?.current_page ?? 1), last: (r.data?.pagination?.last_page ?? 1) }));
    } catch {
      setToast({ open: true, msg: "No se pudieron cargar los historiales", sev: "error" });
    } finally {
      setLoadingTablas(false);
    }
  };

  useEffect(() => {
    if (me?.id) fetchHistoriales(1, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.id]);

  const copy = async (text: string, label = "Copiado") => {
    try {
      await navigator.clipboard.writeText(text);
      setToast({ open: true, msg: label, sev: "success" });
    } catch {
      setToast({ open: true, msg: "No se pudo copiar", sev: "error" });
    }
  };

  const onGenerar = () => {
    setAceptaTC(false);
    setOpenTC(true);
  };

  const confirmarGenerar = async () => {
    if (!me?.id) return;
    setGenLoading(true);
    try {
      const r = await referidosApi.asignarCodigo(me.id);
      const nuevo = r.data?.codigo_ref || r.data?.data?.codigo_ref;
      setCodigo(nuevo);
      setToast({ open: true, msg: "¡Código generado!", sev: "success" });
      setOpenTC(false);
    } catch (e: any) {
      setToast({ open: true, msg: e?.response?.data?.message || "No se pudo generar el código", sev: "error" });
    } finally {
      setGenLoading(false);
    }
  };

  // Compartir usando el mensaje con links que incluyen ref
  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(promoMsg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };
  const shareFacebook = () => {
    // Facebook requiere una URL; compartimos la de MiTienda con ?ref=...
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(links.mtlmx)}&quote=${encodeURIComponent(promoMsg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Page title="TAE te da más">
      {/* Hero + acciones */}
      <Box sx={{ mb: 2, p: 2, borderRadius: 2, background: `linear-gradient(135deg, ${TAE.blue} 0%, ${TAE.orange} 100%)`, color: TAE.white }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
          <Box>
            <Typography variant="h5" fontWeight={900}>Programa de Referidos TAE</Typography>
            <Typography variant="body2" sx={{ opacity: 0.95 }}>
              “TAE te da más”: promociones, comisiones y beneficios en nuestros sistemas.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            {!codigo ? (
              <Button onClick={onGenerar} variant="contained" sx={{ bgcolor: TAE.black }}>
                Generar mi código
              </Button>
            ) : (
              <Button startIcon={<AssignmentTurnedInIcon />} variant="contained" sx={{ bgcolor: TAE.black }}>
                Código activo
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Perks */}
      <Grid container spacing={2} sx={{ mb: 1 }}>
        {perks.map((p, idx) => (
          <Grid key={idx} item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                  {p.icon}
                  <Typography variant="h6" fontWeight={800}>{p.titulo}</Typography>
                  <Chip size="small" label={p.tag} color="primary" />
                </Stack>
                <Typography variant="body2" color="text.secondary">{p.desc}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Código + Acciones + Enlaces con ref */}
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid item xs={12} md={5}>
          <Card sx={{ border: `1px solid ${TAE.blue}22` }}>
            <CardContent>
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" color="text.secondary">Tu código de referido</Typography>
                {loadingUser ? (
                  <Stack direction="row" alignItems="center" spacing={1}><CircularProgress size={18} /> <Typography>Cargando…</Typography></Stack>
                ) : codigo ? (
                  <>
                    <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: 2 }}>{codigo}</Typography>

                    {/* BOTONES DEBAJO DEL CÓDIGO */}
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                      <Button startIcon={<ContentCopyIcon />} onClick={() => copy(codigo!, "Código copiado")} variant="outlined">
                        Copiar código
                      </Button>
                      <Button startIcon={<WhatsAppIcon />} onClick={shareWhatsApp} variant="contained" sx={{ bgcolor: "#25D366" }}>
                        WhatsApp
                      </Button>
                      <Button startIcon={<FacebookIcon />} onClick={shareFacebook} variant="contained" sx={{ bgcolor: "#1877F2" }}>
                        Facebook
                      </Button>
                    </Stack>

                    {/* Enlaces con ?ref=<codigo> para copiar rápido */}
                    <Box sx={{ p: 1.25, borderRadius: 1, bgcolor: `${TAE.blue}0F`, border: `1px dashed ${TAE.blue}55` }}>
                      <Typography variant="subtitle2" sx={{ mb: .75 }}>Tus enlaces con código</Typography>
                      <Stack spacing={0.75}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LinkIcon fontSize="small" />
                          <Typography variant="body2" sx={{ wordBreak: "break-all" }}>{links.mtlmx}</Typography>
                          <Button size="small" onClick={() => copy(links.mtlmx, "Link MiTienda copiado")} startIcon={<ContentCopyIcon />}>Copiar</Button>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LinkIcon fontSize="small" />
                          <Typography variant="body2" sx={{ wordBreak: "break-all" }}>{links.taeconta}</Typography>
                          <Button size="small" onClick={() => copy(links.taeconta, "Link TAEConta copiado")} startIcon={<ContentCopyIcon />}>Copiar</Button>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LinkIcon fontSize="small" />
                          <Typography variant="body2" sx={{ wordBreak: "break-all" }}>{links.telorecargo}</Typography>
                          <Button size="small" onClick={() => copy(links.telorecargo, "Link TeLoRecargo copiado")} startIcon={<ContentCopyIcon />}>Copiar</Button>
                        </Stack>
                      </Stack>
                      <Typography variant="caption" display="block" sx={{ mt: 0.75 }}>
                        Comparte tu código cuando te lo soliciten o usa los enlaces directos ya con tu <b>ref</b>.
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" color="text.secondary">Aún no tienes un código de referido.</Typography>
                    <Button onClick={onGenerar} variant="contained">Crear mi código ahora</Button>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Historial de ganancias */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <MonetizationOnIcon />
                  <Typography variant="h6" fontWeight={800}>Historial de ganancias</Typography>
                </Stack>
                <Tooltip title="Recargar">
                  <span>
                    <IconButton onClick={() => fetchHistoriales(pagG.page, pagR.page)} disabled={loadingTablas}>
                      <HistoryIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
              <Divider sx={{ mb: 1 }} />
              <TableContainer component={Paper} sx={{ maxHeight: 320 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Sistema</TableCell>
                      <TableCell>Concepto</TableCell>
                      <TableCell align="right">Monto</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingTablas ? (
                      <TableRow><TableCell colSpan={5}><Stack direction="row" spacing={1} alignItems="center"><CircularProgress size={16} />Cargando…</Stack></TableCell></TableRow>
                    ) : ganancias.length === 0 ? (
                      <TableRow><TableCell colSpan={5}>Sin registros</TableCell></TableRow>
                    ) : (
                      ganancias.map((g) => (
                        <TableRow key={g.id}>
                          <TableCell>{g.created_at?.slice(0, 10)}</TableCell>
                          <TableCell>{g.sistema || "—"}</TableCell>
                          <TableCell>{g.origen || g.producto_nombre || "—"}</TableCell>
                          <TableCell align="right">{currency(g.monto)}</TableCell>
                          <TableCell>
                            <Chip size="small" label={g.status} color={g.status === "pagada" || g.status === "confirmada" ? "success" : g.status === "rechazada" ? "error" : "warning"} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1 }}>
                <Pagination
                  page={pagG.page}
                  count={pagG.last}
                  size="small"
                  onChange={(_, p) => { setPagG((x) => ({ ...x, page: p })); fetchHistoriales(p, pagR.page); }}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Historial de retiros */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <HistoryIcon />
            <Typography variant="h6" fontWeight={800}>Historial de retiros</Typography>
          </Stack>
          <Divider sx={{ mb: 1 }} />
          <TableContainer component={Paper} sx={{ maxHeight: 360 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Método</TableCell>
                  <TableCell>Referencia</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingTablas ? (
                  <TableRow><TableCell colSpan={5}><Stack direction="row" spacing={1} alignItems="center"><CircularProgress size={16} />Cargando…</Stack></TableCell></TableRow>
                ) : retiros.length === 0 ? (
                  <TableRow><TableCell colSpan={5}>Sin registros</TableCell></TableRow>
                ) : (
                  retiros.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.created_at?.slice(0, 10)}</TableCell>
                      <TableCell>{r.metodo}</TableCell>
                      <TableCell>{r.referencia_pago || "—"}</TableCell>
                      <TableCell align="right">{currency(r.monto)}</TableCell>
                      <TableCell>
                        <Chip size="small" label={r.status} color={r.status === "pagado" ? "success" : r.status === "rechazado" ? "error" : "warning"} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1 }}>
            <Pagination
              page={pagR.page}
              count={pagR.last}
              size="small"
              onChange={(_, p) => { setPagR((x) => ({ ...x, page: p })); fetchHistoriales(pagG.page, p); }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Modal Términos y Condiciones */}
      <Dialog open={openTC} onClose={() => setOpenTC(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 900, bgcolor: `${TAE.blue}08` }}>Términos y condiciones del programa</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.25} sx={{ "& li": { mb: 0.5 } }}>
            <Typography variant="body2" color="text.secondary">
              Para generar tu código de referido debes aceptar los siguientes términos provisionales:
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <li><Typography variant="body2"><b>Elegibilidad:</b> El uso del programa está sujeto a la aprobación de TAE y a una cuenta activa sin adeudos.</Typography></li>
              <li><Typography variant="body2"><b>Validación de comisiones:</b> Las comisiones se confirman cuando el pago del referido se verifica y no hay cancelaciones ni reembolsos.</Typography></li>
              <li><Typography variant="body2"><b>Fraude o mal uso:</b> Códigos compartidos con incentivos engañosos o spam podrán ser cancelados.</Typography></li>
              <li><Typography variant="body2"><b>Tiempos de pago:</b> Los retiros pueden tardar de 3 a 7 días hábiles después de ser aprobados.</Typography></li>
              <li><Typography variant="body2"><b>Modificaciones:</b> TAE puede ajustar porcentajes, reglas o disponibilidad con aviso previo en la plataforma.</Typography></li>
            </Box>
            <FormControlLabel
              control={<Checkbox checked={aceptaTC} onChange={(e) => setAceptaTC(e.target.checked)} />}
              label="He leído y acepto los términos y condiciones"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTC(false)}>Cancelar</Button>
          <Button
            onClick={confirmarGenerar}
            disabled={!aceptaTC || genLoading}
            variant="contained"
            startIcon={genLoading ? <CircularProgress size={16} /> : <WorkspacePremiumIcon />}
          >
            {genLoading ? "Generando…" : "Aceptar y generar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar open={toast.open} autoHideDuration={2800} onClose={() => setToast((t) => ({ ...t, open: false }))}>
        <Alert severity={toast.sev} variant="filled" onClose={() => setToast((t) => ({ ...t, open: false }))}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Page>
  );
}
