import {
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
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArticleIcon from "@mui/icons-material/Article";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import VisibilityIcon from "@mui/icons-material/Visibility";

import {
  blogApi,
  type BlogPost,
} from "../../../../services/api/blogs";

type Props = {
  systemId: number;
  systemName: string;
  blogId: number;
  blogName: string;
  onBack: () => void;
};

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
    ).response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "No fue posible consultar las publicaciones.";
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

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: "Borrador",
    published: "Publicado",
    scheduled: "Programado",
    archived: "Archivado",
    inactive: "Inactivo",
  };

  return labels[status] ?? status;
}

function getStatusColor(
  status: string
): "success" | "warning" | "default" | "info" {
  if (status === "published") {
    return "success";
  }

  if (status === "scheduled") {
    return "info";
  }

  if (status === "draft") {
    return "warning";
  }

  return "default";
}

export default function BlogPostsSection({
  systemId,
  systemName,
  blogId,
  blogName,
  onBack,
}: Props) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  async function loadPosts(selectedPage = page) {
    try {
      setLoading(true);
      setError(null);

      const response = await blogApi.posts(
        systemId,
        blogId,
        {
          page: selectedPage,
          per_page: 16,
        }
      );

      const payload = response.data;

      setPosts(payload.data ?? []);
      setLastPage(payload.meta?.last_page ?? 1);
      setTotal(payload.meta?.total ?? 0);
    } catch (requestError) {
      setPosts([]);
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts(page);
  }, [systemId, blogId, page]);

  const filteredPosts = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return posts.filter((post) => {
      const matchesStatus =
        status === "all" ||
        post.status === status;

      const matchesSearch =
        normalizedSearch === "" ||
        post.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        post.slug
          .toLowerCase()
          .includes(normalizedSearch) ||
        (post.excerpt ?? "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        (post.category?.name ?? "")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [posts, search, status]);

  return (
    <Box sx={{ width: "100%" }}>
      <Stack spacing={3}>
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
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => loadPosts(page)}
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
                  label="Buscar publicación"
                  placeholder="Título, slug, resumen o categoría"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  InputProps={{
                    startAdornment: (
                      <SearchIcon
                        sx={{
                          mr: 1,
                          color: "text.secondary",
                        }}
                      />
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="post-status-label">
                    Estado
                  </InputLabel>

                  <Select
                    labelId="post-status-label"
                    label="Estado"
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value)
                    }
                  >
                    <MenuItem value="all">
                      Todos
                    </MenuItem>

                    <MenuItem value="published">
                      Publicados
                    </MenuItem>

                    <MenuItem value="draft">
                      Borradores
                    </MenuItem>

                    <MenuItem value="scheduled">
                      Programados
                    </MenuItem>

                    <MenuItem value="archived">
                      Archivados
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}

        {loading ? (
          <Box
            sx={{
              minHeight: 260,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Stack alignItems="center" spacing={2}>
              <CircularProgress />

              <Typography color="text.secondary">
                Consultando publicaciones...
              </Typography>
            </Stack>
          </Box>
        ) : filteredPosts.length === 0 ? (
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent
              sx={{
                py: 7,
              }}
            >
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
                  No existen resultados para los filtros
                  seleccionados.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {filteredPosts.map((post) => (
              <Grid
                item
                xs={12}
                md={6}
                xl={4}
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
                  {post.cover_media?.url ? (
                    <Box
                      component="img"
                      src={post.cover_media.url}
                      alt={
                        post.cover_media.alt_text ??
                        post.title
                      }
                      sx={{
                        width: "100%",
                        height: 190,
                        objectFit: "cover",
                        display: "block",
                        bgcolor: "action.hover",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 190,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "action.hover",
                      }}
                    >
                      <ArticleIcon
                        sx={{
                          fontSize: 58,
                          color: "text.disabled",
                        }}
                      />
                    </Box>
                  )}

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
                          sx={{
                            fontWeight: 800,
                          }}
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
                          sx={{
                            lineHeight: 1.35,
                          }}
                        >
                          {post.title}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.5,
                            wordBreak: "break-word",
                          }}
                        >
                          /{post.slug}
                        </Typography>
                      </Box>

                      {post.excerpt && (
                        <Typography
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {post.excerpt}
                        </Typography>
                      )}

                      <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        flexWrap="wrap"
                      >
                        {post.category && (
                          <Chip
                            label={post.category.name}
                            size="small"
                            variant="outlined"
                          />
                        )}

                        {post.tags.map((tag) => (
                          <Chip
                            key={tag.id}
                            label={tag.name}
                            size="small"
                          />
                        ))}
                      </Stack>

                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                        >
                          Autor:{" "}
                          {post.author?.name ??
                            "Sin autor"}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Publicación:{" "}
                          {formatDate(
                            post.published_at
                          )}
                        </Typography>
                      </Box>

                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.7}
                        color="text.secondary"
                      >
                        <VisibilityIcon fontSize="small" />

                        <Typography variant="body2">
                          {post.views_count} vistas
                        </Typography>
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
    </Box>
  );
}