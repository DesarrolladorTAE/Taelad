import publicBlogClient from "./publicBlogClient";

export type PublicBlogOrder =
  | "latest"
  | "oldest"
  | "updated";

export interface PublicBlogSeo {
  title: string | null;
  description: string | null;
  keywords: string[];
  canonical_url: string | null;
  robots_index: boolean;
  robots_follow: boolean;
}

export interface PublicBlogBrand {
  name: string;
  slug: string;
  public_url: string | null;
  logo_url: string | null;
  primary_color: string | null;
}

export interface PublicBlog {
  name: string;
  slug: string;
  description: string | null;
  public_url: string | null;
  brand: PublicBlogBrand;
  seo: PublicBlogSeo;
}

export interface PublicBlogCategory {
  name: string;
  slug: string;
  description: string | null;
  url: string | null;
  posts_count?: number;
}

export interface PublicBlogTag {
  name: string;
  slug: string;
  url: string | null;
  posts_count?: number;
}

export interface PublicBlogAuthor {
  name: string;
}

export interface PublicBlogCover {
  url: string;
  alt_text?: string | null;
  title?: string | null;
}

export interface PublicBlogPost {
  title: string;
  slug: string;
  excerpt: string | null;
  url: string | null;
  cover: PublicBlogCover | null;
  category: PublicBlogCategory | null;
  tags: PublicBlogTag[];
  author: PublicBlogAuthor | null;
  is_featured: boolean;
  published_at: string | null;
  updated_at: string | null;
}

export interface PublicBlogOpenGraph {
  title: string | null;
  description: string | null;
  image: string | null;
  url: string | null;
  type: string;
}

export interface PublicBlogPostDetail
  extends PublicBlogPost {
  content: string;
  seo: PublicBlogSeo;
  open_graph: PublicBlogOpenGraph;
  structured_data: Record<string, unknown>;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  links: PaginationLink[];
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface ResourceResponse<T> {
  data: T;
}

export interface PublicBlogPostFilters {
  page?: number;
  per_page?: number;
  search?: string;
  category?: string;
  tag?: string;
  featured?: boolean;
  order?: PublicBlogOrder;
}

export interface CategoryPostsResponse
  extends PaginatedResponse<PublicBlogPost> {
  category: {
    name: string;
    slug: string;
    description: string | null;
  };
}

export interface TagPostsResponse
  extends PaginatedResponse<PublicBlogPost> {
  tag: {
    name: string;
    slug: string;
  };
}

const SYSTEM_SLUG = "clic-menu";
const BLOG_SLUG = "blog-clicmenu";

const BLOG_BASE_PATH =
  `/public/v1/${SYSTEM_SLUG}/blogs/${BLOG_SLUG}`;

type QueryParams = {
  [key: string]: string | number | boolean;
};

function cleanParams(
  filters: PublicBlogPostFilters
): QueryParams {
  const params: QueryParams = {};

  if (filters.page !== undefined) {
    params.page = filters.page;
  }

  if (filters.per_page !== undefined) {
    params.per_page = filters.per_page;
  }

  if (filters.search?.trim()) {
    params.search = filters.search.trim();
  }

  if (filters.category?.trim()) {
    params.category = filters.category.trim();
  }

  if (filters.tag?.trim()) {
    params.tag = filters.tag.trim();
  }

  if (filters.featured !== undefined) {
    params.featured = filters.featured;
  }

  if (filters.order !== undefined) {
    params.order = filters.order;
  }

  return params;
}

export async function getPublicBlog(): Promise<PublicBlog> {
  const response =
    await publicBlogClient.get<
      ResourceResponse<PublicBlog>
    >(BLOG_BASE_PATH);

  return response.data.data;
}

export async function getPublicBlogPosts(
  filters: PublicBlogPostFilters = {}
): Promise<PaginatedResponse<PublicBlogPost>> {
  const response =
    await publicBlogClient.get<
      PaginatedResponse<PublicBlogPost>
    >(`${BLOG_BASE_PATH}/posts`, {
      params: cleanParams(filters),
    });

  return response.data;
}

export async function getPublicBlogPost(
  postSlug: string
): Promise<PublicBlogPostDetail> {
  const slug = encodeURIComponent(
    postSlug.trim()
  );

  const response =
    await publicBlogClient.get<
      ResourceResponse<PublicBlogPostDetail>
    >(`${BLOG_BASE_PATH}/posts/${slug}`);

  return response.data.data;
}

export async function getPublicBlogCategories(
  search = ""
): Promise<PublicBlogCategory[]> {
  const params: QueryParams = {};

  if (search.trim()) {
    params.search = search.trim();
  }

  const response =
    await publicBlogClient.get<
      ResourceResponse<PublicBlogCategory[]>
    >(`${BLOG_BASE_PATH}/categories`, {
      params,
    });

  return response.data.data;
}

export async function getPublicBlogCategoryPosts(
  categorySlug: string,
  filters: PublicBlogPostFilters = {}
): Promise<CategoryPostsResponse> {
  const slug = encodeURIComponent(
    categorySlug.trim()
  );

  const response =
    await publicBlogClient.get<CategoryPostsResponse>(
      `${BLOG_BASE_PATH}/categories/${slug}/posts`,
      {
        params: cleanParams(filters),
      }
    );

  return response.data;
}

export async function getPublicBlogTags(
  search = ""
): Promise<PublicBlogTag[]> {
  const params: QueryParams = {};

  if (search.trim()) {
    params.search = search.trim();
  }

  const response =
    await publicBlogClient.get<
      ResourceResponse<PublicBlogTag[]>
    >(`${BLOG_BASE_PATH}/tags`, {
      params,
    });

  return response.data.data;
}

export async function getPublicBlogTagPosts(
  tagSlug: string,
  filters: PublicBlogPostFilters = {}
): Promise<TagPostsResponse> {
  const slug = encodeURIComponent(
    tagSlug.trim()
  );

  const response =
    await publicBlogClient.get<TagPostsResponse>(
      `${BLOG_BASE_PATH}/tags/${slug}/posts`,
      {
        params: cleanParams(filters),
      }
    );

  return response.data;
}