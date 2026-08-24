import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Users, 
  Clock, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  MapIcon,
  Navigation,
  MessageCircle,
  Phone
} from 'lucide-react';
import { GNGroup } from '../data/groups';
import { formatDistance } from '../utils/geo';

interface GroupCardProps {
  group: GNGroup;
  distance?: number | null;
  isOpen: boolean;
  onToggle: () => void;
}

export default function GroupCard({ group, distance, isOpen, onToggle }: GroupCardProps) {
  // Category styling
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'MENINAS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest bg-[#FF69B4]/5 text-[#FF69B4] border border-[#FF69B4]/20 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF69B4]" />
            MENINAS
          </span>
        );
      case 'MENINOS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest bg-[#4169E1]/5 text-[#4169E1] border border-[#4169E1]/20 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4169E1]" />
            MENINOS
          </span>
        );
      case 'MISTO':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest bg-[#8A2BE2]/5 text-[#8A2BE2] border border-[#8A2BE2]/20 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8A2BE2]" />
            MISTO
          </span>
        );
    }
  };

  // Get dynamic leader label (Embaixador/Embaixadora)
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
    <div
      id={`gn-card-${group.id}`}
      className={`relative bg-white rounded-2xl border border-black/[0.05] transition-all duration-300 hover:border-black/15 overflow-hidden ${
        isOpen ? 'ring-1 ring-black/5' : ''
      }`}
    >
      {/* Absolute top country flag gradient bar */}
      <div 
        className="absolute top-0 left-0 w-full h-1.5" 
        style={{ 
          background: `linear-gradient(to right, ${group.theme.colors.join(', ')})` 
        }} 
      />

      {/* Header section (Clickable to Toggle) */}
      <div
        className="p-5 pt-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xl inline-block" aria-hidden="true">
              {group.flag}
            </span>
            <span className="text-[10px] font-bold tracking-[0.25em] text-black/40 uppercase">
              GN {group.country}
            </span>
            {getCategoryBadge(group.category)}

            {/* Distance badge if geolocation is available */}
            {distance !== undefined && distance !== null && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100 animate-fade-in">
                <Navigation className="w-3 h-3 text-emerald-500 animate-pulse" />
                {formatDistance(distance)}
              </span>
            )}
          </div>

          <h3 className="text-lg font-light tracking-tight text-[#1A1A1A]">
            {group.name}
          </h3>
          <p className="text-xs text-black/50 mt-1 flex items-center gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-black/40 flex-shrink-0" />
            <span>Bairro {group.neighborhood} · {group.zone}</span>
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 border-t border-black/[0.03] pt-3 sm:pt-0 sm:border-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-black/40 sm:hidden">
            Detalhes do grupo
          </span>
          <button 
            type="button" 
            aria-label={isOpen ? "Fechar detalhes" : "Abrir detalhes"}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-black/[0.02] hover:bg-black/[0.06] text-black/50 transition-colors"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded details section */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="px-5 pb-6 border-t border-black/[0.03] pt-5 bg-black/[0.01] space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Leader */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-black/[0.02] flex items-center justify-center text-black/40 flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[9px] text-black/40 font-bold uppercase tracking-widest">
                      {getLeaderLabel(group.category)}
                    </span>
                    <span className="text-xs font-semibold text-[#1A1A1A]">
                      {group.leader}
                    </span>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-black/[0.02] flex items-center justify-center text-black/40 flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[9px] text-black/40 font-bold uppercase tracking-widest">
                      Dia & Horário
                    </span>
                    <span className="text-xs font-semibold text-[#1A1A1A]">
                      {group.time}
                    </span>
                  </div>
                </div>

                {/* Group type */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-black/[0.02] flex items-center justify-center text-black/40 flex-shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[9px] text-black/40 font-bold uppercase tracking-widest">
                      Categoria do Grupo
                    </span>
                    <span className="text-xs font-semibold text-[#1A1A1A] capitalize">
                      {group.category.toLowerCase()}
                    </span>
                  </div>
                </div>

                {/* WhatsApp Contact */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[9px] text-emerald-700 font-bold uppercase tracking-widest">
                      Contato / WhatsApp
                    </span>
                    <button
                      type="button"
                      onClick={handleWhatsApp}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-1.5 transition-colors"
                    >
                      <span>{group.contact}</span>
                      <span className="text-[9px] bg-emerald-100/80 text-emerald-800 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                        Abrir Chat
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Local / Região (Seguro - Apenas Bairro e Zona) */}
              <div className="flex items-start gap-3 pt-2">
                <div className="w-8 h-8 rounded-lg bg-black/[0.02] flex items-center justify-center text-black/40 flex-shrink-0">
                  <MapIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-[9px] text-black/40 font-bold uppercase tracking-widest">
                    Região & Bairro (Referência Aproximada)
                  </span>
                  <span className="text-xs text-[#1A1A1A] font-medium block">
                    Bairro {group.neighborhood} · {group.zone} — {group.city}
                  </span>
                </div>
              </div>

              {/* Action Buttons: WhatsApp & Maps */}
              <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  id={`whatsapp-btn-${group.id}`}
                  onClick={handleWhatsApp}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-bold text-[10px] tracking-widest uppercase transition-all shadow-sm active:scale-98"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  FALAR NO WHATSAPP
                </button>
                <button
                  type="button"
                  id={`open-map-btn-${group.id}`}
                  onClick={handleOpenMap}
                  style={{ backgroundColor: group.theme.primary }}
                  className="w-full flex items-center justify-center gap-2 hover:brightness-110 text-white py-3 px-4 rounded-xl font-bold text-[10px] tracking-widest uppercase transition-all shadow-sm active:scale-98"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  VER REGIÃO NO MAPA
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
