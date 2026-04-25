import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Image as ImageIcon, Type, AlignLeft, Search, Sparkles, Loader2, Download } from "lucide-react";

interface Category {
  id: string;
  name: string;
  cover_image_url: string;
  description: string | null;
}

interface JikanResult {
  mal_id: number;
  title: string;
  synopsis: string;
  images: {
    jpg: {
      large_image_url: string;
    }
  }
}

export const CategoriesManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  // API Search State
  const [apiSearchQuery, setApiSearchQuery] = useState("");
  const [apiResults, setApiResults] = useState<JikanResult[]>([]);
  const [isApiSearching, setIsApiSearching] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("anime_categories")
        .select("*")
        .order("name");
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSearchJikan = async () => {
    if (!apiSearchQuery.trim()) return;
    setIsApiSearching(true);
    try {
      const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(apiSearchQuery)}&limit=6`);
      const data = await response.json();
      setApiResults(data.data || []);
    } catch (error) {
      toast({ title: "Search Error", description: "Could not reach Jikan API", variant: "destructive" });
    } finally {
      setIsApiSearching(false);
    }
  };

  const handleImportJikan = async (anime: JikanResult) => {
    setLoading(true);
    let imageUrl = anime.images.jpg.large_image_url;

    try {
      // 1. Attempt to fetch and upload to Supabase Storage
      try {
        const imgRes = await fetch(imageUrl);
        const blob = await imgRes.blob();
        
        const fileName = `${Date.now()}_jikan_${anime.mal_id}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("categories")
          .upload(fileName, blob);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from("categories")
          .getPublicUrl(fileName);
          
        imageUrl = publicUrl;
      } catch (corsError) {
        console.warn("CORS or Storage error, falling back to external URL:", corsError);
      }

      // 2. Add to Supabase Table
      const { error } = await supabase
        .from("anime_categories")
        .insert({
          name: anime.title,
          description: anime.synopsis?.slice(0, 500) || "",
          cover_image_url: imageUrl,
        });

      if (error) throw error;

      toast({
        title: "Magic Import Successful!",
        description: `${anime.title} has been added to your collection.`,
      });

      fetchCategories();
    } catch (error: any) {
      toast({ title: "Import Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);

    try {
      // 1. Upload image to Storage
      const fileName = `${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("categories")
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("categories")
        .getPublicUrl(fileName);

      // 2. Add to Supabase Table
      const { error } = await supabase
        .from("anime_categories")
        .insert({
          name,
          description,
          cover_image_url: publicUrl,
        });

      if (error) throw error;

      toast({
        title: "Category Created",
        description: `${name} has been added to the database.`,
      });

      setName("");
      setDescription("");
      setFile(null);
      fetchCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      // 1. Delete from Table
      const { error } = await supabase
        .from("anime_categories")
        .delete()
        .eq("id", id);
      
      if (error) throw error;

      // 2. Try to delete from Storage (optional, extract filename from URL)
      try {
        const urlParts = imageUrl.split("/");
        const fileName = urlParts[urlParts.length - 1];
        await supabase.storage.from("categories").remove([fileName]);
      } catch (err) {
        console.error("Storage deletion error:", err);
      }

      toast({ title: "Deleted", description: "Category removed successfully." });
      fetchCategories();
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
            Magic Search
          </TabsTrigger>
          <TabsTrigger value="manual" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Manual Entry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="animate-in fade-in slide-in-from-bottom-4">
          <Card className="p-8 glass-card border-white/10 rounded-[2.5rem] relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
              <Search className="w-24 h-24" />
            </div>
            
            <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Discover & Import Series
            </h3>

            <div className="flex gap-4 mb-10">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={apiSearchQuery}
                  onChange={(e) => setApiSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchJikan()}
                  placeholder="Search MyAnimeList... (e.g., Attack on Titan)"
                  className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl focus:ring-primary"
                />
              </div>
              <Button 
                onClick={handleSearchJikan} 
                disabled={isApiSearching}
                className="h-14 px-8 bg-primary text-primary-foreground rounded-2xl font-bold"
              >
                {isApiSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apiResults.map((anime) => (
                <Card key={anime.mal_id} className="group relative overflow-hidden border-white/5 bg-white/5 rounded-2xl">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img 
                      src={anime.images.jpg.large_image_url} 
                      alt={anime.title} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-center">
                      <p className="text-xs text-white/80 line-clamp-4 mb-4">{anime.synopsis}</p>
                      <Button 
                        onClick={() => handleImportJikan(anime)}
                        disabled={loading}
                        className="bg-primary text-white rounded-xl gap-2 font-bold"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        Import Now
                      </Button>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-bold text-sm line-clamp-1">{anime.title}</h4>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="animate-in fade-in slide-in-from-bottom-4">
          <Card className="p-8 glass-card border-white/10 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <ImageIcon className="w-24 h-24" />
            </div>

            <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
              <Plus className="w-6 h-6 text-primary" />
              Manual Series Entry
            </h3>

            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground/70 ml-1">Series Name</label>
                <div className="relative">
                  <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Jujutsu Kaisen"
                    required
                    className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground/70 ml-1">Cover Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                  className="bg-white/5 border-white/10 h-14 py-3 px-4 rounded-2xl file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-foreground/70 ml-1">Description</label>
                <div className="relative">
                  <AlignLeft className="absolute left-4 top-4 w-4 h-4 text-muted-foreground" />
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe the series..."
                    className="bg-white/5 border-white/10 min-h-[120px] pl-12 rounded-2xl focus:ring-primary p-4"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <Button
                  type="submit"
                  disabled={loading || !file}
                  className="w-full md:w-auto px-12 h-14 bg-primary text-primary-foreground rounded-2xl font-bold hover:shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all"
                >
                  {loading ? "Creating..." : "Launch Series"}
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category) => (
          <Card key={category.id} className="group overflow-hidden glass-card border-white/5 rounded-[2rem] transition-all duration-500 hover:-translate-y-1">
            <div className="relative aspect-video overflow-hidden">
              <img
                src={category.cover_image_url}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleDelete(category.id, category.cover_image_url)}
                  className="p-4 bg-destructive text-white rounded-2xl hover:scale-110 transition-transform shadow-2xl"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <h4 className="font-bold text-lg text-foreground">{category.name}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                {category.description || "No description provided."}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

