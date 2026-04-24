import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Navigation from "@/components/Navigation";
import WallpaperCard from "@/components/WallpaperCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Image as ImageIcon, Sparkles } from "lucide-react";

interface Wallpaper {
  id: string;
  image_url: string;
  title: string | null;
  anime_id: string;
  anime_name: string;
}

interface Category {
  id: string;
  name: string;
}

const Wallpapers = () => {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [filteredWallpapers, setFilteredWallpapers] = useState<Wallpaper[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchWallpapers();
  }, []);

  useEffect(() => {
    filterWallpapers();
  }, [searchTerm, selectedCategory, wallpapers]);

  const fetchCategories = async () => {
    try {
      const q = query(collection(db, "anime_categories"), orderBy("name"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      })) as Category[];
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchWallpapers = async () => {
    try {
      const q = query(collection(db, "wallpapers"), orderBy("created_at", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      setWallpapers(data);
      setFilteredWallpapers(data);
    } catch (error) {
      console.error("Error fetching wallpapers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterWallpapers = () => {
    let filtered = wallpapers;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(w => w.anime_id === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(w =>
        w.anime_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (w.title && w.title.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredWallpapers(filtered);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <ImageIcon className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary uppercase tracking-widest">Gallery</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
            Visual <span className="text-gradient">Masterpieces</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
            Immerse yourself in high-definition anime aesthetics. Curated, refined, and echoed for the true enthusiasts.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-12 glass p-6 rounded-[2rem] border-white/5 flex flex-col md:flex-row gap-6 max-w-5xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by series or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-14 pl-12 bg-white/5 border-white/10 rounded-2xl focus:ring-primary text-foreground placeholder:text-muted-foreground/50"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-14 w-full md:w-72 bg-white/5 border-white/10 rounded-2xl focus:ring-primary">
              <SelectValue placeholder="Filter by Series" />
            </SelectTrigger>
            <SelectContent className="glass border-white/10 rounded-2xl">
              <SelectItem value="all">All Masterpieces</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground animate-pulse font-medium">Curating gallery...</p>
          </div>
        ) : filteredWallpapers.length === 0 ? (
          <div className="text-center py-32 glass rounded-[3rem] border-white/5">
            <Sparkles className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground/50">
              {wallpapers.length === 0 
                ? "The gallery is currently empty."
                : "No echoes found for this search."}
            </h3>
            <p className="text-muted-foreground mt-2">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredWallpapers.map((wallpaper) => (
              <WallpaperCard
                key={wallpaper.id}
                id={wallpaper.id}
                imageUrl={wallpaper.image_url}
                animeName={wallpaper.anime_name}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="py-12 border-t border-white/5 text-center text-muted-foreground">
        <p>© 2024 AnimeEchoes. Experience the aesthetic.</p>
      </footer>
    </div>
  );
};

export default Wallpapers;
