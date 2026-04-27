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
  const [apiResults, setApiResults] = useState<any[]>([]);
  const [isApiSearching, setIsApiSearching] = useState(false);
  const [searchType, setSearchType] = useState<"waifu" | "jikan" | "anilist" | "safebooru">("safebooru");

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

  const handleSearch = async () => {
    if (searchType === "waifu") {
      await handleSearchWaifu();
    } else if (searchType === "jikan") {
      await handleSearchJikanChars();
    } else if (searchType === "anilist") {
      await handleSearchAniList();
    } else {
      await handleSearchSafebooru();
    }
  };

  const handleSearchWaifu = async () => {
    const tag = apiSearchQuery.trim().toLowerCase();
    if (!tag) return;
    setIsApiSearching(true);
    try {
      const response = await fetch(`https://api.waifu.im/images?IncludedTags=${encodeURIComponent(tag)}&IsNsfw=False&PageSize=21`);
      const data = await response.json();
      
      if (data.detail) {
        toast({ title: "Invalid Tag", description: "Try 'maid' or 'waifu'.", variant: "destructive" });
        setApiResults([]);
      } else {
        setApiResults(data.items.map((img: any) => ({
          id: img.id,
          url: img.url,
          width: img.width,
          height: img.height,
          source: "Waifu.im"
        })));
      }
    } catch (error) {
      toast({ title: "Search Error", description: "Waifu.im failed", variant: "destructive" });
    } finally {
      setIsApiSearching(false);
    }
  };

  const handleSearchJikanChars = async () => {
    const query = apiSearchQuery.trim();
    if (!query) return;
    setIsApiSearching(true);
    try {
      const response = await fetch(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(query)}&limit=21`);
      const data = await response.json();
      setApiResults(data.data?.map((char: any) => ({
        id: char.mal_id,
        url: char.images.jpg.image_url,
        width: 225,
        height: 350,
        name: char.name,
        source: "Official (Jikan)"
      })) || []);
    } catch (error) {
      toast({ title: "Search Error", description: "Jikan failed", variant: "destructive" });
    } finally {
      setIsApiSearching(false);
    }
  };

  const handleSearchAniList = async () => {
    const query = apiSearchQuery.trim();
    if (!query) return;
    setIsApiSearching(true);
    const graphQuery = `
      query ($search: String) {
        Page (perPage: 21) {
          media (search: $search, type: ANIME) {
            id
            title { english romaji }
            bannerImage
            coverImage { large }
          }
        }
      }
    `;

    try {
      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ query: graphQuery, variables: { search: query } })
      });
      const data = await response.json();
      setApiResults(data.data.Page.media.filter((m: any) => m.bannerImage).map((m: any) => ({
        id: m.id,
        url: m.bannerImage,
        name: m.title.english || m.title.romaji,
        source: "AniList Banners"
      })));
    } catch (error) {
      toast({ title: "Search Error", description: "AniList failed", variant: "destructive" });
    } finally {
      setIsApiSearching(false);
    }
  };

  const handleSearchSafebooru = async () => {
    const query = apiSearchQuery.trim().toLowerCase().replace(/\s+/g, '_');
    if (!query) return;
    setIsApiSearching(true);
    try {
      // Use Vite proxy for Safebooru to avoid CORS
      const apiPath = `/api-safebooru/index.php?page=dapi&s=post&q=index&json=1&limit=21&tags=${encodeURIComponent(query)}`;
      const response = await fetch(apiPath);
      const posts = await response.json();      
      if (!Array.isArray(posts)) {
        setApiResults([]);
        return;
      }

      setApiResults(posts.map((img: any) => ({
        id: img.id,
        url: `https://safebooru.org/images/${img.directory}/${img.image}`,
        width: img.width,
        height: img.height,
        source: "Safebooru (Gallery)"
      })));
    } catch (error) {
      console.error("Safebooru error:", error);
      toast({ title: "Search Error", description: "Safebooru failed. Try another search.", variant: "destructive" });
    } finally {
      setIsApiSearching(false);
    }
  };

  const handleImport = async (img: any) => {
    if (!selectedCategory) {
      toast({ title: "Series Required", description: "Select a series first.", variant: "destructive" });
      return;
    }
    setLoading(true);
    let imageUrl = img.url;

    try {
      // 1. Download image using proxy to bypass CORS
      try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(img.url)}`;
        const response = await fetch(proxyUrl);
        const data = await response.json();
        
        // Convert base64/string contents to a blob
        const res = await fetch(data.contents);
        const blob = await res.blob();
        
        const fileName = `${Date.now()}_import_${img.id}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("wallpapers")
          .upload(fileName, blob);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from("wallpapers")
          .getPublicUrl(fileName);
          
        imageUrl = publicUrl;
      } catch (e) { 
        console.warn("Using direct link due to CORS/Storage error:", e);
      }

      // 2. Add to Supabase Table
      const { error } = await supabase
        .from("wallpapers")
        .insert({
          anime_id: selectedCategory,
          image_url: imageUrl,
          title: title || img.name || `Art ${img.id}`,
        });

      if (error) throw error;
      toast({ title: "Imported!", description: "Masterpiece added." });
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
            Magic Sync
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

            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
              <h3 className="text-2xl font-black flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                Sync Aesthetic Masterpieces
              </h3>
              
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setSearchType("safebooru")}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    searchType === "safebooru" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"
                  }`}
                >
                  Gallery
                </button>
                <button
                  onClick={() => setSearchType("anilist")}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    searchType === "anilist" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"
                  }`}
                >
                  High-Res
                </button>
                <button
                  onClick={() => setSearchType("jikan")}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    searchType === "jikan" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"
                  }`}
                >
                  Official
                </button>
                <button
                  onClick={() => setSearchType("waifu")}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    searchType === "waifu" ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"
                  }`}
                >
                  Aesthetic
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-10">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={apiSearchQuery}
                  onChange={(e) => setApiSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder={searchType === "jikan" ? "Search characters... (e.g. Naruto, Eren, Luffy)" : "Search tags... (e.g. maid, uniform, waifu)"}
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
                onClick={handleSearch} 
                disabled={isApiSearching}
                className="h-14 px-8 bg-primary text-primary-foreground rounded-2xl font-bold"
              >
                {isApiSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apiResults.map((img) => (
                <Card key={img.id} className="group relative overflow-hidden border-white/5 bg-white/5 rounded-2xl">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={img.url} 
                      alt={img.id} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-center">
                      {img.name && <p className="text-sm font-bold text-white mb-2">{img.name}</p>}
                      <p className="text-[10px] text-white/60 mb-4">{img.width} x {img.height} • {img.source}</p>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleImport(img)}
                          disabled={loading || !selectedCategory}
                          className="bg-primary text-white rounded-xl gap-2 font-bold"
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                          Import
                        </Button>
                        <a href={img.url} target="_blank" rel="noreferrer">
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

