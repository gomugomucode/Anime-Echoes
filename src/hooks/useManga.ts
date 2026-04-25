import { useQuery } from "@tanstack/react-query";
import {
  fetchMangaList,
  fetchMangaById,
  fetchMangaChapters,
  fetchMangaTags,
} from "@/lib/mangadex";

export function useMangaList(params: {
  limit?: number;
  offset?: number;
  title?: string;
  tags?: string[];
}) {
  return useQuery({
    queryKey: ["manga", "list", params],
    queryFn: () => fetchMangaList(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useMangaDetail(id: string) {
  return useQuery({
    queryKey: ["manga", id],
    queryFn: () => fetchMangaById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
}

export function useMangaChapters(id: string) {
  return useQuery({
    queryKey: ["manga", id, "chapters"],
    queryFn: () => fetchMangaChapters(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useMangaTags() {
  return useQuery({
    queryKey: ["manga", "tags"],
    queryFn: fetchMangaTags,
    staleTime: 1000 * 60 * 60,
  });
}
