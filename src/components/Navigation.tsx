import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Sparkles, 
  Image as ImageIcon, 
  Quote, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X,
  ShieldCheck
} from "lucide-react";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { isAdmin } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const navLinks = [
    { name: "Wallpapers", path: "/wallpapers", icon: <ImageIcon className="w-4 h-4" /> },
    { name: "Quotes", path: "/quotes", icon: <Quote className="w-4 h-4" /> },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4",
        isScrolled ? "bg-background/80 backdrop-blur-xl border-b border-white/5 py-3" : "bg-transparent"
      )}
    >
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
            <Sparkles className="w-6 h-6 text-primary animate-glow" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-gradient">
            AnimeEchoes
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-all hover:text-primary",
                location.pathname === link.path ? "text-primary" : "text-foreground/70"
              )}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}

          {isAdmin && (
            <Link
              to="/admin"
              className={cn(
                "flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-all hover:text-primary",
                location.pathname === "/admin" ? "text-primary" : "text-foreground/70"
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
              <div className="flex items-center gap-2 text-xs font-black text-primary uppercase bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                <ShieldCheck className="w-3 h-3" />
                Authorized
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="hover:bg-destructive/10 hover:text-destructive rounded-xl"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <div className="hidden">
              {/* Login entry point removed for public security */}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass-card border-b border-white/5 animate-fade-in">
          <div className="flex flex-col p-6 gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 text-lg font-bold"
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 text-lg font-bold text-primary"
              >
                <LayoutDashboard className="w-5 h-5" />
                Admin Panel
              </Link>
            )}
            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 text-lg font-bold text-destructive"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
