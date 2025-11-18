import { useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import WallpaperCard from "@/components/WallpaperCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data - will be replaced with database
const mockWallpapers = [
  {
    id: "1",
    imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=600&fit=crop",
    animeName: "Naruto",
    quote: "I'm not gonna run away, I never go back on my word!"
  },
  {
    id: "2",
    imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&h=600&fit=crop",
    animeName: "Naruto",
    quote: "When people are protecting something truly special to them, they become as strong as they can be."
  },
  {
    id: "3",
    imageUrl: "https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=800&h=600&fit=crop",
    animeName: "Naruto"
  },
  {
    id: "4",
    imageUrl: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&h=600&fit=crop",
    animeName: "Naruto",
    quote: "Hard work is worthless for those that don't believe in themselves."
  }
];

const AnimeDetail = () => {
  const { id } = useParams();
  const animeName = id?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || "Anime";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <Link to="/">
            <Button variant="ghost" className="mb-8 hover:text-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {animeName}
            </h1>
            <p className="text-muted-foreground text-lg">
              Download high-quality wallpapers from {animeName}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockWallpapers.map((wallpaper) => (
              <WallpaperCard
                key={wallpaper.id}
                id={wallpaper.id}
                imageUrl={wallpaper.imageUrl}
                animeName={animeName}
                quote={wallpaper.quote}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AnimeDetail;
