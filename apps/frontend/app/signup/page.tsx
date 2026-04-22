"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Lock, User, Mail, ShieldCheck, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
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

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate backend API call
    setTimeout(() => {
      setStep(3); // Success step
    }, 800);
  };

  const slideVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
    exit: { opacity: 0, x: -30, transition: { duration: 0.3, ease: "easeIn" as const } },
  };

  return (
    <div className="flex min-h-screen w-full bg-[#fcf9f8] relative overflow-hidden font-sans">
      {/* Visual Column - Left */}
      <div className="hidden lg:flex w-[45%] relative items-end justify-start bg-[#1c1b1b] overflow-hidden">
        <div className="absolute inset-0 w-full h-full opacity-60 mix-blend-overlay bg-black">
          <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_#f5c800_0%,_transparent_60%)] opacity-20 animate-pulse" />
          <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_bottom,#1c1b1b_0%,transparent_50%,#1c1b1b_100%)]" />
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
              Rejoignez le <br/><span className="text-[#f5c800]">SaaS Pro</span>
            </h2>
            <p className="text-[#a1a1aa] font-medium text-xl leading-relaxed">
              Ouvrez votre compte pour profiter de notre architecture modulée, du traitement OCR et des capacités cloud natives.
            </p>
          </div>
        </div>
      </div>

      {/* Form Column - Right */}
      <div className="flex flex-1 items-center justify-center p-8 lg:p-24 relative z-20">
        <div className="w-full max-w-md">
          {/* Progress Indicators */}
          {step < 3 && (
            <div className="flex items-center gap-2 mb-10 w-full">
              <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-[#f5c800]" : "bg-black/10"} transition-colors duration-500`} />
              <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-[#f5c800]" : "bg-black/10"} transition-colors duration-500`} />
            </div>
          )}

          <AnimatePresence mode="wait" initial={false}>
            {step === 1 && (
              <motion.div 
                key="step1"
                variants={slideVariants}
                initial="hidden" animate="visible" exit="exit"
                className="flex flex-col gap-8"
              >
                <div>
                  <h2 className="text-4xl font-black text-[#1c1b1b] tracking-tight mb-3">Créer un compte</h2>
                  <p className="text-[#71717a] font-medium text-lg">Parlez-nous un peu de vous.</p>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="font-bold text-sm tracking-wide uppercase text-[#a1a1aa]">Prénom</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a1a1aa]" />
                      <input 
                        type="text" 
                        value={formData.prenom}
                        onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                        className="w-full bg-white border border-black/10 rounded-xl px-12 py-4 font-bold text-[#1c1b1b] focus:ring-2 focus:ring-[#f5c800]/30 focus:border-[#f5c800] transition-all outline-none shadow-sm"
                        placeholder="Ex: Jean"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="font-bold text-sm tracking-wide uppercase text-[#a1a1aa]">Nom de famille</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a1a1aa]" />
                      <input 
                        type="text" 
                        value={formData.nom}
                        onChange={(e) => setFormData({...formData, nom: e.target.value})}
                        className="w-full bg-white border border-black/10 rounded-xl px-12 py-4 font-bold text-[#1c1b1b] focus:ring-2 focus:ring-[#f5c800]/30 focus:border-[#f5c800] transition-all outline-none shadow-sm"
                        placeholder="Ex: Dupont"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={nextStep}
                  disabled={!formData.nom || !formData.prenom}
                  className="w-full mt-2 bg-[#1c1b1b] hover:bg-black disabled:bg-[#1c1b1b]/50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-black/[0.04]"
                >
                  Continuer <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                variants={slideVariants}
                initial="hidden" animate="visible" exit="exit"
                className="flex flex-col gap-8"
              >
                <div>
                  <button onClick={prevStep} className="flex items-center gap-2 text-sm font-bold text-[#a1a1aa] hover:text-[#1c1b1b] transition-colors mb-6">
                    <ArrowLeft className="w-4 h-4" /> Retour
                  </button>
                  <h2 className="text-4xl font-black text-[#1c1b1b] tracking-tight mb-3">Sécuriser le compte</h2>
                  <p className="text-[#71717a] font-medium text-lg">Définissez vos identifiants d&apos;accès.</p>
                </div>
                
                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="space-y-2">
                    <label className="font-bold text-sm tracking-wide uppercase text-[#a1a1aa]">Adresse Email Professionnelle</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a1a1aa]" />
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-white border border-black/10 rounded-xl px-12 py-4 font-bold text-[#1c1b1b] focus:ring-2 focus:ring-[#f5c800]/30 focus:border-[#f5c800] transition-all outline-none shadow-sm"
                        placeholder="jean.dupont@entreprise.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="font-bold text-sm tracking-wide uppercase text-[#a1a1aa]">Mot de passe (Min. 8 caractères)</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a1a1aa]" />
                      <input 
                        type="password" 
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full bg-white border border-black/10 rounded-xl px-12 py-4 font-bold text-[#1c1b1b] focus:ring-2 focus:ring-[#f5c800]/30 focus:border-[#f5c800] transition-all outline-none shadow-sm"
                        placeholder="••••••••"
                        required
                        minLength={8}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={!formData.email || formData.password.length < 8}
                    className="w-full mt-4 bg-[#f5c800] hover:bg-[#e0b700] disabled:bg-[#f5c800]/50 disabled:cursor-not-allowed text-[#1c1b1b] py-4 rounded-xl font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#f5c800]/20"
                  >
                    Valider l&apos;inscription <CheckCircle2 className="w-5 h-5" />
                  </button>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1, transition: { type: "spring", bounce: 0.5, duration: 0.6 } }}
                className="flex flex-col items-center justify-center text-center gap-6 py-12"
              >
                <div className="w-24 h-24 rounded-full bg-[#f5c800]/20 flex items-center justify-center relative mb-4">
                  <div className="absolute inset-0 bg-[#f5c800] rounded-full animate-ping opacity-20" />
                  <CheckCircle2 className="w-12 h-12 text-[#1c1b1b]" />
                </div>
                
                <div>
                  <h2 className="text-4xl font-black text-[#1c1b1b] tracking-tight mb-4">Compte créé !</h2>
                  <p className="text-[#71717a] font-medium text-lg leading-relaxed max-w-sm">
                    Votre espace personnel a été généré avec succès. Vous pouvez maintenant vous connecter.
                  </p>
                </div>

                <button 
                  onClick={() => router.push("/login")}
                  className="w-full mt-6 bg-[#1c1b1b] hover:bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-colors shadow-2xl"
                >
                  Aller à la connexion <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Links Footer */}
          {step < 3 && (
            <div className="pt-8 mt-8 border-t border-black/5 flex items-center justify-center gap-2">
              <span className="font-medium text-[#71717a] text-sm">Vous avez déjà un compte ?</span>
              <Link href="/login" className="font-bold text-[#1c1b1b] text-sm hover:text-[#f5c800] transition-colors">
                Connectez-vous
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
