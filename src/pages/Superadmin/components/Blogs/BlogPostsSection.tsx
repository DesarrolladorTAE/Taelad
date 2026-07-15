import {
  type MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import DOMPurify from "dompurify";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  OutlinedInput,
  Pagination,
  Select,
  Stack,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArticleIcon from "@mui/icons-material/Article";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PublishOutlinedIcon from "@mui/icons-material/PublishOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import BlogRichTextEditor from "./BlogRichTextEditor";

import {
  blogApi,
  type BlogCategory,
  type BlogMedia,
  type BlogPost,
  type BlogPostListParams,
  type BlogPostMedia,
  type BlogPostPayload,
  type BlogPostStatus,
  type BlogTag,
} from "../../../../services/api/blogs";

type Props = {
  systemId: number;
  systemName: string;
  blogId: number;
  blogName: string;
  onBack: () => void;
};

type StatusFilter = "all" | BlogPostStatus;

type FeaturedFilter =
  | "all"
  | "featured"
  | "normal";

type FormTab = 0 | 1 | 2 | 3;

type PostForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;

  category_id: number | "";
  cover_media_id: number | "";
  tag_ids: number[];

  is_featured: boolean;
  allow_comments: boolean;

  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  canonical_url: string;
  robots_index: boolean;
  robots_follow: boolean;

  og_title: string;
  og_description: string;
  og_image_media_id: number | "";
};

type PostFormErrors = {
  title?: string;
  slug?: string;
  excerpt?: string;
  canonical_url?: string;
};

type ApiErrorData = {
  message?: string;
  errors?: Record<string, string[] | string>;
};

type ConfirmationAction =
  | "publish"
  | "archive"
  | "delete";

type ConfirmationState = {
  action: ConfirmationAction;
  post: BlogPost;
} | null;

const EMPTY_FORM: PostForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",

  category_id: "",
  cover_media_id: "",
  tag_ids: [],

  is_featured: false,
  allow_comments: true,

  seo_title: "",
  seo_description: "",
  seo_keywords: "",
  canonical_url: "",
  robots_index: true,
  robots_follow: true,

  og_title: "",
  og_description: "",
  og_image_media_id: "",
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

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

function getStatusLabel(status: BlogPostStatus): string {
  const labels: Record<BlogPostStatus, string> = {
    draft: "Borrador",
    scheduled: "Programada",
    published: "Publicada",
    archived: "Archivada",
  };

  return labels[status];
}

function getStatusColor(
  status: BlogPostStatus
): "default" | "warning" | "success" | "info" {
  const colors: Record<
    BlogPostStatus,
    "default" | "warning" | "success" | "info"
  > = {
    draft: "default",
    scheduled: "warning",
    published: "success",
    archived: "info",
  };

  return colors[status];
}

function getCoverMedia(
  post: BlogPost
): BlogPostMedia | null {
  return post.cover_media ?? null;
}

function getOpenGraphMedia(
  post: BlogPost
): BlogPostMedia | null {
  return (
    post.open_graph?.image_media ??
    post.og_image_media ??
    post.ogImageMedia ??
    null
  );
}

function validateForm(
  form: PostForm
): PostFormErrors {
  const errors: PostFormErrors = {};

  if (!form.title.trim()) {
    errors.title = "El título es obligatorio.";
  } else if (form.title.trim().length > 200) {
    errors.title =
      "El título no puede superar 200 caracteres.";
  }

  if (!form.slug.trim()) {
    errors.slug = "El slug es obligatorio.";
  } else if (form.slug.trim().length > 220) {
    errors.slug =
      "El slug no puede superar 220 caracteres.";
  } else if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
      form.slug.trim()
    )
  ) {
    errors.slug =
      "El slug solo admite letras minúsculas, números y guiones.";
  }

  if (form.excerpt.length > 1000) {
    errors.excerpt =
      "El extracto no puede superar 1000 caracteres.";
  }

  if (form.canonical_url.trim()) {
    try {
      new URL(form.canonical_url.trim());
    } catch {
      errors.canonical_url =
        "La URL canónica no es válida.";
    }
  }

  return errors;
}

function getMinimumScheduleDate(): string {
  const date = new Date(Date.now() + 5 * 60 * 1000);
  const timezoneOffset = date.getTimezoneOffset();

  return new Date(
    date.getTime() - timezoneOffset * 60 * 1000
  )
    .toISOString()
    .slice(0, 16);
}

function MediaThumbnail({
  media,
  height = 56,
  objectFit = "cover",
}: {
  media: BlogPostMedia | BlogMedia | null;
  height?: number;
  objectFit?: "cover" | "contain";
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [media?.url]);

  if (!media?.url || failed) {
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
        <BrokenImageIcon />
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={media.url}
      alt={
        media.alt_text ??
        ("original_filename" in media
          ? media.original_filename
          : "Imagen de publicación")
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

export default function BlogPostsSection({
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

  const [posts, setPosts] =
    useState<BlogPost[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  const [status, setStatus] =
    useState<StatusFilter>("all");

  const [categoryFilter, setCategoryFilter] =
    useState<number | "">("");

  const [featuredFilter, setFeaturedFilter] =
    useState<FeaturedFilter>("all");

  /*
  |--------------------------------------------------------------------------
  | CATÁLOGOS
  |--------------------------------------------------------------------------
  */

  const [categories, setCategories] =
    useState<BlogCategory[]>([]);

  const [tags, setTags] =
    useState<BlogTag[]>([]);

  const [media, setMedia] =
    useState<BlogMedia[]>([]);

  const [lookupsLoading, setLookupsLoading] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | FORMULARIO
  |--------------------------------------------------------------------------
  */

  const [formOpen, setFormOpen] =
    useState(false);

  const [editingPost, setEditingPost] =
    useState<BlogPost | null>(null);

  const [form, setForm] =
    useState<PostForm>(EMPTY_FORM);

  const [formErrors, setFormErrors] =
    useState<PostFormErrors>({});

  const [formError, setFormError] =
    useState<string | null>(null);

  const [formLoading, setFormLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [formTab, setFormTab] =
    useState<FormTab>(0);

  const [slugEdited, setSlugEdited] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | VISTA COMPLETA
  |--------------------------------------------------------------------------
  */

  const [selectedPost, setSelectedPost] =
    useState<BlogPost | null>(null);

  const [previewLoading, setPreviewLoading] =
    useState(false);

  const [previewError, setPreviewError] =
    useState<string | null>(null);

  /*
  |--------------------------------------------------------------------------
  | MENÚ DE ACCIONES
  |--------------------------------------------------------------------------
  */

  const [actionAnchor, setActionAnchor] =
    useState<HTMLElement | null>(null);

  const [actionPost, setActionPost] =
    useState<BlogPost | null>(null);

  /*
  |--------------------------------------------------------------------------
  | CONFIRMACIÓN
  |--------------------------------------------------------------------------
  */

  const [confirmation, setConfirmation] =
    useState<ConfirmationState>(null);

  const [processingAction, setProcessingAction] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | PROGRAMACIÓN
  |--------------------------------------------------------------------------
  */

  const [schedulingPost, setSchedulingPost] =
    useState<BlogPost | null>(null);

  const [scheduledAt, setScheduledAt] =
    useState("");

  const [scheduleError, setScheduleError] =
    useState<string | null>(null);

  const [scheduling, setScheduling] =
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
  | CONSULTAR PUBLICACIONES
  |--------------------------------------------------------------------------
  */

  const loadPosts = useCallback(
    async (selectedPage: number) => {
      try {
        setLoading(true);
        setError(null);

        const params: BlogPostListParams = {
          page: selectedPage,
          per_page: 16,
        };

        if (debouncedSearch) {
          params.search = debouncedSearch;
        }

        if (status !== "all") {
          params.status = status;
        }

        if (categoryFilter !== "") {
          params.category_id =
            Number(categoryFilter);
        }

        if (featuredFilter === "featured") {
          params.is_featured = true;
        }

        if (featuredFilter === "normal") {
          params.is_featured = false;
        }

        const response = await blogApi.posts(
          systemId,
          blogId,
          params
        );

        const payload = response.data;

        setPosts(payload.data ?? []);
        setLastPage(payload.meta?.last_page ?? 1);
        setTotal(payload.meta?.total ?? 0);
      } catch (requestError) {
        setPosts([]);

        setError(
          getErrorMessage(
            requestError,
            "No fue posible consultar las publicaciones."
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
      status,
      categoryFilter,
      featuredFilter,
    ]
  );

  useEffect(() => {
    void loadPosts(page);
  }, [loadPosts, page]);

  /*
  |--------------------------------------------------------------------------
  | CATÁLOGOS
  |--------------------------------------------------------------------------
  */

  const loadLookups = useCallback(async () => {
    try {
      setLookupsLoading(true);

      const [
        categoriesResponse,
        tagsResponse,
        mediaResponse,
      ] = await Promise.all([
        blogApi.categories(systemId, blogId, {
          page: 1,
          per_page: 100,
        }),

        blogApi.tags(systemId, blogId, {
          page: 1,
          per_page: 100,
        }),

        blogApi.media(systemId, blogId, {
          page: 1,
          per_page: 100,
        }),
      ]);

      setCategories(
        categoriesResponse.data.data ?? []
      );

      setTags(tagsResponse.data.data ?? []);

      setMedia(mediaResponse.data.data ?? []);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "No fue posible consultar categorías, etiquetas e imágenes."
        )
      );
    } finally {
      setLookupsLoading(false);
    }
  }, [systemId, blogId]);

  useEffect(() => {
    void loadLookups();
  }, [loadLookups]);

  /*
  |--------------------------------------------------------------------------
  | FILTROS
  |--------------------------------------------------------------------------
  */

  function clearFilters() {
    setSearch("");
    setDebouncedSearch("");
    setStatus("all");
    setCategoryFilter("");
    setFeaturedFilter("all");
    setPage(1);
  }

  /*
  |--------------------------------------------------------------------------
  | FORMULARIO
  |--------------------------------------------------------------------------
  */

  function mapPostToForm(
    post: BlogPost
  ): PostForm {
    return {
      title: post.title ?? "",
      slug: post.slug ?? "",
      excerpt: post.excerpt ?? "",
      content: post.content ?? "",

      category_id:
        post.category_id ?? "",

      cover_media_id:
        post.cover_media_id ?? "",

      tag_ids:
        post.tags?.map((tag) => tag.id) ?? [],

      is_featured:
        Boolean(post.is_featured),

      allow_comments:
        Boolean(post.allow_comments),

      seo_title:
        post.seo?.title ?? "",

      seo_description:
        post.seo?.description ?? "",

      seo_keywords:
        post.seo?.keywords ?? "",

      canonical_url:
        post.seo?.canonical_url ?? "",

      robots_index:
        post.seo?.robots_index ?? true,

      robots_follow:
        post.seo?.robots_follow ?? true,

      og_title:
        post.open_graph?.title ?? "",

      og_description:
        post.open_graph?.description ?? "",

      og_image_media_id:
        post.open_graph?.image_media_id ?? "",
    };
  }

  function openCreateDialog() {
    setEditingPost(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormError(null);
    setFormTab(0);
    setSlugEdited(false);
    setFormLoading(false);
    setFormOpen(true);
  }

  async function openEditDialog(post: BlogPost) {
    closeActionMenu();

    setEditingPost(post);
    setForm(mapPostToForm(post));
    setFormOpen(true);
    setFormLoading(true);
    setFormError(null);
    setFormErrors({});
    setFormTab(0);
    setSlugEdited(true);

    try {
      const response = await blogApi.post(
        systemId,
        blogId,
        post.id
      );

      const detailedPost = response.data.data;

      setEditingPost(detailedPost);
      setForm(mapPostToForm(detailedPost));
    } catch (requestError) {
      setFormError(
        getErrorMessage(
          requestError,
          "No fue posible consultar la publicación."
        )
      );
    } finally {
      setFormLoading(false);
    }
  }

  function resetFormDialog() {
    setFormOpen(false);
    setEditingPost(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormError(null);
    setFormTab(0);
    setSlugEdited(false);
    setFormLoading(false);
  }

  function closeFormDialog() {
    if (saving || formLoading) {
      return;
    }

    resetFormDialog();
  }

  function handleTitleChange(value: string) {
    setForm((current) => ({
      ...current,
      title: value,
      slug: slugEdited
        ? current.slug
        : slugify(value),
    }));

    setFormErrors((current) => ({
      ...current,
      title: undefined,
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

  async function handleSavePost() {
    const validationErrors =
      validateForm(form);

    setFormErrors(validationErrors);
    setFormError(null);

    if (
      Object.keys(validationErrors).length > 0
    ) {
      setFormTab(0);
      return;
    }

    const payload: BlogPostPayload = {
      title: form.title.trim(),
      slug: form.slug.trim(),

      excerpt:
        form.excerpt.trim() || null,

      content:
        form.content.trim() || null,

      category_id:
        form.category_id === ""
          ? null
          : Number(form.category_id),

      cover_media_id:
        form.cover_media_id === ""
          ? null
          : Number(form.cover_media_id),

      tag_ids: form.tag_ids,

      is_featured: form.is_featured,
      allow_comments: form.allow_comments,

      seo_title:
        form.seo_title.trim() || null,

      seo_description:
        form.seo_description.trim() || null,

      seo_keywords:
        form.seo_keywords.trim() || null,

      canonical_url:
        form.canonical_url.trim() || null,

      robots_index: form.robots_index,
      robots_follow: form.robots_follow,

      og_title:
        form.og_title.trim() || null,

      og_description:
        form.og_description.trim() || null,

      og_image_media_id:
        form.og_image_media_id === ""
          ? null
          : Number(form.og_image_media_id),
    };

    try {
      setSaving(true);
      setFormError(null);
      setError(null);
      setSuccess(null);

      if (editingPost) {
        const response =
          await blogApi.updatePost(
            systemId,
            blogId,
            editingPost.id,
            payload
          );

        setSuccess(
          response.data.message ||
            "Publicación actualizada correctamente."
        );
      } else {
        const response =
          await blogApi.createPost(
            systemId,
            blogId,
            payload
          );

        setSuccess(
          response.data.message ||
            "Publicación creada como borrador."
        );
      }

      resetFormDialog();

      if (page !== 1 && !editingPost) {
        setPage(1);
      } else {
        await loadPosts(page);
      }
    } catch (requestError) {
      setFormError(
        getErrorMessage(
          requestError,
          editingPost
            ? "No fue posible actualizar la publicación."
            : "No fue posible crear la publicación."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | VISTA COMPLETA
  |--------------------------------------------------------------------------
  */

  async function openPreviewDialog(
    post: BlogPost
  ) {
    closeActionMenu();

    setSelectedPost(post);
    setPreviewLoading(true);
    setPreviewError(null);

    try {
      const response = await blogApi.post(
        systemId,
        blogId,
        post.id
      );

      setSelectedPost(response.data.data);
    } catch (requestError) {
      setPreviewError(
        getErrorMessage(
          requestError,
          "No fue posible consultar la publicación."
        )
      );
    } finally {
      setPreviewLoading(false);
    }
  }

  function closePreviewDialog() {
    if (previewLoading) {
      return;
    }

    setSelectedPost(null);
    setPreviewError(null);
  }

  /*
  |--------------------------------------------------------------------------
  | MENÚ DE ACCIONES
  |--------------------------------------------------------------------------
  */

  function openActionMenu(
    event: MouseEvent<HTMLElement>,
    post: BlogPost
  ) {
    setActionAnchor(event.currentTarget);
    setActionPost(post);
  }

  function closeActionMenu() {
    setActionAnchor(null);
    setActionPost(null);
  }

  /*
  |--------------------------------------------------------------------------
  | CONFIRMACIONES
  |--------------------------------------------------------------------------
  */

  function openConfirmation(
    action: ConfirmationAction,
    post: BlogPost
  ) {
    closeActionMenu();

    setConfirmation({
      action,
      post,
    });
  }

  function closeConfirmation() {
    if (processingAction) {
      return;
    }

    setConfirmation(null);
  }

  async function handleConfirmedAction() {
    if (!confirmation) {
      return;
    }

    const { action, post } = confirmation;

    try {
      setProcessingAction(true);
      setError(null);
      setSuccess(null);

      if (action === "publish") {
        const response =
          await blogApi.publishPost(
            systemId,
            blogId,
            post.id
          );

        setSuccess(
          response.data.message ||
            "Publicación publicada correctamente."
        );
      }

      if (action === "archive") {
        const response =
          await blogApi.archivePost(
            systemId,
            blogId,
            post.id
          );

        setSuccess(
          response.data.message ||
            "Publicación archivada correctamente."
        );
      }

      if (action === "delete") {
        const response =
          await blogApi.deletePost(
            systemId,
            blogId,
            post.id
          );

        setSuccess(
          response.data.message ||
            "Publicación eliminada correctamente."
        );

        setSelectedPost((current) =>
          current?.id === post.id
            ? null
            : current
        );
      }

      const returnPreviousPage =
        action === "delete" &&
        posts.length === 1 &&
        page > 1;

      setConfirmation(null);

      if (returnPreviousPage) {
        setPage((current) => current - 1);
      } else {
        await loadPosts(page);
      }
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "No fue posible completar la acción."
        )
      );
    } finally {
      setProcessingAction(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | PROGRAMACIÓN
  |--------------------------------------------------------------------------
  */

  function openScheduleDialog(post: BlogPost) {
    closeActionMenu();

    setSchedulingPost(post);
    setScheduledAt("");
    setScheduleError(null);
  }

  function closeScheduleDialog() {
    if (scheduling) {
      return;
    }

    setSchedulingPost(null);
    setScheduledAt("");
    setScheduleError(null);
  }

  async function handleSchedulePost() {
    if (!schedulingPost) {
      return;
    }

    if (!scheduledAt) {
      setScheduleError(
        "Selecciona una fecha y hora."
      );
      return;
    }

    const date = new Date(scheduledAt);

    if (Number.isNaN(date.getTime())) {
      setScheduleError(
        "La fecha seleccionada no es válida."
      );
      return;
    }

    if (date.getTime() <= Date.now()) {
      setScheduleError(
        "La fecha debe ser posterior al momento actual."
      );
      return;
    }

    try {
      setScheduling(true);
      setScheduleError(null);
      setError(null);
      setSuccess(null);

      const response =
        await blogApi.schedulePost(
          systemId,
          blogId,
          schedulingPost.id,
          {
            scheduled_at: date.toISOString(),
          }
        );

      setSuccess(
        response.data.message ||
          "Publicación programada correctamente."
      );

      setSchedulingPost(null);
      setScheduledAt("");

      await loadPosts(page);
    } catch (requestError) {
      setScheduleError(
        getErrorMessage(
          requestError,
          "No fue posible programar la publicación."
        )
      );
    } finally {
      setScheduling(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | DATOS DERIVADOS
  |--------------------------------------------------------------------------
  */

  const selectedTagNames = useMemo(() => {
    return form.tag_ids
      .map(
        (tagId) =>
          tags.find((tag) => tag.id === tagId)
            ?.name
      )
      .filter(
        (name): name is string =>
          Boolean(name)
      );
  }, [form.tag_ids, tags]);

  const selectedCoverMedia = useMemo(() => {
    if (form.cover_media_id === "") {
      return null;
    }

    return (
      media.find(
        (item) =>
          item.id ===
          Number(form.cover_media_id)
      ) ?? null
    );
  }, [form.cover_media_id, media]);

  const selectedOgMedia = useMemo(() => {
    if (form.og_image_media_id === "") {
      return null;
    }

    return (
      media.find(
        (item) =>
          item.id ===
          Number(form.og_image_media_id)
      ) ?? null
    );
  }, [form.og_image_media_id, media]);

  function getConfirmationTitle(): string {
    switch (confirmation?.action) {
      case "publish":
        return "Publicar contenido";

      case "archive":
        return "Archivar publicación";

      case "delete":
        return "Eliminar publicación";

      default:
        return "";
    }
  }

  function getConfirmationText(): string {
    switch (confirmation?.action) {
      case "publish":
        return "La publicación quedará visible inmediatamente.";

      case "archive":
        return "La publicación dejará de estar disponible como contenido activo.";

      case "delete":
        return "Esta acción eliminará definitivamente la publicación.";

      default:
        return "";
    }
  }

  function getConfirmationButton(): string {
    switch (confirmation?.action) {
      case "publish":
        return "Sí, publicar";

      case "archive":
        return "Sí, archivar";

      case "delete":
        return "Sí, eliminar";

      default:
        return "Continuar";
    }
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
              Publicaciones
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
              disabled={lookupsLoading}
              sx={{
                textTransform: "none",
                fontWeight: 800,
              }}
            >
              Nueva publicación
            </Button>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                void loadPosts(page);
                void loadLookups();
              }}
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
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Buscar publicación"
                  placeholder="Título, slug o extracto"
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

              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel id="post-status-filter">
                    Estado
                  </InputLabel>

                  <Select
                    labelId="post-status-filter"
                    label="Estado"
                    value={status}
                    onChange={(event) => {
                      setPage(1);

                      setStatus(
                        event.target
                          .value as StatusFilter
                      );
                    }}
                  >
                    <MenuItem value="all">
                      Todos
                    </MenuItem>

                    <MenuItem value="draft">
                      Borradores
                    </MenuItem>

                    <MenuItem value="scheduled">
                      Programadas
                    </MenuItem>

                    <MenuItem value="published">
                      Publicadas
                    </MenuItem>

                    <MenuItem value="archived">
                      Archivadas
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel id="post-category-filter">
                    Categoría
                  </InputLabel>

                  <Select
                    labelId="post-category-filter"
                    label="Categoría"
                    value={categoryFilter}
                    onChange={(event) => {
                      const value =
                        event.target.value;

                      setPage(1);

                      setCategoryFilter(
                        value === ""
                          ? ""
                          : Number(value)
                      );
                    }}
                  >
                    <MenuItem value="">
                      Todas
                    </MenuItem>

                    {categories.map((category) => (
                      <MenuItem
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel id="post-featured-filter">
                    Destacada
                  </InputLabel>

                  <Select
                    labelId="post-featured-filter"
                    label="Destacada"
                    value={featuredFilter}
                    onChange={(event) => {
                      setPage(1);

                      setFeaturedFilter(
                        event.target
                          .value as FeaturedFilter
                      );
                    }}
                  >
                    <MenuItem value="all">
                      Todas
                    </MenuItem>

                    <MenuItem value="featured">
                      Destacadas
                    </MenuItem>

                    <MenuItem value="normal">
                      No destacadas
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
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

        {/* LISTADO */}
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
                Consultando publicaciones...
              </Typography>
            </Stack>
          </Box>
        ) : posts.length === 0 ? (
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
                  <ArticleIcon />
                </Avatar>

                <Typography
                  variant="h6"
                  fontWeight={900}
                >
                  No se encontraron publicaciones
                </Typography>

                <Typography color="text.secondary">
                  No existen publicaciones o no coinciden
                  con los filtros.
                </Typography>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={openCreateDialog}
                  disabled={lookupsLoading}
                  sx={{
                    textTransform: "none",
                    fontWeight: 800,
                  }}
                >
                  Crear primera publicación
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
                overflowX: "hidden",
              }}
            >
              <Table
                size="small"
                sx={{
                  width: "100%",
                  tableLayout: "fixed",

                  "& .MuiTableCell-root": {
                    px: 1,
                    py: 1.1,
                    fontSize: "0.75rem",
                    verticalAlign: "middle",
                  },

                  "& .MuiTableCell-head": {
                    py: 1.4,
                    fontWeight: 900,
                    whiteSpace: "nowrap",
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: "8%" }}>
                      Portada
                    </TableCell>

                    <TableCell sx={{ width: "34%" }}>
                      Publicación
                    </TableCell>

                    <TableCell sx={{ width: "20%" }}>
                      Clasificación
                    </TableCell>

                    <TableCell sx={{ width: "15%" }}>
                      Estado
                    </TableCell>

                    <TableCell sx={{ width: "15%" }}>
                      Fecha
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{ width: "8%" }}
                    >
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {posts.map((post) => (
                    <TableRow
                      key={post.id}
                      hover
                      onDoubleClick={() =>
                        void openPreviewDialog(post)
                      }
                      sx={{
                        cursor: "pointer",

                        "&:last-child td": {
                          borderBottom: 0,
                        },
                      }}
                    >
                      <TableCell>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 1.5,
                            overflow: "hidden",
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <MediaThumbnail
                            media={getCoverMedia(post)}
                            height={48}
                          />
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Tooltip title={post.title}>
                          <Typography
                            fontWeight={800}
                            noWrap
                          >
                            {post.title}
                          </Typography>
                        </Tooltip>

                        <Tooltip title={`/${post.slug}`}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            sx={{ display: "block" }}
                          >
                            /{post.slug}
                          </Typography>
                        </Tooltip>

                        <Tooltip
                          title={post.excerpt ?? ""}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            sx={{
                              display: "block",
                              mt: 0.3,
                            }}
                          >
                            {post.excerpt ||
                              "Sin extracto"}
                          </Typography>
                        </Tooltip>
                      </TableCell>

                      <TableCell>
                        <Stack spacing={0.5}>
                          <Chip
                            icon={
                              <CategoryOutlinedIcon />
                            }
                            label={
                              post.category?.name ??
                              "Sin categoría"
                            }
                            size="small"
                            variant="outlined"
                            sx={{
                              maxWidth: "100%",
                              justifyContent:
                                "flex-start",

                              "& .MuiChip-label": {
                                overflow: "hidden",
                                textOverflow:
                                  "ellipsis",
                              },
                            }}
                          />

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Etiquetas:{" "}
                            <strong>
                              {post.tags?.length ?? 0}
                            </strong>
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Stack spacing={0.5}>
                          <Chip
                            label={getStatusLabel(
                              post.status
                            )}
                            color={getStatusColor(
                              post.status
                            )}
                            size="small"
                            sx={{
                              width: "fit-content",
                            }}
                          />

                          {post.is_featured && (
                            <Chip
                              icon={<StarIcon />}
                              label="Destacada"
                              color="warning"
                              variant="outlined"
                              size="small"
                              sx={{
                                width: "fit-content",
                              }}
                            />
                          )}
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block" }}
                        >
                          {post.status === "scheduled"
                            ? "Programada"
                            : post.status === "published"
                              ? "Publicada"
                              : "Creada"}
                        </Typography>

                        <Typography
                          variant="caption"
                          fontWeight={700}
                        >
                          {formatDate(
                            post.status === "scheduled"
                              ? post.scheduled_at
                              : post.status === "published"
                                ? post.published_at
                                : post.created_at
                          )}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Tooltip title="Más acciones">
                          <IconButton
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation();

                              openActionMenu(
                                event,
                                post
                              );
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        ) : (
          /* TARJETAS MÓVILES */
          <Grid container spacing={2}>
            {posts.map((post) => (
              <Grid
                item
                xs={12}
                sm={6}
                key={post.id}
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
                  <MediaThumbnail
                    media={getCoverMedia(post)}
                    height={220}
                  />

                  <CardContent>
                    <Stack spacing={2}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={1}
                      >
                        <Chip
                          label={getStatusLabel(
                            post.status
                          )}
                          color={getStatusColor(
                            post.status
                          )}
                          size="small"
                        />

                        {post.is_featured && (
                          <Chip
                            icon={<StarIcon />}
                            label="Destacada"
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        )}
                      </Stack>

                      <Box>
                        <Typography
                          variant="h6"
                          fontWeight={900}
                        >
                          {post.title}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            wordBreak: "break-word",
                          }}
                        >
                          /{post.slug}
                        </Typography>
                      </Box>

                      <Typography color="text.secondary">
                        {post.excerpt ||
                          "Sin extracto registrado."}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        flexWrap="wrap"
                      >
                        <Chip
                          label={
                            post.category?.name ??
                            "Sin categoría"
                          }
                          size="small"
                          variant="outlined"
                        />

                        <Chip
                          label={`Etiquetas: ${
                            post.tags?.length ?? 0
                          }`}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Creada:{" "}
                        {formatDate(post.created_at)}
                      </Typography>

                      <Divider />

                      <Stack spacing={1}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={
                            <VisibilityOutlinedIcon />
                          }
                          onClick={() =>
                            void openPreviewDialog(post)
                          }
                          sx={{
                            textTransform: "none",
                            fontWeight: 800,
                          }}
                        >
                          Ver publicación
                        </Button>

                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={
                            <EditOutlinedIcon />
                          }
                          onClick={() =>
                            void openEditDialog(post)
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
                          endIcon={<MoreVertIcon />}
                          onClick={(event) =>
                            openActionMenu(event, post)
                          }
                          sx={{
                            textTransform: "none",
                            fontWeight: 800,
                          }}
                        >
                          Más acciones
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

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

      {/* MENÚ DE ACCIONES */}
      <Menu
        anchorEl={actionAnchor}
        open={Boolean(actionAnchor && actionPost)}
        onClose={closeActionMenu}
      >
        {actionPost && (
          <>
            <MenuItem
              onClick={() =>
                void openPreviewDialog(actionPost)
              }
            >
              <ListItemIcon>
                <VisibilityOutlinedIcon fontSize="small" />
              </ListItemIcon>

              <ListItemText>
                Ver publicación
              </ListItemText>
            </MenuItem>

            <MenuItem
              onClick={() =>
                void openEditDialog(actionPost)
              }
            >
              <ListItemIcon>
                <EditOutlinedIcon fontSize="small" />
              </ListItemIcon>

              <ListItemText>
                Editar
              </ListItemText>
            </MenuItem>

            <Divider />

            {actionPost.status !== "published" && (
              <MenuItem
                onClick={() =>
                  openConfirmation(
                    "publish",
                    actionPost
                  )
                }
              >
                <ListItemIcon>
                  <PublishOutlinedIcon
                    fontSize="small"
                    color="success"
                  />
                </ListItemIcon>

                <ListItemText>
                  Publicar ahora
                </ListItemText>
              </MenuItem>
            )}

            <MenuItem
              onClick={() =>
                openScheduleDialog(actionPost)
              }
            >
              <ListItemIcon>
                <EventOutlinedIcon fontSize="small" />
              </ListItemIcon>

              <ListItemText>
                {actionPost.status === "scheduled"
                  ? "Reprogramar"
                  : "Programar"}
              </ListItemText>
            </MenuItem>

            {actionPost.status !== "archived" && (
              <MenuItem
                onClick={() =>
                  openConfirmation(
                    "archive",
                    actionPost
                  )
                }
              >
                <ListItemIcon>
                  <ArchiveOutlinedIcon fontSize="small" />
                </ListItemIcon>

                <ListItemText>
                  Archivar
                </ListItemText>
              </MenuItem>
            )}

            <Divider />

            <MenuItem
              onClick={() =>
                openConfirmation(
                  "delete",
                  actionPost
                )
              }
              sx={{ color: "error.main" }}
            >
              <ListItemIcon>
                <DeleteOutlineIcon
                  fontSize="small"
                  color="error"
                />
              </ListItemIcon>

              <ListItemText>
                Eliminar
              </ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>

      {/* FORMULARIO */}
      <Dialog
        open={formOpen}
        onClose={closeFormDialog}
        fullWidth
        maxWidth="lg"
        fullScreen={!isDesktop}
      >
        <DialogTitle>
          <Typography
            variant="h6"
            fontWeight={900}
          >
            {editingPost
              ? "Editar publicación"
              : "Nueva publicación"}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {editingPost
              ? `Modifica “${editingPost.title}”.`
              : "Se guardará inicialmente como borrador."}
          </Typography>
        </DialogTitle>

        <Tabs
          value={formTab}
          onChange={(_, value) =>
            setFormTab(value as FormTab)
          }
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Tab label="Contenido" />
          <Tab label="Clasificación" />
          <Tab label="SEO" />
          <Tab label="Open Graph" />
        </Tabs>

        <DialogContent dividers>
          {formLoading ? (
            <Box
              sx={{
                minHeight: 320,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={2.5}>
              {formError && (
                <Alert severity="error">
                  {formError}
                </Alert>
              )}

              {formTab === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <TextField
                      required
                      fullWidth
                      autoFocus
                      label="Título"
                      value={form.title}
                      onChange={(event) =>
                        handleTitleChange(
                          event.target.value
                        )
                      }
                      error={Boolean(
                        formErrors.title
                      )}
                      helperText={
                        formErrors.title ??
                        `${form.title.length}/200 caracteres`
                      }
                      inputProps={{
                        maxLength: 200,
                      }}
                      disabled={saving}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      required
                      fullWidth
                      label="Slug"
                      value={form.slug}
                      onChange={(event) =>
                        handleSlugChange(
                          event.target.value
                        )
                      }
                      error={Boolean(
                        formErrors.slug
                      )}
                      helperText={
                        formErrors.slug ??
                        `${form.slug.length}/220 caracteres`
                      }
                      inputProps={{
                        maxLength: 220,
                      }}
                      disabled={saving}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      label="Extracto"
                      value={form.excerpt}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          excerpt:
                            event.target.value,
                        }))
                      }
                      error={Boolean(
                        formErrors.excerpt
                      )}
                      helperText={
                        formErrors.excerpt ??
                        `${form.excerpt.length}/1000 caracteres`
                      }
                      inputProps={{
                        maxLength: 1000,
                      }}
                      disabled={saving}
                    />
                  </Grid>

                  <Grid item xs={12}>
                  <Stack spacing={1}>
                   <Typography fontWeight={800}>
              Contenido de la publicación
                </Typography>

                  <BlogRichTextEditor
                   value={form.content}
                   disabled={saving}
                   minHeight={320}
                   onChange={(html) =>
        setForm((current) => ({
          ...current,
          content: html,
        }))
      }
    />
  </Stack>
</Grid>
            
                </Grid>
              )}

              {formTab === 1 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="post-form-category">
                        Categoría
                      </InputLabel>

                      <Select
                        labelId="post-form-category"
                        label="Categoría"
                        value={form.category_id}
                        onChange={(event) => {
                          const value =
                            event.target.value;

                          setForm((current) => ({
                            ...current,
                            category_id:
                              value === ""
                                ? ""
                                : Number(value),
                          }));
                        }}
                        disabled={saving}
                      >
                        <MenuItem value="">
                          Sin categoría
                        </MenuItem>

                        {categories.map((category) => (
                          <MenuItem
                            key={category.id}
                            value={category.id}
                          >
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="post-form-tags">
                        Etiquetas
                      </InputLabel>

                      <Select
                        multiple
                        labelId="post-form-tags"
                        label="Etiquetas"
                        value={form.tag_ids}
                        input={
                          <OutlinedInput label="Etiquetas" />
                        }
                        renderValue={() =>
                          selectedTagNames.length > 0
                            ? selectedTagNames.join(", ")
                            : "Sin etiquetas"
                        }
                        onChange={(event) => {
                          const value =
                            event.target.value;

                          setForm((current) => ({
                            ...current,
                            tag_ids:
                              typeof value === "string"
                                ? value
                                    .split(",")
                                    .map(Number)
                                : (value as number[]),
                          }));
                        }}
                        disabled={saving}
                      >
                        {tags.map((tag) => (
                          <MenuItem
                            key={tag.id}
                            value={tag.id}
                          >
                            <Checkbox
                              checked={form.tag_ids.includes(
                                tag.id
                              )}
                            />

                            <ListItemText
                              primary={tag.name}
                              secondary={`/${tag.slug}`}
                            />
                          </MenuItem>
                        ))}
                      </Select>

                      <FormHelperText>
                        Máximo 50 etiquetas.
                      </FormHelperText>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="post-cover-media">
                        Imagen de portada
                      </InputLabel>

                      <Select
                        labelId="post-cover-media"
                        label="Imagen de portada"
                        value={form.cover_media_id}
                        onChange={(event) => {
                          const value =
                            event.target.value;

                          setForm((current) => ({
                            ...current,
                            cover_media_id:
                              value === ""
                                ? ""
                                : Number(value),
                          }));
                        }}
                        disabled={saving}
                      >
                        <MenuItem value="">
                          Sin portada
                        </MenuItem>

                        {media.map((item) => (
                          <MenuItem
                            key={item.id}
                            value={item.id}
                          >
                            {item.original_filename}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    {selectedCoverMedia && (
                      <Box
                        sx={{
                          height: 160,
                          borderRadius: 3,
                          overflow: "hidden",
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <MediaThumbnail
                          media={selectedCoverMedia}
                          height={160}
                        />
                      </Box>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <Divider />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.is_featured}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              is_featured:
                                event.target.checked,
                            }))
                          }
                        />
                      }
                      label="Publicación destacada"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.allow_comments}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              allow_comments:
                                event.target.checked,
                            }))
                          }
                        />
                      }
                      label="Permitir comentarios"
                    />
                  </Grid>
                </Grid>
              )}

              {formTab === 2 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Título SEO"
                      value={form.seo_title}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          seo_title:
                            event.target.value,
                        }))
                      }
                      helperText={`${form.seo_title.length}/70 caracteres`}
                      inputProps={{
                        maxLength: 70,
                      }}
                      disabled={saving}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      label="Descripción SEO"
                      value={form.seo_description}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          seo_description:
                            event.target.value,
                        }))
                      }
                      helperText={`${form.seo_description.length}/170 caracteres`}
                      inputProps={{
                        maxLength: 170,
                      }}
                      disabled={saving}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      label="Palabras clave"
                      value={form.seo_keywords}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          seo_keywords:
                            event.target.value,
                        }))
                      }
                      helperText={`${form.seo_keywords.length}/500 caracteres`}
                      inputProps={{
                        maxLength: 500,
                      }}
                      disabled={saving}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="URL canónica"
                      placeholder="https://ejemplo.com/blog/publicacion"
                      value={form.canonical_url}
                      onChange={(event) => {
                        setForm((current) => ({
                          ...current,
                          canonical_url:
                            event.target.value,
                        }));

                        setFormErrors((current) => ({
                          ...current,
                          canonical_url: undefined,
                        }));
                      }}
                      error={Boolean(
                        formErrors.canonical_url
                      )}
                      helperText={
                        formErrors.canonical_url ??
                        "URL principal para buscadores."
                      }
                      disabled={saving}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.robots_index}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              robots_index:
                                event.target.checked,
                            }))
                          }
                        />
                      }
                      label="Permitir indexación"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.robots_follow}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              robots_follow:
                                event.target.checked,
                            }))
                          }
                        />
                      }
                      label="Permitir seguimiento de enlaces"
                    />
                  </Grid>
                </Grid>
              )}

              {formTab === 3 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Título Open Graph"
                      value={form.og_title}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          og_title:
                            event.target.value,
                        }))
                      }
                      helperText={`${form.og_title.length}/100 caracteres`}
                      inputProps={{
                        maxLength: 100,
                      }}
                      disabled={saving}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      label="Descripción Open Graph"
                      value={form.og_description}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          og_description:
                            event.target.value,
                        }))
                      }
                      helperText={`${form.og_description.length}/200 caracteres`}
                      inputProps={{
                        maxLength: 200,
                      }}
                      disabled={saving}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="post-og-media">
                        Imagen Open Graph
                      </InputLabel>

                      <Select
                        labelId="post-og-media"
                        label="Imagen Open Graph"
                        value={form.og_image_media_id}
                        onChange={(event) => {
                          const value =
                            event.target.value;

                          setForm((current) => ({
                            ...current,
                            og_image_media_id:
                              value === ""
                                ? ""
                                : Number(value),
                          }));
                        }}
                        disabled={saving}
                      >
                        <MenuItem value="">
                          Sin imagen
                        </MenuItem>

                        {media.map((item) => (
                          <MenuItem
                            key={item.id}
                            value={item.id}
                          >
                            {item.original_filename}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    {selectedOgMedia && (
                      <Box
                        sx={{
                          height: 160,
                          borderRadius: 3,
                          overflow: "hidden",
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <MediaThumbnail
                          media={selectedOgMedia}
                          height={160}
                        />
                      </Box>
                    )}
                  </Grid>
                </Grid>
              )}
            </Stack>
          )}
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
            disabled={saving || formLoading}
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
              saving ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : editingPost ? (
                <EditOutlinedIcon />
              ) : (
                <AddIcon />
              )
            }
            disabled={saving || formLoading}
            onClick={() =>
              void handleSavePost()
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
              : editingPost
                ? "Guardar cambios"
                : "Crear borrador"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* VISTA COMPLETA */}
      <Dialog
        open={Boolean(selectedPost)}
        onClose={closePreviewDialog}
        fullWidth
        maxWidth="md"
        fullScreen={!isDesktop}
      >
        <DialogTitle>
          <Typography
            variant="h6"
            fontWeight={900}
          >
            Vista de publicación
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {selectedPost?.title}
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          {previewLoading ? (
            <Box
              sx={{
                minHeight: 320,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : previewError ? (
            <Alert severity="error">
              {previewError}
            </Alert>
          ) : selectedPost ? (
            <Stack spacing={3}>
              {getCoverMedia(selectedPost) && (
                <Box
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <MediaThumbnail
                    media={getCoverMedia(selectedPost)}
                    height={isDesktop ? 380 : 240}
                  />
                </Box>
              )}

              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
              >
                <Chip
                  label={getStatusLabel(
                    selectedPost.status
                  )}
                  color={getStatusColor(
                    selectedPost.status
                  )}
                />

                <Chip
                  label={
                    selectedPost.category?.name ??
                    "Sin categoría"
                  }
                  variant="outlined"
                />

                {selectedPost.is_featured && (
                  <Chip
                    icon={<StarIcon />}
                    label="Destacada"
                    color="warning"
                    variant="outlined"
                  />
                )}
              </Stack>

              <Box>
                <Typography
                  variant="h4"
                  fontWeight={900}
                >
                  {selectedPost.title}
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  /{selectedPost.slug}
                </Typography>
              </Box>

              {selectedPost.excerpt && (
                <Alert
                  severity="info"
                  icon={false}
                >
                  {selectedPost.excerpt}
                </Alert>
              )}

              {selectedPost.tags?.length > 0 && (
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  flexWrap="wrap"
                >
                  {selectedPost.tags.map((tag) => (
                    <Chip
                      key={tag.id}
                      label={tag.name}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              )}

              <Divider />

              {selectedPost.content ? (
                <Box
                  sx={{
                    lineHeight: 1.75,

                    "& img": {
                      maxWidth: "100%",
                      height: "auto",
                    },

                    "& pre": {
                      maxWidth: "100%",
                      overflowX: "auto",
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "action.hover",
                    },

                    "& table": {
                      width: "100%",
                      display: "block",
                      overflowX: "auto",
                      borderCollapse: "collapse",
                    },

                    "& td, & th": {
                      border: "1px solid",
                      borderColor: "divider",
                      p: 1,
                    },
                  }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      selectedPost.content
                    ),
                  }}
                />
              ) : (
                <Alert severity="warning">
                  La publicación no tiene contenido.
                </Alert>
              )}

              <Divider />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
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
                          SEO
                        </Typography>

                        <Typography variant="body2">
                          Título:{" "}
                          {selectedPost.seo?.title ||
                            "Sin registrar"}
                        </Typography>

                        <Typography variant="body2">
                          Descripción:{" "}
                          {selectedPost.seo
                            ?.description ||
                            "Sin registrar"}
                        </Typography>

                        <Typography variant="body2">
                          Palabras clave:{" "}
                          {selectedPost.seo?.keywords ||
                            "Sin registrar"}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            wordBreak: "break-word",
                          }}
                        >
                          URL canónica:{" "}
                          {selectedPost.seo
                            ?.canonical_url ||
                            "Sin registrar"}
                        </Typography>

                        <Typography variant="body2">
                          Robots:{" "}
                          {selectedPost.seo
                            ?.robots_index
                            ? "index"
                            : "noindex"}
                          ,{" "}
                          {selectedPost.seo
                            ?.robots_follow
                            ? "follow"
                            : "nofollow"}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
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
                          Open Graph
                        </Typography>

                        <Typography variant="body2">
                          Título:{" "}
                          {selectedPost.open_graph
                            ?.title ||
                            "Sin registrar"}
                        </Typography>

                        <Typography variant="body2">
                          Descripción:{" "}
                          {selectedPost.open_graph
                            ?.description ||
                            "Sin registrar"}
                        </Typography>

                        <Typography variant="body2">
                          Imagen:{" "}
                          {getOpenGraphMedia(
                            selectedPost
                          )
                            ? "Configurada"
                            : "Sin registrar"}
                        </Typography>

                        {getOpenGraphMedia(
                          selectedPost
                        ) && (
                          <Box
                            sx={{
                              mt: 1,
                              height: 130,
                              borderRadius: 2,
                              overflow: "hidden",
                              border: "1px solid",
                              borderColor: "divider",
                            }}
                          >
                            <MediaThumbnail
                              media={getOpenGraphMedia(
                                selectedPost
                              )}
                              height={130}
                            />
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Creada:{" "}
                {formatDate(selectedPost.created_at)}
                {" · "}
                Actualizada:{" "}
                {formatDate(selectedPost.updated_at)}
              </Typography>
            </Stack>
          ) : null}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={closePreviewDialog}
            sx={{
              textTransform: "none",
              fontWeight: 800,
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* PROGRAMAR */}
      <Dialog
        open={Boolean(schedulingPost)}
        onClose={closeScheduleDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          <Typography
            variant="h6"
            fontWeight={900}
          >
            Programar publicación
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {schedulingPost?.title}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {scheduleError && (
              <Alert severity="error">
                {scheduleError}
              </Alert>
            )}

            <TextField
              required
              fullWidth
              type="datetime-local"
              label="Fecha y hora"
              value={scheduledAt}
              onChange={(event) => {
                setScheduledAt(event.target.value);
                setScheduleError(null);
              }}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                min: getMinimumScheduleDate(),
              }}
              disabled={scheduling}
            />

            <Alert severity="info">
              La fecha debe ser posterior al momento
              actual.
            </Alert>
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
            onClick={closeScheduleDialog}
            disabled={scheduling}
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
              scheduling ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <EventOutlinedIcon />
              )
            }
            disabled={scheduling}
            onClick={() =>
              void handleSchedulePost()
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
            {scheduling
              ? "Programando..."
              : "Programar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CONFIRMACIÓN */}
      <Dialog
        open={Boolean(confirmation)}
        onClose={closeConfirmation}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
          >
            <Avatar
              sx={{
                bgcolor:
                  confirmation?.action === "delete"
                    ? "error.main"
                    : "primary.main",

                color:
                  confirmation?.action === "delete"
                    ? "error.contrastText"
                    : "primary.contrastText",
              }}
            >
              <WarningAmberIcon />
            </Avatar>

            <Typography
              variant="h6"
              fontWeight={900}
            >
              {getConfirmationTitle()}
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            <Typography>
              ¿Estás seguro de continuar con{" "}
              <strong>
                “{confirmation?.post.title ?? ""}”
              </strong>
              ?
            </Typography>

            <Alert
              severity={
                confirmation?.action === "delete"
                  ? "warning"
                  : "info"
              }
            >
              {getConfirmationText()}
            </Alert>
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
            onClick={closeConfirmation}
            disabled={processingAction}
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
            color={
              confirmation?.action === "delete"
                ? "error"
                : "primary"
            }
            startIcon={
              processingAction ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : confirmation?.action ===
                "publish" ? (
                <PublishOutlinedIcon />
              ) : confirmation?.action ===
                "archive" ? (
                <ArchiveOutlinedIcon />
              ) : (
                <DeleteOutlineIcon />
              )
            }
            disabled={processingAction}
            onClick={() =>
              void handleConfirmedAction()
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
            {processingAction
              ? "Procesando..."
              : getConfirmationButton()}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}