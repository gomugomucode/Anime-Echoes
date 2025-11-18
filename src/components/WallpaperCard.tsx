import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

interface WallpaperCardProps {
  id: string;
  imageUrl: string;
  animeName: string;
  quote?: string;
}

const WallpaperCard = ({ id, imageUrl, animeName, quote }: WallpaperCardProps) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleDownload = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to download wallpapers.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${animeName}-wallpaper-${id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="group relative overflow-hidden bg-card border-border hover:border-secondary transition-all duration-300 hover:shadow-glow-blue">
      <div className="aspect-video relative overflow-hidden">
        <img
          src={imageUrl}
          alt={`${animeName} wallpaper`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex-1">
              {quote && (
                <p className="text-sm text-foreground/90 italic line-clamp-2">
                  "{quote}"
                </p>
              )}
            </div>
            <Button
              onClick={handleDownload}
              size="sm"
              className="ml-4 bg-secondary hover:bg-secondary/90 shadow-glow-blue"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WallpaperCard;
