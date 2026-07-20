import {
  useCallback,
  useEffect,
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

import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ImageIcon from "@mui/icons-material/Image";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import {
  blogApi,
  type BlogMedia,
  type BlogMediaListParams,
  type BlogMediaUpdatePayload,
} from "../../../../services/api/blogs";

type Props = {
  systemId: number;
  systemName: string;
  blogId: number;
  blogName: string;
  onBack: () => void;
};

type MediaMimeFilter =
  | ""
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/gif"
  | "image/svg+xml"
  | "image/avif";

type ApiErrorData = {
  message?: string;
  errors?: Record<string, string[] | string>;
};

type MediaPreviewProps = {
  media: BlogMedia;
  height?: number;
  objectFit?: "cover" | "contain";
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
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getExtension(media: BlogMedia): string {
  const filename =
    media.filename || media.original_filename;

  const extension = filename
    .split(".")
    .pop()
    ?.toUpperCase();

  if (extension) {
    return extension;
  }

  return (
    media.mime_type
      .split("/")
      .pop()
      ?.toUpperCase() ?? "IMAGEN"
  );
}

function getDimensions(media: BlogMedia): string {
  if (media.width && media.height) {
    return `${media.width} × ${media.height} px`;
  }

  return "Medidas no disponibles";
}

function getUsageTotal(media: BlogMedia): number {
  return (
    (media.usage?.cover_posts ?? 0) +
    (media.usage?.open_graph_posts ?? 0)
  );
}

function isMediaInUse(media: BlogMedia): boolean {
  return getUsageTotal(media) > 0;
}

async function copyTextToClipboard(
  value: string
): Promise<boolean> {
  try {
    if (
      navigator.clipboard &&
      window.isSecureContext
    ) {
      await navigator.clipboard.writeText(
        value
      );

      return true;
    }

    const textarea =
      document.createElement("textarea");

    textarea.value = value;
    textarea.setAttribute(
      "readonly",
      "true"
    );

    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";

    document.body.appendChild(textarea);

    textarea.select();
    textarea.setSelectionRange(
      0,
      textarea.value.length
    );

    const copied =
      document.execCommand("copy");

    textarea.remove();

    return copied;
  } catch {
    return false;
  }
}

function MediaPreview({
  media,
  height = 80,
  objectFit = "cover",
}: MediaPreviewProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [media.url]);

  if (failed || !media.url) {
    return (
      <Box
        sx={{
          width: "100%",
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "action.hover",
          color: "text.secondary",
        }}
      >
        <Stack alignItems="center" spacing={0.5}>
          <BrokenImageIcon />

          {height > 70 && (
            <Typography variant="caption">
              Vista no disponible
            </Typography>
          )}
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={media.url}
      alt={
        media.alt_text ??
        media.original_filename
      }
      loading="lazy"
      onError={() => setFailed(true)}
      sx={{
        width: "100%",
        height,
        display: "block",
        objectFit,
        bgcolor: "action.hover",
      }}
    />
  );
}

export default function BlogMediaSection({
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

  /*
  |--------------------------------------------------------------------------
  | LISTADO
  |--------------------------------------------------------------------------
  */

  const [media, setMedia] =
    useState<BlogMedia[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const [page, setPage] = useState(1);

  const [lastPage, setLastPage] =
    useState(1);

  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");

  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState("");

  const [mimeType, setMimeType] =
    useState<MediaMimeFilter>("");

  /*
  |--------------------------------------------------------------------------
  | VISUALIZACIÓN
  |--------------------------------------------------------------------------
  */

  const [selectedMedia, setSelectedMedia] =
    useState<BlogMedia | null>(null);

  /*
  |--------------------------------------------------------------------------
  | SUBIR IMAGEN
  |--------------------------------------------------------------------------
  */

  const [uploadOpen, setUploadOpen] =
    useState(false);

  const [uploadFile, setUploadFile] =
    useState<File | null>(null);

  const [uploadPreview, setUploadPreview] =
    useState<string | null>(null);

  const [uploadAltText, setUploadAltText] =
    useState("");

  const [uploadCaption, setUploadCaption] =
    useState("");

  const [uploading, setUploading] =
    useState(false);

  const [uploadError, setUploadError] =
    useState<string | null>(null);

  /*
  |--------------------------------------------------------------------------
  | EDITAR
  |--------------------------------------------------------------------------
  */

  const [editingMedia, setEditingMedia] =
    useState<BlogMedia | null>(null);

  const [editAltText, setEditAltText] =
    useState("");

  const [editCaption, setEditCaption] =
    useState("");

  const [updating, setUpdating] =
    useState(false);

  const [editError, setEditError] =
    useState<string | null>(null);

  /*
  |--------------------------------------------------------------------------
  | ELIMINAR
  |--------------------------------------------------------------------------
  */

  const [
    mediaToDelete,
    setMediaToDelete,
  ] = useState<BlogMedia | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | BÚSQUEDA CON RETARDO
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search.trim());
    }, 450);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [search]);

  /*
  |--------------------------------------------------------------------------
  | LIBERAR VISTA PREVIA LOCAL
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    return () => {
      if (uploadPreview) {
        URL.revokeObjectURL(uploadPreview);
      }
    };
  }, [uploadPreview]);

  /*
  |--------------------------------------------------------------------------
  | CONSULTAR MULTIMEDIA
  |--------------------------------------------------------------------------
  */

  const loadMedia = useCallback(
    async (selectedPage: number) => {
      try {
        setLoading(true);
        setError(null);

        const params: BlogMediaListParams = {
          page: selectedPage,
          per_page: 16,
        };

        if (debouncedSearch) {
          params.search = debouncedSearch;
        }

        if (mimeType) {
          params.mime_type = mimeType;
        }

        const response = await blogApi.media(
          systemId,
          blogId,
          params
        );

        const payload = response.data;

        setMedia(payload.data ?? []);

        setLastPage(
          payload.meta?.last_page ?? 1
        );

        setTotal(
          payload.meta?.total ?? 0
        );
      } catch (requestError) {
        setMedia([]);

        setError(
          getErrorMessage(
            requestError,
            "No fue posible consultar los archivos multimedia."
          )
        );
      } finally {
        setLoading(false);
      }
    },
    [
      systemId,
      blogId,
      debouncedSearch,
      mimeType,
    ]
  );

  useEffect(() => {
    void loadMedia(page);
  }, [loadMedia, page]);

  /*
  |--------------------------------------------------------------------------
  | FILTROS
  |--------------------------------------------------------------------------
  */

  function handleMimeTypeChange(
    value: MediaMimeFilter
  ) {
    setPage(1);
    setMimeType(value);
  }

  function clearFilters() {
    setSearch("");
    setDebouncedSearch("");
    setMimeType("");
    setPage(1);
  }

  /*
  |--------------------------------------------------------------------------
  | SUBIR IMAGEN
  |--------------------------------------------------------------------------
  */

  function openUploadDialog() {
    setUploadFile(null);
    setUploadPreview(null);
    setUploadAltText("");
    setUploadCaption("");
    setUploadError(null);
    setUploadOpen(true);
  }

  function resetUploadDialog() {
    setUploadOpen(false);
    setUploadFile(null);
    setUploadPreview(null);
    setUploadAltText("");
    setUploadCaption("");
    setUploadError(null);
  }

  function closeUploadDialog() {
    if (uploading) {
      return;
    }

    resetUploadDialog();
  }

  function handleFileSelected(
    file: File | null
  ) {
    setUploadError(null);

    if (uploadPreview) {
      URL.revokeObjectURL(uploadPreview);
    }

    setUploadFile(file);

    if (!file) {
      setUploadPreview(null);
      return;
    }

    if (
      file.type &&
      !file.type.startsWith("image/")
    ) {
      setUploadFile(null);
      setUploadPreview(null);

      setUploadError(
        "El archivo seleccionado no es una imagen."
      );

      return;
    }

    setUploadPreview(
      URL.createObjectURL(file)
    );
  }

  async function handleUploadMedia() {
    if (!uploadFile) {
      setUploadError(
        "Selecciona una imagen antes de continuar."
      );

      return;
    }

    const formData = new FormData();

    formData.append("file", uploadFile);

    if (uploadAltText.trim()) {
      formData.append(
        "alt_text",
        uploadAltText.trim()
      );
    }

    if (uploadCaption.trim()) {
      formData.append(
        "caption",
        uploadCaption.trim()
      );
    }

    try {
      setUploading(true);
      setUploadError(null);
      setError(null);
      setSuccess(null);

      const response =
        await blogApi.createMedia(
          systemId,
          blogId,
          formData
        );

      setSuccess(
        response.data.message ||
          "Imagen subida correctamente."
      );

      resetUploadDialog();

      if (page !== 1) {
        setPage(1);
      } else {
        await loadMedia(1);
      }
    } catch (requestError) {
      setUploadError(
        getErrorMessage(
          requestError,
          "No fue posible subir la imagen."
        )
      );
    } finally {
      setUploading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | EDITAR INFORMACIÓN
  |--------------------------------------------------------------------------
  */

  function openEditDialog(item: BlogMedia) {
    setEditingMedia(item);
    setEditAltText(item.alt_text ?? "");
    setEditCaption(item.caption ?? "");
    setEditError(null);
  }

  function resetEditDialog() {
    setEditingMedia(null);
    setEditAltText("");
    setEditCaption("");
    setEditError(null);
  }

  function closeEditDialog() {
    if (updating) {
      return;
    }

    resetEditDialog();
  }

  async function handleUpdateMedia() {
    if (!editingMedia) {
      return;
    }

    const payload: BlogMediaUpdatePayload = {
      alt_text:
        editAltText.trim() || null,
      caption:
        editCaption.trim() || null,
    };

    try {
      setUpdating(true);
      setEditError(null);
      setError(null);
      setSuccess(null);

      const response =
        await blogApi.updateMedia(
          systemId,
          blogId,
          editingMedia.id,
          payload
        );

      const updatedMedia =
        response.data.data;

      setSuccess(
        response.data.message ||
          "Datos de la imagen actualizados correctamente."
      );

      setSelectedMedia((current) => {
        if (
          current?.id === updatedMedia.id
        ) {
          return updatedMedia;
        }

        return current;
      });

      resetEditDialog();

      await loadMedia(page);
    } catch (requestError) {
      setEditError(
        getErrorMessage(
          requestError,
          "No fue posible actualizar los datos de la imagen."
        )
      );
    } finally {
      setUpdating(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | ELIMINAR
  |--------------------------------------------------------------------------
  */

  function openDeleteDialog(
    item: BlogMedia
  ) {
    setMediaToDelete(item);
  }

  function closeDeleteDialog() {
    if (deleting) {
      return;
    }

    setMediaToDelete(null);
  }

  async function handleDeleteMedia() {
    if (!mediaToDelete) {
      return;
    }

    if (isMediaInUse(mediaToDelete)) {
      setError(
        "La imagen está siendo utilizada por una publicación. Retírala primero de las portadas y de Open Graph."
      );

      setMediaToDelete(null);
      return;
    }

    try {
      setDeleting(true);
      setError(null);
      setSuccess(null);

      const response =
        await blogApi.deleteMedia(
          systemId,
          blogId,
          mediaToDelete.id
        );

      setSuccess(
        response.data.message ||
          "Imagen eliminada correctamente."
      );

      setSelectedMedia((current) =>
        current?.id === mediaToDelete.id
          ? null
          : current
      );

      const shouldReturnPreviousPage =
        media.length === 1 && page > 1;

      setMediaToDelete(null);

      if (shouldReturnPreviousPage) {
        setPage((current) => current - 1);
      } else {
        await loadMedia(page);
      }
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "No fue posible eliminar la imagen."
        )
      );
    } finally {
      setDeleting(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | URL PÚBLICA
  |--------------------------------------------------------------------------
  */

  async function handleCopyMediaUrl(
    item: BlogMedia
  ) {
    if (!item.url) {
      setError(
        "La imagen no tiene una URL pública disponible."
      );

      return;
    }

    const copied =
      await copyTextToClipboard(
        item.url
      );

    if (!copied) {
      setError(
        "No fue posible copiar la URL pública de la imagen."
      );

      return;
    }

    setError(null);

    setSuccess(
      `La URL pública de “${item.original_filename}” fue copiada.`
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ACCIONES
  |--------------------------------------------------------------------------
  */

  function renderActions(
    item: BlogMedia
  ) {
    return (
      <Stack
        direction="row"
        spacing={0}
        justifyContent="center"
        alignItems="center"
      >
        <Tooltip title="Ver imagen">
          <IconButton
            size="small"
            aria-label={`Ver ${item.original_filename}`}
            onClick={() =>
              setSelectedMedia(item)
            }
            sx={{ p: 0.5 }}
          >
            <VisibilityOutlinedIcon
              sx={{ fontSize: 18 }}
            />
          </IconButton>
        </Tooltip>

        <Tooltip title="Copiar URL pública">
          <IconButton
            size="small"
            color="primary"
            aria-label={`Copiar URL de ${item.original_filename}`}
            onClick={() =>
              void handleCopyMediaUrl(item)
            }
            sx={{ p: 0.5 }}
          >
            <ContentCopyOutlinedIcon
              sx={{ fontSize: 18 }}
            />
          </IconButton>
        </Tooltip>

        <Tooltip title="Editar información">
          <IconButton
            size="small"
            color="primary"
            aria-label={`Editar ${item.original_filename}`}
            onClick={() =>
              openEditDialog(item)
            }
            sx={{ p: 0.5 }}
          >
            <EditOutlinedIcon
              sx={{ fontSize: 18 }}
            />
          </IconButton>
        </Tooltip>

        <Tooltip
          title={
            isMediaInUse(item)
              ? "La imagen está en uso"
              : "Eliminar imagen"
          }
        >
          <span>
            <IconButton
              size="small"
              color="error"
              disabled={isMediaInUse(item)}
              aria-label={`Eliminar ${item.original_filename}`}
              onClick={() =>
                openDeleteDialog(item)
              }
              sx={{ p: 0.5 }}
            >
              <DeleteOutlineIcon
                sx={{ fontSize: 18 }}
              />
            </IconButton>
          </span>
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
              Multimedia
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
              startIcon={
                <AddPhotoAlternateIcon />
              }
              onClick={openUploadDialog}
              sx={{
                textTransform: "none",
                fontWeight: 800,
              }}
            >
              Subir imagen
            </Button>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() =>
                void loadMedia(page)
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
            onClose={() =>
              setSuccess(null)
            }
          >
            {success}
          </Alert>
        )}

        {error && (
          <Alert
            severity="error"
            onClose={() =>
              setError(null)
            }
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
              <Grid
                item
                xs={12}
                md={7}
              >
                <TextField
                  fullWidth
                  label="Buscar imagen"
                  placeholder="Nombre o texto alternativo"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
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

              <Grid
                item
                xs={12}
                md={3}
              >
                <FormControl fullWidth>
                  <InputLabel id="media-mime-label">
                    Formato
                  </InputLabel>

                  <Select
                    labelId="media-mime-label"
                    label="Formato"
                    value={mimeType}
                    onChange={(event) =>
                      handleMimeTypeChange(
                        event.target
                          .value as MediaMimeFilter
                      )
                    }
                  >
                    <MenuItem value="">
                      Todos
                    </MenuItem>

                    <MenuItem value="image/jpeg">
                      JPG / JPEG
                    </MenuItem>

                    <MenuItem value="image/png">
                      PNG
                    </MenuItem>

                    <MenuItem value="image/webp">
                      WEBP
                    </MenuItem>

                    <MenuItem value="image/gif">
                      GIF
                    </MenuItem>

                    <MenuItem value="image/svg+xml">
                      SVG
                    </MenuItem>

                    <MenuItem value="image/avif">
                      AVIF
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid
                item
                xs={12}
                md={2}
              >
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={clearFilters}
                  sx={{
                    height: 56,
                    textTransform: "none",
                    fontWeight: 800,
                  }}
                >
                  Limpiar
                </Button>
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
            <Stack
              alignItems="center"
              spacing={2}
            >
              <CircularProgress />

              <Typography color="text.secondary">
                Consultando archivos multimedia...
              </Typography>
            </Stack>
          </Box>
        ) : media.length === 0 ? (
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
                  <ImageIcon />
                </Avatar>

                <Typography
                  variant="h6"
                  fontWeight={900}
                >
                  No se encontraron imágenes
                </Typography>

                <Typography color="text.secondary">
                  No existen archivos registrados o no
                  coinciden con los filtros.
                </Typography>

                <Button
                  variant="contained"
                  startIcon={
                    <AddPhotoAlternateIcon />
                  }
                  onClick={openUploadDialog}
                  sx={{
                    textTransform: "none",
                    fontWeight: 800,
                  }}
                >
                  Subir primera imagen
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ) : isDesktop ? (
          /* TABLA EN ESCRITORIO */
          <Card
            elevation={0}
            sx={{
              width: "100%",
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            <TableContainer
              sx={{
                width: "100%",
                overflowX: "auto",
              }}
            >
              <Table
                size="small"
                sx={{
                  width: "100%",
                  minWidth: 1180,
                  tableLayout: "fixed",

                  "& .MuiTableCell-root": {
                    px: 1,
                    py: 1.15,
                    fontSize: "0.76rem",
                    verticalAlign: "middle",
                  },

                  "& .MuiTableCell-head": {
                    py: 1.4,
                    fontSize: "0.76rem",
                    fontWeight: 900,
                    whiteSpace: "nowrap",
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{ width: "7%" }}
                    >
                      Vista
                    </TableCell>

                    <TableCell
                      sx={{ width: "15%" }}
                    >
                      Archivo
                    </TableCell>

                    <TableCell
                      sx={{ width: "11%" }}
                    >
                      Detalles
                    </TableCell>

                    <TableCell
                      sx={{ width: "17%" }}
                    >
                      Información
                    </TableCell>

                    <TableCell
                      sx={{ width: "25%" }}
                    >
                      URL pública
                    </TableCell>

                    <TableCell
                      sx={{ width: "13%" }}
                    >
                      Uso
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{ width: "12%" }}
                    >
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {media.map((item) => (
                    <TableRow
                      key={item.id}
                      hover
                      sx={{
                        "&:last-child td": {
                          borderBottom: 0,
                        },
                      }}
                    >
                      {/* VISTA */}
                      <TableCell>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            maxWidth: "100%",
                            borderRadius: 1.5,
                            overflow: "hidden",
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <MediaPreview
                            media={item}
                            height={48}
                          />
                        </Box>
                      </TableCell>

                      {/* ARCHIVO */}
                      <TableCell>
                        <Tooltip
                          title={
                            item.original_filename
                          }
                        >
                          <Typography
                            fontWeight={800}
                            noWrap
                            sx={{
                              width: "100%",
                              fontSize: "0.76rem",
                            }}
                          >
                            {
                              item.original_filename
                            }
                          </Typography>
                        </Tooltip>

                        <Tooltip
                          title={item.filename}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            sx={{
                              display: "block",
                              width: "100%",
                              fontSize: "0.65rem",
                            }}
                          >
                            {item.filename}
                          </Typography>
                        </Tooltip>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            mt: 0.4,
                            fontSize: "0.61rem",
                            lineHeight: 1.25,
                          }}
                        >
                          {formatDate(
                            item.created_at
                          )}
                        </Typography>
                      </TableCell>

                      {/* DETALLES */}
                      <TableCell>
                        <Stack spacing={0.35}>
                          <Chip
                            label={getExtension(item)}
                            size="small"
                            variant="outlined"
                            sx={{
                              width: "fit-content",
                              maxWidth: "100%",
                              height: 21,
                              fontSize: "0.62rem",

                              "& .MuiChip-label": {
                                px: 0.7,
                              },
                            }}
                          />

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            sx={{
                              fontSize: "0.66rem",
                            }}
                          >
                            {getDimensions(item)}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            sx={{
                              fontSize: "0.66rem",
                            }}
                          >
                            {item.size_kb} KB
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* INFORMACIÓN */}
                      <TableCell>
                        <Tooltip
                          title={
                            item.alt_text ||
                            "Sin texto alternativo"
                          }
                        >
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{
                              width: "100%",
                              fontSize: "0.73rem",
                              fontWeight: 700,
                            }}
                          >
                            {item.alt_text ||
                              "Sin texto alternativo"}
                          </Typography>
                        </Tooltip>

                        <Tooltip
                          title={
                            item.caption ||
                            "Sin descripción"
                          }
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            sx={{
                              display: "block",
                              width: "100%",
                              fontSize: "0.65rem",
                            }}
                          >
                            {item.caption ||
                              "Sin descripción"}
                          </Typography>
                        </Tooltip>
                      </TableCell>

                      {/* URL PÚBLICA */}
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <TextField
                            fullWidth
                            size="small"
                            value={item.url}
                            aria-label={`URL pública de ${item.original_filename}`}
                            InputProps={{
                              readOnly: true,
                            }}
                            inputProps={{
                              onFocus: (
                                event
                              ) => {
                                event.currentTarget.select();
                              },
                              onClick: (
                                event
                              ) => {
                                event.currentTarget.select();
                              },
                            }}
                            sx={{
                              minWidth: 0,

                              "& .MuiInputBase-root": {
                                height: 32,
                              },

                              "& input": {
                                px: 1,
                                py: 0.5,
                                fontSize: "0.67rem",
                              },
                            }}
                          />

                          <Tooltip title="Copiar URL">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() =>
                                void handleCopyMediaUrl(
                                  item
                                )
                              }
                              aria-label={`Copiar URL pública de ${item.original_filename}`}
                            >
                              <ContentCopyOutlinedIcon
                                sx={{
                                  fontSize: 18,
                                }}
                              />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Abrir imagen">
                            <IconButton
                              component="a"
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              size="small"
                              aria-label={`Abrir ${item.original_filename}`}
                            >
                              <OpenInNewOutlinedIcon
                                sx={{
                                  fontSize: 18,
                                }}
                              />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>

                      {/* USO */}
                      <TableCell>
                        <Stack spacing={0.3}>
                          <Typography
                            variant="caption"
                            noWrap
                            sx={{
                              fontSize: "0.65rem",
                            }}
                          >
                            Portadas:{" "}
                            <strong>
                              {item.usage
                                ?.cover_posts ?? 0}
                            </strong>
                          </Typography>

                          <Typography
                            variant="caption"
                            noWrap
                            sx={{
                              fontSize: "0.65rem",
                            }}
                          >
                            Open Graph:{" "}
                            <strong>
                              {item.usage
                                ?.open_graph_posts ??
                                0}
                            </strong>
                          </Typography>

                          <Chip
                            label={
                              isMediaInUse(item)
                                ? "En uso"
                                : "Sin uso"
                            }
                            color={
                              isMediaInUse(item)
                                ? "success"
                                : "default"
                            }
                            size="small"
                            sx={{
                              width: "100%",
                              maxWidth: 90,
                              height: 20,
                              fontSize: "0.61rem",

                              "& .MuiChip-label": {
                                px: 0.6,
                              },
                            }}
                          />
                        </Stack>
                      </TableCell>

                      {/* ACCIONES */}
                      <TableCell align="center">
                        {renderActions(item)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        ) : (
          /* TARJETAS EN MÓVIL */
          <Grid container spacing={2}>
            {media.map((item) => (
              <Grid
                item
                xs={12}
                sm={6}
                key={item.id}
              >
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    overflow: "hidden",
                  }}
                >
                  <MediaPreview
                    media={item}
                    height={220}
                  />

                  <CardContent>
                    <Stack spacing={2}>
                      <Box>
                        <Typography
                          variant="h6"
                          fontWeight={900}
                          sx={{
                            wordBreak:
                              "break-word",
                          }}
                        >
                          {
                            item.original_filename
                          }
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            wordBreak:
                              "break-word",
                          }}
                        >
                          {item.filename}
                        </Typography>
                      </Box>

                      {/* DETALLES */}
                      <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        flexWrap="wrap"
                      >
                        <Chip
                          label={getExtension(item)}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />

                        <Chip
                          label={getDimensions(item)}
                          size="small"
                          variant="outlined"
                        />

                        <Chip
                          label={`${item.size_kb} KB`}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        <strong>
                          Texto alternativo:
                        </strong>{" "}
                        {item.alt_text ||
                          "Sin registrar"}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        <strong>
                          Descripción:
                        </strong>{" "}
                        {item.caption ||
                          "Sin registrar"}
                      </Typography>

                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight={800}
                          sx={{ mb: 0.75 }}
                        >
                          URL pública
                        </Typography>

                        <Stack
                          direction="row"
                          spacing={0.75}
                          alignItems="center"
                        >
                          <TextField
                            fullWidth
                            size="small"
                            value={item.url}
                            InputProps={{
                              readOnly: true,
                            }}
                            inputProps={{
                              onFocus: (
                                event
                              ) => {
                                event.currentTarget.select();
                              },
                              onClick: (
                                event
                              ) => {
                                event.currentTarget.select();
                              },
                            }}
                          />

                          <Tooltip title="Copiar URL">
                            <IconButton
                              color="primary"
                              onClick={() =>
                                void handleCopyMediaUrl(
                                  item
                                )
                              }
                            >
                              <ContentCopyOutlinedIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Abrir imagen">
                            <IconButton
                              component="a"
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <OpenInNewOutlinedIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Box>

                      <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        flexWrap="wrap"
                      >
                        <Chip
                          label={`Portadas: ${
                            item.usage
                              ?.cover_posts ?? 0
                          }`}
                          size="small"
                        />

                        <Chip
                          label={`Open Graph: ${
                            item.usage
                              ?.open_graph_posts ??
                            0
                          }`}
                          size="small"
                        />

                        <Chip
                          label={
                            isMediaInUse(item)
                              ? "En uso"
                              : "Sin uso"
                          }
                          color={
                            isMediaInUse(item)
                              ? "success"
                              : "default"
                          }
                          size="small"
                        />
                      </Stack>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Fecha de carga:{" "}
                        {formatDate(
                          item.created_at
                        )}
                      </Typography>

                      <Divider />

                      <Stack spacing={1}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={
                            <ContentCopyOutlinedIcon />
                          }
                          onClick={() =>
                            void handleCopyMediaUrl(
                              item
                            )
                          }
                          sx={{
                            textTransform:
                              "none",
                            fontWeight: 800,
                          }}
                        >
                          Copiar URL pública
                        </Button>

                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={
                            <VisibilityOutlinedIcon />
                          }
                          onClick={() =>
                            setSelectedMedia(
                              item
                            )
                          }
                          sx={{
                            textTransform:
                              "none",
                            fontWeight: 800,
                          }}
                        >
                          Ver imagen
                        </Button>

                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={
                            <EditOutlinedIcon />
                          }
                          onClick={() =>
                            openEditDialog(
                              item
                            )
                          }
                          sx={{
                            textTransform:
                              "none",
                            fontWeight: 800,
                          }}
                        >
                          Editar información
                        </Button>

                        <Button
                          fullWidth
                          variant="outlined"
                          color="error"
                          startIcon={
                            <DeleteOutlineIcon />
                          }
                          disabled={
                            isMediaInUse(item)
                          }
                          onClick={() =>
                            openDeleteDialog(
                              item
                            )
                          }
                          sx={{
                            textTransform:
                              "none",
                            fontWeight: 800,
                          }}
                        >
                          {isMediaInUse(item)
                            ? "Imagen en uso"
                            : "Eliminar"}
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

      {/* MODAL SUBIR IMAGEN */}
      <Dialog
        open={uploadOpen}
        onClose={closeUploadDialog}
        fullWidth
        maxWidth="sm"
        fullScreen={!isDesktop}
      >
        <DialogTitle>
          <Typography
            variant="h6"
            fontWeight={900}
          >
            Subir imagen
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Selecciona una imagen y registra su
            información descriptiva.
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5}>
            {uploadError && (
              <Alert severity="error">
                {uploadError}
              </Alert>
            )}

            <Button
              component="label"
              variant="outlined"
              startIcon={
                <AddPhotoAlternateIcon />
              }
              disabled={uploading}
              sx={{
                minHeight: 48,
                textTransform: "none",
                fontWeight: 800,
              }}
            >
              Seleccionar imagen

              <Box
                component="input"
                hidden
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file =
                    event.target.files?.[0] ??
                    null;

                  handleFileSelected(file);

                  event.target.value = "";
                }}
              />
            </Button>

            {uploadFile && (
              <Alert severity="info">
                Archivo seleccionado:{" "}
                <strong>
                  {uploadFile.name}
                </strong>
              </Alert>
            )}

            {uploadPreview && (
              <Box
                sx={{
                  minHeight: 240,
                  maxHeight: 420,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  bgcolor: "action.hover",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <Box
                  component="img"
                  src={uploadPreview}
                  alt="Vista previa"
                  sx={{
                    maxWidth: "100%",
                    maxHeight: 420,
                    objectFit: "contain",
                  }}
                />
              </Box>
            )}

            <TextField
              fullWidth
              label="Texto alternativo"
              placeholder="Describe brevemente la imagen"
              value={uploadAltText}
              onChange={(event) =>
                setUploadAltText(
                  event.target.value
                )
              }
              helperText="Se utiliza para accesibilidad y SEO."
              disabled={uploading}
            />

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Descripción"
              placeholder="Información adicional de la imagen"
              value={uploadCaption}
              onChange={(event) =>
                setUploadCaption(
                  event.target.value
                )
              }
              disabled={uploading}
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
            onClick={closeUploadDialog}
            disabled={uploading}
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
            startIcon={
              uploading ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <AddPhotoAlternateIcon />
              )
            }
            disabled={
              uploading || !uploadFile
            }
            onClick={() =>
              void handleUploadMedia()
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
            {uploading
              ? "Subiendo..."
              : "Subir imagen"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL EDITAR */}
      <Dialog
        open={Boolean(editingMedia)}
        onClose={closeEditDialog}
        fullWidth
        maxWidth="sm"
        fullScreen={!isDesktop}
      >
        <DialogTitle>
          <Typography
            variant="h6"
            fontWeight={900}
          >
            Editar información
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {editingMedia?.original_filename}
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5}>
            {editError && (
              <Alert severity="error">
                {editError}
              </Alert>
            )}

            {editingMedia && (
              <Box
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  bgcolor: "action.hover",
                }}
              >
                <MediaPreview
                  media={editingMedia}
                  height={280}
                  objectFit="contain"
                />
              </Box>
            )}

            <TextField
              fullWidth
              label="Texto alternativo"
              value={editAltText}
              onChange={(event) =>
                setEditAltText(
                  event.target.value
                )
              }
              helperText="Se utiliza para accesibilidad y SEO."
              disabled={updating}
            />

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Descripción"
              value={editCaption}
              onChange={(event) =>
                setEditCaption(
                  event.target.value
                )
              }
              disabled={updating}
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
            onClick={closeEditDialog}
            disabled={updating}
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
            startIcon={
              updating ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <EditOutlinedIcon />
              )
            }
            disabled={updating}
            onClick={() =>
              void handleUpdateMedia()
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
            {updating
              ? "Guardando..."
              : "Guardar cambios"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL VISUALIZAR */}
      <Dialog
        open={Boolean(selectedMedia)}
        onClose={() =>
          setSelectedMedia(null)
        }
        fullWidth
        maxWidth="md"
        fullScreen={!isDesktop}
      >
        <DialogTitle>
          <Typography
            variant="h6"
            fontWeight={900}
          >
            Vista de imagen
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {selectedMedia?.original_filename}
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          {selectedMedia && (
            <Stack spacing={3}>
              <Box
                sx={{
                  minHeight: 320,
                  maxHeight: 650,
                  bgcolor: "action.hover",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <MediaPreview
                  media={selectedMedia}
                  height={600}
                  objectFit="contain"
                />
              </Box>

              <Card
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Stack spacing={1.25}>
                    <Typography fontWeight={900}>
                      URL pública
                    </Typography>

                    <Stack
                      direction={{
                        xs: "column",
                        sm: "row",
                      }}
                      spacing={1}
                      alignItems={{
                        xs: "stretch",
                        sm: "center",
                      }}
                    >
                      <TextField
                        fullWidth
                        size="small"
                        value={selectedMedia.url}
                        InputProps={{
                          readOnly: true,
                        }}
                        inputProps={{
                          onFocus: (
                            event
                          ) => {
                            event.currentTarget.select();
                          },
                          onClick: (
                            event
                          ) => {
                            event.currentTarget.select();
                          },
                        }}
                      />

                      <Button
                        variant="contained"
                        startIcon={
                          <ContentCopyOutlinedIcon />
                        }
                        onClick={() =>
                          void handleCopyMediaUrl(
                            selectedMedia
                          )
                        }
                        sx={{
                          flexShrink: 0,
                          textTransform: "none",
                          fontWeight: 800,
                        }}
                      >
                        Copiar URL
                      </Button>

                      <Button
                        component="a"
                        href={selectedMedia.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outlined"
                        startIcon={
                          <OpenInNewOutlinedIcon />
                        }
                        sx={{
                          flexShrink: 0,
                          textTransform: "none",
                          fontWeight: 800,
                        }}
                      >
                        Abrir
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <Grid container spacing={2}>
                <Grid
                  item
                  xs={12}
                  md={6}
                >
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 3,
                    }}
                  >
                    <CardContent>
                      <Stack spacing={1}>
                        <Typography fontWeight={900}>
                          Archivo
                        </Typography>

                        <Typography variant="body2">
                          Nombre:{" "}
                          {
                            selectedMedia.original_filename
                          }
                        </Typography>

                        <Typography variant="body2">
                          Formato:{" "}
                          {getExtension(
                            selectedMedia
                          )}
                        </Typography>

                        <Typography variant="body2">
                          MIME:{" "}
                          {selectedMedia.mime_type}
                        </Typography>

                        <Typography variant="body2">
                          Tamaño:{" "}
                          {selectedMedia.size_kb} KB
                        </Typography>

                        <Typography variant="body2">
                          Dimensiones:{" "}
                          {getDimensions(
                            selectedMedia
                          )}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid
                  item
                  xs={12}
                  md={6}
                >
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 3,
                    }}
                  >
                    <CardContent>
                      <Stack spacing={1}>
                        <Typography fontWeight={900}>
                          Información
                        </Typography>

                        <Typography variant="body2">
                          Texto alternativo:{" "}
                          {selectedMedia.alt_text ||
                            "Sin registrar"}
                        </Typography>

                        <Typography variant="body2">
                          Descripción:{" "}
                          {selectedMedia.caption ||
                            "Sin registrar"}
                        </Typography>

                        <Typography variant="body2">
                          Fecha de carga:{" "}
                          {formatDate(
                            selectedMedia.created_at
                          )}
                        </Typography>

                        <Typography variant="body2">
                          Uso como portada:{" "}
                          {selectedMedia.usage
                            ?.cover_posts ?? 0}
                        </Typography>

                        <Typography variant="body2">
                          Uso en Open Graph:{" "}
                          {selectedMedia.usage
                            ?.open_graph_posts ?? 0}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() =>
              setSelectedMedia(null)
            }
            sx={{
              textTransform: "none",
              fontWeight: 800,
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* CONFIRMACIÓN DE ELIMINACIÓN */}
      <Dialog
        open={Boolean(mediaToDelete)}
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
              Eliminar imagen
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            <Typography>
              ¿Estás seguro de que deseas eliminar{" "}
              <strong>
                “
                {mediaToDelete
                  ?.original_filename ?? ""}
                ”
              </strong>
              ?
            </Typography>

            <Alert severity="warning">
              Esta acción eliminará el archivo físico y
              no se puede deshacer.
            </Alert>

            {mediaToDelete &&
              isMediaInUse(mediaToDelete) && (
                <Alert severity="error">
                  La imagen está utilizada como portada
                  o imagen Open Graph. Debes retirarla de
                  las publicaciones antes de eliminarla.
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
            disabled={
              deleting ||
              Boolean(
                mediaToDelete &&
                  isMediaInUse(
                    mediaToDelete
                  )
              )
            }
            onClick={() =>
              void handleDeleteMedia()
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
            {deleting
              ? "Eliminando..."
              : "Sí, eliminar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}