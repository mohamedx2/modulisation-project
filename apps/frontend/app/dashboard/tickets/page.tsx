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
        const res = await fetchWithAuth("/vehicles");
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
          setReservedSlots(Array.isArray(data) ? data.map((d: any) => {
            const dt = new Date(d);
            const yyyy = dt.getFullYear();
            const mm = String(dt.getMonth() + 1).padStart(2, '0');
            const dd = String(dt.getDate()).padStart(2, '0');
            const hh = String(dt.getHours()).padStart(2, '0');
            const min = String(dt.getMinutes()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
          }) : []);
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
    const slotKey = toLocalDateString(slotDate) + 'T' + time;
    return reservedSlots.some((s: string) => s === slotKey);
  };

  const toLocalDateString = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleSlotClick = (date: Date, time: string) => {
    if (isReserved(date, time)) return;
    setAppointmentDate(toLocalDateString(date));
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
        <div className="max-w-[1400px] mx-auto py-12 px-8 lg:p-12 pb-24 relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64 z-0 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] -ml-32 -mb-32 z-0 pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 relative z-10 text-center space-y-4"
          >
            <h1 className="text-5xl lg:text-6xl font-black tracking-tighter uppercase italic leading-none">Prendre <span className="text-primary">RDV</span></h1>
            <p className="text-muted-foreground max-w-2xl mx-auto font-bold text-lg">Réservez votre prochaine intervention en quelques clics avec le service premium Renault Axis.</p>

            <div className="flex items-center justify-center mt-16 relative max-w-xl mx-auto">
              <div className="absolute top-1/2 left-0 w-full h-1.5 bg-muted -translate-y-1/2 -z-10 rounded-full" />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((step - 1) / 2) * 100}%` }}
                className="absolute top-1/2 left-0 h-1.5 bg-primary -translate-y-1/2 -z-10 rounded-full transition-all duration-700 shadow-[0_0_20px_rgba(255,204,0,0.5)]"
              />
              {[
                { s: 1, label: "VÉHICULE" },
                { s: 2, label: "DATE & HEURE" },
                { s: 3, label: "SERVICE" }
              ].map(({ s, label }) => (
                <div key={s} className="relative flex flex-col items-center gap-4 group">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg border-4 border-background shadow-xl transition-all duration-500 z-10 ${s < step ? "bg-emerald-500 text-white scale-110" :
                        s === step ? "bg-primary text-black scale-125 shadow-primary/30" :
                          "bg-muted text-muted-foreground"
                      }`}
                  >
                    {s < step ? <CheckCircle2 className="w-7 h-7" /> : s}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest absolute -bottom-8 whitespace-nowrap transition-colors ${s <= step ? "text-foreground" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto"
              >
                <Card className="rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white dark:bg-zinc-900 group">
                  <CardContent className="p-10 lg:p-20 flex flex-col lg:flex-row gap-16 items-center">
                    <div className="flex-1 space-y-8">
                      <div className="space-y-4">
                        <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                          <Car className="w-10 h-10" />
                        </div>
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-tight">Votre <br /><span className="text-primary">Véhicule</span></h2>
                        <p className="text-muted-foreground font-bold leading-relaxed">Identifiez le véhicule qui nécessite une attention particulière de nos experts.</p>
                      </div>

                      <div className="space-y-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Sélectionner</label>
                          <Select onValueChange={setVehicle} value={vehicle}>
                            <SelectTrigger className="h-16 rounded-2xl border-none bg-muted/40 font-black uppercase italic tracking-tight focus:ring-primary shadow-inner text-lg">
                              <SelectValue placeholder={fetchingVehicles ? "Identification..." : "Choisir un véhicule"} />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-none shadow-2xl p-2 bg-white dark:bg-zinc-900">
                              {vehicles.map((v) => (
                                <SelectItem key={v.id} value={v.plate} className="font-bold uppercase py-4 rounded-xl focus:bg-primary focus:text-black">
                                  <div className="flex items-center gap-4">
                                    <Car className="w-5 h-5 opacity-50" />
                                    <span>{v.brand} {v.model} — <span className="italic">{v.plate}</span></span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Email de Confirmation</label>
                          <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                              type="email"
                              placeholder="votre@email.com"
                              className="h-16 pl-14 rounded-2xl border-none bg-muted/40 font-bold text-lg focus-visible:ring-primary shadow-inner"
                              value={email || ""}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </div>
                        </div>

                        <Button
                          onClick={goToDateTime}
                          disabled={!vehicle || !email || isLoading}
                          className="w-full h-16 text-xl font-black uppercase italic tracking-tight rounded-2xl mt-4 shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95"
                        >
                          {isLoading ? <Loader2 className="w-7 h-7 mr-2 animate-spin" /> : "Planifier la visite"}
                          {!isLoading && <ArrowRight className="w-7 h-7 ml-2" />}
                        </Button>
                      </div>
                    </div>
                    <div className="hidden lg:block w-[300px] h-[400px] bg-muted/30 rounded-[2.5rem] relative overflow-hidden border border-zinc-100 dark:border-zinc-800">
                      <img
                        src="https://images.unsplash.com/photo-1486496146582-9ffcd0b2b2b7?q=80&w=600&auto=format&fit=crop"
                        className="w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
                      <div className="absolute bottom-8 left-8 right-8 space-y-2">
                        <p className="text-white font-black uppercase text-xs tracking-widest italic">Renault Service</p>
                        <p className="text-white/60 text-[10px] font-medium leading-tight">Expertise technique et pièces d'origine garanties.</p>
                      </div>
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
                className="w-full max-w-5xl mx-auto"
              >
                <div className="space-y-12">
                  <div className="flex items-center justify-between px-4">
                    <Button variant="ghost" onClick={handleBack} className="h-12 px-6 font-black uppercase italic tracking-tight hover:bg-zinc-100 rounded-2xl transition-all">
                      <ArrowLeft className="w-6 h-6 mr-2" /> Retour
                    </Button>
                    <div className="hidden sm:block text-right">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Créneau sélectionné</p>
                      <p className="text-2xl font-black uppercase italic text-primary leading-none">
                        {appointmentDate ? `${new Date(appointmentDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} @ ${appointmentTime}` : "En attente de choix"}
                      </p>
                    </div>
                  </div>

                  {/* Enhanced Day Selector */}
                  <div className="relative">
                    <div className="flex overflow-x-auto pb-8 gap-6 scrollbar-hide px-4 mask-fade">
                      {days.map((day, idx) => (
                        <button
                          key={day.toISOString()}
                          onClick={() => setSelectedDayIndex(idx)}
                          className={`flex-shrink-0 w-28 h-36 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 transition-all duration-500
                        ${idx === selectedDayIndex
                              ? "bg-zinc-950 text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] scale-110"
                              : "bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-primary/50 hover:text-zinc-600 shadow-sm"}`}
                        >
                          <span className="text-[11px] font-black uppercase tracking-[0.2em]">{day.toLocaleDateString('fr-FR', { weekday: 'short' })}</span>
                          <span className="text-4xl font-black italic leading-none">{day.getDate()}</span>
                          <span className="text-[9px] font-bold uppercase opacity-40">{day.toLocaleDateString('fr-FR', { month: 'short' })}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {loadingSlots ? (
                    <div className="h-80 flex flex-col items-center justify-center space-y-6 bg-white dark:bg-zinc-900 rounded-[3rem] shadow-inner">
                      <div className="relative">
                        <Loader2 className="w-16 h-16 animate-spin text-primary" />
                        <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
                      </div>
                      <p className="font-black uppercase italic tracking-[0.2em] text-sm text-muted-foreground animate-pulse">Synchronisation avec l'atelier...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      {/* Morning Section */}
                      <div className="space-y-6">
                        <h3 className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-4">
                          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center"><Clock className="w-4 h-4 text-primary" /></div> MATINÉE
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {morningSlots.map((slot) => {
                            const reserved = isReserved(selectedDay, slot);
                            const active = appointmentDate === toLocalDateString(selectedDay) && appointmentTime === slot;
                            return (
                              <button
                                key={slot}
                                disabled={reserved}
                                onClick={() => handleSlotClick(selectedDay, slot)}
                                className={`h-20 rounded-[2rem] font-black text-2xl italic transition-all duration-300 border-2
                              ${reserved ? "bg-muted/30 border-transparent text-muted-foreground/30 cursor-not-allowed" :
                                    active ? "bg-primary border-primary text-black shadow-2xl shadow-primary/40 scale-105" :
                                      "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-primary hover:shadow-xl active:scale-95"}`}
                              >
                                {reserved ? <span className="text-[10px] uppercase tracking-widest italic">Complet</span> : slot}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Afternoon Section */}
                      <div className="space-y-6">
                        <h3 className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-4">
                          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center"><Clock className="w-4 h-4 text-primary" /></div> APRÈS-MIDI
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {afternoonSlots.map((slot) => {
                            const reserved = isReserved(selectedDay, slot);
                            const active = appointmentDate === toLocalDateString(selectedDay) && appointmentTime === slot;
                            return (
                              <button
                                key={slot}
                                disabled={reserved}
                                onClick={() => handleSlotClick(selectedDay, slot)}
                                className={`h-20 rounded-[2rem] font-black text-2xl italic transition-all duration-300 border-2
                              ${reserved ? "bg-muted/30 border-transparent text-muted-foreground/30 cursor-not-allowed" :
                                    active ? "bg-primary border-primary text-black shadow-2xl shadow-primary/40 scale-105" :
                                      "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-primary hover:shadow-xl active:scale-95"}`}
                              >
                                {reserved ? <span className="text-[10px] uppercase tracking-widest italic">Complet</span> : slot}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col items-center gap-8 pt-12">
                    <div className="flex gap-4 items-center bg-zinc-950 text-white px-8 py-4 rounded-[2rem] border border-zinc-800 shadow-2xl">
                      <AlertCircle className="w-6 h-6 text-primary" />
                      <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                        Horaires d'ouverture : <span className="text-primary italic">Lun - Ven | 09h00 - 17h00</span>
                      </p>
                    </div>

                    <Button
                      onClick={goToService}
                      disabled={!appointmentDate || !appointmentTime}
                      className="w-full max-w-md h-20 text-2xl font-black uppercase italic tracking-tight rounded-[2rem] shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all active:scale-95"
                    >
                      Choisir mon service
                      <ArrowRight className="w-8 h-8 ml-3" />
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
                className="max-w-5xl mx-auto"
              >
                <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
                  <Button variant="ghost" onClick={handleBack} disabled={isLoading} className="rounded-2xl h-12 px-6 font-black uppercase italic tracking-tight">
                    <ArrowLeft className="w-6 h-6 mr-2" /> Retour
                  </Button>
                  <div className="flex gap-3">
                    <Badge className="bg-primary text-black border-none py-3 px-6 rounded-2xl font-black uppercase italic tracking-tight shadow-xl">
                      {vehicle}
                    </Badge>
                    <Badge className="bg-zinc-950 text-white border-none py-3 px-6 rounded-2xl font-black uppercase tracking-widest shadow-xl">
                      {appointmentDate} @ {appointmentTime}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {SERVICES.map((srv, i) => (
                    <motion.div
                      key={srv.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card
                        onClick={() => !isLoading && setSelectedService(srv.id)}
                        className={`group cursor-pointer rounded-[3rem] relative overflow-hidden transition-all duration-500 border-none shadow-xl h-full flex flex-col ${selectedService === srv.id
                            ? "bg-zinc-950 text-white scale-[1.03] ring-4 ring-primary shadow-primary/20"
                            : "bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                          }`}
                      >
                        <CardContent className="p-10 flex-1 flex flex-col">
                          <div className="flex items-start gap-8">
                            <div className={`p-6 rounded-[2rem] shadow-inner transition-colors duration-500 ${selectedService === srv.id ? "bg-primary text-black" : "bg-primary/10 text-primary group-hover:bg-primary/20"
                              }`}>
                              <srv.icon className="w-10 h-10" />
                            </div>
                            <div className="flex-1 space-y-4">
                              <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none">{srv.title}</h3>
                              <p className={`text-sm font-medium leading-relaxed transition-colors duration-500 ${selectedService === srv.id ? "text-white/60" : "text-muted-foreground"
                                }`}>{srv.desc}</p>
                            </div>
                          </div>

                          <div className="mt-auto pt-10 flex items-center justify-between">
                            <div className={`px-6 py-3 rounded-2xl font-black text-lg uppercase tracking-tighter transition-all duration-500 ${selectedService === srv.id ? "bg-primary text-black" : "bg-muted text-foreground"
                              }`}>
                              {srv.price}
                            </div>
                            {selectedService === srv.id && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2 text-primary font-black uppercase italic text-xs tracking-widest">
                                Sélectionné <CheckCircle2 className="w-5 h-5" />
                              </motion.div>
                            )}
                          </div>
                        </CardContent>
                        {/* Decorative stripes */}
                        <div className="absolute top-0 right-0 w-20 h-full flex gap-1 opacity-[0.03] rotate-12 -mr-6 pointer-events-none">
                          <div className="w-4 h-full bg-primary" />
                          <div className="w-2 h-full bg-primary" />
                          <div className="w-8 h-full bg-primary" />
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <div className="flex justify-center mt-20">
                  <Button
                    disabled={!selectedService || isLoading}
                    onClick={submitReservation}
                    className="rounded-[2.5rem] font-black uppercase italic tracking-tight h-20 px-16 text-2xl shadow-[0_20px_50px_rgba(255,204,0,0.3)] hover:shadow-primary/50 transition-all active:scale-95 w-full sm:w-auto"
                  >
                    {isLoading ? <Loader2 className="w-8 h-8 mr-3 animate-spin" /> : "Confirmer mon RDV"}
                    {!isLoading && <ShieldCheck className="w-8 h-8 ml-3" />}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }