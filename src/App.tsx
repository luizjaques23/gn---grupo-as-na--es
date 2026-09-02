/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
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
  ExternalLink,
  Sun,
  Moon,
  Play,
  Share2
} from 'lucide-react';
import { GN_GROUPS } from './data/groups';
import { calculateDistance } from './utils/geo';
import BibleVerseTicker from './components/BibleVerseTicker';
import GroupCard from './components/GroupCard';
import { BgradientAnim } from '@/components/ui/soft-gradient-background-animation';
import { CHRISTIAN_GALLERY_PHOTOS } from '@/components/ui/demo';

// Smooth section entrance animation config
const sectionAnim = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }
};

export default function App() {
  // Theme State (Light / Dark Mode)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gn_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // Synchronize theme with DOM
  useEffect(() => {
    const root = document.documentElement;
    const meta = document.getElementById('theme-color-meta');
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('gn_theme', 'dark');
      if (meta) meta.setAttribute('content', '#090A0F');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('gn_theme', 'light');
      if (meta) meta.setAttribute('content', '#F8F9FA');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // State to control Instagram video embed loading (Prevents 10s initial mobile delay)
  const [showInstagramEmbed, setShowInstagramEmbed] = useState(false);

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
        flag: match?.flag || '🏳️'
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
        setViewMode('catalog');
        setCatalogCategory('ALL');
        setCatalogCountry('ALL');
        
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

    if (catalogCategory !== 'ALL') {
      result = result.filter((g) => g.category === catalogCategory);
    }

    if (catalogCountry !== 'ALL') {
      result = result.filter((g) => g.country === catalogCountry);
    }

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
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#090A0F] text-[#1A1A1A] dark:text-[#F3F4F6] font-sans selection:bg-purple-500/20 selection:text-purple-700 dark:selection:text-purple-300 transition-colors duration-300 relative overflow-x-hidden">
      
      {/* Soft OKLCH Animated Gradient Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <BgradientAnim className="opacity-70 dark:opacity-80" animationDuration={10} />
      </div>

      {/* Decorative neon ambient blur accents */}
      <div className="absolute top-0 left-0 w-full h-[600px] pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute top-32 right-0 w-80 h-80 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute top-60 left-1/3 w-64 h-64 bg-emerald-400/10 dark:bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      {/* Top Floating Dark/Light Toggle Bar */}
      <div className="relative z-20 max-w-5xl mx-auto px-6 pt-4 flex justify-end items-center">
        <motion.button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-zinc-900/80 border border-black/10 dark:border-white/15 text-xs font-semibold text-zinc-800 dark:text-zinc-200 shadow-sm hover:shadow-md transition-all backdrop-blur-md cursor-pointer"
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.03 }}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-bold">Modo Claro</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-[11px] font-bold">Modo Escuro</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Hero Header Section */}
      <motion.header 
        id="app-header" 
        className="relative z-10 px-6 md:px-12 pt-4 pb-6 text-center border-b border-black/5 dark:border-white/5 max-w-5xl mx-auto flex flex-col items-center"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div 
          className="bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-500 p-3 px-6 rounded-2xl border border-white/20 shadow-lg inline-flex items-center justify-center mb-3"
          whileHover={{ scale: 1.05, rotate: -1 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <img 
            src="/white_logo_ian.png" 
            alt="Igreja às Nações Logo" 
            className="h-11 md:h-14 w-auto object-contain drop-shadow-xs" 
            loading="eager"
            fetchPriority="high"
          />
        </motion.div>
        <p className="text-[9px] tracking-[0.35em] font-bold text-black/50 dark:text-zinc-400 uppercase">Igreja às Nações</p>
        <p className="text-[9px] tracking-[0.35em] font-bold text-black/50 dark:text-zinc-400 uppercase mt-0.5">Supervisão Resgate · Continente das Américas</p>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-2.5 bg-gradient-to-r from-purple-600 via-blue-500 to-emerald-500 dark:from-purple-400 dark:via-blue-400 dark:to-emerald-400 bg-clip-text text-transparent gradient-shimmer">
          Grupo às Nações — GN
        </h1>
      </motion.header>

      {/* Global Bible Verse Ticker */}
      <motion.div 
        className="max-w-5xl mx-auto px-6 md:px-12 mt-4 relative z-10"
        {...sectionAnim}
      >
        <div className="border border-black/[0.06] dark:border-white/[0.08] bg-white/60 dark:bg-[#12131C]/60 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm">
          <BibleVerseTicker />
        </div>
      </motion.div>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-6 md:px-12 py-8 relative z-10">

        {/* Explicação e Importância sobre GN */}
        <motion.section 
          className="mb-10 max-w-4xl mx-auto space-y-4 text-left"
          {...sectionAnim}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <motion.div 
              className="premium-card bg-white/90 dark:bg-[#12131C]/90 glass-card p-6 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-2.5 transition-colors"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-xs font-bold text-black dark:text-white uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                O que é um GN?
              </h3>
              <p className="text-xs md:text-sm text-black/75 dark:text-zinc-300 leading-relaxed">
                <strong className="text-black dark:text-white font-semibold">GN significa "Grupo às Nações"</strong>. São grupos de adolescentes e jovens que se reúnem semanalmente nos bairros e regiões de Porto Velho para compartilhar a Palavra de Deus, fortalecer a comunhão, orar, louvar e construir amizades verdadeiras.
              </p>
            </motion.div>

            <motion.div 
              className="premium-card bg-white/90 dark:bg-[#12131C]/90 glass-card p-6 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-2.5 transition-colors"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-xs font-bold text-black dark:text-white uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                Qual a importância do GN?
              </h3>
              <p className="text-xs md:text-sm text-black/75 dark:text-zinc-300 leading-relaxed">
                Os GNs possuem um papel estratégico no crescimento espiritual e na integração dos participantes na igreja. Eles permitem um acompanhamento próximo, cuidado pastoral, fortalecimento da fé e evangelismo com propósito.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Section Divider */}
        <div className="section-divider my-10 max-w-xs mx-auto" />

        {/* Action Call for Nearest GN */}
        <motion.section 
          className="mb-10 text-center max-w-3xl mx-auto space-y-4"
          {...sectionAnim}
        >
          <div className="space-y-1.5">
            <p className="text-[10px] tracking-[0.25em] font-bold text-black/50 dark:text-zinc-400 uppercase">Encontre um GN perto de você</p>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Uma família para pertencer.
            </h3>
            <p className="text-xs text-black/60 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              Ative a sua localização para descobrir instantaneamente quais grupos de conexão estão mais próximos de você.
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <motion.button
              type="button"
              id="btn-get-location"
              disabled={isLocating}
              onClick={handleRequestLocation}
              className="premium-btn inline-flex items-center justify-center gap-2.5 text-xs font-bold tracking-widest uppercase px-8 py-4 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-full shadow-lg hover:shadow-xl disabled:opacity-50 cursor-pointer border border-black/5"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
            >
              <span className={`text-red-500 ${isLocating ? '' : 'gps-pulse'} inline-block`}>📍</span>
              {isLocating ? 'Obtendo GPS...' : 'Localizar via GPS'}
            </motion.button>
          </div>

          {/* Geolocation feedback */}
          <AnimatePresence>
            {userCoords && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1"
              >
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                Localização capturada! GNs ordenados por proximidade.
              </motion.p>
            )}
            {geoError && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-800/40 rounded-xl text-xs max-w-md mx-auto"
              >
                ⚠️ {geoError} Tente buscar manualmente abaixo.
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Navigation Switch between Wizard Mode and Catalog Mode */}
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-black/[0.04] dark:bg-white/[0.06] p-1.5 rounded-full inline-flex gap-1 border border-black/5 dark:border-white/10 shadow-sm">
            <motion.button
              type="button"
              id="switch-mode-wizard"
              onClick={() => setViewMode('wizard')}
              className={`px-5 py-2.5 rounded-full font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
                viewMode === 'wizard'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                  : 'text-black/60 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <Compass className="w-3.5 h-3.5" />
              Descoberta Guiada
            </motion.button>
            <motion.button
              type="button"
              id="switch-mode-catalog"
              onClick={() => setViewMode('catalog')}
              className={`px-5 py-2.5 rounded-full font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
                viewMode === 'catalog'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                  : 'text-black/60 dark:text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <Search className="w-3.5 h-3.5" />
              Catálogo Completo
            </motion.button>
          </div>
        </motion.div>

        {/* VIEW 1: DISCOVERY WIZARD (DEFAULT) */}
        {viewMode === 'wizard' && (
          <motion.section 
            id="wizard-section" 
            className="space-y-6 bg-white/90 dark:bg-[#12131C]/90 glass-card p-6 md:p-8 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm transition-colors"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
          >
            <div className="text-center space-y-1.5">
              <span className="text-[9px] font-bold tracking-[0.3em] text-black/40 dark:text-zinc-400 uppercase">Ache seu grupo</span>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Sistema de Descoberta Guiada
              </h2>
              <p className="text-xs text-black/60 dark:text-zinc-400 max-w-sm mx-auto">
                Encontre o seu grupo de conexão perfeito respondendo a apenas duas perguntas simples.
              </p>
            </div>

            {/* Stepper Progress Bar */}
            <div className="flex items-center justify-center gap-3 max-w-xs mx-auto py-1">
              {[1, 2, 3].map((s) => (
                <motion.div 
                  key={s}
                  className={`flex-1 h-1.5 rounded-full transition-colors ${step >= s ? 'bg-black dark:bg-white' : 'bg-black/10 dark:bg-white/15'}`}
                  animate={{ scaleX: step >= s ? 1 : 0.85 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* STEP 1: SELECT CATEGORY */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-5"
                >
                  <h3 className="text-center text-xs font-bold uppercase tracking-wider text-black/70 dark:text-zinc-300">
                    1. Com qual tipo de grupo você quer participar?
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 max-w-4xl mx-auto">
                    {/* MENINAS */}
                    <motion.button
                      type="button"
                      id="wizard-cat-meninas"
                      onClick={() => selectWizardCategory('MENINAS')}
                      className="group py-6 px-3 border border-pink-500/20 dark:border-pink-500/30 bg-pink-500/5 dark:bg-pink-950/20 text-pink-600 dark:text-pink-300 rounded-2xl hover:bg-pink-500/10 dark:hover:bg-pink-950/40 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer shadow-sm"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ y: -3 }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                      <span className="text-xs font-bold tracking-[0.2em] uppercase">MENINAS</span>
                      <span className="text-[10px] text-black/50 dark:text-zinc-400 font-medium">Adolescentes</span>
                    </motion.button>

                    {/* MENINOS */}
                    <motion.button
                      type="button"
                      id="wizard-cat-meninos"
                      onClick={() => selectWizardCategory('MENINOS')}
                      className="group py-6 px-3 border border-blue-500/20 dark:border-blue-500/30 bg-blue-500/5 dark:bg-blue-950/20 text-blue-600 dark:text-blue-300 rounded-2xl hover:bg-blue-500/10 dark:hover:bg-blue-950/40 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer shadow-sm"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ y: -3 }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span className="text-xs font-bold tracking-[0.2em] uppercase">MENINOS</span>
                      <span className="text-[10px] text-black/50 dark:text-zinc-400 font-medium">Adolescentes</span>
                    </motion.button>

                    {/* MISTO */}
                    <motion.button
                      type="button"
                      id="wizard-cat-misto"
                      onClick={() => selectWizardCategory('MISTO')}
                      className="group py-6 px-3 border border-purple-500/20 dark:border-purple-500/30 bg-purple-500/5 dark:bg-purple-950/20 text-purple-600 dark:text-purple-300 rounded-2xl hover:bg-purple-500/10 dark:hover:bg-purple-950/40 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer shadow-sm"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ y: -3 }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                      <span className="text-xs font-bold tracking-[0.2em] uppercase">MISTO</span>
                      <span className="text-[10px] text-black/50 dark:text-zinc-400 font-medium">Comunhão Geral</span>
                    </motion.button>

                    {/* KIDS */}
                    <motion.button
                      type="button"
                      id="wizard-cat-kids"
                      onClick={() => selectWizardCategory('KIDS')}
                      className="group py-6 px-3 border border-amber-500/20 dark:border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 text-amber-600 dark:text-amber-300 rounded-2xl hover:bg-amber-500/10 dark:hover:bg-amber-950/40 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer shadow-sm"
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ y: -3 }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="text-xs font-bold tracking-[0.2em] uppercase">KIDS</span>
                      <span className="text-[10px] text-black/50 dark:text-zinc-400 font-medium">Crianças</span>
                    </motion.button>

                    {/* JOVEM - EM BREVE */}
                    <div
                      className="relative py-6 px-3 border border-cyan-500/25 dark:border-cyan-500/30 bg-cyan-500/5 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-300 rounded-2xl flex flex-col items-center justify-center gap-2 select-none opacity-80"
                    >
                      <span className="absolute top-2 right-2 text-[8px] font-extrabold uppercase tracking-widest bg-cyan-600 text-white px-2 py-0.5 rounded-full">
                        Em breve
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                      <span className="text-xs font-bold tracking-[0.2em] uppercase">JOVEM</span>
                      <span className="text-[10px] text-black/50 dark:text-zinc-400 font-medium">Jovens</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: SELECT COUNTRY */}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-5"
                >
                  <div className="flex justify-between items-center max-w-2xl mx-auto">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      ← Voltar pro Tipo
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-black/70 dark:text-zinc-300 bg-black/[0.04] dark:bg-white/[0.08] px-3 py-1 rounded-full border border-black/5 dark:border-white/10">
                      Foco: {selectedCategory}
                    </span>
                  </div>

                  <h3 className="text-center text-xs font-bold uppercase tracking-wider text-black/70 dark:text-zinc-300">
                    2. Escolha o país onde você deseja se conectar
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
                    {wizardFilteredCountries.map((c, idx) => {
                      const count = GN_GROUPS.filter(
                        (g) => g.country === c.name && g.category === selectedCategory
                      ).length;

                      return (
                        <motion.button
                          key={c.name}
                          type="button"
                          id={`wizard-country-${c.code}`}
                          onClick={() => selectWizardCountry(c.name)}
                          className="flag-shimmer group bg-white/90 dark:bg-[#181926]/90 glass-card rounded-2xl border border-black/[0.06] dark:border-white/[0.08] p-4 text-center transition-all hover:border-black/20 dark:hover:border-white/20 cursor-pointer shadow-sm hover:shadow-md"
                          whileTap={{ scale: 0.95 }}
                          whileHover={{ y: -3 }}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04, duration: 0.3 }}
                        >
                          <span className="text-3xl block mb-2 flag-emoji transition-transform">
                            {c.flag}
                          </span>
                          <span className="block font-semibold text-xs text-zinc-900 dark:text-white tracking-tight">
                            {c.name}
                          </span>
                          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-black/[0.03] dark:bg-white/[0.06] text-[9px] font-bold text-black/50 dark:text-zinc-400 uppercase tracking-widest">
                            {count} {count === 1 ? 'grupo' : 'grupos'}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: SHOW MATCHING GROUPS */}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-2xl mx-auto pb-4 border-b border-black/[0.04] dark:border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer transition-colors"
                      >
                        ← Voltar para Países
                      </button>
                      <span className="text-black/20 dark:text-white/20">|</span>
                      <button
                        type="button"
                        onClick={resetWizard}
                        className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" /> Reiniciar Busca
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-black/60 dark:text-zinc-300 bg-black/[0.04] dark:bg-white/[0.08] px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {selectedCategory?.toLowerCase()}
                      </span>
                      <span className="text-[10px] font-bold text-black/60 dark:text-zinc-300 bg-black/[0.04] dark:bg-white/[0.08] px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {selectedCountry}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-center text-xs font-bold uppercase tracking-wider text-black/70 dark:text-zinc-300">
                    ✨ GNs Encontrados para você:
                  </h3>

                  {wizardFinalGroups.length > 0 ? (
                    <div className="space-y-4 max-w-2xl mx-auto">
                      {wizardFinalGroups.map((group, idx) => (
                        <GroupCard
                          key={group.id}
                          group={group}
                          distance={group.distance}
                          isOpen={expandedCardId === group.id}
                          onToggle={() =>
                            setExpandedCardId(expandedCardId === group.id ? null : group.id)
                          }
                          index={idx}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 max-w-md mx-auto space-y-3">
                      <div className="text-4xl">🕊️</div>
                      <p className="font-semibold tracking-tight text-zinc-900 dark:text-white">Nenhum grupo ativo encontrado para esta seleção.</p>
                      <p className="text-xs text-black/60 dark:text-zinc-400 leading-relaxed">
                        Tente mudar a categoria do grupo ou explore outras nações no catálogo completo.
                      </p>
                      <motion.button
                        type="button"
                        onClick={resetWizard}
                        className="mt-2 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 px-5 py-2.5 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer"
                        whileTap={{ scale: 0.95 }}
                      >
                        Ver Outros Grupos
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}

        {/* VIEW 2: COMPLETE INTERACTIVE CATALOG */}
        {viewMode === 'catalog' && (
          <motion.section 
            id="catalog-section" 
            className="space-y-6 bg-white/90 dark:bg-[#12131C]/90 glass-card p-6 md:p-8 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm transition-colors"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
          >
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-black/[0.04] dark:border-white/[0.06]">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Nossas Nações &amp; Grupos
                </h2>
                <p className="text-xs text-black/60 dark:text-zinc-400 mt-1">
                  Explore e filtre todos os {GN_GROUPS.length} GNs ativos globalmente.
                </p>
              </div>

              {/* Reset active filters */}
              {(catalogCategory !== 'ALL' || catalogCountry !== 'ALL' || searchQuery !== '') && (
                <motion.button
                  type="button"
                  onClick={() => {
                    setCatalogCategory('ALL');
                    setCatalogCountry('ALL');
                    setSearchQuery('');
                  }}
                  className="text-[10px] font-bold text-black dark:text-white hover:underline flex items-center gap-1 bg-black/[0.03] dark:bg-white/[0.06] px-3 py-1.5 rounded-full border border-black/5 dark:border-white/10 uppercase tracking-wider cursor-pointer"
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Limpar filtros
                </motion.button>
              )}
            </div>

            {/* Filter Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-3.5 h-3.5 text-black/40 dark:text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar líder, cidade, bairro..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-black/10 dark:border-white/15 rounded-xl pl-9 pr-4 py-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 placeholder:text-black/40 dark:placeholder:text-zinc-500 font-medium transition-all"
                />
              </div>

              {/* Category filter */}
              <div className="relative">
                <SlidersHorizontal className="absolute left-3 top-3.5 w-3.5 h-3.5 text-black/40 dark:text-zinc-500 pointer-events-none" />
                <select
                  value={catalogCategory}
                  onChange={(e) => setCatalogCategory(e.target.value as any)}
                  className="w-full bg-black/[0.02] dark:bg-zinc-900 border border-black/10 dark:border-white/15 rounded-xl pl-9 pr-4 py-3 text-xs text-zinc-900 dark:text-zinc-100 appearance-none focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 font-medium cursor-pointer transition-all"
                >
                  <option value="ALL" className="dark:bg-zinc-900">Todas as Categorias</option>
                  <option value="MENINAS" className="dark:bg-zinc-900">MENINAS</option>
                  <option value="MENINOS" className="dark:bg-zinc-900">MENINOS</option>
                  <option value="MISTO" className="dark:bg-zinc-900">MISTO</option>
                  <option value="KIDS" className="dark:bg-zinc-900">KIDS</option>
                </select>
              </div>

              {/* Country filter */}
              <div className="relative">
                <Globe2 className="absolute left-3 top-3.5 w-3.5 h-3.5 text-black/40 dark:text-zinc-500 pointer-events-none" />
                <select
                  value={catalogCountry}
                  onChange={(e) => setCatalogCountry(e.target.value)}
                  className="w-full bg-black/[0.02] dark:bg-zinc-900 border border-black/10 dark:border-white/15 rounded-xl pl-9 pr-4 py-3 text-xs text-zinc-900 dark:text-zinc-100 appearance-none focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 font-medium cursor-pointer transition-all"
                >
                  <option value="ALL" className="dark:bg-zinc-900">Todos os Países</option>
                  {countriesList.map((c) => (
                    <option key={c.name} value={c.name} className="dark:bg-zinc-900">
                      {c.flag} {c.name.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results count & Quick guide */}
            <div className="flex items-center justify-between text-[10px] text-black/50 dark:text-zinc-400 font-bold uppercase tracking-wider px-1">
              <span>{filteredCatalogGroups.length} {filteredCatalogGroups.length === 1 ? 'grupo encontrado' : 'grupos encontrados'}</span>
              {userCoords && <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">Filtro de proximidade ativo 📍</span>}
            </div>

            {/* Catalog Group List */}
            {filteredCatalogGroups.length > 0 ? (
              <div className="space-y-4">
                {filteredCatalogGroups.map((group, idx) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    distance={group.distance}
                    isOpen={expandedCardId === group.id}
                    onToggle={() =>
                      setExpandedCardId(expandedCardId === group.id ? null : group.id)
                    }
                    index={idx}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 space-y-3">
                <div className="text-4xl">🕊️</div>
                <h3 className="font-semibold tracking-tight text-zinc-900 dark:text-white">Nenhum GN corresponde aos filtros.</h3>
                <p className="text-xs text-black/60 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
                  Tente remover termos de pesquisa ou resetar os filtros selecionados para explorar outros grupos de conexão.
                </p>
                <motion.button
                  type="button"
                  onClick={() => {
                    setCatalogCategory('ALL');
                    setCatalogCountry('ALL');
                    setSearchQuery('');
                  }}
                  className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                  whileTap={{ scale: 0.95 }}
                >
                  Ver Todos os GNs
                </motion.button>
              </div>
            )}
          </motion.section>
        )}

        {/* Section Divider */}
        <div className="section-divider my-14 max-w-xs mx-auto" />

        {/* NOSSOS GNs Flag Carousel Section (Auto Infinite Marquee) */}
        <motion.section 
          id="our-nations" 
          className="mt-14 space-y-5"
          {...sectionAnim}
        >
          <div className="text-center space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/50 dark:text-zinc-400">
              Nações Representadas
            </p>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Nossos GNs
            </h2>
            <p className="text-xs text-black/60 dark:text-zinc-400 max-w-md mx-auto">
              Bandeiras passando automaticamente — toque em qualquer país para explorar os grupos
            </p>
            <div className="h-0.5 w-10 bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500 mx-auto mt-2 rounded-full" />
          </div>

          {/* Continuous Automatic Animated Carousel with Infinite Loop */}
          <div className="relative overflow-hidden w-full py-3">
            <div className="animate-marquee-infinite gap-3 px-2">
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
                    className="flag-shimmer w-[180px] sm:w-[200px] flex-shrink-0 bg-white/90 dark:bg-[#12131C]/90 glass-card rounded-2xl p-4 border border-black/[0.06] dark:border-white/[0.08] border-t-4 flex flex-col items-center text-center gap-2 transition-all hover:border-black/20 dark:hover:border-white/20 hover:shadow-lg hover:-translate-y-1 active:scale-95 group cursor-pointer relative overflow-hidden select-none"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-black/[0.03] dark:bg-white/[0.06] flex items-center justify-center text-3xl flag-emoji transition-transform shadow-sm">
                      <span aria-hidden="true">{country.flag}</span>
                    </div>
                    <div>
                      <span className="block font-bold text-xs text-zinc-900 dark:text-zinc-100 tracking-tight uppercase group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        GN {country.name}
                      </span>
                      <span className="block text-[10px] text-black/50 dark:text-zinc-400 font-semibold mt-0.5">
                        {countryGroupsCount} {countryGroupsCount === 1 ? 'Grupo ativo' : 'Grupos ativos'}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full uppercase tracking-wider mt-1 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      Ver Grupos →
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* Section Divider */}
        <div className="section-divider my-14 max-w-xs mx-auto" />

        {/* Son Action Section — Optimized with Zero-Lag Smart Video Card */}
        <motion.section 
          className="mt-14 mb-10 max-w-3xl mx-auto text-center space-y-5"
          {...sectionAnim}
        >
          <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-orange-400 p-[2px] rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-white/95 dark:bg-[#12131C]/95 glass-card rounded-[22px] p-6 md:p-8 space-y-4 transition-colors">
              <h3 className="text-lg md:text-xl font-extrabold uppercase tracking-wider bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent gradient-shimmer">
                Participe também da Son Action!
              </h3>
              <p className="text-xs md:text-sm text-black/70 dark:text-zinc-300 leading-relaxed">
                Aqui na Igreja às Nações temos um culto de adolescentes muito avivado em Porto Velho. É um lugar para viver experiências com Deus, fazer novas amizades, fortalecer a fé e descobrir que seguir Jesus também pode ser uma experiência intensa, alegre e transformadora.
              </p>
              <p className="text-xs md:text-sm text-black/80 dark:text-zinc-200 leading-relaxed font-semibold">
                Você não precisa viver essa fase sozinho. Venha fazer parte dessa geração, traga seus amigos e venha viver tudo aquilo que Deus preparou para você!
              </p>
              <p className="text-sm md:text-base font-extrabold uppercase tracking-widest text-zinc-900 dark:text-white">
                A Son Action é o seu lugar. Vem viver essa experiência com a gente! 🔥
              </p>

              {/* Fast Instant-Loading Video Card (Eliminates the 10s mobile freeze) */}
              <div className="pt-2 flex justify-center">
                <div className="w-full max-w-[320px] rounded-2xl overflow-hidden shadow-lg border border-orange-500/20 bg-zinc-950 text-white relative">
                  {!showInstagramEmbed ? (
                    <div className="relative aspect-[9/16] bg-gradient-to-b from-zinc-900 via-zinc-950 to-black flex flex-col items-center justify-between p-6 text-center select-none overflow-hidden">
                      {/* Background thumbnail */}
                      <img
                        src="/images/sonaction/sonaction-1.jpg"
                        alt="Son Action Culto de Jovens"
                        className="absolute inset-0 w-full h-full object-cover opacity-35 scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                      {/* Header Badge */}
                      <div className="relative z-10 w-full flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-orange-400 flex items-center justify-center text-white">
                            <Instagram className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[11px] font-bold tracking-tight">@sonaction_</span>
                        </div>
                        <span className="text-[9px] uppercase tracking-wider bg-orange-500 text-white px-2 py-0.5 rounded-full font-extrabold">
                          Reel
                        </span>
                      </div>

                      {/* Play Action */}
                      <div className="relative z-10 space-y-3">
                        <motion.button
                          type="button"
                          onClick={() => setShowInstagramEmbed(true)}
                          className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 mx-auto cursor-pointer"
                          aria-label="Carregar e assistir vídeo no site"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Play className="w-7 h-7 fill-white ml-1" />
                        </motion.button>
                        <div>
                          <p className="text-sm font-bold tracking-tight">Vídeo do Culto</p>
                          <p className="text-[10px] text-zinc-300">Toque para carregar a prévia</p>
                        </div>
                      </div>

                      {/* Bottom Button to Direct Instagram */}
                      <div className="relative z-10 w-full">
                        <a
                          href="https://www.instagram.com/reel/DcTxyuOszo8/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold tracking-wider uppercase backdrop-blur-md transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Abrir no Instagram
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[9/16] w-full bg-black">
                      <iframe
                        src="https://www.instagram.com/reel/DcTxyuOszo8/embed"
                        className="w-full h-full border-0"
                        allowFullScreen
                        title="Son Action — Reel do Instagram"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Siga a Son Action */}
              <div className="pt-2 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-black/50 dark:text-zinc-400">
                  Siga a Son Action
                </h4>
                <p className="text-xs text-black/60 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                  Acompanhe nossos cultos, momentos, novidades e tudo o que Deus está fazendo através dessa geração.
                </p>
                <motion.a
                  href="https://www.instagram.com/sonaction_/?igsi=NzZqejh0NXIxbnlp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 hover:brightness-110 text-white font-bold text-[11px] tracking-widest uppercase px-6 py-3.5 rounded-full shadow-md active:scale-95 transition-all"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Instagram className="w-4 h-4" />
                  Seguir @sonaction_
                </motion.a>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Section Divider */}
        <div className="section-divider my-14 max-w-xs mx-auto" />

        {/* Galeria de Fotos Cristãs & Vivência nos GNs / Son Action (Carrossel Lateral Contínuo) */}
        <motion.section 
          id="galeria-fotos" 
          className="mt-14 mb-10 space-y-5"
          {...sectionAnim}
        >
          <div className="text-center space-y-1 max-w-5xl mx-auto px-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 dark:bg-purple-950/40 border border-purple-500/20 text-[10px] font-bold uppercase tracking-[0.25em] text-purple-700 dark:text-purple-300 mb-1">
              <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              Galeria &amp; Comunhão
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Momentos de Fé, Louvor &amp; Amizade
            </h2>
            <p className="text-xs md:text-sm text-black/60 dark:text-zinc-400 max-w-md mx-auto">
              Fotos passando lateralmente — toque ou segure em qualquer foto para pausar e ver detalhes
            </p>
            <div className="h-0.5 w-10 bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500 mx-auto mt-2 rounded-full" />
          </div>

          {/* Lateral Continuous Infinite Marquee Carousel */}
          <div className="relative overflow-hidden w-full py-4">
            <div className="animate-marquee-photos gap-4 px-2">
              {[...CHRISTIAN_GALLERY_PHOTOS, ...CHRISTIAN_GALLERY_PHOTOS, ...CHRISTIAN_GALLERY_PHOTOS, ...CHRISTIAN_GALLERY_PHOTOS].map((item, idx) => (
                <div
                  key={`${item.title}-${idx}`}
                  className="w-[280px] sm:w-[320px] h-[380px] sm:h-[400px] flex-shrink-0 bg-white dark:bg-[#12131C] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden relative group select-none flex flex-col justify-end"
                >
                  {/* Photo with smooth zoom on hover/touch */}
                  <img
                    src={item.src}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  
                  {/* Dark gradient overlay for text readability in both light & dark mode */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10 transition-opacity" />

                  {/* Top Category Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`inline-block px-3 py-1 rounded-full ${item.badgeColor} text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md`}>
                      {item.category}
                    </span>
                  </div>

                  {/* Bottom Text Content */}
                  <div className="relative z-10 p-5 space-y-1.5 text-left text-white">
                    <h3 className="text-base sm:text-lg font-bold tracking-tight text-white drop-shadow-sm">
                      {item.title}
                    </h3>
                    <p className="text-xs text-white/80 font-medium leading-snug line-clamp-2">
                      {item.description}
                    </p>
                    <div className="pt-2 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-white/60 uppercase">
                      <span>Igreja às Nações</span>
                      <span>·</span>
                      <span>Son Action</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

      </main>

      {/* Elegant Footer */}
      <footer className="bg-white/95 dark:bg-[#0E0F16]/95 glass-card text-zinc-500 dark:text-zinc-400 py-12 px-6 md:px-12 border-t border-black/5 dark:border-white/10 relative z-10 mt-14 transition-colors">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Logo & Slogan */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center md:text-left">
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-500 p-3 px-4 rounded-xl border border-white/20 shadow-md flex items-center justify-center flex-shrink-0">
              <img 
                src="/white_logo_ian.png" 
                alt="Igreja às Nações Logo" 
                className="h-9 w-auto object-contain drop-shadow-xs" 
                loading="lazy"
              />
            </div>
            <div className="space-y-1">
              <span className="text-zinc-900 dark:text-white font-extrabold tracking-tight text-sm block">
                IGREJA ÀS NAÇÕES
              </span>
              <p className="text-[11px] text-black/60 dark:text-zinc-400 font-medium">
                Supervisão Resgate · Continente das Américas · Adolescentes
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Igreja+%C3%A0s+Na%C3%A7%C3%B5es+R.+Raimundo+Cantu%C3%A1ria+2290+Mato+Grosso+Porto+Velho+RO"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-black/70 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:underline inline-flex items-center gap-1 font-medium transition-colors"
                title="Abrir no Google Maps"
              >
                <MapPin className="w-3 h-3 text-red-500 flex-shrink-0" />
                R. Raimundo Cantuária, 2290 - Mato Grosso, Porto Velho - RO, 76804-416
              </a>
            </div>
          </div>

          {/* Official Church Links */}
          <div className="flex flex-wrap gap-2.5 justify-center">
            <a
              href="https://asnacoes.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="premium-btn inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/[0.03] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-[11px] font-bold text-zinc-800 dark:text-zinc-200 transition-all uppercase tracking-wider border border-black/10 dark:border-white/10 active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5 text-black/50 dark:text-zinc-400" />
              Site Oficial
            </a>
            <a
              href="https://www.instagram.com/igrejaasnacoes?igsi=YXppbmp4cWd6bWFu"
              target="_blank"
              rel="noopener noreferrer"
              className="premium-btn inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/40 dark:via-pink-950/40 dark:to-orange-950/40 hover:brightness-95 text-[11px] font-bold text-pink-700 dark:text-pink-300 transition-all uppercase tracking-wider border border-pink-200/60 dark:border-pink-800/40 shadow-sm active:scale-95"
            >
              <Instagram className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
              Instagram Oficial
            </a>
            <a
              href="https://www.instagram.com/sonaction_/?igsi=NzZqejh0NXIxbnlp"
              target="_blank"
              rel="noopener noreferrer"
              className="premium-btn inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-[11px] font-bold text-purple-700 dark:text-purple-300 transition-all uppercase tracking-wider border border-purple-200/60 dark:border-purple-800/40 shadow-sm active:scale-95"
            >
              <Instagram className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              Son Action
            </a>
          </div>

        </div>

        <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-black/5 dark:border-white/10 text-center space-y-2">
          <p className="text-xs text-black/60 dark:text-zinc-400 font-semibold tracking-wider uppercase">
            2026 — . Todos os direitos reservados
          </p>
          <div className="flex items-center justify-center gap-1.5 text-xs text-black/50 dark:text-zinc-500 font-medium">
            <span>Criado por Luiz Henrique Jaques</span>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-pink-600 dark:text-pink-400 hover:text-pink-700 transition-colors p-0.5"
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
