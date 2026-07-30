import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  alpha,
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
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

import Swal from "sweetalert2";

import axiosClient from "../../../services/axiosClient";

import {
  asignarCodigoEspecial,
  createUser,
  deleteUser,
  updateUser,
} from "../../../services/superadminService";

import DatosFiscalesUsuarioModal from "./DatosFiscalesUsuarioModal";

type Usuario = {
  id: number;
  name: string;
  apellidos?: string | null;
  email: string;
  phone?: string | null;
  codigo_ref?: string | null;
  aplica_comision?: boolean | number | string | null;
  role: number | string;
  role_label?: string;
  activo?: boolean;
};

type PaginationState = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
};

type Summary = {
  total_usuarios: number;
  usuarios_activos: number;
  rol_usuario: number;
  rol_superadministrador: number;
};

type FormState = {
  name: string;
  apellidos: string;
  email: string;
  phone: string;
  role: string;
  password: string;
  codigo_ref: string;
};

type CodigoEspecialState = {
  user: Usuario | null;
  codigo_ref: string;
  aplica_comision: boolean;
};

const ROLE_OPTIONS = [
  { value: "1", label: "Usuario" },
  { value: "2", label: "Administrador" },
  { value: "3", label: "Superadministrador" },
];

const INITIAL_FORM: FormState = {
  name: "",
  apellidos: "",
  email: "",
  phone: "",
  role: "1",
  password: "",
  codigo_ref: "",
};

const INITIAL_CODIGO_ESPECIAL: CodigoEspecialState = {
  user: null,
  codigo_ref: "",
  aplica_comision: true,
};

const INITIAL_PAGINATION: PaginationState = {
  current_page: 1,
  last_page: 1,
  per_page: 16,
  total: 0,
  from: null,
  to: null,
};

const INITIAL_SUMMARY: Summary = {
  total_usuarios: 0,
  usuarios_activos: 0,
  rol_usuario: 0,
  rol_superadministrador: 0,
};

function normalizeRoleValue(role: unknown): string {
  const value = String(role ?? "")
    .trim()
    .toLowerCase();

  if (
    value === "1" ||
    value === "usuario" ||
    value === "user"
  ) {
    return "1";
  }

  if (
    value === "2" ||
    value === "administrador" ||
    value === "admin"
  ) {
    return "2";
  }

  if (
    value === "3" ||
    value === "superadministrador" ||
    value === "superadmin" ||
    value === "super_admin"
  ) {
    return "3";
  }

  return "1";
}

function getRoleName(role: unknown): string {
  switch (normalizeRoleValue(role)) {
    case "1":
      return "Usuario";
    case "2":
      return "Administrador";
    case "3":
      return "SAdministrador";
    default:
      return "Sin rol";
  }
}

function getErrorMessage(error: any): string {
  const errors = error?.response?.data?.errors;

  if (errors && typeof errors === "object") {
    const first = Object.values(errors)
      .flat()
      .find(Boolean);

    if (first) {
      return String(first);
    }
  }

  return (
    error?.response?.data?.message ||
    error?.message ||
    "Ocurrió un error inesperado."
  );
}

function getInitials(user: Usuario): string {
  const name = String(user.name || "").trim();
  const lastName = String(user.apellidos || "").trim();

  const first = name.charAt(0);
  const second = lastName.charAt(0);

  return `${first}${second}`.toUpperCase() || "U";
}

function hasReferralCode(user: Usuario): boolean {
  return String(user.codigo_ref ?? "").trim() !== "";
}

function userAppliesCommission(user: Usuario): boolean {
  const value = user.aplica_comision;

  const commissionEnabled =
    value === true ||
    value === 1 ||
    value === "1" ||
    String(value).toLowerCase() === "true";

  /*
   * Un usuario sin código de referencia no puede generar
   * comisión, aunque aplica_comision tenga true por defecto.
   */
  return (
    hasReferralCode(user) &&
    commissionEnabled
  );
}

function normalizeSpecialCode(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 12);
}

type NormalizedUsersResponse = {
  items: Usuario[];
  pagination: PaginationState;
  summary: Summary;
};

function sortUsersAlphabetically(
  items: Usuario[]
): Usuario[] {
  return [...items].sort((a, b) => {
    const nameA = `${a.name || ""} ${a.apellidos || ""}`.trim();
    const nameB = `${b.name || ""} ${b.apellidos || ""}`.trim();

    return nameA.localeCompare(nameB, "es", {
      sensitivity: "base",
      numeric: true,
    });
  });
}

function normalizeUsersResponse(
  rawResponse: any,
  fallbackPage: number,
  fallbackPerPage: number
): NormalizedUsersResponse {
  const root = rawResponse ?? {};

  /*
   * Formato nuevo:
   * {
   *   data: [...],
   *   current_page,
   *   total,
   *   summary
   * }
   *
   * Formato Laravel paginado:
   * {
   *   data: {
   *     data: [...],
   *     current_page,
   *     total
   *   },
   *   summary
   * }
   */
  const paginator =
    root?.data &&
    !Array.isArray(root.data) &&
    typeof root.data === "object"
      ? root.data
      : root;

  const rawItems = Array.isArray(root.data)
    ? root.data
    : Array.isArray(paginator?.data)
    ? paginator.data
    : Array.isArray(root.users)
    ? root.users
    : [];

  const normalizedItems: Usuario[] = rawItems.map(
    (item: Usuario) => ({
      ...item,
      aplica_comision: userAppliesCommission(item),
    })
  );

  const items = sortUsersAlphabetically(
    normalizedItems
  );

  const total =
    Number(
      paginator?.total ??
        root?.total ??
        items.length
    ) || 0;

  const currentPage =
    Number(
      paginator?.current_page ??
        root?.current_page ??
        fallbackPage
    ) || 1;

  const perPage =
    Number(
      paginator?.per_page ??
        root?.per_page ??
        fallbackPerPage
    ) || fallbackPerPage;

  const calculatedFrom =
    items.length > 0
      ? (currentPage - 1) * perPage + 1
      : 0;

  const calculatedTo =
    items.length > 0
      ? Math.min(
          calculatedFrom + items.length - 1,
          total
        )
      : 0;

  const summarySource =
    root?.summary ??
    paginator?.summary ??
    {};

  return {
    items,
    pagination: {
      current_page: currentPage,
      last_page:
        Number(
          paginator?.last_page ??
            root?.last_page ??
            Math.max(
              Math.ceil(total / perPage),
              1
            )
        ) || 1,
      per_page: perPage,
      total,
      from:
        Number(
          paginator?.from ??
            root?.from ??
            calculatedFrom
        ) || 0,
      to:
        Number(
          paginator?.to ??
            root?.to ??
            calculatedTo
        ) || 0,
    },
    summary: {
      total_usuarios:
        Number(
          summarySource?.total_usuarios ??
            total
        ) || 0,
      usuarios_activos:
        Number(
          summarySource?.usuarios_activos
        ) || 0,
      rol_usuario:
        Number(
          summarySource?.rol_usuario
        ) || 0,
      rol_superadministrador:
        Number(
          summarySource
            ?.rol_superadministrador
        ) || 0,
    },
  };
}

export default function Usuarios() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(
    theme.breakpoints.down("md")
  );

  const [usuarios, setUsuarios] =
    useState<Usuario[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [page, setPage] =
    useState(1);

  const [perPage] =
    useState(16);

  const [pagination, setPagination] =
    useState<PaginationState>(
      INITIAL_PAGINATION
    );

  const [summary, setSummary] =
    useState<Summary>(
      INITIAL_SUMMARY
    );

  const [searchInput, setSearchInput] =
    useState("");

  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("");

  const [openCreate, setOpenCreate] =
    useState(false);

  const [openEdit, setOpenEdit] =
    useState(false);

  const [openFiscal, setOpenFiscal] =
    useState(false);

  const [fiscalUser, setFiscalUser] =
    useState<Usuario | null>(null);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<FormState>(
      INITIAL_FORM
    );

  const [
    openCodigoEspecial,
    setOpenCodigoEspecial,
  ] = useState(false);

  const [
    codigoEspecialForm,
    setCodigoEspecialForm,
  ] = useState<CodigoEspecialState>(
    INITIAL_CODIGO_ESPECIAL
  );

  const [
    savingCodigoEspecial,
    setSavingCodigoEspecial,
  ] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(
        searchInput.trim()
      );
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter]);

  const cargarUsuarios = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await axiosClient.get(
          "/superadmin/users",
          {
            params: {
              page,
              per_page: perPage,
              search:
                debouncedSearch ||
                undefined,
              role:
                roleFilter ||
                undefined,
            },
          }
        );

        const normalized =
          normalizeUsersResponse(
            response.data,
            page,
            perPage
          );

        setUsuarios(normalized.items);
        setPagination(
          normalized.pagination
        );
        setSummary(normalized.summary);
      } catch (error) {
        console.error(error);

        Swal.fire(
          "Error",
          getErrorMessage(error),
          "error"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      page,
      perPage,
      debouncedSearch,
      roleFilter,
    ]
  );

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
  };

  const handleFormChange = (
    event: React.ChangeEvent<
      HTMLInputElement
    >
  ) => {
    const { name, value } =
      event.target;

    setForm((current) => ({
      ...current,
      [name]:
        name === "phone"
          ? value
              .replace(/\D/g, "")
              .slice(0, 10)
          : value,
    }));
  };

  const validateForm = (
    mode: "create" | "edit"
  ) => {
    if (!form.name.trim()) {
      Swal.fire(
        "Validación",
        "El nombre es obligatorio.",
        "warning"
      );
      return false;
    }

    if (!form.email.trim()) {
      Swal.fire(
        "Validación",
        "El correo es obligatorio.",
        "warning"
      );
      return false;
    }

    if (
      form.phone &&
      form.phone.length !== 10
    ) {
      Swal.fire(
        "Validación",
        "El teléfono debe tener 10 dígitos.",
        "warning"
      );
      return false;
    }

    if (
      mode === "create" &&
      form.password.length < 8
    ) {
      Swal.fire(
        "Validación",
        "La contraseña debe tener mínimo 8 caracteres.",
        "warning"
      );
      return false;
    }

    if (
      mode === "edit" &&
      form.password.trim() !== "" &&
      form.password.length < 8
    ) {
      Swal.fire(
        "Validación",
        "La nueva contraseña debe tener mínimo 8 caracteres.",
        "warning"
      );
      return false;
    }

    return true;
  };

  const handleCreate = async () => {
    if (!validateForm("create")) {
      return;
    }

    try {
      await createUser({
        name: form.name.trim(),
        apellidos:
          form.apellidos.trim(),
        email:
          form.email.trim(),
        phone:
          form.phone.trim(),
        codigo_ref: null,
        role: Number(form.role),
        password: form.password,
      });

      await Swal.fire(
        "Usuario creado",
        "El usuario se registró correctamente.",
        "success"
      );

      setOpenCreate(false);
      resetForm();

      if (page !== 1) {
        setPage(1);
      } else {
        cargarUsuarios();
      }
    } catch (error) {
      console.error(error);

      Swal.fire(
        "Error",
        getErrorMessage(error),
        "error"
      );
    }
  };
  const openFiscalModal = (
    user: Usuario
  ) => {
    setFiscalUser(user);
    setOpenFiscal(true);
  };

  const closeFiscalModal = () => {
    setOpenFiscal(false);
    setFiscalUser(null);
  };

  const openEditModal = (
    user: Usuario
  ) => {
    setEditingId(user.id);

    setForm({
      name: user.name || "",
      apellidos:
        user.apellidos || "",
      email: user.email || "",
      phone: user.phone || "",
      codigo_ref:
        user.codigo_ref || "",
      role:
        normalizeRoleValue(
          user.role
        ),
      password: "",
    });

    setOpenEdit(true);
  };

  const handleUpdate = async () => {
    if (
      !editingId ||
      !validateForm("edit")
    ) {
      return;
    }

    try {
      const payload: Record<
        string,
        unknown
      > = {
        name: form.name.trim(),
        apellidos:
          form.apellidos.trim(),
        email:
          form.email.trim(),
        phone:
          form.phone.trim(),
        role: Number(form.role),
      };

      if (form.password.trim()) {
        payload.password =
          form.password;
      }

      await updateUser(
        editingId,
        payload
      );

      await Swal.fire(
        "Usuario actualizado",
        "Los cambios se guardaron correctamente.",
        "success"
      );

      setOpenEdit(false);
      resetForm();
      cargarUsuarios();
    } catch (error) {
      console.error(error);

      Swal.fire(
        "Error",
        getErrorMessage(error),
        "error"
      );
    }
  };

  const openCodigoEspecialModal = (
    user: Usuario
  ) => {
    setCodigoEspecialForm({
      user,
      codigo_ref: String(
        user.codigo_ref ?? ""
      )
        .trim()
        .toUpperCase(),
      aplica_comision:
        userAppliesCommission(user),
    });

    setOpenCodigoEspecial(true);
  };

  const closeCodigoEspecialModal = () => {
    if (savingCodigoEspecial) {
      return;
    }

    setOpenCodigoEspecial(false);
    setCodigoEspecialForm(
      INITIAL_CODIGO_ESPECIAL
    );
  };

  const handleCodigoEspecialChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCodigoEspecialForm((current) => ({
      ...current,
      codigo_ref: normalizeSpecialCode(
        event.target.value
      ),
    }));
  };

  const handleAsignarCodigoEspecial =
    async () => {
      const user =
        codigoEspecialForm.user;

      const codigo =
        normalizeSpecialCode(
          codigoEspecialForm.codigo_ref
        );

      if (!user) {
        return;
      }

      if (!codigo) {
        await Swal.fire(
          "Validación",
          "Ingresa el código especial.",
          "warning"
        );
        return;
      }

      if (!/^[A-Z0-9]{1,12}$/.test(codigo)) {
        await Swal.fire(
          "Validación",
          "El código debe contener únicamente letras y números, con máximo 12 caracteres.",
          "warning"
        );
        return;
      }

      setSavingCodigoEspecial(true);

      try {
        const response =
          await asignarCodigoEspecial(
            user.id,
            {
              codigo_ref: codigo,
              aplica_comision:
                codigoEspecialForm
                  .aplica_comision,
            }
          );

        setUsuarios((current) =>
          current.map((item) =>
            item.id === user.id
              ? {
                  ...item,
                  codigo_ref:
                    response?.codigo_ref ??
                    codigo,
                  aplica_comision:
                    response
                      ?.aplica_comision ??
                    codigoEspecialForm
                      .aplica_comision,
                  activo: true,
                }
              : item
          )
        );

        setOpenCodigoEspecial(false);
        setCodigoEspecialForm(
          INITIAL_CODIGO_ESPECIAL
        );

        await Swal.fire(
          "Código asignado",
          response?.message ||
            "El código especial se guardó correctamente.",
          "success"
        );

        await cargarUsuarios();
      } catch (error) {
        console.error(error);

        await Swal.fire(
          "Error",
          getErrorMessage(error),
          "error"
        );
      } finally {
        setSavingCodigoEspecial(false);
      }
    };

  const handleDelete = async (
    user: Usuario
  ) => {
    const result = await Swal.fire({
      title: "¿Eliminar usuario?",
      text: `${user.name} ${
        user.apellidos || ""
      } será eliminado.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText:
        "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor:
        theme.palette.error.main,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await deleteUser(user.id);

      await Swal.fire(
        "Usuario eliminado",
        "El usuario se eliminó correctamente.",
        "success"
      );

      if (
        usuarios.length === 1 &&
        page > 1
      ) {
        setPage((current) =>
          Math.max(current - 1, 1)
        );
      } else {
        cargarUsuarios();
      }
    } catch (error) {
      console.error(error);

      Swal.fire(
        "Error",
        getErrorMessage(error),
        "error"
      );
    }
  };

  const metricCards = useMemo(
    () => [
      {
        title: "Total usuarios",
        value:
          summary.total_usuarios,
        subtitle:
          "100% del sistema",
        icon: <GroupsOutlinedIcon />,
        color:
          theme.palette.primary.main,
      },
      {
        title: "Usuarios activos",
        value:
          summary.usuarios_activos,
        subtitle:
          "Con código de referido",
        icon: <LinkOutlinedIcon />,
        color:
          theme.palette.success.main,
      },
      {
        title: "Rol usuario",
        value:
          summary.rol_usuario,
        subtitle:
          "Usuarios con rol Usuario",
        icon: <PersonOutlineIcon />,
        color:
          theme.palette.warning.main,
      },
      {
        title:
          "Rol superadministrador",
        value:
          summary
            .rol_superadministrador,
        subtitle:
          "Usuarios con rol Superadministrador",
        icon:
          <AdminPanelSettingsOutlinedIcon />,
        color:
          theme.palette.secondary.main,
      },
    ],
    [summary, theme]
  );

  const visibleFrom =
    usuarios.length > 0
      ? (pagination.current_page - 1) *
          pagination.per_page +
        1
      : 0;

  const visibleTo =
    usuarios.length > 0
      ? Math.min(
          visibleFrom +
            usuarios.length -
            1,
          pagination.total
        )
      : 0;

  const renderFormFields = (
    mode: "create" | "edit"
  ) => (
    <Stack spacing={1.5} mt={1}>
      <TextField
        name="name"
        label="Nombre"
        value={form.name}
        onChange={handleFormChange}
        fullWidth
        required
        autoComplete="off"
      />

      <TextField
        name="apellidos"
        label="Apellidos"
        value={form.apellidos}
        onChange={handleFormChange}
        fullWidth
        autoComplete="off"
      />

      <TextField
        name="email"
        label="Correo electrónico"
        type="email"
        value={form.email}
        onChange={handleFormChange}
        fullWidth
        required
        autoComplete="new-email"
      />

      <TextField
        name="phone"
        label="Teléfono"
        value={form.phone}
        onChange={handleFormChange}
        fullWidth
        inputProps={{
          inputMode: "numeric",
          maxLength: 10,
        }}
        helperText="Máximo 10 dígitos."
      />

      <TextField
        select
        name="role"
        label="Rol"
        value={form.role}
        onChange={handleFormChange}
        fullWidth
        required
      >
        {ROLE_OPTIONS.map(
          (option) => (
            <MenuItem
              key={option.value}
              value={option.value}
            >
              {option.label}
            </MenuItem>
          )
        )}
      </TextField>

      {mode === "create" && (
        <TextField
          name="password"
          label="Contraseña"
          type="password"
          value={form.password}
          onChange={handleFormChange}
          fullWidth
          required
          autoComplete="new-password"
          helperText="Mínimo 8 caracteres."
        />
      )}

      {mode === "edit" && (
        <>
          <TextField
            name="password"
            label="Nueva contraseña"
            type="password"
            value={form.password}
            onChange={handleFormChange}
            fullWidth
            autoComplete="new-password"
            helperText="Déjala vacía para conservar la contraseña actual. Mínimo 8 caracteres."
          />

          <TextField
            label="Código de referido"
            value={
              form.codigo_ref || "-"
            }
            fullWidth
            disabled
            helperText="El código se conserva y no se modifica desde este formulario."
          />
        </>
      )}
    </Stack>
  );

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        pb: {
          xs: 2,
          md: 4,
        },
      }}
    >
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        alignItems={{
          xs: "stretch",
          sm: "center",
        }}
        justifyContent="space-between"
        spacing={2}
        mb={2.5}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={900}
            sx={{
              fontSize: {
                xs: 28,
                md: 34,
              },
            }}
          >
            Usuarios
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.4,
              fontSize: {
                xs: 13,
                md: 14,
              },
            }}
          >
            Gestiona y administra los usuarios del sistema.
          </Typography>
        </Box>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1}
        >
          <Button
            variant="outlined"
            startIcon={
              refreshing
                ? (
                  <CircularProgress
                    size={17}
                  />
                )
                : <RefreshIcon />
            }
            disabled={refreshing}
            onClick={() =>
              cargarUsuarios(true)
            }
          >
            Actualizar
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setOpenCreate(true);
            }}
          >
            Crear usuario
          </Button>
        </Stack>
      </Stack>

      <Grid
        container
        spacing={{
          xs: 1.5,
          md: 2,
        }}
        mb={2.5}
      >
        {metricCards.map((metric) => (
          <Grid
            item
            xs={6}
            lg={3}
            key={metric.title}
          >
            <Card
              variant="outlined"
              sx={{
                height: "100%",
                borderRadius: 3,
                borderColor: alpha(
                  metric.color,
                  isDark
                    ? 0.22
                    : 0.14
                ),
                background: `linear-gradient(
                  145deg,
                  ${alpha(
                    metric.color,
                    isDark
                      ? 0.11
                      : 0.055
                  )},
                  ${theme.palette.background.paper} 55%
                )`,
                boxShadow: isDark
                  ? "0 12px 30px rgba(0,0,0,.18)"
                  : "0 12px 30px rgba(15,23,42,.05)",
              }}
            >
              <CardContent
                sx={{
                  p: {
                    xs: 1.5,
                    sm: 2,
                  },
                  "&:last-child": {
                    pb: {
                      xs: 1.5,
                      sm: 2,
                    },
                  },
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.25}
                  alignItems="center"
                >
                  <Avatar
                    sx={{
                      width: {
                        xs: 36,
                        sm: 42,
                      },
                      height: {
                        xs: 36,
                        sm: 42,
                      },
                      bgcolor: alpha(
                        metric.color,
                        0.14
                      ),
                      color:
                        metric.color,
                    }}
                  >
                    {metric.icon}
                  </Avatar>

                  <Box minWidth={0}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        lineHeight: 1.25,
                      }}
                    >
                      {metric.title}
                    </Typography>

                    <Typography
                      fontWeight={950}
                      sx={{
                        fontSize: {
                          xs: 22,
                          sm: 27,
                        },
                        lineHeight: 1.1,
                      }}
                    >
                      {metric.value}
                    </Typography>
                  </Box>
                </Stack>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    mt: 1.2,
                    lineHeight: 1.35,
                  }}
                >
                  {metric.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper
        variant="outlined"
        sx={{
          p: {
            xs: 1.5,
            md: 2,
          },
          mb: 2,
          borderRadius: 3,
        }}
      >
        <Grid
          container
          spacing={1.5}
          alignItems="center"
        >
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              size="small"
              value={searchInput}
              placeholder="Buscar por nombre, correo, teléfono o referencia"
              onChange={(event) =>
                setSearchInput(
                  event.target.value
                )
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      fontSize="small"
                    />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Filtrar por rol"
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(
                  event.target.value
                )
              }
            >
              <MenuItem value="">
                Todos los roles
              </MenuItem>

              {ROLE_OPTIONS.map(
                (option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </MenuItem>
                )
              )}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box
          minHeight={260}
          display="grid"
          sx={{ placeItems: "center" }}
        >
          <CircularProgress />
        </Box>
      ) : isMobile ? (
        <Stack spacing={1.5}>
          {usuarios.map(
            (user, index) => {
              const number =
                (
                  pagination
                    .current_page -
                  1
                ) *
                  pagination.per_page +
                index +
                1;

              const active =
                hasReferralCode(user);

              return (
                <Card
                  key={user.id}
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                  }}
                >
                  <CardContent
                    sx={{
                      p: 2,
                      "&:last-child": {
                        pb: 2,
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="flex-start"
                      spacing={1.5}
                    >
                      <Avatar
                        sx={{
                          bgcolor:
                            "primary.main",
                          fontWeight: 900,
                        }}
                      >
                        {getInitials(user)}
                      </Avatar>

                      <Box
                        flex={1}
                        minWidth={0}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          spacing={1}
                        >
                          <Box minWidth={0}>
                            <Typography
                              fontWeight={900}
                              noWrap
                            >
                              {number}.{" "}
                              {user.name}{" "}
                              {user.apellidos}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              noWrap
                            >
                              {user.email}
                            </Typography>
                          </Box>

                          <Chip
                            size="small"
                            label={
                              active
                                ? "Activo"
                                : "Sin referido"
                            }
                            color={
                              active
                                ? "success"
                                : "default"
                            }
                          />
                        </Stack>

                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          useFlexGap
                          mt={1.5}
                        >
                          <Chip
                            size="small"
                            label={getRoleName(
                              user.role
                            )}
                            color={
                              normalizeRoleValue(
                                user.role
                              ) === "3"
                                ? "secondary"
                                : "primary"
                            }
                            variant="outlined"
                          />

                          <Chip
                            size="small"
                            label={
                              user.codigo_ref
                                ? `Ref: ${user.codigo_ref}`
                                : "Sin referencia"
                            }
                            variant="outlined"
                          />

                          <Chip
                            size="small"
                            label={
                              userAppliesCommission(
                                user
                              )
                                ? "Comisión activa"
                                : "Comisión desactivada"
                            }
                            color={
                              userAppliesCommission(
                                user
                              )
                                ? "success"
                                : "warning"
                            }
                            variant="outlined"
                          />
                        </Stack>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          mt={1.5}
                        >
                          Teléfono:{" "}
                          {user.phone || "-"}
                        </Typography>

                        <Stack
                          spacing={1}
                          mt={2}
                        >
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={
                              <DescriptionOutlinedIcon />
                            }
                            onClick={() =>
                              openFiscalModal(
                                user
                              )
                            }
                          >
                            Datos fiscales
                          </Button>

                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={
                              <VpnKeyOutlinedIcon />
                            }
                            onClick={() =>
                              openCodigoEspecialModal(
                                user
                              )
                            }
                          >
                            Asignar código especial
                          </Button>

                          <Stack
                            direction="row"
                            spacing={1}
                          >
                            <Button
                              fullWidth
                              variant="outlined"
                              startIcon={
                                <EditOutlinedIcon />
                              }
                              onClick={() =>
                                openEditModal(
                                  user
                                )
                              }
                            >
                              Editar
                            </Button>

                            <Button
                              fullWidth
                              color="error"
                              variant="outlined"
                              startIcon={
                                <DeleteOutlineIcon />
                              }
                              onClick={() =>
                                handleDelete(
                                  user
                                )
                              }
                            >
                              Eliminar
                            </Button>
                          </Stack>
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              );
            }
          )}
          {usuarios.length === 0 && (
            <Paper
              variant="outlined"
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: 3,
              }}
            >
              <Typography
                color="text.secondary"
              >
                No se encontraron usuarios.
              </Typography>
            </Paper>
          )}
        </Stack>
      ) : (
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{
            width: "100%",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <Table
            stickyHeader
            size="small"
            sx={{
              width: "100%",
              tableLayout: "fixed",
              "& .MuiTableCell-root": {
                px: {
                  md: 0.7,
                  lg: 0.9,
                },
                py: 0.75,
                fontSize: {
                  md: 11.2,
                  lg: 12.2,
                },
                overflow: "hidden",
                verticalAlign: "middle",
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    width: "4%",
                    fontWeight: 900,
                  }}
                >
                  #
                </TableCell>

                <TableCell
                  sx={{
                    width: "26%",
                    fontWeight: 900,
                  }}
                >
                  Usuario
                </TableCell>

                <TableCell
                  sx={{
                    width: "25%",
                    fontWeight: 900,
                  }}
                >
                  Contacto / teléfono
                </TableCell>

                <TableCell
                  sx={{
                    width: "13%",
                    fontWeight: 900,
                  }}
                >
                  Rol
                </TableCell>

                <TableCell
                  sx={{
                    width: "20%",
                    fontWeight: 900,
                  }}
                >
                  Referencia / comisión
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    width: "12%",
                    fontWeight: 900,
                  }}
                >
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {usuarios.map(
                (user, index) => {
                  const number =
                    (
                      pagination
                        .current_page -
                      1
                    ) *
                      pagination
                        .per_page +
                    index +
                    1;

                  const active =
                    hasReferralCode(user);

                  return (
                    <TableRow
                      key={user.id}
                      hover
                    >
                      <TableCell
                        sx={{
                          fontWeight: 850,
                        }}
                      >
                        {number}
                      </TableCell>

                      <TableCell
                        sx={{
                          whiteSpace: "normal",
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                        >
                          <Avatar
                            sx={{
                              width: 34,
                              height: 34,
                              flexShrink: 0,
                              bgcolor: alpha(
                                theme.palette
                                  .primary
                                  .main,
                                0.15
                              ),
                              color:
                                "primary.main",
                              fontSize: 13,
                              fontWeight: 900,
                            }}
                          >
                            {getInitials(
                              user
                            )}
                          </Avatar>

                          <Typography
                            variant="body2"
                            fontWeight={850}
                            title={`${user.name || ""} ${user.apellidos || ""}`.trim()}
                            sx={{
                              minWidth: 0,
                              whiteSpace: "normal",
                              overflowWrap: "anywhere",
                              lineHeight: 1.3,
                            }}
                          >
                            {`${user.name || ""} ${
                              user.apellidos || ""
                            }`.trim()}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell
                        sx={{
                          whiteSpace: "normal",
                        }}
                      >
                        <Stack
                          spacing={0.25}
                          minWidth={0}
                        >
                          <Typography
                            variant="body2"
                            title={user.email}
                            sx={{
                              minWidth: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              lineHeight: 1.25,
                            }}
                          >
                            {user.email}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            title={user.phone || "-"}
                            sx={{
                              display: "block",
                              lineHeight: 1.2,
                              fontWeight: 750,
                            }}
                          >
                            {user.phone || "-"}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell
                        sx={{
                          overflow: "visible",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Chip
                          size="small"
                          label={getRoleName(
                            user.role
                          )}
                          color={
                            normalizeRoleValue(
                              user.role
                            ) === "3"
                              ? "secondary"
                              : normalizeRoleValue(
                                  user.role
                                ) === "2"
                              ? "warning"
                              : "primary"
                          }
                          variant="outlined"
                          sx={{
                            height: 24,
                            maxWidth: "100%",
                            fontWeight: 800,
                            fontSize: {
                              md: 9.3,
                              lg: 10.1,
                            },
                            "& .MuiChip-label": {
                              px: 0.8,
                              overflow: "visible",
                              textOverflow: "clip",
                              whiteSpace: "nowrap",
                            },
                          }}
                        />
                      </TableCell>

                      <TableCell
                        sx={{
                          overflow: "visible",
                          whiteSpace: "normal",
                          py: "5px !important",
                        }}
                      >
                        <Stack
                          spacing={0.4}
                          alignItems="flex-start"
                          sx={{
                            minWidth: 0,
                          }}
                        >
                          <Typography
                            variant="caption"
                            title={
                              user.codigo_ref ||
                              "Sin referencia"
                            }
                            sx={{
                              display: "block",
                              width: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              fontFamily:
                                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                              fontWeight: 900,
                              fontSize: {
                                md: 10.1,
                                lg: 10.9,
                              },
                              lineHeight: 1.15,
                              color: user.codigo_ref
                                ? "text.primary"
                                : "text.secondary",
                            }}
                          >
                            {user.codigo_ref ||
                              "Sin referencia"}
                          </Typography>

                          <Chip
                            size="small"
                            label={
                              userAppliesCommission(
                                user
                              )
                                ? "Comisión activa"
                                : "Comisión desactivada"
                            }
                            color={
                              userAppliesCommission(
                                user
                              )
                                ? "success"
                                : "default"
                            }
                            variant="outlined"
                            sx={{
                              height: 21,
                              width: "max-content",
                              maxWidth: "100%",
                              fontWeight: 850,
                              fontSize: {
                                md: 9.1,
                                lg: 9.8,
                              },
                              "& .MuiChip-label": {
                                px: 0.8,
                                overflow: "visible",
                                textOverflow: "clip",
                                whiteSpace: "nowrap",
                              },
                            }}
                          />
                        </Stack>
                      </TableCell>

                      <TableCell
                        align="center"
                        sx={{
                          overflow: "visible",
                          whiteSpace: "nowrap",
                          px: "1px !important",
                        }}
                      >
                        <Box
                          sx={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexWrap: "nowrap",
                            gap: 0.05,
                          }}
                        >
                          <Tooltip title="Datos fiscales">
                            <IconButton
                              size="small"
                              color="info"
                              sx={{ p: 0.4 }}
                              onClick={() =>
                                openFiscalModal(
                                  user
                                )
                              }
                            >
                              <DescriptionOutlinedIcon
                                fontSize="small"
                              />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Asignar código especial">
                          <IconButton
                            size="small"
                            color="secondary"
                            sx={{ p: 0.4 }}
                            onClick={() =>
                              openCodigoEspecialModal(
                                user
                              )
                            }
                          >
                            <VpnKeyOutlinedIcon
                              fontSize="small"
                            />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Editar usuario">
                          <IconButton
                            size="small"
                            color="primary"
                            sx={{ p: 0.4 }}
                            onClick={() =>
                              openEditModal(
                                user
                              )
                            }
                          >
                            <EditOutlinedIcon
                              fontSize="small"
                            />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Eliminar usuario">
                          <IconButton
                            size="small"
                            color="error"
                            sx={{ p: 0.4 }}
                            onClick={() =>
                              handleDelete(
                                user
                              )
                            }
                          >
                            <DeleteOutlineIcon
                              fontSize="small"
                            />
                          </IconButton>
                        </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                }
              )}

              {usuarios.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{
                      py: 6,
                      color:
                        "text.secondary",
                    }}
                  >
                    No se encontraron usuarios.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!loading && (
        <Paper
          variant="outlined"
          sx={{
            mt: 1.5,
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
            px={{
              xs: 1.5,
              sm: 2,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              py={{
                xs: 1,
                sm: 0,
              }}
            >
              Mostrando {visibleFrom} a{" "}
              {visibleTo} de{" "}
              {pagination.total} usuarios
            </Typography>

            <TablePagination
              component="div"
              count={
                pagination.total ||
                summary.total_usuarios
              }
              page={Math.max(
                pagination
                  .current_page - 1,
                0
              )}
              onPageChange={(
                _event,
                nextPage
              ) =>
                setPage(
                  nextPage + 1
                )
              }
              rowsPerPage={
                pagination.per_page
              }
              rowsPerPageOptions={[
                perPage,
              ]}
              labelRowsPerPage=""
              labelDisplayedRows={() =>
                ""
              }
              sx={{
                border: 0,
                "& .MuiTablePagination-toolbar":
                  {
                    minHeight: 52,
                    px: 0,
                  },
                "& .MuiTablePagination-spacer":
                  {
                    display: "none",
                  },
                "& .MuiTablePagination-selectLabel":
                  {
                    display: "none",
                  },
                "& .MuiTablePagination-select":
                  {
                    display: "none",
                  },
                "& .MuiTablePagination-displayedRows":
                  {
                    display: "none",
                  },
              }}
            />
          </Stack>
        </Paper>
      )}
      <DatosFiscalesUsuarioModal
        open={openFiscal}
        usuario={fiscalUser}
        onClose={closeFiscalModal}
      />

      <Dialog
        open={openCodigoEspecial}
        onClose={
          savingCodigoEspecial
            ? undefined
            : closeCodigoEspecialModal
        }
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          Código especial
        </DialogTitle>

        <DialogContent>
          <Stack
            spacing={2}
            mt={1}
          >
            <Box>
              <Typography fontWeight={850}>
                {codigoEspecialForm.user?.name}{" "}
                {codigoEspecialForm.user?.apellidos}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                El código se guardará en mayúsculas,
                debe ser único y puede tener hasta
                12 caracteres.
              </Typography>
            </Box>

            <TextField
              autoFocus
              fullWidth
              label="Código especial"
              value={
                codigoEspecialForm.codigo_ref
              }
              onChange={
                handleCodigoEspecialChange
              }
              inputProps={{
                maxLength: 12,
              }}
              helperText={`${
                codigoEspecialForm.codigo_ref.length
              }/12 caracteres. Solo letras y números.`}
              placeholder="EJEMPLO2026"
              disabled={
                savingCodigoEspecial
              }
            />

            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                borderRadius: 2.5,
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={
                      codigoEspecialForm
                        .aplica_comision
                    }
                    onChange={(
                      _event,
                      checked
                    ) =>
                      setCodigoEspecialForm(
                        (current) => ({
                          ...current,
                          aplica_comision:
                            checked,
                        })
                      )
                    }
                    disabled={
                      savingCodigoEspecial
                    }
                  />
                }
                label={
                  codigoEspecialForm
                    .aplica_comision
                    ? "Aplica comisión"
                    : "Sin comisión"
                }
              />

              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                ml={1}
              >
                La comisión está activa por defecto.
                Desactívala únicamente cuando el
                código no deba generar comisión.
              </Typography>
            </Paper>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={
              closeCodigoEspecialModal
            }
            disabled={
              savingCodigoEspecial
            }
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            startIcon={
              savingCodigoEspecial
                ? (
                  <CircularProgress
                    size={16}
                    color="inherit"
                  />
                )
                : (
                  <VpnKeyOutlinedIcon />
                )
            }
            onClick={
              handleAsignarCodigoEspecial
            }
            disabled={
              savingCodigoEspecial ||
              !codigoEspecialForm.codigo_ref
            }
          >
            {savingCodigoEspecial
              ? "Guardando"
              : "Asignar código"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openCreate}
        onClose={() =>
          setOpenCreate(false)
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Crear usuario
        </DialogTitle>

        <DialogContent>
          {renderFormFields(
            "create"
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setOpenCreate(false)
            }
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={handleCreate}
          >
            Crear usuario
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openEdit}
        onClose={() =>
          setOpenEdit(false)
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Editar usuario
        </DialogTitle>

        <DialogContent>
          {renderFormFields(
            "edit"
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setOpenEdit(false)
            }
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={handleUpdate}
          >
            Guardar cambios
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}