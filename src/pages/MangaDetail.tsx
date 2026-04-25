import { useParams, Link } from "react-router-dom";
import { useMangaDetail, useMangaChapters } from "@/hooks/useManga";
import { getCoverUrl, getCoverRel, getTitle } from "@/lib/mangadex";
import Navigation from "@/components/Navigation";
import { ArrowLeft, BookOpen, User, Star, Calendar, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MangaDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: mangaData, isLoading } = useMangaDetail(id!);
  const { data: chaptersData } = useMangaChapters(id!);

  if (isLoading) return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-6 pt-32 pb-20 animate-pulse">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-80 aspect-[2/3] rounded-[2.5rem] bg-white/5 border border-white/5 flex-shrink-0" />
          <div className="flex-1 space-y-6">
            <div className="h-4 bg-white/5 rounded w-24" />
            <div className="h-20 bg-white/5 rounded w-3/4" />
            <div className="h-6 bg-white/5 rounded w-1/3" />
            <div className="h-40 bg-white/5 rounded" />
          </div>
        </div>
      </div>
    </div>
  );

  if (!mangaData) return null;

  const manga = mangaData.data;
  const title = getTitle(manga);
  const cover = getCoverRel(manga);
  const coverUrl = cover ? getCoverUrl(manga.id, cover.attributes.fileName, "") : "https://via.placeholder.com/512x768?text=No+Cover";
  const description = manga.attributes.description?.en || "No archives found for this realm's lore.";
  const tags = manga.attributes.tags;
  const author = manga.relationships.find((r: any) => r.type === "author");
  const chapters = chaptersData?.data ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img 
            src={coverUrl} 
            alt={title} 
            className="w-full h-full object-cover blur-[100px] opacity-20 scale-125"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        </div>

        <div className="container mx-auto px-6">
          <Link to="/manga" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-12 group">
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold uppercase tracking-widest text-xs">Return to Library</span>
          </Link>

          <div className="flex flex-col md:flex-row gap-12">
            <div className="w-full md:w-80 aspect-[2/3] rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 flex-shrink-0 group relative">
              <img 
                src={coverUrl} 
                alt={title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className={`text-[10px] px-3 py-1.5 rounded-xl font-black uppercase tracking-widest backdrop-blur-xl border ${
                  manga.attributes.status === "ongoing" 
                    ? "bg-green-500/20 text-green-400 border-green-500/20" 
                    : "bg-blue-500/20 text-blue-400 border-blue-500/20"
                }`}>
                  {manga.attributes.status}
                </span>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 mb-6">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Story Spotlight</span>
              </div>
              
              <h1 className="text-4xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 mb-8">
                {author && (
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Created by</p>
                      <p className="text-sm font-bold">{author.attributes?.name}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Updated</p>
                    <p className="text-sm font-bold">{new Date(manga.attributes.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {tags.map((tag: any) => (
                  <span key={tag.id} className="text-[10px] px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-muted-foreground font-black uppercase tracking-widest">
                    {tag.attributes.name.en}
                  </span>
                ))}
              </div>

              <div className="glass p-8 rounded-[2rem] border-white/5">
                <p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-wrap">
                  {description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chapters Section */}
      <section className="py-20 border-t border-white/5">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <BookOpen className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight">Available Chapters</h2>
                <p className="text-muted-foreground text-sm uppercase font-bold tracking-widest mt-1">
                  {chapters.length} Volumes in sequence
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            {chapters.length === 0 ? (
              <div className="py-32 text-center glass rounded-[3rem] border-white/5">
                <BookOpen className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground/50">The sequence is not yet translated.</h3>
                <p className="text-muted-foreground mt-2">Check back as the lore expands.</p>
              </div>
            ) : (
              chapters.slice(0, 100).map((ch: any) => (
                <a
                  key={ch.id}
                  href={`https://mangadex.org/chapter/${ch.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between p-6 rounded-3xl glass-card transition-all hover:bg-primary/5 hover:border-primary/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center font-black text-xs text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary group-hover:border-primary/20 transition-all">
                      {ch.attributes.chapter || "?"}
                    </div>
                    <div>
                      <p className="font-bold text-lg group-hover:text-primary transition-colors">
                        Chapter {ch.attributes.chapter || "?"}
                        {ch.attributes.title && <span className="text-muted-foreground font-medium"> — {ch.attributes.title}</span>}
                      </p>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                        {ch.relationships.find((r: any) => r.type === "scanlation_group")?.attributes?.name || "Independent"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="hidden sm:block text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      {new Date(ch.attributes.publishAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 text-center text-muted-foreground">
        <p>© 2024 AnimeEchoes. Philosophy in panels.</p>
      </footer>
    </div>
  );
}
