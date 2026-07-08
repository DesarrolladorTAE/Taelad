import { useEffect, useState, type ReactNode } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
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

import SearchIcon from "@mui/icons-material/Search";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloseIcon from "@mui/icons-material/Close";

export type Owner = {
  id: number;
  name?: string;
  last_name_paternal?: string;
  last_name_maternal?: string | null;
  email?: string;
  phone?: string;
  status?: string;
  restaurants_count?: number;
};

export type Restaurant = {
  id: number;
  owner_user_id?: number;
  main_branch_id?: number | null;
  trade_name?: string;
  description?: string;
  contact_phone?: string;
  contact_email?: string;
  status?: string;
  registered_at?: string;
  created_at?: string;
  updated_at?: string;
  branches_count?: number;
  owner?: any;
  settings?: any;
  active_subscription?: any;
};

export type Branch = {
  id: number;
  name?: string;
  address?: string;
  phone?: string;
  open_time?: string;
  close_time?: string;
  status?: string;
  logo_url?: string | null;
  active_logo?: any;
  logo?: any;
  branch_logo?: any;
};

export type OwnerFormState = {
  name: string;
  last_name_paternal: string;
  last_name_maternal: string;
  email: string;
  phone: string;
  password: string;
  status: string;
};

export type RestaurantPayload = {
  trade_name: string;
  description?: string;
  contact_phone?: string;
  contact_email?: string;
  status?: string;
};

export type BranchPayload = {
  name: string;
  address?: string;
  phone?: string;
  open_time?: string;
  close_time?: string;
  status?: string;
};

export type SubscriptionPayload = {
  plan_id: number | string;
  provider?: string;
  provider_ref?: string;
  months_paid?: number | string;
  months_granted?: number | string;
  paid_price?: number | string;
  auto_renew?: boolean;
  meta?: Record<string, any>;
};

export type SalesFiltersState = {
  q: string;
  owner_id: string;
  restaurant_id: string;
  plan_id: string;
  status: string;
  provider: string;
};

function cleanText(value?: string | null) {
  return String(value || "").trim();
}

function formatMoney(value: any) {
  return Number(value || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

const CLICMENU_PLAN_LABELS_BY_ID: Record<string, string> = {
  "1": "Plan Demo",
  "2": "Plan Digital",
  "3": "Plan Gestión",
  "4": "Plan Total",
};

function getPlanLabelFromSale(sale: any) {
  const planName =
    sale?.plan?.name ||
    sale?.plan_name ||
    sale?.subscription?.plan?.name ||
    sale?.subscription?.plan_name ||
    sale?.current_subscription?.plan?.name ||
    sale?.current_subscription?.plan_name;

  if (planName) return planName;

  const planId =
    sale?.plan_id ||
    sale?.plan?.id ||
    sale?.subscription?.plan_id ||
    sale?.subscription?.plan?.id ||
    sale?.current_subscription?.plan_id ||
    sale?.current_subscription?.plan?.id;

  return CLICMENU_PLAN_LABELS_BY_ID[String(planId || "")] || "Sin plan";
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



function isSubscriptionActive(subscription: any) {
  if (!subscription) return false;

  if (subscription.cancelled_at) return false;

  const status = String(subscription.status || "").toLowerCase();

  if (["expired", "cancelled", "canceled", "inactive"].includes(status)) {
    return false;
  }

  const endDateValue = subscription.ends_at || subscription.expires_at;

  if (!endDateValue) {
    return ["active", "trialing", "paid"].includes(status);
  }

  const endDate = new Date(endDateValue);

  if (Number.isNaN(endDate.getTime())) {
    return ["active", "trialing", "paid"].includes(status);
  }

  return endDate.getTime() >= Date.now();
}

function getSubscriptionStatusForChip(subscription: any) {
  if (!subscription) return "sin estado";

  return isSubscriptionActive(subscription)
    ? subscription?.status || "sin estado"
    : "expired";
}

function getBranchLogoUrl(branch?: Branch | null) {
  return (
    branch?.logo_url ||
    branch?.active_logo?.url ||
    branch?.active_logo?.image_url ||
    branch?.active_logo?.full_url ||
    branch?.logo?.url ||
    branch?.logo?.image_url ||
    branch?.branch_logo?.url ||
    branch?.branch_logo?.image_url ||
    null
  );
}

function StatusChip({ value }: { value?: string }) {
  const normalized = value || "sin estado";

  const chipSx = {
    height: 24,
    maxWidth: 86,
    fontWeight: 900,
    "& .MuiChip-label": {
      px: 1,
      fontSize: 11,
      fontWeight: 900,
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
  };

  if (normalized === "active") {
    return <Chip size="small" label="Activo" color="success" sx={chipSx} />;
  }

  if (normalized === "inactive") {
    return <Chip size="small" label="Inactivo" color="default" sx={chipSx} />;
  }

  if (normalized === "trialing") {
    return <Chip size="small" label="Demo" color="warning" sx={chipSx} />;
  }

  if (normalized === "expired") {
    return <Chip size="small" label="Vencido" color="error" sx={chipSx} />;
  }

  if (normalized === "cancelled") {
    return <Chip size="small" label="Cancelado" color="default" sx={chipSx} />;
  }

  if (normalized === "paid") {
    return <Chip size="small" label="Pagada" color="success" sx={chipSx} />;
  }

  return <Chip size="small" label={normalized} color="default" sx={chipSx} />;
}

export function SummaryCard({
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
          width: 50,
          height: 50,
          flexShrink: 0,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          "& svg": {
            fontSize: 24,
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
            fontSize: money ? 20 : 25,
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

export function MetricCard({
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

export function EntityListCard<T>({
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
  extraActions,
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
  extraActions?: (item: T) => ReactNode;
  leadingIcon?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        height: "100%",
        minHeight: 360,
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
              fontSize: 20,
              lineHeight: 1.15,
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
                height: 24,
                fontWeight: 900,
                flexShrink: 0,
                "& .MuiChip-label": {
                  px: 1,
                  fontSize: 12,
                },
              }}
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
                height: 40,
                borderRadius: 3,
                bgcolor: "background.default",
              },
              "& input": {
                fontSize: 14,
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
                borderRadius: 3,
                fontWeight: 900,
                px: 1.5,
                minWidth: 96,
                flexShrink: 0,
                whiteSpace: "nowrap",
                boxShadow: 2,
              }}
            >
              Nuevo
            </Button>
          )}
        </Stack>

        <Stack
  spacing={1}
  sx={(theme) => ({
    flex: 1,
    minHeight: 0,
    maxHeight: 320,
    overflowY: "auto",
    pr: 0.5,

    scrollbarWidth: "thin",
    scrollbarColor:
      theme.palette.mode === "dark"
        ? "#334155 transparent"
        : "#CBD5E1 transparent",

    "&::-webkit-scrollbar": {
      width: 8,
      height: 8,
    },

    "&::-webkit-scrollbar-track": {
      background: "transparent",
      borderRadius: 8,
    },

    "&::-webkit-scrollbar-thumb": {
      backgroundColor:
        theme.palette.mode === "dark" ? "#334155" : "#CBD5E1",
      borderRadius: 8,
      border: "2px solid transparent",
      backgroundClip: "padding-box",
    },

    "&::-webkit-scrollbar-thumb:hover": {
      backgroundColor:
        theme.palette.mode === "dark" ? "#475569" : "#94A3B8",
    },
  })}
>
          {items.length === 0 && (
            <Box
              sx={{
                minHeight: 120,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Typography color="text.secondary" sx={{ fontSize: 15 }}>
                {emptyText}
              </Typography>
            </Box>
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
                  p: 1.4,
                  borderRadius: 4,
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
                      width: 44,
                      height: 44,
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
                        fontSize: 14,
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
                          mt: 0.25,
                          fontSize: 12.5,
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
                          fontSize: 12.5,
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
                    spacing={0.35}
                    alignItems="center"
                    sx={{ flexShrink: 0 }}
                  >
                    {status && <StatusChip value={status} />}

                    {extraActions?.(item)}

                    {onEdit && (
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            onEdit(item);
                          }}
                          sx={{
                            width: 28,
                            height: 28,
                          }}
                        >
                          <EditIcon sx={{ fontSize: 17 }} />
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
                          sx={{
                            width: 28,
                            height: 28,
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                    )}

                    {onSelect && (
                      <ArrowForwardIosIcon
                        sx={{ fontSize: 13, color: "text.secondary" }}
                      />
                    )}
                  </Stack>
                </Stack>
              </Paper>
            );
          })}
        </Stack>

        {footer && (
          <Box
            sx={{
              pt: 0.5,
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            {footer}
          </Box>
        )}
      </Stack>
    </Paper>
  );
}

export function SubscriptionCard({
  selectedRestaurantId,
  currentSubscription,
  onManage,
  onExpireCurrent,
  expiring = false,
}: {
  selectedRestaurantId: number | null;
  currentSubscription: any;
  onManage?: () => void;
  onExpireCurrent?: () => void;
  expiring?: boolean;
}) {
  const subscriptionIsActive = isSubscriptionActive(currentSubscription);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        overflow: "hidden",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={1}
        mb={1.5}
      >
        <Typography
          variant="h6"
          fontWeight={900}
          sx={{
            fontSize: 18,
            lineHeight: 1.15,
          }}
        >
          {subscriptionIsActive
            ? "Suscripción actual"
            : currentSubscription
            ? "Última suscripción registrada"
            : "Suscripción actual"}
        </Typography>

        {selectedRestaurantId && onManage && (
          <Button
            variant="outlined"
            size="small"
            onClick={onManage}
            sx={{
              height: 32,
              borderRadius: 2,
              fontWeight: 900,
              whiteSpace: "nowrap",
            }}
          >
            Gestionar
          </Button>
        )}
      </Stack>

      {!selectedRestaurantId && (
        <Typography color="text.secondary" sx={{ fontSize: 14 }}>
          Selecciona un restaurante para consultar la suscripción.
        </Typography>
      )}

      {selectedRestaurantId && !currentSubscription && (
        <Typography color="text.secondary" sx={{ fontSize: 14 }}>
          No se encontró una suscripción vigente.
        </Typography>
      )}

      {currentSubscription && (
        <Stack spacing={1.5}>
          <Grid container spacing={1.3}>
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
                value={<StatusChip value={getSubscriptionStatusForChip(currentSubscription)} />}
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

          {onExpireCurrent && subscriptionIsActive && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={onExpireCurrent}
              disabled={expiring}
              sx={{
                alignSelf: "flex-start",
                height: 32,
                borderRadius: 2,
                fontWeight: 900,
              }}
            >
              {expiring ? "Terminando..." : "Terminar suscripción"}
            </Button>
          )}
        </Stack>
      )}
    </Paper>
  );
}

export function SalesTableCard({
  title,
  sales,
  totalSales,
  salesFilters,
  ownerOptions,
  restaurantOptions,
  onSalesFilterChange,
  onApplyFilters,
  onClearFilters,
}: {
  title: string;
  sales: any[];
  totalSales: number;
  salesFilters: SalesFiltersState;
  ownerOptions: Owner[];
  restaurantOptions: Restaurant[];
  onSalesFilterChange: (field: keyof SalesFiltersState, value: string) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  onExportCsv?: () => void;
  exportDisabled?: boolean;
}) {
  const getOwnerLabel = (owner: Owner) => {
    return (
      [owner.name, owner.last_name_paternal, owner.last_name_maternal]
        .filter(Boolean)
        .join(" ") || `Propietario #${owner.id}`
    );
  };

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
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight={900}>
          {title}
        </Typography>

        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.default",
          }}
        >
          <Stack spacing={1.5}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", md: "center" }}
              spacing={1}
            >
              <Box>
                <Typography fontWeight={900}>Filtros avanzados</Typography>
                <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                  Filtra las ventas por propietario, restaurante, estado o proveedor.
                </Typography>
              </Box>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button
                  variant="contained"
                  onClick={onApplyFilters}
                  sx={{ height: 38, borderRadius: 2, fontWeight: 900 }}
                >
                  Aplicar filtros
                </Button>

                <Button
                  variant="outlined"
                  onClick={onClearFilters}
                  sx={{ height: 38, borderRadius: 2, fontWeight: 900 }}
                >
                  Limpiar
                </Button>
              </Stack>
            </Stack>

            <Grid container spacing={1.5}>
              <Grid item xs={12} md={4}>
                <TextField
                  size="small"
                  label="Buscar"
                  placeholder="Restaurante o propietario..."
                  value={salesFilters.q}
                  onChange={(event) =>
                    onSalesFilterChange("q", event.target.value)
                  }
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  size="small"
                  label="Propietario"
                  select
                  value={salesFilters.owner_id}
                  onChange={(event) =>
                    onSalesFilterChange("owner_id", event.target.value)
                  }
                  fullWidth
                >
                  <MenuItem value="">Todos</MenuItem>
                  {ownerOptions.map((owner) => (
                    <MenuItem key={owner.id} value={String(owner.id)}>
                      {getOwnerLabel(owner)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  size="small"
                  label="Restaurante"
                  select
                  value={salesFilters.restaurant_id}
                  onChange={(event) =>
                    onSalesFilterChange("restaurant_id", event.target.value)
                  }
                  fullWidth
                  helperText={
                    restaurantOptions.length === 0
                      ? "Selecciona un propietario para listar restaurantes."
                      : "Restaurantes cargados del propietario seleccionado."
                  }
                >
                  <MenuItem value="">Todos</MenuItem>
                  {restaurantOptions.map((restaurant) => (
                    <MenuItem key={restaurant.id} value={String(restaurant.id)}>
                      {restaurant.trade_name || `Restaurante #${restaurant.id}`}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  size="small"
                  label="Estado"
                  select
                  value={salesFilters.status}
                  onChange={(event) =>
                    onSalesFilterChange("status", event.target.value)
                  }
                  fullWidth
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="active">Activo</MenuItem>
                  <MenuItem value="trialing">Demo</MenuItem>
                  <MenuItem value="paid">Pagada</MenuItem>
                  <MenuItem value="expired">Vencido</MenuItem>
                  <MenuItem value="cancelled">Cancelado</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  size="small"
                  label="Proveedor"
                  select
                  value={salesFilters.provider}
                  onChange={(event) =>
                    onSalesFilterChange("provider", event.target.value)
                  }
                  fullWidth
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="demo">demo</MenuItem>
                  <MenuItem value="manual">manual</MenuItem>
                  <MenuItem value="internal">internal</MenuItem>
                  <MenuItem value="transfer">transfer</MenuItem>
                  <MenuItem value="paypal">paypal</MenuItem>
                  <MenuItem value="stripe">stripe</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Stack>
        </Paper>

        {totalSales === 0 && (
          <Typography color="text.secondary" sx={{ py: 1 }}>
            No hay ventas registradas en el periodo o con los filtros aplicados.
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

                    <TableCell>{getPlanLabelFromSale(sale)}</TableCell>

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
      </Stack>
    </Paper>
  );
}

export function OwnerFormDialog({
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

export function RestaurantFormDialog({
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

export function BranchFormDialog({
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


type BillingCycle = "monthly" | "semiannual" | "annual";

type ClicMenuPlanOption = {
  id: string;
  name: string;
  monthlyPrice: number;
  description: string;
};

type ClicMenuBillingOption = {
  value: BillingCycle;
  label: string;
  subtitle: string;
  monthsPaid: number;
  monthsGranted: number;
  amountLabel: string;
};

const CLICMENU_PLAN_OPTIONS: ClicMenuPlanOption[] = [
  {
    id: "1",
    name: "Plan Demo",
    monthlyPrice: 0,
    description: "Acceso demo de prueba. No debe sumarse como venta pagada.",
  },
  {
    id: "2",
    name: "Plan Digital",
    monthlyPrice: 290,
    description: "Para cafeterías, food trucks o pequeños locales con una sola sucursal.",
  },
  {
    id: "3",
    name: "Plan Gestión",
    monthlyPrice: 590,
    description: "Para restaurantes que fabrican platillos y requieren controlar almacén.",
  },
  {
    id: "4",
    name: "Plan Total",
    monthlyPrice: 950,
    description: "Para cadenas de restaurantes o negocios en expansión.",
  },
];

const CLICMENU_BILLING_OPTIONS: ClicMenuBillingOption[] = [
  {
    value: "monthly",
    label: "Mensual",
    subtitle: "Pagas 1 mes",
    monthsPaid: 1,
    monthsGranted: 1,
    amountLabel: "MXN / mes",
  },
  {
    value: "semiannual",
    label: "Semestral",
    subtitle: "Pagas 5 y recibes 6",
    monthsPaid: 5,
    monthsGranted: 6,
    amountLabel: "MXN / semestre",
  },
  {
    value: "annual",
    label: "Anual",
    subtitle: "Pagas 10 y recibes 12",
    monthsPaid: 10,
    monthsGranted: 12,
    amountLabel: "MXN / año",
  },
];

function getSubscriptionQuote(planId: string, billingCycle: string) {
  const plan =
    CLICMENU_PLAN_OPTIONS.find((item) => item.id === String(planId)) ||
    CLICMENU_PLAN_OPTIONS[0];

  const cycle =
    CLICMENU_BILLING_OPTIONS.find((item) => item.value === billingCycle) ||
    CLICMENU_BILLING_OPTIONS[0];

  const paidPrice = plan.monthlyPrice * cycle.monthsPaid;

  return {
    plan,
    cycle,
    paidPrice,
    monthsPaid: cycle.monthsPaid,
    monthsGranted: cycle.monthsGranted,
  };
}

export function SubscriptionDialog({
  open,
  restaurantName,
  currentSubscription,
  subscriptions,
  error,
  saving,
  loading,
  onClose,
  onSubmit,
  onExpireCurrent,
  onReload,
}: {
  open: boolean;
  restaurantName?: string;
  currentSubscription: any;
  subscriptions: any[];
  error: string;
  saving: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (payload: SubscriptionPayload) => void;
  onExpireCurrent: () => void;
  onReload: () => void;
}) {
  const subscriptionIsActive = isSubscriptionActive(currentSubscription);

  const [form, setForm] = useState({
    plan_id: "2",
    billing_cycle: "monthly" as BillingCycle,
    provider: "manual",
    provider_ref: "",
    auto_renew: "false",
    payment_method: "transferencia",
    notes: "Pago registrado desde sistema externo",
  });

  useEffect(() => {
    if (!open) return;

    setForm({
      plan_id: "2",
      billing_cycle: "monthly",
      provider: "manual",
      provider_ref: "",
      auto_renew: "false",
      payment_method: "transferencia",
      notes: "Pago registrado desde sistema externo",
    });
  }, [open]);

  const quote = getSubscriptionQuote(form.plan_id, form.billing_cycle);

  const submit = () => {
    const payload: SubscriptionPayload = {
      plan_id: Number(form.plan_id),
      provider: cleanText(form.provider) || "manual",
      provider_ref: cleanText(form.provider_ref),
      months_paid: quote.monthsPaid,
      months_granted: quote.monthsGranted,
      paid_price: quote.paidPrice,
      auto_renew: form.auto_renew === "true",
      meta: {
        payment_method: cleanText(form.payment_method),
        notes: cleanText(form.notes),
        billing_cycle: form.billing_cycle,
        billing_label: quote.cycle.label,
        billing_description: quote.cycle.subtitle,
        plan_name: quote.plan.name,
        calculated_price: quote.paidPrice,
      },
    };

    if (!payload.provider_ref) delete payload.provider_ref;
    if (!payload.meta?.payment_method) delete payload.meta!.payment_method;
    if (!payload.meta?.notes) delete payload.meta!.notes;

    onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={900} fontSize={20}>
              Gestionar suscripción
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {restaurantName || "Restaurante seleccionado"}
            </Typography>
          </Box>

          <IconButton onClick={onClose} disabled={saving}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2.5 }}>
        <Stack spacing={2.5}>
          {error && <Alert severity="error">{error}</Alert>}

          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.default",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              spacing={1.5}
              mb={1.5}
            >
              <Typography fontWeight={900}>
                {subscriptionIsActive
                  ? "Suscripción vigente"
                  : currentSubscription
                  ? "Última suscripción registrada"
                  : "Suscripción vigente"}
              </Typography>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={onReload}
                  disabled={saving || loading}
                  sx={{ borderRadius: 2, fontWeight: 900 }}
                >
                  Actualizar
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  onClick={onExpireCurrent}
                  disabled={saving || !subscriptionIsActive}
                  sx={{ borderRadius: 2, fontWeight: 900 }}
                >
                  Terminar actual
                </Button>
              </Stack>
            </Stack>

            {!currentSubscription && (
              <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                No hay suscripción vigente. Puedes asignar una nueva desde el formulario.
              </Typography>
            )}

            {currentSubscription && (
              <Grid container spacing={1.3}>
                <Grid item xs={12} sm={4}>
                  <InfoRow
                    label="Plan"
                    value={
                      currentSubscription?.plan?.name ||
                      currentSubscription?.plan_name ||
                      "Sin plan"
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <InfoRow
                    label="Estado"
                    value={<StatusChip value={getSubscriptionStatusForChip(currentSubscription)} />}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <InfoRow
                    label="Vence"
                    value={formatDate(
                      currentSubscription?.ends_at || currentSubscription?.expires_at
                    )}
                  />
                </Grid>
              </Grid>
            )}

            {currentSubscription && !subscriptionIsActive && (
              <Alert severity="info" sx={{ mt: 1.5 }}>
                La última suscripción registrada ya venció o no está activa.
                Puedes asignar una nueva suscripción sin terminar la anterior.
              </Alert>
            )}
          </Paper>

          <Box>
            <Typography fontWeight={900} mb={1}>
              Asignar nueva suscripción
            </Typography>

            {subscriptionIsActive && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Este restaurante ya tiene una suscripción vigente. Para evitar error de la API,
                primero termina la suscripción actual y después asigna la nueva.
              </Alert>
            )}

            <Box
              component="form"
              id="subscription-form"
              autoComplete="off"
              onSubmit={(event) => {
                event.preventDefault();
                submit();
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Plan"
                    select
                    value={form.plan_id}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, plan_id: event.target.value }))
                    }
                    fullWidth
                    disabled={saving}
                    helperText={quote.plan.description}
                  >
                    {CLICMENU_PLAN_OPTIONS.map((plan) => (
                      <MenuItem key={plan.id} value={plan.id}>
                        {plan.name} - {formatMoney(plan.monthlyPrice)} MXN / mes
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Periodo de pago"
                    select
                    value={form.billing_cycle}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        billing_cycle: event.target.value as BillingCycle,
                      }))
                    }
                    fullWidth
                    disabled={saving}
                    helperText={quote.cycle.subtitle}
                  >
                    {CLICMENU_BILLING_OPTIONS.map((cycle) => (
                      <MenuItem key={cycle.value} value={cycle.value}>
                        {cycle.label} - {cycle.subtitle}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.default",
                      overflow: "hidden",
                    }}
                  >
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} sm={3}>
                        <InfoRow label="Plan seleccionado" value={quote.plan.name} />
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <InfoRow label="Periodo" value={quote.cycle.label} />
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <InfoRow
                          label="Meses pagados"
                          value={`${quote.monthsPaid} mes(es)`}
                        />
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <InfoRow
                          label="Meses otorgados"
                          value={`${quote.monthsGranted} mes(es)`}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Divider />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography color="text.secondary" sx={{ fontSize: 12 }}>
                          Monto calculado automáticamente
                        </Typography>
                        <Typography
                          fontWeight={900}
                          sx={{
                            mt: 0.3,
                            fontSize: { xs: 26, sm: 32 },
                            lineHeight: 1,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatMoney(quote.paidPrice)}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography color="text.secondary" sx={{ fontSize: 12 }}>
                          Condición
                        </Typography>
                        <Typography fontWeight={900} sx={{ mt: 0.3 }}>
                          {quote.cycle.subtitle}
                        </Typography>
                        <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                          {quote.cycle.amountLabel}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Proveedor"
                    select
                    value={form.provider}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, provider: event.target.value }))
                    }
                    fullWidth
                    disabled={saving}
                  >
                    <MenuItem value="manual">manual</MenuItem>
                    <MenuItem value="internal">internal</MenuItem>
                    <MenuItem value="transfer">transfer</MenuItem>
                    <MenuItem value="paypal">paypal</MenuItem>
                    <MenuItem value="stripe">stripe</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Referencia"
                    value={form.provider_ref}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        provider_ref: event.target.value,
                      }))
                    }
                    fullWidth
                    disabled={saving}
                    autoComplete="off"
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Auto renovación"
                    select
                    value={form.auto_renew}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, auto_renew: event.target.value }))
                    }
                    fullWidth
                    disabled={saving}
                  >
                    <MenuItem value="false">No</MenuItem>
                    <MenuItem value="true">Sí</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Método de pago"
                    value={form.payment_method}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        payment_method: event.target.value,
                      }))
                    }
                    fullWidth
                    disabled={saving}
                    autoComplete="off"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Notas"
                    value={form.notes}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, notes: event.target.value }))
                    }
                    fullWidth
                    disabled={saving}
                    autoComplete="off"
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>

          <Box>
            <Typography fontWeight={900} mb={1}>
              Historial de suscripciones
            </Typography>

            {loading && (
              <Typography color="text.secondary" sx={{ py: 1 }}>
                Cargando historial...
              </Typography>
            )}

            {!loading && subscriptions.length === 0 && (
              <Typography color="text.secondary" sx={{ py: 1 }}>
                No hay historial para mostrar.
              </Typography>
            )}

            {!loading && subscriptions.length > 0 && (
              <Box sx={{ overflowX: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Plan</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Proveedor</TableCell>
                      <TableCell>Inicio</TableCell>
                      <TableCell>Vence</TableCell>
                      <TableCell align="right">Monto</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {subscriptions.map((subscription, index) => (
                      <TableRow key={subscription?.id || index} hover>
                        <TableCell>
                          {subscription?.plan?.name ||
                            subscription?.plan_name ||
                            "Sin plan"}
                        </TableCell>
                        <TableCell>
                          <StatusChip value={subscription?.status} />
                        </TableCell>
                        <TableCell>{subscription?.provider || "--"}</TableCell>
                        <TableCell>{formatDate(subscription?.starts_at)}</TableCell>
                        <TableCell>
                          {formatDate(
                            subscription?.ends_at || subscription?.expires_at
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={900}>
                            {formatMoney(subscription?.paid_price)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={saving}
          sx={{ fontWeight: 800, borderRadius: 2 }}
        >
          Cerrar
        </Button>

        <Button
          variant="contained"
          type="submit"
          form="subscription-form"
          disabled={saving || !cleanText(form.plan_id)}
          sx={{ fontWeight: 800, borderRadius: 2, minWidth: 170 }}
        >
          {saving ? "Guardando..." : "Asignar suscripción"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function BranchLogoDialog({
  open,
  branch,
  error,
  saving,
  onClose,
  onUpload,
  onDeleteActive,
}: {
  open: boolean;
  branch: Branch | null;
  error: string;
  saving: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
  onDeleteActive: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const currentLogoUrl = getBranchLogoUrl(branch);
  const imageUrl = previewUrl || currentLogoUrl;

  useEffect(() => {
    if (!open) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    setFile(null);
    setPreviewUrl(null);
  }, [open, branch?.id]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const submit = () => {
    if (!file) return;
    onUpload(file);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={900} fontSize={20}>
              Logo de sucursal
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              title={branch?.name || "Sucursal"}
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {branch?.name || "Sucursal seleccionada"}
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
          {error && <Alert severity="error">{error}</Alert>}

          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1px dashed",
              borderColor: "divider",
              bgcolor: "background.default",
              minHeight: 210,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {imageUrl ? (
              <Box
                component="img"
                src={imageUrl}
                alt="Logo de sucursal"
                sx={{
                  maxWidth: "100%",
                  maxHeight: 190,
                  objectFit: "contain",
                  borderRadius: 2,
                }}
              />
            ) : (
              <Stack alignItems="center" spacing={1} color="text.secondary">
                <ImageIcon sx={{ fontSize: 48 }} />
                <Typography fontWeight={800}>Sin logo activo</Typography>
                <Typography variant="body2" textAlign="center">
                  Selecciona una imagen para subirla como logo de esta sucursal.
                </Typography>
              </Stack>
            )}
          </Paper>

          {file && (
            <Typography variant="body2" color="text.secondary">
              Archivo seleccionado: <strong>{file.name}</strong>
            </Typography>
          )}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              disabled={saving}
              sx={{ borderRadius: 2, fontWeight: 900 }}
            >
              Seleccionar imagen
              <input
                hidden
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleFileChange}
              />
            </Button>

            <Button
              variant="contained"
              onClick={submit}
              disabled={saving || !file}
              sx={{ borderRadius: 2, fontWeight: 900 }}
            >
              {saving ? "Subiendo..." : "Subir logo"}
            </Button>

            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={onDeleteActive}
              disabled={saving || !branch}
              sx={{ borderRadius: 2, fontWeight: 900 }}
            >
              Eliminar activo
            </Button>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={saving}
          sx={{ fontWeight: 800, borderRadius: 2 }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Stack
      spacing={0.35}
      sx={{
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      <Typography
        color="text.secondary"
        title={label}
        sx={{
          fontSize: 12,
          lineHeight: 1.1,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </Typography>

      <Box
        sx={{
          minWidth: 0,
          fontWeight: 900,
          fontSize: 13,
          lineHeight: 1.15,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          "& .MuiChip-root": {
            height: 22,
            maxWidth: "100%",
          },
          "& .MuiChip-label": {
            px: 1,
            fontSize: 11,
            fontWeight: 900,
          },
        }}
        title={
          typeof value === "string" || typeof value === "number"
            ? String(value)
            : undefined
        }
      >
        {value}
      </Box>
    </Stack>
  );
}
export {};