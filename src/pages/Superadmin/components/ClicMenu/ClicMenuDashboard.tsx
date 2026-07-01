import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import GroupsIcon from "@mui/icons-material/Groups";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PaymentsIcon from "@mui/icons-material/Payments";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SearchIcon from "@mui/icons-material/Search";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import BusinessIcon from "@mui/icons-material/Business";

import { clicMenuService } from "./clicMenuService";

type Owner = {
  id: number;
  name?: string;
  last_name_paternal?: string;
  last_name_maternal?: string | null;
  email?: string;
  phone?: string;
  status?: string;
  restaurants_count?: number;
};

type Restaurant = {
  id: number;
  trade_name?: string;
  description?: string;
  contact_phone?: string;
  contact_email?: string;
  status?: string;
};

type Branch = {
  id: number;
  name?: string;
  address?: string;
  phone?: string;
  open_time?: string;
  close_time?: string;
  status?: string;
};

type OwnerFormState = {
  name: string;
  last_name_paternal: string;
  last_name_maternal: string;
  email: string;
  phone: string;
  password: string;
  status: string;
};

type RestaurantPayload = {
  trade_name: string;
  description?: string;
  contact_phone?: string;
  contact_email?: string;
  status?: string;
};

type BranchPayload = {
  name: string;
  address?: string;
  phone?: string;
  open_time?: string;
  close_time?: string;
  status?: string;
};

const emptyOwnerForm: OwnerFormState = {
  name: "",
  last_name_paternal: "",
  last_name_maternal: "",
  email: "",
  phone: "",
  password: "",
  status: "active",
};

function getArray<T>(payload: any): T[] {
  if (!payload) return [];

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.data?.data)) return payload.data.data;
  if (Array.isArray(payload.data?.data?.data)) return payload.data.data.data;

  if (Array.isArray(payload.owners?.data?.data)) {
    return payload.owners.data.data;
  }

  if (Array.isArray(payload.monthly_sales?.data?.data)) {
    return payload.monthly_sales.data.data;
  }

  if (Array.isArray(payload.restaurants?.data?.data)) {
    return payload.restaurants.data.data;
  }

  if (Array.isArray(payload.branches?.data?.data)) {
    return payload.branches.data.data;
  }

  return [];
}

function getTotal(payload: any, fallback: number) {
  return Number(
    payload?.data?.total ??
      payload?.total ??
      payload?.data?.data?.total ??
      fallback ??
      0
  );
}

function getSummary(payload: any) {
  if (!payload) return {};
  if (payload.summary) return payload.summary;
  if (payload.data?.summary) return payload.data.summary;

  return {};
}

function getObject(payload: any) {
  if (!payload) return null;

  if (payload.data && !Array.isArray(payload.data)) return payload.data;
  if (payload.subscription) return payload.subscription;
  if (payload.current_subscription) return payload.current_subscription;

  return payload;
}

function getOwnerName(owner: Owner) {
  return [owner.name, owner.last_name_paternal, owner.last_name_maternal]
    .filter(Boolean)
    .join(" ");
}

function getInitials(text: string) {
  const parts = text.trim().split(" ").filter(Boolean).slice(0, 2);

  if (parts.length === 0) return "CM";

  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

function formatMoney(value: any) {
  return Number(value || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

function formatDate(value?: string | null) {
  if (!value) return "--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatDateTime(value?: string | null) {
  if (!value) return "--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getErrorMessage(error: any, fallback: string) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function normalizeText(value?: string | number | null) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getMonthName(month: number) {
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  return months[month - 1] || "Mes";
}

function cleanText(value?: string | null) {
  return String(value || "").trim();
}

export default function ClicMenuDashboard() {
  const now = new Date();

  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [consultedYear, setConsultedYear] = useState(now.getFullYear());
  const [consultedMonth, setConsultedMonth] = useState(now.getMonth() + 1);

  const [dashboard, setDashboard] = useState<any>(null);

  const [selectedOwnerId, setSelectedOwnerId] = useState<number | null>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<
    number | null
  >(null);

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  const [ownerSearch, setOwnerSearch] = useState("");
  const [restaurantSearch, setRestaurantSearch] = useState("");
  const [branchSearch, setBranchSearch] = useState("");
  const [saleSearch, setSaleSearch] = useState("");

  const [ownerModalOpen, setOwnerModalOpen] = useState(false);
  const [ownerSaving, setOwnerSaving] = useState(false);
  const [ownerFormError, setOwnerFormError] = useState("");
  const [ownerEditing, setOwnerEditing] = useState<Owner | null>(null);
  const [ownerForm, setOwnerForm] = useState<OwnerFormState>(emptyOwnerForm);

  const [restaurantModalOpen, setRestaurantModalOpen] = useState(false);
  const [restaurantSaving, setRestaurantSaving] = useState(false);
  const [restaurantFormError, setRestaurantFormError] = useState("");
  const [restaurantEditing, setRestaurantEditing] =
    useState<Restaurant | null>(null);

  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [branchSaving, setBranchSaving] = useState(false);
  const [branchFormError, setBranchFormError] = useState("");
  const [branchEditing, setBranchEditing] = useState<Branch | null>(null);

  const owners = useMemo<Owner[]>(() => {
    return getArray<Owner>(dashboard?.owners);
  }, [dashboard]);

  const salesSummary = useMemo(() => {
    return getSummary(dashboard?.sales_summary);
  }, [dashboard]);

  const monthlySales = useMemo<any[]>(() => {
    return getArray<any>(dashboard?.monthly_sales);
  }, [dashboard]);

  const ownersTotal = useMemo(() => {
    return getTotal(dashboard?.owners, owners.length);
  }, [dashboard, owners.length]);

  const selectedOwner = useMemo(() => {
    return owners.find((owner) => owner.id === selectedOwnerId) || null;
  }, [owners, selectedOwnerId]);

  const selectedRestaurant = useMemo(() => {
    return (
      restaurants.find((restaurant) => restaurant.id === selectedRestaurantId) ||
      null
    );
  }, [restaurants, selectedRestaurantId]);

  const filteredOwners = useMemo(() => {
    const q = normalizeText(ownerSearch);

    if (!q) return owners;

    return owners.filter((owner) => {
      const text = normalizeText(
        [
          getOwnerName(owner),
          owner.email,
          owner.phone,
          owner.status,
          owner.restaurants_count,
        ]
          .filter(Boolean)
          .join(" ")
      );

      return text.includes(q);
    });
  }, [owners, ownerSearch]);

  const filteredRestaurants = useMemo(() => {
    const q = normalizeText(restaurantSearch);

    if (!q) return restaurants;

    return restaurants.filter((restaurant) => {
      const text = normalizeText(
        [
          restaurant.trade_name,
          restaurant.contact_email,
          restaurant.contact_phone,
          restaurant.status,
        ]
          .filter(Boolean)
          .join(" ")
      );

      return text.includes(q);
    });
  }, [restaurants, restaurantSearch]);

  const filteredBranches = useMemo(() => {
    const q = normalizeText(branchSearch);

    if (!q) return branches;

    return branches.filter((branch) => {
      const text = normalizeText(
        [
          branch.name,
          branch.address,
          branch.phone,
          branch.open_time,
          branch.close_time,
          branch.status,
        ]
          .filter(Boolean)
          .join(" ")
      );

      return text.includes(q);
    });
  }, [branches, branchSearch]);

  const filteredSales = useMemo(() => {
    const q = normalizeText(saleSearch);

    if (!q) return monthlySales;

    return monthlySales.filter((sale) => {
      const text = normalizeText(
        [
          sale?.restaurant?.trade_name,
          sale?.restaurant?.owner?.name,
          sale?.restaurant?.owner?.last_name_paternal,
          sale?.restaurant?.owner?.last_name_maternal,
          sale?.restaurant?.owner?.email,
          sale?.plan?.name,
          sale?.provider,
          sale?.status,
          sale?.paid_price,
        ]
          .filter(Boolean)
          .join(" ")
      );

      return text.includes(q);
    });
  }, [monthlySales, saleSearch]);

  const cargarDashboard = async (
    targetYear: number = year,
    targetMonth: number = month,
    silent = false
  ) => {
    try {
      if (!silent) setLoading(true);
      setError("");

      const response = await clicMenuService.dashboard({
        year: targetYear,
        month: targetMonth,
        per_page: 15,
      });

      setDashboard(response.data);
      setConsultedYear(targetYear);
      setConsultedMonth(targetMonth);
    } catch (err: any) {
      setError(getErrorMessage(err, "No fue posible cargar ClicMenu."));
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const cargarRestaurantes = async (ownerId: number) => {
    try {
      setLoadingDetail(true);
      setError("");
      setRestaurants([]);
      setBranches([]);
      setCurrentSubscription(null);
      setSelectedRestaurantId(null);
      setRestaurantSearch("");
      setBranchSearch("");

      const response = await clicMenuService.restaurants(ownerId, {
        per_page: 50,
      });

      setRestaurants(getArray<Restaurant>(response.data));
    } catch (err: any) {
      setError(getErrorMessage(err, "No fue posible cargar restaurantes."));
    } finally {
      setLoadingDetail(false);
    }
  };

  const cargarDetalleRestaurante = async (
    ownerId: number,
    restaurantId: number
  ) => {
    try {
      setLoadingDetail(true);
      setError("");
      setBranches([]);
      setCurrentSubscription(null);
      setBranchSearch("");

      const [branchesResponse, subscriptionResponse] = await Promise.allSettled(
        [
          clicMenuService.branches(ownerId, restaurantId, { per_page: 50 }),
          clicMenuService.currentSubscription(ownerId, restaurantId),
        ]
      );

      if (branchesResponse.status === "fulfilled") {
        setBranches(getArray<Branch>(branchesResponse.value.data));
      }

      if (subscriptionResponse.status === "fulfilled") {
        setCurrentSubscription(getObject(subscriptionResponse.value.data));
      }
    } catch (err: any) {
      setError(
        getErrorMessage(err, "No fue posible cargar el detalle del restaurante.")
      );
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    cargarDashboard(now.getFullYear(), now.getMonth() + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const consultar = () => {
    const targetYear = Number(year);
    const targetMonth = Number(month);

    setSelectedOwnerId(null);
    setSelectedRestaurantId(null);
    setRestaurants([]);
    setBranches([]);
    setCurrentSubscription(null);
    setOwnerSearch("");
    setRestaurantSearch("");
    setBranchSearch("");
    setSaleSearch("");

    cargarDashboard(targetYear, targetMonth);
  };

  const seleccionarOwner = (ownerId: number) => {
    setSelectedOwnerId(ownerId);
    cargarRestaurantes(ownerId);
  };

  const seleccionarRestaurante = (restaurantId: number) => {
    setSelectedRestaurantId(restaurantId);

    if (selectedOwnerId) {
      cargarDetalleRestaurante(selectedOwnerId, restaurantId);
    }
  };

  const abrirCrearOwner = () => {
    setOwnerEditing(null);
    setOwnerForm(emptyOwnerForm);
    setOwnerFormError("");
    setOwnerModalOpen(true);
  };

  const abrirEditarOwner = (owner: Owner) => {
    setOwnerEditing(owner);
    setOwnerForm({
      name: owner.name || "",
      last_name_paternal: owner.last_name_paternal || "",
      last_name_maternal: owner.last_name_maternal || "",
      email: owner.email || "",
      phone: owner.phone || "",
      password: "",
      status: owner.status || "active",
    });
    setOwnerFormError("");
    setOwnerModalOpen(true);
  };

  const cerrarOwnerModal = () => {
    if (ownerSaving) return;

    setOwnerModalOpen(false);
    setOwnerEditing(null);
    setOwnerForm(emptyOwnerForm);
    setOwnerFormError("");
  };

  const cambiarOwnerForm = (field: keyof OwnerFormState, value: string) => {
    setOwnerForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const guardarOwner = async () => {
    try {
      setOwnerSaving(true);
      setOwnerFormError("");
      setError("");

      if (!cleanText(ownerForm.name)) {
        setOwnerFormError("El nombre del propietario es obligatorio.");
        return;
      }

      const payload: any = {
        name: cleanText(ownerForm.name),
        last_name_paternal: cleanText(ownerForm.last_name_paternal),
        last_name_maternal: cleanText(ownerForm.last_name_maternal) || null,
        email: cleanText(ownerForm.email),
        phone: cleanText(ownerForm.phone),
        status: ownerForm.status || "active",
      };

      if (cleanText(ownerForm.password)) {
        payload.password = cleanText(ownerForm.password);
      }

      if (!payload.last_name_paternal) delete payload.last_name_paternal;
      if (!payload.email) delete payload.email;
      if (!payload.phone) delete payload.phone;

      if (ownerEditing) {
        await clicMenuService.updateOwner(ownerEditing.id, payload);
      } else {
        await clicMenuService.createOwner(payload);
      }

      setOwnerModalOpen(false);
      setOwnerEditing(null);
      setOwnerForm(emptyOwnerForm);

      await cargarDashboard(consultedYear, consultedMonth, true);
    } catch (err: any) {
      setOwnerFormError(
        getErrorMessage(err, "No fue posible guardar el propietario.")
      );
    } finally {
      setOwnerSaving(false);
    }
  };

  const eliminarOwner = async (owner: Owner) => {
    const name = getOwnerName(owner) || "este propietario";

    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar ${name}? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    try {
      setLoadingDetail(true);
      setError("");

      await clicMenuService.deleteOwner(owner.id);

      if (selectedOwnerId === owner.id) {
        setSelectedOwnerId(null);
        setSelectedRestaurantId(null);
        setRestaurants([]);
        setBranches([]);
        setCurrentSubscription(null);
      }

      await cargarDashboard(consultedYear, consultedMonth, true);
    } catch (err: any) {
      setError(getErrorMessage(err, "No fue posible eliminar el propietario."));
    } finally {
      setLoadingDetail(false);
    }
  };

  const abrirCrearRestaurant = () => {
    if (!selectedOwnerId) {
      setError("Selecciona un propietario antes de crear un restaurante.");
      return;
    }

    setRestaurantEditing(null);
    setRestaurantFormError("");
    setRestaurantModalOpen(true);
  };

  const abrirEditarRestaurant = (restaurant: Restaurant) => {
    setRestaurantEditing(restaurant);
    setRestaurantFormError("");
    setRestaurantModalOpen(true);
  };

  const cerrarRestaurantModal = () => {
    if (restaurantSaving) return;

    setRestaurantModalOpen(false);
    setRestaurantEditing(null);
    setRestaurantFormError("");
  };

  const guardarRestaurant = async (payload: RestaurantPayload) => {
    if (!selectedOwnerId) {
      setRestaurantFormError("No hay propietario seleccionado.");
      return;
    }

    try {
      setRestaurantSaving(true);
      setRestaurantFormError("");
      setError("");

      if (restaurantEditing) {
        await clicMenuService.updateRestaurant(
          selectedOwnerId,
          restaurantEditing.id,
          payload
        );
      } else {
        await clicMenuService.createRestaurant(selectedOwnerId, payload);
      }

      setRestaurantModalOpen(false);
      setRestaurantEditing(null);

      await cargarRestaurantes(selectedOwnerId);
      await cargarDashboard(consultedYear, consultedMonth, true);
    } catch (err: any) {
      setRestaurantFormError(
        getErrorMessage(err, "No fue posible guardar el restaurante.")
      );
    } finally {
      setRestaurantSaving(false);
    }
  };

  const eliminarRestaurant = async (restaurant: Restaurant) => {
    if (!selectedOwnerId) {
      setError("No hay propietario seleccionado.");
      return;
    }

    const name = restaurant.trade_name || "este restaurante";

    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar ${name}? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    try {
      setLoadingDetail(true);
      setError("");

      await clicMenuService.deleteRestaurant(selectedOwnerId, restaurant.id);

      if (selectedRestaurantId === restaurant.id) {
        setSelectedRestaurantId(null);
        setBranches([]);
        setCurrentSubscription(null);
      }

      await cargarRestaurantes(selectedOwnerId);
      await cargarDashboard(consultedYear, consultedMonth, true);
    } catch (err: any) {
      setError(getErrorMessage(err, "No fue posible eliminar el restaurante."));
    } finally {
      setLoadingDetail(false);
    }
  };

  const abrirCrearBranch = () => {
    if (!selectedOwnerId || !selectedRestaurantId) {
      setError("Selecciona un restaurante antes de crear una sucursal.");
      return;
    }

    setBranchEditing(null);
    setBranchFormError("");
    setBranchModalOpen(true);
  };

  const abrirEditarBranch = (branch: Branch) => {
    setBranchEditing(branch);
    setBranchFormError("");
    setBranchModalOpen(true);
  };

  const cerrarBranchModal = () => {
    if (branchSaving) return;

    setBranchModalOpen(false);
    setBranchEditing(null);
    setBranchFormError("");
  };

  const guardarBranch = async (payload: BranchPayload) => {
    if (!selectedOwnerId || !selectedRestaurantId) {
      setBranchFormError("No hay restaurante seleccionado.");
      return;
    }

    try {
      setBranchSaving(true);
      setBranchFormError("");
      setError("");

      if (branchEditing) {
        await clicMenuService.updateBranch(
          selectedOwnerId,
          selectedRestaurantId,
          branchEditing.id,
          payload
        );
      } else {
        await clicMenuService.createBranch(
          selectedOwnerId,
          selectedRestaurantId,
          payload
        );
      }

      setBranchModalOpen(false);
      setBranchEditing(null);

      await cargarDetalleRestaurante(selectedOwnerId, selectedRestaurantId);
      await cargarDashboard(consultedYear, consultedMonth, true);
    } catch (err: any) {
      setBranchFormError(
        getErrorMessage(err, "No fue posible guardar la sucursal.")
      );
    } finally {
      setBranchSaving(false);
    }
  };

  const eliminarBranch = async (branch: Branch) => {
    if (!selectedOwnerId || !selectedRestaurantId) {
      setError("No hay restaurante seleccionado.");
      return;
    }

    const name = branch.name || "esta sucursal";

    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar ${name}? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    try {
      setLoadingDetail(true);
      setError("");

      await clicMenuService.deleteBranch(
        selectedOwnerId,
        selectedRestaurantId,
        branch.id
      );

      await cargarDetalleRestaurante(selectedOwnerId, selectedRestaurantId);
      await cargarDashboard(consultedYear, consultedMonth, true);
    } catch (err: any) {
      setError(getErrorMessage(err, "No fue posible eliminar la sucursal."));
    } finally {
      setLoadingDetail(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Stack alignItems="center" justifyContent="center" minHeight={360}>
          <CircularProgress />
          <Typography mt={2}>Cargando información de ClicMenu...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", lg: "center" }}
          spacing={2}
        >
          <Box>
            <Typography variant="h4" fontWeight={900}>
              ClicMenu
            </Typography>
            <Typography color="text.secondary">
              Administración general del sistema ClicMenu.
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              px: 2,
              py: 1.2,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              minWidth: 210,
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                }}
              >
                <CalendarMonthIcon fontSize="small" />
              </Avatar>

              <Box>
                <Typography fontWeight={900} lineHeight={1}>
                  Periodo actual
                </Typography>
                <Typography variant="body2" color="primary" fontWeight={800}>
                  {getMonthName(consultedMonth)} {consultedYear}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} xl={3}>
            <SummaryCard
              icon={<GroupsIcon />}
              title="Propietarios"
              value={ownersTotal}
              subtitle="Total de propietarios"
            />
          </Grid>

          <Grid item xs={12} sm={6} xl={3}>
            <SummaryCard
              icon={<RestaurantIcon />}
              title="Restaurantes"
              value={selectedOwner ? restaurants.length : "--"}
              subtitle={
                selectedOwner
                  ? "Restaurantes del propietario"
                  : "Selecciona un propietario"
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} xl={3}>
            <SummaryCard
              icon={<BusinessIcon />}
              title="Sucursales"
              value={selectedRestaurant ? branches.length : "--"}
              subtitle={
                selectedRestaurant
                  ? "Sucursales del restaurante"
                  : "Selecciona un restaurante"
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} xl={3}>
            <SummaryCard
              icon={<PaymentsIcon />}
              title="Ventas"
              value={formatMoney(salesSummary?.total_sales)}
              subtitle="Total vendido en el periodo"
              money
            />
          </Grid>
        </Grid>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Grid container spacing={2} alignItems="stretch">
            <Grid item xs={12} lg={4}>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="h6" fontWeight={900}>
                    Consultar información
                  </Typography>
                  <Typography color="text.secondary">
                    Filtra el periodo de ventas y suscripciones.
                  </Typography>
                </Box>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <TextField
                    label="Año"
                    size="small"
                    type="number"
                    value={year}
                    onChange={(event) => setYear(Number(event.target.value))}
                    sx={{ width: { xs: "100%", sm: 130 } }}
                  />

                  <TextField
                    label="Mes"
                    select
                    size="small"
                    value={month}
                    onChange={(event) => setMonth(Number(event.target.value))}
                    sx={{ width: { xs: "100%", sm: 170 } }}
                  >
                    <MenuItem value={1}>Enero</MenuItem>
                    <MenuItem value={2}>Febrero</MenuItem>
                    <MenuItem value={3}>Marzo</MenuItem>
                    <MenuItem value={4}>Abril</MenuItem>
                    <MenuItem value={5}>Mayo</MenuItem>
                    <MenuItem value={6}>Junio</MenuItem>
                    <MenuItem value={7}>Julio</MenuItem>
                    <MenuItem value={8}>Agosto</MenuItem>
                    <MenuItem value={9}>Septiembre</MenuItem>
                    <MenuItem value={10}>Octubre</MenuItem>
                    <MenuItem value={11}>Noviembre</MenuItem>
                    <MenuItem value={12}>Diciembre</MenuItem>
                  </TextField>

                  <Button
                    variant="contained"
                    onClick={consultar}
                    sx={{
                      height: 40,
                      px: 3,
                      borderRadius: 2,
                      fontWeight: 800,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Consultar
                  </Button>
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} lg={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} xl={3}>
                  <MetricCard
                    title="Suscripciones"
                    value={salesSummary?.total_subscriptions ?? 0}
                    subtitle="Total suscripciones"
                    icon={<SubscriptionsIcon />}
                  />
                </Grid>

                <Grid item xs={12} sm={6} xl={3}>
                  <MetricCard
                    title="Pagadas"
                    value={salesSummary?.paid_subscriptions ?? 0}
                    subtitle="Suscripciones pagadas"
                    icon={<PaymentsIcon />}
                  />
                </Grid>

                <Grid item xs={12} sm={6} xl={3}>
                  <MetricCard
                    title="Demos"
                    value={salesSummary?.demo_subscriptions ?? 0}
                    subtitle="Suscripciones demo"
                    icon={<StorefrontIcon />}
                  />
                </Grid>

                <Grid item xs={12} sm={6} xl={3}>
                  <MetricCard
                    title="Total vendido"
                    value={formatMoney(salesSummary?.total_sales)}
                    subtitle="Total en el periodo"
                    icon={<PaymentsIcon />}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={2} alignItems="stretch">
          <Grid item xs={12} lg={5}>
            <EntityListCard<Owner>
              title="Propietarios"
              badge={ownersTotal}
              searchPlaceholder="Buscar propietario..."
              searchValue={ownerSearch}
              onSearchChange={setOwnerSearch}
              onCreate={abrirCrearOwner}
              items={filteredOwners}
              emptyText="No hay propietarios para mostrar."
              activeId={selectedOwnerId}
              getId={(owner) => owner.id}
              getTitle={(owner) => getOwnerName(owner) || "Sin nombre"}
              getSubtitle={(owner) => owner.email || "Sin correo"}
              getMeta={(owner) => owner.phone || "Sin teléfono"}
              getInitials={(owner) =>
                getInitials(getOwnerName(owner) || "Sin nombre")
              }
              getStatus={(owner) => owner.status}
              onSelect={(owner) => seleccionarOwner(owner.id)}
              onEdit={abrirEditarOwner}
              onDelete={eliminarOwner}
              footer={
                <Typography
                  variant="body2"
                  color="primary"
                  fontWeight={800}
                  sx={{ pt: 0.5 }}
                >
                  Mostrando {filteredOwners.length} propietarios
                </Typography>
              }
            />
          </Grid>

          <Grid item xs={12} lg={3}>
            <EntityListCard<Restaurant>
              title="Restaurantes"
              badge={restaurants.length}
              searchPlaceholder="Buscar restaurante..."
              searchValue={restaurantSearch}
              onSearchChange={setRestaurantSearch}
              onCreate={abrirCrearRestaurant}
              createDisabled={!selectedOwnerId}
              items={filteredRestaurants}
              emptyText={
                selectedOwnerId
                  ? "Este propietario no tiene restaurantes."
                  : "Selecciona un propietario para ver restaurantes."
              }
              activeId={selectedRestaurantId}
              getId={(restaurant) => restaurant.id}
              getTitle={(restaurant) =>
                restaurant.trade_name || "Sin nombre comercial"
              }
              getSubtitle={(restaurant) =>
                restaurant.contact_email || "Sin correo"
              }
              getMeta={(restaurant) =>
                restaurant.contact_phone || "Sin teléfono"
              }
              getInitials={(restaurant) =>
                getInitials(restaurant.trade_name || "Restaurante")
              }
              getStatus={(restaurant) => restaurant.status}
              onSelect={(restaurant) => seleccionarRestaurante(restaurant.id)}
              onEdit={selectedOwnerId ? abrirEditarRestaurant : undefined}
              onDelete={selectedOwnerId ? eliminarRestaurant : undefined}
              footer={
                selectedOwner && (
                  <Typography
                    variant="body2"
                    color="primary"
                    fontWeight={800}
                    sx={{ pt: 0.5 }}
                  >
                    Propietario: {getOwnerName(selectedOwner)}
                  </Typography>
                )
              }
            />
          </Grid>

          <Grid item xs={12} lg={4}>
            <Stack spacing={2} height="100%">
              <EntityListCard<Branch>
                title="Sucursales"
                badge={branches.length}
                searchPlaceholder="Buscar sucursal..."
                searchValue={branchSearch}
                onSearchChange={setBranchSearch}
                onCreate={abrirCrearBranch}
                createDisabled={!selectedRestaurantId}
                items={filteredBranches}
                emptyText={
                  selectedRestaurantId
                    ? "No hay sucursales registradas."
                    : "Selecciona un restaurante para ver sucursales."
                }
                getId={(branch) => branch.id}
                getTitle={(branch) => branch.name || "Sucursal sin nombre"}
                getSubtitle={(branch) => branch.address || "Sin dirección"}
                getMeta={(branch) =>
                  `${branch.phone || "Sin teléfono"} · ${
                    branch.open_time || "--"
                  } - ${branch.close_time || "--"}`
                }
                getStatus={(branch) => branch.status}
                leadingIcon={<BusinessIcon fontSize="small" />}
                onEdit={selectedRestaurantId ? abrirEditarBranch : undefined}
                onDelete={selectedRestaurantId ? eliminarBranch : undefined}
                footer={
                  selectedRestaurant && (
                    <Typography
                      variant="body2"
                      color="primary"
                      fontWeight={800}
                      sx={{ pt: 0.5 }}
                    >
                      Restaurante: {selectedRestaurant.trade_name}
                    </Typography>
                  )
                }
              />

              <SubscriptionCard
                selectedRestaurantId={selectedRestaurantId}
                currentSubscription={currentSubscription}
              />
            </Stack>
          </Grid>
        </Grid>

        {loadingDetail && (
          <Alert severity="info">Cargando detalle seleccionado...</Alert>
        )}

        <SalesTableCard
          title={`Ventas del periodo (${getMonthName(
            consultedMonth
          )} ${consultedYear})`}
          sales={filteredSales}
          totalSales={monthlySales.length}
          saleSearch={saleSearch}
          onSearchChange={setSaleSearch}
        />
      </Stack>

      <OwnerFormDialog
        open={ownerModalOpen}
        editing={ownerEditing}
        form={ownerForm}
        error={ownerFormError}
        saving={ownerSaving}
        onClose={cerrarOwnerModal}
        onChange={cambiarOwnerForm}
        onSubmit={guardarOwner}
      />

      <RestaurantFormDialog
        open={restaurantModalOpen}
        editing={restaurantEditing}
        ownerName={selectedOwner ? getOwnerName(selectedOwner) : ""}
        error={restaurantFormError}
        saving={restaurantSaving}
        onClose={cerrarRestaurantModal}
        onSubmit={guardarRestaurant}
      />

      <BranchFormDialog
        open={branchModalOpen}
        editing={branchEditing}
        restaurantName={selectedRestaurant?.trade_name || ""}
        error={branchFormError}
        saving={branchSaving}
        onClose={cerrarBranchModal}
        onSubmit={guardarBranch}
      />
    </Box>
  );
}

function SummaryCard({
  icon,
  title,
  value,
  subtitle,
  money = false,
}: {
  icon: ReactNode;
  title: string;
  value: ReactNode;
  subtitle: string;
  money?: boolean;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        minHeight: 110,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        display: "flex",
        alignItems: "center",
        gap: 2,
        overflow: "hidden",
      }}
    >
      <Avatar
        sx={{
          width: 56,
          height: 56,
          flexShrink: 0,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          "& svg": {
            fontSize: 28,
          },
        }}
      >
        {icon}
      </Avatar>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          color="text.secondary"
          fontWeight={800}
          sx={{
            fontSize: 13,
            lineHeight: 1.1,
          }}
        >
          {title}
        </Typography>

        <Typography
          fontWeight={900}
          title={String(value)}
          sx={{
            mt: 0.4,
            fontSize: money ? 21 : 26,
            lineHeight: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value}
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 0.5,
            fontSize: 13,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {subtitle}
        </Typography>
      </Box>
    </Paper>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: any;
  subtitle: string;
  icon: ReactNode;
}) {
  const textValue = String(value ?? "");
  const isMoney = textValue.includes("$");
  const isLongValue = textValue.length >= 9;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        height: "100%",
        minHeight: 104,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.default",
        overflow: "hidden",
      }}
    >
      <Stack spacing={0.8} height="100%" justifyContent="space-between">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
        >
          <Typography
            color="text.secondary"
            fontWeight={800}
            title={title}
            sx={{
              fontSize: 12.5,
              lineHeight: 1.1,
              maxWidth: "calc(100% - 32px)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </Typography>

          <Avatar
            sx={{
              width: 26,
              height: 26,
              flexShrink: 0,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              "& svg": {
                fontSize: 16,
              },
            }}
          >
            {icon}
          </Avatar>
        </Stack>

        <Typography
          fontWeight={900}
          title={textValue}
          sx={{
            fontSize:
              isMoney || isLongValue
                ? {
                    xs: 20,
                    sm: 21,
                    md: 21,
                    xl: 22,
                  }
                : {
                    xs: 24,
                    sm: 25,
                    md: 26,
                    xl: 28,
                  },
            lineHeight: 1,
            letterSpacing: "-0.03em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100%",
          }}
        >
          {value}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          title={subtitle}
          sx={{
            fontSize: 11.5,
            lineHeight: 1.15,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {subtitle}
        </Typography>
      </Stack>
    </Paper>
  );
}

function EntityListCard<T>({
  title,
  badge,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  onCreate,
  createDisabled,
  items,
  emptyText,
  getId,
  getTitle,
  getSubtitle,
  getMeta,
  getInitials,
  getStatus,
  activeId,
  onSelect,
  onEdit,
  onDelete,
  leadingIcon,
  footer,
}: {
  title: string;
  badge?: number;
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onCreate?: () => void;
  createDisabled?: boolean;
  items: T[];
  emptyText: string;
  getId: (item: T) => number | string;
  getTitle: (item: T) => string;
  getSubtitle?: (item: T) => string;
  getMeta?: (item: T) => string;
  getInitials?: (item: T) => string;
  getStatus?: (item: T) => string | undefined;
  activeId?: number | string | null;
  onSelect?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  leadingIcon?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        height: "100%",
        minHeight: 520,
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        overflow: "hidden",
      }}
    >
      <Stack spacing={1.5} height="100%">
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography
            variant="h6"
            fontWeight={900}
            title={title}
            sx={{
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </Typography>

          {typeof badge === "number" && (
            <Chip
              size="small"
              label={badge}
              color="primary"
              sx={{ fontWeight: 900, flexShrink: 0 }}
            />
          )}
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            fullWidth
            sx={{
              minWidth: 0,
              "& .MuiInputBase-root": {
                borderRadius: 2,
                bgcolor: "background.default",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          {onCreate && (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={onCreate}
              disabled={createDisabled}
              sx={{
                height: 40,
                borderRadius: 2,
                fontWeight: 800,
                px: 1.5,
                minWidth: 92,
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              Nuevo
            </Button>
          )}
        </Stack>

        <Stack
          spacing={1}
          sx={{
            flex: 1,
            minHeight: 0,
            maxHeight: 400,
            overflowY: "auto",
            pr: 0.5,
          }}
        >
          {items.length === 0 && (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              {emptyText}
            </Typography>
          )}

          {items.map((item) => {
            const id = getId(item);
            const titleValue = getTitle(item);
            const subtitle = getSubtitle?.(item);
            const meta = getMeta?.(item);
            const status = getStatus?.(item);
            const active = activeId === id;

            return (
              <Paper
                key={id}
                elevation={0}
                onClick={() => onSelect?.(item)}
                sx={{
                  p: 1.35,
                  borderRadius: 3,
                  cursor: onSelect ? "pointer" : "default",
                  border: "1px solid",
                  borderColor: active ? "primary.main" : "divider",
                  bgcolor: active ? "action.hover" : "background.default",
                  transition: "0.15s ease",
                  "&:hover": {
                    borderColor: onSelect ? "primary.main" : "divider",
                    bgcolor: onSelect ? "action.hover" : "background.default",
                  },
                }}
              >
                <Stack direction="row" spacing={1.4} alignItems="center">
                  <Avatar
                    sx={{
                      width: 42,
                      height: 42,
                      flexShrink: 0,
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      fontWeight: 900,
                    }}
                  >
                    {leadingIcon || getInitials?.(item) || "CM"}
                  </Avatar>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      fontWeight={900}
                      title={titleValue}
                      sx={{
                        lineHeight: 1.15,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {titleValue}
                    </Typography>

                    {subtitle && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        title={subtitle}
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {subtitle}
                      </Typography>
                    )}

                    {meta && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        title={meta}
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {meta}
                      </Typography>
                    )}
                  </Box>

                  <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    sx={{ flexShrink: 0 }}
                  >
                    {status && <StatusChip value={status} />}

                    {onEdit && (
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            onEdit(item);
                          }}
                        >
                          <EditIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    )}

                    {onDelete && (
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(event) => {
                            event.stopPropagation();
                            onDelete(item);
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    )}

                    {onSelect && (
                      <ArrowForwardIosIcon
                        sx={{ fontSize: 14, color: "text.secondary" }}
                      />
                    )}
                  </Stack>
                </Stack>
              </Paper>
            );
          })}
        </Stack>

        {footer && <Box>{footer}</Box>}
      </Stack>
    </Paper>
  );
}

function SubscriptionCard({
  selectedRestaurantId,
  currentSubscription,
}: {
  selectedRestaurantId: number | null;
  currentSubscription: any;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="h6" fontWeight={900} mb={1.5}>
        Suscripción actual
      </Typography>

      {!selectedRestaurantId && (
        <Typography color="text.secondary">
          Selecciona un restaurante para consultar la suscripción.
        </Typography>
      )}

      {selectedRestaurantId && !currentSubscription && (
        <Typography color="text.secondary">
          No se encontró una suscripción vigente.
        </Typography>
      )}

      {currentSubscription && (
        <Grid container spacing={1.2}>
          <Grid item xs={12} sm={6}>
            <InfoRow
              label="Plan"
              value={
                currentSubscription?.plan?.name ||
                currentSubscription?.plan_name ||
                "Sin plan"
              }
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <InfoRow
              label="Proveedor"
              value={currentSubscription?.provider || "Sin proveedor"}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <InfoRow
              label="Estado"
              value={<StatusChip value={currentSubscription?.status} />}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <InfoRow
              label="Total pagado"
              value={formatMoney(currentSubscription?.paid_price)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <InfoRow
              label="Inicio"
              value={formatDate(currentSubscription?.starts_at)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <InfoRow
              label="Vence"
              value={formatDate(
                currentSubscription?.ends_at || currentSubscription?.expires_at
              )}
            />
          </Grid>
        </Grid>
      )}
    </Paper>
  );
}

function SalesTableCard({
  title,
  sales,
  totalSales,
  saleSearch,
  onSearchChange,
}: {
  title: string;
  sales: any[];
  totalSales: number;
  saleSearch: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        spacing={1.5}
        alignItems={{ xs: "stretch", md: "center" }}
        mb={2}
      >
        <Typography variant="h6" fontWeight={900}>
          {title}
        </Typography>

        <TextField
          size="small"
          placeholder="Buscar venta..."
          value={saleSearch}
          onChange={(event) => onSearchChange(event.target.value)}
          sx={{
            width: { xs: "100%", md: 280 },
            "& .MuiInputBase-root": {
              borderRadius: 2,
              bgcolor: "background.default",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {totalSales === 0 && (
        <Typography color="text.secondary" sx={{ py: 1 }}>
          No hay ventas registradas en el periodo.
        </Typography>
      )}

      {totalSales > 0 && sales.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 1 }}>
          No hay coincidencias con la búsqueda actual.
        </Typography>
      )}

      {sales.length > 0 && (
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Restaurante</TableCell>
                <TableCell>Propietario</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Proveedor</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Monto</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sales.map((sale, index) => (
                <TableRow key={sale.id || index} hover>
                  <TableCell>{formatDateTime(sale?.created_at)}</TableCell>

                  <TableCell>
                    <Typography fontWeight={800}>
                      {sale?.restaurant?.trade_name || "Restaurante"}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {[
                      sale?.restaurant?.owner?.name,
                      sale?.restaurant?.owner?.last_name_paternal,
                      sale?.restaurant?.owner?.last_name_maternal,
                    ]
                      .filter(Boolean)
                      .join(" ") || "Sin propietario"}
                  </TableCell>

                  <TableCell>{sale?.plan?.name || "Sin plan"}</TableCell>

                  <TableCell>{sale?.provider || "Sin proveedor"}</TableCell>

                  <TableCell>
                    <StatusChip value={sale?.status} />
                  </TableCell>

                  <TableCell align="right">
                    <Typography fontWeight={900}>
                      {formatMoney(sale?.paid_price)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Paper>
  );
}

function OwnerFormDialog({
  open,
  editing,
  form,
  error,
  saving,
  onClose,
  onChange,
  onSubmit,
}: {
  open: boolean;
  editing: Owner | null;
  form: OwnerFormState;
  error: string;
  saving: boolean;
  onClose: () => void;
  onChange: (field: keyof OwnerFormState, value: string) => void;
  onSubmit: () => void;
}) {
  const autocompleteKey = editing ? `edit-${editing.id}` : "new-owner";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography fontWeight={900} fontSize={20}>
              {editing ? "Editar propietario" : "Nuevo propietario"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {editing
                ? "Actualiza los datos del propietario seleccionado."
                : "Registra un nuevo propietario en ClicMenu."}
            </Typography>
          </Box>

          <IconButton onClick={onClose} disabled={saving}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2.5 }}>
        <Box
          component="form"
          id="owner-form"
          autoComplete="off"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Nombre"
                  value={form.name}
                  onChange={(event) => onChange("name", event.target.value)}
                  fullWidth
                  required
                  disabled={saving}
                  autoComplete="off"
                  inputProps={{
                    autoComplete: "off",
                    name: `cm_owner_name_${autocompleteKey}`,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Apellido paterno"
                  value={form.last_name_paternal}
                  onChange={(event) =>
                    onChange("last_name_paternal", event.target.value)
                  }
                  fullWidth
                  disabled={saving}
                  autoComplete="off"
                  inputProps={{
                    autoComplete: "off",
                    name: `cm_owner_last_paternal_${autocompleteKey}`,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Apellido materno"
                  value={form.last_name_maternal}
                  onChange={(event) =>
                    onChange("last_name_maternal", event.target.value)
                  }
                  fullWidth
                  disabled={saving}
                  autoComplete="off"
                  inputProps={{
                    autoComplete: "off",
                    name: `cm_owner_last_maternal_${autocompleteKey}`,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Correo"
                  type="text"
                  value={form.email}
                  onChange={(event) => onChange("email", event.target.value)}
                  fullWidth
                  disabled={saving}
                  autoComplete="off"
                  inputProps={{
                    autoComplete: "off",
                    name: `cm_owner_contact_email_${autocompleteKey}`,
                    inputMode: "email",
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Teléfono"
                  type="text"
                  value={form.phone}
                  onChange={(event) => onChange("phone", event.target.value)}
                  fullWidth
                  disabled={saving}
                  autoComplete="off"
                  inputProps={{
                    autoComplete: "off",
                    name: `cm_owner_contact_phone_${autocompleteKey}`,
                    inputMode: "tel",
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label={editing ? "Nueva contraseña" : "Contraseña"}
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    onChange("password", event.target.value)
                  }
                  fullWidth
                  disabled={saving}
                  autoComplete="new-password"
                  inputProps={{
                    autoComplete: "new-password",
                    name: `cm_owner_new_access_key_${autocompleteKey}`,
                  }}
                  helperText={
                    editing
                      ? "Déjala vacía si no deseas cambiarla."
                      : "Solo se enviará si capturas una contraseña."
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Estado"
                  select
                  value={form.status}
                  onChange={(event) => onChange("status", event.target.value)}
                  fullWidth
                  disabled={saving}
                  autoComplete="off"
                  inputProps={{
                    autoComplete: "off",
                    name: `cm_owner_status_${autocompleteKey}`,
                  }}
                >
                  <MenuItem value="active">Activo</MenuItem>
                  <MenuItem value="inactive">Inactivo</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Stack>
        </Box>
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
          type="submit"
          form="owner-form"
          disabled={saving}
          sx={{ fontWeight: 800, borderRadius: 2, minWidth: 120 }}
        >
          {saving ? "Guardando..." : editing ? "Actualizar" : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function RestaurantFormDialog({
  open,
  editing,
  ownerName,
  error,
  saving,
  onClose,
  onSubmit,
}: {
  open: boolean;
  editing: Restaurant | null;
  ownerName?: string;
  error: string;
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: RestaurantPayload) => void;
}) {
  const [form, setForm] = useState({
    trade_name: "",
    description: "",
    contact_phone: "",
    contact_email: "",
    status: "active",
  });

  useEffect(() => {
    if (!open) return;

    setForm({
      trade_name: editing?.trade_name || "",
      description: editing?.description || "",
      contact_phone: editing?.contact_phone || "",
      contact_email: editing?.contact_email || "",
      status: editing?.status || "active",
    });
  }, [open, editing]);

  const submit = () => {
    const payload: RestaurantPayload = {
      trade_name: cleanText(form.trade_name),
      description: cleanText(form.description),
      contact_phone: cleanText(form.contact_phone),
      contact_email: cleanText(form.contact_email),
      status: form.status || "active",
    };

    if (!payload.description) delete payload.description;
    if (!payload.contact_phone) delete payload.contact_phone;
    if (!payload.contact_email) delete payload.contact_email;

    onSubmit(payload);
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
                ? "Actualiza los datos del restaurante."
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
        <Box
          component="form"
          id="restaurant-form"
          autoComplete="off"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Nombre comercial"
              value={form.trade_name}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  trade_name: event.target.value,
                }))
              }
              fullWidth
              required
              disabled={saving}
              autoComplete="off"
              inputProps={{
                autoComplete: "off",
                name: "cm_restaurant_trade_name",
              }}
            />

            <TextField
              label="Descripción"
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              fullWidth
              multiline
              minRows={3}
              disabled={saving}
              autoComplete="off"
              inputProps={{
                autoComplete: "off",
                name: "cm_restaurant_description",
              }}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Teléfono"
                  value={form.contact_phone}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      contact_phone: event.target.value,
                    }))
                  }
                  fullWidth
                  disabled={saving}
                  autoComplete="off"
                  inputProps={{
                    autoComplete: "off",
                    name: "cm_restaurant_phone",
                    inputMode: "tel",
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Correo"
                  type="text"
                  value={form.contact_email}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      contact_email: event.target.value,
                    }))
                  }
                  fullWidth
                  disabled={saving}
                  autoComplete="off"
                  inputProps={{
                    autoComplete: "off",
                    name: "cm_restaurant_email",
                    inputMode: "email",
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Estado"
                  select
                  value={form.status}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      status: event.target.value,
                    }))
                  }
                  fullWidth
                  disabled={saving}
                  autoComplete="off"
                  inputProps={{
                    autoComplete: "off",
                    name: "cm_restaurant_status",
                  }}
                >
                  <MenuItem value="active">Activo</MenuItem>
                  <MenuItem value="inactive">Inactivo</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Stack>
        </Box>
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
          type="submit"
          form="restaurant-form"
          disabled={saving || !cleanText(form.trade_name)}
          sx={{ fontWeight: 800, borderRadius: 2, minWidth: 120 }}
        >
          {saving ? "Guardando..." : editing ? "Actualizar" : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function BranchFormDialog({
  open,
  editing,
  restaurantName,
  error,
  saving,
  onClose,
  onSubmit,
}: {
  open: boolean;
  editing: Branch | null;
  restaurantName?: string;
  error: string;
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: BranchPayload) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    open_time: "",
    close_time: "",
    status: "active",
  });

  useEffect(() => {
    if (!open) return;

    setForm({
      name: editing?.name || "",
      address: editing?.address || "",
      phone: editing?.phone || "",
      open_time: editing?.open_time || "",
      close_time: editing?.close_time || "",
      status: editing?.status || "active",
    });
  }, [open, editing]);

  const submit = () => {
    const payload: BranchPayload = {
      name: cleanText(form.name),
      address: cleanText(form.address),
      phone: cleanText(form.phone),
      open_time: cleanText(form.open_time),
      close_time: cleanText(form.close_time),
      status: form.status || "active",
    };

    if (!payload.address) delete payload.address;
    if (!payload.phone) delete payload.phone;
    if (!payload.open_time) delete payload.open_time;
    if (!payload.close_time) delete payload.close_time;

    onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography fontWeight={900} fontSize={20}>
              {editing ? "Editar sucursal" : "Nueva sucursal"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {editing
                ? "Actualiza los datos de la sucursal."
                : restaurantName
                ? `Registra una sucursal para ${restaurantName}.`
                : "Registra una sucursal para el restaurante seleccionado."}
            </Typography>
          </Box>

          <IconButton onClick={onClose} disabled={saving}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2.5 }}>
        <Box
          component="form"
          id="branch-form"
          autoComplete="off"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Nombre de sucursal"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
              fullWidth
              required
              disabled={saving}
              autoComplete="off"
              inputProps={{
                autoComplete: "off",
                name: "cm_branch_name",
              }}
            />

            <TextField
              label="Dirección"
              value={form.address}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  address: event.target.value,
                }))
              }
              fullWidth
              disabled={saving}
              autoComplete="off"
              inputProps={{
                autoComplete: "off",
                name: "cm_branch_address",
              }}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Teléfono"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      phone: event.target.value,
                    }))
                  }
                  fullWidth
                  disabled={saving}
                  autoComplete="off"
                  inputProps={{
                    autoComplete: "off",
                    name: "cm_branch_phone",
                    inputMode: "tel",
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  label="Abre"
                  type="time"
                  value={form.open_time}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      open_time: event.target.value,
                    }))
                  }
                  fullWidth
                  disabled={saving}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    name: "cm_branch_open_time",
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  label="Cierra"
                  type="time"
                  value={form.close_time}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      close_time: event.target.value,
                    }))
                  }
                  fullWidth
                  disabled={saving}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    name: "cm_branch_close_time",
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Estado"
                  select
                  value={form.status}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      status: event.target.value,
                    }))
                  }
                  fullWidth
                  disabled={saving}
                  autoComplete="off"
                  inputProps={{
                    autoComplete: "off",
                    name: "cm_branch_status",
                  }}
                >
                  <MenuItem value="active">Activo</MenuItem>
                  <MenuItem value="inactive">Inactivo</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Stack>
        </Box>
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
          type="submit"
          form="branch-form"
          disabled={saving || !cleanText(form.name)}
          sx={{ fontWeight: 800, borderRadius: 2, minWidth: 120 }}
        >
          {saving ? "Guardando..." : editing ? "Actualizar" : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function StatusChip({ value }: { value?: string }) {
  const normalized = value || "sin estado";

  if (normalized === "active") {
    return <Chip size="small" label="Activo" color="success" />;
  }

  if (normalized === "inactive") {
    return <Chip size="small" label="Inactivo" color="default" />;
  }

  if (normalized === "trialing") {
    return <Chip size="small" label="Demo" color="warning" />;
  }

  if (normalized === "expired") {
    return <Chip size="small" label="Vencido" color="error" />;
  }

  if (normalized === "cancelled") {
    return <Chip size="small" label="Cancelado" color="default" />;
  }

  if (normalized === "paid") {
    return <Chip size="small" label="Pagada" color="success" />;
  }

  return <Chip size="small" label={normalized} color="default" />;
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography color="text.secondary">{label}</Typography>
      <Box sx={{ textAlign: "right", fontWeight: 800 }}>{value}</Box>
    </Stack>
  );
}