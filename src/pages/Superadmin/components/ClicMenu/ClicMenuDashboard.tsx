import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import GroupsIcon from "@mui/icons-material/Groups";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PaymentsIcon from "@mui/icons-material/Payments";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import BusinessIcon from "@mui/icons-material/Business";

import { clicMenuService } from "./clicMenuService";

import {
  BranchFormDialog,
  BranchLogoDialog,
  EntityListCard,
  MetricCard,
  OwnerFormDialog,
  RestaurantFormDialog,
  SalesTableCard,
  SubscriptionCard,
  SubscriptionDialog,
  SummaryCard,
} from "./ClicMenuDashboardParts";

import type {
  Branch,
  BranchPayload,
  Owner,
  OwnerFormState,
  Restaurant,
  RestaurantPayload,
  SubscriptionPayload,
  SalesFiltersState,
} from "./ClicMenuDashboardParts";

const emptyOwnerForm: OwnerFormState = {
  name: "",
  last_name_paternal: "",
  last_name_maternal: "",
  email: "",
  phone: "",
  password: "",
  status: "active",
};

const planFilters = [
  { value: "todos", label: "Todos los planes" },
  { value: "demo", label: "Plan Demo" },
  { value: "digital", label: "Plan Digital" },
  { value: "gestion", label: "Plan Gestión" },
  { value: "total", label: "Plan Total" },
];

function createEmptySalesFilters(): SalesFiltersState {
  return {
    q: "",
    owner_id: "",
    restaurant_id: "",
    plan_id: "",
    status: "",
    provider: "",
  };
}

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

  if (Array.isArray(payload.branches)) {
    return payload.branches;
  }

  if (Array.isArray(payload.data?.branches)) {
    return payload.data.branches;
  }

  if (Array.isArray(payload.data?.data?.branches)) {
    return payload.data.data.branches;
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

function getPlanFilterLabel(value?: string | null) {
  return (
    planFilters.find((item) => item.value === value)?.label ||
    "Todos los planes"
  );
}

function getPlanFilterId(value?: string | null) {
  const normalized = String(value || "").toLowerCase();

  const map: Record<string, number> = {
    demo: 1,
    digital: 2,
    gestion: 3,
    total: 4,
  };

  return map[normalized] || null;
}

function getSalePlanId(sale: any) {
  const possibleValues = [
    sale?.plan_id,
    sale?.plan?.id,
    sale?.subscription_plan_id,
    sale?.subscription?.plan_id,
    sale?.subscription?.plan?.id,
    sale?.current_subscription?.plan_id,
    sale?.current_subscription?.plan?.id,
  ];

  for (const value of possibleValues) {
    const parsed = Number(value);

    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
}

function getSalePlanText(sale: any) {
  return normalizeText(
    [
      sale?.plan_id,
      sale?.plan?.id,
      sale?.plan?.slug,
      sale?.plan?.name,
      sale?.plan?.code,
      sale?.plan_name,
      sale?.plan_slug,
      sale?.plan_type,
      sale?.subscription_type,
      sale?.subscription?.plan_id,
      sale?.subscription?.plan?.id,
      sale?.subscription?.plan?.slug,
      sale?.subscription?.plan?.name,
      sale?.subscription?.plan_name,
      sale?.current_subscription?.plan_id,
      sale?.current_subscription?.plan?.id,
      sale?.current_subscription?.plan?.slug,
      sale?.current_subscription?.plan?.name,
      sale?.product_name,
      sale?.nombre_producto,
      sale?.type,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function isDemoSale(sale: any) {
  const rawFlags = [
    sale?.is_demo,
    sale?.demo,
    sale?.subscription?.is_demo,
    sale?.current_subscription?.is_demo,
  ];

  if (rawFlags.some((value) => value === true || value === 1 || value === "1")) {
    return true;
  }

  const text = getSalePlanText(sale);

  return (
    text.includes("demo") ||
    text.includes("prueba") ||
    text.includes("trial")
  );
}

function saleMatchesPlanFilter(sale: any, planFilter: string) {
  if (!planFilter || planFilter === "todos") return true;

  const planId = getSalePlanId(sale);
  const expectedPlanId = getPlanFilterId(planFilter);

  if (expectedPlanId && planId === expectedPlanId) {
    return true;
  }

  if (planFilter === "demo") {
    return isDemoSale(sale);
  }

  const text = getSalePlanText(sale);

  if (planFilter === "digital") {
    return text.includes("digital") || text.includes("plan 2");
  }

  if (planFilter === "gestion") {
    return text.includes("gestion") || text.includes("gestión") || text.includes("plan 3");
  }

  if (planFilter === "total") {
    return text.includes("total") || text.includes("plan 4");
  }

  return true;
}

function getSaleAmount(sale: any) {
  const possibleValues = [
    sale?.paid_price,
    sale?.amount,
    sale?.total,
    sale?.price,
    sale?.monto,
    sale?.subscription?.paid_price,
    sale?.subscription?.amount,
    sale?.payment?.amount,
  ];

  for (const value of possibleValues) {
    const amount = Number(value ?? 0);

    if (Number.isFinite(amount) && amount > 0) {
      return amount;
    }
  }

  return 0;
}

function isPaidSubscriptionSale(sale: any) {
  if (isDemoSale(sale)) return false;

  const status = normalizeText(sale?.status);

  return (
    getSaleAmount(sale) > 0 ||
    status.includes("paid") ||
    status.includes("pagad") ||
    status.includes("active") ||
    status.includes("activo") ||
    status.includes("confirm")
  );
}

function getSaleOwnerName(sale: any) {
  return (
    [
      sale?.restaurant?.owner?.name,
      sale?.restaurant?.owner?.last_name_paternal,
      sale?.restaurant?.owner?.last_name_maternal,
    ]
      .filter(Boolean)
      .join(" ") || "Sin propietario"
  );
}

function toCsvValue(value: any) {
  const text = String(value ?? "")
    .replace(/\r?\n|\r/g, " ")
    .trim();

  return `"${text.replace(/"/g, '""')}"`;
}

function getRawAmount(value: any) {
  const amount = Number(value || 0);

  if (Number.isNaN(amount)) return "0.00";

  return amount.toFixed(2);
}

export default function ClicMenuDashboard() {
  const now = new Date();

  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [planFilter, setPlanFilter] = useState("todos");

  const [consultedYear, setConsultedYear] = useState(now.getFullYear());
  const [consultedMonth, setConsultedMonth] = useState(now.getMonth() + 1);
  const [consultedPlanFilter, setConsultedPlanFilter] = useState("todos");

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
  const [salesFilters, setSalesFilters] = useState<SalesFiltersState>(() =>
    createEmptySalesFilters()
  );

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

  const [branchLogoModalOpen, setBranchLogoModalOpen] = useState(false);
  const [branchLogoSaving, setBranchLogoSaving] = useState(false);
  const [branchLogoError, setBranchLogoError] = useState("");
  const [branchLogoTarget, setBranchLogoTarget] = useState<Branch | null>(null);

  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [subscriptionSaving, setSubscriptionSaving] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState("");
  const [subscriptionHistory, setSubscriptionHistory] = useState<any[]>([]);

  const owners = useMemo<Owner[]>(() => {
    return getArray<Owner>(dashboard?.owners);
  }, [dashboard]);

  const salesSummary = useMemo(() => {
    return getSummary(dashboard?.sales_summary);
  }, [dashboard]);

  const monthlySales = useMemo<any[]>(() => {
    return getArray<any>(dashboard?.monthly_sales);
  }, [dashboard]);

  const monthlySalesByPlan = useMemo(() => {
    return monthlySales.filter((sale) =>
      saleMatchesPlanFilter(sale, consultedPlanFilter)
    );
  }, [monthlySales, consultedPlanFilter]);

  const visibleSalesSummary = useMemo(() => {
    if (!consultedPlanFilter || consultedPlanFilter === "todos") {
      return salesSummary;
    }

    return {
      ...salesSummary,
      total_subscriptions: monthlySalesByPlan.length,
      paid_subscriptions: monthlySalesByPlan.filter(isPaidSubscriptionSale).length,
      demo_subscriptions: monthlySalesByPlan.filter(isDemoSale).length,
      total_sales: monthlySalesByPlan.reduce((total, sale) => {
        if (isDemoSale(sale)) return total;

        return total + getSaleAmount(sale);
      }, 0),
    };
  }, [salesSummary, monthlySalesByPlan, consultedPlanFilter]);

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
          restaurant.branches_count,
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
    const q = normalizeText(salesFilters.q);

    if (!q) return monthlySalesByPlan;

    return monthlySalesByPlan.filter((sale) => {
      const text = normalizeText(
        [
          sale?.restaurant?.trade_name,
          sale?.restaurant?.owner?.name,
          sale?.restaurant?.owner?.last_name_paternal,
          sale?.restaurant?.owner?.last_name_maternal,
          sale?.restaurant?.owner?.email,
          sale?.plan_id,
          sale?.plan?.id,
          sale?.plan?.name,
          sale?.plan_name,
          sale?.provider,
          sale?.status,
          sale?.paid_price,
        ]
          .filter(Boolean)
          .join(" ")
      );

      return text.includes(q);
    });
  }, [monthlySalesByPlan, salesFilters.q]);

  const buildSalesParams = (
    targetYear: number,
    targetMonth: number,
    targetFilters: SalesFiltersState = salesFilters,
    targetPlanFilter: string = planFilter
  ) => {
    const params: Record<string, any> = {
      year: targetYear,
      month: targetMonth,
      per_page: 100,
      include_internal: false,
    };

    if (targetPlanFilter && targetPlanFilter !== "todos") {
      const planId = getPlanFilterId(targetPlanFilter);

      params.plan = targetPlanFilter;
      params.plan_filter = targetPlanFilter;
      params.plan_slug = targetPlanFilter;
      params.plan_type = targetPlanFilter;
      params.plan_key = targetPlanFilter;
      params.subscription_type = targetPlanFilter === "demo" ? "demo" : "paid";

      if (planId) {
        params.plan_id = planId;
      }
    }

    if (cleanText(targetFilters.q)) params.q = cleanText(targetFilters.q);
    if (targetFilters.owner_id) params.owner_id = targetFilters.owner_id;
    if (targetFilters.restaurant_id) {
      params.restaurant_id = targetFilters.restaurant_id;
    }
    if (targetFilters.plan_id) params.plan_id = targetFilters.plan_id;
    if (targetFilters.status) params.status = targetFilters.status;
    if (targetFilters.provider) params.provider = targetFilters.provider;

    return params;
  };

  const cambiarSalesFilter = (
    field: keyof SalesFiltersState,
    value: string
  ) => {
    setSalesFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const aplicarFiltrosVentas = () => {
    cargarDashboard(Number(year), Number(month), false, salesFilters, planFilter);
  };

  const limpiarFiltrosVentas = () => {
    const emptyFilters = createEmptySalesFilters();
    setSalesFilters(emptyFilters);
    cargarDashboard(Number(year), Number(month), false, emptyFilters, planFilter);
  };

  const exportarVentasCsv = () => {
    if (filteredSales.length === 0) {
      setError("No hay ventas para exportar con el filtro actual.");
      return;
    }

    const headers = [
      "Fecha",
      "Restaurante",
      "Propietario",
      "Correo propietario",
      "Plan",
      "Proveedor",
      "Estado",
      "Monto MXN",
    ];

    const rows = filteredSales.map((sale) => [
      sale?.created_at || "",
      sale?.restaurant?.trade_name || "Restaurante",
      getSaleOwnerName(sale),
      sale?.restaurant?.owner?.email || "",
      sale?.plan?.name || "Sin plan",
      sale?.provider || "Sin proveedor",
      sale?.status || "Sin estado",
      getRawAmount(sale?.paid_price),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(toCsvValue).join(","))
      .join("\n");

    const planSlug = consultedPlanFilter || "todos";

    const fileName = `clicmenu_ventas_${consultedYear}_${String(
      consultedMonth
    ).padStart(2, "0")}_${planSlug}.csv`;

    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
  };

  const cargarDashboard = async (
    targetYear: number = year,
    targetMonth: number = month,
    silent = false,
    targetFilters: SalesFiltersState = salesFilters,
    targetPlanFilter: string = planFilter
  ) => {
    try {
      if (!silent) setLoading(true);
      setError("");

      const salesParams = buildSalesParams(
        targetYear,
        targetMonth,
        targetFilters,
        targetPlanFilter
      );

      const [dashboardResponse, monthlySalesResponse, salesSummaryResponse] =
        await Promise.all([
          clicMenuService.dashboard({
            year: targetYear,
            month: targetMonth,
            per_page: 15,
            ...(targetPlanFilter && targetPlanFilter !== "todos"
              ? {
                  plan: targetPlanFilter,
                  plan_filter: targetPlanFilter,
                  plan_slug: targetPlanFilter,
                  plan_type: targetPlanFilter,
                  plan_key: targetPlanFilter,
                  plan_id: getPlanFilterId(targetPlanFilter),
                  subscription_type:
                    targetPlanFilter === "demo" ? "demo" : "paid",
                }
              : {}),
          }),
          clicMenuService.monthlySales(salesParams),
          clicMenuService.salesSummary(salesParams),
        ]);

      setDashboard({
        ...dashboardResponse.data,
        monthly_sales: monthlySalesResponse.data,
        sales_summary: salesSummaryResponse.data,
      });
      setConsultedYear(targetYear);
      setConsultedMonth(targetMonth);
      setConsultedPlanFilter(targetPlanFilter);
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
      setSubscriptionHistory([]);
      setSelectedRestaurantId(null);
      setRestaurantSearch("");
      setBranchSearch("");

      const response = await clicMenuService.restaurants(ownerId, {
        per_page: 50,
      });

      const data = getArray<Restaurant>(response.data);
      setRestaurants(data);

      if (data.length === 1) {
        const onlyRestaurant = data[0];
        setSelectedRestaurantId(onlyRestaurant.id);

        await cargarDetalleRestaurante(
          ownerId,
          onlyRestaurant.id,
          onlyRestaurant.active_subscription || null
        );
      }
    } catch (err: any) {
      setError(getErrorMessage(err, "No fue posible cargar restaurantes."));
    } finally {
      setLoadingDetail(false);
    }
  };

  const cargarDetalleRestaurante = async (
    ownerId: number,
    restaurantId: number,
    fallbackSubscription: any = null
  ) => {
    try {
      setLoadingDetail(true);
      setError("");
      setBranches([]);
      setCurrentSubscription(fallbackSubscription);
      setBranchSearch("");
      setSubscriptionHistory([]);

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
        const subscription = getObject(subscriptionResponse.value.data);
        setCurrentSubscription(subscription || fallbackSubscription);
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
    setSubscriptionHistory([]);
    setSubscriptionModalOpen(false);
    setOwnerSearch("");
    setRestaurantSearch("");
    setBranchSearch("");

    const emptyFilters = createEmptySalesFilters();
    setSalesFilters(emptyFilters);

    cargarDashboard(targetYear, targetMonth, false, emptyFilters, planFilter);
  };

  const seleccionarOwner = (ownerId: number) => {
    setSelectedOwnerId(ownerId);
    cargarRestaurantes(ownerId);
  };

  const seleccionarRestaurante = (restaurantId: number) => {
    setSelectedRestaurantId(restaurantId);

    const restaurant = restaurants.find((item) => item.id === restaurantId);

    if (selectedOwnerId) {
      cargarDetalleRestaurante(
        selectedOwnerId,
        restaurantId,
        restaurant?.active_subscription || null
      );
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
        setSubscriptionHistory([]);
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
        setSubscriptionHistory([]);
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


  const abrirBranchLogo = (branch: Branch) => {
    if (!selectedOwnerId || !selectedRestaurantId) {
      setError("Selecciona un restaurante antes de gestionar el logo.");
      return;
    }

    setBranchLogoTarget(branch);
    setBranchLogoError("");
    setBranchLogoModalOpen(true);
  };

  const cerrarBranchLogoModal = () => {
    if (branchLogoSaving) return;

    setBranchLogoModalOpen(false);
    setBranchLogoTarget(null);
    setBranchLogoError("");
  };

  const subirBranchLogo = async (file: File) => {
    if (!selectedOwnerId || !selectedRestaurantId || !branchLogoTarget) {
      setBranchLogoError("No hay sucursal seleccionada.");
      return;
    }

    try {
      setBranchLogoSaving(true);
      setBranchLogoError("");
      setError("");

      await clicMenuService.uploadBranchLogo(
        selectedOwnerId,
        selectedRestaurantId,
        branchLogoTarget.id,
        file
      );

      await cargarDetalleRestaurante(selectedOwnerId, selectedRestaurantId);

      setBranchLogoModalOpen(false);
      setBranchLogoTarget(null);
    } catch (err: any) {
      setBranchLogoError(
        getErrorMessage(err, "No fue posible subir el logo de la sucursal.")
      );
    } finally {
      setBranchLogoSaving(false);
    }
  };

  const eliminarBranchLogoActivo = async () => {
    if (!selectedOwnerId || !selectedRestaurantId || !branchLogoTarget) {
      setBranchLogoError("No hay sucursal seleccionada.");
      return;
    }

    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar el logo activo de ${
        branchLogoTarget.name || "esta sucursal"
      }?`
    );

    if (!confirmed) return;

    try {
      setBranchLogoSaving(true);
      setBranchLogoError("");
      setError("");

      await clicMenuService.deleteBranchLogo(
        selectedOwnerId,
        selectedRestaurantId,
        branchLogoTarget.id
      );

      await cargarDetalleRestaurante(selectedOwnerId, selectedRestaurantId);

      setBranchLogoModalOpen(false);
      setBranchLogoTarget(null);
    } catch (err: any) {
      setBranchLogoError(
        getErrorMessage(err, "No fue posible eliminar el logo de la sucursal.")
      );
    } finally {
      setBranchLogoSaving(false);
    }
  };


  const cargarHistorialSuscripciones = async (
    ownerId: number,
    restaurantId: number
  ) => {
    try {
      setSubscriptionLoading(true);
      setSubscriptionError("");

      const response = await clicMenuService.subscriptions(ownerId, restaurantId, {
        per_page: 50,
      });

      setSubscriptionHistory(getArray<any>(response.data));
    } catch (err: any) {
      setSubscriptionError(
        getErrorMessage(err, "No fue posible cargar el historial de suscripciones.")
      );
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const abrirSubscriptionModal = async () => {
    if (!selectedOwnerId || !selectedRestaurantId) {
      setError("Selecciona un restaurante antes de gestionar suscripciones.");
      return;
    }

    setSubscriptionError("");
    setSubscriptionModalOpen(true);

    await cargarHistorialSuscripciones(selectedOwnerId, selectedRestaurantId);
  };

  const cerrarSubscriptionModal = () => {
    if (subscriptionSaving) return;

    setSubscriptionModalOpen(false);
    setSubscriptionError("");
  };

  const guardarSubscription = async (payload: SubscriptionPayload) => {
    if (!selectedOwnerId || !selectedRestaurantId) {
      setSubscriptionError("No hay restaurante seleccionado.");
      return;
    }

    try {
      setSubscriptionSaving(true);
      setSubscriptionError("");
      setError("");

      await clicMenuService.createSubscription(
        selectedOwnerId,
        selectedRestaurantId,
        payload
      );

      await cargarDetalleRestaurante(selectedOwnerId, selectedRestaurantId);
      await cargarHistorialSuscripciones(selectedOwnerId, selectedRestaurantId);
      await cargarDashboard(consultedYear, consultedMonth, true);
    } catch (err: any) {
      setSubscriptionError(
        getErrorMessage(err, "No fue posible asignar la suscripción.")
      );
    } finally {
      setSubscriptionSaving(false);
    }
  };

  const terminarSubscriptionActual = async () => {
    if (!selectedOwnerId || !selectedRestaurantId) {
      setSubscriptionError("No hay restaurante seleccionado.");
      return;
    }

    if (!currentSubscription) {
      setSubscriptionError("Este restaurante no tiene una suscripción vigente.");
      return;
    }

    const confirmed = window.confirm(
      "¿Seguro que deseas terminar la suscripción actual de este restaurante?"
    );

    if (!confirmed) return;

    try {
      setSubscriptionSaving(true);
      setSubscriptionError("");
      setError("");

      await clicMenuService.expireCurrentSubscription(
        selectedOwnerId,
        selectedRestaurantId
      );

      setCurrentSubscription(null);
      await cargarDetalleRestaurante(selectedOwnerId, selectedRestaurantId);
      await cargarHistorialSuscripciones(selectedOwnerId, selectedRestaurantId);
      await cargarDashboard(consultedYear, consultedMonth, true);
    } catch (err: any) {
      setSubscriptionError(
        getErrorMessage(err, "No fue posible terminar la suscripción actual.")
      );
      setError(getErrorMessage(err, "No fue posible terminar la suscripción actual."));
    } finally {
      setSubscriptionSaving(false);
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
              value={formatMoney(visibleSalesSummary?.total_sales)}
              subtitle="Total vendido en el periodo"
              money
            />
          </Grid>
        </Grid>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, md: 2 },
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" fontWeight={900}>
                Consultar información
              </Typography>
              <Typography color="text.secondary">
                Filtra el periodo de ventas y suscripciones.
              </Typography>
            </Box>

            <Grid container spacing={1.5} alignItems="center">
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="Año"
                  size="small"
                  type="number"
                  value={year}
                  onChange={(event) => setYear(Number(event.target.value))}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2.2}>
                <TextField
                  fullWidth
                  label="Mes"
                  select
                  size="small"
                  value={month}
                  onChange={(event) => setMonth(Number(event.target.value))}
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
              </Grid>

              <Grid item xs={12} sm={8} md={5.2}>
                <TextField
                  fullWidth
                  label="Plan"
                  select
                  size="small"
                  value={planFilter}
                  onChange={(event) => setPlanFilter(event.target.value)}
                >
                  {planFilters.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={4} md={2.6}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={consultar}
                  sx={{
                    minHeight: 40,
                    px: 2,
                    borderRadius: 2.5,
                    fontWeight: 900,
                    whiteSpace: "nowrap",
                    textTransform: "none",
                  }}
                >
                  Consultar
                </Button>
              </Grid>
            </Grid>

            <Typography variant="body2" color="text.secondary">
              Plan consultado:{" "}
              <Typography component="span" fontWeight={900} color="text.primary">
                {getPlanFilterLabel(consultedPlanFilter)}
              </Typography>
            </Typography>

            <Grid container spacing={1.5} alignItems="stretch">
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="Suscripciones"
                  value={visibleSalesSummary?.total_subscriptions ?? 0}
                  subtitle="Total suscripciones"
                  icon={<SubscriptionsIcon />}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="Pagadas"
                  value={visibleSalesSummary?.paid_subscriptions ?? 0}
                  subtitle="Suscripciones pagadas"
                  icon={<PaymentsIcon />}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="Demos"
                  value={visibleSalesSummary?.demo_subscriptions ?? 0}
                  subtitle="Suscripciones demo"
                  icon={<StorefrontIcon />}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="Total vendido"
                  value={formatMoney(visibleSalesSummary?.total_sales)}
                  subtitle="Total en el periodo"
                  icon={<PaymentsIcon />}
                />
              </Grid>
            </Grid>
          </Stack>
        </Paper>

        <Grid container spacing={2} alignItems="stretch">
          <Grid item xs={12}>
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

          <Grid item xs={12} md={6}>
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
                `${restaurant.contact_phone || "Sin teléfono"} · ${
                  restaurant.branches_count ?? 0
                } sucursal(es)`
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

          <Grid item xs={12} md={6}>
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
                extraActions={(branch) => (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      abrirBranchLogo(branch);
                    }}
                    disabled={!selectedRestaurantId}
                    sx={{
                      height: 26,
                      px: 1,
                      minWidth: 48,
                      borderRadius: 2,
                      fontSize: 11,
                      fontWeight: 900,
                    }}
                  >
                    Logo
                  </Button>
                )}
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
                onManage={abrirSubscriptionModal}
                onExpireCurrent={currentSubscription ? terminarSubscriptionActual : undefined}
                expiring={subscriptionSaving}
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
          totalSales={monthlySalesByPlan.length}
          salesFilters={salesFilters}
          ownerOptions={owners}
          restaurantOptions={restaurants}
          onSalesFilterChange={cambiarSalesFilter}
          onApplyFilters={aplicarFiltrosVentas}
          onClearFilters={limpiarFiltrosVentas}
          onExportCsv={exportarVentasCsv}
          exportDisabled={filteredSales.length === 0}
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

      <SubscriptionDialog
        open={subscriptionModalOpen}
        restaurantName={selectedRestaurant?.trade_name || ""}
        currentSubscription={currentSubscription}
        subscriptions={subscriptionHistory}
        error={subscriptionError}
        saving={subscriptionSaving}
        loading={subscriptionLoading}
        onClose={cerrarSubscriptionModal}
        onSubmit={guardarSubscription}
        onExpireCurrent={terminarSubscriptionActual}
        onReload={() => {
          if (selectedOwnerId && selectedRestaurantId) {
            cargarHistorialSuscripciones(selectedOwnerId, selectedRestaurantId);
          }
        }}
      />

      <BranchLogoDialog
        open={branchLogoModalOpen}
        branch={branchLogoTarget}
        error={branchLogoError}
        saving={branchLogoSaving}
        onClose={cerrarBranchLogoModal}
        onUpload={subirBranchLogo}
        onDeleteActive={eliminarBranchLogoActivo}
      />
    </Box>
  );
}
