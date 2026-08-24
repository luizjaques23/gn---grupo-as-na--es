/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  MapPin, 
  Search, 
  Globe2, 
  Sparkles, 
  RotateCcw, 
  SlidersHorizontal,
  Instagram,
  Heart,
  ExternalLink,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import { GN_GROUPS, GNGroup } from './data/groups';
import { calculateDistance } from './utils/geo';
import BibleVerseTicker from './components/BibleVerseTicker';
import GroupCard from './components/GroupCard';
import { BgradientAnim } from '@/components/ui/soft-gradient-background-animation';

export default function App() {
  // Wizard States
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<'MENINAS' | 'MENINOS' | 'MISTO' | 'KIDS' | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogCategory, setCatalogCategory] = useState<'ALL' | 'MENINAS' | 'MENINOS' | 'MISTO' | 'KIDS'>('ALL');
  const [catalogCountry, setCatalogCountry] = useState<string>('ALL');

  // Geolocation States
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Expanded Accordion Card State
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Mode state: 'wizard' or 'catalog'
  const [viewMode, setViewMode] = useState<'wizard' | 'catalog'>('wizard');

  // Fetch unique countries in our database
  const countriesList = useMemo(() => {
    const countries = Array.from(new Set(GN_GROUPS.map((g) => g.country)));
    return countries.map((name) => {
      const match = GN_GROUPS.find((g) => g.country === name);
      return {
        name,
        code: match?.countryCode || 'BR',
        flag: match?.flag || '🏳️‍🌈'
      };
    });
  }, []);

  // Request browser geolocation
  const handleRequestLocation = () => {
    setIsLocating(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError("Seu navegador não suporta geolocalização.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLocating(false);
        // If they successfully locate, let's switch to catalog view to see nearby results easily
        setViewMode('catalog');
        setCatalogCategory('ALL');
        setCatalogCountry('ALL');
        
        // Scroll smoothly to catalog section
        setTimeout(() => {
          document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      },
      (error) => {
        console.error("Erro ao obter localização:", error);
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError("Permissão de localização negada pelo usuário.");
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError("Informações de localização indisponíveis.");
            break;
          case error.TIMEOUT:
            setGeoError("Tempo limite esgotado ao tentar obter localização.");
            break;
          default:
            setGeoError("Ocorreu um erro desconhecido ao obter localização.");
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Groups list with calculated distance
  const groupsWithDistance = useMemo(() => {
    return GN_GROUPS.map((group) => {
      if (userCoords) {
        const distance = calculateDistance(
          userCoords.latitude,
          userCoords.longitude,
          group.coordinates.latitude,
          group.coordinates.longitude
        );
        return { ...group, distance };
      }
      return { ...group, distance: null };
    });
  }, [userCoords]);

  // Sorted and filtered list for catalog view
  const filteredCatalogGroups = useMemo(() => {
    let result = [...groupsWithDistance];

    // Filter by search query (name, leader, neighborhood, zone, city)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.leader.toLowerCase().includes(q) ||
          g.neighborhood.toLowerCase().includes(q) ||
          g.zone.toLowerCase().includes(q) ||
          g.city.toLowerCase().includes(q)
      );
    }

    // Filter by Category
    if (catalogCategory !== 'ALL') {
      result = result.filter((g) => g.category === catalogCategory);
    }

    // Filter by Country
    if (catalogCountry !== 'ALL') {
      result = result.filter((g) => g.country === catalogCountry);
    }

    // Sort: if we have distances, sort from nearest to farthest. Else keep default group order.
    if (userCoords) {
      result.sort((a, b) => {
        const distA = a.distance ?? Infinity;
        const distB = b.distance ?? Infinity;
        return distA - distB;
      });
    }

    return result;
  }, [groupsWithDistance, searchQuery, catalogCategory, catalogCountry, userCoords]);

  // Wizard filtering helpers
  const wizardFilteredCountries = useMemo(() => {
    if (!selectedCategory) return countriesList;
    // Return countries that have at least one group of the selected category
    const validCountries = Array.from(
      new Set(
        GN_GROUPS.filter((g) => g.category === selectedCategory).map((g) => g.country)
      )
    );
    return countriesList.filter((c) => validCountries.includes(c.name));
  }, [selectedCategory, countriesList]);

  const wizardFinalGroups = useMemo(() => {
    if (!selectedCategory || !selectedCountry) return [];
    return groupsWithDistance.filter(
      (g) => g.category === selectedCategory && g.country === selectedCountry
    );
  }, [selectedCategory, selectedCountry, groupsWithDistance]);

  const resetWizard = () => {
    setSelectedCategory(null);
    setSelectedCountry(null);
    setStep(1);
  };

  const selectWizardCategory = (cat: 'MENINAS' | 'MENINOS' | 'MISTO' | 'KIDS') => {
    setSelectedCategory(cat);
    setStep(2);
  };

  const selectWizardCountry = (countryName: string) => {
    setSelectedCountry(countryName);
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-black/5 selection:text-black transition-colors duration-300 relative overflow-x-hidden">
      
      {/* Soft OKLCH Animated Gradient Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <BgradientAnim className="opacity-70" animationDuration={8} />
      </div>

      {/* Decorative vibrant neon background blur accents */}
      <div className="absolute top-0 left-0 w-full h-[700px] pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-32 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" style={{ animationDelay: '1s' }} />
        <div className="absolute top-60 left-1/3 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute -top-10 right-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Hero Header Section — Centered for Teen Audience */}
      <header id="app-header" className="relative z-10 px-6 md:px-12 pt-8 pb-6 text-center border-b border-black/5 max-w-5xl mx-auto flex flex-col items-center">
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-500 px-7 py-3.5 rounded-2xl border border-white/20 shadow-md inline-flex items-center justify-center mb-4 transition-transform hover:scale-105">
          <img 
            src="/white_logo_ian.png" 
            alt="Igreja às Nações Logo" 
            className="h-12 md:h-16 w-auto object-contain drop-shadow-xs" 
          />
        </div>
        <p className="text-[9px] tracking-[0.35em] font-bold text-black/40 uppercase">Igreja às Nações</p>
        <p className="text-[9px] tracking-[0.35em] font-bold text-black/40 uppercase mt-1">Supervisão Resgate</p>
        <p className="text-[9px] tracking-[0.35em] font-bold text-black/40 uppercase mt-1">Continente das Américas</p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-3 bg-gradient-to-r from-purple-600 via-blue-500 to-emerald-500 bg-clip-text text-transparent">
          Grupo às Nações-GN
        </h1>
      </header>

      {/* Global Bible Verse Ticker */}
      <div className="max-w-5xl mx-auto px-6 md:px-12 mt-4 relative z-10">
        <div className="border border-black/[0.05] bg-white/40 backdrop-blur-xs rounded-xl overflow-hidden">
          <BibleVerseTicker />
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-6 md:px-12 py-10 relative z-10">

        {/* Explicação e Importância sobre GN */}
        <section className="mb-12 max-w-4xl mx-auto space-y-4 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-black/[0.05] shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-black uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                O que é um GN?
              </h3>
              <p className="text-xs md:text-sm text-black/70 leading-relaxed font-normal">
                <strong className="text-black font-semibold">GN significa “Grupo às Nações”</strong>. São grupos de adolescentes e jovens que se reúnem semanalmente nos bairros e regiões de Porto Velho para compartilhar a Palavra de Deus, fortalecer a comunhão, orar, louvar e construir amizades verdadeiras em um ambiente alegre e acolhedor.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-black/[0.05] shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-black uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Qual a importância do GN?
              </h3>
              <p className="text-xs md:text-sm text-black/70 leading-relaxed font-normal">
                Os GNs possuem um papel estratégico no crescimento espiritual e na integração dos participantes na igreja. Eles permitem um acompanhamento próximo, cuidado pastoral, fortalecimento da fé e evangelismo com propósito.
              </p>
            </div>
          </div>
        </section>


        {/* Action Call for Nearest GN */}
        <section className="mb-12 text-center max-w-3xl mx-auto space-y-4">
          <div className="space-y-2">
            <p className="text-[10px] tracking-[0.25em] font-bold text-black/40 uppercase">Encontre um GN perto de você</p>
            <h3 className="text-3xl font-light tracking-tight text-[#1A1A1A]">
              Uma família. Muitas nações. Um só propósito.
            </h3>
            <p className="text-xs text-black/50 max-w-md mx-auto leading-relaxed">
              Ative a sua localização para descobrir instantaneamente quais grupos de conexão estão mais próximos de você.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              id="btn-get-location"
              disabled={isLocating}
              onClick={handleRequestLocation}
              className="inline-flex items-center justify-center gap-2.5 text-xs font-bold tracking-widest uppercase px-8 py-4 bg-black hover:bg-zinc-900 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-100 rounded-full shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 cursor-pointer border border-black/5"
            >
              <span className="text-red-500 animate-bounce">📍</span>
              {isLocating ? 'Obtendo GPS...' : 'Localizar via GPS'}
            </button>
          </div>

          {/* Geolocation feedback */}
          <AnimatePresence>
            {userCoords && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider flex items-center justify-center gap-1"
              >
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                Localização capturada! GNs ordenados por distância.
              </motion.p>
            )}
            {geoError && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs max-w-md mx-auto"
              >
                ⚠️ {geoError} Tente buscar manualmente abaixo.
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Navigation / Switch between Wizard Mode and Catalog Mode */}
        <div className="flex justify-center mb-10">
          <div className="bg-black/[0.03] p-1 rounded-full inline-flex gap-1 border border-black/5">
            <button
              type="button"
              id="switch-mode-wizard"
              onClick={() => setViewMode('wizard')}
              className={`px-5 py-2.5 rounded-lg font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-2 ${
                viewMode === 'wizard'
                  ? 'bg-black text-white'
                  : 'text-black/50 hover:text-black'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Descoberta Guiada
            </button>
            <button
              type="button"
              id="switch-mode-catalog"
              onClick={() => setViewMode('catalog')}
              className={`px-5 py-2 rounded-full font-bold text-[10px] tracking-widest uppercase transition-all flex items-center gap-1.5 ${
                viewMode === 'catalog'
                  ? 'bg-black text-white'
                  : 'text-black/50 hover:text-black'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Catálogo Completo
            </button>
          </div>
        </div>

        {/* VIEW 1: DISCOVERY WIZARD (DEFAULT) */}
        {viewMode === 'wizard' && (
          <section id="wizard-section" className="space-y-8 bg-white p-6 md:p-8 rounded-2xl border border-black/[0.05] shadow-xs">
            <div className="text-center space-y-2">
              <span className="text-[9px] font-bold tracking-[0.3em] text-black/40 uppercase">Ache seu grupo</span>
              <h2 className="text-xl font-light tracking-tight text-zinc-950">
                Sistema de Descoberta Guiada
              </h2>
              <p className="text-xs text-black/50 max-w-sm mx-auto">
                Encontre o seu grupo de conexão perfeito respondendo a apenas duas perguntas simples.
              </p>
            </div>

            {/* Stepper Progress Bar */}
            <div className="flex items-center justify-center gap-3 max-w-xs mx-auto py-2">
              <div className={`flex-1 h-0.5 rounded-full transition-colors ${step >= 1 ? 'bg-black' : 'bg-black/10'}`} />
              <div className={`flex-1 h-0.5 rounded-full transition-colors ${step >= 2 ? 'bg-black' : 'bg-black/10'}`} />
              <div className={`flex-1 h-0.5 rounded-full transition-colors ${step >= 3 ? 'bg-black' : 'bg-black/10'}`} />
            </div>

            <AnimatePresence mode="wait">
              {/* STEP 1: SELECT CATEGORY */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <h3 className="text-center text-xs font-bold uppercase tracking-wider text-black/60">
                    1. Com qual tipo de grupo você quer participar?
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 max-w-4xl mx-auto">
                    {/* MENINAS */}
                    <button
                      type="button"
                      id="wizard-cat-meninas"
                      onClick={() => selectWizardCategory('MENINAS')}
                      className="group relative py-7 px-3 border border-[#FF69B4]/20 bg-[#FF69B4]/3 text-[#FF69B4] rounded-2xl hover:bg-[#FF69B4]/8 transition-all flex flex-col items-center justify-center gap-2.5 active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF69B4]" />
                      <span className="text-xs font-bold tracking-[0.2em] uppercase">MENINAS</span>
                      <span className="text-[10px] text-black/45 font-medium">Círculo Feminino</span>
                    </button>

                    {/* MENINOS */}
                    <button
                      type="button"
                      id="wizard-cat-meninos"
                      onClick={() => selectWizardCategory('MENINOS')}
                      className="group relative py-7 px-3 border border-[#4169E1]/20 bg-[#4169E1]/3 text-[#4169E1] rounded-2xl hover:bg-[#4169E1]/8 transition-all flex flex-col items-center justify-center gap-2.5 active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#4169E1]" />
                      <span className="text-xs font-bold tracking-[0.2em] uppercase">MENINOS</span>
                      <span className="text-[10px] text-black/45 font-medium">Círculo Masculino</span>
                    </button>

                    {/* MISTO */}
                    <button
                      type="button"
                      id="wizard-cat-misto"
                      onClick={() => selectWizardCategory('MISTO')}
                      className="group relative py-7 px-3 border border-[#8A2BE2]/20 bg-[#8A2BE2]/3 text-[#8A2BE2] rounded-2xl hover:bg-[#8A2BE2]/8 transition-all flex flex-col items-center justify-center gap-2.5 active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#8A2BE2]" />
                      <span className="text-xs font-bold tracking-[0.2em] uppercase">MISTO</span>
                      <span className="text-[10px] text-black/45 font-medium">Comunhão Geral</span>
                    </button>

                    {/* KIDS */}
                    <button
                      type="button"
                      id="wizard-cat-kids"
                      onClick={() => selectWizardCategory('KIDS')}
                      className="group relative py-7 px-3 border border-amber-500/20 bg-amber-500/3 text-amber-600 rounded-2xl hover:bg-amber-500/8 transition-all flex flex-col items-center justify-center gap-2.5 active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="text-xs font-bold tracking-[0.2em] uppercase">KIDS</span>
                      <span className="text-[10px] text-black/45 font-medium">Crianças</span>
                    </button>

                    {/* JOVEM - EM BREVE */}
                    <div
                      className="relative py-7 px-3 border border-cyan-500/25 bg-cyan-500/5 text-cyan-600 rounded-2xl flex flex-col items-center justify-center gap-2.5 opacity-90 select-none"
                    >
                      <span className="absolute top-2.5 right-2.5 text-[8px] font-extrabold uppercase tracking-widest bg-cyan-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                        Em breve
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                      <span className="text-xs font-bold tracking-[0.2em] uppercase">JOVEM</span>
                      <span className="text-[10px] text-black/45 font-medium">Jovens</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: SELECT COUNTRY */}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center max-w-2xl mx-auto">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-[9px] font-bold uppercase tracking-widest text-black/40 hover:text-black flex items-center gap-1"
                    >
                      ← Voltar pro Tipo
                    </button>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-black/60 bg-black/[0.03] px-2.5 py-1 rounded-full border border-black/5">
                      Foco: {selectedCategory}
                    </span>
                  </div>

                  <h3 className="text-center text-xs font-bold uppercase tracking-wider text-black/60">
                    2. Escolha o país onde você deseja se conectar
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
                    {wizardFilteredCountries.map((c) => {
                      // Count groups matching selected category in this country
                      const count = GN_GROUPS.filter(
                        (g) => g.country === c.name && g.category === selectedCategory
                      ).length;

                      return (
                        <button
                          key={c.name}
                          type="button"
                          id={`wizard-country-${c.code}`}
                          onClick={() => selectWizardCountry(c.name)}
                          className="group relative bg-white rounded-2xl border border-black/[0.05] p-5 text-center transition-all hover:border-black/15 active:scale-98"
                        >
                          <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">
                            {c.flag}
                          </span>
                          <span className="block font-medium text-xs text-[#1A1A1A] tracking-tight">
                            {c.name}
                          </span>
                          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-black/[0.02] text-[9px] font-bold text-black/40 uppercase tracking-widest">
                            {count} {count === 1 ? 'grupo' : 'grupos'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: SHOW MATCHING GROUPS */}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-2xl mx-auto pb-4 border-b border-black/[0.03]">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-[9px] font-bold uppercase tracking-widest text-black/40 hover:text-black"
                      >
                        ← Voltar para Países
                      </button>
                      <span className="text-black/10">|</span>
                      <button
                        type="button"
                        onClick={resetWizard}
                        className="text-[9px] font-bold uppercase tracking-widest text-black hover:underline flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Reiniciar Busca
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-black/50 bg-black/[0.03] px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {selectedCategory?.toLowerCase()}
                      </span>
                      <span className="text-[9px] font-bold text-black/50 bg-black/[0.03] px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {selectedCountry}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-center text-xs font-bold uppercase tracking-wider text-black/60">
                    ✨ GNs Encontrados para você participar:
                  </h3>

                  {wizardFinalGroups.length > 0 ? (
                    <div className="space-y-4 max-w-2xl mx-auto">
                      {wizardFinalGroups.map((group) => (
                        <GroupCard
                           key={group.id}
                           group={group}
                           distance={group.distance}
                           isOpen={expandedCardId === group.id}
                           onToggle={() =>
                             setExpandedCardId(expandedCardId === group.id ? null : group.id)
                           }
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 max-w-md mx-auto space-y-3">
                      <div className="text-4xl">🕊️</div>
                      <p className="font-light tracking-tight text-zinc-900">Nenhum grupo ativo encontrado para esta seleção.</p>
                      <p className="text-xs text-black/55 leading-relaxed">
                        Mas não se preocupe! Tente mudar a categoria do grupo ou explore outras nações no catálogo completo.
                      </p>
                      <button
                        type="button"
                        onClick={resetWizard}
                        className="mt-2 bg-black text-white hover:bg-black/90 px-4 py-2.5 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-colors"
                      >
                        Ver Outros Grupos
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}

        {/* VIEW 2: COMPLETE INTERACTIVE CATALOG */}
        {viewMode === 'catalog' && (
          <section id="catalog-section" className="space-y-8 bg-white p-6 md:p-8 rounded-2xl border border-black/[0.05] shadow-xs">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-black/[0.03]">
              <div>
                <h2 className="text-xl font-light tracking-tight text-zinc-950">
                  Nossas Nações &amp; Grupos
                </h2>
                <p className="text-xs text-black/50 mt-1">
                  Explore e filtre todos os {GN_GROUPS.length} GNs ativos globalmente.
                </p>
              </div>

              {/* Reset active filters button */}
              {(catalogCategory !== 'ALL' || catalogCountry !== 'ALL' || searchQuery !== '') && (
                <button
                  type="button"
                  onClick={() => {
                    setCatalogCategory('ALL');
                    setCatalogCountry('ALL');
                    setSearchQuery('');
                  }}
                  className="text-[10px] font-bold text-black hover:underline flex items-center gap-1 bg-black/[0.02] px-3 py-1.5 rounded-full border border-black/5 uppercase tracking-wider"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Limpar filtros
                </button>
              )}
            </div>

            {/* Filter Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-3.5 h-3.5 text-black/35 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar líder, cidade, endereço..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/[0.01] border border-black/10 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-hidden focus:border-black/30 placeholder:text-black/35 font-medium"
                />
              </div>

              {/* Category filter */}
              <div className="relative">
                <SlidersHorizontal className="absolute left-3 top-3.5 w-3.5 h-3.5 text-black/35 pointer-events-none" />
                <select
                  value={catalogCategory}
                  onChange={(e) => setCatalogCategory(e.target.value as any)}
                  className="w-full bg-black/[0.01] border border-black/10 rounded-xl pl-9 pr-4 py-2.5 text-xs appearance-none focus:outline-hidden focus:border-black/30 font-medium"
                >
                  <option value="ALL">Todas as Categorias</option>
                  <option value="MENINAS">MENINAS</option>
                  <option value="MENINOS">MENINOS</option>
                  <option value="MISTO">MISTO</option>
                </select>
              </div>

              {/* Country filter */}
              <div className="relative">
                <Globe2 className="absolute left-3 top-3.5 w-3.5 h-3.5 text-black/35 pointer-events-none" />
                <select
                  value={catalogCountry}
                  onChange={(e) => setCatalogCountry(e.target.value)}
                  className="w-full bg-black/[0.01] border border-black/10 rounded-xl pl-9 pr-4 py-2.5 text-xs appearance-none focus:outline-hidden focus:border-black/30 font-medium"
                >
                  <option value="ALL">Todos os Países</option>
                  {countriesList.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.flag} {c.name.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results count & Quick guide */}
            <div className="flex items-center justify-between text-[10px] text-black/40 font-bold uppercase tracking-wider px-1">
              <span>{filteredCatalogGroups.length} {filteredCatalogGroups.length === 1 ? 'grupo encontrado' : 'grupos encontrados'}</span>
              {userCoords && <span className="text-emerald-600 font-bold flex items-center gap-1">Filtro de proximidade ativo 📍</span>}
            </div>

            {/* Catalog Group List */}
            {filteredCatalogGroups.length > 0 ? (
              <div className="space-y-4">
                {filteredCatalogGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    distance={group.distance}
                    isOpen={expandedCardId === group.id}
                    onToggle={() =>
                      setExpandedCardId(expandedCardId === group.id ? null : group.id)
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 space-y-3">
                <div className="text-4xl">🕊️</div>
                <h3 className="font-light tracking-tight text-zinc-900">Nenhum GN corresponde aos filtros.</h3>
                <p className="text-xs text-black/55 max-w-xs mx-auto leading-relaxed">
                  Tente remover termos de pesquisa ou resetar os filtros selecionados para explorar outros grupos de conexão.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCatalogCategory('ALL');
                    setCatalogCountry('ALL');
                    setSearchQuery('');
                  }}
                  className="bg-black text-white hover:bg-black/90 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors"
                >
                  Ver Todos os GNs
                </button>
              </div>
            )}
          </section>
        )}

        {/* NOSSOS GNs Flag Carousel Section (Auto Infinite Marquee) */}
        <section id="our-nations" className="mt-16 space-y-6">
          <div className="text-center space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">
              Nações Representadas
            </p>
            <h2 className="text-xl md:text-2xl font-light tracking-tight text-black">
              Nossos GNs
            </h2>
            <p className="text-xs text-black/50 max-w-md mx-auto">
              Bandeiras passando automaticamente — toque em qualquer país para explorar os grupos
            </p>
            <div className="h-0.5 w-10 bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500 mx-auto mt-2 rounded-full" />
          </div>

          {/* Continuous Automatic Animated Carousel with Infinite Loop */}
          <div className="relative overflow-hidden w-full py-4 mask-gradient">
            <div className="animate-marquee-infinite gap-4 px-2">
              {[...countriesList, ...countriesList, ...countriesList, ...countriesList].map((country, idx) => {
                const countryGroups = GN_GROUPS.filter((g) => g.country === country.name);
                const countryGroupsCount = countryGroups.length;
                const firstGroup = countryGroups[0];

                const handleCountryClick = () => {
                  setViewMode('catalog');
                  setCatalogCountry(country.name);
                  setCatalogCategory('ALL');
                  setSearchQuery('');
                  
                  setTimeout(() => {
                    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                };

                return (
                  <button
                    key={`${country.name}-${idx}`}
                    type="button"
                    onClick={handleCountryClick}
                    style={{
                      borderTopColor: firstGroup?.theme?.primary || '#3b82f6'
                    }}
                    className="w-[200px] flex-shrink-0 bg-white rounded-2xl p-4 border border-black/[0.06] border-t-4 flex flex-col items-center text-center gap-2.5 transition-all hover:border-black/20 hover:shadow-lg hover:-translate-y-1 active:scale-95 group cursor-pointer relative overflow-hidden select-none"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-black/[0.02] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-2xs">
                      <span aria-hidden="true">{country.flag}</span>
                    </div>
                    <div>
                      <span className="block font-bold text-xs text-black tracking-tight uppercase group-hover:text-blue-600 transition-colors">
                        GN {country.name}
                      </span>
                      <span className="block text-[10px] text-black/40 font-semibold mt-0.5">
                        {countryGroupsCount} {countryGroupsCount === 1 ? 'Grupo ativo' : 'Grupos ativos'}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider mt-1 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      Ver Grupos →
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Son Action Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto text-center space-y-6">
          <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-orange-400 p-[2px] rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-white rounded-[14px] p-6 md:p-8 space-y-5">
              <h3 className="text-lg md:text-xl font-extrabold uppercase tracking-wider bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent">
                Participe também da Son Action!
              </h3>
              <p className="text-xs md:text-sm text-black/60 leading-relaxed">
                Aqui na Igreja às Nações temos um culto de adolescentes muito avivado em Porto Velho. É um lugar para viver experiências com Deus, fazer novas amizades, fortalecer a fé e descobrir que seguir Jesus também pode ser uma experiência intensa, alegre e transformadora.
              </p>
              <p className="text-xs md:text-sm text-black/70 leading-relaxed font-semibold">
                Você não precisa viver essa fase sozinho. Venha fazer parte dessa geração, traga seus amigos e venha viver tudo aquilo que Deus preparou para você!
              </p>
              <p className="text-sm md:text-base font-extrabold uppercase tracking-widest text-black">
                A Son Action é o seu lugar. Vem viver essa experiência com a gente! 🔥
              </p>

              {/* Instagram Reel Embed */}
              <div className="pt-4 flex justify-center">
                <div className="w-full max-w-[320px]" style={{ aspectRatio: '9/16' }}>
                  <iframe
                    src="https://www.instagram.com/reel/DcTxyuOszo8/embed"
                    className="w-full h-full rounded-xl border-0 shadow-md"
                    allowFullScreen
                    loading="lazy"
                    title="Son Action — Reel do Instagram"
                  />
                </div>
              </div>

              {/* Siga a Son Action */}
              <div className="pt-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-black/50">
                  Siga a Son Action
                </h4>
                <p className="text-xs text-black/50 max-w-md mx-auto leading-relaxed">
                  Acompanhe nossos cultos, momentos, novidades e tudo o que Deus está fazendo através dessa geração.
                </p>
                <a
                  href="https://www.instagram.com/sonaction_/?igsi=NzZqejh0NXIxbnlp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 hover:brightness-110 text-white font-bold text-[11px] tracking-widest uppercase px-6 py-3.5 rounded-full shadow-md active:scale-95 transition-all"
                >
                  <Instagram className="w-4 h-4" />
                  Seguir @sonaction_
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Elegant Footer */}
      <footer className="bg-white text-zinc-500 py-12 px-6 md:px-12 border-t border-black/5 relative z-10 mt-16">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Logo & Slogan */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center md:text-left">
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-500 p-3 px-4 rounded-xl border border-white/20 shadow-xs flex items-center justify-center flex-shrink-0">
              <img 
                src="/white_logo_ian.png" 
                alt="Igreja às Nações Logo" 
                className="h-9 w-auto object-contain drop-shadow-xs" 
              />
            </div>
            <div className="space-y-1">
              <span className="text-black font-extrabold tracking-tight text-sm block">
                IGREJA ÀS NAÇÕES
              </span>
              <p className="text-[11px] text-black/50 font-medium">
                Supervisão Resgate · Continente das Américas · Adolescentes
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Igreja+%C3%A0s+Na%C3%A7%C3%B5es+R.+Raimundo+Cantu%C3%A1ria+2290+Mato+Grosso+Porto+Velho+RO"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-black/60 hover:text-black hover:underline inline-flex items-center gap-1 font-medium transition-colors"
                title="Abrir no Google Maps"
              >
                <MapPin className="w-3 h-3 text-red-500 flex-shrink-0" />
                R. Raimundo Cantuária, 2290 - Mato Grosso, Porto Velho - RO, 76804-416
              </a>
            </div>
          </div>

          {/* Official Church Links */}
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="https://asnacoes.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/[0.03] hover:bg-black/[0.08] text-[11px] font-bold text-black/70 hover:text-black transition-all uppercase tracking-wider border border-black/10 active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5 text-black/50" />
              Site Oficial
            </a>
            <a
              href="https://www.instagram.com/igrejaasnacoes?igsi=YXppbmp4cWd6bWFu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 hover:brightness-95 text-[11px] font-bold text-pink-700 transition-all uppercase tracking-wider border border-pink-200/60 shadow-2xs active:scale-95"
            >
              <Instagram className="w-3.5 h-3.5 text-pink-600" />
              Instagram Oficial
            </a>
            <a
              href="https://www.instagram.com/sonaction_/?igsi=NzZqejh0NXIxbnlp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-purple-50 hover:bg-purple-100 text-[11px] font-bold text-purple-700 transition-all uppercase tracking-wider border border-purple-200/60 shadow-2xs active:scale-95"
            >
              <Instagram className="w-3.5 h-3.5 text-purple-600" />
              Son Action
            </a>
          </div>

        </div>

        <div className="max-w-5xl mx-auto mt-8 pt-8 border-t border-black/5 text-center space-y-2">
          <p className="text-xs text-black/60 font-semibold tracking-wider uppercase">
            2026 — . Todos os direitos reservados
          </p>
          <div className="flex items-center justify-center gap-1.5 text-xs text-black/50 font-medium">
            <span>Criado por Luiz Henrique Jaques</span>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-pink-600 hover:text-pink-700 transition-colors p-0.5"
              title="Instagram do Criador"
            >
              <Instagram className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
