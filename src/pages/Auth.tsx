import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Mail, Lock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Auto-setup: Ensure the admin role exists for this user
      try {
        const roleRef = doc(db, "user_roles", user.uid);
        const roleSnap = await getDoc(roleRef);
        
        if (!roleSnap.exists()) {
          // Promote this login to admin automatically if no role is found
          await setDoc(roleRef, { role: "admin" });
        }
      } catch (roleError) {
        console.error("Auto-role setup failed:", roleError);
      }
      
      toast({
        title: "Access Granted",
        description: "Welcome back, Master.",
      });
      navigate("/admin");
    } catch (error: any) {
      toast({
        title: "Access Denied",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full" />

      <Link to="/" className="absolute top-8 left-8 inline-flex items-center text-muted-foreground hover:text-primary transition-colors group">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-bold uppercase tracking-widest">Exit Portal</span>
      </Link>

      <Card className="w-full max-w-md p-8 glass-card border-white/10 rounded-[2.5rem] relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6 animate-pulse">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Admin Portal</h1>
          <p className="text-muted-foreground text-sm">Secure authorization required</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground/70 uppercase tracking-widest ml-1">Email Identifier</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="admin@echoes.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl focus:ring-primary text-foreground placeholder:text-muted-foreground/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground/70 uppercase tracking-widest ml-1">Security Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/5 border-white/10 h-14 pl-12 rounded-2xl focus:ring-primary text-foreground placeholder:text-muted-foreground/30"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_rgba(147,51,234,0.3)] transition-all transform active:scale-95"
          >
            {loading ? "Verifying..." : "Authorize Access"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            Restricted System • Authorized Personnel Only
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
