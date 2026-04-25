import { useState } from "react";
import { Download, Heart, Maximize2, Share2, Sparkles, ExternalLink, X } from "lucide-react";
import type { WaifuImage } from "@/lib/waifu";
import { Button } from "@/components/ui/button";

interface Props {
  image: WaifuImage;
}

export default function WallpaperCard({ image }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [liked, setLiked] = useState(false);

  return (
    <>
      <div 
        className="group relative rounded-3xl overflow-hidden cursor-pointer glass-card border-white/5 hover:border-primary/50 transition-all duration-500 hover:-translate-y-1 shadow-xl"
        onClick={() => setShowModal(true)}
        style={{ borderBottom: `4px solid ${image.dominantColor}` }}
      >
        <img
          src={image.url}
          alt={image.tags.map(t => t.name).join(", ")}
          loading="lazy"
          className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Advanced Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-white/90 uppercase tracking-[0.2em] bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                {image.width}×{image.height}
              </span>
              <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest pl-1 line-clamp-1">
                {image.tags.slice(0, 2).map(t => t.name).join(" • ")}
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
                className={`p-2 rounded-xl backdrop-blur-xl border transition-all duration-300 ${
                  liked 
                    ? "bg-red-500/20 text-red-500 border-red-500/40" 
                    : "bg-white/10 text-white border-white/10 hover:bg-white/20"
                }`}
              >
                <Heart className="w-4 h-4" fill={liked ? "currentColor" : "none"} />
              </button>
              
              <a
                href={image.url}
                download
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-xl bg-white/10 text-white border border-white/10 hover:bg-primary hover:text-primary-foreground hover:border-primary/50 backdrop-blur-xl transition-all duration-300"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <Sparkles className="w-4 h-4 text-primary animate-glow" />
        </div>
      </div>

      {/* Full-screen Immersive Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8 animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="relative w-full max-w-7xl max-h-full flex flex-col items-center gap-6" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative group/modal rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(147,51,234,0.15)] border border-white/10 max-h-[80vh]">
              <img
                src={image.url}
                alt=""
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 p-3 rounded-2xl bg-black/50 text-white border border-white/10 hover:bg-primary transition-all backdrop-blur-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="glass p-6 md:p-8 rounded-[2.5rem] border-white/10 w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Resolution</p>
                  <p className="text-lg font-bold">{image.width}×{image.height}</p>
                </div>
                <div className="w-px h-10 bg-white/5 hidden md:block" />
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Format</p>
                  <p className="text-lg font-bold uppercase">{image.extension.replace('.', '')}</p>
                </div>
                <div className="w-px h-10 bg-white/5 hidden md:block" />
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Favorites</p>
                  <p className="text-lg font-bold flex items-center gap-2">
                    <Heart className="w-4 h-4 text-primary fill-primary" /> {image.favorites.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 w-full md:w-auto">
                {image.source && (
                  <a
                    href={image.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 md:flex-none"
                  >
                    <Button
                      variant="outline"
                      className="w-full rounded-2xl border-white/10 h-14 px-8 text-muted-foreground hover:text-white"
                    >
                      <ExternalLink className="mr-2 h-5 w-5" /> Source
                    </Button>
                  </a>
                )}
                
                <a
                  href={image.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-none"
                >
                  <Button className="w-full rounded-2xl h-14 px-10 font-black uppercase tracking-widest bg-primary hover:shadow-[0_0_30px_rgba(147,51,234,0.4)] transition-all">
                    <Download className="mr-2 h-5 w-5" /> Download
                  </Button>
                </a>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
              {image.tags.map(t => (
                <span key={t.id} className="text-[9px] px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-muted-foreground font-black uppercase tracking-[0.2em]">
                  {t.name}
                </span>
              ))}
            </div>
            
            <button
              onClick={() => setShowModal(false)}
              className="text-muted-foreground hover:text-white transition-colors text-sm font-bold uppercase tracking-widest mt-4"
            >
              Close Transmission
            </button>
          </div>
        </div>
      )}
    </>
  );
}
