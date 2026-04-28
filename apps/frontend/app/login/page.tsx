"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Lock, User, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../providers";

export default function LoginPage() {
  const router = useRouter();
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
      await login(username, password);
      window.location.replace("/dashboard");
    } catch {
      setError("Identifiants incorrects ou serveur indisponible");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#fcf9f8] relative overflow-hidden font-sans">
      <div className="hidden lg:flex w-[55%] relative items-end justify-start bg-[#1c1b1b] overflow-hidden">
        <div className="absolute inset-0 w-full h-full opacity-60 mix-blend-overlay bg-black">
          <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_#f5c800_0%,_transparent_60%)] opacity-20 animate-pulse" />
          <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#1c1b1b_0%,transparent_50%,#1c1b1b_100%)]" />
        </div>
        
        <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-[#fcf9f8] to-transparent z-10" />
        
        <div className="relative z-20 flex flex-col justify-between h-full w-full p-16">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#f5c800] rounded-xl flex items-center justify-center shadow-lg shadow-[#f5c800]/20">
              <ShieldCheck className="w-6 h-6 text-[#1c1b1b]" />
            </div>
            <h1 className="font-black italic text-3xl tracking-tighter text-white">
              REN<span className="text-[#f5c800]">AULT</span> AXIS
            </h1>
          </div>
          <div className="max-w-lg mb-12">
            <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tight mb-6">
              Portail de <br/><span className="text-[#f5c800]">Gestion</span> Sécurisé
            </h2>
            <p className="text-[#a1a1aa] font-medium text-xl leading-relaxed">
              Accédez à vos outils de gestion de flotte, de suivi d&apos;interventions, et d&apos;analyses OCR.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-8 lg:p-24 relative z-20">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col w-full max-w-md gap-10"
        >
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-black text-[#1c1b1b] tracking-tight mb-3">Connexion</h2>
            <p className="text-[#71717a] font-medium text-lg">Entrez vos identifiants pour continuer.</p>
          </div>
          
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 font-medium text-sm text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="login-username" className="font-bold text-sm tracking-wide uppercase text-[#a1a1aa] cursor-pointer">Identifiant</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a1a1aa]" />
                <input 
                  id="login-username"
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white border border-black/10 rounded-xl px-12 py-4 font-bold text-[#1c1b1b] focus:ring-2 focus:ring-[#f5c800]/30 focus:border-[#f5c800] transition-all outline-none"
                  placeholder="ID Collaborateur"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="login-password" className="font-bold text-sm tracking-wide uppercase text-[#a1a1aa] cursor-pointer">Mot de passe</label>
                <a href="#" className="font-bold text-xs text-[#1c1b1b] hover:text-[#f5c800] transition-colors">Oublie ?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a1a1aa]" />
                <input 
                  id="login-password"
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-black/10 rounded-xl px-12 py-4 font-bold text-[#1c1b1b] focus:ring-2 focus:ring-[#f5c800]/30 focus:border-[#f5c800] transition-all outline-none shadow-sm"
                  placeholder="********"
                  required
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-3 mt-4">
              <button 
                type="submit"
                disabled={isLoading || !username || !password}
                className="w-full bg-[#1c1b1b] hover:bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-colors shadow-xl shadow-black/[0.04] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Connexion...
                  </>
                ) : (
                  <>
                    Se connecter <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="pt-8 border-t border-black/5 flex flex-col items-center justify-center gap-4">
            <div className="flex gap-2">
              <span className="font-medium text-[#71717a] text-sm">Pas encore de compte ?</span>
              <Link href="/signup" className="font-bold text-[#1c1b1b] text-sm hover:text-[#f5c800] transition-colors">Creer un compte</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}