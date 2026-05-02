"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Lock, User, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const { login } = useAuth();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const user = await login(username, password);
      if (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") {
        window.location.replace("/adminDashboard");
      } else {
        window.location.replace("/dashboard");
      }
    } catch {
      setError("Identifiants incorrects ou serveur indisponible");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-6 bg-black selection:bg-primary selection:text-black overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute inset-0 mesh-gradient opacity-40 z-0" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -mr-64 -mt-64 z-0 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] -ml-32 -mb-32 z-0 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg relative z-10"
      >
        <Card className="rounded-[3rem] border-white/10 bg-white/[0.03] backdrop-blur-3xl shadow-2xl overflow-hidden relative group">
          <CardContent className="p-12 sm:p-16 space-y-12">
            
            {/* Logo & Header */}
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center shadow-[0_20px_40px_rgba(255,203,5,0.2)] group-hover:rotate-6 transition-transform duration-500">
                <ShieldCheck className="w-10 h-10 text-black" />
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                  REN<span className="text-primary">AULT</span> AXIS
                </h1>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Secured Access Portal</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-8">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-black uppercase tracking-widest text-center"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-1">Identifiant</label>
                  <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                    <Input 
                      type="text" 
                      placeholder="ID COLLABORATEUR"
                      className="h-16 pl-16 rounded-2xl bg-white/5 border-white/10 text-white font-bold placeholder:text-white/10 focus-visible:ring-primary shadow-inner text-lg uppercase tracking-tight"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between px-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Mot de passe</label>
                    <Link href="#" className="text-[9px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">Oublié ?</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                    <Input 
                      type="password" 
                      placeholder="••••••••"
                      className="h-16 pl-16 rounded-2xl bg-white/5 border-white/10 text-white font-bold placeholder:text-white/10 focus-visible:ring-primary shadow-inner text-lg"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading || !username || !password}
                className="w-full h-18 text-xl font-black uppercase italic tracking-tight rounded-2xl shadow-[0_20px_40px_rgba(255,203,5,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {isLoading ? <Loader2 className="w-7 h-7 animate-spin" /> : <>Connecter <ArrowRight className="w-7 h-7 ml-3" /></>}
              </Button>
            </form>

            <div className="pt-8 border-t border-white/5 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                Pas encore de compte ? <Link href="/signup" className="text-primary hover:underline underline-offset-4 ml-2">Créer un profil</Link>
              </p>
            </div>
          </CardContent>

          {/* Decorative stripes for consistency */}
          <div className="absolute top-0 right-0 w-24 h-full flex gap-1 opacity-[0.03] rotate-12 -mr-8 pointer-events-none group-hover:opacity-[0.08] transition-opacity">
             <div className="w-4 h-full bg-primary" />
             <div className="w-2 h-full bg-primary" />
             <div className="w-8 h-full bg-primary" />
          </div>
        </Card>
      </motion.div>
    </div>
  );
}