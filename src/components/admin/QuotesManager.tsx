import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, MessageSquareQuote, User as UserIcon, Search, Sparkles, Loader2, Download } from "lucide-react";

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

interface AnimeChanQuote {
  anime: string;
  character: string;
  quote: string;
}

export const QuotesManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [quoteText, setQuoteText] = useState("");
  const [loading, setLoading] = useState(false);

  // API Search State
  const [apiSearchQuery, setApiSearchQuery] = useState("");
  const [apiResults, setApiResults] = useState<AnimeChanQuote[]>([]);
  const [isApiSearching, setIsApiSearching] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchQuotes();
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

  const fetchQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from("quotes")
        .select(`
          *,
          anime:anime_categories(name)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      const formattedData = data?.map(q => ({
        ...q,
        anime_name: q.anime?.name || q.anime_name || "Independent"
      })) || [];
      
      setQuotes(formattedData);
    } catch (error: any) {
      console.error("Error fetching quotes:", error);
    }
  };

  const handleSearchAnimeChan = async () => {
    if (!apiSearchQuery.trim()) return;
    setIsApiSearching(true);
    try {
      const response = await fetch(`https://animechan.io/api/v1/quotes/anime?title=${encodeURIComponent(apiSearchQuery)}`);
      const data = await response.json();
      setApiResults(data.data || []);
    } catch (error) {
      toast({ title: "Search Error", description: "Could not reach AnimeChan API", variant: "destructive" });
    } finally {
      setIsApiSearching(false);
    }
  };

  const handleImportQuote = async (item: AnimeChanQuote) => {
    setLoading(true);
    try {
      const category = categories.find(c => c.name.toLowerCase().includes(item.anime.toLowerCase()));

      const { error } = await supabase
        .from("quotes")
        .insert({
          anime_id: category?.id || null,
          anime_name: item.anime,
          character_name: item.character,
          quote_text: item.quote,
        });

      if (error) throw error;

      toast({ title: "Wisdom Imported!", description: `A quote from ${item.character} has been saved.` });
      fetchQuotes();
    } catch (error: any) {
      toast({ title: "Import Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const category = categories.find(c => c.id === selectedCategory);

      const { error } = await supabase
        .from("quotes")
        .insert({
          anime_id: selectedCategory || null,
          anime_name: category?.name || "Independent",
          character_name: characterName,
          quote_text: quoteText,
        });

      if (error) throw error;

      toast({
        title: "Quote Recorded",
        description: "The echoes of this wisdom will remain.",
      });

      setCharacterName("");
      setQuoteText("");
      setSelectedCategory("");
      fetchQuotes();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Silence this quote forever?")) return;
    try {
      const { error } = await supabase
        .from("quotes")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      toast({ title: "Silenced", description: "Quote has been removed." });
      fetchQuotes();
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
            AnimeChan Magic
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
              Discover Famous Quotes
            </h3>

            <div className="flex gap-4 mb-10">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={apiSearchQuery}
                  onChange={(e) => setApiSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchAnimeChan()}
                  placeholder="Search series... (e.g., Naruto)"
                  className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl focus:ring-primary"
                />
              </div>
              <Button 
                onClick={handleSearchAnimeChan} 
                disabled={isApiSearching}
                className="h-14 px-8 bg-primary text-primary-foreground rounded-2xl font-bold"
              >
                {isApiSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : "Get Quotes"}
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {apiResults.map((item, idx) => (
                <Card key={idx} className="group p-6 glass-card border-white/5 bg-white/5 rounded-2xl relative overflow-hidden">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <p className="text-lg italic text-foreground/90 mb-4 leading-relaxed">"{item.quote}"</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-primary">— {item.character}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">({item.anime})</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleImportQuote(item)}
                      disabled={loading}
                      variant="outline"
                      className="rounded-xl border-primary/20 hover:bg-primary hover:text-white transition-all gap-2"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      Import
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="animate-in fade-in slide-in-from-bottom-4">
          <Card className="p-8 glass-card border-white/10 rounded-[2.5rem] relative overflow-hidden">
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
                  <SelectTrigger className="bg-white/5 border-white/10 h-14 rounded-2xl focus:ring-primary">
                    <SelectValue placeholder="Associate with series..." />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10 rounded-2xl">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
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
                    className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl focus:ring-primary"
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
                  className="bg-white/5 border-white/10 min-h-[120px] rounded-2xl focus:ring-primary p-4 resize-none"
                />
              </div>

              <div className="md:col-span-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-12 h-14 bg-primary text-primary-foreground rounded-2xl font-bold hover:shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {loading ? "Recording..." : "Archive Quote"}
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 gap-8">
        {quotes.map((quote) => (
          <Card key={quote.id} className="group p-8 glass-card border-white/5 rounded-[2.5rem] transition-all hover:border-primary/30 relative">
            <div className="absolute top-8 left-8 text-primary/10 -z-0">
              <MessageSquareQuote className="w-16 h-16" />
            </div>
            
            <div className="relative z-10">
              <p className="text-xl md:text-2xl font-medium leading-relaxed italic mb-8 text-foreground/90">
                "{quote.quote_text}"
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <UserIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-black text-lg text-foreground">{quote.character_name}</h4>
                    {quote.anime_name && (
                      <p className="text-xs text-primary font-black uppercase tracking-[0.2em]">
                        {quote.anime_name}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(quote.id)}
                  className="p-4 bg-destructive/5 text-destructive rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-white shadow-lg"
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

