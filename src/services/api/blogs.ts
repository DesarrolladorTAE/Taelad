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
  cover_posts: number;
  open_graph_posts: number;
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
  ) =>
    axiosClient.post<
      ApiResourceResponse<BlogPost>
    >(
      postsRoute(systemId, blogId),
      payload
    ),

  updatePost: (
    systemId: number | string,
    blogId: number | string,
    postId: number | string,
    payload: BlogPostUpdatePayload
  ) =>
    axiosClient.put<
      ApiResourceResponse<BlogPost>
    >(
      `${postsRoute(
        systemId,
        blogId
      )}/${postId}`,
      payload
    ),

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
      `${postsRoute(
        systemId,
        blogId
      )}/${postId}/archive`
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