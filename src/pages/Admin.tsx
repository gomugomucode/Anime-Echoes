import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useAdmin } from "@/hooks/useAdmin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoriesManager } from "@/components/admin/CategoriesManager";
import { WallpapersManager } from "@/components/admin/WallpapersManager";
import { QuotesManager } from "@/components/admin/QuotesManager";
import { Shield } from "lucide-react";

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
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-2xl mx-auto text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-destructive" />
            <h1 className="text-4xl font-bold mb-4 text-foreground">Access Denied</h1>
            <p className="text-muted-foreground text-lg">
              You need admin privileges to access this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage anime categories, wallpapers, and quotes
          </p>
        </div>

        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="categories">Anime Categories</TabsTrigger>
            <TabsTrigger value="wallpapers">Wallpapers</TabsTrigger>
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <CategoriesManager />
          </TabsContent>

          <TabsContent value="wallpapers">
            <WallpapersManager />
          </TabsContent>

          <TabsContent value="quotes">
            <QuotesManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
