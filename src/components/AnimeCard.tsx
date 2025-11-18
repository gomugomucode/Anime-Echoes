import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface AnimeCardProps {
  id: string;
  name: string;
  imageUrl: string;
  wallpaperCount: number;
}

const AnimeCard = ({ id, name, imageUrl, wallpaperCount }: AnimeCardProps) => {
  return (
    <Link to={`/anime/${id}`}>
      <Card className="group relative overflow-hidden bg-card border-border hover:border-primary transition-all duration-300 hover:shadow-glow-purple cursor-pointer">
        <div className="aspect-[3/4] relative overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-xl font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {wallpaperCount} wallpapers
          </p>
        </div>
      </Card>
    </Link>
  );
};

export default AnimeCard;
