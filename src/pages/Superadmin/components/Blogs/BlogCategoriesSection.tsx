import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
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

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CategoryIcon from "@mui/icons-material/Category";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import ArticleIcon from "@mui/icons-material/Article";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import {
  blogApi,
  type BlogCategory,
  type BlogCategoryPayload,
} from "../../../../services/api/blogs";

type Props = {
  systemId: number;
  systemName: string;
  blogId: number;
  blogName: string;
  onBack: () => void;
};

type CategoryStatusFilter =
  | "all"
  | "active"
  | "inactive";

type CategoryForm = {
  name: string;
  slug: string;
  description: string;
  parent_id: number | "";
  status: "active" | "inactive";
  sort_order: number;
};

type CategoryFormErrors = {
  name?: string;
  slug?: string;
  sort_order?: string;
  parent_id?: string;
};

type ApiErrorData = {
  message?: string;
  errors?: Record<string, string[] | string>;
};

const EMPTY_FORM: CategoryForm = {
  name: "",
  slug: "",
  description: "",
  parent_id: "",
  status: "active",
  sort_order: 1,
};

function getErrorMessage(
  error: unknown,
  fallback = "No fue posible completar la operación."
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: ApiErrorData;
        };
      }
    ).response;

    const data = response?.data;

    if (data?.errors) {
      const firstError = Object.values(data.errors)[0];

      if (
        Array.isArray(firstError) &&
        firstError.length > 0
      ) {
        return firstError[0];
      }

      if (typeof firstError === "string") {
        return firstError;
      }
    }

    if (data?.message) {
      return data.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function formatDate(value: string | null): string {
  if (!value) {
    return "Sin fecha";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function validateForm(
  form: CategoryForm,
  editingCategory: BlogCategory | null
): CategoryFormErrors {
  const errors: CategoryFormErrors = {};

  if (!form.name.trim()) {
    errors.name =
      "El nombre de la categoría es obligatorio.";
  }

  if (!form.slug.trim()) {
    errors.slug = "El slug es obligatorio.";
  } else if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
      form.slug.trim()
    )
  ) {
    errors.slug =
      "El slug solo puede contener letras minúsculas, números y guiones.";
  }

  if (
    !Number.isInteger(Number(form.sort_order)) ||
    Number(form.sort_order) < 0
  ) {
    errors.sort_order =
      "El orden debe ser un número entero igual o mayor que cero.";
  }

  if (
    editingCategory &&
    form.parent_id === editingCategory.id
  ) {
    errors.parent_id =
      "Una categoría no puede ser su propia categoría padre.";
  }

  return errors;
}

export default function BlogCategoriesSection({
  systemId,
  systemName,
  blogId,
  blogName,
  onBack,
}: Props) {
  const theme = useTheme();

  const isDesktop = useMediaQuery(
    theme.breakpoints.up("md")
  );

  const [categories, setCategories] =
    useState<BlogCategory[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");

  const [status, setStatus] =
    useState<CategoryStatusFilter>("all");

  /*
  |--------------------------------------------------------------------------
  | FORMULARIO
  |--------------------------------------------------------------------------
  */

  const [formOpen, setFormOpen] = useState(false);

  const [editingCategory, setEditingCategory] =
    useState<BlogCategory | null>(null);

  const [form, setForm] =
    useState<CategoryForm>(EMPTY_FORM);

  const [formErrors, setFormErrors] =
    useState<CategoryFormErrors>({});

  const [formError, setFormError] =
    useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  const [slugEdited, setSlugEdited] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | ELIMINACIÓN
  |--------------------------------------------------------------------------
  */

  const [categoryToDelete, setCategoryToDelete] =
    useState<BlogCategory | null>(null);

  const [deleting, setDeleting] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | CONSULTA
  |--------------------------------------------------------------------------
  */

  const loadCategories = useCallback(
    async (selectedPage: number) => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await blogApi.categories(
            systemId,
            blogId,
            {
              page: selectedPage,
              per_page: 16,
            }
          );

        const payload = response.data;

        setCategories(payload.data ?? []);

        setLastPage(
          payload.meta?.last_page ?? 1
        );

        setTotal(payload.meta?.total ?? 0);
      } catch (requestError) {
        setCategories([]);

        setError(
          getErrorMessage(
            requestError,
            "No fue posible consultar las categorías."
          )
        );
      } finally {
        setLoading(false);
      }
    },
    [systemId, blogId]
  );

  useEffect(() => {
    void loadCategories(page);
  }, [loadCategories, page]);

  /*
  |--------------------------------------------------------------------------
  | FILTRADO
  |--------------------------------------------------------------------------
  */

  const filteredCategories = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return categories.filter((category) => {
      const matchesStatus =
        status === "all" ||
        category.status === status;

      const matchesSearch =
        normalizedSearch === "" ||
        category.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        category.slug
          .toLowerCase()
          .includes(normalizedSearch) ||
        (category.description ?? "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        (category.parent?.name ?? "")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [categories, search, status]);

  const availableParents = useMemo(() => {
    return categories.filter((category) => {
      if (!editingCategory) {
        return category.parent_id === null;
      }

      return (
        category.id !== editingCategory.id &&
        category.parent_id === null
      );
    });
  }, [categories, editingCategory]);

  /*
  |--------------------------------------------------------------------------
  | FORMULARIO
  |--------------------------------------------------------------------------
  */

  function openCreateDialog() {
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormError(null);
    setSlugEdited(false);
    setFormOpen(true);
  }

  function openEditDialog(category: BlogCategory) {
    setEditingCategory(category);

    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      parent_id: category.parent_id ?? "",
      status: category.status,
      sort_order: category.sort_order,
    });

    setFormErrors({});
    setFormError(null);
    setSlugEdited(true);
    setFormOpen(true);
  }

  function resetFormDialog() {
    setFormOpen(false);
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormError(null);
    setSlugEdited(false);
  }

  function closeFormDialog() {
    if (saving) {
      return;
    }

    resetFormDialog();
  }

  function handleNameChange(value: string) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: slugEdited
        ? current.slug
        : slugify(value),
    }));

    setFormErrors((current) => ({
      ...current,
      name: undefined,
    }));
  }

  function handleSlugChange(value: string) {
    setSlugEdited(true);

    setForm((current) => ({
      ...current,
      slug: slugify(value),
    }));

    setFormErrors((current) => ({
      ...current,
      slug: undefined,
    }));
  }

  async function handleSaveCategory() {
    const validationErrors = validateForm(
      form,
      editingCategory
    );

    setFormErrors(validationErrors);
    setFormError(null);

    if (
      Object.keys(validationErrors).length > 0
    ) {
      return;
    }

    const payload: BlogCategoryPayload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description:
        form.description.trim() || null,
      parent_id:
        form.parent_id === ""
          ? null
          : Number(form.parent_id),
      status: form.status,
      sort_order: Number(form.sort_order),
    };

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (editingCategory) {
        await blogApi.updateCategory(
          systemId,
          blogId,
          editingCategory.id,
          payload
        );

        setSuccess(
          `La categoría “${payload.name}” fue actualizada correctamente.`
        );
      } else {
        await blogApi.createCategory(
          systemId,
          blogId,
          payload
        );

        setSuccess(
          `La categoría “${payload.name}” fue creada correctamente.`
        );
      }

      resetFormDialog();

      if (page !== 1 && !editingCategory) {
        setPage(1);
      } else {
        await loadCategories(page);
      }
    } catch (requestError) {
      setFormError(
        getErrorMessage(
          requestError,
          editingCategory
            ? "No fue posible actualizar la categoría."
            : "No fue posible crear la categoría."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | ELIMINACIÓN
  |--------------------------------------------------------------------------
  */

  function openDeleteDialog(
    category: BlogCategory
  ) {
    setCategoryToDelete(category);
  }

  function closeDeleteDialog() {
    if (deleting) {
      return;
    }

    setCategoryToDelete(null);
  }

  async function handleDeleteCategory() {
    if (!categoryToDelete) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);
      setSuccess(null);

      await blogApi.deleteCategory(
        systemId,
        blogId,
        categoryToDelete.id
      );

      setSuccess(
        `La categoría “${categoryToDelete.name}” fue eliminada correctamente.`
      );

      const shouldReturnPreviousPage =
        categories.length === 1 && page > 1;

      setCategoryToDelete(null);

      if (shouldReturnPreviousPage) {
        setPage((current) => current - 1);
      } else {
        await loadCategories(page);
      }
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "No fue posible eliminar la categoría."
        )
      );
    } finally {
      setDeleting(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | ACCIONES
  |--------------------------------------------------------------------------
  */

  function renderActions(
    category: BlogCategory
  ) {
    return (
      <Stack
        direction="row"
        spacing={0.5}
        justifyContent="flex-end"
      >
        <Tooltip title="Editar categoría">
          <IconButton
            size="small"
            color="primary"
            aria-label={`Editar ${category.name}`}
            onClick={() =>
              openEditDialog(category)
            }
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Eliminar categoría">
          <IconButton
            size="small"
            color="error"
            aria-label={`Eliminar ${category.name}`}
            onClick={() =>
              openDeleteDialog(category)
            }
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Stack spacing={3}>
        {/* ENCABEZADO */}
        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          justifyContent="space-between"
          alignItems={{
            xs: "flex-start",
            md: "center",
          }}
          spacing={2}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight={900}
            >
              Categorías
            </Typography>

            <Typography color="text.secondary">
              {blogName} · {systemName}
            </Typography>
          </Box>

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1.5}
            width={{
              xs: "100%",
              md: "auto",
            }}
          >
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateDialog}
              sx={{
                textTransform: "none",
                fontWeight: 800,
              }}
            >
              Nueva categoría
            </Button>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() =>
                void loadCategories(page)
              }
              disabled={loading}
              sx={{
                textTransform: "none",
                fontWeight: 800,
              }}
            >
              Actualizar
            </Button>

            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={onBack}
              sx={{
                textTransform: "none",
                fontWeight: 800,
              }}
            >
              Volver a blogs
            </Button>
          </Stack>
        </Stack>

        {/* MENSAJES */}
        {success && (
          <Alert
            severity="success"
            onClose={() => setSuccess(null)}
          >
            {success}
          </Alert>
        )}

        {error && (
          <Alert
            severity="error"
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* FILTROS */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Buscar categoría"
                  placeholder="Nombre, slug, descripción o categoría principal"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="category-status-label">
                    Estado
                  </InputLabel>

                  <Select
                    labelId="category-status-label"
                    label="Estado"
                    value={status}
                    onChange={(event) =>
                      setStatus(
                        event.target
                          .value as CategoryStatusFilter
                      )
                    }
                  >
                    <MenuItem value="all">
                      Todas
                    </MenuItem>

                    <MenuItem value="active">
                      Activas
                    </MenuItem>

                    <MenuItem value="inactive">
                      Inactivas
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* CONTENIDO */}
        {loading ? (
          <Box
            sx={{
              minHeight: 280,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Stack alignItems="center" spacing={2}>
              <CircularProgress />

              <Typography color="text.secondary">
                Consultando categorías...
              </Typography>
            </Stack>
          </Box>
        ) : filteredCategories.length === 0 ? (
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent sx={{ py: 7 }}>
              <Stack
                alignItems="center"
                textAlign="center"
                spacing={2}
              >
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: "action.selected",
                    color: "primary.main",
                  }}
                >
                  <CategoryIcon />
                </Avatar>

                <Typography
                  variant="h6"
                  fontWeight={900}
                >
                  No se encontraron categorías
                </Typography>

                <Typography color="text.secondary">
                  No existen categorías registradas o
                  no coinciden con los filtros.
                </Typography>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={openCreateDialog}
                  sx={{
                    textTransform: "none",
                    fontWeight: 800,
                  }}
                >
                  Crear primera categoría
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ) : isDesktop ? (
          /* TABLA EN ESCRITORIO */
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography fontWeight={900}>
                        Categoría
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={900}>
                        Tipo
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={900}>
                        Categoría padre
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography fontWeight={900}>
                        Estado
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography fontWeight={900}>
                        Orden
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography fontWeight={900}>
                        Publicaciones
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography fontWeight={900}>
                        Subcategorías
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Typography fontWeight={900}>
                        Acciones
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredCategories.map(
                    (category) => (
                      <TableRow
                        key={category.id}
                        hover
                        sx={{
                          "&:last-child td": {
                            borderBottom: 0,
                          },
                        }}
                      >
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
                            <Avatar
                              sx={{
                                width: 38,
                                height: 38,
                                bgcolor:
                                  "primary.main",
                                color:
                                  "primary.contrastText",
                              }}
                            >
                              <CategoryIcon fontSize="small" />
                            </Avatar>

                            <Box>
                              <Typography
                                fontWeight={800}
                              >
                                {category.name}
                              </Typography>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                /{category.slug}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={
                              category.parent
                                ? "Subcategoría"
                                : "Principal"
                            }
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>

                        <TableCell>
                          <Typography color="text.secondary">
                            {category.parent?.name ??
                              "Sin categoría padre"}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Chip
                            label={
                              category.status ===
                              "active"
                                ? "Activa"
                                : "Inactiva"
                            }
                            color={
                              category.status ===
                              "active"
                                ? "success"
                                : "default"
                            }
                            size="small"
                          />
                        </TableCell>

                        <TableCell align="center">
                          {category.sort_order}
                        </TableCell>

                        <TableCell align="center">
                          <Chip
                            icon={<ArticleIcon />}
                            label={
                              category.totals?.posts ??
                              0
                            }
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>

                        <TableCell align="center">
                          <Chip
                            icon={<AccountTreeIcon />}
                            label={
                              category.totals
                                ?.children ?? 0
                            }
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>

                        <TableCell align="right">
                          {renderActions(category)}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        ) : (
          /* TARJETAS EN MÓVIL */
          <Grid container spacing={2}>
            {filteredCategories.map(
              (category) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  key={category.id}
                >
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      borderRadius: 4,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <CardContent>
                      <Stack spacing={2}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          spacing={1}
                        >
                          <Avatar
                            sx={{
                              bgcolor:
                                "primary.main",
                              color:
                                "primary.contrastText",
                            }}
                          >
                            <CategoryIcon />
                          </Avatar>

                          <Chip
                            label={
                              category.status ===
                              "active"
                                ? "Activa"
                                : "Inactiva"
                            }
                            color={
                              category.status ===
                              "active"
                                ? "success"
                                : "default"
                            }
                            size="small"
                          />
                        </Stack>

                        <Box>
                          <Typography
                            variant="h6"
                            fontWeight={900}
                          >
                            {category.name}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            /{category.slug}
                          </Typography>
                        </Box>

                        {category.description && (
                          <Typography color="text.secondary">
                            {category.description}
                          </Typography>
                        )}

                        <Stack
                          direction="row"
                          spacing={1}
                          useFlexGap
                          flexWrap="wrap"
                        >
                          <Chip
                            label={
                              category.parent
                                ? "Subcategoría"
                                : "Categoría principal"
                            }
                            size="small"
                            variant="outlined"
                          />

                          {category.parent && (
                            <Chip
                              icon={
                                <AccountTreeIcon />
                              }
                              label={
                                category.parent.name
                              }
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Stack>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Publicaciones:{" "}
                          {category.totals?.posts ?? 0}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Subcategorías:{" "}
                          {category.totals?.children ??
                            0}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Orden: {category.sort_order}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Creada el{" "}
                          {formatDate(
                            category.created_at
                          )}
                        </Typography>

                        <Divider />

                        <Stack
                          direction={{
                            xs: "column",
                            sm: "row",
                          }}
                          spacing={1}
                        >
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={
                              <EditOutlinedIcon />
                            }
                            onClick={() =>
                              openEditDialog(category)
                            }
                            sx={{
                              textTransform: "none",
                              fontWeight: 800,
                            }}
                          >
                            Editar
                          </Button>

                          <Button
                            fullWidth
                            variant="outlined"
                            color="error"
                            startIcon={
                              <DeleteOutlineIcon />
                            }
                            onClick={() =>
                              openDeleteDialog(category)
                            }
                            sx={{
                              textTransform: "none",
                              fontWeight: 800,
                            }}
                          >
                            Eliminar
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              )
            )}
          </Grid>
        )}

        {/* PAGINACIÓN */}
        {!loading && total > 0 && (
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography color="text.secondary">
              Total registrado: {total}
            </Typography>

            {lastPage > 1 && (
              <Pagination
                page={page}
                count={lastPage}
                onChange={(_, newPage) =>
                  setPage(newPage)
                }
                color="primary"
              />
            )}
          </Stack>
        )}
      </Stack>

      {/* MODAL CREAR / EDITAR */}
      <Dialog
        open={formOpen}
        onClose={closeFormDialog}
        fullWidth
        maxWidth="sm"
        fullScreen={!isDesktop}
      >
        <DialogTitle>
          <Typography
            variant="h6"
            fontWeight={900}
          >
            {editingCategory
              ? "Editar categoría"
              : "Nueva categoría"}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {editingCategory
              ? `Modifica la categoría “${editingCategory.name}”.`
              : "Registra una categoría principal o una subcategoría."}
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {formError && (
              <Alert severity="error">
                {formError}
              </Alert>
            )}

            <TextField
              required
              fullWidth
              autoFocus
              label="Nombre"
              placeholder="Ejemplo: Comercio electrónico"
              value={form.name}
              onChange={(event) =>
                handleNameChange(event.target.value)
              }
              error={Boolean(formErrors.name)}
              helperText={
                formErrors.name ??
                "Nombre visible de la categoría."
              }
              disabled={saving}
            />

            <TextField
              required
              fullWidth
              label="Slug"
              placeholder="comercio-electronico"
              value={form.slug}
              onChange={(event) =>
                handleSlugChange(event.target.value)
              }
              error={Boolean(formErrors.slug)}
              helperText={
                formErrors.slug ??
                "Identificador utilizado en la URL."
              }
              disabled={saving}
            />

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Descripción"
              placeholder="Describe el contenido de esta categoría."
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              disabled={saving}
            />

            <FormControl
              fullWidth
              error={Boolean(formErrors.parent_id)}
            >
              <InputLabel id="category-parent-label">
                Categoría padre
              </InputLabel>

              <Select
                labelId="category-parent-label"
                label="Categoría padre"
                value={form.parent_id}
                onChange={(event) => {
                  const value = event.target.value;

                  setForm((current) => ({
                    ...current,
                    parent_id:
                      value === ""
                        ? ""
                        : Number(value),
                  }));

                  setFormErrors((current) => ({
                    ...current,
                    parent_id: undefined,
                  }));
                }}
                disabled={saving}
              >
                <MenuItem value="">
                  Ninguna — categoría principal
                </MenuItem>

                {availableParents.map((category) => (
                  <MenuItem
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </MenuItem>
                ))}
              </Select>

              {formErrors.parent_id && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 0.5, ml: 1.5 }}
                >
                  {formErrors.parent_id}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="category-form-status-label">
                Estado
              </InputLabel>

              <Select
                labelId="category-form-status-label"
                label="Estado"
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as
                      | "active"
                      | "inactive",
                  }))
                }
                disabled={saving}
              >
                <MenuItem value="active">
                  Activa
                </MenuItem>

                <MenuItem value="inactive">
                  Inactiva
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              required
              fullWidth
              type="number"
              label="Orden"
              value={form.sort_order}
              onChange={(event) => {
                setForm((current) => ({
                  ...current,
                  sort_order: Number(
                    event.target.value
                  ),
                }));

                setFormErrors((current) => ({
                  ...current,
                  sort_order: undefined,
                }));
              }}
              inputProps={{
                min: 0,
                step: 1,
              }}
              error={Boolean(formErrors.sort_order)}
              helperText={
                formErrors.sort_order ??
                "Define la posición de la categoría."
              }
              disabled={saving}
            />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            flexDirection: {
              xs: "column-reverse",
              sm: "row",
            },
            gap: 1,
          }}
        >
          <Button
            onClick={closeFormDialog}
            disabled={saving}
            sx={{
              width: {
                xs: "100%",
                sm: "auto",
              },
              textTransform: "none",
              fontWeight: 800,
            }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={() =>
              void handleSaveCategory()
            }
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : editingCategory ? (
                <EditOutlinedIcon />
              ) : (
                <AddIcon />
              )
            }
            sx={{
              width: {
                xs: "100%",
                sm: "auto",
              },
              textTransform: "none",
              fontWeight: 800,
            }}
          >
            {saving
              ? "Guardando..."
              : editingCategory
                ? "Guardar cambios"
                : "Crear categoría"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CONFIRMACIÓN DE ELIMINACIÓN */}
      <Dialog
        open={Boolean(categoryToDelete)}
        onClose={closeDeleteDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
          >
            <Avatar
              sx={{
                bgcolor: "error.main",
                color: "error.contrastText",
              }}
            >
              <WarningAmberIcon />
            </Avatar>

            <Typography
              variant="h6"
              fontWeight={900}
            >
              Eliminar categoría
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            <Typography>
              ¿Estás seguro de que deseas eliminar la
              categoría{" "}
              <strong>
                “{categoryToDelete?.name ?? ""}”
              </strong>
              ?
            </Typography>

            <Alert severity="warning">
              Esta acción no se puede deshacer.
            </Alert>

            {(categoryToDelete?.totals?.posts ?? 0) >
              0 && (
              <Alert severity="info">
                Tiene{" "}
                <strong>
                  {categoryToDelete?.totals?.posts}
                </strong>{" "}
                publicación
                {categoryToDelete?.totals?.posts === 1
                  ? ""
                  : "es"}{" "}
                asociada
                {categoryToDelete?.totals?.posts === 1
                  ? ""
                  : "s"}
                .
              </Alert>
            )}

            {(categoryToDelete?.totals?.children ??
              0) > 0 && (
              <Alert severity="info">
                Tiene{" "}
                <strong>
                  {
                    categoryToDelete?.totals
                      ?.children
                  }
                </strong>{" "}
                subcategoría
                {categoryToDelete?.totals
                  ?.children === 1
                  ? ""
                  : "s"}{" "}
                asociada
                {categoryToDelete?.totals
                  ?.children === 1
                  ? ""
                  : "s"}
                .
              </Alert>
            )}

            {((categoryToDelete?.totals?.posts ??
              0) > 0 ||
              (categoryToDelete?.totals?.children ??
                0) > 0) && (
              <Typography
                variant="body2"
                color="text.secondary"
              >
                El servidor determinará si la categoría
                puede eliminarse.
              </Typography>
            )}
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            flexDirection: {
              xs: "column-reverse",
              sm: "row",
            },
            gap: 1,
          }}
        >
          <Button
            onClick={closeDeleteDialog}
            disabled={deleting}
            sx={{
              width: {
                xs: "100%",
                sm: "auto",
              },
              textTransform: "none",
              fontWeight: 800,
            }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            color="error"
            startIcon={
              deleting ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <DeleteOutlineIcon />
              )
            }
            onClick={() =>
              void handleDeleteCategory()
            }
            disabled={deleting}
            sx={{
              width: {
                xs: "100%",
                sm: "auto",
              },
              textTransform: "none",
              fontWeight: 800,
            }}
          >
            {deleting
              ? "Eliminando..."
              : "Sí, eliminar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}