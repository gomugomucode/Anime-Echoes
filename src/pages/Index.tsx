import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Sparkles, Quote } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const q = query(collection(db, "anime_categories"), orderBy("name"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-float" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 blur-[120px] rounded-full animate-float" style={{ animationDelay: "-3s" }} />
        </div>

        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground/80">Experience the Echoes of Anime</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-tight animate-fade-up">
            Your Gateway to <br />
            <span className="text-gradient">Anime Inspiration</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-12 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Explore a curated collection of stunning wallpapers and profound quotes from your favorite anime series.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <Link to="/wallpapers">
              <button className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:shadow-[0_0_30px_rgba(147,51,234,0.4)] transition-all flex items-center gap-2 group">
                Browse Wallpapers
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link to="/quotes">
              <button className="px-8 py-4 glass text-foreground rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center gap-2">
                Explore Quotes
                <Quote className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-black/20">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Anime</h2>
              <p className="text-muted-foreground">Discover content by series</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading
              ? Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-[400px] w-full rounded-3xl" />
                  ))
              : categories?.map((category: any) => (
                  <Link 
                    key={category.id} 
                    to={`/anime/${category.id}`}
                    className="group"
                  >
                    <Card className="relative h-[450px] overflow-hidden border-0 bg-transparent rounded-3xl transition-all duration-500 hover:-translate-y-2">
                      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                      <img
                        src={category.cover_image_url}
                        alt={category.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                        <div className="px-3 py-1 rounded-full bg-primary/20 backdrop-blur-md border border-primary/20 w-fit mb-4">
                          <span className="text-xs font-bold text-primary uppercase tracking-wider">Series</span>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="text-gray-300 text-sm line-clamp-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </Card>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>© 2024 AnimeEchoes. Crafted for enthusiasts.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
