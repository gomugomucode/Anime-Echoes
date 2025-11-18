import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Quote {
  id: string;
  character_name: string;
  quote_text: string;
  anime_categories: {
    name: string;
  } | null;
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
    const { data } = await supabase
      .from("anime_categories")
      .select("id, name")
      .order("name");
    setCategories(data || []);
  };

  const fetchQuotes = async () => {
    const { data } = await supabase
      .from("quotes")
      .select(`
        id,
        character_name,
        quote_text,
        anime_categories (name)
      `)
      .order("created_at", { ascending: false });
    setQuotes(data || []);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("quotes")
        .insert({
          anime_id: selectedCategory || null,
          character_name: characterName,
          quote_text: quoteText,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Quote added successfully",
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
    if (!confirm("Are you sure you want to delete this quote?")) return;

    try {
      const { error } = await supabase
        .from("quotes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Quote deleted successfully",
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
    <div className="space-y-6">
      <Card className="p-6 bg-card border-border">
        <h3 className="text-xl font-bold mb-4 text-foreground">Add New Quote</h3>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Anime (optional)
            </label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Choose anime (optional)" />
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
              Character Name
            </label>
            <Input
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              placeholder="e.g., Naruto Uzumaki"
              required
              className="bg-background border-border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Quote
            </label>
            <Textarea
              value={quoteText}
              onChange={(e) => setQuoteText(e.target.value)}
              placeholder="Enter the quote..."
              required
              rows={4}
              className="bg-background border-border"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Quote
          </Button>
        </form>
      </Card>

      <div className="space-y-4">
        {quotes.map((quote) => (
          <Card key={quote.id} className="p-4 bg-card border-border">
            <p className="text-foreground italic mb-2">"{quote.quote_text}"</p>
            <p className="text-sm text-muted-foreground">
              — {quote.character_name}
              {quote.anime_categories && ` (${quote.anime_categories.name})`}
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(quote.id)}
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
