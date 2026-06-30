import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { clicMenuService } from "./clicMenuService";

type Owner = {
  id: number;
  name?: string;
  last_name_paternal?: string;
  last_name_maternal?: string;
  email?: string;
  phone?: string;
  status?: string;
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

type DashboardData = {
  ok?: boolean;
  owners?: any;
  sales_summary?: any;
  monthly_sales?: any;
};

function normalizeArray<T>(payload: any): T[] {
  if (!payload) return [];

  if (Array.isArray(payload)) return payload;

  if (Array.isArray(payload.data)) return payload.data;

  if (Array.isArray(payload.data?.data)) return payload.data.data;

  if (Array.isArray(payload.result)) return payload.result;

  if (Array.isArray(payload.results)) return payload.results;

  return [];
}

function normalizeSummary(payload: any) {
  if (!payload) return {};

  if (payload.summary) return payload.summary;

  if (payload.data?.summary) return payload.data.summary;

  if (payload.data) return payload.data;

  return payload;
}

function normalizeObject(payload: any) {
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

function formatMoney(value: any) {
  const numberValue = Number(value || 0);

  return numberValue.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
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

export default function ClicMenuDashboard() {
  const now = new Date();

  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  const [selectedOwnerId, setSelectedOwnerId] = useState<number | "">("");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | "">(
    ""
  );

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  const owners = useMemo<Owner[]>(() => {
    return normalizeArray<Owner>(dashboard?.owners);
  }, [dashboard]);

  const salesSummary = useMemo(() => {
    return normalizeSummary(dashboard?.sales_summary);
  }, [dashboard]);

  const monthlySales = useMemo<any[]>(() => {
    return normalizeArray<any>(dashboard?.monthly_sales);
  }, [dashboard]);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await clicMenuService.dashboard({
        year,
        month,
        per_page: 15,
      });

      setDashboard(response.data);
    } catch (err: any) {
      setError(
        getErrorMessage(
          err,
          "No fue posible cargar la información de ClicMenu."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const cargarRestaurantes = async (ownerId: number) => {
    try {
      setLoadingDetail(true);
      setError("");
      setRestaurants([]);
      setBranches([]);
      setCurrentSubscription(null);
      setSelectedRestaurantId("");

      const response = await clicMenuService.restaurants(ownerId, {
        per_page: 15,
      });

      setRestaurants(normalizeArray<Restaurant>(response.data));
    } catch (err: any) {
      setError(
        getErrorMessage(
          err,
          "No fue posible cargar los restaurantes del propietario."
        )
      );
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
        setBranches(normalizeArray<Branch>(branchesResponse.value.data));
      }

      if (subscriptionResponse.status === "fulfilled") {
        setCurrentSubscription(
          normalizeObject(subscriptionResponse.value.data)
        );
      }
    } catch (err: any) {
      setError(
        getErrorMessage(
          err,
          "No fue posible cargar el detalle del restaurante."
        )
      );
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    cargarDashboard();
  }, []);

  const handleBuscar = () => {
    setSelectedOwnerId("");
    setSelectedRestaurantId("");
    setRestaurants([]);
    setBranches([]);
    setCurrentSubscription(null);
    cargarDashboard();
  };

  const handleOwnerClick = (ownerId: number) => {
    setSelectedOwnerId(ownerId);
    setSelectedRestaurantId("");
    setRestaurants([]);
    setBranches([]);
    setCurrentSubscription(null);
    cargarRestaurantes(ownerId);
  };

  const handleRestaurantClick = (restaurantId: number) => {
    setSelectedRestaurantId(restaurantId);
    setBranches([]);
    setCurrentSubscription(null);

    if (selectedOwnerId) {
      cargarDetalleRestaurante(Number(selectedOwnerId), restaurantId);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography>Cargando ClicMenu...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={900}>
            ClicMenu
          </Typography>

          <Typography color="text.secondary">
            Propietarios, restaurantes, sucursales, suscripciones y ventas.
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <TextField
              label="Año"
              type="number"
              size="small"
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              sx={{ width: { xs: "100%", md: 140 } }}
            />

            <TextField
              label="Mes"
              select
              size="small"
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
              sx={{ width: { xs: "100%", md: 180 } }}
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

            <Button variant="contained" onClick={handleBuscar}>
              Consultar
            </Button>
          </Stack>
        </Paper>

        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <MetricCard
              title="Suscripciones"
              value={salesSummary?.total_subscriptions ?? 0}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <MetricCard
              title="Pagadas"
              value={salesSummary?.paid_subscriptions ?? 0}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <MetricCard
              title="Demos"
              value={salesSummary?.demo_subscriptions ?? 0}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <MetricCard
              title="Total vendido"
              value={formatMoney(salesSummary?.total_sales)}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={900} mb={2}>
                Propietarios
              </Typography>

              <Stack spacing={1.5}>
                {owners.length === 0 && (
                  <Typography color="text.secondary">
                    No hay propietarios registrados.
                  </Typography>
                )}

                {owners.map((owner) => (
                  <Paper
                    key={owner.id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      cursor: "pointer",
                      borderColor:
                        selectedOwnerId === owner.id
                          ? "primary.main"
                          : "divider",
                    }}
                    onClick={() => handleOwnerClick(owner.id)}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <Box>
                        <Typography fontWeight={800}>
                          {getOwnerName(owner) || "Sin nombre"}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          {owner.email || "Sin correo"}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          {owner.phone || "Sin teléfono"}
                        </Typography>
                      </Box>

                      <Chip
                        size="small"
                        label={owner.status || "Sin estado"}
                        color={owner.status === "active" ? "success" : "default"}
                      />
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={900} mb={2}>
                Restaurantes
              </Typography>

              {!selectedOwnerId && (
                <Typography color="text.secondary">
                  Selecciona un propietario para ver sus restaurantes.
                </Typography>
              )}

              {loadingDetail && (
                <Stack alignItems="center" sx={{ py: 3 }}>
                  <CircularProgress size={28} />
                </Stack>
              )}

              {!loadingDetail && selectedOwnerId && restaurants.length === 0 && (
                <Typography color="text.secondary">
                  Este propietario no tiene restaurantes registrados.
                </Typography>
              )}

              <Stack spacing={1.5}>
                {restaurants.map((restaurant) => (
                  <Paper
                    key={restaurant.id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      cursor: "pointer",
                      borderColor:
                        selectedRestaurantId === restaurant.id
                          ? "primary.main"
                          : "divider",
                    }}
                    onClick={() => handleRestaurantClick(restaurant.id)}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <Box>
                        <Typography fontWeight={800}>
                          {restaurant.trade_name || "Sin nombre comercial"}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          {restaurant.contact_email || "Sin correo"}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          {restaurant.contact_phone || "Sin teléfono"}
                        </Typography>
                      </Box>

                      <Chip
                        size="small"
                        label={restaurant.status || "Sin estado"}
                        color={
                          restaurant.status === "active"
                            ? "success"
                            : "default"
                        }
                      />
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={900} mb={2}>
                Sucursales
              </Typography>

              {!selectedRestaurantId && (
                <Typography color="text.secondary">
                  Selecciona un restaurante para ver sus sucursales.
                </Typography>
              )}

              {selectedRestaurantId && branches.length === 0 && (
                <Typography color="text.secondary">
                  No hay sucursales registradas.
                </Typography>
              )}

              <Stack spacing={1.5}>
                {branches.map((branch) => (
                  <Paper
                    key={branch.id}
                    variant="outlined"
                    sx={{ p: 2, borderRadius: 2 }}
                  >
                    <Typography fontWeight={800}>
                      {branch.name || "Sucursal sin nombre"}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {branch.address || "Sin dirección"}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Teléfono: {branch.phone || "--"}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Horario: {branch.open_time || "--"} -{" "}
                      {branch.close_time || "--"}
                    </Typography>

                    <Chip
                      size="small"
                      sx={{ mt: 1 }}
                      label={branch.status || "Sin estado"}
                      color={branch.status === "active" ? "success" : "default"}
                    />
                  </Paper>
                ))}
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={900} mb={2}>
                Suscripción actual
              </Typography>

              {!selectedRestaurantId && (
                <Typography color="text.secondary">
                  Selecciona un restaurante para ver su suscripción.
                </Typography>
              )}

              {selectedRestaurantId && !currentSubscription && (
                <Typography color="text.secondary">
                  No se encontró una suscripción vigente.
                </Typography>
              )}

              {currentSubscription && (
                <Stack spacing={1}>
                  <Typography>
                    <strong>Plan:</strong>{" "}
                    {currentSubscription?.plan?.name ||
                      currentSubscription?.plan_name ||
                      currentSubscription?.plan_id ||
                      "Sin plan"}
                  </Typography>

                  <Typography>
                    <strong>Estado:</strong>{" "}
                    {currentSubscription?.status || "Sin estado"}
                  </Typography>

                  <Typography>
                    <strong>Proveedor:</strong>{" "}
                    {currentSubscription?.provider || "Sin proveedor"}
                  </Typography>

                  <Typography>
                    <strong>Meses pagados:</strong>{" "}
                    {currentSubscription?.months_paid ?? "--"}
                  </Typography>

                  <Typography>
                    <strong>Meses otorgados:</strong>{" "}
                    {currentSubscription?.months_granted ?? "--"}
                  </Typography>

                  <Typography>
                    <strong>Total pagado:</strong>{" "}
                    {formatMoney(currentSubscription?.paid_price)}
                  </Typography>

                  <Typography>
                    <strong>Vence:</strong>{" "}
                    {currentSubscription?.ends_at ||
                      currentSubscription?.end_date ||
                      currentSubscription?.expires_at ||
                      "--"}
                  </Typography>
                </Stack>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={900} mb={2}>
            Ventas mensuales
          </Typography>

          {monthlySales.length === 0 && (
            <Typography color="text.secondary">
              No hay ventas registradas en el periodo seleccionado.
            </Typography>
          )}

          <Stack spacing={1.5}>
            {monthlySales.map((sale, index) => (
              <Paper
                key={sale.id || index}
                variant="outlined"
                sx={{ p: 2, borderRadius: 2 }}
              >
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Box>
                    <Typography fontWeight={800}>
                      {sale?.restaurant?.trade_name ||
                        sale?.restaurant_name ||
                        "Restaurante"}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {sale?.owner?.email || sale?.owner_email || "Sin correo"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography fontWeight={800}>
                      {formatMoney(
                        sale?.paid_price || sale?.amount || sale?.total || 0
                      )}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {sale?.provider || "Sin proveedor"} ·{" "}
                      {sale?.status || "Sin estado"}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}

function MetricCard({ title, value }: { title: string; value: any }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 3,
        minHeight: 110,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Typography color="text.secondary" fontWeight={700}>
        {title}
      </Typography>

      <Typography variant="h4" fontWeight={900}>
        {value}
      </Typography>
    </Paper>
  );
}