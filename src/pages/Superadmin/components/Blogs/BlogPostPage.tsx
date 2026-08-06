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

/**
 * Convierte las referencias de imagen creadas por el editor
 * en imágenes visibles para la página pública.
 */
function renderBlogImageReferences(
  html: string
): string {
  if (
    !html ||
    typeof window === "undefined" ||
    typeof DOMParser === "undefined"
  ) {
    return html;
  }

  const parser = new DOMParser();

  const documentFragment = parser.parseFromString(
    `<div id="blog-content-root">${html}</div>`,
    "text/html"
  );

  const root = documentFragment.getElementById(
    "blog-content-root"
  );

  if (!root) {
    return html;
  }

  root
    .querySelectorAll<HTMLElement>(
      "figure[data-blog-image-reference]"
    )
    .forEach((figure) => {
      const link =
        figure.querySelector<HTMLAnchorElement>(
          "a[href]"
        );

      const source = (
        figure.getAttribute("data-image-src") ||
        link?.getAttribute("href") ||
        ""
      ).trim();

      if (!source) {
        return;
      }

      const image =
        documentFragment.createElement("img");

      image.setAttribute("src", source);
      image.setAttribute("loading", "lazy");
      image.setAttribute("decoding", "async");

      const alt = (
        figure.getAttribute("data-image-alt") ||
        ""
      ).trim();

      image.setAttribute(
        "alt",
        alt || "Imagen de la publicación"
      );

      const title = (
        figure.getAttribute("data-image-title") ||
        ""
      ).trim();

      if (title) {
        image.setAttribute("title", title);
      }

      const publicFigure =
        documentFragment.createElement("figure");

      publicFigure.className =
        "public-blog-image";

      publicFigure.appendChild(image);

      const currentCaption =
        figure.querySelector("figcaption");

      const captionText =
        currentCaption?.textContent?.trim() || "";

      if (captionText) {
        const caption =
          documentFragment.createElement(
            "figcaption"
          );

        caption.textContent = captionText;

        publicFigure.appendChild(caption);
      }

      figure.replaceWith(publicFigure);
    });

  return root.innerHTML;
}

/**
 * Sanitiza el HTML público y conserva los atributos de formato
 * que previamente fueron filtrados por el backend.
 */
function sanitizePublicBlogContent(
  html: string
): string {
  const normalizedHtml =
    renderBlogImageReferences(html);

  return DOMPurify.sanitize(normalizedHtml, {
    USE_PROFILES: {
      html: true,
    },

    ADD_TAGS: ["mark"],

    ADD_ATTR: [
      "style",
      "class",
      "target",
      "rel",
      "loading",
      "decoding",
      "data-blog-image-reference",
      "data-image-src",
      "data-image-alt",
      "data-image-title",
      "data-image-reference-link",
    ],

    ALLOW_DATA_ATTR: true,

    FORBID_TAGS: [
      "script",
      "style",
      "iframe",
      "object",
      "embed",
      "form",
      "input",
      "button",
      "textarea",
      "select",
      "option",
    ],

    KEEP_CONTENT: true,
  });
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

    void loadPost();

    return () => {
      active = false;
    };
  }, [postSlug]);

  const sanitizedContent = useMemo(() => {
    if (!post?.content) {
      return "";
    }

    return sanitizePublicBlogContent(
      post.content
    );
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

          {/*
           * Este título proviene del campo title de la publicación.
           * No pertenece al contenido del editor enriquecido.
           */}
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
            loading="eager"
            decoding="async"
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
            width: "100%",
            minWidth: 0,

            /*
             * Valores predeterminados. Los estilos inline
             * provenientes del editor tienen prioridad.
             */
            fontSize: "1.05rem",
            lineHeight: 1.9,
            color: "text.primary",

            overflowWrap: "anywhere",
            wordBreak: "normal",

            "& p": {
              mb: 2,
            },

            /*
             * Solo se controlan márgenes. No se fuerza
             * tamaño, fuente, color, alineación ni interlineado.
             */
            "& h1, & h2, & h3, & h4, & h5, & h6": {
              mt: 4,
              mb: 2,
            },

            "& span, & mark": {
              maxWidth: "100%",
            },

            "& mark": {
              padding: 0,
            },

            "& img": {
              display: "block",
              maxWidth: "100%",
              height: "auto",
              mx: "auto",
              borderRadius: 2,
            },

            "& figure": {
              width: "100%",
              maxWidth: "100%",
              m: 0,
              my: 3,
            },

            "& figure.public-blog-image": {
              textAlign: "center",
            },

            "& figure.public-blog-image figcaption": {
              mt: 1,
              color: "text.secondary",
              fontSize: "0.9rem",
              lineHeight: 1.55,
              textAlign: "center",
            },

            "& a": {
              color: "primary.main",
              overflowWrap: "anywhere",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
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

            "& hr": {
              my: 3,
              border: 0,
              borderTop: "1px solid",
              borderColor: "divider",
            },

            "& table": {
              width: "100%",
              borderCollapse: "collapse",
              display: "block",
              overflowX: "auto",
            },

            "& th, & td": {
              p: 1,
              border: "1px solid",
              borderColor: "divider",
              textAlign: "left",
            },

            "& pre": {
              maxWidth: "100%",
              overflowX: "auto",
              p: 2,
              borderRadius: 2,
              bgcolor: "action.hover",
            },

            "& code": {
              fontFamily:
                '"Courier New", monospace',
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
