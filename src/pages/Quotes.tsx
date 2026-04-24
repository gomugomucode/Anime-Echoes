import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Navigation from "@/components/Navigation";
import QuoteCard from "@/components/QuoteCard";
import { Search, Quote as QuoteIcon, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Quote {
  id: string;
  character_name: string;
  quote_text: string;
  anime_name: string;
}

const Quotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotes();
  }, []);

  useEffect(() => {
    const filtered = quotes.filter(q =>
      q.character_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.quote_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.anime_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredQuotes(filtered);
  }, [searchTerm, quotes]);

  const fetchQuotes = async () => {
    try {
      const q = query(collection(db, "quotes"), orderBy("created_at", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      setQuotes(data);
      setFilteredQuotes(data);
    } catch (error) {
      console.error("Error fetching quotes:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
            <QuoteIcon className="w-4 h-4 text-secondary" />
            <span className="text-sm font-bold text-secondary uppercase tracking-widest">Philosophy</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
            Legendary <br /><span className="text-gradient">Anime Echoes</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
            Wisdom, pain, and inspiration captured in the words of your favorite characters. Let their voices resonate.
          </p>
        </div>

        <div className="mb-16 relative max-w-3xl mx-auto group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition-opacity" />
          <div className="relative glass p-2 rounded-[2rem] border-white/5 flex items-center">
            <Search className="ml-6 w-6 h-6 text-muted-foreground" />
            <Input
              placeholder="Search by character, series, or words of wisdom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-14 border-0 bg-transparent focus-visible:ring-0 text-lg md:text-xl px-6"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
            <p className="text-muted-foreground animate-pulse font-medium">Listening to echoes...</p>
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="text-center py-32 glass rounded-[3rem] border-white/5">
            <Sparkles className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground/50">
              No wisdom found for this search.
            </h3>
            <p className="text-muted-foreground mt-2">Try different keywords or contribute a new quote.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {filteredQuotes.map((quote) => (
              <QuoteCard
                key={quote.id}
                quote={quote.quote_text}
                character={quote.character_name}
                anime={quote.anime_name}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="py-12 border-t border-white/5 text-center text-muted-foreground">
        <p>© 2024 AnimeEchoes. Philosophy in frames.</p>
      </footer>
    </div>
  );
};

export default Quotes;
