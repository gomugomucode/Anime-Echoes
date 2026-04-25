const BASE = "https://api.mangadex.org";
const COVER_BASE = "https://uploads.mangadex.org/covers";

export function getCoverUrl(mangaId: string, fileName: string, size: "256" | "512" | "" = "512") {
  return `${COVER_BASE}/${mangaId}/${fileName}${size ? `.${size}.jpg` : ""}`;
}

export function getTitle(manga: any): string {
  if (!manga?.attributes?.title) return "Unknown Title";
  const t = manga.attributes.title;
  return t.en || t["ja-ro"] || t.ja || Object.values(t)[0] || "Unknown Title";
}

export function getCoverRel(manga: any) {
  return manga?.relationships?.find((r: any) => r.type === "cover_art");
}

export async function fetchMangaList(params: {
  limit?: number;
  offset?: number;
  title?: string;
  tags?: string[];
  order?: Record<string, "asc" | "desc">;
}) {
  const { limit = 20, offset = 0, title, tags, order = { followedCount: "desc" } } = params;
  const url = new URL(`${BASE}/manga`);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));
  url.searchParams.append("includes[]", "cover_art");
  url.searchParams.append("includes[]", "author");
  url.searchParams.set("availableTranslatedLanguage[]", "en");
  url.searchParams.set("contentRating[]", "safe");
  url.searchParams.append("contentRating[]", "suggestive");

  if (title) url.searchParams.set("title", title);
  tags?.forEach(tag => url.searchParams.append("includedTags[]", tag));
  Object.entries(order).forEach(([k, v]) => url.searchParams.set(`order[${k}]`, v));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch manga list");
  return res.json();
}

export async function fetchMangaById(id: string) {
  const url = new URL(`${BASE}/manga/${id}`);
  url.searchParams.append("includes[]", "cover_art");
  url.searchParams.append("includes[]", "author");
  url.searchParams.append("includes[]", "artist");
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch manga");
  return res.json();
}

export async function fetchMangaChapters(id: string, limit = 100, offset = 0) {
  const url = new URL(`${BASE}/manga/${id}/feed`);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("translatedLanguage[]", "en");
  url.searchParams.set("order[chapter]", "asc");
  url.searchParams.append("includes[]", "scanlation_group");
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch chapters");
  return res.json();
}

export async function fetchMangaTags() {
  const res = await fetch(`${BASE}/manga/tag`);
  if (!res.ok) throw new Error("Failed to fetch tags");
  return res.json();
}
