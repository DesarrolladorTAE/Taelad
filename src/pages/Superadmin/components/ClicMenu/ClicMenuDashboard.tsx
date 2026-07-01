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

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
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
  const [saleSearch, setSaleSearch] = useState("");

  const [ownerModalOpen, setOwnerModalOpen] = useState(false);
  const [ownerSaving, setOwnerSaving] = useState(false);
  const [ownerFormError, setOwnerFormError] = useState("");
  const [ownerEditing, setOwnerEditing] = useState<Owner | null>(null);
  const [ownerForm, setOwnerForm] = useState<OwnerFormState>(emptyOwnerForm);

  const owners = useMemo<Owner[]>(() => {
    return getArray<Owner>(dashboard?.owners);
  }, [dashboard]);

  const salesSummary = useMemo(() => {
    return getSummary(dashboard?.sales_summary);
  }, [dashboard]);

  const monthlySales = useMemo<any[]>(() => {
    return getArray<any>(dashboard?.monthly_sales);
  }, [dashboard]);

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

      const response = await clicMenuService.restaurants(ownerId, {
        per_page: 15,
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

      const [branchesResponse, subscriptionResponse] = await Promise.allSettled(
        [
          clicMenuService.branches(ownerId, restaurantId),
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
      <Stack spacing={3}>
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
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CalendarMonthIcon color="primary" />
              <Box>
                <Typography fontWeight={900} lineHeight={1}>
                  Periodo actual
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getMonthName(consultedMonth)} {consultedYear}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} xl={3}>
            <ModuleCard
              icon={<GroupsIcon />}
              title="Propietarios"
              subtitle={`${owners.length} propietarios registrados`}
            />
          </Grid>

          <Grid item xs={12} sm={6} xl={3}>
            <ModuleCard
              icon={<RestaurantIcon />}
              title="Restaurantes"
              subtitle={
                selectedOwner
                  ? `${restaurants.length} restaurantes`
                  : "Consulta por propietario"
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} xl={3}>
            <ModuleCard
              icon={<StorefrontIcon />}
              title="Sucursales"
              subtitle={
                selectedRestaurant
                  ? `${branches.length} sucursales`
                  : "Gestiona sus sucursales"
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} xl={3}>
            <ModuleCard
              icon={<PaymentsIcon />}
              title="Ventas"
              subtitle="Resumen y suscripciones"
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
            <Grid item xs={12} md={4}>
              <Stack spacing={2}>
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

            <Grid item xs={12} md={8}>
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
          <Grid item xs={12} lg={4}>
            <SectionCard
              title="Propietarios"
              badge={owners.length}
             action={
  <Stack
    direction="row"
    spacing={1}
    alignItems="center"
    sx={{
      width: "100%",
      minWidth: 0,
    }}
  >
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <SearchInput
        placeholder="Buscar propietario..."
        value={ownerSearch}
        onChange={setOwnerSearch}
      />
    </Box>

    <Button
      variant="contained"
      size="small"
      startIcon={<AddIcon />}
      onClick={abrirCrearOwner}
      sx={{
        height: 40,
        borderRadius: 2,
        fontWeight: 800,
        whiteSpace: "nowrap",
        flexShrink: 0,
        px: 1.5,
        minWidth: 92,
      }}
    >
      Nuevo
    </Button>
  </Stack>
}
            >
              <ScrollableList maxHeight={360}>
                {filteredOwners.length === 0 && (
                  <EmptyText>No hay propietarios para mostrar.</EmptyText>
                )}

                {filteredOwners.map((owner) => {
                  const name = getOwnerName(owner) || "Sin nombre";

                  return (
                    <SelectableItem
                      key={owner.id}
                      active={selectedOwnerId === owner.id}
                      onClick={() => seleccionarOwner(owner.id)}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          sx={{
                            width: 44,
                            height: 44,
                            bgcolor: "primary.main",
                            color: "primary.contrastText",
                            fontWeight: 900,
                          }}
                        >
                          {getInitials(name)}
                        </Avatar>

                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography fontWeight={900} noWrap>
                            {name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                          >
                            {owner.email || "Sin correo"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {owner.phone || "Sin teléfono"}
                          </Typography>
                        </Box>

                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <StatusChip value={owner.status} />

                          <Tooltip title="Editar propietario">
                            <IconButton
                              size="small"
                              onClick={(event) => {
                                event.stopPropagation();
                                abrirEditarOwner(owner);
                              }}
                            >
                              <EditIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Eliminar propietario">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(event) => {
                                event.stopPropagation();
                                eliminarOwner(owner);
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>

                        <ArrowForwardIosIcon
                          sx={{ fontSize: 14, color: "text.secondary" }}
                        />
                      </Stack>
                    </SelectableItem>
                  );
                })}
              </ScrollableList>
            </SectionCard>
          </Grid>

          <Grid item xs={12} lg={4}>
            <SectionCard
              title="Restaurantes"
              badge={restaurants.length}
              action={
                <SearchInput
                  placeholder="Buscar restaurante..."
                  value={restaurantSearch}
                  onChange={setRestaurantSearch}
                />
              }
            >
              {!selectedOwnerId && (
                <EmptyText>
                  Selecciona un propietario para ver restaurantes.
                </EmptyText>
              )}

              {loadingDetail && (
                <Stack alignItems="center" py={4}>
                  <CircularProgress size={28} />
                </Stack>
              )}

              {!loadingDetail &&
                selectedOwnerId &&
                filteredRestaurants.length === 0 && (
                  <EmptyText>Este propietario no tiene restaurantes.</EmptyText>
                )}

              <ScrollableList maxHeight={360}>
                {filteredRestaurants.map((restaurant) => {
                  const name = restaurant.trade_name || "Sin nombre comercial";

                  return (
                    <SelectableItem
                      key={restaurant.id}
                      active={selectedRestaurantId === restaurant.id}
                      onClick={() => seleccionarRestaurante(restaurant.id)}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          sx={{
                            width: 44,
                            height: 44,
                            bgcolor: "primary.main",
                            color: "primary.contrastText",
                            fontWeight: 900,
                          }}
                        >
                          {getInitials(name)}
                        </Avatar>

                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography fontWeight={900} noWrap>
                            {name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                          >
                            {restaurant.contact_email || "Sin correo"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {restaurant.contact_phone || "Sin teléfono"}
                          </Typography>
                        </Box>

                        <StatusChip value={restaurant.status} />
                        <ArrowForwardIosIcon
                          sx={{ fontSize: 14, color: "text.secondary" }}
                        />
                      </Stack>
                    </SelectableItem>
                  );
                })}
              </ScrollableList>
            </SectionCard>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Stack spacing={2} height="100%">
              <SectionCard
                title={
                  selectedRestaurant
                    ? `Sucursales de ${selectedRestaurant.trade_name}`
                    : "Sucursales"
                }
                badge={branches.length}
              >
                {!selectedRestaurantId && (
                  <EmptyText>
                    Selecciona un restaurante para ver sucursales.
                  </EmptyText>
                )}

                {selectedRestaurantId && branches.length === 0 && (
                  <EmptyText>No hay sucursales registradas.</EmptyText>
                )}

                <Stack spacing={1.2}>
                  {branches.slice(0, 3).map((branch) => (
                    <Paper
                      key={branch.id}
                      elevation={0}
                      sx={{
                        p: 1.7,
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.default",
                      }}
                    >
                      <Stack direction="row" spacing={1.5}>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: "primary.main",
                            color: "primary.contrastText",
                          }}
                        >
                          <StorefrontIcon fontSize="small" />
                        </Avatar>

                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography fontWeight={900}>
                            {branch.name || "Sucursal sin nombre"}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                          >
                            {branch.address || "Sin dirección"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {branch.phone || "Sin teléfono"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {branch.open_time || "--"} -{" "}
                            {branch.close_time || "--"}
                          </Typography>
                        </Box>

                        <StatusChip value={branch.status} />
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </SectionCard>

              <SectionCard title="Suscripción actual">
                {!selectedRestaurantId && (
                  <EmptyText>
                    Selecciona un restaurante para consultar la suscripción.
                  </EmptyText>
                )}

                {selectedRestaurantId && !currentSubscription && (
                  <EmptyText>No se encontró una suscripción vigente.</EmptyText>
                )}

                {currentSubscription && (
                  <Stack spacing={1}>
                    <InfoRow
                      label="Plan"
                      value={
                        currentSubscription?.plan?.name ||
                        currentSubscription?.plan_name ||
                        "Sin plan"
                      }
                    />
                    <InfoRow
                      label="Proveedor"
                      value={currentSubscription?.provider || "Sin proveedor"}
                    />
                    <InfoRow
                      label="Estado"
                      value={<StatusChip value={currentSubscription?.status} />}
                    />
                    <InfoRow
                      label="Inicio"
                      value={formatDate(currentSubscription?.starts_at)}
                    />
                    <InfoRow
                      label="Vence"
                      value={formatDate(
                        currentSubscription?.ends_at ||
                          currentSubscription?.expires_at
                      )}
                    />
                    <InfoRow
                      label="Total pagado"
                      value={formatMoney(currentSubscription?.paid_price)}
                    />
                  </Stack>
                )}
              </SectionCard>
            </Stack>
          </Grid>
        </Grid>

        <SectionCard
          title={`Ventas del periodo (${getMonthName(
            consultedMonth
          )} ${consultedYear})`}
          action={
            <SearchInput
              placeholder="Buscar venta..."
              value={saleSearch}
              onChange={setSaleSearch}
            />
          }
        >
          {monthlySales.length === 0 && (
            <EmptyText>No hay ventas registradas en el periodo.</EmptyText>
          )}

          {monthlySales.length > 0 && filteredSales.length === 0 && (
            <EmptyText>No hay coincidencias con la búsqueda actual.</EmptyText>
          )}

          {filteredSales.length > 0 && (
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
                  {filteredSales.map((sale, index) => (
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
        </SectionCard>
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
    </Box>
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

      <DialogContent
        sx={{ pt: 2.5 }}
        component="form"
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
                onChange={(event) => onChange("password", event.target.value)}
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
          onClick={onSubmit}
          disabled={saving}
          sx={{ fontWeight: 800, borderRadius: 2, minWidth: 120 }}
        >
          {saving ? "Guardando..." : editing ? "Actualizar" : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
function ModuleCard({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        minHeight: 100,
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        display: "flex",
        alignItems: "center",
        gap: 1.6,
        overflow: "hidden",
      }}
    >
      <Avatar
        sx={{
          width: 42,
          height: 42,
          flexShrink: 0,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          "& svg": {
            fontSize: 22,
          },
        }}
      >
        {icon}
      </Avatar>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          fontWeight={900}
          title={title}
          sx={{
            fontSize: 17,
            lineHeight: 1.15,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </Typography>

        <Typography
          color="text.secondary"
          title={subtitle}
          sx={{
            mt: 0.3,
            fontSize: 13,
            lineHeight: 1.25,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
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

function SectionCard({
  title,
  badge,
  action,
  children,
}: {
  title: string;
  badge?: number;
  action?: ReactNode;
  children: ReactNode;
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
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Stack spacing={1.5} mb={2}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{
            minWidth: 0,
            width: "100%",
          }}
        >
          <Typography
            variant="h6"
            fontWeight={900}
            title={title}
            sx={{
              minWidth: 0,
              flex: 1,
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
              sx={{
                fontWeight: 900,
                flexShrink: 0,
              }}
            />
          )}
        </Stack>

        {action && (
          <Box
            sx={{
              width: "100%",
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            {action}
          </Box>
        )}
      </Stack>

      {children}
    </Paper>
  );
}

function SearchInput({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <TextField
      size="small"
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      sx={{
        width: "100%",
        minWidth: 0,
        "& .MuiInputBase-root": {
          borderRadius: 2,
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
  );
}

function ScrollableList({
  children,
  maxHeight,
}: {
  children: ReactNode;
  maxHeight: number;
}) {
  return (
    <Stack spacing={1.2} sx={{ maxHeight, overflowY: "auto", pr: 0.5 }}>
      {children}
    </Stack>
  );
}

function SelectableItem({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 1.5,
        borderRadius: 3,
        cursor: "pointer",
        border: "1px solid",
        borderColor: active ? "primary.main" : "divider",
        bgcolor: active ? "action.hover" : "background.default",
        transition: "0.15s ease",
        "&:hover": {
          borderColor: "primary.main",
          bgcolor: "action.hover",
        },
      }}
    >
      {children}
    </Paper>
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

function EmptyText({ children }: { children: ReactNode }) {
  return (
    <Typography color="text.secondary" sx={{ py: 1 }}>
      {children}
    </Typography>
  );
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography color="text.secondary">{label}</Typography>
      <Box sx={{ textAlign: "right", fontWeight: 800 }}>{value}</Box>
    </Stack>
  );
}