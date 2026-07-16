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

export interface PublicBlogPostDetail extends PublicBlogPost {
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

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: PaginationMeta;
}

export interface ApiResourceResponse<T> {
  data: T;
}

export interface PublicBlogPostFilters {
  page?: number;
  per_page?: number;
  search?: string;
  category?: string;
  tag?: string;
  featured?: boolean;
  order?: "latest" | "oldest" | "updated";
}