import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Stack,
  Avatar,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import StoreIcon from "@mui/icons-material/Store";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import Page from "./Page";
import { brandBlue, brandOrange } from "./Shell";
import { productosApi, extract, type Producto } from "../../../services/api";

type SectionKey = "taeconta" | "tae" | "mitienda" | "telorecargo" | "tbt";

const SECTION_META: Record<
  SectionKey,
  { title: string; desc: string; color: string; icon: React.ReactNode; banner?: string }
> = {
  taeconta: {
    title: "TAECONTA",
    desc: "Folios, timbrado CFDI 4.0 y módulos contables.",
    color: brandBlue,
    icon: <BusinessIcon />,
    banner: "/app/taeconta.png",
  },
  tae: {
    title: "TAE (Servicios Web)",
    desc: "Diseño web, mantenimiento, SEO y branding.",
    color: brandOrange,
    icon: <DesignServicesIcon />,
    banner: "/logo/tae.png", // ✅ imagen que pediste para TAE
  },
  mitienda: {
    title: "Mi Tienda en Línea MX",
    desc: "POS + Tienda en línea con reportes y suscripciones.",
    color: brandOrange,
    icon: <StoreIcon />,
    banner: "/app/mitienda.png",
  },
  telorecargo: {
    title: "Te Lo Recargo",
    desc: "Recargas electrónicas para revendedores y retail.",
    color: "#22C55E",
    icon: <FlashOnIcon />,
    banner: "/app/telorecargo.png",
  },
  tbt: {
    title: "The Business Ticket",
    desc: "Tickets, control y trazabilidad de soporte.",
    color: "#8B5CF6",
    icon: <ConfirmationNumberIcon />,
    banner: "/app/thebusinessticket.svg",
  },
};

// Mapea el tipo_produc de la BD a una sección visual
// Mapea el tipo_produc de la BD a una sección visual
function mapTipoToSection(tipo?: string | null): SectionKey | null {
  if (!tipo) return null;

  const t = tipo.toLowerCase();

  // 🚫 Primero los de TAECONTA para que NO caigan en el grupo genérico "tae*"
  if (t === "taeconta-f") return "taeconta";
  if (t.startsWith("taeconta")) return "taeconta";
  if (t.startsWith("tweconta")) return "taeconta"; // por si hay registros con ese prefijo

  // ✅ Luego el grupo TAE (diseño, mantto, seo, logo…)
  if (t.startsWith("tae")) return "tae";

  // Otras familias
  if (t === "mtelmx") return "mitienda";
  if (t === "telorecargo") return "telorecargo";
  if (t === "tbt") return "tbt";

  return null;
}


function money(mx: string | number) {
  const n = typeof mx === "string" ? Number(mx) : mx;
  if (!isFinite(n) || n <= 0) return "Cotiza";
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
}

export default function ProductosTae() {
  const [items, setItems] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await productosApi.list(); // ✅ consulta a la BD
        const data = extract<Producto[] | { data: Producto[] }>(res);
        // extract puede devolver Producto[] o {data:Producto[]} según tu backend; normalizamos:
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        if (mounted) setItems(list);
      } catch (e: any) {
        if (mounted) setErr(e?.message || "No se pudieron cargar los productos.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Agrupar por sección
  const grouped = useMemo(() => {
    const acc: Record<SectionKey, Producto[]> = {
      taeconta: [],
      tae: [],
      mitienda: [],
      telorecargo: [],
      tbt: [],
    };
    for (const p of items) {
      const sec = mapTipoToSection(p.tipo_produc ?? null);
      if (sec) acc[sec].push(p);
    }
    return acc;
  }, [items]);

  return (
    <Page title="Productos TAE">
      {loading && (
        <Stack alignItems="center" sx={{ py: 6 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
            Cargando productos…
          </Typography>
        </Stack>
      )}

      {!loading && err && <Alert severity="error">{err}</Alert>}

      {!loading &&
        !err &&
        (Object.values(grouped).some((arr) => arr.length) ? (
          (Object.keys(SECTION_META) as SectionKey[]).map((key) => {
            const productos = grouped[key];
            if (!productos.length) return null;

            const meta = SECTION_META[key];

            return (
              <Box key={key} sx={{ mb: 4 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Avatar sx={{ bgcolor: meta.color, width: 28, height: 28 }}>{meta.icon}</Avatar>
                  <Typography variant="h6" fontWeight={800}>
                    {meta.title}
                  </Typography>
                  <Chip label={`${productos.length}`} size="small" />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {meta.desc}
                </Typography>

                {meta.banner && (
                  <Box sx={{ mb: 2 }}>
                    <Card sx={{ borderRadius: 3 }}>
                      <CardMedia
                        component="img"
                        height="120"
                        image={meta.banner}
                        alt={meta.title}
                        sx={{ objectFit: "contain", p: 1 }}
                      />
                    </Card>
                  </Box>
                )}

                <Grid container spacing={2}>
                  {productos.map((p) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={p.id}>
                      <Card sx={{ height: "100%", display: "flex", flexDirection: "column", borderRadius: 3 }}>
                        <CardActionArea sx={{ flex: 1 }}>
                          <CardMedia
                            component="img"
                            height="140"
                            image={p.url_imagen || (key === "tae" ? "/logoTAE.png" : "/app/placeholder.png")}
                            alt={p.name}
                            sx={{ objectFit: "contain", p: 1 }}
                          />
                          <CardContent>
                            <Typography variant="subtitle1" fontWeight={700}>
                              {p.name}
                            </Typography>
                            {p.descripcion && (
                              <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
                                {p.descripcion}
                              </Typography>
                            )}
                            <Divider sx={{ my: 1 }} />
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Chip size="small" color="primary" label={money(p.precio)} />
                              {p.tipo_produc && (
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  label={p.tipo_produc}
                                  sx={{ textTransform: "uppercase" }}
                                />
                              )}
                            </Stack>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            );
          })
        ) : (
          <Alert severity="info">No hay productos para mostrar.</Alert>
        ))}
    </Page>
  );
}
