import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Wallpaper {
  id: string;
  image_url: string;
  title: string | null;
  anime_categories: {
    name: string;
  };
}

export const WallpapersManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchWallpapers();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("anime_categories")
      .select("id, name")
      .order("name");
    setCategories(data || []);
  };

  const fetchWallpapers = async () => {
    const { data } = await supabase
      .from("wallpapers")
      .select(`
        id,
        image_url,
        title,
        anime_categories (name)
      `)
      .order("created_at", { ascending: false });
    setWallpapers(data || []);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedCategory) return;

    setLoading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("wallpapers")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("wallpapers")
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from("wallpapers")
        .insert({
          anime_id: selectedCategory,
          image_url: publicUrl,
          title: title || null,
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Wallpaper uploaded successfully",
      });

      setFile(null);
      setTitle("");
      setSelectedCategory("");
      fetchWallpapers();
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
    if (!confirm("Are you sure you want to delete this wallpaper?")) return;

    try {
      const path = imageUrl.split("/").pop();
      if (path) {
        await supabase.storage.from("wallpapers").remove([path]);
      }

      const { error } = await supabase
        .from("wallpapers")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Wallpaper deleted successfully",
      });

      fetchWallpapers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card border-border">
        <h3 className="text-xl font-bold mb-4 text-foreground">Upload Wallpaper</h3>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select Anime
            </label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Choose anime" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Title (optional)
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Wallpaper title"
              className="bg-background border-border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Image File
            </label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
              className="bg-background border-border"
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !file || !selectedCategory}
            className="bg-primary hover:bg-primary/90"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Wallpaper
          </Button>
        </form>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wallpapers.map((wallpaper) => (
          <Card key={wallpaper.id} className="p-4 bg-card border-border">
            <img
              src={wallpaper.image_url}
              alt={wallpaper.title || "Wallpaper"}
              className="w-full h-40 object-cover rounded mb-3"
            />
            <h4 className="font-bold text-foreground">
              {wallpaper.title || "Untitled"}
            </h4>
            <p className="text-sm text-muted-foreground">
              {wallpaper.anime_categories.name}
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(wallpaper.id, wallpaper.image_url)}
              className="mt-3"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
