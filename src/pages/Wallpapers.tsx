import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import WallpaperCard from "@/components/WallpaperCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface Wallpaper {
  id: string;
  image_url: string;
  title: string | null;
  anime_id: string;
  anime_categories: {
    id: string;
    name: string;
  };
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
      const { data, error } = await supabase
        .from("anime_categories")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchWallpapers = async () => {
    try {
      const { data, error } = await supabase
        .from("wallpapers")
        .select(`
          id,
          image_url,
          title,
          anime_id,
          anime_categories (
            id,
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWallpapers(data || []);
      setFilteredWallpapers(data || []);
    } catch (error) {
      console.error("Error fetching wallpapers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterWallpapers = () => {
    let filtered = wallpapers;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(w => w.anime_categories.id === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(w =>
        w.anime_categories.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (w.title && w.title.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredWallpapers(filtered);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient">
            All Wallpapers
          </h1>
          <p className="text-muted-foreground text-lg">
            Browse and download your favorite anime wallpapers
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by anime name or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card border-border text-foreground"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-64 bg-card border-border">
              <SelectValue placeholder="Filter by anime" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Anime</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground">Loading wallpapers...</div>
        ) : filteredWallpapers.length === 0 ? (
          <div className="text-center text-muted-foreground">
            {wallpapers.length === 0 
              ? "No wallpapers available yet. Check back soon!"
              : "No wallpapers found matching your search."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWallpapers.map((wallpaper) => (
              <WallpaperCard
                key={wallpaper.id}
                id={wallpaper.id}
                imageUrl={wallpaper.image_url}
                animeName={wallpaper.anime_categories.name}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="bg-card border-t border-border py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 GenArtHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Wallpapers;
