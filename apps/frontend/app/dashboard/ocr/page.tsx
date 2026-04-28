"use client";
import { motion } from "framer-motion";
import { Camera, UploadCloud, CheckCircle2, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "../../providers";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/ocr/matricule`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur de numérisation OCR");
      setResult(data.data !== undefined ? data.data : data);
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-8">
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tight">Scanner de Plaque</h1>
        <p className="text-muted-foreground mt-2 font-medium text-lg">Système de reconnaissance automatique de véhicules (LPR).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card 
          className={`rounded-2xl overflow-hidden shadow-xl transition-all border-2 border-dashed ${isDragOver ? 'border-primary bg-primary/5' : 'border-border'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
        >
          <CardContent className="p-8 flex flex-col items-center justify-center min-h-[400px] h-full cursor-pointer relative">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />

            {!file ? (
              <div className="flex flex-col items-center">
                <UploadCloud className="w-16 h-16 text-muted-foreground hover:text-primary transition-colors mb-6" />
                <h3 className="text-xl font-bold text-center mb-2">Glissez une image ici</h3>
                <p className="text-muted-foreground font-medium text-center mb-8">ou cliquez pour parcourir vos fichiers (JPG, PNG)</p>
                <Button 
                  aria-label="Activer la caméra"
                  onClick={(e) => { e.stopPropagation(); /* Logic for camera  */ }} 
                  size="lg"
                  className="rounded-xl font-bold shadow-lg"
                >
                  <Camera className="w-5 h-5 mr-2" /> Activer la Caméra
                </Button>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center cursor-default">
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button 
                    aria-label="Refaire une photo"
                    onClick={(e) => { e.stopPropagation(); resetForm(); }} 
                    variant="destructive" size="icon" className="rounded-full shadow-lg"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </Button>
                </div>
                <img src={preview!} alt="Aperçu" className="w-full h-full object-contain rounded-xl max-h-[300px] shadow-sm mb-6" />
                <Button 
                  aria-label="Lancer l'analyse OCR"
                  onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                  disabled={loading}
                  className="rounded-xl font-bold shadow-lg shadow-primary/20"
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Camera className="w-4 h-4 mr-2" />}
                  {loading ? 'Analyse en cours...' : 'Lancer l\'analyse'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-inner bg-muted/20">
          <CardContent className="p-8 flex flex-col h-full">
            <h3 className="text-lg font-black mb-6">Résultat de l&apos;analyse</h3>
            
            {error && (
              <Alert variant="destructive" className="mb-6 rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-medium ml-2">{error}</AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className="w-full max-w-xl mx-auto space-y-4">
                <Skeleton className="h-8 w-64 mx-auto" />
                <Skeleton className="h-32 w-full rounded-2xl" />
              </div>
            ) : result ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col justify-center items-center">
                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-6 shadow-sm ring-8 ring-green-500/5">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest mb-2">Matricule détectée</p>
                <div className="bg-background px-8 py-4 rounded-xl border border-border font-mono text-4xl font-black tracking-wider shadow-sm mb-6">
                  {result.matricule || "NON DÉTECTÉ"}
                </div>
                
                <div className="w-full bg-background p-4 rounded-xl border border-border shadow-sm mt-4 text-left">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Données Brutes (Raw)</p>
                  <div className="text-sm font-mono whitespace-pre-wrap break-all text-muted-foreground">
                    {result.raw || "Aucune donnée brute extraite."}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex items-center justify-center flex-col text-center opacity-50">
                <div className="w-20 h-12 border-2 border-dashed border-muted-foreground/30 rounded flex items-center justify-center font-mono text-xl font-black text-muted-foreground mb-4">
                  ---
                </div>
                <p className="text-muted-foreground font-medium">
                  {loading ? "Traitement de l'image en cours..." : "En attente d'une numérisation..."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}