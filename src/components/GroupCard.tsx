import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, MapPin, Navigation } from 'lucide-react';
import { GNGroup } from '../data/groups';
import { formatDistance } from '../utils/geo';
import { nationInk, nationInk2 } from '@/lib/nation';
import { categoryInk } from '@/lib/category';
import { chartEase } from './atlas/Plate';
import Flag from './atlas/Flag';

interface GroupCardProps {
  group: GNGroup;
  distance?: number | null;
  isOpen: boolean;
  onToggle: () => void;
  index?: number;
}

/** Como a liderança é chamada em cada tipo de grupo. */
function leaderLabel(category: string) {
  if (category === 'MENINAS') return 'Embaixadora';
  if (category === 'MENINOS') return 'Embaixador';
  return 'Embaixador(a)';
}

/** Faixa etária, deduzida do nome do grupo. */
function audience(name: string) {
  const n = name.toLowerCase();
  if (n.includes('pré-adolescentes') || n.includes('pre-adolescentes')) return 'Pré-adolescentes';
  if (n.includes('jovens') || n.includes('jovem')) return 'Jovens';
  if (n.includes('kids') || n.includes('crianças')) return 'Crianças';
  return 'Adolescentes';
}

/** Coordenada em graus, minutos e segundos. */
function dms(value: number, positive: string, negative: string) {
  const hemisphere = value >= 0 ? positive : negative;
  const abs = Math.abs(value);
  const deg = Math.floor(abs);
  const minFloat = (abs - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = Math.round((minFloat - min) * 60);
  return `${String(deg).padStart(2, '0')}°${String(min).padStart(2, '0')}'${String(sec).padStart(2, '0')}"${hemisphere}`;
}

export default function GroupCard({
  group,
  distance,
  isOpen,
  onToggle,
  index = 0,
}: GroupCardProps) {
  const ink = nationInk(group.theme);
  const ink2 = nationInk2(group.theme);
  const sheet = `${group.countryCode}·${String(index + 1).padStart(2, '0')}`;

  const openWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = encodeURIComponent(
      `Olá! Gostaria de informações sobre o GN ${group.country} (${group.category}).`
    );
    window.open(`https://wa.me/${group.contactRaw}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const openMap = (e: React.MouseEvent) => {
    e.stopPropagation();
    // O ponto exato do grupo, não o centro do bairro: coordenada crua no
    // `query` faz o Google Maps cravar o pino na latitude/longitude da ficha.
    const { latitude, longitude } = group.coordinates;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <motion.article
      data-nation={ink}
      data-nation-2={ink2}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, ease: chartEase, delay: Math.min(index * 0.05, 0.25) }}
      className="plate plate-corners group"
      style={{ borderColor: isOpen ? ink : undefined }}
    >
      <div className="flex">
        {/* Canaleta com as cores reais da bandeira */}
        <div className="flag-gutter shrink-0" aria-hidden>
          {group.theme.colors.map((c, i) => (
            <span key={`${c}-${i}`} style={{ background: c }} />
          ))}
        </div>

        <div className="flex-1 min-w-0">
          {/* Cabeçalho clicável */}
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            aria-controls={`gn-detalhe-${group.id}`}
            className="w-full text-left px-5 sm:px-6 py-5 cursor-pointer transition-colors duration-300 hover:bg-paper-sunk"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {/* Linha de identificação */}
                <div className="flex items-center gap-3 flex-wrap">
                  <Flag
                    code={group.countryCode}
                    name={group.country}
                    colors={group.theme.colors}
                    className="h-3.5"
                  />
                  <span className="figure text-[9px] font-semibold text-ink-4">{sheet}</span>
                  <span className="w-4 hairline" />
                  <span
                    className="legend text-[8px]"
                    style={{ color: categoryInk(group.category) }}
                  >
                    {group.category}
                  </span>
                  {distance !== undefined && distance !== null && (
                    <span className="dist-chip figure text-[9px] font-semibold">
                      <Navigation className="w-2.5 h-2.5 shrink-0" aria-hidden />
                      <span className="sr-only">Distância de você: </span>
                      {formatDistance(distance)}
                    </span>
                  )}
                </div>

                {/* Nação */}
                <h3 className="mt-3 font-plate-tight text-[1.5rem] sm:text-[1.75rem] leading-none text-ink">
                  {group.country}
                </h3>

                <p className="mt-2 text-[0.8125rem] text-ink-2 leading-snug">
                  {group.name}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5">
                  <span className="figure text-[0.7rem] text-ink-3">{group.time}</span>
                  <span className="text-[0.7rem] text-ink-3">
                    {group.neighborhood} · {group.zone}
                  </span>
                </div>
              </div>

              {/* Controle de abertura: rotulado, para não depender de um
                  glifo que o visitante precise adivinhar. */}
              <span
                className="shrink-0 mt-0.5 inline-flex items-center gap-2 pl-2.5 pr-3 py-2 border transition-colors duration-300"
                style={{
                  borderColor: isOpen ? ink : 'var(--rule)',
                  color: isOpen ? ink : 'var(--ink-2)',
                }}
                aria-hidden
              >
                <span className="relative w-3.5 h-3.5 flex items-center justify-center">
                  <span
                    className="absolute w-3 h-px transition-colors duration-300"
                    style={{ background: isOpen ? ink : 'var(--ink-3)' }}
                  />
                  <motion.span
                    className="absolute h-3 w-px"
                    style={{ background: isOpen ? ink : 'var(--ink-3)' }}
                    animate={{ scaleY: isOpen ? 0 : 1, rotate: isOpen ? 90 : 0 }}
                    transition={{ duration: 0.35, ease: chartEase }}
                  />
                </span>
                <span className="legend-strong text-[9px] text-inherit whitespace-nowrap">
                  {isOpen ? 'Fechar' : 'Ver ficha'}
                </span>
              </span>
            </div>

            {/* Reforço da ação enquanto o registro está fechado: diz o que
                aparece ao abrir, para o card não parecer um item morto. */}
            <AnimatePresence initial={false}>
              {!isOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="mt-4 flex items-center gap-2.5 text-ink-3"
                >
                  <span className="w-5 hairline" />
                  <span className="text-[0.7rem] leading-none">
                    Embaixador, telefone e mapa
                  </span>
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Registro completo */}
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                id={`gn-detalhe-${group.id}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.45, ease: chartEase }}
                className="overflow-hidden"
              >
                <div className="px-5 sm:px-6 pb-6">
                  <div className="hairline-dashed mb-5" />

                  {/* A bandeira em tamanho legível, no desenho oficial */}
                  <div className="flex items-center gap-3 mb-6">
                    <Flag
                      code={group.countryCode}
                      name={group.country}
                      colors={group.theme.colors}
                      className="h-7"
                    />
                    <span className="legend text-[8px]">Bandeira de {group.country}</span>
                  </div>

                  <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-6">
                    <Entry label={leaderLabel(group.category)} value={group.leader} />
                    <Entry label="Encontro" value={group.time} mono />
                    <Entry label="Faixa" value={audience(group.name)} />
                    <Entry label="Bairro" value={`${group.neighborhood} · ${group.zone}`} />
                    <Entry label="Cidade" value={group.city} />
                    <Entry label="Contato" value={group.contact} mono />
                    <Entry
                      label="Latitude"
                      value={dms(group.coordinates.latitude, 'N', 'S')}
                      mono
                    />
                    <Entry
                      label="Longitude"
                      value={dms(group.coordinates.longitude, 'L', 'O')}
                      mono
                    />
                  </dl>

                  {group.category === 'MISTO' && (
                    <p className="mt-6 text-[0.75rem] text-ink-3 leading-relaxed border-l-2 pl-3"
                       style={{ borderColor: ink }}>
                      Grupo misto: meninas e meninos {audience(group.name).toLowerCase()} no
                      mesmo encontro.
                    </p>
                  )}

                  <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-px bg-rule">
                    <button
                      type="button"
                      id={`whatsapp-btn-${group.id}`}
                      onClick={openWhatsApp}
                      className="press flex items-center justify-center gap-2.5 py-4 px-4 bg-ink text-paper hover:opacity-90 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="legend-strong text-[10px] text-paper">
                        Chamar no WhatsApp
                      </span>
                    </button>
                    <button
                      type="button"
                      id={`open-map-btn-${group.id}`}
                      onClick={openMap}
                      style={{ background: ink }}
                      className="press flex items-center justify-center gap-2.5 py-4 px-4 text-white hover:brightness-110 cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="legend-strong text-[10px] text-white">
                        Ver o ponto no mapa
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
}

function Entry({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="legend text-[8px] mb-1.5">{label}</dt>
      <dd
        className={`text-[0.8125rem] text-ink leading-snug ${
          mono ? 'figure text-[0.75rem]' : 'font-medium'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
