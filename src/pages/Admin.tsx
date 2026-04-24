import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useAdmin } from "@/hooks/useAdmin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoriesManager } from "@/components/admin/CategoriesManager";
import { WallpapersManager } from "@/components/admin/WallpapersManager";
import { QuotesManager } from "@/components/admin/QuotesManager";
import { Shield, Settings2, Image as ImageIcon, MessageSquareQuote, ListTree } from "lucide-react";

const Admin = () => {
  const { user, isAdmin, loading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">Initializing Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navigation />
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-md mx-auto p-12 glass-card rounded-[3rem]">
            <div className="w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-destructive/20">
              <Shield className="w-10 h-10 text-destructive animate-glow" />
            </div>
            <h1 className="text-4xl font-black mb-4">Access Denied</h1>
            <p className="text-muted-foreground text-lg mb-8">
              You need superior privileges to enter this sector.
            </p>
            <button 
              onClick={() => navigate("/")}
              className="px-8 py-3 bg-foreground text-background rounded-xl font-bold hover:bg-foreground/90 transition-all"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navigation />
      
      <main className="container mx-auto px-6 pt-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                <Settings2 className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-bold text-primary uppercase tracking-widest">Administrator</span>
            </div>
            <h1 className="text-5xl font-black text-gradient tracking-tight">
              Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground max-w-md md:text-right">
            Command center for managing anime series, high-res wallpapers, and iconic quotes.
          </p>
        </div>

        <Tabs defaultValue="categories" className="space-y-8">
          <TabsList className="p-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl h-auto flex-wrap md:flex-nowrap">
            <TabsTrigger value="categories" className="px-6 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all flex items-center gap-2">
              <ListTree className="w-4 h-4" />
              Anime Series
            </TabsTrigger>
            <TabsTrigger value="wallpapers" className="px-6 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Wallpapers
            </TabsTrigger>
            <TabsTrigger value="quotes" className="px-6 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all flex items-center gap-2">
              <MessageSquareQuote className="w-4 h-4" />
              Quotes
            </TabsTrigger>
          </TabsList>

          <div className="mt-8 animate-fade-up">
            <TabsContent value="categories" className="m-0">
              <CategoriesManager />
            </TabsContent>

            <TabsContent value="wallpapers" className="m-0">
              <WallpapersManager />
            </TabsContent>

            <TabsContent value="quotes" className="m-0">
              <QuotesManager />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;

