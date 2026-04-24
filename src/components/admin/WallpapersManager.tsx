import { useState, useEffect } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, Image as ImageIcon, Type } from "lucide-react";

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
    try {
      const q = query(collection(db, "anime_categories"), orderBy("name"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      })) as Category[];
      setCategories(data);
    } catch (error: any) {
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
    } catch (error: any) {
      console.error("Error fetching wallpapers:", error);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedCategory) return;

    setLoading(true);

    try {
      // 1. Upload image to Storage
      const storageRef = ref(storage, `wallpapers/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);

      // 2. Get anime name
      const category = categories.find(c => c.id === selectedCategory);

      // 3. Add to Firestore
      await addDoc(collection(db, "wallpapers"), {
        anime_id: selectedCategory,
        anime_name: category?.name || "Unknown",
        image_url: imageUrl,
        title: title || null,
        created_at: new Date().toISOString(),
      });

      toast({
        title: "Upload Successful",
        description: "New wallpaper has been deployed.",
      });

      setFile(null);
      setTitle("");
      setSelectedCategory("");
      fetchWallpapers();
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm("Delete this wallpaper permanently?")) return;

    try {
      // 1. Delete from Firestore
      await deleteDoc(doc(db, "wallpapers", id));

      // 2. Delete from Storage
      try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      } catch (err) {
        console.error("Storage deletion error:", err);
      }

      toast({
        title: "Deleted",
        description: "Wallpaper removed from storage.",
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
    <div className="space-y-12">
      <Card className="p-8 glass-card border-white/10 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Upload className="w-24 h-24" />
        </div>

        <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-primary" />
          Upload New Wallpaper
        </h3>

        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/70 ml-1">Select Anime</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary">
                <SelectValue placeholder="Choose series..." />
              </SelectTrigger>
              <SelectContent className="glass border-white/10 rounded-xl">
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
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
                className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl focus:ring-primary"
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
              className="bg-white/5 border-white/10 h-auto py-3 px-4 rounded-xl file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
            />
          </div>

          <div className="md:col-span-2">
            <Button
              type="submit"
              disabled={loading || !file || !selectedCategory}
              className="w-full md:w-auto px-10 h-12 bg-primary text-primary-foreground rounded-xl font-bold hover:shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all"
            >
              <Upload className="w-4 h-4 mr-2" />
              {loading ? "Uploading..." : "Deploy Wallpaper"}
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wallpapers.map((wallpaper) => (
          <Card key={wallpaper.id} className="group overflow-hidden glass-card border-white/5 rounded-2xl transition-all duration-500">
            <div className="relative aspect-[16/9] overflow-hidden">
              <img
                src={wallpaper.image_url}
                alt={wallpaper.title || "Wallpaper"}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => handleDelete(wallpaper.id, wallpaper.image_url)}
                  className="p-3 bg-destructive text-white rounded-xl hover:scale-110 transition-transform"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-bold text-foreground truncate">
                {wallpaper.title || "Untitled Masterpiece"}
              </h4>
              <p className="text-xs text-primary font-bold uppercase tracking-wider mt-1">
                {wallpaper.anime_name}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

