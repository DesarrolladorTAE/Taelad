import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Pagination,
  Row,
  Spinner,
} from "react-bootstrap";

import {
  Link,
  useParams,
} from "react-router-dom";

import Navbar1 from "../../../components/navbar/Navbar1";

/* =========================
   TIPOS
========================= */

type BlogBrand = {
  name?: string | null;
  slug?: string | null;
  public_url?: string | null;
  logo_url?: string | null;
  primary_color?: string | null;
};

type BlogSeo = {
  title?: string | null;
  description?: string | null;
  canonical_url?: string | null;
};

type PublicBlog = {
  name: string;
  slug: string;
  description: string | null;
  public_url?: string | null;
  canonical_url?: string | null;
  brand?: BlogBrand | null;
  seo?: BlogSeo | null;
};

type PublicBlogCategory = {
  name: string;
  slug: string;
  description?: string | null;
  url?: string | null;
  posts_count?: number;
};

type PublicBlogTag = {
  name: string;
  slug: string;
  url?: string | null;
  posts_count?: number;
};

type PublicBlogCover = {
  url: string;
  alt_text?: string | null;
  title?: string | null;
};

type PublicBlogPost = {
  title: string;
  slug: string;
  excerpt: string | null;
  url?: string | null;
  cover: PublicBlogCover | null;
  category: PublicBlogCategory | null;
  tags: PublicBlogTag[];
  author?: {
    name: string;
  } | null;
  is_featured: boolean;
  published_at: string | null;
  updated_at: string | null;
};

type ResourceResponse<T> = {
  data: T;
};

type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

type PaginatedPostsResponse = {
  data: PublicBlogPost[];
  meta: PaginationMeta;
};

/* =========================
   CONFIGURACIÓN
========================= */

const API_BASE_URL = (
  process.env.REACT_APP_PUBLIC_API_URL ||
  "https://api.tecnologiasadministrativas.com/api"
).replace(/\/+$/, "");

/* =========================
   UTILIDADES
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

function getPrimaryColor(
  systemSlug: string,
  blog: PublicBlog | null
): string {
  const configuredColor =
    blog?.brand?.primary_color?.trim();

  if (
    configuredColor &&
    /^#[0-9a-fA-F]{6}$/.test(configuredColor)
  ) {
    return configuredColor;
  }

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

/* =========================
   COMPONENTE
========================= */

export default function BlogDetail() {
  const {
    systemSlug = "",
    blogSlug = "",
  } = useParams<{
    systemSlug: string;
    blogSlug: string;
  }>();

  const [blog, setBlog] =
    useState<PublicBlog | null>(null);

  const [posts, setPosts] = useState<
    PublicBlogPost[]
  >([]);

  const [categories, setCategories] =
    useState<PublicBlogCategory[]>([]);

  const [tags, setTags] =
    useState<PublicBlogTag[]>([]);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] =
    useState(1);

  const [searchInput, setSearchInput] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [selectedTag, setSelectedTag] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const blogBaseEndpoint = useMemo(() => {
    if (!systemSlug || !blogSlug) {
      return "";
    }

    return `${API_BASE_URL}/public/v1/${encodeURIComponent(
      systemSlug
    )}/blogs/${encodeURIComponent(blogSlug)}`;
  }, [systemSlug, blogSlug]);

  const primaryColor = getPrimaryColor(
    systemSlug,
    blog
  );

  /* =========================
     CARGAR INFORMACIÓN GENERAL
  ========================= */

  useEffect(() => {
    let active = true;

    async function loadBlogInformation() {
      if (!blogBaseEndpoint) {
        setError(
          "La dirección del blog no es válida."
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [
          blogResponse,
          categoriesResponse,
          tagsResponse,
        ] = await Promise.all([
          axios.get<ResourceResponse<PublicBlog>>(
            blogBaseEndpoint,
            {
              headers: {
                Accept: "application/json",
              },
              timeout: 15000,
            }
          ),

          axios.get<
            ResourceResponse<PublicBlogCategory[]>
          >(`${blogBaseEndpoint}/categories`, {
            headers: {
              Accept: "application/json",
            },
            timeout: 15000,
          }),

          axios.get<
            ResourceResponse<PublicBlogTag[]>
          >(`${blogBaseEndpoint}/tags`, {
            headers: {
              Accept: "application/json",
            },
            timeout: 15000,
          }),
        ]);

        if (!active) {
          return;
        }

        setBlog(blogResponse.data.data);

        setCategories(
          Array.isArray(
            categoriesResponse.data.data
          )
            ? categoriesResponse.data.data
            : []
        );

        setTags(
          Array.isArray(tagsResponse.data.data)
            ? tagsResponse.data.data
            : []
        );
      } catch (requestError) {
        if (!active) {
          return;
        }

        console.error(
          "Error cargando información del blog:",
          requestError
        );

        if (
          axios.isAxiosError(requestError) &&
          requestError.response?.status === 404
        ) {
          setError(
            "El blog solicitado no existe o no está disponible."
          );
        } else {
          setError(
            "No fue posible cargar la información del blog."
          );
        }
      }
    }

    void loadBlogInformation();

    return () => {
      active = false;
    };
  }, [blogBaseEndpoint]);

  /* =========================
     CARGAR PUBLICACIONES
  ========================= */

  useEffect(() => {
    let active = true;

    async function loadPosts() {
      if (!blogBaseEndpoint) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response =
          await axios.get<PaginatedPostsResponse>(
            `${blogBaseEndpoint}/posts`,
            {
              params: {
                page,
                per_page: 9,
                search:
                  search || undefined,
                category:
                  selectedCategory ||
                  undefined,
                tag:
                  selectedTag || undefined,
                order: "latest",
              },
              headers: {
                Accept: "application/json",
              },
              timeout: 15000,
            }
          );

        if (!active) {
          return;
        }

        setPosts(
          Array.isArray(response.data.data)
            ? response.data.data
            : []
        );

        setLastPage(
          Math.max(
            response.data.meta?.last_page ||
              1,
            1
          )
        );
      } catch (requestError) {
        if (!active) {
          return;
        }

        console.error(
          "Error cargando publicaciones:",
          requestError
        );

        setPosts([]);
        setLastPage(1);

        if (
          axios.isAxiosError(requestError) &&
          requestError.response?.status === 404
        ) {
          setError(
            "No se encontró el blog solicitado."
          );
        } else {
          setError(
            "No fue posible cargar las publicaciones."
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
  }, [
    blogBaseEndpoint,
    page,
    search,
    selectedCategory,
    selectedTag,
  ]);

  /* =========================
     SEO
  ========================= */

  useEffect(() => {
    if (!blog) {
      return;
    }

    const previousTitle = document.title;

    document.title =
      blog.seo?.title ||
      `${blog.name} | Tecnologías Administrativas`;

    return () => {
      document.title = previousTitle;
    };
  }, [blog]);

  /* =========================
     EVENTOS
  ========================= */

  const handleSearch = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleCategoryChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    setPage(1);
    setSelectedCategory(
      event.currentTarget.value
    );
  };

  const handleTagChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    setPage(1);
    setSelectedTag(
      event.currentTarget.value
    );
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setSelectedCategory("");
    setSelectedTag("");
    setPage(1);
  };

  return (
    <>
      <style>
        {`
          .blog-detail-page {
            min-height: 100vh;
            background: #f7f9fc;
          }

          .blog-detail-hero {
            position: relative;
            overflow: hidden;
            padding-top: 145px;
            padding-bottom: 75px;
            color: #ffffff;
          }

          .blog-detail-hero::after {
            content: "";
            position: absolute;
            width: 380px;
            height: 380px;
            top: -200px;
            right: -80px;
            border: 55px solid rgba(255,255,255,.08);
            border-radius: 50%;
          }

          .blog-detail-hero-content {
            position: relative;
            z-index: 2;
          }

          .blog-detail-back {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 22px;
            color: rgba(255,255,255,.88);
            font-weight: 700;
            text-decoration: none;
          }

          .blog-detail-back:hover {
            color: #ffffff;
          }

          .blog-detail-title {
            max-width: 780px;
            margin: 0;
            font-size: clamp(2.2rem, 5vw, 4rem);
            font-weight: 800;
            line-height: 1.08;
          }

          .blog-detail-description {
            max-width: 720px;
            margin-top: 20px;
            margin-bottom: 0;
            color: rgba(255,255,255,.88);
            font-size: 1.08rem;
            line-height: 1.75;
          }

          .blog-detail-content {
            padding-top: 55px;
            padding-bottom: 90px;
          }

          .blog-filter-panel {
            margin-bottom: 34px;
            padding: 22px;
            border: 1px solid #e1e7ef;
            border-radius: 20px;
            background: #ffffff;
            box-shadow: 0 12px 35px rgba(19,54,88,.07);
          }

          .blog-post-card {
            height: 100%;
            overflow: hidden;
            border: 0;
            border-radius: 20px;
            background: #ffffff;
            box-shadow: 0 15px 40px rgba(23,55,88,.1);
            transition: transform .25s ease, box-shadow .25s ease;
          }

          .blog-post-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 22px 50px rgba(23,55,88,.16);
          }

          .blog-post-cover {
            display: flex;
            height: 215px;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            color: #ffffff;
          }

          .blog-post-cover img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .blog-post-cover i {
            font-size: 55px;
          }

          .blog-post-body {
            display: flex;
            min-height: 305px;
            flex-direction: column;
            padding: 24px;
          }

          .blog-post-title {
            margin-bottom: 12px;
            color: #17243d;
            font-size: 1.25rem;
            font-weight: 800;
            line-height: 1.35;
          }

          .blog-post-excerpt {
            display: -webkit-box;
            overflow: hidden;
            color: #6a7586;
            line-height: 1.65;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 3;
          }

          .blog-post-action {
            display: inline-flex;
            min-height: 44px;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-top: auto;
            border-radius: 13px;
            color: #ffffff;
            font-weight: 800;
            text-decoration: none;
          }

          .blog-post-action:hover {
            color: #ffffff;
            opacity: .92;
          }

          .blog-detail-state {
            display: flex;
            min-height: 300px;
            align-items: center;
            justify-content: center;
          }

          @media (max-width: 991.98px) {
            .blog-detail-hero {
              padding-top: 120px;
              padding-bottom: 60px;
            }
          }
        `}
      </style>

      <Navbar1 isLogoDark={false} />

      <main className="blog-detail-page">
        <section
          className="blog-detail-hero"
          style={{
            backgroundImage: `linear-gradient(
              135deg,
              ${primaryColor},
              #102d4d
            )`,
          }}
        >
          <Container className="blog-detail-hero-content">
            <Link
              to="/blogs"
              className="blog-detail-back"
            >
              <i className="mdi mdi-arrow-left" />
              Regresar a todos los blogs
            </Link>

            <h1 className="blog-detail-title">
              {blog?.name || "Blog"}
            </h1>

            <p className="blog-detail-description">
              {blog?.description ||
                "Consulta nuestras publicaciones, recomendaciones y contenido especializado."}
            </p>
          </Container>
        </section>

        <section className="blog-detail-content">
          <Container>
            <div className="blog-filter-panel">
              <Form onSubmit={handleSearch}>
                <Row className="g-3 align-items-end">
                  <Col lg={5}>
                    <Form.Label>
                      Buscar publicaciones
                    </Form.Label>

                    <Form.Control
                      type="search"
                      value={searchInput}
                      placeholder="Título o contenido..."
                      onChange={(event) => {
                        setSearchInput(
                          event.currentTarget.value
                        );
                      }}
                    />
                  </Col>

                  <Col md={6} lg={2}>
                    <Form.Label>
                      Categoría
                    </Form.Label>

                    <Form.Select
                      value={selectedCategory}
                      onChange={
                        handleCategoryChange
                      }
                    >
                      <option value="">
                        Todas
                      </option>

                      {categories.map(
                        (category) => (
                          <option
                            key={category.slug}
                            value={category.slug}
                          >
                            {category.name}
                          </option>
                        )
                      )}
                    </Form.Select>
                  </Col>

                  <Col md={6} lg={2}>
                    <Form.Label>
                      Etiqueta
                    </Form.Label>

                    <Form.Select
                      value={selectedTag}
                      onChange={handleTagChange}
                    >
                      <option value="">
                        Todas
                      </option>

                      {tags.map((tag) => (
                        <option
                          key={tag.slug}
                          value={tag.slug}
                        >
                          {tag.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>

                  <Col sm={6} lg={1}>
                    <Button
                      type="submit"
                      className="w-100"
                      style={{
                        backgroundColor:
                          primaryColor,
                        borderColor:
                          primaryColor,
                      }}
                    >
                      Buscar
                    </Button>
                  </Col>

                  <Col sm={6} lg={2}>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      className="w-100"
                      onClick={clearFilters}
                    >
                      Limpiar
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>

            {loading && (
              <div className="blog-detail-state">
                <div className="text-center">
                  <Spinner animation="border" />

                  <p className="mt-3 text-muted">
                    Cargando publicaciones...
                  </p>
                </div>
              </div>
            )}

            {!loading && error && (
              <Alert variant="danger">
                {error}
              </Alert>
            )}

            {!loading &&
              !error &&
              posts.length === 0 && (
                <Alert variant="info">
                  No se encontraron publicaciones
                  disponibles.
                </Alert>
              )}

            {!loading &&
              !error &&
              posts.length > 0 && (
                <>
                  <Row className="g-4">
                    {posts.map((post) => (
                      <Col
                        key={post.slug}
                        xs={12}
                        md={6}
                        xl={4}
                      >
                        <Card className="blog-post-card">
                          <div
                            className="blog-post-cover"
                            style={{
                              backgroundImage: `linear-gradient(
                                135deg,
                                ${primaryColor},
                                #102d4d
                              )`,
                            }}
                          >
                            {post.cover?.url ? (
                              <img
                                src={post.cover.url}
                                alt={
                                  post.cover
                                    .alt_text ||
                                  post.title
                                }
                              />
                            ) : (
                              <i className="mdi mdi-newspaper-variant-outline" />
                            )}
                          </div>

                          <Card.Body className="blog-post-body">
                            <div className="mb-3">
                              {post.category && (
                                <Badge
                                  className="me-2"
                                  style={{
                                    backgroundColor:
                                      primaryColor,
                                  }}
                                >
                                  {
                                    post.category
                                      .name
                                  }
                                </Badge>
                              )}

                              {post.is_featured && (
                                <Badge bg="warning">
                                  Destacada
                                </Badge>
                              )}
                            </div>

                            <h2 className="blog-post-title">
                              {post.title}
                            </h2>

                            <p className="blog-post-excerpt">
                              {post.excerpt ||
                                "Consulta el contenido completo de esta publicación."}
                            </p>

                            <small className="text-muted mb-4">
                              {formatDate(
                                post.published_at
                              )}
                            </small>

                            <Link
                              to={`/blogs/${encodeURIComponent(
                                systemSlug
                              )}/${encodeURIComponent(
                                blogSlug
                              )}/posts/${encodeURIComponent(
                                post.slug
                              )}`}
                              className="blog-post-action"
                              style={{
                                backgroundColor:
                                  primaryColor,
                              }}
                            >
                              Leer publicación
                              <i className="mdi mdi-arrow-right" />
                            </Link>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>

                  {lastPage > 1 && (
                    <div className="d-flex justify-content-center mt-5">
                      <Pagination>
                        <Pagination.Prev
                          disabled={page <= 1}
                          onClick={() => {
                            setPage(
                              Math.max(
                                page - 1,
                                1
                              )
                            );
                          }}
                        />

                        {Array.from(
                          {
                            length: lastPage,
                          },
                          (_, index) =>
                            index + 1
                        ).map(
                          (pageNumber) => (
                            <Pagination.Item
                              key={pageNumber}
                              active={
                                pageNumber === page
                              }
                              onClick={() => {
                                setPage(
                                  pageNumber
                                );
                              }}
                            >
                              {pageNumber}
                            </Pagination.Item>
                          )
                        )}

                        <Pagination.Next
                          disabled={
                            page >= lastPage
                          }
                          onClick={() => {
                            setPage(
                              Math.min(
                                page + 1,
                                lastPage
                              )
                            );
                          }}
                        />
                      </Pagination>
                    </div>
                  )}
                </>
              )}
          </Container>
        </section>
      </main>
    </>
  );
}