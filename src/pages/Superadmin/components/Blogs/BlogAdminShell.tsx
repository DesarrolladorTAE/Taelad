import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArticleIcon from "@mui/icons-material/Article";
import CategoryIcon from "@mui/icons-material/Category";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PermMediaIcon from "@mui/icons-material/PermMedia";

import BlogPostsSection from "./BlogPostsSection";
import BlogCategoriesSection from "./BlogCategoriesSection";
import BlogTagsSection from "./BlogTagsSection";
import BlogMediaSection from "./BlogMediaSection";
import {
  blogApi,
  type Blog,
} from "../../../../services/api/blogs";

type BlogSection =
  | "inicio"
  | "publicaciones"
  | "categorias"
  | "etiquetas"
  | "multimedia";

type Props = {
  systemId: number;
  systemName: string;
  backView: string;
  setView: (view: string) => void;
};

type ModuleCard = {
  id: Exclude<BlogSection, "inicio">;
  title: string;
  description: string;
  icon: ReactNode;
};

const modules: ModuleCard[] = [
  {
    id: "publicaciones",
    title: "Publicaciones",
    description:
      "Crea, edita, publica, programa y administra los artículos del blog.",
    icon: <ArticleIcon />,
  },
  {
    id: "categorias",
    title: "Categorías",
    description:
      "Organiza las publicaciones mediante categorías principales y subcategorías.",
    icon: <CategoryIcon />,
  },
  {
    id: "etiquetas",
    title: "Etiquetas",
    description:
      "Administra las etiquetas utilizadas para clasificar el contenido.",
    icon: <LocalOfferIcon />,
  },
  {
    id: "multimedia",
    title: "Multimedia",
    description:
      "Gestiona imágenes de portada, contenido y Open Graph del blog.",
    icon: <PermMediaIcon />,
  },
];

function getSectionTitle(section: BlogSection): string {
  const titles: Record<BlogSection, string> = {
    inicio: "Blogs",
    publicaciones: "Publicaciones",
    categorias: "Categorías",
    etiquetas: "Etiquetas",
    multimedia: "Multimedia",
  };

  return titles[section];
}

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

  return "No fue posible consultar el blog del sistema.";
}

export default function BlogAdminShell({
  systemId,
  systemName,
  backView,
  setView,
}: Props) {
  const [section, setSection] =
    useState<BlogSection>("inicio");

  const [blog, setBlog] =
    useState<Blog | null>(null);

  const [loadingBlog, setLoadingBlog] =
    useState(true);

  const [blogError, setBlogError] =
    useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadBlog() {
      try {
        setSection("inicio");
        setLoadingBlog(true);
        setBlogError(null);
        setBlog(null);

        const response = await blogApi.list(systemId, {
          status: "active",
          per_page: 50,
        });

        if (!active) {
          return;
        }

        const blogs = response.data?.data ?? [];

        setBlog(blogs[0] ?? null);
      } catch (error) {
        if (!active) {
          return;
        }

        setBlog(null);
        setBlogError(getErrorMessage(error));
      } finally {
        if (active) {
          setLoadingBlog(false);
        }
      }
    }

    loadBlog();

    return () => {
      active = false;
    };
  }, [systemId]);

  /*
  |--------------------------------------------------------------------------
  | ESTADO DE CARGA
  |--------------------------------------------------------------------------
  */

  if (loadingBlog) {
    return (
      <Box
        sx={{
          minHeight: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />

          <Typography color="text.secondary">
            Consultando blog de {systemName}...
          </Typography>
        </Stack>
      </Box>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

  if (blogError) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">
          {blogError}
        </Alert>

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => setView(backView)}
          sx={{
            alignSelf: "flex-start",
            textTransform: "none",
            fontWeight: 800,
            borderRadius: 2.5,
          }}
        >
          Volver al dashboard
        </Button>
      </Stack>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | BLOG NO ENCONTRADO
  |--------------------------------------------------------------------------
  */

  if (!blog) {
    return (
      <Stack spacing={2}>
        <Alert severity="warning">
          No existe un blog activo registrado para{" "}
          {systemName}.
        </Alert>

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => setView(backView)}
          sx={{
            alignSelf: "flex-start",
            textTransform: "none",
            fontWeight: 800,
            borderRadius: 2.5,
          }}
        >
          Volver al dashboard
        </Button>
      </Stack>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PUBLICACIONES
  |--------------------------------------------------------------------------
  */

  if (section === "publicaciones") {
    return (
      <BlogPostsSection
        systemId={systemId}
        systemName={systemName}
        blogId={blog.id}
        blogName={blog.name}
        onBack={() => setSection("inicio")}
      />
    );
  }
  // Categorias 
  if (section === "categorias") {
  return (
    <BlogCategoriesSection
      systemId={systemId}
      systemName={systemName}
      blogId={blog.id}
      blogName={blog.name}
      onBack={() => setSection("inicio")}
    />
  );
}
//Etiquetas

 if (section === "etiquetas") {
  return (
    <BlogTagsSection
      systemId={systemId}
      systemName={systemName}
      blogId={blog.id}
      blogName={blog.name}
      onBack={() => setSection("inicio")}
    />
  );
}
if (section === "multimedia") {
  return (
    <BlogMediaSection
      systemId={systemId}
      systemName={systemName}
      blogId={blog.id}
      blogName={blog.name}
      onBack={() => setSection("inicio")}
    />
  );

}
  /*
  |--------------------------------------------------------------------------
  | DASHBOARD PRINCIPAL DEL BLOG
  |--------------------------------------------------------------------------
  */

  return (
    <Box sx={{ width: "100%" }}>
      <Stack spacing={3}>
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
          spacing={2}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight={900}
            >
              Blogs
            </Typography>

            <Typography color="text.secondary">
              Administración de contenido para{" "}
              {systemName}.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => setView(backView)}
            sx={{
              textTransform: "none",
              fontWeight: 800,
              borderRadius: 2.5,
            }}
          >
            Volver al dashboard
          </Button>
        </Stack>

        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 2.5,
                md: 3,
              },
            }}
          >
            <Stack spacing={2}>
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
                spacing={2}
              >
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={900}
                  >
                    {blog.name}
                  </Typography>

                  <Typography color="text.secondary">
                    /{blog.slug}
                  </Typography>
                </Box>

                <Chip
                  label={
                    blog.status === "active"
                      ? "Activo"
                      : "Inactivo"
                  }
                  color={
                    blog.status === "active"
                      ? "success"
                      : "default"
                  }
                  size="small"
                  sx={{
                    fontWeight: 800,
                  }}
                />
              </Stack>

              {blog.description && (
                <Typography color="text.secondary">
                  {blog.description}
                </Typography>
              )}

              <Divider />

              <Stack
                direction="row"
                spacing={4}
                useFlexGap
                flexWrap="wrap"
              >
                <Box>
                  <Typography fontWeight={900}>
                    {blog.totals?.posts ?? 0}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Publicaciones
                  </Typography>
                </Box>

                <Box>
                  <Typography fontWeight={900}>
                    {blog.totals?.categories ?? 0}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Categorías
                  </Typography>
                </Box>

                <Box>
                  <Typography fontWeight={900}>
                    {blog.totals?.tags ?? 0}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Etiquetas
                  </Typography>
                </Box>

                <Box>
                  <Typography fontWeight={900}>
                    {blog.totals?.media ?? 0}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Multimedia
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {modules.map((module) => (
            <Grid
              item
              xs={12}
              sm={6}
              lg={3}
              key={module.id}
            >
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  minHeight: 245,
                  borderRadius: 4,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  overflow: "hidden",
                  transition: "0.18s ease",

                  "&:hover": {
                    transform: "translateY(-4px)",
                    borderColor: "primary.main",
                    boxShadow:
                      "0 14px 32px rgba(15, 23, 42, 0.12)",
                  },
                }}
              >
                <CardActionArea
                  onClick={() =>
                    setSection(module.id)
                  }
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "stretch",
                  }}
                >
                  <CardContent
                    sx={{
                      width: "100%",
                      p: 3,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        mb: 2.5,
                        bgcolor: "primary.main",
                        color:
                          "primary.contrastText",
                      }}
                    >
                      {module.icon}
                    </Avatar>

                    <Typography
                      variant="h6"
                      fontWeight={900}
                      mb={1}
                    >
                      {module.title}
                    </Typography>

                    <Typography
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.6,
                      }}
                    >
                      {module.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Box>
  );
}