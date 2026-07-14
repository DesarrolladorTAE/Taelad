import axiosClient from "../axiosClient";

export type BlogStatus = "active" | "inactive";

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
  path: string;
  url: string;
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
  content: string;

  status: string;
  is_featured: boolean;
  allow_comments: boolean;
  views_count: number;

  published_at: string | null;
  scheduled_at: string | null;

  seo: BlogPostSeo;
  open_graph: BlogPostOpenGraph;

  category: BlogPostCategory | null;
  author: BlogPostAuthor | null;
  cover_media: BlogPostMedia | null;
  tags: BlogPostTag[];

  created_at: string | null;
  updated_at: string | null;
};


export type BlogPostListParams = {
  page?: number;
  per_page?: number;
};

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

export type BlogListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  status?: BlogStatus | "";
};
export type BlogCategoryParent = {
  id: number;
  name: string;
  slug: string;
};

export type BlogCategoryTotals = {
  posts: number;
  children: number;
};

export type BlogCategory = {
  id: number;
  blog_id: number;
  parent_id: number | null;

  name: string;
  slug: string;
  description: string | null;
  status: "active" | "inactive";
  sort_order: number;

  parent: BlogCategoryParent | null;
  totals: BlogCategoryTotals;

  created_at: string | null;
  updated_at: string | null;
};

export type BlogCategoryListParams = {
  page?: number;
  per_page?: number;
};
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
};
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
export type BlogTagPayload = {
  name: string;
  slug: string;
};
export type BlogCategoryPayload = {
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  status: "active" | "inactive";
  sort_order: number;
};

const blogsRoute = (systemId: number | string) =>
  `/superadmin/systems/${systemId}/blogs`;

export const blogApi = {
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
      `${blogsRoute(systemId)}/${blogId}`
    ),

  posts: (
  systemId: number | string,
  blogId: number | string,
  params?: BlogPostListParams
) =>
  axiosClient.get<PaginatedResponse<BlogPost>>(
    `${blogsRoute(systemId)}/${blogId}/posts`,
    { params }
  ),
  

 categories: (
  systemId: number | string,
  blogId: number | string,
  params?: BlogCategoryListParams
) =>
  axiosClient.get<PaginatedResponse<BlogCategory>>(
    `${blogsRoute(systemId)}/${blogId}/categories`,
    { params }
  ),

createCategory: (
  systemId: number | string,
  blogId: number | string,
  payload: BlogCategoryPayload
) =>
  axiosClient.post<{
    data: BlogCategory;
    message?: string;
  }>(
    `${blogsRoute(systemId)}/${blogId}/categories`,
    payload
  ),

updateCategory: (
  systemId: number | string,
  blogId: number | string,
  categoryId: number | string,
  payload: BlogCategoryPayload
) =>
  axiosClient.put<{
    data: BlogCategory;
    message?: string;
  }>(
    `${blogsRoute(systemId)}/${blogId}/categories/${categoryId}`,
    payload
  ),

deleteCategory: (
  systemId: number | string,
  blogId: number | string,
  categoryId: number | string
) =>
  axiosClient.delete<{ message?: string }>(
    `${blogsRoute(systemId)}/${blogId}/categories/${categoryId}`
  ),

  tags: (
  systemId: number | string,
  blogId: number | string,
  params?: BlogTagListParams
) =>
  axiosClient.get<PaginatedResponse<BlogTag>>(
    `${blogsRoute(systemId)}/${blogId}/tags`,
    { params }
  ),

createTag: (
  systemId: number | string,
  blogId: number | string,
  payload: BlogTagPayload
) =>
  axiosClient.post<{ data: BlogTag; message?: string }>(
    `${blogsRoute(systemId)}/${blogId}/tags`,
    payload
  ),

updateTag: (
  systemId: number | string,
  blogId: number | string,
  tagId: number | string,
  payload: BlogTagPayload
) =>
  axiosClient.put<{ data: BlogTag; message?: string }>(
    `${blogsRoute(systemId)}/${blogId}/tags/${tagId}`,
    payload
  ),

deleteTag: (
  systemId: number | string,
  blogId: number | string,
  tagId: number | string
) =>
  axiosClient.delete<{ message?: string }>(
    `${blogsRoute(systemId)}/${blogId}/tags/${tagId}`
  ),
   
  media: (
  systemId: number | string,
  blogId: number | string,
  params?: BlogMediaListParams
) =>
  axiosClient.get<PaginatedResponse<BlogMedia>>(
    `${blogsRoute(systemId)}/${blogId}/media`,
    { params }
  ),

createMedia: (
  systemId: number | string,
  blogId: number | string,
  payload: FormData
) =>
  axiosClient.post<{
    message: string;
    data: BlogMedia;
  }>(
    `${blogsRoute(systemId)}/${blogId}/media`,
    payload
  ),

updateMedia: (
  systemId: number | string,
  blogId: number | string,
  mediaId: number | string,
  payload: BlogMediaUpdatePayload
) =>
  axiosClient.put<{
    message: string;
    data: BlogMedia;
  }>(
    `${blogsRoute(systemId)}/${blogId}/media/${mediaId}`,
    payload
  ),

deleteMedia: (
  systemId: number | string,
  blogId: number | string,
  mediaId: number | string
) =>
  axiosClient.delete<{
    message: string;
  }>(
    `${blogsRoute(systemId)}/${blogId}/media/${mediaId}`
  ),
};