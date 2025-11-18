import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const Navigation = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <Sparkles className="w-6 h-6 text-primary animate-glow" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              GenArtHub
            </span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link to="/">
              <Button variant="ghost" className="text-foreground hover:text-primary transition-colors">
                Home
              </Button>
            </Link>
            <Link to="/wallpapers">
              <Button variant="ghost" className="text-foreground hover:text-primary transition-colors">
                Wallpapers
              </Button>
            </Link>
            <Link to="/quotes">
              <Button variant="ghost" className="text-foreground hover:text-primary transition-colors">
                Quotes
              </Button>
            </Link>
            {user ? (
              <>
                <Link to="/admin">
                  <Button variant="ghost" className="text-foreground hover:text-primary transition-colors">
                    Admin
                  </Button>
                </Link>
                <Button 
                  variant="default" 
                  className="bg-primary hover:bg-primary/90 shadow-glow-purple"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="default" className="bg-primary hover:bg-primary/90 shadow-glow-purple">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
