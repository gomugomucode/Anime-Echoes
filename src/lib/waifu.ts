const BASE = "https://api.waifu.im";

export interface WaifuImage {
  id: number;
  url: string;
  extension: string;
  dominantColor: string;
  source: string;
  width: number;
  height: number;
  byteSize: number;
  isNsfw: boolean;
  isAnimated: boolean;
  favorites: number;
  uploadedAt: string;
  tags: Array<{ id: number; name: string; slug: string; description: string }>;
  artists: Array<{ id: number; name: string; pixiv: string | null; twitter: string | null }>;
}

export interface WaifuResponse {
  items: WaifuImage[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface WaifuTag {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export interface WaifuSearchParams {
  includedTags?: string[];
  excludedTags?: string[];
  isNsfw?: "False" | "True" | "All";
  orientation?: "LANDSCAPE" | "PORTRAIT";
  width?: string;     // e.g. ">=1920"
  height?: string;    // e.g. ">=1080"
  pageSize?: number;
  page?: number;
  orderBy?: "FAVORITES" | "UPLOADED_AT" | "RANDOM";
  order?: "ASC" | "DESC";
}

export async function searchWaifuImages(params: WaifuSearchParams = {}): Promise<WaifuResponse> {
  const {
    includedTags = [],
    excludedTags = [],
    isNsfw = "False",
    orientation,
    width,
    height,
    pageSize = 32,
    page = 1,
    orderBy = "RANDOM",
    order = "DESC",
  } = params;

  const url = new URL(`${BASE}/images`);
  includedTags.forEach(t => url.searchParams.append("IncludedTags", t));
  excludedTags.forEach(t => url.searchParams.append("ExcludedTags", t));
  url.searchParams.set("IsNsfw", isNsfw);
  url.searchParams.set("PageSize", String(pageSize));
  url.searchParams.set("Page", String(page));
  url.searchParams.set("OrderBy", orderBy);
  url.searchParams.set("Order", order);
  if (orientation) url.searchParams.set("Orientation", orientation);
  if (width) url.searchParams.set("Width", width);
  if (height) url.searchParams.set("Height", height);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Waifu.im fetch failed");
  return res.json();
}

export async function fetchWaifuTags(): Promise<{ tags: WaifuTag[] }> {
  const res = await fetch(`${BASE}/tags`);
  if (!res.ok) throw new Error("Failed to fetch tags");
  return res.json();
}
