"use client";
import { motion } from "framer-motion";
import { ShieldCheck, Phone, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Step1OTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const router = useRouter();

  return (
    <div className="p-8 lg:p-12 max-w-4xl mx-auto flex items-center justify-center min-h-[80vh]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white rounded-3xl border border-black/5 shadow-2xl shadow-black/[0.04] p-10 w-full relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-[#fcf9f8]">
          <div className="h-full bg-[#f5c800] w-1/2" />
        </div>

        <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-[#1c1b1b] font-bold text-sm uppercase tracking-wide transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>
        
        <div className="flex flex-col items-center text-center space-y-6 mb-12">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-xl shadow-green-500/10">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#1c1b1b]">V�rification S�curis�e</h1>
            <p className="text-[#71717a] font-medium text-lg mt-3 max-w-md mx-auto">
              Nous avons envoy� un code de v�rification au <span className="font-bold text-[#1c1b1b]">+33 6 ** ** ** 42</span>.
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-3 mb-10 w-full max-w-sm mx-auto">
          {otp.map((digit, i) => (
            <input
              key={i}
              type="text"
              maxLength={1}
              className="flex-1 w-14 h-16 text-center text-3xl font-black text-[#1c1b1b] bg-gray-50 border border-black/10 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#f5c800]/20 focus:border-[#f5c800] outline-none transition-all shadow-inner"
            />
          ))}
        </div>

        <div className="flex flex-col items-center space-y-6">
          <button 
            onClick={() => router.push("/dashboard/step2")}
            className="bg-[#1c1b1b] hover:bg-black text-white w-full max-w-sm py-4 rounded-xl font-bold flex flex-row items-center justify-center gap-3 transition-colors shadow-xl shadow-black/[0.05] group"
          >
            Valider l&apos;identit� <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button className="flex items-center gap-2 text-sm font-bold text-[#a1a1aa] hover:text-[#f5c800] transition-colors">
            <Phone className="w-4 h-4" />
            Renvoyer le code dans 00:59
          </button>
        </div>
      </motion.div>
    </div>
  );
}