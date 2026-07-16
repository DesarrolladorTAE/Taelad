import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";
import DOMPurify from "dompurify";

import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Link,
  Stack,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import {
  Link as RouterLink,
  useParams,
} from "react-router-dom";

import {
  getPublicBlogPost,
  PublicBlogPostDetail,
} from "../../../../services/publicBlogService";

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

export default function BlogPostPage() {
  const { postSlug } = useParams<{
    postSlug: string;
  }>();

  const [post, setPost] =
    useState<PublicBlogPostDetail | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadPost() {
      if (!postSlug) {
        setError(
          "No se proporcionó una publicación válida."
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response =
          await getPublicBlogPost(postSlug);

        if (!active) {
          return;
        }

        setPost(response);
      } catch (requestError) {
        if (!active) {
          return;
        }

        setPost(null);

        if (
          axios.isAxiosError(requestError) &&
          requestError.response?.status === 404
        ) {
          setError(
            "La publicación solicitada no existe o no está disponible."
          );
        } else {
          setError(
            "No fue posible cargar la publicación."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPost();

    return () => {
      active = false;
    };
  }, [postSlug]);

  const sanitizedContent = useMemo(() => {
    if (!post?.content) {
      return "";
    }

    return DOMPurify.sanitize(post.content, {
      USE_PROFILES: {
        html: true,
      },
    });
  }, [post?.content]);

  useEffect(() => {
    if (!post) {
      return;
    }

    const previousTitle = document.title;

    document.title =
      post.seo?.title ||
      `${post.title} | Blog ClicMenu`;

    let descriptionMeta =
      document.querySelector<HTMLMetaElement>(
        'meta[name="description"]'
      );

    const descriptionWasCreated =
      !descriptionMeta;

    const previousDescription =
      descriptionMeta?.getAttribute("content") ||
      null;

    if (!descriptionMeta) {
      descriptionMeta =
        document.createElement("meta");

      descriptionMeta.setAttribute(
        "name",
        "description"
      );

      document.head.appendChild(
        descriptionMeta
      );
    }

    descriptionMeta.setAttribute(
      "content",
      post.seo?.description ||
        post.excerpt ||
        ""
    );

    let robotsMeta =
      document.querySelector<HTMLMetaElement>(
        'meta[name="robots"]'
      );

    const robotsWasCreated = !robotsMeta;

    const previousRobots =
      robotsMeta?.getAttribute("content") ||
      null;

    if (!robotsMeta) {
      robotsMeta =
        document.createElement("meta");

      robotsMeta.setAttribute(
        "name",
        "robots"
      );

      document.head.appendChild(robotsMeta);
    }

    const robotsIndex =
      post.seo?.robots_index === false
        ? "noindex"
        : "index";

    const robotsFollow =
      post.seo?.robots_follow === false
        ? "nofollow"
        : "follow";

    robotsMeta.setAttribute(
      "content",
      `${robotsIndex}, ${robotsFollow}`
    );

    let canonicalLink =
      document.querySelector<HTMLLinkElement>(
        'link[rel="canonical"]'
      );

    const canonicalWasCreated =
      !canonicalLink;

    const previousCanonical =
      canonicalLink?.getAttribute("href") ||
      null;

    if (!canonicalLink) {
      canonicalLink =
        document.createElement("link");

      canonicalLink.setAttribute(
        "rel",
        "canonical"
      );

      document.head.appendChild(
        canonicalLink
      );
    }

    canonicalLink.setAttribute(
      "href",
      post.seo?.canonical_url ||
        post.url ||
        window.location.href
    );

    const structuredDataScript =
      document.createElement("script");

    structuredDataScript.type =
      "application/ld+json";

    structuredDataScript.setAttribute(
      "data-public-blog-structured-data",
      "true"
    );

    structuredDataScript.textContent =
      JSON.stringify(
        post.structured_data || {}
      );

    document.head.appendChild(
      structuredDataScript
    );

    return () => {
      document.title = previousTitle;

      structuredDataScript.remove();

      if (descriptionWasCreated) {
        descriptionMeta?.remove();
      } else if (previousDescription !== null) {
        descriptionMeta?.setAttribute(
          "content",
          previousDescription
        );
      }

      if (robotsWasCreated) {
        robotsMeta?.remove();
      } else if (previousRobots !== null) {
        robotsMeta?.setAttribute(
          "content",
          previousRobots
        );
      }

      if (canonicalWasCreated) {
        canonicalLink?.remove();
      } else if (previousCanonical !== null) {
        canonicalLink?.setAttribute(
          "href",
          previousCanonical
        );
      }
    };
  }, [post]);

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !post) {
    return (
      <Container
        maxWidth="md"
        sx={{ py: 5 }}
      >
        <Stack spacing={3}>
          <Alert severity="error">
            {error ||
              "La publicación no está disponible."}
          </Alert>

          <Button
            component={RouterLink}
            to="/blog"
            startIcon={<ArrowBackIcon />}
            sx={{ alignSelf: "flex-start" }}
          >
            Regresar al blog
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="md"
      sx={{
        py: {
          xs: 3,
          md: 6,
        },
      }}
    >
      <Stack spacing={3}>
        <Breadcrumbs>
          <Link
            component={RouterLink}
            to="/blog"
            underline="hover"
            color="inherit"
          >
            Blog
          </Link>

          {post.category && (
            <Link
              component={RouterLink}
              to={`/blog/categorias/${encodeURIComponent(
                post.category.slug
              )}`}
              underline="hover"
              color="inherit"
            >
              {post.category.name}
            </Link>
          )}

          <Typography
            color="text.primary"
            noWrap
            sx={{
              maxWidth: {
                xs: 180,
                sm: 360,
              },
            }}
          >
            {post.title}
          </Typography>
        </Breadcrumbs>

        <Box>
          {post.is_featured && (
            <Chip
              label="Publicación destacada"
              color="primary"
              size="small"
              sx={{ mb: 2 }}
            />
          )}

          <Typography
            component="h1"
            variant="h3"
            fontWeight={800}
            sx={{
              fontSize: {
                xs: "2rem",
                md: "3rem",
              },
              lineHeight: 1.15,
            }}
          >
            {post.title}
          </Typography>

          {post.excerpt && (
            <Typography
              variant="h6"
              color="text.secondary"
              fontWeight={400}
              sx={{
                mt: 2,
                lineHeight: 1.7,
              }}
            >
              {post.excerpt}
            </Typography>
          )}
        </Box>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={{
            xs: 1,
            sm: 3,
          }}
          color="text.secondary"
        >
          <Typography variant="body2">
            Autor:{" "}
            <strong>
              {post.author?.name ||
                "ClicMenu"}
            </strong>
          </Typography>

          <Typography variant="body2">
            Publicado:{" "}
            <strong>
              {formatDate(
                post.published_at
              )}
            </strong>
          </Typography>
        </Stack>

        {post.category && (
          <Box>
            <Chip
              component={RouterLink}
              to={`/blog/categorias/${encodeURIComponent(
                post.category.slug
              )}`}
              clickable
              label={post.category.name}
            />
          </Box>
        )}

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
              maxHeight: 480,
              objectFit: "cover",
              borderRadius: 3,
            }}
          />
        )}

        <Divider />

        <Box
          className="public-blog-content"
          dangerouslySetInnerHTML={{
            __html: sanitizedContent,
          }}
          sx={{
            fontSize: "1.05rem",
            lineHeight: 1.9,
            color: "text.primary",

            "& p": {
              mb: 2,
            },

            "& h2": {
              mt: 4,
              mb: 2,
              fontSize: {
                xs: "1.6rem",
                md: "2rem",
              },
              fontWeight: 700,
            },

            "& h3": {
              mt: 3,
              mb: 2,
              fontSize: {
                xs: "1.3rem",
                md: "1.6rem",
              },
              fontWeight: 700,
            },

            "& img": {
              maxWidth: "100%",
              height: "auto",
              borderRadius: 2,
            },

            "& a": {
              color: "primary.main",
              overflowWrap: "anywhere",
            },

            "& ul, & ol": {
              pl: 3,
              mb: 2,
            },

            "& blockquote": {
              m: 0,
              my: 3,
              pl: 2,
              borderLeft: 4,
              borderColor: "primary.main",
              color: "text.secondary",
            },

            "& pre": {
              overflowX: "auto",
              p: 2,
              borderRadius: 2,
              bgcolor: "action.hover",
            },
          }}
        />

        {post.tags.length > 0 && (
          <>
            <Divider />

            <Box>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ mb: 1.5 }}
              >
                Etiquetas
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
              >
                {post.tags.map((tag) => (
                  <Chip
                    key={tag.slug}
                    component={RouterLink}
                    to={`/blog/etiquetas/${encodeURIComponent(
                      tag.slug
                    )}`}
                    clickable
                    variant="outlined"
                    label={tag.name}
                  />
                ))}
              </Stack>
            </Box>
          </>
        )}

        <Divider />

        <Button
          component={RouterLink}
          to="/blog"
          startIcon={<ArrowBackIcon />}
          sx={{ alignSelf: "flex-start" }}
        >
          Regresar al blog
        </Button>
      </Stack>
    </Container>
  );
}