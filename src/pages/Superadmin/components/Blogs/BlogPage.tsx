import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { Link as RouterLink } from "react-router-dom";

import {
  getPublicBlogPosts,
  PublicBlogPost,
} from "../../../../services/publicBlogService";

/* =========================
   FORMATEAR FECHA
========================= */

function formatDate(value: string | null): string {
  if (!value) {
    return "Sin fecha";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

/* =========================
   COMPONENTE
========================= */

export default function BlogPage() {
  const [posts, setPosts] = useState<PublicBlogPost[]>([]);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* =========================
     CARGAR PUBLICACIONES
  ========================= */

  useEffect(() => {
    let active = true;

    async function loadPosts() {
      setLoading(true);
      setError(null);

      try {
        const response = await getPublicBlogPosts({
          page,
          per_page: 12,
          search,
          order: "latest",
        });

        if (!active) {
          return;
        }

        setPosts(response.data);

        setLastPage(
          Math.max(response.meta.last_page || 1, 1)
        );
      } catch (requestError) {
        console.error(
          "Error cargando publicaciones del blog:",
          requestError
        );

        if (!active) {
          return;
        }

        setPosts([]);
        setLastPage(1);

        setError(
          "No fue posible cargar las publicaciones."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPosts();

    return () => {
      active = false;
    };
  }, [page, search]);

  /* =========================
     BUSCADOR
  ========================= */

  const handleSearchChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setSearchInput(event.target.value);
  };

  const handleSearch = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setPage(1);
    setSearch(searchInput.trim());
  };

  /* =========================
     PAGINACIÓN
  ========================= */

  const handlePageChange = (
    _event: ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =========================
     VISTA
  ========================= */

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: {
          xs: 3,
          md: 5,
        },
      }}
    >
      <Stack spacing={3}>
        {/* ENCABEZADO */}

        <Box>
          <Typography
            component="h1"
            variant="h4"
            fontWeight={700}
          >
            Blog ClicMenu
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            Contenido relacionado con restaurantes,
            menús digitales, ventas y administración
            gastronómica.
          </Typography>
        </Box>

        {/* BUSCADOR */}

        <Box
          component="form"
          onSubmit={handleSearch}
        >
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={2}
          >
            <TextField
              fullWidth
              size="small"
              label="Buscar publicaciones"
              placeholder="Escribe el título o contenido"
              value={searchInput}
              onChange={handleSearchChange}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              Buscar
            </Button>
          </Stack>
        </Box>

        {/* ERROR */}

        {error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}

        {/* CARGANDO */}

        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            py={8}
          >
            <CircularProgress />
          </Box>
        ) : posts.length === 0 ? (
          /* SIN RESULTADOS */

          <Alert severity="info">
            No se encontraron publicaciones.
          </Alert>
        ) : (
          /* PUBLICACIONES */

          <Grid container spacing={3}>
            {posts.map((post) => (
              <Grid
                item
                xs={12}
                md={6}
                lg={4}
                key={post.slug}
              >
                <Card
                  variant="outlined"
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {post.cover?.url && (
                    <Box
                      component="img"
                      src={post.cover.url}
                      alt={
                        post.cover.alt_text ||
                        post.title
                      }
                      sx={{
                        width: "100%",
                        height: 210,
                        objectFit: "cover",
                      }}
                    />
                  )}

                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      flexGrow: 1,
                    }}
                  >
                    <Stack
                      spacing={2}
                      sx={{ height: "100%" }}
                    >
                      {post.is_featured && (
                        <Chip
                          size="small"
                          color="primary"
                          label="Destacada"
                          sx={{
                            alignSelf: "flex-start",
                          }}
                        />
                      )}

                      <Typography
                        component="h2"
                        variant="h6"
                        fontWeight={700}
                      >
                        {post.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          flexGrow: 1,
                        }}
                      >
                        {post.excerpt ||
                          "Sin descripción."}
                      </Typography>

                      {post.category && (
                        <Chip
                          size="small"
                          label={post.category.name}
                          sx={{
                            alignSelf: "flex-start",
                          }}
                        />
                      )}

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {formatDate(
                          post.published_at
                        )}
                      </Typography>

                      <Button
                        component={RouterLink}
                        to={`/blog/${encodeURIComponent(
                          post.slug
                        )}`}
                        variant="outlined"
                        size="small"
                        fullWidth
                      >
                        Leer publicación
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* PAGINACIÓN */}

        {!loading &&
          !error &&
          lastPage > 1 && (
            <Box
              display="flex"
              justifyContent="center"
            >
              <Pagination
                page={page}
                count={lastPage}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
      </Stack>
    </Container>
  );
}