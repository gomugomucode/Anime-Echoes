import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, where, doc, getDoc } from "firebase/firestore";
import Navigation from "@/components/Navigation";
import WallpaperCard from "@/components/WallpaperCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";

const AnimeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: anime, isLoading: isAnimeLoading } = useQuery({
    queryKey: ["anime", id],
    queryFn: async () => {
      const docRef = doc(db, "anime_categories", id as string);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return { id: docSnap.id, ...docSnap.data() } as any;
    },
  });

  const { data: wallpapers, isLoading: isWallpapersLoading } = useQuery({
    queryKey: ["wallpapers", id],
    queryFn: async () => {
      const q = query(
        collection(db, "wallpapers"), 
        where("anime_id", "==", id),
        orderBy("created_at", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },
    enabled: !!id,
  });

  if (isAnimeLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-center p-6">
        <div>
          <h1 className="text-4xl font-bold mb-4">Series Not Found</h1>
          <Button onClick={() => navigate("/")} className="bg-primary">Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img 
            src={anime.cover_image_url} 
            alt={anime.name} 
            className="w-full h-full object-cover blur-[100px] opacity-20 scale-125"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        </div>

        <div className="container mx-auto px-6">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-12 group">
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold uppercase tracking-widest text-xs">Return to echoes</span>
          </Link>

          <div className="flex flex-col md:flex-row gap-12 items-end">
            <div className="w-full md:w-64 aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 flex-shrink-0 group">
              <img 
                src={anime.cover_image_url} 
                alt={anime.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            
            <div className="flex-1 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 mb-6">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Series Spotlight</span>
              </div>
              <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tight leading-tight">
                {anime.name}
              </h1>
              {anime.description && (
                <p className="max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
                  {anime.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-4 mb-12">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <ImageIcon className="w-6 h-6 text-foreground" />
            </div>
            <h2 className="text-3xl font-black tracking-tight">Available Gallery</h2>
          </div>

          {isWallpapersLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="aspect-video rounded-[2rem] bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : (wallpapers as any[])?.length === 0 ? (
            <div className="py-32 text-center glass rounded-[3rem] border-white/5">
              <ImageIcon className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground/50">No wallpapers uploaded for this series yet.</h3>
              <p className="text-muted-foreground mt-2">Check back later for fresh visual echoes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(wallpapers as any[])?.map((wallpaper) => (
                <WallpaperCard
                  key={wallpaper.id}
                  id={wallpaper.id}
                  imageUrl={wallpaper.image_url}
                  animeName={anime.name}
                  quote={wallpaper.title || undefined}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 text-center text-muted-foreground">
        <p>© 2024 AnimeEchoes. Curated for the enthusiasts.</p>
      </footer>
    </div>
  );
};

export default AnimeDetail;
