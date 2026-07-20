import {
  type CSSProperties,
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
  image: PublicBlogCover | string | null;
  url: string | null;
  type: string;
};

type PublicBlogAdMedia = {
  url: string;
  alt_text?: string | null;
  title?: string | null;
};

type PublicBlogAdImage = {
  id?: number;
  media_id?: number;
  sort_order?: number;

  /*
   * Se admiten ambos formatos para mantener
   * compatibilidad con el Resource público.
   */
  url?: string | null;
  alt_text?: string | null;
  media?: PublicBlogAdMedia | null;
};

type PublicBlogAd = {
  id: number;
  title: string;
  description: string | null;

  link_url: string;
  link_text: string | null;

  status: "active" | "inactive";
  sort_order: number;

  images: PublicBlogAdImage[];
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

  /*
   * El backend público debe devolver únicamente
   * anuncios permitidos para esta publicación.
   */
  ads?: PublicBlogAd[];
};

type PublicRecentPost = {
  title: string;
  slug: string;
  published_at: string | null;
  cover: PublicBlogCover | null;
};

type PublicPostsResponse = {
  data: PublicRecentPost[];
};

type ResourceResponse<T> = {
  data: T;
};

const API_BASE_URL = (
  process.env.REACT_APP_PUBLIC_API_URL ||
  "https://api.tecnologiasadministrativas.com/api"
).replace(/\/+$/, "");

const AD_ROTATION_INTERVAL_MS = 5000;

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

function getPublicAdImageUrl(
  image: PublicBlogAdImage
): string {
  return (
    image.media?.url ||
    image.url ||
    ""
  ).trim();
}

function getPublicAdImageAlt(
  image: PublicBlogAdImage,
  fallback: string
): string {
  return (
    image.media?.alt_text ||
    image.alt_text ||
    fallback
  ).trim();
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

const IMAGE_FILE_EXTENSION_PATTERN =
  /\.(?:png|jpe?g|webp|gif|avif|svg|bmp)$/i;

const CONTENT_ROOT_ID =
  "blog-content-root";

function normalizeStandaloneValue(
  value: string
): string {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isPublicImageUrl(
  value: string
): boolean {
  const cleanValue =
    normalizeStandaloneValue(value);

  if (!cleanValue) {
    return false;
  }

  try {
    const parsedUrl = new URL(cleanValue);

    if (
      parsedUrl.protocol !== "http:" &&
      parsedUrl.protocol !== "https:"
    ) {
      return false;
    }

    return IMAGE_FILE_EXTENSION_PATTERN.test(
      parsedUrl.pathname
    );
  } catch {
    return false;
  }
}

function escapeHtml(
  value: string
): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function containsHtml(
  value: string
): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function decodeHtmlEntities(
  value: string
): string {
  if (
    typeof window === "undefined" ||
    !value.includes("&lt;")
  ) {
    return value;
  }

  const parser = new DOMParser();

  const document =
    parser.parseFromString(
      value,
      "text/html"
    );

  return document.documentElement
    .textContent ?? value;
}

function sanitizePublicContent(
  html: string
): string {
  return DOMPurify.sanitize(
    html,
    {
      USE_PROFILES: {
        html: true,
      },

      ADD_TAGS: [
        "figure",
        "figcaption",
        "img",
      ],

      ADD_ATTR: [
        "class",
        "src",
        "alt",
        "title",
        "loading",
        "decoding",
        "width",
        "height",
        "href",
        "target",
        "rel",
        "data-blog-image-reference",
        "data-image-reference-link",
        "data-image-src",
        "data-image-alt",
        "data-image-title",
      ],
    }
  );
}

function createImageFigureHtml(
  imageUrl: string,
  altText = "Imagen de la publicación"
): string {
  const safeUrl = escapeHtml(
    normalizeStandaloneValue(
      imageUrl
    )
  );

  const safeAltText = escapeHtml(
    altText.trim() ||
      "Imagen de la publicación"
  );

  return `
    <figure class="blog-post-public-image">
      <img
        src="${safeUrl}"
        alt="${safeAltText}"
        loading="lazy"
        decoding="async"
      />
    </figure>
  `;
}

function getImageUrlFromElement(
  element: Element
): string | null {
  /*
   * Caso 1:
   * <p>https://.../imagen.png</p>
   */
  const textValue =
    normalizeStandaloneValue(
      element.textContent ?? ""
    );

  if (isPublicImageUrl(textValue)) {
    return textValue;
  }

  /*
   * Caso 2:
   * <p>
   *   <a href="https://.../imagen.png">
   *     https://.../imagen.png
   *   </a>
   * </p>
   */
  const links = Array.from(
    element.querySelectorAll<HTMLAnchorElement>(
      "a[href]"
    )
  );

  if (links.length !== 1) {
    return null;
  }

  const link = links[0];

  const href =
    normalizeStandaloneValue(
      link.getAttribute("href") ?? ""
    );

  if (!isPublicImageUrl(href)) {
    return null;
  }

  /*
   * Solo se reemplaza el bloque completo cuando
   * no contiene texto adicional.
   */
  const linkText =
    normalizeStandaloneValue(
      link.textContent ?? ""
    );

  const elementText =
    normalizeStandaloneValue(
      element.textContent ?? ""
    );

  if (
    elementText === linkText ||
    elementText === href
  ) {
    return href;
  }

  return null;
}

function replaceElementWithImage(
  element: Element,
  imageUrl: string,
  document: Document
): void {
  const figure =
    document.createElement(
      "figure"
    );

  figure.className =
    "blog-post-public-image";

  const image =
    document.createElement(
      "img"
    );

  image.setAttribute(
    "src",
    imageUrl
  );

  image.setAttribute(
    "alt",
    element.getAttribute(
      "data-image-alt"
    ) ||
      element.getAttribute(
        "aria-label"
      ) ||
      "Imagen de la publicación"
  );

  image.setAttribute(
    "loading",
    "lazy"
  );

  image.setAttribute(
    "decoding",
    "async"
  );

  figure.appendChild(image);
  element.replaceWith(figure);
}

function replaceImageReferenceWithFigure(
  reference: Element,
  document: Document
): void {
  const link =
    reference.querySelector<HTMLAnchorElement>(
      "a[href]"
    );

  const imageUrl =
    normalizeStandaloneValue(
      reference.getAttribute(
        "data-image-src"
      ) ||
        link?.getAttribute("href") ||
        link?.textContent ||
        ""
    );

  if (!isPublicImageUrl(imageUrl)) {
    return;
  }

  const captionText =
    reference
      .querySelector("figcaption")
      ?.textContent?.trim() || "";

  const altText =
    reference.getAttribute(
      "data-image-alt"
    ) ||
    captionText ||
    "Imagen de la publicación";

  const imageTitle =
    reference.getAttribute(
      "data-image-title"
    ) || "";

  const figure =
    document.createElement(
      "figure"
    );

  figure.className =
    "blog-post-public-image";

  const image =
    document.createElement(
      "img"
    );

  image.setAttribute(
    "src",
    imageUrl
  );

  image.setAttribute(
    "alt",
    altText
  );

  if (imageTitle) {
    image.setAttribute(
      "title",
      imageTitle
    );
  }

  image.setAttribute(
    "loading",
    "lazy"
  );

  image.setAttribute(
    "decoding",
    "async"
  );

  figure.appendChild(image);

  if (captionText) {
    const caption =
      document.createElement(
        "figcaption"
      );

    caption.textContent =
      captionText;

    figure.appendChild(caption);
  }

  reference.replaceWith(figure);
}

function transformHtmlContent(
  content: string
): string {
  const parser = new DOMParser();

  const parsedDocument =
    parser.parseFromString(
      `<div id="${CONTENT_ROOT_ID}">${content}</div>`,
      "text/html"
    );

  const root =
    parsedDocument.getElementById(
      CONTENT_ROOT_ID
    );

  if (!root) {
    return sanitizePublicContent(
      content
    );
  }

  /*
   * El editor administrativo guarda una referencia
   * visible como hipervínculo. Aquí se sustituye por
   * la imagen real y su pie.
   */
  Array.from(
    root.querySelectorAll(
      "figure[data-blog-image-reference]"
    )
  ).forEach((reference) => {
    replaceImageReferenceWithFigure(
      reference,
      parsedDocument
    );
  });

  /*
   * Primero revisa los contenedores más comunes
   * generados por editores visuales.
   */
  const candidateBlocks = Array.from(
    root.querySelectorAll(
      "p, div, section"
    )
  );

  candidateBlocks.forEach(
    (element) => {
      /*
       * No sustituye un contenedor que ya incluya
       * una imagen real.
       */
      if (
        element.querySelector("img")
      ) {
        return;
      }

      const imageUrl =
        getImageUrlFromElement(
          element
        );

      if (!imageUrl) {
        return;
      }

      replaceElementWithImage(
        element,
        imageUrl,
        parsedDocument
      );
    }
  );

  /*
   * Respaldo para enlaces de imagen que hayan
   * quedado fuera de un párrafo o contenedor.
   */
  Array.from(
    root.querySelectorAll<HTMLAnchorElement>(
      "a[href]"
    )
  ).forEach((link) => {
    const href =
      normalizeStandaloneValue(
        link.getAttribute("href") ?? ""
      );

    if (
      !isPublicImageUrl(href)
    ) {
      return;
    }

    const parent =
      link.parentElement;

    const parentText =
      normalizeStandaloneValue(
        parent?.textContent ?? ""
      );

    const linkText =
      normalizeStandaloneValue(
        link.textContent ?? ""
      );

    if (
      parent &&
      parentText === linkText &&
      !parent.querySelector("img")
    ) {
      replaceElementWithImage(
        parent,
        href,
        parsedDocument
      );

      return;
    }

    const image =
      parsedDocument.createElement(
        "img"
      );

    image.setAttribute("src", href);
    image.setAttribute(
      "alt",
      "Imagen de la publicación"
    );
    image.setAttribute(
      "loading",
      "lazy"
    );
    image.setAttribute(
      "decoding",
      "async"
    );

    link.replaceWith(image);
  });

  return sanitizePublicContent(
    root.innerHTML
  );
}

function transformPlainTextContent(
  content: string
): string {
  const html = content
    .split("\n")
    .map((line) => {
      const cleanLine =
        normalizeStandaloneValue(
          line
        );

      if (!cleanLine) {
        return "";
      }

      if (
        isPublicImageUrl(cleanLine)
      ) {
        return createImageFigureHtml(
          cleanLine
        );
      }

      return `<p>${escapeHtml(
        cleanLine
      )}</p>`;
    })
    .filter(Boolean)
    .join("");

  return sanitizePublicContent(
    html
  );
}

function transformPublicContent(
  content: string
): string {
  const normalizedContent =
    decodeHtmlEntities(
      content
        .replace(/\r\n/g, "\n")
        .trim()
    );

  if (!normalizedContent) {
    return "";
  }

  if (
    containsHtml(
      normalizedContent
    )
  ) {
    return transformHtmlContent(
      normalizedContent
    );
  }

  return transformPlainTextContent(
    normalizedContent
  );
}


function getRecentPostRoute(
  systemSlug: string,
  blogSlug: string,
  postSlug: string
): string {
  return `/blogs/${encodeURIComponent(
    systemSlug
  )}/${encodeURIComponent(
    blogSlug
  )}/posts/${encodeURIComponent(
    postSlug
  )}`;
}

function PublicAdCard({
  ad,
  primaryColor,
}: {
  ad: PublicBlogAd;
  primaryColor: string;
}) {
  const images = useMemo(
    () =>
      [...(ad.images ?? [])]
        .filter((image) =>
          Boolean(
            getPublicAdImageUrl(
              image
            )
          )
        )
        .sort(
          (first, second) =>
            (first.sort_order ?? 0) -
            (second.sort_order ?? 0)
        ),
    [ad.images]
  );

  const [activeIndex, setActiveIndex] =
    useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [ad.id, images.length]);

  useEffect(() => {
    if (images.length <= 1) {
      return;
    }

    const interval = window.setInterval(
      () => {
        setActiveIndex(
          (current) =>
            (current + 1) %
            images.length
        );
      },
      AD_ROTATION_INTERVAL_MS
    );

    return () => {
      window.clearInterval(interval);
    };
  }, [images.length]);

  if (images.length !== 3) {
    return null;
  }

  const activeImage =
    images[activeIndex] ??
    images[0];

  return (
    <article
      className="blog-post-public-ad-card"
      style={
        {
          "--blog-public-primary":
            primaryColor,
        } as CSSProperties
      }
    >
      <div className="blog-post-public-ad-heading">
        Anuncio
      </div>

      <div className="blog-post-public-ad-inner">
        <div className="blog-post-public-ad-carousel">
          <a
            href={ad.link_url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="blog-post-public-ad-slide-link"
            aria-label={`Abrir anuncio: ${ad.title}`}
          >
            <img
              key={
                activeImage.id ??
                `${ad.id}-${activeIndex}`
              }
              src={getPublicAdImageUrl(
                activeImage
              )}
              alt={getPublicAdImageAlt(
                activeImage,
                ad.title
              )}
              className="blog-post-public-ad-slide"
              loading="lazy"
              decoding="async"
            />
          </a>

          <div
            className="blog-post-public-ad-dots"
            aria-label="Seleccionar imagen del anuncio"
          >
            {images.map((image, index) => (
              <button
                key={
                  image.id ??
                  `${ad.id}-dot-${index}`
                }
                type="button"
                className={[
                  "blog-post-public-ad-dot",
                  index === activeIndex
                    ? "active"
                    : "",
                ].join(" ")}
                aria-label={`Mostrar imagen ${index + 1}`}
                aria-current={
                  index === activeIndex
                    ? "true"
                    : undefined
                }
                onClick={() =>
                  setActiveIndex(index)
                }
              />
            ))}
          </div>
        </div>

        <div className="blog-post-public-ad-copy">
          <h2 className="blog-post-public-ad-title">
            {ad.title}
          </h2>

          {ad.description && (
            <p className="blog-post-public-ad-description">
              {ad.description}
            </p>
          )}

          <a
            href={ad.link_url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="blog-post-public-ad-button"
          >
            {ad.link_text?.trim() ||
              "Conocer más"}

            <i
              className="mdi mdi-open-in-new"
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </article>
  );
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

  const [recentPosts, setRecentPosts] =
    useState<PublicRecentPost[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [recentPostsLoading, setRecentPostsLoading] =
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

  const postsEndpoint = useMemo(() => {
    if (
      !systemSlug ||
      !blogSlug
    ) {
      return "";
    }

    return `${API_BASE_URL}/public/v1/${encodeURIComponent(
      systemSlug
    )}/blogs/${encodeURIComponent(
      blogSlug
    )}/posts`;
  }, [
    systemSlug,
    blogSlug,
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

        const payload =
          response.data?.data;

        if (!payload) {
          throw new Error(
            "La API no devolvió la publicación."
          );
        }

        setPost({
          ...payload,
          tags: Array.isArray(payload.tags)
            ? payload.tags
            : [],
          ads: Array.isArray(payload.ads)
            ? payload.ads
            : [],
        });
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (axios.isAxiosError(requestError)) {
          console.error(
            "Error cargando publicación:",
            {
              message: requestError.message,
              code: requestError.code,
              status:
                requestError.response?.status,
              data:
                requestError.response?.data,
              url:
                requestError.config?.url,
              params:
                requestError.config?.params,
            }
          );
        } else {
          console.error(
            "Error cargando publicación:",
            requestError
          );
        }

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

  useEffect(() => {
    let active = true;

    async function loadRecentPosts() {
      if (!postsEndpoint) {
        setRecentPosts([]);
        setRecentPostsLoading(false);
        return;
      }

      try {
        setRecentPostsLoading(true);

        const response =
          await axios.get<PublicPostsResponse>(
            postsEndpoint,
            {
              timeout: 15000,
              params: {
                per_page: 4,
                order: "latest",
              },
              headers: {
                Accept: "application/json",
              },
            }
          );

        if (!active) {
          return;
        }

        const items =
          Array.isArray(
            response.data?.data
          )
            ? response.data.data
            : [];

        setRecentPosts(
          items
            .filter(
              (item) =>
                item.slug !== postSlug
            )
            .slice(0, 3)
        );
      } catch (requestError) {
        if (!active) {
          return;
        }

        console.error(
          "Error cargando publicaciones recientes:",
          requestError
        );

        setRecentPosts([]);
      } finally {
        if (active) {
          setRecentPostsLoading(false);
        }
      }
    }

    void loadRecentPosts();

    return () => {
      active = false;
    };
  }, [
    postsEndpoint,
    postSlug,
  ]);

  const sanitizedContent = useMemo(() => {
    if (!post?.content) {
      return "";
    }

    return transformPublicContent(
      post.content
    );
  }, [post?.content]);

  const publicAds = useMemo(() => {
    const ads = post?.ads;

    if (!Array.isArray(ads)) {
      return [];
    }

    return ads
      .filter(
        (ad) =>
          ad.status === "active" &&
          Boolean(ad.link_url?.trim())
      )
      .map((ad) => ({
        ...ad,
        images: [...(ad.images ?? [])]
          .filter((image) =>
            Boolean(
              getPublicAdImageUrl(
                image
              )
            )
          )
          .sort(
            (first, second) =>
              (first.sort_order ?? 0) -
              (second.sort_order ?? 0)
          ),
      }))
      .filter(
        (ad) =>
          ad.images.length === 3
      )
      .sort(
        (first, second) =>
          first.sort_order -
            second.sort_order ||
          first.id - second.id
      );
  }, [post?.ads]);

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

          .blog-post-public-shell {
            max-width: 1480px;
          }

          .blog-post-public-layout {
            display: grid;
            grid-template-columns:
              minmax(0, 1fr)
              minmax(370px, 440px);
            gap: 28px;
            align-items: start;
          }

          .blog-post-public-article {
            min-width: 0;
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

          .blog-post-public-content figure.blog-post-public-image {
            display: block;
            width: 100%;
            margin: 32px auto;
            text-align: center;
          }

          .blog-post-public-content img {
            display: block;
            width: auto;
            max-width: 100%;
            height: auto;
            margin: 25px auto;
            border-radius: 15px;
            object-fit: contain;
            background: #f6f8fb;
          }

          .blog-post-public-content figure.blog-post-public-image img,
          .blog-post-public-content figure.blog-content-image img {
            display: block;
            width: auto;
            max-width: 100%;
            max-height: 760px;
            margin: 0 auto;
            box-shadow:
              0 10px 30px
              rgba(22, 53, 85, 0.10);
          }

          .blog-post-public-content figure.blog-post-public-image figcaption,
          .blog-post-public-content figure.blog-content-image figcaption {
            max-width: 760px;
            margin: 12px auto 0;
            color: #667085;
            font-size: 0.92rem;
            line-height: 1.6;
            text-align: center;
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

          .blog-post-public-sidebar {
            position: sticky;
            top: 105px;
            display: grid;
            gap: 24px;
            min-width: 0;
          }

          .blog-post-public-sidebar-ads {
            display: grid;
            gap: 20px;
          }

          .blog-post-public-ad-card {
            overflow: hidden;
            padding: 16px;
            border: 1px solid #dce3ec;
            border-radius: 20px;
            background: #ffffff;
            box-shadow:
              0 14px 38px
              rgba(22, 53, 85, 0.10);
          }

          .blog-post-public-ad-heading {
            margin-bottom: 10px;
            color: #667085;
            font-size: 0.72rem;
            font-weight: 900;
            letter-spacing: 0.07em;
            text-transform: uppercase;
          }

          .blog-post-public-ad-inner {
            display: grid;
            grid-template-columns:
              minmax(0, .78fr)
              minmax(0, 1.22fr);
            min-height: 220px;
            overflow: hidden;
            border: 1px solid #e4e9f0;
            border-radius: 16px;
            background: #ffffff;
          }

          .blog-post-public-ad-carousel {
            position: relative;
            min-width: 0;
            min-height: 220px;
            overflow: hidden;
            background: #eef3f9;
          }

          .blog-post-public-ad-slide-link {
            display: flex;
            width: 100%;
            height: 100%;
            min-height: 220px;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            padding: 8px;
            background: #ffffff;
          }

          .blog-post-public-ad-slide {
            display: block;
            width: 100%;
            height: 100%;
            min-height: 0;
            max-height: 220px;
            margin: 0;
            object-fit: contain;
            object-position: center;
            background: #ffffff;
            animation:
              blogAdFade .32s ease;
          }

          @keyframes blogAdFade {
            from {
              opacity: .35;
              transform: scale(1.015);
            }

            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          .blog-post-public-ad-dots {
            position: absolute;
            left: 50%;
            bottom: 14px;
            z-index: 2;
            display: flex;
            gap: 7px;
            transform: translateX(-50%);
          }

          .blog-post-public-ad-dot {
            width: 8px;
            height: 8px;
            padding: 0;
            border: 0;
            border-radius: 50%;
            background: rgba(255,255,255,.65);
          }

          .blog-post-public-ad-dot.active {
            background:
              var(
                --blog-public-primary,
                #1577ce
              );
            box-shadow:
              0 0 0 2px
              rgba(255,255,255,.85);
          }

          .blog-post-public-ad-copy {
            display: flex;
            min-width: 0;
            flex-direction: column;
            justify-content: center;
            padding: 22px 20px;
            overflow-wrap: anywhere;
          }

          .blog-post-public-ad-title {
            margin: 0;
            color: #17243d;
            font-size: 1.22rem;
            font-weight: 900;
            line-height: 1.22;
            overflow-wrap: anywhere;
          }

          .blog-post-public-ad-description {
            margin: 12px 0 0;
            color: #667085;
            font-size: .9rem;
            line-height: 1.58;
            overflow-wrap: anywhere;
          }

          .blog-post-public-ad-button {
            display: inline-flex;
            width: fit-content;
            align-items: center;
            justify-content: center;
            gap: 7px;
            margin-top: 20px;
            padding: 10px 15px;
            border-radius: 10px;
            color: #ffffff;
            background:
              var(
                --blog-public-primary,
                #1577ce
              );
            font-size: .86rem;
            font-weight: 900;
            text-decoration: none;
          }

          .blog-post-public-ad-button:hover {
            color: #ffffff;
            filter: brightness(.93);
          }

          .blog-post-public-recent {
            padding: 20px;
            border: 1px solid #dce3ec;
            border-radius: 20px;
            background: #ffffff;
            box-shadow:
              0 14px 38px
              rgba(22, 53, 85, 0.08);
          }

          .blog-post-public-recent-title {
            margin: 0 0 12px;
            color: #17243d;
            font-size: 1.05rem;
            font-weight: 900;
          }

          .blog-post-public-recent-list {
            display: grid;
            gap: 0;
            margin: 0;
            padding: 0;
            list-style: none;
          }

          .blog-post-public-recent-item {
            border-top: 1px solid #edf0f4;
          }

          .blog-post-public-recent-item:first-child {
            border-top: 0;
          }
          .blog-post-public-recent-link {
            display: flex;
            gap: 12px;
            align-items: center;
            padding: 14px 0;
            color: #17243d;
            font-size: .9rem;
            font-weight: 800;
            line-height: 1.4;
            text-decoration: none;
          }

          .blog-post-public-recent-link:hover
          .blog-post-public-recent-thumb-frame {
            transform: translateY(-1px);

            box-shadow:
              0 7px 18px
              rgba(22, 53, 85, 0.18);
          }

          .blog-post-public-recent-link:hover
          .blog-post-public-recent-thumb {
            transform: scale(1.02);
          }

          .blog-post-public-recent-content {
            display: grid;
            gap: 4px;
            min-width: 0;
          }

          .blog-post-public-recent-date {
            color: #8a94a6;
            font-size: .73rem;
            font-weight: 600;
            line-height: 1.35;
          }

          .blog-post-public-recent-thumb-frame {
            position: relative;
            display: flex;
            width: 74px;
            height: 58px;
            flex: 0 0 74px;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            padding: 4px;
            border: 1px solid #dce3ec;
            border-radius: 10px;
            background: #ffffff;
            box-shadow:
              0 4px 12px
              rgba(22, 53, 85, 0.12);
            transition:
              transform 0.2s ease,
              box-shadow 0.2s ease;
          }

          .blog-post-public-recent-thumb {
            display: block;
            width: 100%;
            height: 100%;
            max-width: 100%;
            margin: 0;
            object-fit: contain;
            object-position: center;
            border-radius: 7px;
            background: #ffffff;
            transition: transform 0.2s ease;
          }

          .blog-post-public-recent-thumb-empty {
            display: inline-flex;
            width: 74px;
            height: 58px;
            flex: 0 0 74px;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border: 1px solid #dce3ec;
            border-radius: 10px;
            color: #8a94a6;
            background: #f3f6fa;
            box-shadow:
              0 4px 12px
              rgba(22, 53, 85, 0.10);
          }

          .blog-post-public-recent-thumb-empty i {
            font-size: 1.35rem;
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

          @media (max-width: 1199.98px) {
            .blog-post-public-layout {
              grid-template-columns:
                minmax(0, 1fr)
                minmax(340px, 390px);
            }

            .blog-post-public-ad-inner {
              grid-template-columns:
                minmax(0, .72fr)
                minmax(0, 1.28fr);
            }

            .blog-post-public-ad-carousel {
              min-height: 210px;
            }

            .blog-post-public-ad-slide-link {
              min-height: 210px;
            }

            .blog-post-public-ad-slide {
              max-height: 210px;
            }
          }

          @media (max-width: 991.98px) {
            .blog-post-public-layout {
              grid-template-columns: 1fr;
            }

            .blog-post-public-sidebar {
              position: static;
            }

            .blog-post-public-ad-inner {
              grid-template-columns:
                minmax(0, 1.15fr)
                minmax(200px, .85fr);
            }
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

            .blog-post-public-layout {
              gap: 22px;
            }

            .blog-post-public-ad-card {
              padding: 13px;
              border-radius: 17px;
            }

            .blog-post-public-ad-inner {
              grid-template-columns: 1fr;
            }

            .blog-post-public-ad-carousel,
            .blog-post-public-ad-slide-link {
              min-height: 245px;
            }

            .blog-post-public-ad-slide {
              max-height: 245px;
            }

            .blog-post-public-ad-copy {
              padding: 21px;
            }

            .blog-post-public-ad-button {
              width: 100%;
            }

            .blog-post-public-recent-thumb-frame,
            .blog-post-public-recent-thumb-empty {
              width: 68px;
              height: 54px;
              flex-basis: 68px;
            }
          }
        `}
      </style>

      <Navbar1 isLogoDark={false} />

      <main
        className="blog-post-public-page"
        style={
          {
            "--blog-public-primary":
              primaryColor,
          } as CSSProperties
        }
      >
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
                to="/blogs"
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
                  to="/blogs"
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
              <Container
                className="blog-post-public-shell"
              >
                <div className="blog-post-public-layout">
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

                      {Array.isArray(post.tags) &&
                        post.tags.length > 0 && (
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

                  <aside className="blog-post-public-sidebar">
                    {publicAds.length > 0 && (
                      <section
                        className="blog-post-public-sidebar-ads"
                        aria-label="Anuncios relacionados"
                      >
                        {publicAds.map((ad) => (
                          <PublicAdCard
                            key={ad.id}
                            ad={ad}
                            primaryColor={
                              primaryColor
                            }
                          />
                        ))}
                      </section>
                    )}

                    <section
                      className="blog-post-public-recent"
                      style={
                        {
                          "--blog-public-primary":
                            primaryColor,
                        } as CSSProperties
                      }
                      aria-label="Publicaciones recientes"
                    >
                      <h2 className="blog-post-public-recent-title">
                        Publicaciones recientes
                      </h2>

                      {recentPostsLoading ? (
                        <div className="py-3 text-center">
                          <Spinner
                            animation="border"
                            size="sm"
                          />
                        </div>
                      ) : recentPosts.length === 0 ? (
                        <p className="mb-0 text-muted small">
                          No hay otras publicaciones disponibles.
                        </p>
                      ) : (
                        <ol className="blog-post-public-recent-list">
                          {recentPosts.map(
                            (recentPost) => (
                              <li
                                key={
                                  recentPost.slug
                                }
                                className="blog-post-public-recent-item"
                              >
                                <Link
                                  to={getRecentPostRoute(
                                    systemSlug,
                                    blogSlug,
                                    recentPost.slug
                                  )}
                                  className="blog-post-public-recent-link"
                                >
                                  {recentPost.cover?.url ? (
                                    <span className="blog-post-public-recent-thumb-frame">
                                      <img
                                        src={recentPost.cover.url}
                                        alt={
                                          recentPost.cover.alt_text ||
                                          recentPost.title
                                        }
                                        className="blog-post-public-recent-thumb"
                                        loading="lazy"
                                        decoding="async"
                                      />
                                    </span>
                                  ) : (
                                    <span
                                      className="blog-post-public-recent-thumb-empty"
                                      aria-hidden="true"
                                    >
                                      <i className="mdi mdi-image-outline" />
                                    </span>
                                  )}

                                  <span className="blog-post-public-recent-content">
                                    <span>
                                      {recentPost.title}
                                    </span>

                                    <small className="blog-post-public-recent-date">
                                      {formatDate(
                                        recentPost.published_at
                                      )}
                                    </small>
                                  </span>
                                </Link>
                              </li>
                            )
                          )}
                        </ol>
                      )}
                    </section>
                  </aside>
                </div>
              </Container>
            </section>
          </>
        )}
      </main>
    </>
  );
}
