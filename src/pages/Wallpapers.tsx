import { useState, useEffect, useRef } from "react";
import { useInfiniteWaifuImages, useWaifuTags } from "@/hooks/useWaifu";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/Navigation";
import { Search, Sparkles, Image as ImageIcon, Filter, LayoutGrid, Zap, Loader2, RefreshCw, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import WallpaperCard from "@/components/wallpapers/WallpaperCard";
import type { WaifuSearchParams } from "@/lib/waifu";
import { Button } from "@/components/ui/button";

const ORDER_OPTIONS = [
  { label: "Random",    value: "RANDOM"      as const },
  { label: "Popular",   value: "FAVORITES"   as const },
  { label: "Newest",    value: "UPLOADED_AT" as const },
];

const ORIENTATION_OPTIONS = [
  { label: "All Vibes",  value: undefined         },
  { label: "Landscape", value: "LANDSCAPE" as const },
  { label: "Portrait",  value: "PORTRAIT"  as const },
];

export default function Wallpapers() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [orderBy, setOrderBy] = useState<WaifuSearchParams["orderBy"]>("RANDOM");
  const [orientation, setOrientation] = useState<WaifuSearchParams["orientation"]>(undefined);
  const [tagSearch, setTagSearch] = useState("");
  const loaderRef = useRef<HTMLDivElement>(null);

  const params: Omit<WaifuSearchParams, "page"> = {
    includedTags: selectedTags.length > 0 ? selectedTags.map(t => t.trim().toLowerCase()) : undefined,
    isNsfw: "False",
    orderBy,
    orientation,
    pageSize: 32,
  };

  const {
    data, fetchNextPage, hasNextPage,
    isFetchingNextPage, isLoading, isError, refetch,
  } = useInfiniteWaifuImages(params);

  const { data: tagsData } = useWaifuTags();
  const allTags = tagsData?.tags?.filter(t =>
    !["hentai","ass","ecchi","oppai","ero","bra-panting","panties","naked-cape","nipples","pussy","side-oppai","thighhighs"].includes(t.slug)
  ) ?? [];

  const filteredTags = tagSearch
    ? allTags.filter(t => t.name.toLowerCase().includes(tagSearch.toLowerCase()))
    : allTags;

  // Infinite scroll
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting && hasNextPage) fetchNextPage(); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  const allImages = data?.pages.flatMap(p => p.items) ?? [];
  const uniqueImages = Array.from(new Map(allImages.map(img => [img.id, img])).values());

  const toggleTag = (slug: string) => {
    setSelectedTags(prev =>
      prev.includes(slug) ? prev.filter(t => t !== slug) : [...prev, slug]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-6 pt-32 pb-20">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary uppercase tracking-widest">Masterpiece Gallery</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter leading-tight">
            Curated <br /><span className="text-gradient">Visual Resonance</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
            Exquisite anime illustrations synchronized from the Waifu.im network.
          </p>
        </div>

        {/* Control Center */}
        <div className="max-w-6xl mx-auto mb-16 space-y-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Tag Search & Selection */}
            <div className="relative flex-1 group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-3xl blur opacity-25 group-hover:opacity-50 transition-all" />
              <div className="relative glass p-1.5 rounded-3xl border-white/5 flex items-center">
                <Search className="ml-6 w-6 h-6 text-muted-foreground" />
                <Input
                  placeholder="Filter by tags (e.g. Raiden Shogun, Maid...)"
                  value={tagSearch}
                  onChange={e => setTagSearch(e.target.value)}
                  className="h-14 border-0 bg-transparent focus-visible:ring-0 text-lg px-6"
                />
                {selectedTags.length > 0 && (
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedTags([])}
                    className="mr-4 text-xs font-black uppercase tracking-widest hover:bg-destructive/10 hover:text-destructive transition-all"
                  >
                    Clear {selectedTags.length}
                  </Button>
                )}
              </div>
            </div>

            {/* Refresh Button */}
            <Button
              onClick={() => refetch()}
              className="h-[70px] rounded-3xl px-8 bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
            >
              <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            </Button>
          </div>

          {/* Active Tags / Suggestions */}
          <div className="flex flex-wrap gap-2 px-4 justify-center">
            {filteredTags.slice(0, 20).map(tag => (
              <button
                key={tag.slug}
                onClick={() => toggleTag(tag.slug)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  selectedTags.includes(tag.slug)
                    ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(147,51,234,0.3)]" 
                    : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/5"
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>

          {/* Secondary Filters */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mr-2 flex items-center gap-2">
                <Filter className="w-3 h-3" /> Sorting:
              </span>
              <div className="flex flex-wrap gap-2">
                {ORDER_OPTIONS.map(o => (
                  <button
                    key={o.value}
                    onClick={() => setOrderBy(o.value)}
                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      orderBy === o.value 
                        ? "bg-primary/20 text-primary border border-primary/20" 
                        : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/5"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mr-2 flex items-center gap-2">
                <Zap className="w-3 h-3" /> Vibes:
              </span>
              <div className="flex flex-wrap gap-2">
                {ORIENTATION_OPTIONS.map(o => (
                  <button
                    key={String(o.value)}
                    onClick={() => setOrientation(o.value)}
                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      orientation === o.value 
                        ? "bg-primary/20 text-primary border border-primary/20" 
                        : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/5"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        {isLoading && (
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-6">
            {Array.from({ length: 24 }).map((_, i) => (
              <div 
                key={i} 
                className="mb-6 rounded-[2.5rem] bg-white/5 animate-pulse border border-white/5"
                style={{ height: `${200 + (i % 4) * 100}px` }} 
              />
            ))}
          </div>
        )}

        {isError && (
          <div className="text-center py-32 glass rounded-[3rem] border-white/5">
            <X className="w-12 h-12 text-destructive/20 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-destructive/50">Frequency Jammed.</h3>
            <p className="text-muted-foreground mt-2">Could not synchronize with Waifu.im. Try refreshing the link.</p>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-6">
              {uniqueImages.map(img => (
                <div key={img.id} className="mb-6 break-inside-avoid animate-fade-in">
                  <WallpaperCard image={img} />
                </div>
              ))}
            </div>

            {allImages.length === 0 && (
              <div className="text-center py-32 glass rounded-[3rem] border-white/5">
                <Search className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground/50">Zero signals detected.</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your filters or search tags.</p>
              </div>
            )}

            {/* Pagination Trigger */}
            <div ref={loaderRef} className="py-20 flex flex-col items-center gap-6">
              {isFetchingNextPage ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] animate-pulse">Downloading Data...</p>
                </div>
              ) : hasNextPage ? (
                <div className="h-20" /> 
              ) : allImages.length > 0 && (
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">End of Archive</div>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="py-12 border-t border-white/5 text-center text-muted-foreground">
        <p>© 2024 AnimeEchoes. Curated visual aesthetics.</p>
      </footer>
    </div>
  );
}
