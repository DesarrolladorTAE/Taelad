import {
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";
import DOMPurify from "dompurify";

import {
  Alert,
  Badge,
  Container,
  Spinner,
} from "react-bootstrap";

import {
  Link,
  useParams,
} from "react-router-dom";

import Navbar1 from "../../../components/navbar/Navbar1";

type PublicBlogCover = {
  url: string;
  alt_text?: string | null;
  title?: string | null;
};

type PublicBlogCategory = {
  name: string;
  slug: string;
  url?: string | null;
};

type PublicBlogTag = {
  name: string;
  slug: string;
  url?: string | null;
};

type PublicBlogSeo = {
  title: string | null;
  description: string | null;
  keywords: string[];
  canonical_url: string | null;
  robots_index: boolean;
  robots_follow: boolean;
};

type PublicBlogOpenGraph = {
  title: string | null;
  description: string | null;
  image: string | null;
  url: string | null;
  type: string;
};

type PublicBlogPostDetailData = {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  url: string | null;
  cover: PublicBlogCover | null;
  category: PublicBlogCategory | null;
  tags: PublicBlogTag[];
  author: {
    name: string;
  } | null;
  is_featured: boolean;
  published_at: string | null;
  updated_at: string | null;
  seo: PublicBlogSeo;
  open_graph: PublicBlogOpenGraph;
  structured_data: Record<string, unknown>;
};

type ResourceResponse<T> = {
  data: T;
};

const API_BASE_URL = (
  process.env.REACT_APP_PUBLIC_API_URL ||
  "https://api.tecnologiasadministrativas.com/api"
).replace(/\/+$/, "");

function formatDate(
  value: string | null
): string {
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

function getSystemColor(
  systemSlug: string
): string {
  switch (systemSlug) {
    case "clic-menu":
      return "#E85D04";

    case "mi-tienda-en-linea-mx":
      return "#1577CE";

    case "tecnologias-administrativas-elad":
      return "#23388B";

    default:
      return "#1577CE";
  }
}

export default function BlogPostDetail() {
  const {
    systemSlug = "",
    blogSlug = "",
    postSlug = "",
  } = useParams<{
    systemSlug: string;
    blogSlug: string;
    postSlug: string;
  }>();

  const [post, setPost] =
    useState<PublicBlogPostDetailData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const primaryColor =
    getSystemColor(systemSlug);

  const endpoint = useMemo(() => {
    if (
      !systemSlug ||
      !blogSlug ||
      !postSlug
    ) {
      return "";
    }

    return `${API_BASE_URL}/public/v1/${encodeURIComponent(
      systemSlug
    )}/blogs/${encodeURIComponent(
      blogSlug
    )}/posts/${encodeURIComponent(
      postSlug
    )}`;
  }, [
    systemSlug,
    blogSlug,
    postSlug,
  ]);

  useEffect(() => {
    let active = true;

    async function loadPost() {
      if (!endpoint) {
        setError(
          "La dirección de la publicación no es válida."
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response =
          await axios.get<
            ResourceResponse<PublicBlogPostDetailData>
          >(endpoint, {
            timeout: 15000,
            headers: {
              Accept: "application/json",
            },
          });

        if (!active) {
          return;
        }

        setPost(response.data.data);
      } catch (requestError) {
        if (!active) {
          return;
        }

        console.error(
          "Error cargando publicación:",
          requestError
        );

        setPost(null);

        if (
          axios.isAxiosError(
            requestError
          ) &&
          requestError.response?.status ===
            404
        ) {
          setError(
            "La publicación no existe o no está disponible."
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
  }, [endpoint]);

  const sanitizedContent = useMemo(() => {
    if (!post?.content) {
      return "";
    }

    return DOMPurify.sanitize(
      post.content,
      {
        USE_PROFILES: {
          html: true,
        },
      }
    );
  }, [post?.content]);

  useEffect(() => {
    if (!post) {
      return;
    }

    const previousTitle =
      document.title;

    document.title =
      post.seo?.title ||
      `${post.title} | Blog`;

    const description =
      document.querySelector<HTMLMetaElement>(
        'meta[name="description"]'
      );

    const previousDescription =
      description?.content || "";

    if (description) {
      description.content =
        post.seo?.description ||
        post.excerpt ||
        "";
    }

    const structuredData =
      document.createElement("script");

    structuredData.type =
      "application/ld+json";

    structuredData.setAttribute(
      "data-blog-structured-data",
      "true"
    );

    structuredData.textContent =
      JSON.stringify(
        post.structured_data || {}
      );

    document.head.appendChild(
      structuredData
    );

    return () => {
      document.title = previousTitle;

      if (description) {
        description.content =
          previousDescription;
      }

      structuredData.remove();
    };
  }, [post]);

  return (
    <>
      <style>
        {`
          .blog-post-public-page {
            min-height: 100vh;
            background: #f6f8fb;
          }

          .blog-post-public-header {
            padding: 125px 0 65px;
            color: #ffffff;
          }

          .blog-post-public-back {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 25px;
            color: rgba(255,255,255,.9);
            font-weight: 700;
            text-decoration: none;
          }

          .blog-post-public-back:hover {
            color: #ffffff;
          }

          .blog-post-public-title {
            max-width: 900px;
            margin: 0;
            color: #ffffff;
            font-size: clamp(2.2rem, 5vw, 4rem);
            font-weight: 800;
            line-height: 1.1;
          }

          .blog-post-public-excerpt {
            max-width: 780px;
            margin-top: 20px;
            color: rgba(255,255,255,.9);
            font-size: 1.1rem;
            line-height: 1.75;
          }

          .blog-post-public-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            margin-top: 25px;
            color: rgba(255,255,255,.85);
          }

          .blog-post-public-main {
            padding: 55px 0 90px;
          }

          .blog-post-public-article {
            max-width: 920px;
            margin: 0 auto;
            overflow: hidden;
            border-radius: 24px;
            background: #ffffff;
            box-shadow:
              0 18px 55px
              rgba(22, 53, 85, 0.12);
          }

          .blog-post-public-cover {
            width: 100%;
            max-height: 500px;
            object-fit: cover;
          }

          .blog-post-public-body {
            padding: 42px;
          }

          .blog-post-public-content {
            color: #344054;
            font-size: 1.05rem;
            line-height: 1.9;
          }

          .blog-post-public-content p {
            margin-bottom: 1.4rem;
          }

          .blog-post-public-content h2 {
            margin-top: 2.4rem;
            margin-bottom: 1rem;
            color: #17243d;
            font-size: 2rem;
            font-weight: 800;
          }

          .blog-post-public-content h3 {
            margin-top: 2rem;
            margin-bottom: .9rem;
            color: #17243d;
            font-size: 1.55rem;
            font-weight: 800;
          }

          .blog-post-public-content img {
            display: block;
            max-width: 100%;
            height: auto;
            margin: 25px auto;
            border-radius: 15px;
          }

          .blog-post-public-content a {
            color: #1577ce;
            overflow-wrap: anywhere;
          }

          .blog-post-public-content blockquote {
            margin: 28px 0;
            padding: 18px 22px;
            border-left: 4px solid #1577ce;
            background: #f4f8ff;
          }

          .blog-post-public-content pre {
            overflow-x: auto;
            padding: 18px;
            border-radius: 12px;
            background: #17243d;
            color: #ffffff;
          }

          .blog-post-public-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 35px;
            padding-top: 28px;
            border-top: 1px solid #e4e9f0;
          }

          .blog-post-public-state {
            display: flex;
            min-height: 70vh;
            align-items: center;
            justify-content: center;
          }

          @media (max-width: 767.98px) {
            .blog-post-public-header {
              padding-top: 105px;
              padding-bottom: 50px;
            }

            .blog-post-public-main {
              padding-top: 35px;
              padding-bottom: 60px;
            }

            .blog-post-public-body {
              padding: 25px 20px;
            }

            .blog-post-public-content {
              font-size: 1rem;
            }
          }
        `}
      </style>

      <Navbar1 isLogoDark={false} />

      <main className="blog-post-public-page">
        {loading && (
          <div className="blog-post-public-state">
            <div className="text-center">
              <Spinner
                animation="border"
                variant="primary"
              />

              <p className="mt-3 text-muted">
                Cargando publicación...
              </p>
            </div>
          </div>
        )}

        {!loading && error && (
          <Container className="blog-post-public-state">
            <Alert
              variant="danger"
              className="w-100 text-center"
            >
              <Alert.Heading>
                Publicación no disponible
              </Alert.Heading>

              <p>{error}</p>

              <Link
  to={`/blogs/${encodeURIComponent(
    systemSlug
  )}/${encodeURIComponent(blogSlug)}`}
  className="btn btn-outline-danger"
>
  <i className="mdi mdi-arrow-left me-2" />
  Regresar al blog
</Link>
            </Alert>
          </Container>
        )}

        {!loading && !error && post && (
          <>
            <header
              className="blog-post-public-header"
              style={{
                background: `linear-gradient(
                  135deg,
                  ${primaryColor},
                  #102d4d
                )`,
              }}
            >
              <Container>
                <Link
                  to={`/blogs/${systemSlug}/${blogSlug}`}
                  className="blog-post-public-back"
                >
                  <i className="mdi mdi-arrow-left" />
                  Regresar al blog
                </Link>

                {post.is_featured && (
                  <div className="mb-3">
                    <Badge bg="warning">
                      Publicación destacada
                    </Badge>
                  </div>
                )}

                <h1 className="blog-post-public-title">
                  {post.title}
                </h1>

                {post.excerpt && (
                  <p className="blog-post-public-excerpt">
                    {post.excerpt}
                  </p>
                )}

                <div className="blog-post-public-meta">
                  <span>
                    <i className="mdi mdi-account-outline me-1" />
                    {post.author?.name ||
                      "Tecnologías Administrativas"}
                  </span>

                  <span>
                    <i className="mdi mdi-calendar-outline me-1" />
                    {formatDate(
                      post.published_at
                    )}
                  </span>

                  {post.category && (
                    <span>
                      <i className="mdi mdi-folder-outline me-1" />
                      {post.category.name}
                    </span>
                  )}
                </div>
              </Container>
            </header>

            <section className="blog-post-public-main">
              <Container>
                <article className="blog-post-public-article">
                  {post.cover?.url && (
                    <img
                      src={post.cover.url}
                      alt={
                        post.cover.alt_text ||
                        post.title
                      }
                      className="blog-post-public-cover"
                    />
                  )}

                  <div className="blog-post-public-body">
                    <div
                      className="blog-post-public-content"
                      dangerouslySetInnerHTML={{
                        __html:
                          sanitizedContent,
                      }}
                    />

                    {post.tags.length > 0 && (
                      <div className="blog-post-public-tags">
                        {post.tags.map(
                          (tag) => (
                            <Badge
                              key={tag.slug}
                              pill
                              style={{
                                backgroundColor:
                                  primaryColor,
                              }}
                            >
                              {tag.name}
                            </Badge>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </article>
              </Container>
            </section>
          </>
        )}
      </main>
    </>
  );
}