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
  Grid,
  IconButton,
  InputAdornment,
  Pagination,
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
import ArticleIcon from "@mui/icons-material/Article";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import {
  blogApi,
  type BlogTag,
  type BlogTagPayload,
} from "../../../../services/api/blogs";

type Props = {
  systemId: number;
  systemName: string;
  blogId: number;
  blogName: string;
  onBack: () => void;
};

type TagForm = {
  name: string;
  slug: string;
};

type TagFormErrors = {
  name?: string;
  slug?: string;
};

type ApiErrorData = {
  message?: string;
  errors?: Record<string, string[] | string>;
};

const EMPTY_FORM: TagForm = {
  name: "",
  slug: "",
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

      if (Array.isArray(firstError) && firstError.length > 0) {
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

function validateForm(form: TagForm): TagFormErrors {
  const errors: TagFormErrors = {};

  if (!form.name.trim()) {
    errors.name = "El nombre de la etiqueta es obligatorio.";
  }

  if (!form.slug.trim()) {
    errors.slug = "El slug es obligatorio.";
  } else if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())
  ) {
    errors.slug =
      "El slug solo puede contener letras minúsculas, números y guiones.";
  }

  return errors;
}

export default function BlogTagsSection({
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

  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");

  /*
  |--------------------------------------------------------------------------
  | FORMULARIO
  |--------------------------------------------------------------------------
  */

  const [formOpen, setFormOpen] = useState(false);

  const [editingTag, setEditingTag] =
    useState<BlogTag | null>(null);

  const [form, setForm] =
    useState<TagForm>(EMPTY_FORM);

  const [formErrors, setFormErrors] =
    useState<TagFormErrors>({});

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

  const [tagToDelete, setTagToDelete] =
    useState<BlogTag | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | CONSULTA
  |--------------------------------------------------------------------------
  */

  const loadTags = useCallback(
    async (selectedPage: number) => {
      try {
        setLoading(true);
        setError(null);

        const response = await blogApi.tags(
          systemId,
          blogId,
          {
            page: selectedPage,
            per_page: 16,
          }
        );

        const payload = response.data;

        setTags(payload.data ?? []);
        setLastPage(payload.meta?.last_page ?? 1);
        setTotal(payload.meta?.total ?? 0);
      } catch (requestError) {
        setTags([]);

        setError(
          getErrorMessage(
            requestError,
            "No fue posible consultar las etiquetas."
          )
        );
      } finally {
        setLoading(false);
      }
    },
    [systemId, blogId]
  );

  useEffect(() => {
    void loadTags(page);
  }, [loadTags, page]);

  /*
  |--------------------------------------------------------------------------
  | FILTRO LOCAL
  |--------------------------------------------------------------------------
  */

  const filteredTags = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    if (!normalizedSearch) {
      return tags;
    }

    return tags.filter((tag) => {
      return (
        tag.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        tag.slug
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [tags, search]);

  /*
  |--------------------------------------------------------------------------
  | CREAR Y EDITAR
  |--------------------------------------------------------------------------
  */

  function openCreateDialog() {
    setEditingTag(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormError(null);
    setSlugEdited(false);
    setFormOpen(true);
  }

  function openEditDialog(tag: BlogTag) {
    setEditingTag(tag);

    setForm({
      name: tag.name,
      slug: tag.slug,
    });

    setFormErrors({});
    setFormError(null);
    setSlugEdited(true);
    setFormOpen(true);
  }

  function resetFormDialog() {
  setFormOpen(false);
  setEditingTag(null);
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

  async function handleSaveTag() {
    const validationErrors = validateForm(form);

    setFormErrors(validationErrors);
    setFormError(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const payload: BlogTagPayload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
    };

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (editingTag) {
        await blogApi.updateTag(
          systemId,
          blogId,
          editingTag.id,
          payload
        );

        setSuccess(
          `La etiqueta “${payload.name}” fue actualizada correctamente.`
        );
      } else {
        await blogApi.createTag(
          systemId,
          blogId,
          payload
        );

        setSuccess(
          `La etiqueta “${payload.name}” fue creada correctamente.`
        );
      }

    resetFormDialog();

      if (page !== 1 && !editingTag) {
        setPage(1);
      } else {
        await loadTags(page);
      }
    } catch (requestError) {
      setFormError(
        getErrorMessage(
          requestError,
          editingTag
            ? "No fue posible actualizar la etiqueta."
            : "No fue posible crear la etiqueta."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | ELIMINAR
  |--------------------------------------------------------------------------
  */

  function openDeleteDialog(tag: BlogTag) {
    setTagToDelete(tag);
  }

  function closeDeleteDialog() {
    if (deleting) {
      return;
    }

    setTagToDelete(null);
  }

  async function handleDeleteTag() {
    if (!tagToDelete) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);
      setSuccess(null);

      await blogApi.deleteTag(
        systemId,
        blogId,
        tagToDelete.id
      );

      setSuccess(
        `La etiqueta “${tagToDelete.name}” fue eliminada correctamente.`
      );

      const shouldReturnPreviousPage =
        tags.length === 1 && page > 1;

      setTagToDelete(null);

      if (shouldReturnPreviousPage) {
        setPage((current) => current - 1);
      } else {
        await loadTags(page);
      }
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "No fue posible eliminar la etiqueta."
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

  function renderActions(tag: BlogTag) {
    return (
      <Stack
        direction="row"
        spacing={0.5}
        justifyContent="flex-end"
      >
        <Tooltip title="Editar etiqueta">
          <IconButton
            size="small"
            color="primary"
            aria-label={`Editar ${tag.name}`}
            onClick={() => openEditDialog(tag)}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Eliminar etiqueta">
          <IconButton
            size="small"
            color="error"
            aria-label={`Eliminar ${tag.name}`}
            onClick={() => openDeleteDialog(tag)}
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
            <Typography variant="h4" fontWeight={900}>
              Etiquetas
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
              Nueva etiqueta
            </Button>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => void loadTags(page)}
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

        {/* BUSCADOR */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <CardContent>
            <TextField
  fullWidth
  label="Buscar etiqueta"
  placeholder="Nombre o slug"
  value={search}
  onChange={(event) => setSearch(event.target.value)}
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <SearchIcon color="action" />
      </InputAdornment>
    ),
  }}
/>
          </CardContent>
        </Card>

        {/* CARGA */}
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
                Consultando etiquetas...
              </Typography>
            </Stack>
          </Box>
        ) : filteredTags.length === 0 ? (
          /* ESTADO VACÍO */
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
                  <LocalOfferIcon />
                </Avatar>

                <Typography
                  variant="h6"
                  fontWeight={900}
                >
                  No se encontraron etiquetas
                </Typography>

                <Typography color="text.secondary">
                  No existen etiquetas registradas o no
                  coinciden con la búsqueda.
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
                  Crear primera etiqueta
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ) : isDesktop ? (
          /* TABLA PARA ESCRITORIO */
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
                        Etiqueta
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={900}>
                        Slug
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography fontWeight={900}>
                        Publicaciones
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={900}>
                        Fecha de creación
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
                  {filteredTags.map((tag) => (
                    <TableRow
                      key={tag.id}
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
                              bgcolor: "primary.main",
                              color:
                                "primary.contrastText",
                            }}
                          >
                            <LocalOfferIcon fontSize="small" />
                          </Avatar>

                          <Typography fontWeight={800}>
                            {tag.name}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Typography
                          color="text.secondary"
                          sx={{
                            wordBreak: "break-word",
                          }}
                        >
                          /{tag.slug}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          icon={<ArticleIcon />}
                          label={tag.totals?.posts ?? 0}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell>
                        <Typography color="text.secondary">
                          {formatDate(tag.created_at)}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        {renderActions(tag)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        ) : (
          /* TARJETAS PARA MÓVIL */
          <Grid container spacing={2}>
            {filteredTags.map((tag) => (
              <Grid
                item
                xs={12}
                sm={6}
                key={tag.id}
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
                        spacing={2}
                      >
                        <Avatar
                          sx={{
                            bgcolor: "primary.main",
                            color:
                              "primary.contrastText",
                          }}
                        >
                          <LocalOfferIcon />
                        </Avatar>

                        <Chip
                          icon={<ArticleIcon />}
                          label={`${
                            tag.totals?.posts ?? 0
                          } publicaciones`}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>

                      <Box>
                        <Typography
                          variant="h6"
                          fontWeight={900}
                        >
                          {tag.name}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.5,
                            wordBreak: "break-word",
                          }}
                        >
                          /{tag.slug}
                        </Typography>
                      </Box>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Creada el{" "}
                        {formatDate(tag.created_at)}
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
                          startIcon={<EditOutlinedIcon />}
                          onClick={() =>
                            openEditDialog(tag)
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
                            openDeleteDialog(tag)
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
            ))}
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
          <Typography variant="h6" fontWeight={900}>
            {editingTag
              ? "Editar etiqueta"
              : "Nueva etiqueta"}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {editingTag
              ? `Modifica la etiqueta “${editingTag.name}”.`
              : "Registra una nueva etiqueta para clasificar publicaciones."}
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
              placeholder="Ejemplo: Marketing digital"
              value={form.name}
              onChange={(event) =>
                handleNameChange(event.target.value)
              }
              error={Boolean(formErrors.name)}
              helperText={
                formErrors.name ??
                "Nombre visible de la etiqueta."
              }
              disabled={saving}
            />

            <TextField
              required
              fullWidth
              label="Slug"
              placeholder="marketing-digital"
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
            onClick={() => void handleSaveTag()}
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : editingTag ? (
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
              : editingTag
                ? "Guardar cambios"
                : "Crear etiqueta"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CONFIRMACIÓN DE ELIMINACIÓN */}
      <Dialog
        open={Boolean(tagToDelete)}
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

            <Typography variant="h6" fontWeight={900}>
              Eliminar etiqueta
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            <Typography>
              ¿Estás seguro de que deseas eliminar la
              etiqueta{" "}
              <strong>
                “{tagToDelete?.name ?? ""}”
              </strong>
              ?
            </Typography>

            <Alert severity="warning">
              Esta acción no se puede deshacer.
            </Alert>

            {(tagToDelete?.totals?.posts ?? 0) > 0 && (
              <Alert severity="info">
                Esta etiqueta está asociada con{" "}
                <strong>
                  {tagToDelete?.totals?.posts}
                </strong>{" "}
                publicación
                {tagToDelete?.totals?.posts === 1
                  ? ""
                  : "es"}
                . El servidor determinará si puede
                eliminarse.
              </Alert>
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
              void handleDeleteTag()
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