import { useCallback, useEffect, useMemo, useState } from "react";
import axiosClient from "../../../services/axiosClient";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import StorefrontIcon from "@mui/icons-material/Storefront";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";
import BusinessIcon from "@mui/icons-material/Business";
import InfoIcon from "@mui/icons-material/Info";

import TaecontaTiendaModal from "./../TaecontaTiendaModal";

type Props = {
  setView?: (view: string) => void;
};

type ChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

type Tienda = {
  id: number | string;
  nombre?: string | null;
  name?: string | null;
  slug?: string | null;
  email?: string | null;
  telefono?: string | null;
  phone_number?: string | null;
  created_at?: string | null;
  fecha_creacion?: string | null;
  fecha?: string | null;
  plan?: {
    estado?: string | null;
    nombre_plan?: string | null;
    nombre?: string | null;
    plan?: string | null;
    vence?: string | null;
    fecha_vencimiento?: string | null;
    expires_at?: string | null;
    productos_registrados?: number | null;
    productos_count?: number | null;
    limite_permitido?: number | string | null;
    limite_productos?: number | string | null;
    en_rango?: boolean | null;
    dentro_del_rango?: boolean | null;
  } | null;
  datos_fiscales?: {
    id?: number | string;
    rfc?: string | null;
    razon_social?: string | null;
    codigo_postal_fiscal?: string | null;
    codigo_postal?: string | null;
    cp_fiscal?: string | null;
    domicilio_fac?: string | null;
    domicilio_fiscal?: string | null;
    regimen_fiscal?: string | null;
    codigo_regimen?: string | null;
    regimen?: string | null;
  } | null;
  taeconta?: {
    correo_tae?: string | null;
    email?: string | null;
  } | null;
};

type DatosPersonalesForm = {
  slug: string;
  email: string;
  phone_number: string;
};

type DatosFiscalesForm = {
  rfc: string;
  razon_social: string;
  codigo_postal_fiscal: string;
  regimen_fiscal: string;
};

const ITEMS_PER_PAGE = 16;

const SUPERADMIN_TIENDAS_ENDPOINT = "/superadmin/mitienda/tiendas";
const EXTERNAL_TIENDAS_ENDPOINT = "/external/tiendas";

const STORE_URL_PREFIX = "https://mitiendaenlineamx.com.mx/tienda/";

const EMPTY_DATOS_PERSONALES: DatosPersonalesForm = {
  slug: "",
  email: "",
  phone_number: "",
};

const EMPTY_DATOS_FISCALES: DatosFiscalesForm = {
  rfc: "",
  razon_social: "",
  codigo_postal_fiscal: "",
  regimen_fiscal: "",
};

const REGIMENES_FISCALES = [
  { value: "601", label: "601 - General de Ley Personas Morales" },
  { value: "603", label: "603 - Personas Morales con Fines no Lucrativos" },
  {
    value: "605",
    label: "605 - Sueldos y Salarios e Ingresos Asimilados a Salarios",
  },
  { value: "606", label: "606 - Arrendamiento" },
  {
    value: "607",
    label: "607 - Régimen de Enajenación o Adquisición de Bienes",
  },
  { value: "608", label: "608 - Demás ingresos" },
  {
    value: "610",
    label:
      "610 - Residentes en el Extranjero sin Establecimiento Permanente en México",
  },
  { value: "611", label: "611 - Ingresos por Dividendos" },
  {
    value: "612",
    label: "612 - Personas Físicas con Actividades Empresariales y Profesionales",
  },
  { value: "614", label: "614 - Ingresos por intereses" },
  {
    value: "615",
    label: "615 - Régimen de los ingresos por obtención de premios",
  },
  { value: "616", label: "616 - Sin obligaciones fiscales" },
  { value: "621", label: "621 - Incorporación Fiscal" },
  {
    value: "622",
    label: "622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras",
  },
  { value: "623", label: "623 - Opcional para Grupos de Sociedades" },
  { value: "624", label: "624 - Coordinados" },
  {
    value: "625",
    label:
      "625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas",
  },
  { value: "626", label: "626 - Régimen Simplificado de Confianza" },
];

function normalizeText(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getNombreTienda(tienda: Tienda | null | undefined) {
  return tienda?.nombre ?? tienda?.name ?? "Sin nombre";
}

function getEmailTienda(tienda: Tienda) {
  return tienda.email ?? "Sin correo";
}

function getTelefonoTienda(tienda: Tienda) {
  return tienda.telefono ?? tienda.phone_number ?? "N/A";
}

function getPlanTienda(tienda: Tienda) {
  return (
    tienda.plan?.nombre_plan ??
    tienda.plan?.nombre ??
    tienda.plan?.plan ??
    "Sin plan"
  );
}

function getFechaFiltro(tienda: Tienda) {
  return (
    tienda.created_at ??
    tienda.fecha_creacion ??
    tienda.fecha ??
    tienda.plan?.vence ??
    tienda.plan?.fecha_vencimiento ??
    tienda.plan?.expires_at ??
    null
  );
}

function formatFecha(value?: string | null) {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

const noAutocomplete = (name: string) => ({
  autoComplete: "new-password",
  name,
  inputProps: {
    autoComplete: "new-password",
    name,
  },
});

function getRequestErrorMessage(error: unknown, fallback: string) {
  const err = error as {
    response?: {
      data?: {
        message?: string;
        errors?: Record<string, string[]>;
      };
    };
    message?: string;
  };

  const errors = err.response?.data?.errors;

  if (errors) {
    const firstError = Object.values(errors).flat()[0];
    if (firstError) return firstError;
  }

  return err.response?.data?.message || err.message || fallback;
}

export default function MiTiendaTiendas({ setView }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [data, setData] = useState<Tienda[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");
  const [plan, setPlan] = useState("");

  const [page, setPage] = useState(1);

  const [tiendaSeleccionada, setTiendaSeleccionada] =
    useState<Tienda | null>(null);
  const [tiendaDetalle, setTiendaDetalle] = useState<Tienda | null>(null);

  const [loadingModal, setLoadingModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

  const [openDatosPersonales, setOpenDatosPersonales] = useState(false);
  const [openDatosFiscales, setOpenDatosFiscales] = useState(false);
  const [openPlan, setOpenPlan] = useState(false);

  const [datosPersonales, setDatosPersonales] =
    useState<DatosPersonalesForm>(EMPTY_DATOS_PERSONALES);

  const [datosFiscales, setDatosFiscales] =
    useState<DatosFiscalesForm>(EMPTY_DATOS_FISCALES);

  const [openTaeconta, setOpenTaeconta] = useState(false);
  const [tiendaTaeconta, setTiendaTaeconta] = useState<Tienda | null>(null);

  const dialogPaperSx = {
    m: { xs: 1, sm: 2 },
    width: { xs: "calc(100% - 16px)", sm: "100%" },
    maxWidth: { xs: "calc(100% - 16px)", sm: 600 },
    maxHeight: { xs: "calc(100dvh - 16px)", sm: "calc(100% - 64px)" },
    borderRadius: { xs: 2, sm: 3 },
  };

  const dialogTitleSx = {
    px: { xs: 2, sm: 3 },
    py: { xs: 1.5, sm: 2 },
  };

  const dialogContentSx = {
    px: { xs: 2, sm: 3 },
    py: { xs: 2, sm: 2.5 },
    overflowX: "hidden",
  };

  const dialogActionsSx = {
    px: { xs: 2, sm: 3 },
    py: { xs: 1.5, sm: 2 },
    gap: 1,
    flexDirection: { xs: "column-reverse", sm: "row" },
    alignItems: { xs: "stretch", sm: "center" },
    "& > :not(style) ~ :not(style)": {
      ml: { xs: 0, sm: 1 },
    },
  };

  const actionButtonSx = {
    width: { xs: "100%", sm: "auto" },
  };

  const inputSize = isMobile ? "small" : "medium";

  const cargarTiendas = useCallback(async () => {
    setLoading(true);

    try {
      const res = await axiosClient.get(SUPERADMIN_TIENDAS_ENDPOINT);
      setData(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (error) {
      console.error("Error cargando tiendas:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarTiendas();
  }, [cargarTiendas]);

  const cargarDetalleTienda = async (tiendaId: number | string) => {
    const res = await axiosClient.get(
      `${SUPERADMIN_TIENDAS_ENDPOINT}/${tiendaId}`
    );

    return (res.data?.data ?? res.data) as Tienda;
  };

  const planesDisponibles = useMemo(() => {
    const planes = data
      .map((tienda) => getPlanTienda(tienda))
      .filter((value) => value && value !== "Sin plan");

    return Array.from(new Set(planes)).sort((a, b) => a.localeCompare(b));
  }, [data]);

  const aniosDisponibles = useMemo(() => {
    const anios = data
      .map((tienda) => {
        const fecha = getFechaFiltro(tienda);
        if (!fecha) return null;

        const date = new Date(fecha);
        if (Number.isNaN(date.getTime())) return null;

        return String(date.getFullYear());
      })
      .filter(Boolean) as string[];

    return Array.from(new Set(anios)).sort((a, b) => Number(b) - Number(a));
  }, [data]);

  const filteredData = useMemo(() => {
    const value = normalizeText(search);

    return data.filter((tienda) => {
      const nombre = normalizeText(getNombreTienda(tienda));
      const telefono = normalizeText(getTelefonoTienda(tienda));
      const email = normalizeText(getEmailTienda(tienda));
      const planNombre = getPlanTienda(tienda);

      const coincideBusqueda =
        !value ||
        nombre.includes(value) ||
        telefono.includes(value) ||
        email.includes(value);

      const coincidePlan = !plan || planNombre === plan;

      let coincideFecha = true;

      if (mes || anio) {
        const fecha = getFechaFiltro(tienda);

        if (!fecha) {
          coincideFecha = false;
        } else {
          const date = new Date(fecha);

          if (Number.isNaN(date.getTime())) {
            coincideFecha = false;
          } else {
            const mesTienda = String(date.getMonth() + 1).padStart(2, "0");
            const anioTienda = String(date.getFullYear());

            coincideFecha =
              (!mes || mesTienda === mes) && (!anio || anioTienda === anio);
          }
        }
      }

      return coincideBusqueda && coincidePlan && coincideFecha;
    });
  }, [data, search, mes, anio, plan]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  );

  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = page * ITEMS_PER_PAGE;

    return filteredData.slice(start, end);
  }, [filteredData, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const getEstadoColor = (estado?: string | null): ChipColor => {
    if (!estado) return "default";

    const value = normalizeText(estado);

    if (value === "activa" || value === "activo") return "success";
    if (value === "vencida" || value === "inactiva") return "error";

    return "default";
  };

  const abrirDatosPersonales = async (tienda: Tienda) => {
    setOpenDatosPersonales(true);
    setTiendaSeleccionada(tienda);
    setTiendaDetalle(null);
    setDatosPersonales(EMPTY_DATOS_PERSONALES);
    setModalError("");
    setModalSuccess("");
    setLoadingModal(true);

    try {
      const detalle = await cargarDetalleTienda(tienda.id);
      setTiendaDetalle(detalle);

      setDatosPersonales({
        slug: detalle.slug ?? "",
        email: detalle.email ?? "",
        phone_number: detalle.phone_number ?? detalle.telefono ?? "",
      });
    } catch (error) {
      console.error("Error cargando datos personales:", error);
      setModalError(
        getRequestErrorMessage(
          error,
          "No fue posible cargar los datos personales."
        )
      );
    } finally {
      setLoadingModal(false);
    }
  };

  const abrirDatosFiscales = async (tienda: Tienda) => {
    setOpenDatosFiscales(true);
    setTiendaSeleccionada(tienda);
    setTiendaDetalle(null);
    setDatosFiscales(EMPTY_DATOS_FISCALES);
    setModalError("");
    setModalSuccess("");
    setLoadingModal(true);

    try {
      const detalle = await cargarDetalleTienda(tienda.id);
      const fiscales = detalle.datos_fiscales ?? {};

      setTiendaDetalle(detalle);

      setDatosFiscales({
        rfc: fiscales.rfc ?? "",
        razon_social: fiscales.razon_social ?? "",
        codigo_postal_fiscal:
          fiscales.codigo_postal_fiscal ??
          fiscales.codigo_postal ??
          fiscales.cp_fiscal ??
          fiscales.domicilio_fac ??
          fiscales.domicilio_fiscal ??
          "",
        regimen_fiscal:
          fiscales.regimen_fiscal ??
          fiscales.codigo_regimen ??
          fiscales.regimen ??
          "",
      });
    } catch (error) {
      console.error("Error cargando datos fiscales:", error);
      setModalError(
        getRequestErrorMessage(
          error,
          "No fue posible cargar los datos fiscales."
        )
      );
    } finally {
      setLoadingModal(false);
    }
  };

  const abrirPlan = async (tienda: Tienda) => {
    setOpenPlan(true);
    setTiendaSeleccionada(tienda);
    setTiendaDetalle(null);
    setModalError("");
    setModalSuccess("");
    setLoadingModal(true);

    try {
      const detalle = await cargarDetalleTienda(tienda.id);
      setTiendaDetalle(detalle);
    } catch (error) {
      console.error("Error cargando plan:", error);
      setModalError(
        getRequestErrorMessage(
          error,
          "No fue posible cargar la información del plan."
        )
      );
    } finally {
      setLoadingModal(false);
    }
  };

  const cerrarDatosPersonales = () => {
    setOpenDatosPersonales(false);
    setTiendaSeleccionada(null);
    setTiendaDetalle(null);
    setDatosPersonales(EMPTY_DATOS_PERSONALES);
    setModalError("");
    setModalSuccess("");
  };

  const cerrarDatosFiscales = () => {
    setOpenDatosFiscales(false);
    setTiendaSeleccionada(null);
    setTiendaDetalle(null);
    setDatosFiscales(EMPTY_DATOS_FISCALES);
    setModalError("");
    setModalSuccess("");
  };

  const cerrarPlan = () => {
    setOpenPlan(false);
    setTiendaSeleccionada(null);
    setTiendaDetalle(null);
    setModalError("");
    setModalSuccess("");
  };

  const guardarDatosPersonales = async () => {
    const tiendaId = tiendaDetalle?.id ?? tiendaSeleccionada?.id;

    if (!tiendaId) return;

    setSaving(true);
    setModalError("");
    setModalSuccess("");

    try {
      await axiosClient.put(
        `${EXTERNAL_TIENDAS_ENDPOINT}/${tiendaId}/datos-personales`,
        {
          slug: datosPersonales.slug,
          email: datosPersonales.email,
          phone_number: datosPersonales.phone_number,
          telefono: datosPersonales.phone_number,
          numerotel: datosPersonales.phone_number,
        }
      );

      await cargarTiendas();

      setModalSuccess("Datos personales guardados correctamente.");
    } catch (error) {
      console.error("Error guardando datos personales:", error);
      setModalError(
        getRequestErrorMessage(
          error,
          "No fue posible guardar los datos personales."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const guardarDatosFiscales = async () => {
    const tiendaId = tiendaDetalle?.id ?? tiendaSeleccionada?.id;

    if (!tiendaId) return;

    setSaving(true);
    setModalError("");
    setModalSuccess("");

    try {
      await axiosClient.put(
        `${EXTERNAL_TIENDAS_ENDPOINT}/${tiendaId}/datos-fiscales`,
        {
          rfc: datosFiscales.rfc,
          razon_social: datosFiscales.razon_social,
          codigo_postal_fiscal: datosFiscales.codigo_postal_fiscal,
          codigo_postal: datosFiscales.codigo_postal_fiscal,
          domicilio_fac: datosFiscales.codigo_postal_fiscal,
          domicilio_fiscal: datosFiscales.codigo_postal_fiscal,
          regimen_fiscal: datosFiscales.regimen_fiscal,
          codigo_regimen: datosFiscales.regimen_fiscal,
        }
      );

      await cargarTiendas();

      setModalSuccess("Datos fiscales guardados correctamente.");
    } catch (error) {
      console.error("Error guardando datos fiscales:", error);
      setModalError(
        getRequestErrorMessage(
          error,
          "No fue posible guardar los datos fiscales."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const abrirModalTaeconta = (tienda: Tienda) => {
    setTiendaTaeconta(tienda);
    setOpenTaeconta(true);
  };

  const cerrarModalTaeconta = () => {
    setOpenTaeconta(false);
    setTiendaTaeconta(null);
  };

  const tiendaModal = tiendaDetalle ?? tiendaSeleccionada;
  const tiendaModalNombre = getNombreTienda(tiendaModal);

  const planDetalle = tiendaDetalle?.plan ?? {};
  const nombrePlan =
    planDetalle.nombre_plan ??
    planDetalle.nombre ??
    planDetalle.plan ??
    "Sin plan";

  const vencimiento =
    planDetalle.vence ??
    planDetalle.fecha_vencimiento ??
    planDetalle.expires_at ??
    null;

  const productosRegistrados =
    planDetalle.productos_registrados ?? planDetalle.productos_count ?? 0;

  const limitePermitido =
    planDetalle.limite_permitido ?? planDetalle.limite_productos ?? "N/A";

  const enRango = planDetalle.en_rango ?? planDetalle.dentro_del_rango ?? false;

  const tiendaUrl = `${STORE_URL_PREFIX}${datosPersonales.slug}`;

  const copiarUrl = async () => {
    if (!datosPersonales.slug) return;

    try {
      await navigator.clipboard.writeText(tiendaUrl);
    } catch (error) {
      console.error("Error copiando URL:", error);
    }
  };

  const abrirUrl = () => {
    if (!datosPersonales.slug) return;
    window.open(tiendaUrl, "_blank", "noopener,noreferrer");
  };

  const accionesTienda = (tienda: Tienda) => (
    <Stack
      direction="row"
      spacing={0.5}
      justifyContent={{ xs: "flex-start", sm: "flex-end" }}
      flexWrap="wrap"
      useFlexGap
    >
      <Tooltip title="Datos personales">
        <IconButton size="small" onClick={() => abrirDatosPersonales(tienda)}>
          <PersonIcon sx={{ color: "#1976d2" }} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Datos fiscales">
        <IconButton size="small" onClick={() => abrirDatosFiscales(tienda)}>
          <BadgeIcon sx={{ color: "#f4b400" }} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Acceso TAECONTA">
        <IconButton size="small" onClick={() => abrirModalTaeconta(tienda)}>
          <BusinessIcon sx={{ color: "#00acc1" }} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Plan y vencimiento">
        <IconButton size="small" onClick={() => abrirPlan(tienda)}>
          <InfoIcon sx={{ color: "#9c27b0" }} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
const renderRegimenFiscalField = () => {
  return (
    <TextField
      select
      fullWidth
      size={inputSize}
      label="Régimen fiscal"
      value={datosFiscales.regimen_fiscal}
      {...noAutocomplete("mitienda_regimen_fiscal")}
      onChange={(e) =>
        setDatosFiscales((prev) => ({
          ...prev,
          regimen_fiscal: e.target.value,
        }))
      }
      SelectProps={{
        MenuProps: {
          PaperProps: {
            sx: {
              maxHeight: { xs: 220, sm: 260 },
              width: { xs: "calc(100vw - 64px)", sm: 552 },
              maxWidth: { xs: "calc(100vw - 64px)", sm: 552 },
              overflowX: "hidden",
              "& .MuiMenuItem-root": {
                whiteSpace: "normal",
                wordBreak: "break-word",
                fontSize: { xs: 12, sm: 14 },
                lineHeight: 1.35,
                py: { xs: 0.8, sm: 1 },
                px: { xs: 1.2, sm: 2 },
              },
            },
          },
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "left",
          },
          transformOrigin: {
            vertical: "top",
            horizontal: "left",
          },
        },
      }}
    >
      <MenuItem value="">Selecciona un régimen</MenuItem>

      {datosFiscales.regimen_fiscal &&
        !REGIMENES_FISCALES.some(
          (item) => item.value === datosFiscales.regimen_fiscal
        ) && (
          <MenuItem value={datosFiscales.regimen_fiscal}>
            {datosFiscales.regimen_fiscal}
          </MenuItem>
        )}

      {REGIMENES_FISCALES.map((item) => (
        <MenuItem key={item.value} value={item.value}>
          {item.label}
        </MenuItem>
      ))}
    </TextField>
  );

    return (
      <TextField
        select
        fullWidth
        label="Régimen fiscal"
        value={datosFiscales.regimen_fiscal}
        {...noAutocomplete("mitienda_regimen_fiscal")}
        onChange={(e) =>
          setDatosFiscales((prev) => ({
            ...prev,
            regimen_fiscal: e.target.value,
          }))
        }
        SelectProps={{
          MenuProps: {
            PaperProps: {
              sx: {
                maxHeight: 260,
                maxWidth: 620,
              },
            },
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "left",
            },
            transformOrigin: {
              vertical: "top",
              horizontal: "left",
            },
          },
        }}
      >
        <MenuItem value="">Selecciona un régimen</MenuItem>

        {datosFiscales.regimen_fiscal &&
          !REGIMENES_FISCALES.some(
            (item) => item.value === datosFiscales.regimen_fiscal
          ) && (
            <MenuItem value={datosFiscales.regimen_fiscal}>
              {datosFiscales.regimen_fiscal}
            </MenuItem>
          )}

        {REGIMENES_FISCALES.map((item) => (
          <MenuItem key={item.value} value={item.value}>
            {item.label}
          </MenuItem>
        ))}
      </TextField>
    );
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => setView?.("mitienda-dashboard")}
        sx={{ borderRadius: 3, mb: 2 }}
      >
        Volver a Mi Tienda
      </Button>

      <Stack spacing={2} mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Lista de Tiendas
          </Typography>

          <Typography color="text.secondary">
            Listado general de tiendas registradas en Mi Tienda.
          </Typography>
        </Box>

        <Paper
          variant="outlined"
          sx={{
            p: { xs: 1.5, sm: 2 },
            borderRadius: 3,
            bgcolor: "background.paper",
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por nombre, teléfono o correo"
                value={search}
                {...noAutocomplete("mitienda_busqueda_tiendas")}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                select
                fullWidth
                size="small"
                label="Mes"
                value={mes}
                {...noAutocomplete("mitienda_filtro_mes")}
                onChange={(e) => {
                  setMes(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="01">Enero</MenuItem>
                <MenuItem value="02">Febrero</MenuItem>
                <MenuItem value="03">Marzo</MenuItem>
                <MenuItem value="04">Abril</MenuItem>
                <MenuItem value="05">Mayo</MenuItem>
                <MenuItem value="06">Junio</MenuItem>
                <MenuItem value="07">Julio</MenuItem>
                <MenuItem value="08">Agosto</MenuItem>
                <MenuItem value="09">Septiembre</MenuItem>
                <MenuItem value="10">Octubre</MenuItem>
                <MenuItem value="11">Noviembre</MenuItem>
                <MenuItem value="12">Diciembre</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                select
                fullWidth
                size="small"
                label="Año"
                value={anio}
                {...noAutocomplete("mitienda_filtro_anio")}
                onChange={(e) => {
                  setAnio(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                {aniosDisponibles.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Plan"
                value={plan}
                {...noAutocomplete("mitienda_filtro_plan")}
                onChange={(e) => {
                  setPlan(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                {planesDisponibles.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Paper>
      </Stack>

      {loading ? (
        <Box
          sx={{
            minHeight: 240,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : paginated.length === 0 ? (
        <Card sx={{ borderRadius: 4 }}>
          <CardContent>
            <Typography fontWeight={800}>Sin resultados</Typography>
            <Typography color="text.secondary">
              No se encontraron tiendas con los filtros actuales.
            </Typography>
          </CardContent>
        </Card>
      ) : isMobile ? (
        <Grid container spacing={2}>
          {paginated.map((tienda) => (
            <Grid item xs={12} key={tienda.id}>
              <Card
                sx={{
                  borderRadius: 4,
                  bgcolor: theme.palette.mode === "dark" ? "#1f1f1f" : "#fff",
                }}
              >
                <CardContent>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography fontWeight={900}>
                        {getNombreTienda(tienda)}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        ID: {tienda.id}
                      </Typography>
                    </Box>

                    <Chip
                      label={tienda.plan?.estado ?? "Sin plan"}
                      size="small"
                      color={getEstadoColor(tienda.plan?.estado)}
                      sx={{ width: "fit-content" }}
                    />

                    {accionesTienda(tienda)}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 4,
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, width: 90 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 900 }} align="right">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.map((tienda, index) => (
                <TableRow key={tienda.id} hover>
                  <TableCell>
                    {(page - 1) * ITEMS_PER_PAGE + index + 1}
                  </TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        <StorefrontIcon fontSize="small" />
                      </Avatar>

                      <Box>
                        <Typography fontWeight={800}>
                          {getNombreTienda(tienda)}
                        </Typography>

                        <Typography fontSize={12} color="text.secondary">
                          ID: {tienda.id}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={tienda.plan?.estado ?? "Sin plan"}
                      size="small"
                      color={getEstadoColor(tienda.plan?.estado)}
                    />
                  </TableCell>

                  <TableCell align="right">{accionesTienda(tienda)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="flex-end"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        mt={3}
      >
        <Button
          variant="outlined"
          disabled={page === 1}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          sx={{ borderRadius: 3 }}
        >
          Anterior
        </Button>

        <Typography fontWeight={700} textAlign="center">
          Página {page} de {totalPages}
        </Typography>

        <Button
          variant="outlined"
          disabled={page >= totalPages}
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          sx={{ borderRadius: 3 }}
        >
          Siguiente
        </Button>
      </Stack>

      <Dialog
        open={openDatosPersonales}
        onClose={cerrarDatosPersonales}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: dialogPaperSx,
        }}
      >
        <DialogTitle sx={dialogTitleSx}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
          >
            <Typography
              fontWeight={900}
              sx={{
                fontSize: { xs: 14, sm: 18 },
                lineHeight: 1.2,
              }}
            >
              Datos personales – {tiendaModalNombre}
            </Typography>

            <IconButton size="small" onClick={cerrarDatosPersonales}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={dialogContentSx}>
          {loadingModal ? (
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
            <Stack spacing={{ xs: 1.5, sm: 2 }}>
              {modalError && <Alert severity="error">{modalError}</Alert>}
              {modalSuccess && (
                <Alert severity="success">{modalSuccess}</Alert>
              )}

              <TextField
                fullWidth
                size={inputSize}
                label={isMobile ? "URL de la tienda" : "Slug de la tienda"}
                value={isMobile ? tiendaUrl : datosPersonales.slug}
                {...noAutocomplete("mitienda_slug_tienda")}
                helperText="URL bloqueada. No puede ser modificada desde este formulario."
                InputProps={{
                  readOnly: true,
                  startAdornment: !isMobile ? (
                    <InputAdornment position="start">
                      {STORE_URL_PREFIX}
                    </InputAdornment>
                  ) : undefined,
                }}
                sx={{
                  "& .MuiInputBase-input": {
                    cursor: "not-allowed",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                }}
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button
                  variant="outlined"
                  onClick={abrirUrl}
                  disabled={!datosPersonales.slug}
                  fullWidth={isMobile}
                  size={isMobile ? "small" : "medium"}
                >
                  Ir al sitio
                </Button>

                <Button
                  variant="outlined"
                  onClick={copiarUrl}
                  disabled={!datosPersonales.slug}
                  fullWidth={isMobile}
                  size={isMobile ? "small" : "medium"}
                >
                  Copiar URL
                </Button>
              </Stack>

              <TextField
                fullWidth
                size={inputSize}
                label="Email"
                value={datosPersonales.email}
                {...noAutocomplete("mitienda_correo_contacto")}
                onChange={(e) =>
                  setDatosPersonales((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
              />

              <TextField
                fullWidth
                size={inputSize}
                label="Teléfono"
                value={datosPersonales.phone_number}
                {...noAutocomplete("mitienda_numero_contacto")}
                onChange={(e) =>
                  setDatosPersonales((prev) => ({
                    ...prev,
                    phone_number: e.target.value,
                  }))
                }
              />
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={dialogActionsSx}>
          <Button
            onClick={cerrarDatosPersonales}
            disabled={saving}
            sx={actionButtonSx}
          >
            Cerrar
          </Button>

          <Button
            variant="contained"
            onClick={guardarDatosPersonales}
            disabled={saving || loadingModal}
            sx={actionButtonSx}
          >
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDatosFiscales}
        onClose={cerrarDatosFiscales}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: dialogPaperSx,
        }}
      >
        <DialogTitle sx={dialogTitleSx}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
          >
            <Typography
              fontWeight={900}
              sx={{
                fontSize: { xs: 14, sm: 18 },
                lineHeight: 1.2,
              }}
            >
              Datos fiscales – {tiendaModalNombre}
            </Typography>

            <IconButton size="small" onClick={cerrarDatosFiscales}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={dialogContentSx}>
          {loadingModal ? (
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
            <Stack spacing={{ xs: 1.5, sm: 2 }}>
              {modalError && <Alert severity="error">{modalError}</Alert>}
              {modalSuccess && (
                <Alert severity="success">{modalSuccess}</Alert>
              )}

              <TextField
                fullWidth
                size={inputSize}
                label="RFC"
                value={datosFiscales.rfc}
                {...noAutocomplete("mitienda_rfc_fiscal")}
                onChange={(e) =>
                  setDatosFiscales((prev) => ({
                    ...prev,
                    rfc: e.target.value.toUpperCase(),
                  }))
                }
              />

              <TextField
                fullWidth
                size={inputSize}
                label="Razón social"
                value={datosFiscales.razon_social}
                {...noAutocomplete("mitienda_razon_social_fiscal")}
                onChange={(e) =>
                  setDatosFiscales((prev) => ({
                    ...prev,
                    razon_social: e.target.value.toUpperCase(),
                  }))
                }
              />

              <TextField
                fullWidth
                size={inputSize}
                label="Código Postal Fiscal"
                value={datosFiscales.codigo_postal_fiscal}
                {...noAutocomplete("mitienda_codigo_postal_fiscal")}
                onChange={(e) =>
                  setDatosFiscales((prev) => ({
                    ...prev,
                    codigo_postal_fiscal: e.target.value,
                  }))
                }
              />

              {renderRegimenFiscalField()}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={dialogActionsSx}>
          <Button
            onClick={cerrarDatosFiscales}
            disabled={saving}
            sx={actionButtonSx}
          >
            Cerrar
          </Button>

          <Button
            variant="contained"
            onClick={guardarDatosFiscales}
            disabled={saving || loadingModal}
            sx={actionButtonSx}
          >
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openPlan}
        onClose={cerrarPlan}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: dialogPaperSx,
        }}
      >
        <DialogTitle sx={dialogTitleSx}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
          >
            <Typography
              fontWeight={900}
              sx={{
                fontSize: { xs: 14, sm: 18 },
                lineHeight: 1.2,
              }}
            >
              Plan y vencimiento – {tiendaModalNombre}
            </Typography>

            <IconButton size="small" onClick={cerrarPlan}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={dialogContentSx}>
          {loadingModal ? (
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
            <Stack spacing={{ xs: 1.5, sm: 2 }}>
              {modalError && <Alert severity="error">{modalError}</Alert>}

              <Typography fontSize={{ xs: 14, sm: 16 }}>
                <strong>Plan actual:</strong> {nombrePlan}
              </Typography>

              <Typography fontSize={{ xs: 14, sm: 16 }}>
                <strong>Fecha de vencimiento:</strong>{" "}
                {formatFecha(vencimiento)}
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center">
                <Typography fontWeight={800} fontSize={{ xs: 14, sm: 16 }}>
                  Estado:
                </Typography>
                <Chip
                  label={planDetalle.estado ?? "Sin plan"}
                  size="small"
                  color={getEstadoColor(planDetalle.estado)}
                />
              </Stack>

              <Typography fontSize={{ xs: 14, sm: 16 }}>
                <strong>Productos registrados:</strong> {productosRegistrados}
              </Typography>

              <Typography fontSize={{ xs: 14, sm: 16 }}>
                <strong>Límite permitido:</strong> {String(limitePermitido)}
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center">
                <Typography fontWeight={800} fontSize={{ xs: 14, sm: 16 }}>
                  ¿Dentro del rango?
                </Typography>
                <Chip
                  label={enRango ? "Sí" : "No"}
                  size="small"
                  color={enRango ? "success" : "error"}
                />
              </Stack>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={dialogActionsSx}>
          <Button onClick={cerrarPlan} sx={actionButtonSx}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <TaecontaTiendaModal
        open={openTaeconta}
        tiendaId={tiendaTaeconta?.id ?? null}
        tiendaNombre={
          tiendaTaeconta
            ? tiendaTaeconta.nombre ?? tiendaTaeconta.name ?? "Sin nombre"
            : ""
        }
        onClose={cerrarModalTaeconta}
        onUpdated={cargarTiendas}
      />
    </Box>
  );
}