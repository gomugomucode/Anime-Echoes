import { Card } from "@/components/ui/card";
import { Quote, User as UserIcon, Sparkles } from "lucide-react";

interface QuoteCardProps {
  quote: string;
  character: string;
  anime: string;
}

const QuoteCard = ({ quote, character, anime }: QuoteCardProps) => {
  return (
    <Card className="group relative p-10 glass-card border-white/5 rounded-[2.5rem] transition-all duration-500 hover:border-secondary/30 hover:shadow-[0_0_50px_rgba(219,39,119,0.1)] overflow-hidden">
      {/* Decorative Quote Icon */}
      <div className="absolute top-8 left-8 text-secondary/5 -z-0">
        <Quote className="w-24 h-24" />
      </div>
      
      <div className="relative z-10">
        <div className="mb-8">
          <Quote className="w-8 h-8 text-secondary mb-6 opacity-50 group-hover:opacity-100 transition-opacity" />
          <p className="text-xl md:text-2xl font-medium leading-relaxed italic text-foreground/90 tracking-tight">
            "{quote}"
          </p>
        </div>
        
        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center border border-secondary/20 transition-transform group-hover:scale-110">
              <UserIcon className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h4 className="font-black text-foreground tracking-tight">{character}</h4>
              <p className="text-xs font-bold text-secondary uppercase tracking-widest">
                {anime}
              </p>
            </div>
          </div>
          
          <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <Sparkles className="w-4 h-4 text-secondary animate-glow" />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative background element */}
      <div className="absolute bottom-[-10%] right-[-5%] w-64 h-64 bg-secondary/5 rounded-full blur-3xl group-hover:bg-secondary/10 transition-colors" />
    </Card>
  );
};

export default QuoteCard;
