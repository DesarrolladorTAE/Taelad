import {
  useEffect,
  useMemo,
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
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PermMediaIcon from "@mui/icons-material/PermMedia";
import WebRoundedIcon from "@mui/icons-material/WebRounded";

import BlogPostsSection from "./BlogPostsSection";
import BlogCategoriesSection from "./BlogCategoriesSection";
import BlogTagsSection from "./BlogTagsSection";
import BlogMediaSection from "./BlogMediaSection";
import ClientHistoryPage from "../clientHistory/ClientHistoryPage";

import {
  blogApi,
  type Blog,
} from "../../../../services/api/blogs";

type MainSection =
  | "inicio"
  | "blogs"
  | "historial";

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

const blogModules: ModuleCard[] = [
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

function getDefaultSystemLogo(
  systemName: string,
): string | null {
  const normalizedName =
    normalizeText(systemName);

  if (
    normalizedName.includes("clicmenu")
  ) {
    return "/images/systems/clicmenu.png";
  }

  if (
    normalizedName.includes("mitienda") ||
    normalizedName.includes("mtelmx")
  ) {
    return "/images/systems/mitienda.png";
  }

  if (
    normalizedName.includes("taeconta")
  ) {
    return "/images/systems/taeconta.png";
  }

  if (
    normalizedName.includes("telorecargo")
  ) {
    return "/images/systems/telorecargo.png";
  }

  if (
    normalizedName.includes("chatingbot")
  ) {
    return "/images/systems/chatingbot.png";
  }

  if (
    normalizedName.includes(
      "tecnologiasadministrativas",
    ) ||
    normalizedName.includes("elad")
  ) {
    return "/images/systems/elad.png";
  }

  return null;
}

function getSystemInitials(
  systemName: string,
): string {
  const words = systemName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "S";
  }

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
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
  const [failed, setFailed] =
    useState(false);

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
  blog: Blog,
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

function getErrorMessage(
  error: unknown,
): string {
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

function PageHeader({
  title,
  systemName,
  logo,
  backLabel,
  onBack,
}: {
  title: string;
  systemName: string;
  logo: string | null;
  backLabel: string;
  onBack: () => void;
}) {
  return (
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
          src={logo}
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
          {title}
        </Typography>
      </Stack>

      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={onBack}
        sx={{
          flexShrink: 0,
          textTransform: "none",
          fontWeight: 800,
          borderRadius: 2.5,
        }}
      >
        {backLabel}
      </Button>
    </Stack>
  );
}

function NavigationCard({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        minHeight: 250,
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
        onClick={onClick}
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "stretch",
        }}
      >
        <CardContent
          sx={{
            width: "100%",
            p: 3.5,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <Avatar
            sx={{
              width: 62,
              height: 62,
              mb: 3,
              bgcolor: "primary.main",
              color: "primary.contrastText",
            }}
          >
            {icon}
          </Avatar>

          <Typography
            variant="h5"
            fontWeight={900}
            mb={1.25}
          >
            {title}
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              lineHeight: 1.7,
            }}
          >
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function BlogAdminShell({
  systemId,
  systemName,
  systemLogo = null,
  backView,
  setView,
}: Props) {
  const [
    mainSection,
    setMainSection,
  ] = useState<MainSection>("inicio");

  const [
    blogSection,
    setBlogSection,
  ] = useState<BlogSection>("inicio");

  const [blog, setBlog] =
    useState<Blog | null>(null);

  const [
    loadingBlog,
    setLoadingBlog,
  ] = useState(false);

  const [
    blogError,
    setBlogError,
  ] = useState<string | null>(null);

  useEffect(() => {
    setMainSection("inicio");
    setBlogSection("inicio");
    setBlog(null);
    setBlogError(null);
    setLoadingBlog(false);
  }, [systemId]);

  useEffect(() => {
    if (mainSection !== "blogs") {
      return;
    }

    let active = true;

    async function loadBlog() {
      try {
        setBlogSection("inicio");
        setLoadingBlog(true);
        setBlogError(null);
        setBlog(null);

        const response =
          await blogApi.list(systemId, {
            status: "active",
            per_page: 50,
          });

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
          getErrorMessage(error),
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
  }, [mainSection, systemId]);

  const resolvedSystemLogo =
    useMemo(() => {
      const brandedBlog =
        blog as BlogWithBranding | null;

      return (
        systemLogo?.trim() ||
        brandedBlog?.system?.logo_url?.trim() ||
        brandedBlog?.system?.logo?.trim() ||
        brandedBlog?.system?.image_url?.trim() ||
        brandedBlog?.logo_url?.trim() ||
        getDefaultSystemLogo(systemName)
      );
    }, [
      blog,
      systemLogo,
      systemName,
    ]);

  if (
    mainSection === "blogs" &&
    blog &&
    blogSection === "publicaciones"
  ) {
    return (
      <BlogPostsSection
        systemId={systemId}
        systemName={systemName}
        blogId={blog.id}
        blogName={blog.name}
        onBack={() =>
          setBlogSection("inicio")
        }
      />
    );
  }

  if (
    mainSection === "blogs" &&
    blog &&
    blogSection === "categorias"
  ) {
    return (
      <BlogCategoriesSection
        systemId={systemId}
        systemName={systemName}
        blogId={blog.id}
        blogName={blog.name}
        onBack={() =>
          setBlogSection("inicio")
        }
      />
    );
  }

  if (
    mainSection === "blogs" &&
    blog &&
    blogSection === "etiquetas"
  ) {
    return (
      <BlogTagsSection
        systemId={systemId}
        systemName={systemName}
        blogId={blog.id}
        blogName={blog.name}
        onBack={() =>
          setBlogSection("inicio")
        }
      />
    );
  }

  if (
    mainSection === "blogs" &&
    blog &&
    blogSection === "multimedia"
  ) {
    return (
      <BlogMediaSection
        systemId={systemId}
        systemName={systemName}
        blogId={blog.id}
        blogName={blog.name}
        onBack={() =>
          setBlogSection("inicio")
        }
      />
    );
  }

  if (mainSection === "blogs") {
    return (
      <Box sx={{ width: "100%" }}>
        <Stack spacing={4}>
          <PageHeader
            title={`Blogs ${systemName}`}
            systemName={systemName}
            logo={resolvedSystemLogo}
            backLabel="Volver a Tecnologías Administrativas"
            onBack={() => {
              setBlogSection("inicio");
              setMainSection("inicio");
            }}
          />

          {loadingBlog ? (
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
          ) : blogError ? (
            <Alert severity="error">
              {blogError}
            </Alert>
          ) : !blog ? (
            <Alert severity="warning">
              No existe un blog activo
              registrado para {systemName}.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {blogModules.map(
                (module) => {
                  const count =
                    getModuleCount(
                      module.id,
                      blog,
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
                          bgcolor:
                            "background.paper",
                          overflow: "hidden",
                          transition:
                            "0.18s ease",

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
                            setBlogSection(
                              module.id,
                            )
                          }
                          sx={{
                            height: "100%",
                            display: "flex",
                            alignItems:
                              "stretch",
                          }}
                        >
                          <CardContent
                            sx={{
                              width: "100%",
                              p: 3,
                              display: "flex",
                              flexDirection:
                                "column",
                              alignItems:
                                "flex-start",
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
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  borderRadius:
                                    2.5,
                                  bgcolor:
                                    "action.hover",
                                  border:
                                    "1px solid",
                                  borderColor:
                                    "divider",
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
                              {
                                module.description
                              }
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  );
                },
              )}
            </Grid>
          )}
        </Stack>
      </Box>
    );
  }

  if (mainSection === "historial") {
    return (
      <ClientHistoryPage
        systemName={systemName}
        onBack={() =>
          setMainSection("inicio")
        }
      />
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Stack spacing={4}>
        <PageHeader
          title={systemName}
          systemName={systemName}
          logo={resolvedSystemLogo}
          backLabel="Volver al dashboard"
          onBack={() =>
            setView(backView)
          }
        />

        <Grid container spacing={3}>
          <Grid
            item
            xs={12}
            md={6}
          >
            <NavigationCard
              title="Blogs"
              description="Administra publicaciones, categorías, etiquetas y contenido multimedia del blog."
              icon={<WebRoundedIcon />}
              onClick={() =>
                setMainSection("blogs")
              }
            />
          </Grid>

          <Grid
            item
            xs={12}
            md={6}
          >
            <NavigationCard
              title="Historial del cliente"
              description="Consulta movimientos por mes o año, importes, cantidades, estatus y archivos de factura PDF o XML."
              icon={
                <HistoryRoundedIcon />
              }
              onClick={() =>
                setMainSection(
                  "historial",
                )
              }
            />
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}