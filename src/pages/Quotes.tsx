import Navigation from "@/components/Navigation";
import QuoteCard from "@/components/QuoteCard";
import { Sparkles } from "lucide-react";

// Mock data - will be replaced with database
const mockQuotes = [
  {
    id: "1",
    quote: "I'm not gonna run away, I never go back on my word! That's my nindo: my ninja way!",
    character: "Naruto Uzumaki",
    anime: "Naruto"
  },
  {
    id: "2",
    quote: "If you don't take risks, you can't create a future.",
    character: "Monkey D. Luffy",
    anime: "One Piece"
  },
  {
    id: "3",
    quote: "It's not the face that makes someone a monster, it's the choices they make with their lives.",
    character: "Naruto Uzumaki",
    anime: "Naruto"
  },
  {
    id: "4",
    quote: "I'll leave tomorrow's problems to tomorrow's me.",
    character: "Saitama",
    anime: "One Punch Man"
  },
  {
    id: "5",
    quote: "The world isn't perfect. But it's there for us, doing the best it can. That's what makes it so damn beautiful.",
    character: "Roy Mustang",
    anime: "Fullmetal Alchemist"
  },
  {
    id: "6",
    quote: "Hard work is worthless for those that don't believe in themselves.",
    character: "Naruto Uzumaki",
    anime: "Naruto"
  }
];

const Quotes = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Inspiring Words</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Anime Quotes
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Find inspiration in the wisdom of your favorite anime characters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {mockQuotes.map((quote) => (
              <QuoteCard
                key={quote.id}
                quote={quote.quote}
                character={quote.character}
                anime={quote.anime}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Quotes;
