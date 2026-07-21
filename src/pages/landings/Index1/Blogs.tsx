import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import axios from "axios";
import { Helmet } from "react-helmet-async";

import {
  Alert,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";

import { Link } from "react-router-dom";

import { Navbar1 } from "../../../components/navbar";
import TaeFooter from "../../../components/TaeFooter";
import BackToTop from "../../../components/BackToTop";

import blogPrincipal from "../../../assets/images/blog-principal-transparente.png";

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

const PUBLIC_SITE_URL =
  "https://tecnologiasadministrativas.com";

const BLOG_CANONICAL_URL =
  `${PUBLIC_SITE_URL}/blogs`;

const BLOG_SEO_TITLE =
  "Blog | Tecnologías Administrativas ELAD";

const BLOG_SEO_DESCRIPTION =
  "Publicaciones sobre tecnología empresarial, inteligencia artificial, automatización, productividad, administración y transformación digital.";

const BLOG_SEO_KEYWORDS = [
  "tecnología empresarial",
  "inteligencia artificial",
  "automatización",
  "productividad",
  "administración empresarial",
  "transformación digital",
  "software empresarial",
];

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
  return `/blogs/${encodeURIComponent(
    post.slug
  )}`;
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}


function toAbsoluteUrl(
  value: string
): string {
  try {
    return new URL(
      value,
      PUBLIC_SITE_URL
    ).toString();
  } catch {
    return value;
  }
}

function serializeStructuredData(
  value: Record<string, unknown>
): string {
  return JSON.stringify(
    value
  ).replace(
    /</g,
    "\\u003c"
  );
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

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const searchInputRef =
    useRef<HTMLInputElement | null>(null);

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
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, []);

  useEffect(() => {
    const syncTheme = () => {
      setDarkMode(
        localStorage.getItem("theme") === "dark"
      );
    };

    window.addEventListener("storage", syncTheme);

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
    if (!searchOpen) {
      return;
    }

    const timeout = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 180);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchOpen]);

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
                per_page: 12,
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

        setPosts([]);

        if (axios.isAxiosError(requestError)) {
          console.error(
            "Error consultando publicaciones:",
            {
              status: requestError.response?.status,
              data: requestError.response?.data,
              url: requestError.config?.url,
              params: requestError.config?.params,
            }
          );

          if (requestError.code === "ECONNABORTED") {
            setError(
              "La consulta tardó demasiado. Intenta nuevamente."
            );
          } else if (
            requestError.response?.status === 422
          ) {
            const apiMessage =
              typeof requestError.response?.data ===
                "object" &&
              requestError.response?.data !== null &&
              "message" in requestError.response.data
                ? String(
                    (
                      requestError.response.data as {
                        message?: unknown;
                      }
                    ).message ??
                      "La API rechazó los parámetros de consulta."
                  )
                : "La API rechazó los parámetros de consulta.";

            setError(apiMessage);
          } else if (
            requestError.response?.status === 404
          ) {
            setError(
              "No se encontró el blog público solicitado."
            );
          } else {
            setError(
              "No fue posible consultar las publicaciones."
            );
          }
        } else {
          console.error(
            "Error consultando publicaciones:",
            requestError
          );

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

  const filteredPosts = useMemo(() => {
    const normalizedSearch = normalizeText(search);

    if (!normalizedSearch) {
      return posts;
    }

    return posts.filter((post) => {
      const searchableText = normalizeText(
        [
          post.title,
          post.excerpt ?? "",
          post.category?.name ?? "",
          post.author?.name ?? "",
          ...(post.tags ?? []).map(
            (tag) => tag.name
          ),
        ].join(" ")
      );

      return searchableText.includes(
        normalizedSearch
      );
    });
  }, [posts, search]);

  const blogImageUrl = useMemo(
    () =>
      toAbsoluteUrl(
        blogPrincipal
      ),
    []
  );

  const structuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Blog",
      name:
        "Blog de Tecnologías Administrativas ELAD",
      description:
        BLOG_SEO_DESCRIPTION,
      url:
        BLOG_CANONICAL_URL,
      inLanguage:
        "es-MX",
      publisher: {
        "@type":
          "Organization",
        name:
          "Tecnologías Administrativas ELAD",
        url:
          PUBLIC_SITE_URL,
      },
      image:
        blogImageUrl,
      blogPost: posts.map(
        (post) => ({
          "@type":
            "BlogPosting",
          headline:
            post.title,
          description:
            post.excerpt ||
            undefined,
          url:
            `${PUBLIC_SITE_URL}${getPostRoute(
              post
            )}`,
          datePublished:
            post.published_at ||
            undefined,
          dateModified:
            post.updated_at ||
            post.published_at ||
            undefined,
          image:
            post.cover?.url ||
            undefined,
          author: {
            "@type":
              "Person",
            name:
              post.author?.name ||
              "Tecnologías Administrativas",
          },
        })
      ),
    }),
    [
      blogImageUrl,
      posts,
    ]
  );

  const serializedStructuredData =
    useMemo(
      () =>
        serializeStructuredData(
          structuredData
        ),
      [structuredData]
    );

  function toggleSearch() {
    setSearchOpen((current) => {
      const next = !current;

      if (!next) {
        setSearch("");
      }

      return next;
    });
  }

  function clearSearch() {
    setSearch("");
    searchInputRef.current?.focus();
  }

  return (
    <>
      <Helmet>
        <html lang="es-MX" />

        <title>
          {BLOG_SEO_TITLE}
        </title>

        <meta
          name="description"
          content={
            BLOG_SEO_DESCRIPTION
          }
        />

        <meta
          name="keywords"
          content={
            BLOG_SEO_KEYWORDS.join(
              ", "
            )
          }
        />

        <meta
          name="robots"
          content="index, follow"
        />

        <link
          rel="canonical"
          href={
            BLOG_CANONICAL_URL
          }
        />

        <meta
          property="og:locale"
          content="es_MX"
        />

        <meta
          property="og:type"
          content="website"
        />

        <meta
          property="og:site_name"
          content="Tecnologías Administrativas ELAD"
        />

        <meta
          property="og:title"
          content={
            BLOG_SEO_TITLE
          }
        />

        <meta
          property="og:description"
          content={
            BLOG_SEO_DESCRIPTION
          }
        />

        <meta
          property="og:url"
          content={
            BLOG_CANONICAL_URL
          }
        />

        <meta
          property="og:image"
          content={
            blogImageUrl
          }
        />

        <meta
          property="og:image:alt"
          content="Blog de Tecnologías Administrativas ELAD"
        />

        <meta
          name="twitter:card"
          content="summary_large_image"
        />

        <meta
          name="twitter:title"
          content={
            BLOG_SEO_TITLE
          }
        />

        <meta
          name="twitter:description"
          content={
            BLOG_SEO_DESCRIPTION
          }
        />

        <meta
          name="twitter:image"
          content={
            blogImageUrl
          }
        />

        <meta
          name="twitter:image:alt"
          content="Blog de Tecnologías Administrativas ELAD"
        />

        <script
          type="application/ld+json"
        >
          {
            serializedStructuredData
          }
        </script>
      </Helmet>

      <style>
        {`
          .elad-blog-page {
            --blog-bg: #f4f7fb;
            --blog-surface: #ffffff;
            --blog-title: #17243d;
            --blog-text: #657184;
            --blog-muted: #8691a2;
            --blog-border: #dce3ec;
            --blog-primary: #2463eb;
            --blog-primary-dark: #1746b5;
            --blog-shadow: 0 14px 36px rgba(32, 61, 95, 0.1);

            min-height: 100vh;
            color: var(--blog-title);
            background: var(--blog-bg);
            transition: background-color 0.25s ease, color 0.25s ease;
          }

          .elad-blog-page.blog-dark {
            --blog-bg: #0b1119;
            --blog-surface: #151e29;
            --blog-title: #f3f6fa;
            --blog-text: #b1bbc8;
            --blog-muted: #8793a3;
            --blog-border: #2a3645;
            --blog-primary: #62a7ff;
            --blog-primary-dark: #3987ed;
            --blog-shadow: 0 18px 42px rgba(0, 0, 0, 0.34);
          }

          .elad-blog-shell {
            width: 100%;
            max-width: 1800px;
            margin-right: auto;
            margin-left: auto;
            padding-right: clamp(16px, 3vw, 56px);
            padding-left: clamp(16px, 3vw, 56px);
          }

          .elad-blog-hero {
            position: relative;
            display: flex;
            min-height: 620px;
            align-items: center;
            overflow: hidden;
            padding: 125px 0 55px;
            border-bottom: 1px solid
              rgba(255, 255, 255, 0.14);
            color: #ffffff;
            background:
              linear-gradient(
                115deg,
                #23388b 0%,
                #1f5fb0 42%,
                #1577ce 72%,
                #1a9cdb 100%
              );
            background-position: center;
            background-size: cover;
          }

          .elad-blog-content {
            width: 100%;
            padding: 64px 0 90px;
          }

          .elad-blog-toolbar {
            display: flex;
            width: 100%;
            align-items: center;
            justify-content: flex-start;
            margin-bottom: 28px;
          }

          .elad-blog-grid {
            --bs-gutter-x: 2rem;
            --bs-gutter-y: 2rem;
          }

          .elad-blog-hero::before {
            content: "";
            position: absolute;
            top: -150px;
            right: -130px;
            width: 520px;
            height: 520px;
            border: 70px solid
              rgba(255, 255, 255, 0.045);
            border-radius: 50%;
          }

          .elad-blog-hero::after {
            content: "";
            position: absolute;
            right: -70px;
            bottom: -190px;
            width: 620px;
            height: 310px;
            border-radius: 50%;
            background:
              rgba(255, 255, 255, 0.055);
            transform: rotate(-10deg);
          }

          .blog-dark .elad-blog-hero {
            background:
              linear-gradient(
                115deg,
                #101a45 0%,
                #123761 42%,
                #0f5788 72%,
                #0d6fa2 100%
              );
          }

          .elad-blog-hero-row {
            position: relative;
            z-index: 2;
            width: 100%;
            min-height: 470px;
          }

          .elad-blog-hero-copy {
            position: relative;
            z-index: 3;
            width: 100%;
            max-width: 720px;
            padding: 30px 0;
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
            width: 100%;
            max-width: 720px;
            margin: 0;
            color: #ffffff;
            font-size: clamp(
              2.75rem,
              4.4vw,
              4.35rem
            );
            font-weight: 800;
            line-height: 1.04;
            letter-spacing: -0.04em;
          }

          .elad-blog-hero p {
            max-width: 650px;
            margin: 22px 0 0;
            color:
              rgba(255, 255, 255, 0.92);
            font-size: 1.05rem;
            line-height: 1.8;
          }
          .elad-blog-hero-image-wrapper {
  position: relative;
  z-index: 3;
  display: flex;
  width: 100%;
  min-width: 0;
  min-height: 500px;
  align-items: center;
  justify-content: center;
  overflow: visible;
  padding: 10px 0 10px 10px;
}

.elad-blog-hero-image {
  display: block;
  flex-shrink: 0;

  /*
   * 125% permite que sobrepase ligeramente
   * el ancho de su columna.
   */
  width: 125%;
  max-width: 740px;
  height: auto;
  max-height: 500px;

  object-fit: contain;
  object-position: center;

  filter:
    drop-shadow(
      0 24px 30px
      rgba(6, 24, 61, 0.34)
    );

  user-select: none;
  pointer-events: none;
}

          .elad-blog-search-toggle {
            display: inline-flex;
            width: 48px;
            height: 48px;
            align-items: center;
            justify-content: center;
            padding: 0;
            border: 1px solid var(--blog-border);
            border-radius: 14px;
            color: var(--blog-title);
            background: var(--blog-surface);
            box-shadow: 0 8px 22px rgba(24, 57, 91, 0.08);
            transition: color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
          }

          .elad-blog-search-toggle:hover,
          .elad-blog-search-toggle:focus {
            color: var(--blog-primary);
            border-color: var(--blog-primary);
            transform: translateY(-1px);
          }

          .elad-blog-search-toggle i {
            font-size: 1.35rem;
          }

          .elad-blog-search-panel {
            width: 0;
            max-width: 0;
            overflow: hidden;
            opacity: 0;
            transform: translateX(-12px);
            transition:
              width 0.3s ease,
              max-width 0.3s ease,
              margin-left 0.3s ease,
              opacity 0.22s ease,
              transform 0.3s ease;
          }

          .elad-blog-search-panel.open {
            width: min(540px, calc(100% - 60px));
            max-width: 540px;
            margin-left: 12px;
            opacity: 1;
            transform: translateX(0);
          }

          .elad-blog-search-field {
            position: relative;
            width: 100%;
          }

          .elad-blog-search-input {
            width: 100%;
            min-width: 0;
            height: 48px;
            padding-right: 48px;
            border: 1px solid var(--blog-border);
            border-radius: 14px;
            color: var(--blog-title);
            background: var(--blog-surface);
          }

          .elad-blog-search-input:focus {
            border-color: var(--blog-primary);
            color: var(--blog-title);
            background: var(--blog-surface);
            box-shadow: 0 0 0 0.2rem rgba(36, 99, 235, 0.14);
          }

          .elad-blog-search-input::placeholder {
            color: var(--blog-muted);
          }

          .elad-blog-search-clear {
            position: absolute;
            top: 50%;
            right: 9px;
            display: inline-flex;
            width: 32px;
            height: 32px;
            align-items: center;
            justify-content: center;
            padding: 0;
            border: 0;
            border-radius: 50%;
            color: var(--blog-muted);
            background: transparent;
            font-size: 1.3rem;
            line-height: 1;
            transform: translateY(-50%);
            transition: color 0.2s ease, background-color 0.2s ease;
          }

          .elad-blog-search-clear:hover,
          .elad-blog-search-clear:focus {
            color: var(--blog-title);
            background: rgba(36, 99, 235, 0.1);
            outline: none;
          }

          .elad-blog-results {
            margin-bottom: 22px;
            color: var(--blog-text);
            font-size: 0.9rem;
          }

          .elad-blog-card {
            height: 100%;
            overflow: hidden;
            border: 1px solid var(--blog-border);
            border-radius: 20px;
            color: var(--blog-title);
            background: var(--blog-surface);
            box-shadow: var(--blog-shadow);
            transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease;
          }

          .elad-blog-card:hover {
            border-color: rgba(36, 99, 235, 0.38);
            transform: translateY(-5px);
            box-shadow: 0 24px 52px rgba(23, 58, 94, 0.17);
          }

          .blog-dark .elad-blog-card:hover {
            box-shadow: 0 26px 58px rgba(0, 0, 0, 0.46);
          }

          .elad-blog-card-image-link {
            display: block;
            overflow: hidden;
            background: #ffffff;
          }

          .elad-blog-card-image {
            display: block;
            width: 100%;
            aspect-ratio: 16 / 10;
            object-fit: cover;
            object-position: center;
            transition: transform 0.28s ease;
          }

          .elad-blog-card:hover .elad-blog-card-image {
            transform: scale(1.035);
          }

          .elad-blog-card-image-empty {
            display: flex;
            width: 100%;
            aspect-ratio: 16 / 10;
            align-items: center;
            justify-content: center;
            color: var(--blog-muted);
            background: linear-gradient(135deg, rgba(35, 56, 139, 0.08), rgba(21, 119, 206, 0.13));
          }

          .elad-blog-card-image-empty i {
            font-size: 3rem;
          }

          .elad-blog-card-body {
            display: flex;
            min-height: 305px;
            flex-direction: column;
            padding: 28px;
          }

          .elad-blog-category {
            display: inline-flex;
            width: fit-content;
            max-width: 100%;
            align-items: center;
            margin-bottom: 16px;
            padding: 5px 10px;
            overflow: hidden;
            border-radius: 6px;
            color: #ffffff;
            background: var(--blog-primary);
            font-size: 0.72rem;
            font-weight: 800;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .elad-blog-card-title {
            display: -webkit-box;
            min-height: 66px;
            margin-bottom: 13px;
            overflow: hidden;
            color: var(--blog-title);
            font-size: 1.28rem;
            font-weight: 800;
            line-height: 1.28;
            letter-spacing: -0.015em;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 3;
          }

          .elad-blog-card-title a {
            color: inherit;
            text-decoration: none;
          }

          .elad-blog-card-title a:hover {
            color: var(--blog-primary);
          }

          .elad-blog-card-excerpt {
            display: -webkit-box;
            margin-bottom: 18px;
            overflow: hidden;
            color: var(--blog-text);
            font-size: 0.91rem;
            line-height: 1.65;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 3;
          }

          .elad-blog-card-date {
            margin-top: auto;
            margin-bottom: 15px;
            color: var(--blog-muted);
            font-size: 0.8rem;
            font-weight: 700;
          }

          .elad-blog-read-more {
            display: inline-flex;
            width: fit-content;
            align-items: center;
            gap: 8px;
            color: var(--blog-primary);
            font-size: 0.88rem;
            font-weight: 800;
            text-decoration: none;
          }

          .elad-blog-read-more:hover {
            color: var(--blog-primary-dark);
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

          .elad-blog-empty {
            padding: 35px;
            border: 1px dashed var(--blog-border);
            border-radius: 18px;
            background: var(--blog-surface);
          }

          .elad-blog-empty i {
            display: block;
            margin-bottom: 12px;
            font-size: 2.5rem;
          }

          .elad-blog-error {
            border-radius: 14px;
            text-align: center;
          }

          @media (max-width: 991.98px) {
            .elad-blog-hero {
              min-height: auto;
              padding-top: 118px;
              padding-bottom: 52px;
            }

            .elad-blog-hero-row {
              min-height: auto;
            }

            .elad-blog-hero-copy {
              max-width: 760px;
              padding-bottom: 10px;
            }

            .elad-blog-hero-image-wrapper {
              min-height: auto;
              margin-top: 24px;
              justify-content: center;
              overflow: visible;
              padding: 0;
            }

            .elad-blog-hero-image {
              width: min(100%, 540px);
              max-height: 320px;
            }

            .elad-blog-content {
              padding-top: 50px;
              padding-bottom: 70px;
            }

            .elad-blog-card-body {
              min-height: 280px;
            }
          }

          @media (max-width: 575.98px) {
            .elad-blog-shell {
              padding-right: 14px;
              padding-left: 14px;
            }

            .elad-blog-hero {
              min-height: auto;
              padding-top: 104px;
              padding-bottom: 42px;
            }

            .elad-blog-hero h1 {
              max-width: 100%;
              font-size: 2.55rem;
              line-height: 1.08;
            }

            .elad-blog-hero p {
              font-size: 0.98rem;
              line-height: 1.7;
            }

            .elad-blog-hero-image-wrapper {
              margin-top: 22px;
            }

            .elad-blog-hero-image {
              width: 100%;
              max-width: 410px;
              max-height: 245px;
            }

            .elad-blog-content {
              padding-top: 38px;
            }

            .elad-blog-toolbar {
              align-items: flex-start;
            }

            .elad-blog-search-panel.open {
              width: calc(100% - 56px);
              max-width: calc(100% - 56px);
              margin-left: 8px;
            }

            .elad-blog-card {
              border-radius: 16px;
            }

            .elad-blog-card-body {
              min-height: auto;
              padding: 21px;
            }

            .elad-blog-card-title {
              min-height: auto;
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
          darkMode ? "blog-dark" : "blog-light",
        ].join(" ")}
      >
        <section className="elad-blog-hero">
          <Container
            fluid
            className="elad-blog-shell"
          >
            <Row
              className="elad-blog-hero-row align-items-center"
            >
              <Col
                xs={12}
                lg={7}
              >
                <div className="elad-blog-hero-copy">
                  <div className="elad-blog-kicker">
                    Tecnologías Administrativas ELAD
                  </div>

                  <h1>
                    Información para mejorar la administración
                    y digitalización de tu empresa
                  </h1>

                  <p>
                    Publicaciones sobre tecnología
                    empresarial, automatización,
                    productividad y mejores prácticas
                    administrativas.
                  </p>
                </div>
              </Col>

              <Col
                xs={12}
                lg={5}
              >
                <div className="elad-blog-hero-image-wrapper">
                  <img
                    src={blogPrincipal}
                    alt="Blog de Tecnologías Administrativas ELAD"
                    className="elad-blog-hero-image"
                    loading="eager"
                    decoding="async"
                  />
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        <section className="elad-blog-content">
          <Container
            fluid
            className="elad-blog-shell"
          >
            <div className="elad-blog-toolbar">
              <button
                type="button"
                className="elad-blog-search-toggle"
                aria-label={
                  searchOpen
                    ? "Cerrar buscador"
                    : "Abrir buscador"
                }
                aria-expanded={searchOpen}
                onClick={toggleSearch}
              >
                <i
                  className={
                    searchOpen
                      ? "mdi mdi-close"
                      : "mdi mdi-magnify"
                  }
                  aria-hidden="true"
                />
              </button>

              <div
                className={[
                  "elad-blog-search-panel",
                  searchOpen ? "open" : "",
                ].join(" ")}
                aria-hidden={!searchOpen}
              >
                <div className="elad-blog-search-field">
                  <Form.Control
                    ref={searchInputRef}
                    type="search"
                    className="elad-blog-search-input"
                    value={search}
                    placeholder="Buscar publicaciones..."
                    aria-label="Buscar publicaciones"
                    tabIndex={searchOpen ? 0 : -1}
                    onChange={(event) => {
                      setSearch(
                        event.currentTarget.value
                      );
                    }}
                  />

                  {search !== "" && (
                    <button
                      type="button"
                      className="elad-blog-search-clear"
                      aria-label="Limpiar búsqueda"
                      title="Limpiar búsqueda"
                      tabIndex={searchOpen ? 0 : -1}
                      onClick={clearSearch}
                    >
                      <i
                        className="mdi mdi-close"
                        aria-hidden="true"
                      />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {!loading &&
              !error &&
              search.trim() !== "" && (
                <div className="elad-blog-results">
                  {filteredPosts.length === 1
                    ? "1 publicación encontrada"
                    : `${filteredPosts.length} publicaciones encontradas`}
                </div>
              )}

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

                <p className="mb-3">{error}</p>

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
              filteredPosts.length === 0 && (
                <div className="elad-blog-empty">
                  <div>
                    <i
                      className="mdi mdi-file-search-outline"
                      aria-hidden="true"
                    />

                    {search.trim()
                      ? `No se encontraron publicaciones para “${search}”.`
                      : "No hay publicaciones disponibles."}
                  </div>
                </div>
              )}

            {!loading &&
              !error &&
              filteredPosts.length > 0 && (
                <Row className="elad-blog-grid">
                  {filteredPosts.map((post) => (
                    <Col
                  key={post.slug}
                  xs={6}
                  md={6}
                  xl={4}
                  >
                      <Card className="elad-blog-card">
                        {post.cover?.url ? (
                          <Link
                            to={getPostRoute(post)}
                            className="elad-blog-card-image-link"
                            aria-label={`Leer ${post.title}`}
                          >
                            <img
                              src={post.cover.url}
                              alt={
                                post.cover.alt_text ||
                                post.title
                              }
                              className="elad-blog-card-image"
                              loading="lazy"
                              decoding="async"
                            />
                          </Link>
                        ) : (
                          <div className="elad-blog-card-image-empty">
                            <i
                              className="mdi mdi-image-off-outline"
                              aria-hidden="true"
                            />
                          </div>
                        )}

                        <Card.Body className="elad-blog-card-body">
                          <span className="elad-blog-category">
                            {post.category?.name ||
                              "General"}
                          </span>

                          <h2 className="elad-blog-card-title">
                            <Link to={getPostRoute(post)}>
                              {post.title}
                            </Link>
                          </h2>

                          <p className="elad-blog-card-excerpt">
                            {post.excerpt ||
                              "Consulta la publicación completa."}
                          </p>

                          <div className="elad-blog-card-date">
                            {formatDate(
                              post.published_at
                            )}
                          </div>

                          <Link
                            to={getPostRoute(post)}
                            className="elad-blog-read-more"
                          >
                            Leer publicación

                            <i
                              className="mdi mdi-arrow-right"
                              aria-hidden="true"
                            />
                          </Link>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
          </Container>
        </section>
      </main>

      <TaeFooter />

      <BackToTop />
    </>
  );
}