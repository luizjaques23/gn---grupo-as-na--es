import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Users, 
  Clock, 
  MapPin, 
  ChevronDown, 
  MapIcon,
  Navigation,
  MessageCircle
} from 'lucide-react';
import { GNGroup } from '../data/groups';
import { formatDistance } from '../utils/geo';

interface GroupCardProps {
  group: GNGroup;
  distance?: number | null;
  isOpen: boolean;
  onToggle: () => void;
  index?: number;
}

export default function GroupCard({ group, distance, isOpen, onToggle, index = 0 }: GroupCardProps) {
  // Category badge styling with Light & Dark mode support (clean, without emojis)
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'MENINAS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest bg-pink-500/10 text-pink-600 dark:bg-pink-950/40 dark:text-pink-300 border border-pink-500/20 dark:border-pink-500/30 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
            MENINAS
          </span>
        );
      case 'MENINOS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest bg-blue-500/10 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-500/20 dark:border-blue-500/30 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            MENINOS
          </span>
        );
      case 'KIDS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest bg-amber-500/10 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-500/20 dark:border-amber-500/30 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            KIDS
          </span>
        );
      case 'MISTO':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest bg-purple-500/10 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-500/20 dark:border-purple-500/30 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            MISTO
          </span>
        );
    }
  };

  // Check if this is a group containing girls and boys (MISTO)
  const isMistoGroup = group.category === 'MISTO';
  
  // Determine the sub-classification / target audience (e.g. Adolescentes, Jovens, etc.)
  const getSubAudience = () => {
    const nameLower = group.name.toLowerCase();
    if (nameLower.includes('pré-adolescentes') || nameLower.includes('pre-adolescentes')) {
      return 'Pré-adolescentes';
    }
    if (nameLower.includes('jovens') || nameLower.includes('jovem')) {
      return 'Jovens';
    }
    return 'Adolescentes';
  };

  // Determine title for the mixed section (e.g., "KIDS MISTO" or "MISTO")
  const getMistoHeaderTitle = () => {
    const nameLower = group.name.toLowerCase();
    if (nameLower.includes('kids')) {
      return 'KIDS MISTO';
    }
    return 'MISTO';
  };

  // Dynamic leader label (Embaixador/Embaixadora)
  const getLeaderLabel = (category: string) => {
    if (category === 'MENINAS') return 'Embaixadora';
    if (category === 'MENINOS') return 'Embaixador';
    return 'Embaixador(a)';
  };

  const handleOpenMap = (e: React.MouseEvent) => {
    e.stopPropagation();
    const query = encodeURIComponent(`Bairro ${group.neighborhood}, ${group.city}`);
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(mapUrl, '_blank', 'noopener,noreferrer');
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = encodeURIComponent(`Olá! Gostaria de informações sobre o GN ${group.country} (${group.category}).`);
    const waUrl = `https://wa.me/${group.contactRaw}?text=${message}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ 
        duration: 0.45, 
        ease: [0.22, 1, 0.36, 1],
        delay: Math.min(index * 0.06, 0.3)
      }}
    >
      <div
        id={`gn-card-${group.id}`}
        className={`premium-card relative bg-white/90 dark:bg-[#12131C]/90 glass-card rounded-2xl border border-black/[0.06] dark:border-white/[0.08] overflow-hidden ${
          isOpen 
            ? 'ring-2 ring-purple-500/20 dark:ring-purple-400/20 shadow-lg dark:shadow-xl' 
            : 'shadow-sm dark:shadow-md hover:shadow-md dark:hover:shadow-lg'
        }`}
      >
        {/* Absolute top country flag gradient bar */}
        <div 
          className="absolute top-0 left-0 w-full h-2 rounded-t-2xl" 
          style={{ 
            background: `linear-gradient(to right, ${group.theme.colors.join(', ')})` 
          }} 
        />

        {/* Header section (Clickable to Toggle) */}
        <div
          className="p-5 pt-7 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none active:bg-black/[0.01] dark:active:bg-white/[0.02] transition-colors"
          onClick={onToggle}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2.5 flex-wrap">
              <span className="text-2xl inline-block flag-emoji" aria-hidden="true">
                {group.flag}
              </span>
              <span className="text-[10px] font-bold tracking-[0.25em] text-black/50 dark:text-zinc-400 uppercase">
                GN {group.country}
              </span>
              {getCategoryBadge(group.category)}

              {/* Distance badge if geolocation is available */}
              {distance !== undefined && distance !== null && (
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/40"
                >
                  <Navigation className="w-3 h-3 text-emerald-500 animate-pulse" />
                  {formatDistance(distance)}
                </motion.span>
              )}
            </div>

            <h3 className="text-lg font-bold tracking-tight text-[#1A1A1A] dark:text-zinc-100 leading-tight">
              {group.name}
            </h3>

            <p className="text-xs text-black/60 dark:text-zinc-400 mt-1.5 flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-black/40 dark:text-zinc-500 flex-shrink-0" />
              <span>Bairro {group.neighborhood} · {group.zone}</span>
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 border-t border-black/[0.04] dark:border-white/[0.06] pt-3 sm:pt-0 sm:border-0">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-black/50 dark:text-zinc-400 sm:hidden">
              Detalhes do grupo
            </span>
            <motion.button 
              type="button" 
              aria-label={isOpen ? "Fechar detalhes" : "Abrir detalhes"}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.07] hover:bg-black/[0.1] dark:hover:bg-white/[0.14] text-black/60 dark:text-zinc-300 transition-all"
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <ChevronDown className="w-4.5 h-4.5" />
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Expanded details section */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="px-5 pb-6 border-t border-black/[0.04] dark:border-white/[0.06] pt-5 bg-black/[0.015] dark:bg-black/25 space-y-4">
                
                {/* APRESENTAÇÃO HIERÁRQUICA E ORGANIZADA PARA MENINAS E MENINOS (MISTO) */}
                {isMistoGroup && (
                  <div className="p-4 rounded-xl bg-purple-500/[0.04] dark:bg-purple-950/20 border border-purple-500/15 dark:border-purple-500/25 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-purple-700 dark:text-purple-300">
                        {getMistoHeaderTitle()}
                      </span>
                      <span className="text-[9px] font-bold text-black/40 dark:text-zinc-400 uppercase tracking-widest">
                        Estrutura do Grupo
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Bloco Meninas */}
                      <div className="bg-white/80 dark:bg-[#181926]/80 p-3 rounded-lg border border-pink-500/20 space-y-1">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                          Meninas
                        </span>
                        <span className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                          {getSubAudience()}
                        </span>
                      </div>

                      {/* Bloco Meninos */}
                      <div className="bg-white/80 dark:bg-[#181926]/80 p-3 rounded-lg border border-blue-500/20 space-y-1">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                          Meninos
                        </span>
                        <span className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                          {getSubAudience()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Leader */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-black/[0.04] dark:bg-white/[0.07] flex items-center justify-center text-black/50 dark:text-zinc-400 flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[9px] text-black/45 dark:text-zinc-400 font-bold uppercase tracking-widest">
                        {getLeaderLabel(group.category)}
                      </span>
                      <span className="text-sm font-semibold text-[#1A1A1A] dark:text-zinc-100">
                        {group.leader}
                      </span>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-black/[0.04] dark:bg-white/[0.07] flex items-center justify-center text-black/50 dark:text-zinc-400 flex-shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[9px] text-black/45 dark:text-zinc-400 font-bold uppercase tracking-widest">
                        Dia & Horário
                      </span>
                      <span className="text-sm font-semibold text-[#1A1A1A] dark:text-zinc-100">
                        {group.time}
                      </span>
                    </div>
                  </div>

                  {/* Group type */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-black/[0.04] dark:bg-white/[0.07] flex items-center justify-center text-black/50 dark:text-zinc-400 flex-shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[9px] text-black/45 dark:text-zinc-400 font-bold uppercase tracking-widest">
                        Categoria do Grupo
                      </span>
                      <span className="text-sm font-semibold text-[#1A1A1A] dark:text-zinc-100 capitalize">
                        {group.category.toLowerCase()}
                      </span>
                    </div>
                  </div>

                  {/* WhatsApp Contact */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[9px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-widest">
                        Contato / WhatsApp
                      </span>
                      <button
                        type="button"
                        onClick={handleWhatsApp}
                        className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1.5 transition-colors"
                      >
                        <span>{group.contact}</span>
                        <span className="text-[9px] bg-emerald-100/80 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-semibold">
                          Abrir Chat
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Local / Região (Seguro - Apenas Bairro e Zona) */}
                <div className="flex items-start gap-3 pt-2">
                  <div className="w-9 h-9 rounded-xl bg-black/[0.04] dark:bg-white/[0.07] flex items-center justify-center text-black/50 dark:text-zinc-400 flex-shrink-0">
                    <MapIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-[9px] text-black/45 dark:text-zinc-400 font-bold uppercase tracking-widest">
                      Região & Bairro (Referência Aproximada)
                    </span>
                    <span className="text-sm text-[#1A1A1A] dark:text-zinc-200 font-medium block">
                      Bairro {group.neighborhood} · {group.zone} — {group.city}
                    </span>
                  </div>
                </div>

                {/* Action Buttons: WhatsApp & Maps */}
                <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <motion.button
                    type="button"
                    id={`whatsapp-btn-${group.id}`}
                    onClick={handleWhatsApp}
                    whileTap={{ scale: 0.96 }}
                    className="premium-btn w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-4 rounded-xl font-bold text-[10px] tracking-widest uppercase shadow-sm hover:shadow-md cursor-pointer border border-emerald-700/20"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    FALAR NO WHATSAPP
                  </motion.button>
                  <motion.button
                    type="button"
                    id={`open-map-btn-${group.id}`}
                    onClick={handleOpenMap}
                    whileTap={{ scale: 0.96 }}
                    style={{ backgroundColor: group.theme.primary }}
                    className="premium-btn w-full flex items-center justify-center gap-2 hover:brightness-110 text-white py-3.5 px-4 rounded-xl font-bold text-[10px] tracking-widest uppercase shadow-sm hover:shadow-md cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    VER REGIÃO NO MAPA
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
