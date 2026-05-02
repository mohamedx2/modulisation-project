"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, UploadCloud, CheckCircle2, Loader2, ArrowRight, Car, FileText, RefreshCw, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AddVehiclePage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Upload, 2: Scanning/Review
  const [file, setFile] = useState<File | null>(null);
  const [carFile, setCarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [carPreview, setCarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const carInputRef = useRef<HTMLInputElement>(null);

  // Form State (filled by OCR)
  const [vehicleData, setVehicleData] = useState({
    name: "",
    plate: "",
    brand: "",
    model: "",
    vin: "",
    img: ""
  });

  const handleCarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setCarFile(selected);
      setCarPreview(URL.createObjectURL(selected));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      handleOcr(selected);
    }
  };

  const handleOcr = async (selectedFile: File) => {
    setLoading(true);
    setStep(2);
    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const res = await fetchWithAuth("/ocr/carte-grise", {
        method: "POST",
        body: formData
      });
      console.log("Res", res);

      if (res) {
        const { data } = res;
        const extractedData = {
          brand: data.brand || "",
          model: data.model || "",
          plate: data.plate || "",
          vin: data.vin || "",
          name: data.brand && data.model ? `${data.brand} ${data.model}` : ""
        };
        setVehicleData(extractedData);
        toast.success("Analyse terminée !");
      }
    } catch (err) {
      console.error("OCR failed", err);
      toast.error("Échec de l'analyse OCR. Veuillez remplir manuellement.");
    } finally {
      setLoading(false);
    }
  };

  const saveVehicle = async () => {
    await saveVehicleWithData(vehicleData);
  };

  const saveVehicleWithData = async (data: typeof vehicleData) => {
    setLoading(true);
    try {
      await fetchWithAuth("/dashboard/vehicles", {
        method: "POST",
        body: JSON.stringify({
          name: data.name || `${data.brand} ${data.model}`.trim() || "Véhicule Inconnu",
          plate: data.plate,
          img: carPreview || "https://images.unsplash.com/photo-1619105432616-2f08a50f14ce?auto=format&fit=crop&q=80&w=1200"
        })
      });
      toast.success("Véhicule ajouté avec succès !");
      router.push("/dashboard");
    } catch (err) {
      console.error("Save failed", err);
      toast.error("Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 pb-24">
      <div className="mb-12">
        <h1 className="text-4xl font-black tracking-tight italic uppercase">Ajouter un Véhicule</h1>
        <p className="text-muted-foreground font-medium mt-2">Numérisez votre carte grise pour une configuration instantanée.</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card
              className="rounded-[2.5rem] border-2 border-dashed border-border/50 bg-muted/20 hover:bg-muted/30 transition-all cursor-pointer overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              <CardContent className="p-16 flex flex-col items-center justify-center text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                  <UploadCloud className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black uppercase italic tracking-tight">Scanner la Carte Grise</h2>
                <p className="text-muted-foreground mt-2 max-w-xs font-medium">Glissez votre certificat d&apos;immatriculation ou cliquez pour parcourir.</p>
                <Button className="mt-8 rounded-xl px-8 font-black uppercase h-12 shadow-lg">
                  Sélectionner un fichier
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Image Preview & Car Identity */}
            <div className="space-y-6">
              <Card className="rounded-[2rem] overflow-hidden border-none shadow-xl bg-zinc-900 group relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10 opacity-60" />
                <img
                  src={carPreview || "https://images.unsplash.com/photo-1619105432616-2f08a50f14ce?auto=format&fit=crop&q=80&w=1200"}
                  alt="Renault Clio"
                  className="w-full h-[300px] object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                />
                <div className="absolute bottom-8 left-8 z-20">
                  <Badge className="bg-primary text-primary-foreground font-black uppercase italic tracking-tighter mb-2 px-3 py-1 rounded-lg">Identifié</Badge>
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
                    {vehicleData.brand || "Renault"} {vehicleData.model || "Clio"}
                  </h2>
                </div>
              </Card>

              <div className="p-8 bg-zinc-900 rounded-[2.5rem] border border-white/5 flex gap-6 items-center shadow-2xl">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-[1.5rem] flex items-center justify-center flex-shrink-0 shadow-inner">
                  <Car className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-1">Status du véhicule</p>
                  <p className="text-sm font-bold text-white/80 leading-relaxed">
                    Prêt pour le diagnostic en ligne et le suivi d&apos;entretien personnalisé Renault Axis.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Confirmation */}
            <div className="space-y-6">
              <Card className="rounded-[2rem] border-none shadow-lg p-8 space-y-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase italic tracking-tight">Analyse terminée</h3>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Vérifiez les données extraites</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Matricule (Plate)</label>
                    <Input
                      value={vehicleData.plate || ""}
                      onChange={(e) => setVehicleData({ ...vehicleData, plate: e.target.value.toUpperCase() })}
                      className="rounded-xl h-12 font-black text-lg bg-muted/30 border-none focus-visible:ring-primary shadow-inner"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Marque</label>
                      <Input
                        value={vehicleData.brand || ""}
                        onChange={(e) => setVehicleData({ ...vehicleData, brand: e.target.value })}
                        className="rounded-xl h-12 font-bold bg-muted/30 border-none shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Modèle</label>
                      <Input
                        value={vehicleData.model || ""}
                        onChange={(e) => setVehicleData({ ...vehicleData, model: e.target.value })}
                        className="rounded-xl h-12 font-bold bg-muted/30 border-none shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Photo du véhicule (Optionnel)</label>
                    <div
                      className="rounded-xl h-24 bg-muted/30 border-2 border-dashed border-border/50 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-all overflow-hidden relative"
                      onClick={() => carInputRef.current?.click()}
                    >
                      <input type="file" ref={carInputRef} onChange={handleCarFileChange} accept="image/*" className="hidden" />
                      {carPreview ? (
                        <img src={carPreview} className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Camera className="w-6 h-6 text-muted-foreground mb-1" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Ajouter une photo</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Numéro de série (VIN)</label>
                    <Input
                      value={vehicleData.vin || ""}
                      onChange={(e) => setVehicleData({ ...vehicleData, vin: e.target.value.toUpperCase() })}
                      className="rounded-xl h-12 font-mono text-sm bg-muted/30 border-none shadow-inner"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nom d&apos;affichage</label>
                    <Input
                      value={vehicleData.name || ""}
                      onChange={(e) => setVehicleData({ ...vehicleData, name: e.target.value })}
                      className="rounded-xl h-12 font-bold bg-muted/30 border-none shadow-inner"
                    />
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl h-12 font-black uppercase italic tracking-tight"
                    onClick={() => setStep(1)}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" /> Refaire
                  </Button>
                  <Button
                    className="flex-1 rounded-xl h-12 font-black uppercase italic tracking-tight shadow-lg shadow-primary/20"
                    onClick={saveVehicle}
                    disabled={loading || !vehicleData.plate}
                  >
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Enregistrer
                  </Button>
                </div>
              </Card>

              <div className="p-6 bg-primary/5 rounded-[1.5rem] border border-primary/10 flex gap-4">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <Car className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                  En ajoutant ce véhicule, vous pourrez accéder au diagnostic en ligne, à l&apos;historique des entretiens et aux rappels constructeur Renault.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
