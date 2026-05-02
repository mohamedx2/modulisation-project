"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Lock, User, Mail, ShieldCheck, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
  });

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signup(formData.email, formData.password, formData.prenom, formData.nom);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Echec de la creation du compte");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-6 bg-black selection:bg-primary selection:text-black overflow-hidden font-sans">
      
      {/* Background Elements */}
      <div className="absolute inset-0 mesh-gradient opacity-40 z-0" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -ml-64 -mt-64 z-0 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] -mr-32 -mb-32 z-0 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg relative z-10"
      >
        <Card className="rounded-[3rem] border-white/10 bg-white/[0.03] backdrop-blur-3xl shadow-2xl overflow-hidden relative group">
          <CardContent className="p-12 sm:p-16">
            
            {/* Header */}
            {step < 3 && (
              <div className="flex flex-col items-center text-center space-y-6 mb-12">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-[0_20px_40px_rgba(255,203,5,0.2)]">
                  <ShieldCheck className="w-8 h-8 text-black" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">
                    CREER UN <span className="text-primary">PROFIL</span>
                  </h1>
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">Step {step} of 2 — Identity Registration</p>
                </div>
                
                {/* Progress Bar */}
                <div className="flex gap-2 w-full max-w-[200px] mt-4">
                  <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? "bg-primary" : "bg-white/10"}`} />
                  <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? "bg-primary" : "bg-white/10"}`} />
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-1">Prénom</label>
                      <div className="relative">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                        <Input 
                          placeholder="EX: JEAN"
                          className="h-16 pl-16 rounded-2xl bg-white/5 border-white/10 text-white font-bold placeholder:text-white/10 focus-visible:ring-primary uppercase"
                          value={formData.prenom}
                          onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-1">Nom de famille</label>
                      <div className="relative">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                        <Input 
                          placeholder="EX: DUPONT"
                          className="h-16 pl-16 rounded-2xl bg-white/5 border-white/10 text-white font-bold placeholder:text-white/10 focus-visible:ring-primary uppercase"
                          value={formData.nom}
                          onChange={(e) => setFormData({...formData, nom: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={nextStep}
                    disabled={!formData.nom || !formData.prenom}
                    className="w-full h-18 text-xl font-black uppercase italic tracking-tight rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Continuer <ArrowRight className="w-7 h-7 ml-3" />
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
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
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-1">Email Professionnel</label>
                      <div className="relative">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                        <Input 
                          type="email"
                          placeholder="NOM.PRENOM@RENAULT.COM"
                          className="h-16 pl-16 rounded-2xl bg-white/5 border-white/10 text-white font-bold placeholder:text-white/10 focus-visible:ring-primary uppercase"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-1">Mot de passe</label>
                      <div className="relative">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                        <Input 
                          type="password"
                          placeholder="••••••••"
                          className="h-16 pl-16 rounded-2xl bg-white/5 border-white/10 text-white font-bold placeholder:text-white/10 focus-visible:ring-primary"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <Button 
                      onClick={handleRegister}
                      disabled={!formData.email || formData.password.length < 8 || isLoading}
                      className="w-full h-18 text-xl font-black uppercase italic tracking-tight rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      {isLoading ? <Loader2 className="w-7 h-7 animate-spin" /> : <>Finaliser <CheckCircle2 className="w-7 h-7 ml-3" /></>}
                    </Button>
                    <Button variant="ghost" onClick={prevStep} className="font-black uppercase tracking-widest text-[10px] text-white/40 hover:text-white transition-colors">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Revenir en arrière
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center space-y-10 py-8"
                >
                  <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-10" />
                    <CheckCircle2 className="w-16 h-16 text-primary" />
                  </div>
                  
                  <div className="space-y-4">
                    <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Bienvenue !</h2>
                    <p className="text-white/40 font-bold leading-relaxed max-w-sm">
                      Votre compte technique a été provisionné avec succès sur l'infrastructure Renault Axis.
                    </p>
                  </div>

                  <Button 
                    onClick={() => router.push("/login")}
                    className="w-full h-18 text-xl font-black uppercase italic tracking-tight rounded-2xl shadow-2xl"
                  >
                    Se connecter <ChevronRight className="w-7 h-7 ml-2" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {step < 3 && (
              <div className="pt-8 mt-12 border-t border-white/5 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  Déjà membre ? <Link href="/login" className="text-primary hover:underline underline-offset-4 ml-2">Connexion</Link>
                </p>
              </div>
            )}
          </CardContent>

          {/* Decorative stripes */}
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
