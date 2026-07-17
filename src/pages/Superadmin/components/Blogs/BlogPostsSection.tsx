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
  CardActionArea,
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
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
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
  type BlogCategoryPayload,
  type BlogMedia,
  type BlogPost,
  type BlogPostAd,
  type BlogPostAdPayload,
  type BlogPostAdStatus,
  type BlogPostListParams,
  type BlogPostMedia,
  type BlogPostPayload,
  type BlogPostStatus,
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

type AdForm = {
  title: string;
  description: string;
  link_url: string;
  link_text: string;
  status: BlogPostAdStatus;
  sort_order: number | "";
  media_ids: number[];
};

type AdFormErrors = {
  title?: string;
  description?: string;
  link_url?: string;
  link_text?: string;
  sort_order?: string;
  media_ids?: string;
};

type UploadMediaTarget =
  | "cover"
  | "ad";

type QuickCategoryForm = {
  name: string;
  slug: string;
  description: string;
};

type QuickTagForm = {
  name: string;
  slug: string;
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

const EMPTY_AD_FORM: AdForm = {
  title: "",
  description: "",
  link_url: "",
  link_text: "Ver más",
  status: "active",
  sort_order: "",
  media_ids: [],
};

const EMPTY_QUICK_CATEGORY_FORM: QuickCategoryForm = {
  name: "",
  slug: "",
  description: "",
};

const EMPTY_QUICK_TAG_FORM: QuickTagForm = {
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

function validateAdForm(
  form: AdForm
): AdFormErrors {
  const errors: AdFormErrors = {};

  if (!form.title.trim()) {
    errors.title =
      "El título del anuncio es obligatorio.";
  } else if (form.title.trim().length > 160) {
    errors.title =
      "El título no puede superar 160 caracteres.";
  }

  if (form.description.length > 5000) {
    errors.description =
      "La descripción no puede superar 5000 caracteres.";
  }

  if (!form.link_url.trim()) {
    errors.link_url =
      "El hipervínculo es obligatorio.";
  } else {
    try {
      const url = new URL(
        form.link_url.trim()
      );

      if (
        url.protocol !== "http:" &&
        url.protocol !== "https:"
      ) {
        errors.link_url =
          "El hipervínculo debe utilizar HTTP o HTTPS.";
      }
    } catch {
      errors.link_url =
        "El hipervínculo no es válido.";
    }
  }

  if (!form.link_text.trim()) {
    errors.link_text =
      "El texto del vínculo es obligatorio.";
  } else if (form.link_text.trim().length > 80) {
    errors.link_text =
      "El texto del vínculo no puede superar 80 caracteres.";
  }

  if (
    form.sort_order !== "" &&
    (
      !Number.isInteger(Number(form.sort_order)) ||
      Number(form.sort_order) < 0
    )
  ) {
    errors.sort_order =
      "El orden debe ser un número entero igual o mayor que cero.";
  }

  if (form.media_ids.length < 1) {
    errors.media_ids =
      "Selecciona al menos una imagen.";
  } else if (form.media_ids.length > 3) {
    errors.media_ids =
      "Solo puedes seleccionar un máximo de tres imágenes.";
  }

  return errors;
}

function sortAds(
  items: BlogPostAd[]
): BlogPostAd[] {
  return [...items].sort(
    (first, second) =>
      first.sort_order - second.sort_order ||
      first.id - second.id
  );
}

function getAdStatusLabel(
  status: BlogPostAdStatus
): string {
  return status === "active"
    ? "Activo"
    : "Inactivo";
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
  | CREACIÓN RÁPIDA DE CLASIFICACIÓN Y MULTIMEDIA
  |--------------------------------------------------------------------------
  */

  const [lookupSuccess, setLookupSuccess] =
    useState<string | null>(null);

  const [quickCategoryOpen, setQuickCategoryOpen] =
    useState(false);

  const [quickCategoryForm, setQuickCategoryForm] =
    useState<QuickCategoryForm>(
      EMPTY_QUICK_CATEGORY_FORM
    );

  const [quickCategorySlugEdited, setQuickCategorySlugEdited] =
    useState(false);

  const [quickCategoryError, setQuickCategoryError] =
    useState<string | null>(null);

  const [quickCategorySaving, setQuickCategorySaving] =
    useState(false);

  const [quickTagOpen, setQuickTagOpen] =
    useState(false);

  const [quickTagForm, setQuickTagForm] =
    useState<QuickTagForm>(EMPTY_QUICK_TAG_FORM);

  const [quickTagSlugEdited, setQuickTagSlugEdited] =
    useState(false);

  const [quickTagError, setQuickTagError] =
    useState<string | null>(null);

  const [quickTagSaving, setQuickTagSaving] =
    useState(false);

  const [uploadMediaOpen, setUploadMediaOpen] =
    useState(false);

  const [uploadFile, setUploadFile] =
    useState<File | null>(null);

  const [uploadPreview, setUploadPreview] =
    useState<string | null>(null);

  const [uploadAltText, setUploadAltText] =
    useState("");

  const [uploadCaption, setUploadCaption] =
    useState("");

  const [uploadMediaError, setUploadMediaError] =
    useState<string | null>(null);

  const [uploadingMedia, setUploadingMedia] =
    useState(false);

  const [
    uploadMediaTarget,
    setUploadMediaTarget,
  ] = useState<UploadMediaTarget>("cover");

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
  | IMÁGENES CON HIPERVÍNCULO
  |--------------------------------------------------------------------------
  */

  const [ads, setAds] =
    useState<BlogPostAd[]>([]);

  const [adsLoading, setAdsLoading] =
    useState(false);

  const [adDialogOpen, setAdDialogOpen] =
    useState(false);

  const [editingAd, setEditingAd] =
    useState<BlogPostAd | null>(null);

  const [adForm, setAdForm] =
    useState<AdForm>(EMPTY_AD_FORM);

  const [adFormErrors, setAdFormErrors] =
    useState<AdFormErrors>({});

  const [adError, setAdError] =
    useState<string | null>(null);

  const [adSaving, setAdSaving] =
    useState(false);

  const [adToDelete, setAdToDelete] =
    useState<BlogPostAd | null>(null);

  const [adDeleting, setAdDeleting] =
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

  useEffect(() => {
    return () => {
      if (uploadPreview) {
        URL.revokeObjectURL(uploadPreview);
      }
    };
  }, [uploadPreview]);

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
  | CREACIÓN RÁPIDA DE CATEGORÍA
  |--------------------------------------------------------------------------
  */

  function openQuickCategoryDialog() {
    setQuickCategoryForm(
      EMPTY_QUICK_CATEGORY_FORM
    );
    setQuickCategorySlugEdited(false);
    setQuickCategoryError(null);
    setQuickCategoryOpen(true);
  }

  function closeQuickCategoryDialog() {
    if (quickCategorySaving) {
      return;
    }

    setQuickCategoryOpen(false);
    setQuickCategoryForm(
      EMPTY_QUICK_CATEGORY_FORM
    );
    setQuickCategorySlugEdited(false);
    setQuickCategoryError(null);
  }

  function handleQuickCategoryNameChange(
    value: string
  ) {
    setQuickCategoryForm((current) => ({
      ...current,
      name: value,
      slug: quickCategorySlugEdited
        ? current.slug
        : slugify(value),
    }));

    setQuickCategoryError(null);
  }

  function handleQuickCategorySlugChange(
    value: string
  ) {
    setQuickCategorySlugEdited(true);

    setQuickCategoryForm((current) => ({
      ...current,
      slug: slugify(value),
    }));

    setQuickCategoryError(null);
  }

  async function handleCreateQuickCategory() {
    const name = quickCategoryForm.name.trim();
    const slug = quickCategoryForm.slug.trim();

    if (!name) {
      setQuickCategoryError(
        "Escribe el nombre de la categoría."
      );
      return;
    }

    if (!slug) {
      setQuickCategoryError(
        "El slug de la categoría es obligatorio."
      );
      return;
    }

    const payload: BlogCategoryPayload = {
      name,
      slug,
      description:
        quickCategoryForm.description.trim() || null,
      parent_id: null,
      status: "active",
      sort_order: categories.length + 1,
    };

    try {
      setQuickCategorySaving(true);
      setQuickCategoryError(null);
      setLookupSuccess(null);

      const response =
        await blogApi.createCategory(
          systemId,
          blogId,
          payload
        );

      const createdCategory =
        response.data.data;

      setCategories((current) =>
        [
          ...current.filter(
            (category) =>
              category.id !==
              createdCategory.id
          ),
          createdCategory,
        ].sort((first, second) =>
          first.name.localeCompare(
            second.name,
            "es"
          )
        )
      );

      setForm((current) => ({
        ...current,
        category_id: createdCategory.id,
      }));

      setLookupSuccess(
        `La categoría “${createdCategory.name}” fue creada y seleccionada.`
      );

      setQuickCategoryOpen(false);
      setQuickCategoryForm(
        EMPTY_QUICK_CATEGORY_FORM
      );
      setQuickCategorySlugEdited(false);
      setQuickCategoryError(null);
    } catch (requestError) {
      setQuickCategoryError(
        getErrorMessage(
          requestError,
          "No fue posible crear la categoría."
        )
      );
    } finally {
      setQuickCategorySaving(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | CREACIÓN RÁPIDA DE ETIQUETA
  |--------------------------------------------------------------------------
  */

  function openQuickTagDialog() {
    setQuickTagForm(EMPTY_QUICK_TAG_FORM);
    setQuickTagSlugEdited(false);
    setQuickTagError(null);
    setQuickTagOpen(true);
  }

  function closeQuickTagDialog() {
    if (quickTagSaving) {
      return;
    }

    setQuickTagOpen(false);
    setQuickTagForm(EMPTY_QUICK_TAG_FORM);
    setQuickTagSlugEdited(false);
    setQuickTagError(null);
  }

  function handleQuickTagNameChange(value: string) {
    setQuickTagForm((current) => ({
      ...current,
      name: value,
      slug: quickTagSlugEdited
        ? current.slug
        : slugify(value),
    }));

    setQuickTagError(null);
  }

  function handleQuickTagSlugChange(value: string) {
    setQuickTagSlugEdited(true);

    setQuickTagForm((current) => ({
      ...current,
      slug: slugify(value),
    }));

    setQuickTagError(null);
  }

  async function handleCreateQuickTag() {
    const name = quickTagForm.name.trim();
    const slug = quickTagForm.slug.trim();

    if (!name) {
      setQuickTagError(
        "Escribe el nombre de la etiqueta."
      );
      return;
    }

    if (!slug) {
      setQuickTagError(
        "El slug de la etiqueta es obligatorio."
      );
      return;
    }

    const payload: BlogTagPayload = {
      name,
      slug,
    };

    try {
      setQuickTagSaving(true);
      setQuickTagError(null);
      setLookupSuccess(null);

      const response =
        await blogApi.createTag(
          systemId,
          blogId,
          payload
        );

      const createdTag = response.data.data;

      setTags((current) =>
        [
          ...current.filter(
            (tag) => tag.id !== createdTag.id
          ),
          createdTag,
        ].sort((first, second) =>
          first.name.localeCompare(
            second.name,
            "es"
          )
        )
      );

      setForm((current) => ({
        ...current,
        tag_ids: Array.from(
          new Set([
            ...current.tag_ids,
            createdTag.id,
          ])
        ),
      }));

      setLookupSuccess(
        `La etiqueta “${createdTag.name}” fue creada y seleccionada.`
      );

      setQuickTagOpen(false);
      setQuickTagForm(EMPTY_QUICK_TAG_FORM);
      setQuickTagSlugEdited(false);
      setQuickTagError(null);
    } catch (requestError) {
      setQuickTagError(
        getErrorMessage(
          requestError,
          "No fue posible crear la etiqueta."
        )
      );
    } finally {
      setQuickTagSaving(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | CARGA RÁPIDA DE IMAGEN
  |--------------------------------------------------------------------------
  */

  function openUploadMediaDialog(
    target: UploadMediaTarget = "cover"
  ) {
    setUploadMediaTarget(target);
    setUploadFile(null);
    setUploadPreview(null);
    setUploadAltText("");
    setUploadCaption("");
    setUploadMediaError(null);
    setUploadMediaOpen(true);
  }

  function closeUploadMediaDialog() {
    if (uploadingMedia) {
      return;
    }

    if (uploadPreview) {
      URL.revokeObjectURL(uploadPreview);
    }

    setUploadMediaOpen(false);
    setUploadFile(null);
    setUploadPreview(null);
    setUploadAltText("");
    setUploadCaption("");
    setUploadMediaError(null);
    setUploadMediaTarget("cover");
  }

  function handleUploadFileSelected(
    file: File | null
  ) {
    setUploadMediaError(null);
    setUploadFile(file);

    if (uploadPreview) {
      URL.revokeObjectURL(uploadPreview);
    }

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
      setUploadMediaError(
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
      setUploadMediaError(
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
      setUploadingMedia(true);
      setUploadMediaError(null);
      setLookupSuccess(null);

      const response =
        await blogApi.createMedia(
          systemId,
          blogId,
          formData
        );

      const createdMedia = response.data.data;

      setMedia((current) => [
        createdMedia,
        ...current.filter(
          (item) => item.id !== createdMedia.id
        ),
      ]);

      if (uploadMediaTarget === "ad") {
        setAdForm((current) => {
          if (
            current.media_ids.includes(
              createdMedia.id
            )
          ) {
            return current;
          }

          return {
            ...current,
            media_ids: [
              ...current.media_ids,
              createdMedia.id,
            ].slice(0, 3),
          };
        });

        setAdFormErrors((current) => ({
          ...current,
          media_ids: undefined,
        }));

        setLookupSuccess(
          `La imagen “${createdMedia.original_filename}” fue subida y agregada al hipervínculo.`
        );
      } else {
        setForm((current) => ({
          ...current,
          cover_media_id: createdMedia.id,
        }));

        setLookupSuccess(
          `La imagen “${createdMedia.original_filename}” fue subida y seleccionada como portada.`
        );
      }

      if (uploadPreview) {
        URL.revokeObjectURL(uploadPreview);
      }

      setUploadMediaOpen(false);
      setUploadFile(null);
      setUploadPreview(null);
      setUploadAltText("");
      setUploadCaption("");
      setUploadMediaError(null);
      setUploadMediaTarget("cover");
    } catch (requestError) {
      setUploadMediaError(
        getErrorMessage(
          requestError,
          "No fue posible subir la imagen."
        )
      );
    } finally {
      setUploadingMedia(false);
    }
  }

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
    setLookupSuccess(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormError(null);
    setFormTab(0);
    setSlugEdited(false);
    setFormLoading(false);
    setAds([]);
    setAdsLoading(false);
    setAdDialogOpen(false);
    setEditingAd(null);
    setAdForm(EMPTY_AD_FORM);
    setAdFormErrors({});
    setAdError(null);
    setAdToDelete(null);
    setFormOpen(true);
  }

  async function openEditDialog(post: BlogPost) {
    closeActionMenu();

    setEditingPost(post);
    setLookupSuccess(null);
    setForm(mapPostToForm(post));
    setFormOpen(true);
    setFormLoading(true);
    setFormError(null);
    setFormErrors({});
    setFormTab(0);
    setSlugEdited(true);
    setAds([]);
    setAdsLoading(true);
    setAdDialogOpen(false);
    setEditingAd(null);
    setAdForm(EMPTY_AD_FORM);
    setAdFormErrors({});
    setAdError(null);
    setAdToDelete(null);

    try {
      const response = await blogApi.post(
        systemId,
        blogId,
        post.id
      );

      const detailedPost = response.data.data;

      let detailedAds =
        detailedPost.ads;

      if (detailedAds === undefined) {
        const adsResponse =
          await blogApi.postAds(
            systemId,
            blogId,
            post.id
          );

        detailedAds =
          adsResponse.data.data ?? [];
      }

      setEditingPost(detailedPost);
      setForm(mapPostToForm(detailedPost));
      setAds(sortAds(detailedAds ?? []));
    } catch (requestError) {
      setFormError(
        getErrorMessage(
          requestError,
          "No fue posible consultar la publicación."
        )
      );
    } finally {
      setFormLoading(false);
      setAdsLoading(false);
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
    setLookupSuccess(null);
    setAds([]);
    setAdsLoading(false);
    setAdDialogOpen(false);
    setEditingAd(null);
    setAdForm(EMPTY_AD_FORM);
    setAdFormErrors({});
    setAdError(null);
    setAdToDelete(null);
  }

  function closeFormDialog() {
    if (
      saving ||
      formLoading ||
      quickCategorySaving ||
      quickTagSaving ||
      uploadingMedia ||
      adSaving ||
      adDeleting
    ) {
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
  | IMÁGENES CON HIPERVÍNCULO
  |--------------------------------------------------------------------------
  */

  function mapAdToForm(
    ad: BlogPostAd
  ): AdForm {
    return {
      title: ad.title ?? "",
      description: ad.description ?? "",
      link_url: ad.link_url ?? "",
      link_text: ad.link_text ?? "Ver más",
      status: ad.status,
      sort_order: ad.sort_order,
      media_ids:
        ad.media_ids?.length > 0
          ? ad.media_ids
          : ad.images
              ?.sort(
                (first, second) =>
                  first.sort_order -
                  second.sort_order
              )
              .map(
                (image) => image.media_id
              ) ?? [],
    };
  }

  function openCreateAdDialog() {
    if (!editingPost) {
      setFormError(
        "Primero guarda la publicación como borrador y vuelve a abrirla para agregar imágenes con hipervínculo."
      );
      return;
    }

    setEditingAd(null);
    setAdForm(EMPTY_AD_FORM);
    setAdFormErrors({});
    setAdError(null);
    setLookupSuccess(null);
    setAdDialogOpen(true);
  }

  function openEditAdDialog(
    ad: BlogPostAd
  ) {
    setEditingAd(ad);
    setAdForm(mapAdToForm(ad));
    setAdFormErrors({});
    setAdError(null);
    setLookupSuccess(null);
    setAdDialogOpen(true);
  }

  function closeAdDialog() {
    if (adSaving || uploadingMedia) {
      return;
    }

    setAdDialogOpen(false);
    setEditingAd(null);
    setAdForm(EMPTY_AD_FORM);
    setAdFormErrors({});
    setAdError(null);
  }

  function handleToggleAdMedia(
    mediaId: number
  ) {
    setAdForm((current) => {
      if (
        current.media_ids.includes(mediaId)
      ) {
        return {
          ...current,
          media_ids:
            current.media_ids.filter(
              (id) => id !== mediaId
            ),
        };
      }

      if (current.media_ids.length >= 3) {
        return current;
      }

      return {
        ...current,
        media_ids: [
          ...current.media_ids,
          mediaId,
        ],
      };
    });

    setAdFormErrors((current) => ({
      ...current,
      media_ids: undefined,
    }));
  }

  async function handleSaveAd() {
    if (!editingPost) {
      setAdError(
        "La publicación debe existir antes de agregar el hipervínculo."
      );
      return;
    }

    const validationErrors =
      validateAdForm(adForm);

    setAdFormErrors(validationErrors);
    setAdError(null);

    if (
      Object.keys(validationErrors).length > 0
    ) {
      return;
    }

    const payload: BlogPostAdPayload = {
      title: adForm.title.trim(),
      description:
        adForm.description.trim() || null,
      link_url: adForm.link_url.trim(),
      link_text:
        adForm.link_text.trim() || "Ver más",
      status: adForm.status,
      media_ids: adForm.media_ids,
    };

    if (adForm.sort_order !== "") {
      payload.sort_order =
        Number(adForm.sort_order);
    }

    try {
      setAdSaving(true);
      setAdError(null);
      setLookupSuccess(null);

      if (editingAd) {
        const response =
          await blogApi.updatePostAd(
            systemId,
            blogId,
            editingPost.id,
            editingAd.id,
            payload
          );

        const updatedAd =
          response.data.data;

        setAds((current) =>
          sortAds([
            ...current.filter(
              (ad) => ad.id !== updatedAd.id
            ),
            updatedAd,
          ])
        );

        setLookupSuccess(
          response.data.message ||
            "El bloque de imágenes con hipervínculo fue actualizado."
        );
      } else {
        const response =
          await blogApi.createPostAd(
            systemId,
            blogId,
            editingPost.id,
            payload
          );

        const createdAd =
          response.data.data;

        setAds((current) =>
          sortAds([
            ...current,
            createdAd,
          ])
        );

        setLookupSuccess(
          response.data.message ||
            "El bloque de imágenes con hipervínculo fue creado."
        );
      }

      setAdDialogOpen(false);
      setEditingAd(null);
      setAdForm(EMPTY_AD_FORM);
      setAdFormErrors({});
      setAdError(null);
    } catch (requestError) {
      setAdError(
        getErrorMessage(
          requestError,
          editingAd
            ? "No fue posible actualizar el hipervínculo."
            : "No fue posible crear el hipervínculo."
        )
      );
    } finally {
      setAdSaving(false);
    }
  }

  function openDeleteAdDialog(
    ad: BlogPostAd
  ) {
    setAdToDelete(ad);
  }

  function closeDeleteAdDialog() {
    if (adDeleting) {
      return;
    }

    setAdToDelete(null);
  }

  async function handleDeleteAd() {
    if (!editingPost || !adToDelete) {
      return;
    }

    try {
      setAdDeleting(true);
      setFormError(null);
      setLookupSuccess(null);

      const response =
        await blogApi.deletePostAd(
          systemId,
          blogId,
          editingPost.id,
          adToDelete.id
        );

      setAds((current) =>
        current.filter(
          (ad) => ad.id !== adToDelete.id
        )
      );

      setLookupSuccess(
        response.data.message ||
          "El bloque de imágenes con hipervínculo fue eliminado."
      );

      setAdToDelete(null);
    } catch (requestError) {
      setFormError(
        getErrorMessage(
          requestError,
          "No fue posible eliminar el hipervínculo."
        )
      );
    } finally {
      setAdDeleting(false);
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

  const selectedAdMedia = useMemo(() => {
    return adForm.media_ids
      .map(
        (mediaId) =>
          media.find(
            (item) => item.id === mediaId
          ) ?? null
      )
      .filter(
        (item): item is BlogMedia =>
          item !== null
      );
  }, [adForm.media_ids, media]);

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

                  <Grid item xs={12}>
                    <Divider />
                  </Grid>

                  <Grid item xs={12}>
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.default",
                      }}
                    >
                      <CardContent>
                        <Stack spacing={2}>
                          <Stack
                            direction={{
                              xs: "column",
                              sm: "row",
                            }}
                            justifyContent="space-between"
                            alignItems={{
                              xs: "stretch",
                              sm: "center",
                            }}
                            spacing={1.5}
                          >
                            <Box>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                              >
                                <LinkOutlinedIcon
                                  color="primary"
                                />

                                <Typography
                                  fontWeight={900}
                                >
                                  Imágenes con hipervínculo
                                </Typography>
                              </Stack>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                              >
                                Cada bloque puede contener
                                entre una y tres imágenes que
                                abrirán el mismo vínculo.
                              </Typography>
                            </Box>

                            <Button
                              variant="contained"
                              startIcon={<AddIcon />}
                              onClick={
                                openCreateAdDialog
                              }
                              disabled={
                                !editingPost ||
                                saving ||
                                adsLoading
                              }
                              sx={{
                                flexShrink: 0,
                                textTransform: "none",
                                fontWeight: 800,
                              }}
                            >
                              Agregar imágenes
                            </Button>
                          </Stack>

                          {!editingPost ? (
                            <Alert severity="info">
                              Guarda primero la publicación
                              como borrador. Después vuelve a
                              editarla para agregar imágenes
                              con hipervínculo.
                            </Alert>
                          ) : adsLoading ? (
                            <Box
                              sx={{
                                minHeight: 100,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <CircularProgress size={28} />
                            </Box>
                          ) : ads.length === 0 ? (
                            <Alert severity="info">
                              Esta publicación todavía no
                              tiene imágenes con hipervínculo.
                            </Alert>
                          ) : (
                            <Stack spacing={2}>
                              {ads.map((ad) => (
                                <Card
                                  key={ad.id}
                                  elevation={0}
                                  sx={{
                                    border: "1px solid",
                                    borderColor: "divider",
                                    borderRadius: 3,
                                    bgcolor: "background.paper",
                                  }}
                                >
                                  <CardContent>
                                    <Stack spacing={1.5}>
                                      <Stack
                                        direction={{
                                          xs: "column",
                                          sm: "row",
                                        }}
                                        justifyContent="space-between"
                                        alignItems={{
                                          xs: "flex-start",
                                          sm: "center",
                                        }}
                                        spacing={1}
                                      >
                                        <Box sx={{ minWidth: 0 }}>
                                          <Typography
                                            fontWeight={900}
                                          >
                                            {ad.title}
                                          </Typography>

                                          <Typography
                                            component="a"
                                            href={ad.link_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            variant="body2"
                                            color="primary"
                                            sx={{
                                              display: "block",
                                              wordBreak: "break-all",
                                              textDecoration: "none",
                                            }}
                                          >
                                            {ad.link_url}
                                          </Typography>
                                        </Box>

                                        <Chip
                                          size="small"
                                          label={getAdStatusLabel(
                                            ad.status
                                          )}
                                          color={
                                            ad.status === "active"
                                              ? "success"
                                              : "default"
                                          }
                                        />
                                      </Stack>

                                      {ad.description && (
                                        <Typography
                                          variant="body2"
                                          color="text.secondary"
                                        >
                                          {ad.description}
                                        </Typography>
                                      )}

                                      <Grid
                                        container
                                        spacing={1.5}
                                      >
                                        {ad.images.map(
                                          (image) => (
                                            <Grid
                                              item
                                              xs={12}
                                              sm={4}
                                              key={image.id}
                                            >
                                              <Box
                                                component="a"
                                                href={ad.link_url}
                                                target="_blank"
                                                rel="noopener noreferrer sponsored"
                                                sx={{
                                                  display: "block",
                                                  borderRadius: 2,
                                                  overflow: "hidden",
                                                  border: "1px solid",
                                                  borderColor: "divider",
                                                  textDecoration: "none",
                                                }}
                                              >
                                                <MediaThumbnail
                                                  media={image.media}
                                                  height={120}
                                                />
                                              </Box>
                                            </Grid>
                                          )
                                        )}
                                      </Grid>

                                      <Stack
                                        direction={{
                                          xs: "column",
                                          sm: "row",
                                        }}
                                        justifyContent="flex-end"
                                        spacing={1}
                                      >
                                        <Button
                                          size="small"
                                          variant="outlined"
                                          startIcon={
                                            <EditOutlinedIcon />
                                          }
                                          onClick={() =>
                                            openEditAdDialog(ad)
                                          }
                                          disabled={
                                            adSaving ||
                                            adDeleting
                                          }
                                          sx={{
                                            textTransform: "none",
                                            fontWeight: 800,
                                          }}
                                        >
                                          Editar
                                        </Button>

                                        <Button
                                          size="small"
                                          color="error"
                                          variant="outlined"
                                          startIcon={
                                            <DeleteOutlineIcon />
                                          }
                                          onClick={() =>
                                            openDeleteAdDialog(ad)
                                          }
                                          disabled={
                                            adSaving ||
                                            adDeleting
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
                              ))}
                            </Stack>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {formTab === 1 && (
                <Grid container spacing={2.5}>
                  {lookupSuccess && (
                    <Grid item xs={12}>
                      <Alert
                        severity="success"
                        onClose={() =>
                          setLookupSuccess(null)
                        }
                      >
                        {lookupSuccess}
                      </Alert>
                    </Grid>
                  )}

                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
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
                        spacing={1}
                      >
                        <Typography fontWeight={800}>
                          Categoría
                        </Typography>

                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={
                            openQuickCategoryDialog
                          }
                          disabled={
                            saving || lookupsLoading
                          }
                          sx={{
                            textTransform: "none",
                            fontWeight: 800,
                          }}
                        >
                          Nueva categoría
                        </Button>
                      </Stack>

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
                          disabled={
                            saving || lookupsLoading
                          }
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

                        <FormHelperText>
                          {categories.length === 0
                            ? "No hay categorías registradas. Crea una desde este formulario."
                            : "Selecciona una categoría o crea una nueva."}
                        </FormHelperText>
                      </FormControl>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
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
                        spacing={1}
                      >
                        <Typography fontWeight={800}>
                          Etiquetas
                        </Typography>

                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={
                            <LocalOfferOutlinedIcon />
                          }
                          onClick={openQuickTagDialog}
                          disabled={
                            saving || lookupsLoading
                          }
                          sx={{
                            textTransform: "none",
                            fontWeight: 800,
                          }}
                        >
                          Nueva etiqueta
                        </Button>
                      </Stack>

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
                          disabled={
                            saving || lookupsLoading
                          }
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
                          {tags.length === 0
                            ? "No hay etiquetas registradas. Crea la primera desde este formulario."
                            : "Puedes seleccionar hasta 50 etiquetas."}
                        </FormHelperText>
                      </FormControl>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
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
                        spacing={1}
                      >
                        <Typography fontWeight={800}>
                          Imagen de portada
                        </Typography>

                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={
                            <CloudUploadOutlinedIcon />
                          }
                         onClick={() => openUploadMediaDialog("cover")}
                          disabled={
                            saving || lookupsLoading
                          }
                          sx={{
                            textTransform: "none",
                            fontWeight: 800,
                          }}
                        >
                          Subir imagen
                        </Button>
                      </Stack>

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
                          disabled={
                            saving || lookupsLoading
                          }
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

                        <FormHelperText>
                          {media.length === 0
                            ? "No hay imágenes cargadas. Sube una desde este formulario."
                            : "Selecciona una imagen existente o carga una nueva."}
                        </FormHelperText>
                      </FormControl>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    {selectedCoverMedia ? (
                      <Box
                        sx={{
                          height: 180,
                          borderRadius: 3,
                          overflow: "hidden",
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <MediaThumbnail
                          media={selectedCoverMedia}
                          height={180}
                        />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          minHeight: 180,
                          borderRadius: 3,
                          border: "1px dashed",
                          borderColor: "divider",
                          bgcolor: "action.hover",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          p: 2,
                        }}
                      >
                        <Stack
                          alignItems="center"
                          spacing={1}
                        >
                          <BrokenImageIcon
                            color="action"
                          />

                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            Selecciona o sube una imagen
                            para ver la vista previa.
                          </Typography>
                        </Stack>
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
                          disabled={saving}
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
                          disabled={saving}
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

      {/* IMÁGENES CON HIPERVÍNCULO */}
      <Dialog
        open={adDialogOpen}
        onClose={closeAdDialog}
        fullWidth
        maxWidth="md"
        fullScreen={!isDesktop}
      >
        <DialogTitle>
          <Typography
            variant="h6"
            fontWeight={900}
          >
            {editingAd
              ? "Editar imágenes con hipervínculo"
              : "Agregar imágenes con hipervínculo"}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Selecciona entre una y tres imágenes.
            Todas abrirán el mismo vínculo.
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5}>
            {adError && (
              <Alert severity="error">
                {adError}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <TextField
                  required
                  fullWidth
                  autoFocus
                  label="Título"
                  value={adForm.title}
                  onChange={(event) => {
                    setAdForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }));

                    setAdFormErrors((current) => ({
                      ...current,
                      title: undefined,
                    }));
                  }}
                  error={Boolean(
                    adFormErrors.title
                  )}
                  helperText={
                    adFormErrors.title ??
                    `${adForm.title.length}/160 caracteres`
                  }
                  inputProps={{
                    maxLength: 160,
                  }}
                  disabled={adSaving}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="post-ad-status">
                    Estado
                  </InputLabel>

                  <Select
                    labelId="post-ad-status"
                    label="Estado"
                    value={adForm.status}
                    onChange={(event) =>
                      setAdForm((current) => ({
                        ...current,
                        status:
                          event.target
                            .value as BlogPostAdStatus,
                      }))
                    }
                    disabled={adSaving}
                  >
                    <MenuItem value="active">
                      Activo
                    </MenuItem>

                    <MenuItem value="inactive">
                      Inactivo
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Descripción"
                  value={adForm.description}
                  onChange={(event) => {
                    setAdForm((current) => ({
                      ...current,
                      description:
                        event.target.value,
                    }));

                    setAdFormErrors((current) => ({
                      ...current,
                      description: undefined,
                    }));
                  }}
                  error={Boolean(
                    adFormErrors.description
                  )}
                  helperText={
                    adFormErrors.description ??
                    `${adForm.description.length}/5000 caracteres`
                  }
                  inputProps={{
                    maxLength: 5000,
                  }}
                  disabled={adSaving}
                />
              </Grid>

              <Grid item xs={12} md={8}>
                <TextField
                  required
                  fullWidth
                  label="Hipervínculo"
                  placeholder="https://ejemplo.com"
                  value={adForm.link_url}
                  onChange={(event) => {
                    setAdForm((current) => ({
                      ...current,
                      link_url:
                        event.target.value,
                    }));

                    setAdFormErrors((current) => ({
                      ...current,
                      link_url: undefined,
                    }));
                  }}
                  error={Boolean(
                    adFormErrors.link_url
                  )}
                  helperText={
                    adFormErrors.link_url ??
                    "Debe utilizar HTTP o HTTPS."
                  }
                  disabled={adSaving}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  required
                  fullWidth
                  label="Texto del vínculo"
                  value={adForm.link_text}
                  onChange={(event) => {
                    setAdForm((current) => ({
                      ...current,
                      link_text:
                        event.target.value,
                    }));

                    setAdFormErrors((current) => ({
                      ...current,
                      link_text: undefined,
                    }));
                  }}
                  error={Boolean(
                    adFormErrors.link_text
                  )}
                  helperText={
                    adFormErrors.link_text ??
                    `${adForm.link_text.length}/80`
                  }
                  inputProps={{
                    maxLength: 80,
                  }}
                  disabled={adSaving}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Orden"
                  value={adForm.sort_order}
                  onChange={(event) => {
                    const value =
                      event.target.value;

                    setAdForm((current) => ({
                      ...current,
                      sort_order:
                        value === ""
                          ? ""
                          : Number(value),
                    }));

                    setAdFormErrors((current) => ({
                      ...current,
                      sort_order: undefined,
                    }));
                  }}
                  error={Boolean(
                    adFormErrors.sort_order
                  )}
                  helperText={
                    adFormErrors.sort_order ??
                    "Opcional. Se asigna automáticamente."
                  }
                  inputProps={{
                    min: 0,
                    step: 1,
                  }}
                  disabled={adSaving}
                />
              </Grid>
            </Grid>

            <Divider />

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              justifyContent="space-between"
              alignItems={{
                xs: "stretch",
                sm: "center",
              }}
              spacing={1}
            >
              <Box>
                <Typography fontWeight={900}>
                  Imágenes seleccionadas
                </Typography>

                <Typography
                  variant="body2"
                  color={
                    adFormErrors.media_ids
                      ? "error"
                      : "text.secondary"
                  }
                >
                  {adFormErrors.media_ids ??
                    `${adForm.media_ids.length}/3 imágenes seleccionadas`}
                </Typography>
              </Box>

              <Button
                variant="outlined"
                startIcon={
                  <CloudUploadOutlinedIcon />
                }
                onClick={() =>
                  openUploadMediaDialog("ad")
                }
                disabled={
                  adSaving ||
                  uploadingMedia ||
                  adForm.media_ids.length >= 3
                }
                sx={{
                  textTransform: "none",
                  fontWeight: 800,
                }}
              >
                Subir imagen
              </Button>
            </Stack>

            {selectedAdMedia.length > 0 && (
              <Grid container spacing={1.5}>
                {selectedAdMedia.map(
                  (selectedMedia, index) => (
                    <Grid
                      item
                      xs={12}
                      sm={4}
                      key={selectedMedia.id}
                    >
                      <Card
                        elevation={0}
                        sx={{
                          border: "2px solid",
                          borderColor: "primary.main",
                          borderRadius: 2,
                          overflow: "hidden",
                        }}
                      >
                        <MediaThumbnail
                          media={selectedMedia}
                          height={120}
                        />

                        <Box sx={{ p: 1 }}>
                          <Typography
                            variant="caption"
                            fontWeight={800}
                            noWrap
                            sx={{
                              display: "block",
                            }}
                          >
                            {index + 1}.{" "}
                            {selectedMedia.original_filename}
                          </Typography>

                          <Button
                            fullWidth
                            size="small"
                            color="error"
                            onClick={() =>
                              handleToggleAdMedia(
                                selectedMedia.id
                              )
                            }
                            disabled={adSaving}
                            sx={{
                              mt: 0.5,
                              textTransform: "none",
                              fontWeight: 800,
                            }}
                          >
                            Quitar
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                  )
                )}
              </Grid>
            )}

            <Box>
              <Typography
                fontWeight={900}
                sx={{ mb: 1 }}
              >
                Biblioteca multimedia
              </Typography>

              {media.length === 0 ? (
                <Alert severity="info">
                  No hay imágenes disponibles. Usa
                  “Subir imagen” para agregar la primera.
                </Alert>
              ) : (
                <Grid container spacing={1.5}>
                  {media.map((item) => {
                    const selected =
                      adForm.media_ids.includes(
                        item.id
                      );

                    const disabled =
                      !selected &&
                      adForm.media_ids.length >= 3;

                    return (
                      <Grid
                        item
                        xs={6}
                        sm={4}
                        md={3}
                        key={item.id}
                      >
                        <Card
                          elevation={0}
                          sx={{
                            height: "100%",
                            border: "2px solid",
                            borderColor: selected
                              ? "primary.main"
                              : "divider",
                            borderRadius: 2,
                            overflow: "hidden",
                            opacity: disabled
                              ? 0.55
                              : 1,
                          }}
                        >
                          <CardActionArea
                            onClick={() =>
                              handleToggleAdMedia(
                                item.id
                              )
                            }
                            disabled={disabled}
                            sx={{
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "stretch",
                            }}
                          >
                            <Box
                              sx={{
                                position: "relative",
                              }}
                            >
                              <MediaThumbnail
                                media={item}
                                height={110}
                              />

                              <Checkbox
                                checked={selected}
                                tabIndex={-1}
                                disableRipple
                                sx={{
                                  position: "absolute",
                                  top: 4,
                                  right: 4,
                                  bgcolor:
                                    "background.paper",
                                  borderRadius: "50%",

                                  "&:hover": {
                                    bgcolor:
                                      "background.paper",
                                  },
                                }}
                              />
                            </Box>

                            <Box sx={{ p: 1 }}>
                              <Typography
                                variant="caption"
                                fontWeight={800}
                                noWrap
                                sx={{
                                  display: "block",
                                }}
                              >
                                {item.original_filename}
                              </Typography>
                            </Box>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
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
            onClick={closeAdDialog}
            disabled={adSaving}
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
              adSaving ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : editingAd ? (
                <EditOutlinedIcon />
              ) : (
                <LinkOutlinedIcon />
              )
            }
            onClick={() =>
              void handleSaveAd()
            }
            disabled={adSaving}
            sx={{
              width: {
                xs: "100%",
                sm: "auto",
              },
              textTransform: "none",
              fontWeight: 800,
            }}
          >
            {adSaving
              ? "Guardando..."
              : editingAd
                ? "Guardar cambios"
                : "Agregar hipervínculo"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ELIMINAR IMÁGENES CON HIPERVÍNCULO */}
      <Dialog
        open={Boolean(adToDelete)}
        onClose={closeDeleteAdDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          <Typography
            variant="h6"
            fontWeight={900}
          >
            Eliminar imágenes con hipervínculo
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            <Typography>
              ¿Deseas eliminar{" "}
              <strong>
                “{adToDelete?.title ?? ""}”
              </strong>
              ?
            </Typography>

            <Alert severity="warning">
              Se eliminará la relación con las
              imágenes, pero los archivos continuarán
              disponibles en Multimedia.
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
            onClick={closeDeleteAdDialog}
            disabled={adDeleting}
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
              adDeleting ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <DeleteOutlineIcon />
              )
            }
            onClick={() =>
              void handleDeleteAd()
            }
            disabled={adDeleting}
            sx={{
              width: {
                xs: "100%",
                sm: "auto",
              },
              textTransform: "none",
              fontWeight: 800,
            }}
          >
            {adDeleting
              ? "Eliminando..."
              : "Sí, eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CREAR CATEGORÍA DESDE LA PUBLICACIÓN */}
      <Dialog
        open={quickCategoryOpen}
        onClose={closeQuickCategoryDialog}
        fullWidth
        maxWidth="sm"
        fullScreen={!isDesktop}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={900}>
            Nueva categoría
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            La categoría quedará activa y seleccionada
            en esta publicación.
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {quickCategoryError && (
              <Alert severity="error">
                {quickCategoryError}
              </Alert>
            )}

            <TextField
              required
              fullWidth
              autoFocus
              label="Nombre de la categoría"
              placeholder="Ejemplo: Tecnología empresarial"
              value={quickCategoryForm.name}
              onChange={(event) =>
                handleQuickCategoryNameChange(
                  event.target.value
                )
              }
              disabled={quickCategorySaving}
            />

            <TextField
              required
              fullWidth
              label="Slug"
              placeholder="tecnologia-empresarial"
              value={quickCategoryForm.slug}
              onChange={(event) =>
                handleQuickCategorySlugChange(
                  event.target.value
                )
              }
              helperText="Se genera automáticamente a partir del nombre."
              disabled={quickCategorySaving}
            />

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Descripción"
              placeholder="Describe el contenido que agrupará esta categoría."
              value={quickCategoryForm.description}
              onChange={(event) =>
                setQuickCategoryForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              disabled={quickCategorySaving}
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
            onClick={closeQuickCategoryDialog}
            disabled={quickCategorySaving}
            sx={{
              width: { xs: "100%", sm: "auto" },
              textTransform: "none",
              fontWeight: 800,
            }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            startIcon={
              quickCategorySaving ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <AddIcon />
              )
            }
            onClick={() =>
              void handleCreateQuickCategory()
            }
            disabled={quickCategorySaving}
            sx={{
              width: { xs: "100%", sm: "auto" },
              textTransform: "none",
              fontWeight: 800,
            }}
          >
            {quickCategorySaving
              ? "Creando..."
              : "Crear y seleccionar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CREAR ETIQUETA DESDE LA PUBLICACIÓN */}
      <Dialog
        open={quickTagOpen}
        onClose={closeQuickTagDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={900}>
            Nueva etiqueta
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            La etiqueta se agregará automáticamente a
            la publicación.
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {quickTagError && (
              <Alert severity="error">
                {quickTagError}
              </Alert>
            )}

            <TextField
              required
              fullWidth
              autoFocus
              label="Nombre de la etiqueta"
              placeholder="Ejemplo: Automatización"
              value={quickTagForm.name}
              onChange={(event) =>
                handleQuickTagNameChange(
                  event.target.value
                )
              }
              disabled={quickTagSaving}
            />

            <TextField
              required
              fullWidth
              label="Slug"
              placeholder="automatizacion"
              value={quickTagForm.slug}
              onChange={(event) =>
                handleQuickTagSlugChange(
                  event.target.value
                )
              }
              helperText="Se genera automáticamente a partir del nombre."
              disabled={quickTagSaving}
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
            onClick={closeQuickTagDialog}
            disabled={quickTagSaving}
            sx={{
              width: { xs: "100%", sm: "auto" },
              textTransform: "none",
              fontWeight: 800,
            }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            startIcon={
              quickTagSaving ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <LocalOfferOutlinedIcon />
              )
            }
            onClick={() =>
              void handleCreateQuickTag()
            }
            disabled={quickTagSaving}
            sx={{
              width: { xs: "100%", sm: "auto" },
              textTransform: "none",
              fontWeight: 800,
            }}
          >
            {quickTagSaving
              ? "Creando..."
              : "Crear y seleccionar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SUBIR IMAGEN DESDE LA PUBLICACIÓN */}
      <Dialog
        open={uploadMediaOpen}
        onClose={closeUploadMediaDialog}
        fullWidth
        maxWidth="sm"
        fullScreen={!isDesktop}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={900}>
            {uploadMediaTarget === "ad"
              ? "Subir imagen para hipervínculo"
              : "Subir imagen de portada"}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {uploadMediaTarget === "ad"
              ? "La imagen quedará guardada en Multimedia y se agregará al bloque actual."
              : "La imagen quedará guardada en Multimedia y seleccionada como portada."}
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {uploadMediaError && (
              <Alert severity="error">
                {uploadMediaError}
              </Alert>
            )}

            <Button
              component="label"
              variant="outlined"
              startIcon={
                <CloudUploadOutlinedIcon />
              }
              disabled={uploadingMedia}
              sx={{
                minHeight: 48,
                textTransform: "none",
                fontWeight: 800,
              }}
            >
              {uploadFile
                ? "Cambiar imagen"
                : "Seleccionar imagen"}

              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(event) =>
                  handleUploadFileSelected(
                    event.target.files?.[0] ?? null
                  )
                }
              />
            </Button>

            {uploadFile && (
              <Alert severity="info" icon={false}>
                <Typography fontWeight={800}>
                  {uploadFile.name}
                </Typography>

                <Typography variant="body2">
                  {(uploadFile.size / 1024).toFixed(2)} KB
                  {uploadFile.type
                    ? ` · ${uploadFile.type}`
                    : ""}
                </Typography>
              </Alert>
            )}

            {uploadPreview && (
              <Box
                component="img"
                src={uploadPreview}
                alt="Vista previa de la imagen seleccionada"
                sx={{
                  width: "100%",
                  maxHeight: 300,
                  display: "block",
                  objectFit: "contain",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "action.hover",
                }}
              />
            )}

            <TextField
              fullWidth
              label="Texto alternativo"
              placeholder="Describe brevemente la imagen"
              value={uploadAltText}
              onChange={(event) =>
                setUploadAltText(event.target.value)
              }
              helperText="Ayuda a la accesibilidad y al SEO."
              disabled={uploadingMedia}
            />

            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Descripción o pie de imagen"
              value={uploadCaption}
              onChange={(event) =>
                setUploadCaption(event.target.value)
              }
              disabled={uploadingMedia}
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
            onClick={closeUploadMediaDialog}
            disabled={uploadingMedia}
            sx={{
              width: { xs: "100%", sm: "auto" },
              textTransform: "none",
              fontWeight: 800,
            }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            startIcon={
              uploadingMedia ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <CloudUploadOutlinedIcon />
              )
            }
            onClick={() =>
              void handleUploadMedia()
            }
            disabled={uploadingMedia || !uploadFile}
            sx={{
              width: { xs: "100%", sm: "auto" },
              textTransform: "none",
              fontWeight: 800,
            }}
          >
            {uploadingMedia
              ? "Subiendo..."
              : uploadMediaTarget === "ad"
                ? "Subir y agregar"
                : "Subir y seleccionar"}
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

              {selectedPost.ads &&
                selectedPost.ads.length > 0 && (
                  <Stack spacing={2}>
                    <Divider />

                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                    >
                      <LinkOutlinedIcon
                        color="primary"
                      />

                      <Typography
                        variant="h6"
                        fontWeight={900}
                      >
                        Imágenes con hipervínculo
                      </Typography>
                    </Stack>

                    {sortAds(
                      selectedPost.ads
                    ).map((ad) => (
                      <Card
                        key={ad.id}
                        elevation={0}
                        sx={{
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 3,
                        }}
                      >
                        <CardContent>
                          <Stack spacing={1.5}>
                            <Stack
                              direction={{
                                xs: "column",
                                sm: "row",
                              }}
                              justifyContent="space-between"
                              alignItems={{
                                xs: "flex-start",
                                sm: "center",
                              }}
                              spacing={1}
                            >
                              <Box>
                                <Typography
                                  fontWeight={900}
                                >
                                  {ad.title}
                                </Typography>

                                {ad.description && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {ad.description}
                                  </Typography>
                                )}
                              </Box>

                              <Chip
                                size="small"
                                label={getAdStatusLabel(
                                  ad.status
                                )}
                                color={
                                  ad.status === "active"
                                    ? "success"
                                    : "default"
                                }
                              />
                            </Stack>

                            <Grid
                              container
                              spacing={1.5}
                            >
                              {ad.images.map(
                                (image) => (
                                  <Grid
                                    item
                                    xs={12}
                                    sm={4}
                                    key={image.id}
                                  >
                                    <Box
                                      component="a"
                                      href={ad.link_url}
                                      target="_blank"
                                      rel="noopener noreferrer sponsored"
                                      aria-label={ad.title}
                                      sx={{
                                        display: "block",
                                        borderRadius: 2,
                                        overflow: "hidden",
                                        border: "1px solid",
                                        borderColor: "divider",
                                      }}
                                    >
                                      <MediaThumbnail
                                        media={image.media}
                                        height={150}
                                      />
                                    </Box>
                                  </Grid>
                                )
                              )}
                            </Grid>

                            <Button
                              component="a"
                              href={ad.link_url}
                              target="_blank"
                              rel="noopener noreferrer sponsored"
                              variant="outlined"
                              startIcon={
                                <LinkOutlinedIcon />
                              }
                              sx={{
                                alignSelf:
                                  "flex-start",
                                textTransform: "none",
                                fontWeight: 800,
                              }}
                            >
                              {ad.link_text}
                            </Button>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
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