import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WallpaperCardProps {
  id: string;
  imageUrl: string;
  animeName: string;
  quote?: string;
}

const WallpaperCard = ({ id, imageUrl, animeName, quote }: WallpaperCardProps) => {
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AnimeEchoes-${animeName.replace(/\s+/g, '-')}-${id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: `Enjoy your ${animeName} wallpaper!`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not retrieve the image. Try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="group relative overflow-hidden glass-card border-white/5 rounded-[2rem] transition-all duration-500 hover:border-primary/30 hover:shadow-[0_0_40px_rgba(147,51,234,0.15)]">
      <div className="aspect-[16/10] relative overflow-hidden">
        <img
          src={imageUrl}
          alt={`${animeName} wallpaper`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="px-2 py-0.5 rounded-md bg-primary/20 backdrop-blur-md border border-primary/20">
                <span className="text-[10px] font-black text-primary uppercase tracking-tighter">4K Ultra</span>
              </div>
              <span className="text-xs font-bold text-white/70">{animeName}</span>
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                {quote ? (
                  <p className="text-sm text-white/90 italic line-clamp-2 leading-snug">
                    "{quote}"
                  </p>
                ) : (
                  <p className="text-sm font-bold text-white">Visual Echo</p>
                )}
              </div>
              <Button
                onClick={handleDownload}
                size="icon"
                className="w-12 h-12 bg-white text-black hover:bg-primary hover:text-white rounded-2xl transition-all transform active:scale-90"
              >
                <Download className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="p-2 bg-black/50 backdrop-blur-md rounded-xl border border-white/10">
          <Sparkles className="w-4 h-4 text-primary animate-glow" />
        </div>
      </div>
    </Card>
  );
};

export default WallpaperCard;
