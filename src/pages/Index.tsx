import Navigation from "@/components/Navigation";
import AnimeCard from "@/components/AnimeCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

// Temporary mock data - will be replaced with database
const mockAnimes = [
  {
    id: "naruto",
    name: "Naruto",
    imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=600&fit=crop",
    wallpaperCount: 24
  },
  {
    id: "jujutsu-kaisen",
    name: "Jujutsu Kaisen",
    imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&h=600&fit=crop",
    wallpaperCount: 18
  },
  {
    id: "demon-slayer",
    name: "Demon Slayer",
    imageUrl: "https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=400&h=600&fit=crop",
    wallpaperCount: 32
  },
  {
    id: "attack-on-titan",
    name: "Attack on Titan",
    imageUrl: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&h=600&fit=crop",
    wallpaperCount: 28
  },
  {
    id: "one-piece",
    name: "One Piece",
    imageUrl: "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=400&h=600&fit=crop",
    wallpaperCount: 41
  },
  {
    id: "my-hero-academia",
    name: "My Hero Academia",
    imageUrl: "https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=400&h=600&fit=crop",
    wallpaperCount: 19
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        
        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-float">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Premium Anime Wallpapers</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-glow">
              Feel the Anime Energy
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover stunning wallpapers and inspiring quotes from your favorite anime series. Download high-quality artwork for free.
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-glow-purple group">
                Explore Wallpapers
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Link to="/quotes">
                <Button size="lg" variant="outline" className="border-border hover:border-primary">
                  View Quotes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Anime Grid Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Popular Anime Series
            </h2>
            <p className="text-muted-foreground">
              Browse wallpapers from the most beloved anime
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockAnimes.map((anime) => (
              <AnimeCard
                key={anime.id}
                id={anime.id}
                name={anime.name}
                imageUrl={anime.imageUrl}
                wallpaperCount={anime.wallpaperCount}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">
            © 2024 GenArtHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
