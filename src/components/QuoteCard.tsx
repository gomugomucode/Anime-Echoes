import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";

interface QuoteCardProps {
  quote: string;
  character: string;
  anime: string;
}

const QuoteCard = ({ quote, character, anime }: QuoteCardProps) => {
  return (
    <Card className="relative overflow-hidden bg-gradient-card border-border hover:border-primary transition-all duration-300 hover:shadow-glow-purple p-6 group">
      <div className="absolute top-4 left-4 opacity-20 group-hover:opacity-30 transition-opacity">
        <Quote className="w-12 h-12 text-primary" />
      </div>
      
      <div className="relative z-10">
        <p className="text-lg text-foreground/90 italic mb-4 leading-relaxed">
          "{quote}"
        </p>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">
              {character}
            </p>
            <p className="text-xs text-muted-foreground">
              {anime}
            </p>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-tl-full blur-2xl group-hover:bg-primary/10 transition-colors" />
    </Card>
  );
};

export default QuoteCard;
