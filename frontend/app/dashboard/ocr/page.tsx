"use client";
import { motion } from "framer-motion";
import { Camera, UploadCloud, CheckCircle2 } from "lucide-react";

export default function OcrScannerPage() {
  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-8">
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tight text-[#1c1b1b]">Scanner de Plaque</h1>
        <p className="text-[#a1a1aa] mt-2 font-medium text-lg">Syst�me de reconnaissance automatique de v�hicules (LPR).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-black/5 shadow-xl shadow-black/[0.02] p-8 flex flex-col items-center justify-center min-h-[400px] border-dashed border-2 border-gray-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[#f5c800]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <UploadCloud className="w-16 h-16 text-[#a1a1aa] group-hover:text-[#f5c800] transition-colors mb-6" />
          <h3 className="text-xl font-bold text-[#1c1b1b] text-center mb-2">Glissez une image ici</h3>
          <p className="text-[#a1a1aa] font-medium text-center mb-8">ou cliquez pour parcourir vos fichiers (JPG, PNG)</p>
          <button className="bg-[#1c1b1b] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg hover:bg-black transition-all relative z-10 flex items-center gap-3">
            <Camera className="w-5 h-5" /> Activer la Cam�ra
          </button>
        </div>

        <div className="bg-gray-50 rounded-2xl border border-black/5 shadow-inner p-8 flex flex-col">
          <h3 className="text-lg font-black text-[#1c1b1b] mb-6">R�sultats en Direct</h3>
          
          <div className="flex-1 flex items-center justify-center flex-col text-center opacity-50">
            <div className="w-20 h-12 border-2 border-gray-300 rounded flex items-center justify-center font-mono text-xl font-black text-gray-400 mb-4">
              ---
            </div>
            <p className="text-[#71717a] font-medium">En attente d&apos;une num�risation...</p>
          </div>
          
        </div>
      </div>
    </div>
  );
}