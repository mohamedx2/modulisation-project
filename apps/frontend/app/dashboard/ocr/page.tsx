"use client";
import { motion } from "framer-motion";
import { Camera, UploadCloud, CheckCircle2, Loader2, AlertCircle, RefreshCw, Activity } from "lucide-react";
import { useAuth } from "../../providers";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchWithAuth } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function OcrScannerPage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (selected.type.startsWith('image/')) {
        setFile(selected);
        setPreview(URL.createObjectURL(selected));
        setResult(null);
        setError(null);
      } else {
        setError("Veuillez sélectionner une image valide (JPG, PNG).");
      }
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const data = await fetchWithAuth("/ocr/matricule", {
        method: "POST",
        body: formData,
      });
      setResult(data.data !== undefined ? data.data : data);
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 xl:p-12 max-w-7xl mx-auto space-y-6 sm:space-y-8 lg:space-y-12 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[200px] sm:w-[300px] lg:w-[500px] h-[200px] sm:h-[300px] lg:h-[500px] bg-primary/5 rounded-full blur-[80px] sm:blur-[100px] lg:blur-[120px] -mr-32 sm:-mr-48 lg:-mr-64 -mt-32 sm:-mt-48 lg:-mt-64 z-0 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[150px] sm:w-[200px] lg:w-[300px] h-[150px] sm:h-[200px] lg:h-[300px] bg-primary/5 rounded-full blur-[60px] sm:blur-[80px] lg:blur-[100px] -ml-16 sm:-ml-32 lg:-ml-32 -mb-16 sm:-mb-32 lg:-mb-32 z-0 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8 lg:mb-12 relative z-10"
      >
        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tighter uppercase italic leading-none">Diagnostic <span className="text-primary italic">Optique</span></h1>
        <p className="text-muted-foreground mt-3 sm:mt-4 font-bold text-base sm:text-lg max-w-2xl">Système de reconnaissance automatique de matricules (LPR) haute précision par <span className="text-foreground">Renault Axis</span>.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 relative z-10">
        <Card 
          className={`rounded-2xl sm:rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-500 border-none relative group ${
            isDragOver ? 'ring-4 ring-primary bg-primary/5' : 'bg-white dark:bg-zinc-900'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
        >
          <CardContent className="p-6 sm:p-8 lg:p-12 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] h-full cursor-pointer relative">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />

            {!file ? (
              <div className="flex flex-col items-center text-center space-y-8">
                <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner">
                  <UploadCloud className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Scanner une image</h3>
                  <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest opacity-60">Glissez-déposez ou cliquez pour parcourir</p>
                </div>
                <Button 
                  aria-label="Activer la caméra"
                  onClick={(e) => { e.stopPropagation(); }} 
                  size="lg"
                  className="rounded-2xl font-black uppercase italic tracking-tight h-14 px-8 shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all"
                >
                  <Camera className="w-6 h-6 mr-3" /> Activer la Caméra
                </Button>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center cursor-default space-y-8">
                <div className="absolute top-8 right-8 z-20">
                  <Button 
                    aria-label="Refaire une photo"
                    onClick={(e) => { e.stopPropagation(); resetForm(); }} 
                    variant="destructive" size="icon" className="rounded-full w-12 h-12 shadow-2xl active:scale-90 transition-all"
                  >
                    <RefreshCw className="w-6 h-6" />
                  </Button>
                </div>
                <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden bg-black shadow-2xl border-4 border-zinc-100 dark:border-zinc-800">
                  <img src={preview!} alt="Aperçu" className="w-full h-full object-contain opacity-80" />
                  
                  {/* Diagnostic Scanning Line */}
                  {loading && (
                    <motion.div 
                      initial={{ top: "0%" }}
                      animate={{ top: "100%" }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 w-full h-1 bg-primary shadow-[0_0_20px_#FFCB05] z-10"
                    />
                  )}
                  
                  {/* Grid Overlay */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none" 
                       style={{ backgroundImage: 'linear-gradient(#FFCB05 1px, transparent 1px), linear-gradient(90deg, #FFCB05 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
                  />
                </div>

                <Button 
                  aria-label="Lancer l'analyse OCR"
                  onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                  disabled={loading}
                  className="h-16 px-12 rounded-2xl font-black uppercase italic tracking-tight text-xl shadow-2xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all"
                >
                  {loading ? <Loader2 className="w-7 h-7 mr-3 animate-spin" /> : <Activity className="w-7 h-7 mr-3" />}
                  {loading ? 'Analyse en cours...' : 'Lancer l\'analyse'}
                </Button>
              </div>
            )}
            
            {/* Decorative stripes for consistency */}
            <div className="absolute top-0 right-0 w-24 h-full flex gap-1 opacity-[0.02] rotate-12 -mr-8 pointer-events-none">
               <div className="w-4 h-full bg-primary" />
               <div className="w-2 h-full bg-primary" />
               <div className="w-8 h-full bg-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl sm:rounded-[2rem] lg:rounded-[3rem] border-none shadow-sm bg-zinc-50 dark:bg-zinc-900/50 flex flex-col relative overflow-hidden">
          <CardContent className="p-6 sm:p-8 lg:p-12 flex flex-col h-full relative z-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-6 sm:mb-8 lg:mb-12 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Rapport de Scan
            </h3>
            
            {error && (
              <Alert variant="destructive" className="mb-8 rounded-2xl bg-destructive/10 border-none p-6">
                <AlertCircle className="h-6 w-6" />
                <AlertDescription className="font-black uppercase italic text-sm ml-3">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex-1 flex flex-col justify-center">
              {loading ? (
                <div className="space-y-8">
                  <div className="flex justify-center">
                    <Loader2 className="w-16 h-16 animate-spin text-primary opacity-20" />
                  </div>
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-40 w-full rounded-[2rem]" />
                  </div>
                </div>
              ) : result ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner">
                      <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                    </div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-4">Matricule Identifiée</p>
                    <div className="bg-zinc-950 text-white px-10 py-6 rounded-[2rem] border border-zinc-800 font-mono text-5xl font-black tracking-widest shadow-2xl italic">
                      {result.matricule || "ERREUR"}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Flux de Données (Raw)</label>
                    <div className="bg-white dark:bg-zinc-950 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-inner font-mono text-sm leading-relaxed text-muted-foreground overflow-auto max-h-[200px]">
                      <div className="flex items-center gap-2 text-primary mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span className="font-black text-[9px] uppercase tracking-widest">Metadata Extraction</span>
                      </div>
                      {result.raw || "Aucune métadonnée brute extraite."}
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase italic tracking-tight border-primary/20 text-primary hover:bg-primary/10 transition-all">
                    Exporter le Diagnostic &rarr;
                  </Button>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center text-center space-y-6 opacity-30">
                  <div className="w-32 h-16 border-4 border-dashed border-zinc-400 rounded-2xl flex items-center justify-center font-mono text-3xl font-black text-zinc-400 italic">
                    --- ---
                  </div>
                  <p className="text-zinc-500 font-black uppercase italic tracking-widest text-xs">Système prêt pour numérisation</p>
                </div>
              )}
            </div>
          </CardContent>
          
          {/* Decorative background element for the results panel */}
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -mr-32 -mb-32 rounded-full" />
        </Card>
      </div>
    </div>
  );
}