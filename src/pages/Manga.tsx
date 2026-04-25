import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useMangaList, useMangaTags } from "@/hooks/useManga";
import MangaCard from "@/components/manga/MangaCard";
import Navigation from "@/components/Navigation";
import { Search, Sparkles, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

export default function Manga() {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading, isError } = useMangaList({
    limit: 24,
    offset,
    title: debouncedSearch || undefined,
    tags: selectedTag ? [selectedTag] : undefined,
  });

  const { data: tagsData } = useMangaTags();
  const popularTags = tagsData?.data?.filter((t: any) =>
    ["Action", "Romance", "Fantasy", "Comedy", "Horror", "Sci-Fi", "Slice of Life", "Adventure", "Drama"].includes(t.attributes.name.en)
  ) ?? [];

  const manga = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary uppercase tracking-widest">Library</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
            Infinite <span className="text-gradient">Manga Realms</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
            Explore thousands of stories from across the multiverse. Powered by MangaDex.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="relative mb-8 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition-opacity" />
            <div className="relative glass p-2 rounded-[2rem] border-white/5 flex items-center">
              <Search className="ml-6 w-6 h-6 text-muted-foreground" />
              <Input
                placeholder="Search stories, authors, or worlds..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
                className="h-14 border-0 bg-transparent focus-visible:ring-0 text-lg md:text-xl px-6"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => { setSelectedTag(null); setOffset(0); }}
              className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                !selectedTag 
                  ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(147,51,234,0.4)]" 
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/5"
              }`}
            >
              All Realms
            </button>
            {popularTags.map((tag: any) => (
              <button
                key={tag.id}
                onClick={() => { setSelectedTag(tag.id); setOffset(0); }}
                className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                  selectedTag === tag.id 
                    ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(147,51,234,0.4)]" 
                    : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/5"
                }`}
              >
                {tag.attributes.name.en}
              </button>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-[2.5rem] bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-32 glass rounded-[3rem] border-white/5">
            <Sparkles className="w-12 h-12 text-destructive/20 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-destructive/50">Disruption in the flow.</h3>
            <p className="text-muted-foreground mt-2">The archives are temporarily unreachable. Try again soon.</p>
          </div>
        ) : manga.length === 0 ? (
            <div className="text-center py-32 glass rounded-[3rem] border-white/5">
              <Search className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground/50">Realm not found.</h3>
              <p className="text-muted-foreground mt-2">Try different search coordinates.</p>
            </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {manga.map((m: any) => <MangaCard key={m.id} manga={m} />)}
            </div>

            {/* Pagination */}
            <div className="flex flex-col items-center gap-6 mt-20">
              <div className="flex items-center gap-4">
                <button
                  disabled={offset === 0}
                  onClick={() => { setOffset(Math.max(0, offset - 24)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="p-4 rounded-2xl bg-white/5 border border-white/5 text-muted-foreground hover:text-primary hover:border-primary/20 transition-all disabled:opacity-20 group"
                >
                  <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </button>
                
                <div className="glass px-8 py-3 rounded-2xl border-white/5">
                  <span className="text-sm font-black tracking-widest text-primary">
                    {Math.floor(offset / 24) + 1} / {Math.ceil(total / 24)}
                  </span>
                </div>

                <button
                  disabled={offset + 24 >= total}
                  onClick={() => { setOffset(offset + 24); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="p-4 rounded-2xl bg-white/5 border border-white/5 text-muted-foreground hover:text-primary hover:border-primary/20 transition-all disabled:opacity-20 group"
                >
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
                Exhibiting {offset + 1}–{Math.min(offset + 24, total)} of {total.toLocaleString()} volumes
              </p>
            </div>
          </>
        )}
      </main>

      <footer className="py-12 border-t border-white/5 text-center text-muted-foreground">
        <p>© 2024 AnimeEchoes. Stories that resonate.</p>
      </footer>
    </div>
  );
}
