import axiosClient from "../axiosClient";

/*
|--------------------------------------------------------------------------
| BLOGS
|--------------------------------------------------------------------------
*/

export type BlogStatus =
  | "active"
  | "inactive";

export type BlogSeo = {
  title: string | null;
  description: string | null;
  keywords: string | null;
  canonical_url: string | null;
  robots_index: boolean;
  robots_follow: boolean;
};

export type BlogLimits = {
  max_posts: number;
  max_images_per_post: number;
  max_image_size_kb: number;
  storage_limit_mb: number;
};

export type BlogTotals = {
  posts: number;
  categories: number;
  tags: number;
  media: number;
};

export type Blog = {
  id: number;
  system_id: number;
  created_by: number | null;

  name: string;
  slug: string;
  description: string | null;
  status: BlogStatus;
  public_url: string | null;

  seo: BlogSeo;
  limits: BlogLimits;
  totals: BlogTotals;

  created_at: string | null;
  updated_at: string | null;
};

export type BlogListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  status?: BlogStatus | "";
};

/*
|--------------------------------------------------------------------------
| PUBLICACIONES
|--------------------------------------------------------------------------
*/

export type BlogPostStatus =
  | "draft"
  | "scheduled"
  | "published"
  | "archived";

export type BlogPostCategory = {
  id: number;
  name: string;
  slug: string;
};

export type BlogPostAuthor = {
  id: number;
  name: string;
  email: string;
};

export type BlogPostMedia = {
  id: number;
  blog_id?: number;

  path: string;
  url: string;

  filename?: string;
  original_filename?: string;
  mime_type?: string;

  size?: number;
  size_kb?: string;

  width?: number | null;
  height?: number | null;

  alt_text: string | null;
  caption: string | null;
};

export type BlogPostTag = {
  id: number;
  name: string;
  slug: string;
};

export type BlogPostSeo = {
  title: string | null;
  description: string | null;
  keywords: string | null;
  canonical_url: string | null;
  robots_index: boolean;
  robots_follow: boolean;
};

export type BlogPostOpenGraph = {
  title: string | null;
  description: string | null;
  image_media_id: number | null;

  /*
   * Se deja opcional porque depende de cómo esté
   * construido BlogPostResource.
   */
  image_media?: BlogPostMedia | null;
};

export type BlogPost = {
  id: number;
  blog_id: number;
  category_id: number | null;
  author_id: number;

  cover_media_id: number | null;

  title: string;
  slug: string;
  excerpt: string | null;

  /*
   * El backend permite content nullable.
   */
  content: string | null;

  status: BlogPostStatus;
  is_featured: boolean;
  allow_comments: boolean;
  views_count: number;

  published_at: string | null;
  scheduled_at: string | null;

  /*
   * La respuesta de BlogPostResource agrupa
   * estos datos en objetos.
   */
  seo: BlogPostSeo;
  open_graph: BlogPostOpenGraph;

  category: BlogPostCategory | null;
  author: BlogPostAuthor | null;
  cover_media: BlogPostMedia | null;
  tags: BlogPostTag[];

  /*
   * Compatibilidad con posibles nombres utilizados
   * por BlogPostResource.
   */
  og_image_media?: BlogPostMedia | null;
  ogImageMedia?: BlogPostMedia | null;

  /*
   * Anuncios vinculados a la publicación.
   * En los listados puede venir únicamente ads_count.
   * En el detalle puede venir la colección ads completa.
   */
  ads_count?: number;
  ads?: BlogPostAd[];

  created_at: string | null;
  updated_at: string | null;
};

export type BlogPostListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  status?: BlogPostStatus;
  category_id?: number;
  is_featured?: boolean;
};

/*
 * El backend recibe los datos SEO y Open Graph
 * como campos planos.
 */
export type BlogPostPayload = {
  title: string;
  slug: string;

  excerpt: string | null;
  content: string | null;

  category_id: number | null;
  cover_media_id: number | null;
  tag_ids: number[];

  is_featured: boolean;
  allow_comments: boolean;

  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  canonical_url: string | null;

  robots_index: boolean;
  robots_follow: boolean;

  og_title: string | null;
  og_description: string | null;
  og_image_media_id: number | null;

  /*
   * Se guarda junto con la publicación.
   * Puede enviarse vacío para retirar todos
   * los bloques en una actualización.
   */
  ads?: BlogPostAdPayload[];
};

/*
 * UpdateBlogPostRequest permite actualizaciones parciales.
 * También acepta BlogPostPayload completo.
 */
export type BlogPostUpdatePayload =
  Partial<BlogPostPayload>;

export type BlogPostSchedulePayload = {
  scheduled_at: string;
};

/*
|--------------------------------------------------------------------------
| ANUNCIOS DE PUBLICACIONES
|--------------------------------------------------------------------------
*/

export type BlogPostAdStatus =
  | "active"
  | "inactive";

/*
 * Cada anuncio utiliza exactamente tres imágenes.
 * El backend también debe validar esta regla con size:3.
 */
export type BlogPostAdMediaIds = [
  number,
  number,
  number,
];

export type BlogPostAdImage = {
  id: number;
  media_id: number;
  sort_order: number;
  media: BlogMedia | null;
};

export type BlogPostAd = {
  id: number;
  blog_post_id: number;

  title: string;
  description: string | null;

  link_url: string;
  link_text: string;

  status: BlogPostAdStatus;
  sort_order: number;

  /*
   * Facilita precargar el selector de imágenes
   * dentro del formulario de edición.
   */
  media_ids: number[];
  images_count: number;
  images: BlogPostAdImage[];

  created_at: string | null;
  updated_at: string | null;
};

export type BlogPostAdPayload = {
  /*
   * Solo se envía al actualizar un anuncio
   * que ya existe en la base de datos.
   */
  id?: number;

  title: string;
  description: string | null;

  link_url: string;
  link_text: string;

  status: BlogPostAdStatus;

  /*
   * Puede omitirse al crear para que el backend
   * asigne automáticamente el siguiente orden.
   */
  sort_order?: number | null;

  /*
   * Debe contener exactamente tres IDs distintos,
   * todos pertenecientes al mismo blog.
   */
  media_ids: BlogPostAdMediaIds;
};

/*
 * UpdateBlogPostAdRequest reutiliza las mismas
 * reglas que StoreBlogPostAdRequest.
 */
export type BlogPostAdUpdatePayload =
  BlogPostAdPayload;

/*
|--------------------------------------------------------------------------
| PAGINACIÓN
|--------------------------------------------------------------------------
*/

export type PaginationLink = {
  url: string | null;
  label: string;
  active: boolean;
};

export type PaginationMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  links: PaginationLink[];
  path: string;
  per_page: number;
  to: number | null;
  total: number;
};

export type PaginatedResponse<T> = {
  data: T[];

  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };

  meta: PaginationMeta;
};

/*
|--------------------------------------------------------------------------
| CATEGORÍAS
|--------------------------------------------------------------------------
*/

export type BlogCategoryParent = {
  id: number;
  name: string;
  slug: string;
};

export type BlogCategoryTotals = {
  posts: number;
  children: number;
};

export type BlogCategoryStatus =
  | "active"
  | "inactive";

export type BlogCategory = {
  id: number;
  blog_id: number;
  parent_id: number | null;

  name: string;
  slug: string;
  description: string | null;
  status: BlogCategoryStatus;
  sort_order: number;

  parent: BlogCategoryParent | null;
  totals: BlogCategoryTotals;

  created_at: string | null;
  updated_at: string | null;
};

export type BlogCategoryListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  status?: BlogCategoryStatus;
};

export type BlogCategoryPayload = {
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  status: BlogCategoryStatus;
  sort_order: number;
};

/*
|--------------------------------------------------------------------------
| ETIQUETAS
|--------------------------------------------------------------------------
*/

export type BlogTagTotals = {
  posts: number;
};

export type BlogTag = {
  id: number;
  blog_id: number;

  name: string;
  slug: string;

  totals: BlogTagTotals;

  created_at: string | null;
  updated_at: string | null;
};

export type BlogTagListParams = {
  page?: number;
  per_page?: number;
  search?: string;
};

export type BlogTagPayload = {
  name: string;
  slug: string;
};

/*
|--------------------------------------------------------------------------
| MULTIMEDIA
|--------------------------------------------------------------------------
*/

export type BlogMediaUploader = {
  id: number;
  name: string;
  email: string;
};

export type BlogMediaUsage = {
  cover_posts: number | null;
  open_graph_posts: number | null;
};

export type BlogMedia = {
  id: number;
  blog_id: number;
  uploaded_by: number;

  disk: string;
  path: string;
  url: string;

  filename: string;
  original_filename: string;
  mime_type: string;

  size: number;
  size_kb: string;

  width: number | null;
  height: number | null;

  alt_text: string | null;
  caption: string | null;

  uploader: BlogMediaUploader | null;
  usage: BlogMediaUsage;

  created_at: string | null;
  updated_at: string | null;
};

export type BlogMediaListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  mime_type?: string;
};

export type BlogMediaUpdatePayload = {
  alt_text: string | null;
  caption: string | null;
};

/*
|--------------------------------------------------------------------------
| RESPUESTAS COMUNES
|--------------------------------------------------------------------------
*/

export type ApiMessageResponse = {
  message: string;
};

export type ApiResourceResponse<T> = {
  message?: string;
  data: T;
};

export type ApiCollectionResponse<T> = {
  data: T[];
};

/*
|--------------------------------------------------------------------------
| VALIDACIÓN LOCAL DE ANUNCIOS
|--------------------------------------------------------------------------
*/

function assertHttpUrl(
  value: string,
  fieldName: string
): void {
  try {
    const parsedUrl = new URL(value.trim());

    if (
      parsedUrl.protocol !== "http:" &&
      parsedUrl.protocol !== "https:"
    ) {
      throw new Error();
    }
  } catch {
    throw new Error(
      `${fieldName} debe ser una URL HTTP o HTTPS válida.`
    );
  }
}

function assertPostAdPayload(
  payload: BlogPostAdPayload,
  index?: number
): void {
  const prefix =
    typeof index === "number"
      ? `Anuncio ${index + 1}: `
      : "";

  if (!payload.title.trim()) {
    throw new Error(
      `${prefix}el título es obligatorio.`
    );
  }

  if (!payload.link_url.trim()) {
    throw new Error(
      `${prefix}la URL de destino es obligatoria.`
    );
  }

  assertHttpUrl(
    payload.link_url,
    `${prefix}la URL de destino`
  );

  if (!payload.link_text.trim()) {
    throw new Error(
      `${prefix}el texto del vínculo es obligatorio.`
    );
  }

  if (
    !Array.isArray(payload.media_ids) ||
    payload.media_ids.length !== 3
  ) {
    throw new Error(
      `${prefix}debe seleccionar exactamente tres imágenes.`
    );
  }

  const normalizedIds =
    payload.media_ids.map(Number);

  if (
    normalizedIds.some(
      (mediaId) =>
        !Number.isInteger(mediaId) ||
        mediaId <= 0
    )
  ) {
    throw new Error(
      `${prefix}las imágenes seleccionadas no son válidas.`
    );
  }

  if (
    new Set(normalizedIds).size !== 3
  ) {
    throw new Error(
      `${prefix}las tres imágenes deben ser diferentes.`
    );
  }

  if (
    payload.sort_order !== undefined &&
    payload.sort_order !== null &&
    (
      !Number.isInteger(payload.sort_order) ||
      payload.sort_order < 0
    )
  ) {
    throw new Error(
      `${prefix}el orden debe ser un entero igual o mayor que cero.`
    );
  }
}

function assertPostAdsPayload(
  ads: BlogPostAdPayload[] | undefined
): void {
  if (!ads) {
    return;
  }

  ads.forEach(
    (ad, index) =>
      assertPostAdPayload(ad, index)
  );
}

/*
|--------------------------------------------------------------------------
| RUTAS
|--------------------------------------------------------------------------
*/

const blogsRoute = (
  systemId: number | string
): string =>
  `/superadmin/systems/${systemId}/blogs`;

const blogRoute = (
  systemId: number | string,
  blogId: number | string
): string =>
  `${blogsRoute(systemId)}/${blogId}`;

const postsRoute = (
  systemId: number | string,
  blogId: number | string
): string =>
  `${blogRoute(systemId, blogId)}/posts`;

const postRoute = (
  systemId: number | string,
  blogId: number | string,
  postId: number | string
): string =>
  `${postsRoute(systemId, blogId)}/${postId}`;

const postAdsRoute = (
  systemId: number | string,
  blogId: number | string,
  postId: number | string
): string =>
  `${postRoute(systemId, blogId, postId)}/ads`;

const postAdRoute = (
  systemId: number | string,
  blogId: number | string,
  postId: number | string,
  adId: number | string
): string =>
  `${postAdsRoute(systemId, blogId, postId)}/${adId}`;

const categoriesRoute = (
  systemId: number | string,
  blogId: number | string
): string =>
  `${blogRoute(systemId, blogId)}/categories`;

const tagsRoute = (
  systemId: number | string,
  blogId: number | string
): string =>
  `${blogRoute(systemId, blogId)}/tags`;

const mediaRoute = (
  systemId: number | string,
  blogId: number | string
): string =>
  `${blogRoute(systemId, blogId)}/media`;

  
/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
*/

export const blogApi = {
  /*
  |--------------------------------------------------------------------------
  | BLOGS
  |--------------------------------------------------------------------------
  */

  list: (
    systemId: number | string,
    params?: BlogListParams
  ) =>
    axiosClient.get<PaginatedResponse<Blog>>(
      blogsRoute(systemId),
      { params }
    ),

  get: (
    systemId: number | string,
    blogId: number | string
  ) =>
    axiosClient.get<{ data: Blog }>(
      blogRoute(systemId, blogId)
    ),

  /*
  |--------------------------------------------------------------------------
  | PUBLICACIONES
  |--------------------------------------------------------------------------
  */

  posts: (
    systemId: number | string,
    blogId: number | string,
    params?: BlogPostListParams
  ) =>
    axiosClient.get<
      PaginatedResponse<BlogPost>
    >(
      postsRoute(systemId, blogId),
      { params }
    ),

  post: (
    systemId: number | string,
    blogId: number | string,
    postId: number | string
  ) =>
    axiosClient.get<{
      data: BlogPost;
    }>(
      `${postsRoute(
        systemId,
        blogId
      )}/${postId}`
    ),

  createPost: (
    systemId: number | string,
    blogId: number | string,
    payload: BlogPostPayload
  ) => {
    assertPostAdsPayload(payload.ads);

    return axiosClient.post<
      ApiResourceResponse<BlogPost>
    >(
      postsRoute(systemId, blogId),
      payload
    );
  },

  updatePost: (
    systemId: number | string,
    blogId: number | string,
    postId: number | string,
    payload: BlogPostUpdatePayload
  ) => {
    assertPostAdsPayload(payload.ads);

    return axiosClient.put<
      ApiResourceResponse<BlogPost>
    >(
      `${postsRoute(
        systemId,
        blogId
      )}/${postId}`,
      payload
    );
  },

  deletePost: (
    systemId: number | string,
    blogId: number | string,
    postId: number | string
  ) =>
    axiosClient.delete<ApiMessageResponse>(
      `${postsRoute(
        systemId,
        blogId
      )}/${postId}`
    ),

  publishPost: (
    systemId: number | string,
    blogId: number | string,
    postId: number | string
  ) =>
    axiosClient.post<
      ApiResourceResponse<BlogPost>
    >(
      `${postsRoute(
        systemId,
        blogId
      )}/${postId}/publish`
    ),

  schedulePost: (
    systemId: number | string,
    blogId: number | string,
    postId: number | string,
    payload: BlogPostSchedulePayload
  ) =>
    axiosClient.post<
      ApiResourceResponse<BlogPost>
    >(
      `${postsRoute(
        systemId,
        blogId
      )}/${postId}/schedule`,
      payload
    ),

  archivePost: (
    systemId: number | string,
    blogId: number | string,
    postId: number | string
  ) =>
    axiosClient.post<
      ApiResourceResponse<BlogPost>
    >(
      `${postRoute(
        systemId,
        blogId,
        postId
      )}/archive`
    ),

  /*
  |--------------------------------------------------------------------------
  | ANUNCIOS DE PUBLICACIONES
  |--------------------------------------------------------------------------
  */

  postAds: (
    systemId: number | string,
    blogId: number | string,
    postId: number | string
  ) =>
    axiosClient.get<
      ApiCollectionResponse<BlogPostAd>
    >(
      postAdsRoute(
        systemId,
        blogId,
        postId
      )
    ),

  postAd: (
    systemId: number | string,
    blogId: number | string,
    postId: number | string,
    adId: number | string
  ) =>
    axiosClient.get<
      ApiResourceResponse<BlogPostAd>
    >(
      postAdRoute(
        systemId,
        blogId,
        postId,
        adId
      )
    ),

  createPostAd: (
    systemId: number | string,
    blogId: number | string,
    postId: number | string,
    payload: BlogPostAdPayload
  ) => {
    assertPostAdPayload(payload);

    return axiosClient.post<
      ApiResourceResponse<BlogPostAd>
    >(
      postAdsRoute(
        systemId,
        blogId,
        postId
      ),
      payload
    );
  },

  updatePostAd: (
    systemId: number | string,
    blogId: number | string,
    postId: number | string,
    adId: number | string,
    payload: BlogPostAdUpdatePayload
  ) => {
    assertPostAdPayload(payload);

    return axiosClient.put<
      ApiResourceResponse<BlogPostAd>
    >(
      postAdRoute(
        systemId,
        blogId,
        postId,
        adId
      ),
      payload
    );
  },

  deletePostAd: (
    systemId: number | string,
    blogId: number | string,
    postId: number | string,
    adId: number | string
  ) =>
    axiosClient.delete<ApiMessageResponse>(
      postAdRoute(
        systemId,
        blogId,
        postId,
        adId
      )
    ),

  /*
  |--------------------------------------------------------------------------
  | CATEGORÍAS
  |--------------------------------------------------------------------------
  */

  categories: (
    systemId: number | string,
    blogId: number | string,
    params?: BlogCategoryListParams
  ) =>
    axiosClient.get<
      PaginatedResponse<BlogCategory>
    >(
      categoriesRoute(
        systemId,
        blogId
      ),
      { params }
    ),

  createCategory: (
    systemId: number | string,
    blogId: number | string,
    payload: BlogCategoryPayload
  ) =>
    axiosClient.post<
      ApiResourceResponse<BlogCategory>
    >(
      categoriesRoute(
        systemId,
        blogId
      ),
      payload
    ),

  updateCategory: (
    systemId: number | string,
    blogId: number | string,
    categoryId: number | string,
    payload: BlogCategoryPayload
  ) =>
    axiosClient.put<
      ApiResourceResponse<BlogCategory>
    >(
      `${categoriesRoute(
        systemId,
        blogId
      )}/${categoryId}`,
      payload
    ),

  deleteCategory: (
    systemId: number | string,
    blogId: number | string,
    categoryId: number | string
  ) =>
    axiosClient.delete<ApiMessageResponse>(
      `${categoriesRoute(
        systemId,
        blogId
      )}/${categoryId}`
    ),

  /*
  |--------------------------------------------------------------------------
  | ETIQUETAS
  |--------------------------------------------------------------------------
  */

  tags: (
    systemId: number | string,
    blogId: number | string,
    params?: BlogTagListParams
  ) =>
    axiosClient.get<
      PaginatedResponse<BlogTag>
    >(
      tagsRoute(systemId, blogId),
      { params }
    ),

  createTag: (
    systemId: number | string,
    blogId: number | string,
    payload: BlogTagPayload
  ) =>
    axiosClient.post<
      ApiResourceResponse<BlogTag>
    >(
      tagsRoute(systemId, blogId),
      payload
    ),

  updateTag: (
    systemId: number | string,
    blogId: number | string,
    tagId: number | string,
    payload: BlogTagPayload
  ) =>
    axiosClient.put<
      ApiResourceResponse<BlogTag>
    >(
      `${tagsRoute(
        systemId,
        blogId
      )}/${tagId}`,
      payload
    ),

  deleteTag: (
    systemId: number | string,
    blogId: number | string,
    tagId: number | string
  ) =>
    axiosClient.delete<ApiMessageResponse>(
      `${tagsRoute(
        systemId,
        blogId
      )}/${tagId}`
    ),

  /*
  |--------------------------------------------------------------------------
  | MULTIMEDIA
  |--------------------------------------------------------------------------
  */

  media: (
    systemId: number | string,
    blogId: number | string,
    params?: BlogMediaListParams
  ) =>
    axiosClient.get<
      PaginatedResponse<BlogMedia>
    >(
      mediaRoute(systemId, blogId),
      { params }
    ),

  mediaItem: (
    systemId: number | string,
    blogId: number | string,
    mediaId: number | string
  ) =>
    axiosClient.get<{
      data: BlogMedia;
    }>(
      `${mediaRoute(
        systemId,
        blogId
      )}/${mediaId}`
    ),

  createMedia: (
    systemId: number | string,
    blogId: number | string,
    payload: FormData
  ) =>
    axiosClient.post<
      ApiResourceResponse<BlogMedia>
    >(
      mediaRoute(systemId, blogId),
      payload
    ),

  updateMedia: (
    systemId: number | string,
    blogId: number | string,
    mediaId: number | string,
    payload: BlogMediaUpdatePayload
  ) =>
    axiosClient.put<
      ApiResourceResponse<BlogMedia>
    >(
      `${mediaRoute(
        systemId,
        blogId
      )}/${mediaId}`,
      payload
    ),

  deleteMedia: (
    systemId: number | string,
    blogId: number | string,
    mediaId: number | string
  ) =>
    axiosClient.delete<ApiMessageResponse>(
      `${mediaRoute(
        systemId,
        blogId
      )}/${mediaId}`
    ),
};