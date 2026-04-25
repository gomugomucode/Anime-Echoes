import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Trash2, Image as ImageIcon, Type, Search, Sparkles, Loader2, Download, ExternalLink } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Wallpaper {
  id: string;
  image_url: string;
  title: string | null;
  anime_name: string;
}

interface WallhavenResult {
  id: string;
  path: string;
  thumbs: {
    large: string;
  };
  dimension_x: number;
  dimension_y: number;
}

export const WallpapersManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // API Search State
  const [apiSearchQuery, setApiSearchQuery] = useState("");
  const [apiResults, setApiResults] = useState<WallhavenResult[]>([]);
  const [isApiSearching, setIsApiSearching] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchWallpapers();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("anime_categories")
        .select("id, name")
        .order("name");
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchWallpapers = async () => {
    try {
      const { data, error } = await supabase
        .from("wallpapers")
        .select(`
          *,
          anime:anime_categories(name)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      const formattedData = data?.map(w => ({
        ...w,
        anime_name: w.anime?.name || "Unknown"
      })) || [];
      
      setWallpapers(formattedData);
    } catch (error: any) {
      console.error("Error fetching wallpapers:", error);
    }
  };

  const handleSearchWallhaven = async () => {
    if (!apiSearchQuery.trim()) return;
    setIsApiSearching(true);
    try {
      const response = await fetch(`https://wallhaven.cc/api/v1/search?q=${encodeURIComponent(apiSearchQuery)}&categories=010&purity=100`);
      const data = await response.json();
      setApiResults(data.data || []);
    } catch (error) {
      toast({ title: "Search Error", description: "Could not reach Wallhaven API", variant: "destructive" });
    } finally {
      setIsApiSearching(false);
    }
  };

  const handleImportWallhaven = async (wall: WallhavenResult) => {
    if (!selectedCategory) {
      toast({ title: "Series Required", description: "Please select a series to link this wallpaper to.", variant: "destructive" });
      return;
    }
    setLoading(true);
    let imageUrl = wall.path;

    try {
      // 1. Attempt to fetch and upload to Supabase Storage
      try {
        const imgRes = await fetch(imageUrl);
        const blob = await imgRes.blob();
        
        const fileName = `${Date.now()}_wallhaven_${wall.id}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("wallpapers")
          .upload(fileName, blob);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from("wallpapers")
          .getPublicUrl(fileName);
          
        imageUrl = publicUrl;
      } catch (corsError) {
        console.warn("CORS or Storage error, using external link:", corsError);
      }

      // 2. Add to Supabase Table
      const { error } = await supabase
        .from("wallpapers")
        .insert({
          anime_id: selectedCategory,
          image_url: imageUrl,
          title: title || `Wallhaven ${wall.id}`,
        });

      if (error) throw error;

      toast({ title: "Imported!", description: "Wallpaper added to your collection." });
      setTitle("");
      fetchWallpapers();
    } catch (error: any) {
      toast({ title: "Import Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedCategory) return;

    setLoading(true);

    try {
      // 1. Upload to Storage
      const fileName = `${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("wallpapers")
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("wallpapers")
        .getPublicUrl(fileName);

      // 2. Add to Table
      const { error } = await supabase
        .from("wallpapers")
        .insert({
          anime_id: selectedCategory,
          image_url: publicUrl,
          title: title || null,
        });

      if (error) throw error;

      toast({ title: "Upload Successful", description: "New wallpaper has been deployed." });
      setFile(null);
      setTitle("");
      fetchWallpapers();
    } catch (error: any) {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm("Delete this wallpaper permanently?")) return;

    try {
      // 1. Delete from Table
      const { error } = await supabase
        .from("wallpapers")
        .delete()
        .eq("id", id);
      
      if (error) throw error;

      // 2. Try to delete from Storage
      try {
        const urlParts = imageUrl.split("/");
        const fileName = urlParts[urlParts.length - 1];
        await supabase.storage.from("wallpapers").remove([fileName]);
      } catch (err) {
        console.error("Storage deletion error:", err);
      }

      toast({ title: "Deleted", description: "Wallpaper removed." });
      fetchWallpapers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-12">
      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 glass-card border-white/5 p-1 h-14 rounded-2xl">
          <TabsTrigger value="search" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Sparkles className="w-4 h-4 mr-2" />
            Wallhaven Magic
          </TabsTrigger>
          <TabsTrigger value="manual" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Upload className="w-4 h-4 mr-2" />
            Manual Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="animate-in fade-in slide-in-from-bottom-4">
          <Card className="p-8 glass-card border-white/10 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Search className="w-24 h-24" />
            </div>

            <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Find High-Res Wallpapers
            </h3>

            <div className="flex flex-col md:flex-row gap-4 mb-10">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={apiSearchQuery}
                  onChange={(e) => setApiSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchWallhaven()}
                  placeholder="Search characters or series... (e.g., Gojo Satoru)"
                  className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl focus:ring-primary"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-14 w-full md:w-64 bg-white/5 border-white/10 rounded-2xl focus:ring-primary">
                  <SelectValue placeholder="Assign to Series" />
                </SelectTrigger>
                <SelectContent className="glass border-white/10 rounded-2xl">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                onClick={handleSearchWallhaven} 
                disabled={isApiSearching}
                className="h-14 px-8 bg-primary text-primary-foreground rounded-2xl font-bold"
              >
                {isApiSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apiResults.map((wall) => (
                <Card key={wall.id} className="group relative overflow-hidden border-white/5 bg-white/5 rounded-2xl">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={wall.thumbs.large} 
                      alt={wall.id} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-center">
                      <p className="text-xs text-white/80 mb-4">{wall.dimension_x} x {wall.dimension_y}</p>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleImportWallhaven(wall)}
                          disabled={loading || !selectedCategory}
                          className="bg-primary text-white rounded-xl gap-2 font-bold"
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                          Import
                        </Button>
                        <a href={wall.path} target="_blank" rel="noreferrer">
                          <Button variant="outline" className="rounded-xl border-white/20 hover:bg-white/10">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="animate-in fade-in slide-in-from-bottom-4">
          <Card className="p-8 glass-card border-white/10 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Upload className="w-24 h-24" />
            </div>

            <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-primary" />
              Manual Wallpaper Upload
            </h3>

            <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground/70 ml-1">Select Anime</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-white/5 border-white/10 h-14 rounded-2xl focus:ring-primary">
                    <SelectValue placeholder="Choose series..." />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10 rounded-2xl">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground/70 ml-1">Wallpaper Title</label>
                <div className="relative">
                  <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Hidden Leaf Sunset"
                    className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl focus:ring-primary"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-foreground/70 ml-1">Image Source</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                  className="bg-white/5 border-white/10 h-auto py-3 px-4 rounded-2xl file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
                />
              </div>

              <div className="md:col-span-2">
                <Button
                  type="submit"
                  disabled={loading || !file || !selectedCategory}
                  className="w-full md:w-auto px-12 h-14 bg-primary text-primary-foreground rounded-2xl font-bold hover:shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {loading ? "Uploading..." : "Deploy Wallpaper"}
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {wallpapers.map((wallpaper) => (
          <Card key={wallpaper.id} className="group overflow-hidden glass-card border-white/5 rounded-[2rem] transition-all duration-500 hover:-translate-y-1">
            <div className="relative aspect-[16/9] overflow-hidden">
              <img
                src={wallpaper.image_url}
                alt={wallpaper.title || "Wallpaper"}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => handleDelete(wallpaper.id, wallpaper.image_url)}
                  className="p-4 bg-destructive text-white rounded-2xl hover:scale-110 transition-transform shadow-2xl"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-5">
              <h4 className="font-bold text-foreground truncate">
                {wallpaper.title || "Untitled Masterpiece"}
              </h4>
              <p className="text-xs text-primary font-bold uppercase tracking-widest mt-1">
                {wallpaper.anime_name}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

