import { useState, useEffect } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Image as ImageIcon, Type, AlignLeft } from "lucide-react";

interface Category {
  id: string;
  name: string;
  cover_image_url: string;
  description: string | null;
}

export const CategoriesManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const q = query(collection(db, "anime_categories"), orderBy("name"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(data);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);

    try {
      // 1. Upload image to Storage
      const storageRef = ref(storage, `categories/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);

      // 2. Add to Firestore
      await addDoc(collection(db, "anime_categories"), {
        name,
        description,
        cover_image_url: imageUrl,
        created_at: new Date().toISOString(),
      });

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
    if (!confirm("Are you sure you want to delete this category? All associated data will remain (cleanup recommended separately).")) return;

    try {
      // 1. Delete from Firestore
      await deleteDoc(doc(db, "anime_categories", id));

      // 2. Delete from Storage (Optional but recommended)
      try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      } catch (err) {
        console.error("Storage deletion error (might be external URL):", err);
      }

      toast({
        title: "Deleted",
        description: "Category removed successfully.",
      });

      fetchCategories();
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
          <ImageIcon className="w-24 h-24" />
        </div>

        <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
          <Plus className="w-6 h-6 text-primary" />
          Create New Series
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
                className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl focus:ring-primary"
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
              className="bg-white/5 border-white/10 h-12 py-2 px-4 rounded-xl file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
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
                className="bg-white/5 border-white/10 min-h-[100px] pl-12 rounded-xl focus:ring-primary p-4"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <Button
              type="submit"
              disabled={loading || !file}
              className="w-full md:w-auto px-10 h-12 bg-primary text-primary-foreground rounded-xl font-bold hover:shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all"
            >
              {loading ? "Creating..." : "Launch Series"}
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="group overflow-hidden glass-card border-white/5 rounded-2xl transition-all duration-500">
            <div className="relative aspect-video overflow-hidden">
              <img
                src={category.cover_image_url}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleDelete(category.id, category.cover_image_url)}
                  className="p-3 bg-destructive text-white rounded-xl hover:scale-110 transition-transform"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-bold text-foreground">{category.name}</h4>
              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                {category.description || "No description provided."}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

