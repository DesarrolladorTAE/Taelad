import {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  Alert,
  Col,
  Container,
  Row,
  Spinner,
} from "react-bootstrap";

import { Link } from "react-router-dom";

import { Navbar1 } from "../../../components/navbar";
import TaeFooter from "../../../components/TaeFooter";
import BackToTop from "../../../components/BackToTop";

type PublicPostCover = {
  url: string;
  alt_text: string | null;
  width: number | null;
  height: number | null;
};

type PublicPostCategory = {
  name: string;
  slug: string;
  url: string | null;
};

type PublicPostTag = {
  name: string;
  slug: string;
  url?: string | null;
};

type PublicPostAuthor = {
  name: string;
};

type PublicBlogPost = {
  title: string;
  slug: string;
  excerpt: string | null;
  url: string | null;
  cover: PublicPostCover | null;
  category: PublicPostCategory | null;
  tags: PublicPostTag[];
  author: PublicPostAuthor | null;
  is_featured: boolean;
  published_at: string | null;
  updated_at: string | null;
};

type PublicPostsResponse = {
  data: PublicBlogPost[];
};

const SYSTEM_SLUG =
  "tecnologias-administrativas-elad";

const BLOG_SLUG =
  "blog-tecnologias-administrativas-elad";

const API_BASE_URL = (
  process.env.REACT_APP_PUBLIC_API_URL ||
  "https://api.tecnologiasadministrativas.com/api"
).replace(/\/+$/, "");

const POSTS_ENDPOINT =
  `${API_BASE_URL}/public/v1/${SYSTEM_SLUG}/blogs/${BLOG_SLUG}/posts`;

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
    month: "long",
    day: "2-digit",
  }).format(date);
}

function getPostRoute(post: PublicBlogPost): string {
  return `/blogs/${SYSTEM_SLUG}/${BLOG_SLUG}/posts/${encodeURIComponent(
    post.slug
  )}`;
}

export default function Blogs() {
  const [posts, setPosts] =
    useState<PublicBlogPost[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [reloadToken, setReloadToken] =
    useState(0);

  const [darkMode, setDarkMode] =
    useState<boolean>(() => {
      if (typeof window === "undefined") {
        return false;
      }

      return (
        localStorage.getItem("theme") === "dark"
      );
    });

  useEffect(() => {
    const previousTitle = document.title;

    document.title =
      "Blog | Tecnologías Administrativas ELAD";

    return () => {
      document.title = previousTitle;
    };
  }, []);

  useEffect(() => {
    const syncTheme = () => {
      setDarkMode(
        localStorage.getItem("theme") === "dark"
      );
    };

    window.addEventListener(
      "storage",
      syncTheme
    );

    const interval = window.setInterval(
      syncTheme,
      300
    );

    return () => {
      window.removeEventListener(
        "storage",
        syncTheme
      );

      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadPosts() {
      try {
        setLoading(true);
        setError(null);

        const response =
          await axios.get<PublicPostsResponse>(
            POSTS_ENDPOINT,
            {
              params: {
                per_page: 3,
                order: "latest",
              },
              timeout: 15000,
              headers: {
                Accept: "application/json",
              },
            }
          );

        if (!active) {
          return;
        }

        setPosts(
          Array.isArray(response.data?.data)
            ? response.data.data
            : []
        );
      } catch (requestError) {
        if (!active) {
          return;
        }

        console.error(
          "Error consultando publicaciones:",
          requestError
        );

        setPosts([]);

        if (
          axios.isAxiosError(requestError) &&
          requestError.code === "ECONNABORTED"
        ) {
          setError(
            "La consulta tardó demasiado. Intenta nuevamente."
          );
        } else {
          setError(
            "No fue posible consultar las publicaciones."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadPosts();

    return () => {
      active = false;
    };
  }, [reloadToken]);

  return (
    <>
      <style>
        {`
          .elad-blog-page {
            --blog-bg: #f7f9fc;
            --blog-title: #17243d;
            --blog-text: #657184;
            --blog-muted: #8691a2;
            --blog-border: #dce3ec;
            --blog-link: #1577ce;

            min-height: 100vh;
            color: var(--blog-title);
            background: var(--blog-bg);
            transition:
              background-color 0.25s ease,
              color 0.25s ease;
          }

          .elad-blog-page.blog-dark {
            --blog-bg: #0b1119;
            --blog-title: #f3f6fa;
            --blog-text: #b1bbc8;
            --blog-muted: #8793a3;
            --blog-border: #2a3645;
            --blog-link: #62b3f4;
          }

          .elad-blog-hero {
            padding: 145px 0 76px;
            border-bottom: 1px solid
              rgba(255, 255, 255, 0.14);
            color: #ffffff;
            background:
              linear-gradient(
                135deg,
                #23388b 0%,
                #1577ce 64%,
                #168bd2 100%
              );
          }

          .blog-dark .elad-blog-hero {
            background:
              linear-gradient(
                135deg,
                #111d4f 0%,
                #123e74 64%,
                #0e5c8f 100%
              );
          }

          .elad-blog-kicker {
            margin-bottom: 14px;
            color:
              rgba(255, 255, 255, 0.82);
            font-size: 0.78rem;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .elad-blog-hero h1 {
            max-width: 850px;
            margin: 0;
            color: #ffffff;
            font-size: clamp(
              2.35rem,
              5vw,
              4.4rem
            );
            font-weight: 800;
            line-height: 1.05;
            letter-spacing: -0.035em;
          }

          .elad-blog-hero p {
            max-width: 760px;
            margin: 24px 0 0;
            color:
              rgba(255, 255, 255, 0.9);
            font-size: 1.05rem;
            line-height: 1.8;
          }

          .elad-blog-content {
            padding: 70px 0 95px;
          }

          .elad-blog-intro {
            max-width: 760px;
            margin-bottom: 52px;
          }

          .elad-blog-intro h2 {
            margin-bottom: 12px;
            color: var(--blog-title);
            font-size: clamp(
              1.8rem,
              3vw,
              2.5rem
            );
            font-weight: 800;
          }

          .elad-blog-intro p {
            margin: 0;
            color: var(--blog-text);
            line-height: 1.75;
          }

          .elad-blog-post {
            padding: 0 0 48px;
            margin-bottom: 48px;
            border-bottom: 1px solid
              var(--blog-border);
          }

          .elad-blog-post:last-child {
            margin-bottom: 0;
          }

          .elad-blog-image-link {
            display: block;
            overflow: hidden;
            border-radius: 18px;
          }

          .elad-blog-image {
            display: block;
            width: 100%;
            aspect-ratio: 1 / 1;
            object-fit: cover;
            transition:
              transform 0.28s ease;
          }

          .elad-blog-image-link:hover
          .elad-blog-image {
            transform: scale(1.025);
          }

          .elad-blog-image-empty {
            display: flex;
            width: 100%;
            aspect-ratio: 1 / 1;
            align-items: center;
            justify-content: center;
            border: 1px dashed
              var(--blog-border);
            border-radius: 18px;
            color: var(--blog-muted);
          }

          .elad-blog-meta {
            display: flex;
            align-items: center;
            gap: 9px;
            margin-bottom: 15px;
            color: var(--blog-muted);
            font-size: 0.82rem;
            font-weight: 700;
          }

          .elad-blog-meta-separator {
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background: currentColor;
          }

          .elad-blog-post-title {
            margin-bottom: 16px;
            color: var(--blog-title);
            font-size: clamp(
              1.65rem,
              3vw,
              2.45rem
            );
            font-weight: 800;
            line-height: 1.18;
            letter-spacing: -0.02em;
          }

          .elad-blog-post-title a {
            color: inherit;
            text-decoration: none;
          }

          .elad-blog-post-title a:hover {
            color: var(--blog-link);
          }

          .elad-blog-excerpt {
            margin-bottom: 22px;
            color: var(--blog-text);
            font-size: 1rem;
            line-height: 1.8;
          }

          .elad-blog-read-more {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: var(--blog-link);
            font-size: 0.93rem;
            font-weight: 800;
            text-decoration: none;
          }

          .elad-blog-read-more:hover {
            color: var(--blog-link);
            text-decoration: underline;
          }

          .elad-blog-loading,
          .elad-blog-empty {
            min-height: 260px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--blog-text);
            text-align: center;
          }

          .elad-blog-error {
            border-radius: 14px;
            text-align: center;
          }

          @media (max-width: 991.98px) {
            .elad-blog-hero {
              padding-top: 120px;
              padding-bottom: 62px;
            }

            .elad-blog-content {
              padding-top: 55px;
              padding-bottom: 70px;
            }

            .elad-blog-post {
              padding-bottom: 38px;
              margin-bottom: 38px;
            }

            .elad-blog-post-copy {
              margin-top: 26px;
            }
          }

          @media (max-width: 575.98px) {
            .elad-blog-hero {
              padding-top: 105px;
              padding-bottom: 48px;
            }

            .elad-blog-hero h1 {
              font-size: 2.25rem;
            }

            .elad-blog-hero p {
              font-size: 0.98rem;
              line-height: 1.7;
            }

            .elad-blog-content {
              padding-top: 44px;
            }

            .elad-blog-intro {
              margin-bottom: 38px;
            }

            .elad-blog-image-link,
            .elad-blog-image-empty {
              border-radius: 14px;
            }

            .elad-blog-post-title {
              font-size: 1.65rem;
            }
          }
        `}
      </style>

      <Navbar1
        classname="navbar-light"
        isLogoDark={false}
      />

      <main
        className={[
          "elad-blog-page",
          darkMode
            ? "blog-dark"
            : "blog-light",
        ].join(" ")}
      >
        <section className="elad-blog-hero">
          <Container>
            <div className="elad-blog-kicker">
              Tecnologías Administrativas ELAD
            </div>

            <h1>
              Información para mejorar la administración
              y digitalización de tu empresa
            </h1>

            <p>
              Publicaciones sobre tecnología empresarial,
              automatización, productividad y mejores
              prácticas administrativas.
            </p>
          </Container>
        </section>

        <section className="elad-blog-content">
          <Container>
            <div className="elad-blog-intro">
              <h2>Publicaciones recientes</h2>

              <p>
                Consulta contenido preparado para ayudar a
                las empresas a optimizar sus procesos,
                adoptar herramientas digitales y tomar
                mejores decisiones.
              </p>
            </div>

            {loading && (
              <div className="elad-blog-loading">
                <div>
                  <Spinner
                    animation="border"
                    variant="primary"
                  />

                  <p className="mt-3 mb-0">
                    Cargando publicaciones...
                  </p>
                </div>
              </div>
            )}

            {!loading && error && (
              <Alert
                variant="warning"
                className="elad-blog-error"
              >
                <Alert.Heading>
                  No se pudieron cargar las publicaciones
                </Alert.Heading>

                <p className="mb-3">
                  {error}
                </p>

                <button
                  type="button"
                  className="btn btn-outline-warning"
                  onClick={() => {
                    setReloadToken(
                      (current) => current + 1
                    );
                  }}
                >
                  Intentar nuevamente
                </button>
              </Alert>
            )}

            {!loading &&
              !error &&
              posts.length === 0 && (
                <div className="elad-blog-empty">
                  No hay publicaciones disponibles.
                </div>
              )}

            {!loading &&
              !error &&
              posts.map((post) => (
                <article
                  key={post.slug}
                  className="elad-blog-post"
                >
                  <Row className="align-items-center">
                    <Col
                      xs={12}
                      lg={5}
                    >
                      {post.cover?.url ? (
                        <Link
                          to={getPostRoute(post)}
                          className="elad-blog-image-link"
                          aria-label={`Leer ${post.title}`}
                        >
                          <img
                            src={post.cover.url}
                            alt={
                              post.cover.alt_text ||
                              post.title
                            }
                            className="elad-blog-image"
                            loading="lazy"
                            decoding="async"
                          />
                        </Link>
                      ) : (
                        <div className="elad-blog-image-empty">
                          Sin imagen de portada
                        </div>
                      )}
                    </Col>

                    <Col
                      xs={12}
                      lg={7}
                    >
                      <div className="elad-blog-post-copy">
                        <div className="elad-blog-meta">
                          <span>
                            {post.category?.name ||
                              "General"}
                          </span>

                          <span className="elad-blog-meta-separator" />

                          <span>
                            {formatDate(
                              post.published_at
                            )}
                          </span>
                        </div>

                        <h2 className="elad-blog-post-title">
                          <Link
                            to={getPostRoute(post)}
                          >
                            {post.title}
                          </Link>
                        </h2>

                        <p className="elad-blog-excerpt">
                          {post.excerpt ||
                            "Consulta la publicación completa."}
                        </p>

                        <Link
                          to={getPostRoute(post)}
                          className="elad-blog-read-more"
                        >
                          Leer publicación

                          <i className="mdi mdi-arrow-right" />
                        </Link>
                      </div>
                    </Col>
                  </Row>
                </article>
              ))}
          </Container>
        </section>
      </main>

      <TaeFooter />

      <BackToTop />
    </>
  );
}