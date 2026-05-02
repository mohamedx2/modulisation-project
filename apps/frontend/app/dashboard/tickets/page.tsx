/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Mail, 
  ArrowLeft, 
  ArrowRight, 
  Settings, 
  Wrench, 
  Info, 
  Target, 
  CheckCircle2, 
  Car, 
  Loader2, 
  Calendar, 
  AlertCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { fetchWithAuth } from "@/lib/api";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingVehicles, setFetchingVehicles] = useState(true);
  const [reservedSlots, setReservedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  useEffect(() => {
    async function loadVehicles() {
      try {
        const res = await fetchWithAuth("/dashboard/vehicles");
        const data = res.data || res;
        setVehicles(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load vehicles", err);
      } finally {
        setFetchingVehicles(false);
      }
    }
    loadVehicles();
  }, []);

  useEffect(() => {
    async function loadReserved() {
      if (step === 2) {
        setLoadingSlots(true);
        try {
          const start = new Date();
          const end = new Date();
          end.setDate(end.getDate() + 14);
          const res = await fetchWithAuth(`/tickets/reserved-slots?start=${start.toISOString()}&end=${end.toISOString()}`);
          const data = res.data || res;
          setReservedSlots(Array.isArray(data) ? data.map((d: any) => new Date(d).toISOString()) : []);
        } catch (err) {
          console.error("Failed to load reserved slots", err);
        } finally {
          setLoadingSlots(false);
        }
      }
    }
    loadReserved();
  }, [step]);

  const generateDays = () => {
    const days = [];
    let current = new Date();
    current.setHours(0, 0, 0, 0);
    
    let count = 0;
    while (count < 14) {
      if (current.getDay() !== 0 && current.getDay() !== 6) {
        days.push(new Date(current));
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const morningSlots = ["09:00", "10:00", "11:00", "12:00"];
  const afternoonSlots = ["13:00", "14:00", "15:00", "16:00"];

  const isReserved = (date: Date, time: string) => {
    const slotDate = new Date(date);
    const [h, m] = time.split(':');
    slotDate.setHours(parseInt(h), parseInt(m), 0, 0);
    return reservedSlots.includes(slotDate.toISOString());
  };

  const handleSlotClick = (date: Date, time: string) => {
    if (isReserved(date, time)) return;
    setAppointmentDate(date.toISOString().split('T')[0]);
    setAppointmentTime(time);
  };

  const days = generateDays();
  const selectedDay = days[selectedDayIndex];

  const handleBack = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const goToDateTime = () => {
    if (!vehicle || !email) {
      toast.error("Veuillez remplir toutes les informations.");
      return;
    }
    setStep(2);
  };

  const goToService = () => {
    if (!appointmentDate || !appointmentTime) {
      toast.error("Veuillez choisir une date et une heure.");
      return;
    }
    setStep(3);
  };

  const submitReservation = async () => {
    setIsLoading(true);
    try {
      const service = SERVICES.find(s => s.id === selectedService);
      const selectedCar = vehicles.find(v => v.plate === vehicle);
      
      const carName = selectedCar?.brand && selectedCar?.model 
        ? `${selectedCar.brand} ${selectedCar.model}` 
        : (selectedCar?.name || "Véhicule");
      
      const titleStr = `${carName} (${vehicle}) - ${service?.title}`;
      const descStr = `RDV: ${appointmentDate} à ${appointmentTime} | Client: ${email} | Service: ${service?.desc}`;

      // Format for backend: YYYY-MM-DDTHH:mm:00
      const scheduledAt = `${appointmentDate}T${appointmentTime}:00`;

      const response = await fetchWithAuth("/tickets", {
        method: "POST",
        body: JSON.stringify({
          title: titleStr,
          description: descStr,
          email: email,
          scheduledAt: scheduledAt
        })
      });

      toast.success("Réservation confirmée ! Un email vous a été envoyé.");
      setStep(1);
      setVehicle("");
      setEmail("");
      setAppointmentDate("");
      setAppointmentTime("");
      setSelectedService(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erreur lors de la création du ticket.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="mb-12">
        <h1 className="text-4xl font-black tracking-tight text-center uppercase italic">Prendre RDV</h1>
        <p className="text-muted-foreground text-center mt-2 font-medium">Réservez une intervention pour l&apos;un de vos véhicules Renault.</p>

        <div className="flex items-center justify-center mt-12 relative max-w-md mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 -z-10 rounded-full" />
          <div
            className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 -z-10 rounded-full transition-all duration-500"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm border-4 border-background shadow-lg transition-all ${s <= step ? "bg-primary text-primary-foreground scale-110" : "bg-muted text-muted-foreground"}`}
            >
              {s < step ? <CheckCircle2 className="w-6 h-6" /> : s}
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
            <Card className="rounded-[2.5rem] border-border/50 shadow-2xl overflow-hidden bg-white">
              <CardContent className="p-8 sm:p-16">
                <div className="flex flex-col items-center space-y-4 mb-12">
                  <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center shadow-inner">
                    <Car className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter">Votre Véhicule</h2>
                  <p className="text-muted-foreground font-medium text-sm">Sélectionnez le véhicule concerné par l&apos;intervention.</p>
                </div>

                <div className="space-y-8 max-w-md mx-auto">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Sélectionner un véhicule</label>
                    <Select onValueChange={setVehicle} value={vehicle}>
                      <SelectTrigger className="h-14 rounded-2xl border-none bg-muted/50 font-black uppercase italic tracking-tight focus:ring-primary shadow-inner">
                        <SelectValue placeholder={fetchingVehicles ? "Chargement..." : "Choisir un véhicule"} />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                        {vehicles.map((v) => (
                          <SelectItem key={v.id} value={v.plate} className="font-bold uppercase py-3">
                            {v.brand} {v.model} — <span className="text-primary italic">{v.plate}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Email de contact</label>
                    <Input
                      type="email"
                      placeholder="votre@email.com"
                      className="h-14 rounded-2xl border-none bg-muted/50 font-bold text-lg focus-visible:ring-primary shadow-inner"
                      value={email || ""}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={goToDateTime}
                    disabled={!vehicle || !email || isLoading}
                    className="w-full h-14 text-lg font-black uppercase italic tracking-tight rounded-2xl mt-8 shadow-xl shadow-primary/20"
                  >
                    {isLoading ? <Loader2 className="w-6 h-6 mr-2 animate-spin" /> : "Choisir la date"}
                    {!isLoading && <ArrowRight className="w-6 h-6 ml-2" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl mx-auto"
          >
            <div className="space-y-8">
              <div className="flex items-center justify-between px-4">
                <Button variant="ghost" onClick={handleBack} className="font-black uppercase italic tracking-tight hover:bg-zinc-100 rounded-xl">
                  <ArrowLeft className="w-5 h-5 mr-2" /> Retour
                </Button>
                <div className="hidden sm:block">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right mb-1">Votre Sélection</p>
                  <p className="text-xl font-black uppercase italic text-primary">
                    {appointmentDate ? `${new Date(appointmentDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} à ${appointmentTime}` : "Aucun créneau choisi"}
                  </p>
                </div>
              </div>

              {/* Enhanced Day Selector */}
              <div className="relative group">
                <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide px-4 mask-fade">
                  {days.map((day, idx) => (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDayIndex(idx)}
                      className={`flex-shrink-0 w-24 h-28 rounded-[2rem] flex flex-col items-center justify-center gap-1 transition-all
                        ${idx === selectedDayIndex 
                          ? "bg-zinc-900 text-white shadow-2xl scale-110" 
                          : "bg-white border border-zinc-100 text-zinc-400 hover:border-primary/50 hover:text-zinc-600 shadow-sm"}`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">{day.toLocaleDateString('fr-FR', { weekday: 'short' })}</span>
                      <span className="text-3xl font-black italic">{day.getDate()}</span>
                    </button>
                  ))}
                </div>
              </div>

              {loadingSlots ? (
                <div className="h-64 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <p className="font-black uppercase italic tracking-widest text-xs text-muted-foreground">Disponibilités Renault Axis...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                  {/* Morning Section */}
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">
                       <Clock className="w-4 h-4 text-primary" /> Matin
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {morningSlots.map((slot) => {
                        const reserved = isReserved(selectedDay, slot);
                        const active = appointmentDate === selectedDay.toISOString().split('T')[0] && appointmentTime === slot;
                        return (
                          <button
                            key={slot}
                            disabled={reserved}
                            onClick={() => handleSlotClick(selectedDay, slot)}
                            className={`h-16 rounded-[1.5rem] font-black text-lg transition-all border
                              ${reserved ? "bg-muted/20 border-transparent text-muted-foreground cursor-not-allowed" : 
                                active ? "bg-primary border-primary text-black shadow-lg shadow-primary/30" : 
                                "bg-white border-zinc-100 hover:border-primary hover:shadow-md active:scale-95"}`}
                          >
                            {reserved ? <span className="text-[10px] uppercase opacity-50">Complet</span> : slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Afternoon Section */}
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">
                       <Clock className="w-4 h-4 text-primary" /> Après-midi
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {afternoonSlots.map((slot) => {
                        const reserved = isReserved(selectedDay, slot);
                        const active = appointmentDate === selectedDay.toISOString().split('T')[0] && appointmentTime === slot;
                        return (
                          <button
                            key={slot}
                            disabled={reserved}
                            onClick={() => handleSlotClick(selectedDay, slot)}
                            className={`h-16 rounded-[1.5rem] font-black text-lg transition-all border
                              ${reserved ? "bg-muted/20 border-transparent text-muted-foreground cursor-not-allowed" : 
                                active ? "bg-primary border-primary text-black shadow-lg shadow-primary/30" : 
                                "bg-white border-zinc-100 hover:border-primary hover:shadow-md active:scale-95"}`}
                          >
                            {reserved ? <span className="text-[10px] uppercase opacity-50">Complet</span> : slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col items-center gap-6 pt-8">
                 <div className="flex gap-4 items-center bg-zinc-900/5 px-6 py-3 rounded-2xl border border-zinc-900/5">
                    <AlertCircle className="w-5 h-5 text-primary" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase leading-tight">
                       Pas de disponibilité ? Nos ateliers sont ouverts du Lundi au Vendredi de 09h à 17h.
                    </p>
                 </div>
                 
                 <Button
                    onClick={goToService}
                    disabled={!appointmentDate || !appointmentTime}
                    className="w-full max-w-sm h-16 text-xl font-black uppercase italic tracking-tight rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-transform"
                  >
                    Choisir mon service
                    <ArrowRight className="w-6 h-6 ml-2" />
                  </Button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="mb-10 flex items-center justify-between">
              <Button variant="ghost" onClick={handleBack} disabled={isLoading} className="rounded-xl font-black uppercase italic tracking-tight">
                <ArrowLeft className="w-5 h-5 mr-2" /> Retour
              </Button>
              <div className="flex gap-2">
                <Badge className="bg-primary/10 text-primary border-none py-2 px-4 rounded-xl font-black uppercase italic tracking-tighter">
                  {vehicle}
                </Badge>
                <Badge className="bg-muted text-muted-foreground border-none py-2 px-4 rounded-xl font-black uppercase tracking-tighter">
                  {appointmentDate} @ {appointmentTime}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SERVICES.map((srv) => (
                <Card
                  key={srv.id}
                  onClick={() => !isLoading && setSelectedService(srv.id)}
                  className={`cursor-pointer rounded-[2rem] relative overflow-hidden transition-all border-none shadow-lg ${selectedService === srv.id ? "bg-primary text-primary-foreground scale-[1.02] shadow-primary/30" : "bg-white hover:bg-muted/30"}`}
                >
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      <div className={`p-5 rounded-2xl shadow-inner ${selectedService === srv.id ? "bg-black/20 text-white" : "bg-primary/10 text-primary"}`}>
                        <srv.icon className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none">{srv.title}</h3>
                        <p className={`text-sm font-medium mt-2 leading-relaxed ${selectedService === srv.id ? "text-white/80" : "text-muted-foreground"}`}>{srv.desc}</p>
                        <div className={`mt-6 inline-block px-4 py-2 rounded-xl font-black text-sm uppercase tracking-widest ${selectedService === srv.id ? "bg-white text-primary shadow-xl" : "bg-muted text-foreground"}`}>
                          {srv.price}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-center mt-12">
              <Button
                disabled={!selectedService || isLoading}
                onClick={submitReservation}
                size="lg"
                className="rounded-2xl font-black uppercase italic tracking-tight h-16 px-12 text-xl shadow-2xl shadow-primary/30 w-full sm:w-auto"
              >
                {isLoading ? <Loader2 className="w-6 h-6 mr-2 animate-spin" /> : "Confirmer le RDV"}
                {!isLoading && <Calendar className="w-6 h-6 ml-2" />}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
