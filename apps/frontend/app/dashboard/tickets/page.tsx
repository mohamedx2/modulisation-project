/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Mail, ArrowLeft, ArrowRight, Settings, Wrench, Info, Target, CheckCircle2, Car, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { fetchWithAuth } from "@/lib/api";
import { toast } from "sonner";

const SERVICES = [
  { id: 1, title: "Diagnostic Rapide", desc: "Analyse des codes erreurs ODB-II", icon: Target, price: "45 €" },
  { id: 2, title: "Entretien Climatisation", desc: "Recharge fluide et remplacement filtres", icon: Wrench, price: "89 €" },
  { id: 3, title: "Révision Complète", desc: "Vidange, filtres, bougies (100 points)", icon: Settings, price: "249 €" },
  { id: 4, title: "Batterie & Alternateur", desc: "Remplacement et test circuit de charge", icon: Info, price: "Sur devis" },
];

export default function ReservationPage() {
  const [step, setStep] = useState(1);
  const [vehicle, setVehicle] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const requestOtp = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth("/otp/send", {
        method: "POST",
        body: JSON.stringify({ email })
      });
      if (res?.success || res?.data?.success) {
        setStep(2);
      } else {
        toast.error("Erreur lors de l'envoi du code. Veuillez réessayer.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur serveur lors de l'envoi de l'OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    setIsLoading(true);
    try {
      const code = otp.join("");
      const res = await fetchWithAuth("/otp/verify", {
        method: "POST",
        body: JSON.stringify({ email, code })
      });

      if (res?.valid || res?.data?.valid) {
        setStep(3);
      } else {
        toast.error("Code de vérification invalide ou expiré.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la vérification de l'OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const submitReservation = async () => {
    setIsLoading(true);
    try {
      const service = SERVICES.find(s => s.id === selectedService);
      const titleStr = `${vehicle} - ${service?.title}`;
      const descStr = `Client: ${email} | Service: ${service?.desc}`;

      await fetchWithAuth("/tickets", {
        method: "POST",
        body: JSON.stringify({
          title: titleStr,
          description: descStr
        })
      });

      toast.success("Réservation confirmée et ticket créé avec succès !");
      setStep(1);
      setVehicle("");
      setEmail("");
      setOtp(["", "", "", "", "", ""]);
      setSelectedService(null);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la création du ticket.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="mb-12">
        <h1 className="text-3xl font-black tracking-tight text-center">Réservation d&apos;Intervention</h1>
        <p className="text-muted-foreground text-center mt-2">Réservez un service pour votre véhicule en quelques étapes simples.</p>

        <div className="flex items-center justify-center mt-8 relative max-w-sm mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 -z-10 rounded-full" />
          <div
            className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 -z-10 rounded-full transition-all duration-500"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 border-background shadow-sm transition-colors ${s <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="rounded-3xl border-border/50 shadow-xl overflow-hidden">
              <CardContent className="p-8 sm:p-12">
                <div className="flex flex-col items-center space-y-4 mb-8">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                    <Car className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold">Informations Véhicule</h2>
                </div>

                <div className="space-y-6 max-w-md mx-auto">
                  <div className="space-y-2">
                    <label htmlFor="vehicle" className="text-sm font-semibold text-muted-foreground cursor-pointer">Plaque d&apos;immatriculation</label>
                    <Input
                      id="vehicle"
                      placeholder="EX-123-AM"
                      className="text-lg uppercase"
                      value={vehicle}
                      onChange={(e) => setVehicle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold text-muted-foreground cursor-pointer">Adresse Email</label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="client@macopilote.fr"
                      className="text-lg"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={requestOtp}
                    disabled={!vehicle || !email || isLoading}
                    className="w-full h-12 text-base font-bold rounded-xl mt-4"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : "Continuer"}
                    {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="rounded-3xl border-border/50 shadow-xl overflow-hidden">
              <CardContent className="p-8 sm:p-12">
                <Button variant="ghost" onClick={handleBack} disabled={isLoading} className="mb-6 -ml-4">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Retour
                </Button>

                <div className="flex flex-col items-center text-center space-y-6 mb-12">
                  <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">Vérification Sécurisée</h2>
                    <p className="text-muted-foreground font-medium mt-3 max-w-md mx-auto">
                      Nous avons envoyé un code de vérification à l&apos;adresse <span className="font-bold text-foreground">{email}</span>.
                    </p>
                  </div>
                </div>

                <div className="flex justify-center gap-2 sm:gap-4 mb-8 w-full max-w-sm mx-auto">
                  {otp.map((digit, i) => (
                    <Input
                      key={i}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        const newOtp = [...otp];
                        newOtp[i] = e.target.value;
                        setOtp(newOtp);
                        if (e.target.value && i < 5) {
                          const next = document.getElementById(`otp-${i + 1}`);
                          if (next) next.focus();
                        }
                      }}
                      id={`otp-${i}`}
                      className="flex-1 w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black bg-muted/50 rounded-xl focus-visible:ring-primary shadow-inner"
                    />
                  ))}
                </div>

                <div className="flex flex-col items-center space-y-6">
                  <Button
                    onClick={verifyOtp}
                    disabled={isLoading || otp.some(d => d === "")}
                    size="lg"
                    className="w-full max-w-sm py-6 rounded-xl font-bold text-base shadow-lg"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : "Valider l'identité"}
                    {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
                  </Button>

                  <Button variant="ghost" onClick={requestOtp} disabled={isLoading} className="text-muted-foreground hover:text-primary font-bold">
                    <Mail className="w-4 h-4 mr-2" />
                    Renvoyer le code
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="mb-8 flex items-center justify-between">
              <Button variant="ghost" onClick={handleBack} disabled={isLoading}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Retour
              </Button>
              <div className="text-sm font-semibold bg-muted py-1 px-3 rounded-full">
                Véhicule: <span className="font-bold uppercase text-primary">{vehicle}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {SERVICES.map((srv) => (
                <Card
                  key={srv.id}
                  onClick={() => !isLoading && setSelectedService(srv.id)}
                  className={`cursor-pointer rounded-2xl relative overflow-hidden transition-all border-2 ${selectedService === srv.id ? "border-primary shadow-lg ring-4 ring-primary/10" : "border-border hover:border-foreground/20 hover:shadow-md"}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-4 rounded-xl ${selectedService === srv.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        <srv.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-black tracking-tight">{srv.title}</h3>
                        <p className="text-sm font-medium text-muted-foreground mt-1">{srv.desc}</p>
                        <Badge variant={selectedService === srv.id ? "default" : "secondary"} className="mt-4 text-sm px-3 py-1">
                          {srv.price}
                        </Badge>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedService === srv.id ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                        {selectedService === srv.id && <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground" />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end mt-8">
              <Button
                disabled={!selectedService || isLoading}
                onClick={submitReservation}
                size="lg"
                className="rounded-xl font-bold h-12 px-8 shadow-lg w-full sm:w-auto"
              >
                {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : "Confirmer la réservation"}
                {!isLoading && <CheckCircle2 className="w-5 h-5 ml-2" />}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
