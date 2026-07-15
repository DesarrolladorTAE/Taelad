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
  CircularProgress,
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
  systemLogo?: string | null;
  backView: string;
  setView: (view: string) => void;
};

type ModuleCard = {
  id: Exclude<BlogSection, "inicio">;
  title: string;
  description: string;
  icon: ReactNode;
};

type BlogWithBranding = Blog & {
  logo_url?: string | null;
  system?: {
    logo_url?: string | null;
    logo?: string | null;
    image_url?: string | null;
  } | null;
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

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function getDefaultSystemLogo(systemName: string): string | null {
  const normalizedName = normalizeText(systemName);

  if (normalizedName.includes("clicmenu")) {
    return "/images/systems/clicmenu.png";
  }

  if (
    normalizedName.includes("mitienda") ||
    normalizedName.includes("mtelmx")
  ) {
    return "/images/systems/mitienda.png";
  }

  if (normalizedName.includes("taeconta")) {
    return "/images/systems/taeconta.png";
  }

  if (normalizedName.includes("telorecargo")) {
    return "/images/systems/telorecargo.png";
  }

  if (normalizedName.includes("chatingbot")) {
    return "/images/systems/chatingbot.png";
  }

  if (
    normalizedName.includes("tecnologiasadministrativas") ||
    normalizedName.includes("elad")
  ) {
    return "/images/systems/elad.png";
  }

  return null;
}

function getSystemInitials(systemName: string): string {
  const words = systemName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "S";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function SystemLogo({
  src,
  systemName,
}: {
  src: string | null;
  systemName: string;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <Avatar
        variant="rounded"
        sx={{
          width: {
            xs: 48,
            sm: 56,
          },
          height: {
            xs: 48,
            sm: 56,
          },
          borderRadius: 2.5,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          fontWeight: 900,
          fontSize: "1rem",
        }}
      >
        {getSystemInitials(systemName)}
      </Avatar>
    );
  }

  return (
    <Box
      sx={{
        width: {
          xs: 48,
          sm: 56,
        },
        height: {
          xs: 48,
          sm: 56,
        },
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        p: 0.75,
      }}
    >
      <Box
        component="img"
        src={src}
        alt={`Logo de ${systemName}`}
        onError={() => setFailed(true)}
        sx={{
          width: "100%",
          height: "100%",
          display: "block",
          objectFit: "contain",
        }}
      />
    </Box>
  );
}

function getModuleCount(
  moduleId: ModuleCard["id"],
  blog: Blog
): number {
  switch (moduleId) {
    case "publicaciones":
      return blog.totals?.posts ?? 0;

    case "categorias":
      return blog.totals?.categories ?? 0;

    case "etiquetas":
      return blog.totals?.tags ?? 0;

    case "multimedia":
      return blog.totals?.media ?? 0;

    default:
      return 0;
  }
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
  systemLogo = null,
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

        const response = await blogApi.list(
          systemId,
          {
            status: "active",
            per_page: 50,
          }
        );

        if (!active) {
          return;
        }

        const blogs =
          response.data?.data ?? [];

        setBlog(blogs[0] ?? null);
      } catch (error) {
        if (!active) {
          return;
        }

        setBlog(null);
        setBlogError(
          getErrorMessage(error)
        );
      } finally {
        if (active) {
          setLoadingBlog(false);
        }
      }
    }

    void loadBlog();

    return () => {
      active = false;
    };
  }, [systemId]);

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
        <Stack
          alignItems="center"
          spacing={2}
        >
          <CircularProgress />

          <Typography color="text.secondary">
            Consultando blog de{" "}
            {systemName}...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (blogError) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">
          {blogError}
        </Alert>

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() =>
            setView(backView)
          }
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

  if (!blog) {
    return (
      <Stack spacing={2}>
        <Alert severity="warning">
          No existe un blog activo
          registrado para {systemName}.
        </Alert>

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() =>
            setView(backView)
          }
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

  if (section === "publicaciones") {
    return (
      <BlogPostsSection
        systemId={systemId}
        systemName={systemName}
        blogId={blog.id}
        blogName={blog.name}
        onBack={() =>
          setSection("inicio")
        }
      />
    );
  }

  if (section === "categorias") {
    return (
      <BlogCategoriesSection
        systemId={systemId}
        systemName={systemName}
        blogId={blog.id}
        blogName={blog.name}
        onBack={() =>
          setSection("inicio")
        }
      />
    );
  }

  if (section === "etiquetas") {
    return (
      <BlogTagsSection
        systemId={systemId}
        systemName={systemName}
        blogId={blog.id}
        blogName={blog.name}
        onBack={() =>
          setSection("inicio")
        }
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
        onBack={() =>
          setSection("inicio")
        }
      />
    );
  }

  const brandedBlog = blog as BlogWithBranding;

  const resolvedSystemLogo =
    systemLogo?.trim() ||
    brandedBlog.system?.logo_url?.trim() ||
    brandedBlog.system?.logo?.trim() ||
    brandedBlog.system?.image_url?.trim() ||
    brandedBlog.logo_url?.trim() ||
    getDefaultSystemLogo(systemName);

  return (
    <Box sx={{ width: "100%" }}>
      <Stack spacing={4}>
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
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.75}
            sx={{ minWidth: 0 }}
          >
            <SystemLogo
              src={resolvedSystemLogo}
              systemName={systemName}
            />

            <Typography
              variant="h4"
              fontWeight={900}
              sx={{
                minWidth: 0,
                lineHeight: 1.15,
                wordBreak: "break-word",
                fontSize: {
                  xs: "1.75rem",
                  sm: "2.125rem",
                },
              }}
            >
              Blogs {systemName}
            </Typography>
          </Stack>

          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() =>
              setView(backView)
            }
            sx={{
              flexShrink: 0,
              textTransform: "none",
              fontWeight: 800,
              borderRadius: 2.5,
            }}
          >
            Volver al dashboard
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {modules.map((module) => {
            const count = getModuleCount(
              module.id,
              blog
            );

            return (
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
                      transform:
                        "translateY(-4px)",
                      borderColor:
                        "primary.main",
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
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={2}
                        sx={{
                          width: "100%",
                          mb: 2.5,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 56,
                            height: 56,
                            bgcolor:
                              "primary.main",
                            color:
                              "primary.contrastText",
                          }}
                        >
                          {module.icon}
                        </Avatar>

                        <Box
                          sx={{
                            minWidth: 52,
                            height: 44,
                            px: 1.5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 2.5,
                            bgcolor: "action.hover",
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Typography
                            variant="h5"
                            fontWeight={900}
                            lineHeight={1}
                            color="text.primary"
                          >
                            {count}
                          </Typography>
                        </Box>
                      </Stack>

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
            );
          })}
        </Grid>
      </Stack>
    </Box>
  );
}