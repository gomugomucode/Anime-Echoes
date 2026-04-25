import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { searchWaifuImages, fetchWaifuTags, type WaifuSearchParams } from "@/lib/waifu";

export function useWaifuImages(params: WaifuSearchParams) {
  return useQuery({
    queryKey: ["waifu", "images", params],
    queryFn: () => searchWaifuImages(params),
    staleTime: 1000 * 60 * 3,
  });
}

export function useInfiniteWaifuImages(params: Omit<WaifuSearchParams, "page">) {
  return useInfiniteQuery({
    queryKey: ["waifu", "infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      searchWaifuImages({ ...params, page: pageParam as number }),
    getNextPageParam: (last) =>
      last.hasNextPage ? last.pageNumber + 1 : undefined,
    initialPageParam: 1,
    staleTime: 1000 * 60 * 3,
  });
}

export function useWaifuTags() {
  return useQuery({
    queryKey: ["waifu", "tags"],
    queryFn: fetchWaifuTags,
    staleTime: 1000 * 60 * 60,
  });
}
