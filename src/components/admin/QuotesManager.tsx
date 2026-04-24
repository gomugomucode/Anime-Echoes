import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, MessageSquareQuote, User as UserIcon } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Quote {
  id: string;
  character_name: string;
  quote_text: string;
  anime_name: string;
}

export const QuotesManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [quoteText, setQuoteText] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchQuotes();
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

  const fetchQuotes = async () => {
    try {
      const q = query(collection(db, "quotes"), orderBy("created_at", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      setQuotes(data);
    } catch (error: any) {
      console.error("Error fetching quotes:", error);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const category = categories.find(c => c.id === selectedCategory);

      await addDoc(collection(db, "quotes"), {
        anime_id: selectedCategory || null,
        anime_name: category?.name || "Independent",
        character_name: characterName,
        quote_text: quoteText,
        created_at: new Date().toISOString(),
      });

      toast({
        title: "Quote Recorded",
        description: "The echoes of this wisdom will remain.",
      });

      setCharacterName("");
      setQuoteText("");
      setSelectedCategory("");
      fetchQuotes();
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

  const handleDelete = async (id: string) => {
    if (!confirm("Silence this quote forever?")) return;

    try {
      await deleteDoc(doc(db, "quotes", id));

      toast({
        title: "Silenced",
        description: "Quote has been removed.",
      });

      fetchQuotes();
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
          <MessageSquareQuote className="w-24 h-24" />
        </div>

        <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
          <Plus className="w-6 h-6 text-primary" />
          Add New Wisdom
        </h3>

        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/70 ml-1">Series (Optional)</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary">
                <SelectValue placeholder="Associate with series..." />
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
            <label className="text-sm font-bold text-foreground/70 ml-1">Character Name</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="e.g., Kakashi Hatake"
                required
                className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl focus:ring-primary"
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-bold text-foreground/70 ml-1">The Quote</label>
            <Textarea
              value={quoteText}
              onChange={(e) => setQuoteText(e.target.value)}
              placeholder="In the ninja world, those who break the rules are scum..."
              required
              className="bg-white/5 border-white/10 min-h-[120px] rounded-xl focus:ring-primary p-4 resize-none"
            />
          </div>

          <div className="md:col-span-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-10 h-12 bg-primary text-primary-foreground rounded-xl font-bold hover:shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              {loading ? "Recording..." : "Archive Quote"}
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {quotes.map((quote) => (
          <Card key={quote.id} className="group p-8 glass-card border-white/5 rounded-[2rem] transition-all hover:border-primary/30 relative">
            <div className="absolute top-6 left-6 text-primary/10 -z-0">
              <MessageSquareQuote className="w-16 h-16" />
            </div>
            
            <div className="relative z-10">
              <p className="text-xl md:text-2xl font-medium leading-relaxed italic mb-6 text-foreground/90">
                "{quote.quote_text}"
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <UserIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{quote.character_name}</h4>
                    {quote.anime_name && (
                      <p className="text-xs text-primary font-bold uppercase tracking-wider">
                        {quote.anime_name}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(quote.id)}
                  className="p-3 bg-destructive/5 text-destructive rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-white"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

