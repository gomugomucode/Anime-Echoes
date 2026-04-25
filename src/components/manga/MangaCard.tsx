import { Link } from "react-router-dom";
import { getCoverUrl, getCoverRel, getTitle } from "@/lib/mangadex";
import { Sparkles } from "lucide-react";

export default function MangaCard({ manga }: { manga: any }) {
  const cover = getCoverRel(manga);
  const coverUrl = cover
    ? getCoverUrl(manga.id, cover.attributes.fileName, "256")
    : "https://via.placeholder.com/256x384?text=No+Cover";
  const title = getTitle(manga);
  const status = manga.attributes.status;
  const tags = manga.attributes.tags.slice(0, 2);

  return (
    <Link 
      to={`/manga/${manga.id}`} 
      className="group relative block rounded-3xl overflow-hidden glass-card hover:border-primary/50 transition-all duration-500 hover:-translate-y-2"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={coverUrl}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="absolute top-4 right-4">
          <span className={`text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest backdrop-blur-md border ${
            status === "ongoing"
              ? "bg-green-500/10 text-green-400 border-green-500/20"
              : status === "completed"
              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
              : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
          }`}>
            {status}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-sm leading-tight line-clamp-2 mb-3 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag: any) => (
            <span key={tag.id} className="text-[9px] px-2 py-0.5 rounded-md bg-white/5 text-muted-foreground border border-white/5 uppercase font-bold tracking-tighter">
              {tag.attributes.name.en}
            </span>
          ))}
          {manga.attributes.tags.length > 2 && (
            <span className="text-[9px] px-2 py-0.5 rounded-md bg-white/5 text-muted-foreground border border-white/5 uppercase font-bold">
              +{manga.attributes.tags.length - 2}
            </span>
          )}
        </div>
      </div>
      
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <Sparkles className="w-4 h-4 text-primary" />
      </div>
    </Link>
  );
}
