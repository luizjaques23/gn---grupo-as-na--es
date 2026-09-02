/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react';
import {
  MapPin,
  Search,
  Instagram,
  ExternalLink,
  ArrowUpRight,
  Play,
  MessageCircle,
  Mail,
  ChevronDown,
  Users,
  Globe,
  CalendarDays,
  X,
} from 'lucide-react';

import { GN_GROUPS } from './data/groups';
import { CHRISTIAN_GALLERY_PHOTOS } from './data/gallery';
import { calculateDistance } from './utils/geo';
import { scrollToId } from './lib/scroll';
import { nationInk } from './lib/nation';
import { numeral } from './lib/numeral';
import { CATEGORIES, categoryInk, type Category } from './lib/category';
import { groupWeekday, weekdaysInUse, type Weekday } from './lib/weekday';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { useNationAmbient } from './hooks/useNationAmbient';

import GroupCard from './components/GroupCard';
import BibleVerseTicker from './components/BibleVerseTicker';
import Graticule from './components/atlas/Graticule';
import LatitudeRail, { type RailStop } from './components/atlas/LatitudeRail';
import AtlasHero from './components/atlas/AtlasHero';
import NationStrip from './components/atlas/NationStrip';
import Plate, { chartEase, enter, DrawnRule } from './components/atlas/Plate';
import Flag from './components/atlas/Flag';

const RAIL_STOPS: RailStop[] = [
  { id: 'folha-01', label: 'Índice' },
  { id: 'folha-02', label: 'O que é' },
  { id: 'folha-03', label: 'Grupos' },
  { id: 'folha-04', label: 'Nações' },
  { id: 'folha-05', label: 'Son Action' },
  { id: 'folha-06', label: 'Fotos' },
  { id: 'colofao', label: 'Colofão' },
];

const pad = (n: number) => String(n).padStart(2, '0');

export default function App() {
  /* ---------------------------------------------------------------- tema */
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      // ?tema=claro | ?tema=escuro tem a última palavra (o index.html já gravou)
      const param = new URLSearchParams(window.location.search).get('tema');
      if (param === 'claro') return 'light';
      if (param === 'escuro') return 'dark';
      const saved = localStorage.getItem('gn_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    const meta = document.getElementById('theme-color-meta');
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('gn_theme', 'dark');
      meta?.setAttribute('content', '#070A0E');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('gn_theme', 'light');
      meta?.setAttribute('content', '#EDE7DA');
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  /* ------------------------------------------------------- estado da app */
  const [showInstagramEmbed, setShowInstagramEmbed] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogCategory, setCatalogCategory] = useState<'ALL' | Category>('ALL');
  const [catalogCountry, setCatalogCountry] = useState<string>('ALL');
  const [catalogDay, setCatalogDay] = useState<'ALL' | Weekday>('ALL');
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'wizard' | 'catalog'>('wizard');

  /* No fim das duas perguntas o registro já vem aberto: quem respondeu duas
     vezes não deveria precisar de um terceiro toque para ver o contato. A
     lista guarda quem o visitante fechou, não quem ele abriu. */
  const [wizardClosedIds, setWizardClosedIds] = useState<string[]>([]);
  const toggleWizardCard = (id: string) =>
    setWizardClosedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  /* ------------------------------------------------------------- scroll */
  useSmoothScroll();

  const { scrollY } = useScroll();
  const [mastheadSolid, setMastheadSolid] = useState(false);
  /* Enquanto a folha 01 ocupa a tela, tudo que flutua por cima dela lê tinta
     clara: o vídeo é escuro nos dois temas. */
  const [overHero, setOverHero] = useState(true);
  useMotionValueEvent(scrollY, 'change', (y) => {
    setMastheadSolid(y > 48);
    setOverHero(y < window.innerHeight * 0.8);
  });

  /* ---------------------------------------------------------------- dados */
  const countriesList = useMemo(() => {
    const names = Array.from(new Set(GN_GROUPS.map((g) => g.country)));
    return names.map((name) => {
      const match = GN_GROUPS.find((g) => g.country === name);
      return { name, code: match?.countryCode || 'BR', flag: match?.flag || '🏳️' };
    });
  }, []);

  /* Quantos grupos existem por categoria — o número vai no ladrilho da
     primeira pergunta, e categoria vazia não vira um beco sem saída. */
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const g of GN_GROUPS) counts[g.category] = (counts[g.category] ?? 0) + 1;
    return counts;
  }, []);

  const groupsWithDistance = useMemo(() => {
    return GN_GROUPS.map((group) => {
      if (userCoords) {
        return {
          ...group,
          distance: calculateDistance(
            userCoords.latitude,
            userCoords.longitude,
            group.coordinates.latitude,
            group.coordinates.longitude
          ),
        };
      }
      return { ...group, distance: null };
    });
  }, [userCoords]);

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

    if (catalogCategory !== 'ALL') result = result.filter((g) => g.category === catalogCategory);
    if (catalogCountry !== 'ALL') result = result.filter((g) => g.country === catalogCountry);
    if (catalogDay !== 'ALL') result = result.filter((g) => groupWeekday(g) === catalogDay);

    if (userCoords) {
      result.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    }

    return result;
  }, [groupsWithDistance, searchQuery, catalogCategory, catalogCountry, catalogDay, userCoords]);

  /* Só os dias que existem na base viram opção — nada de "Terça" vazia. */
  const dayOptions = useMemo(() => weekdaysInUse(GN_GROUPS), []);

  const wizardFilteredCountries = useMemo(() => {
    if (!selectedCategory) return countriesList;
    const valid = Array.from(
      new Set(GN_GROUPS.filter((g) => g.category === selectedCategory).map((g) => g.country))
    );
    return countriesList.filter((c) => valid.includes(c.name));
  }, [selectedCategory, countriesList]);

  const wizardFinalGroups = useMemo(() => {
    if (!selectedCategory || !selectedCountry) return [];
    return groupsWithDistance.filter(
      (g) => g.category === selectedCategory && g.country === selectedCountry
    );
  }, [selectedCategory, selectedCountry, groupsWithDistance]);

  /* A cor de fundo acompanha a nação no centro da tela */
  useNationAmbient([viewMode, step, filteredCatalogGroups.length, wizardFinalGroups.length]);

  /* --------------------------------------------------------------- ações */
  const handleRequestLocation = () => {
    setIsLocating(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError('Seu navegador não tem geolocalização.');
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
        setTimeout(() => scrollToId('folha-03'), 120);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError('Você negou o acesso à localização.');
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError('O aparelho não conseguiu obter a posição.');
            break;
          case error.TIMEOUT:
            setGeoError('A busca por sinal demorou demais.');
            break;
          default:
            setGeoError('Não deu para obter a localização.');
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const resetWizard = () => {
    setSelectedCategory(null);
    setSelectedCountry(null);
    setWizardClosedIds([]);
    setStep(1);
  };

  const pickNation = (name: string) => {
    setViewMode('catalog');
    setCatalogCountry(name);
    setCatalogCategory('ALL');
    setSearchQuery('');
    setTimeout(() => scrollToId('folha-03'), 120);
  };

  const filtersDirty =
    catalogCategory !== 'ALL' ||
    catalogCountry !== 'ALL' ||
    catalogDay !== 'ALL' ||
    searchQuery !== '';

  return (
    <div className="min-h-screen bg-paper text-ink font-sans relative lg:pr-20">
      <Graticule />
      <LatitudeRail stops={RAIL_STOPS} onDark={overHero} />

      {/* ============================================================ topo */}
      <div
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          mastheadSolid
            ? 'bg-[color:var(--paper)]/88 backdrop-blur-md border-b border-rule'
            : 'hero-dark border-b border-transparent'
        }`}
      >
        <div className="max-w-[1240px] mx-auto px-6 md:px-10 lg:px-14 h-16 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => scrollToId('folha-01', 0)}
            className="flex items-center gap-3 text-left cursor-pointer group"
          >
            <img
              src="/white_logo_ian.png"
              alt="Igreja às Nações"
              className="logo-mark h-6 w-auto object-contain shrink-0"
              loading="eager"
              fetchPriority="high"
            />
            <span className="hidden sm:block text-left">
              <span className="legend-strong text-[9px] block leading-none">Igreja às Nações</span>
              <span className="legend text-[7px] block mt-1 leading-none">
                Supervisão Resgate · Américas
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Usar a folha clara' : 'Usar a folha escura'}
            className="press flex items-center gap-2 px-3 py-2 border border-rule hover:border-ink-3 cursor-pointer"
          >
            <span className="legend text-[8px]">{theme === 'dark' ? 'Noite' : 'Dia'}</span>
            <span className="flex gap-px" aria-hidden>
              <span
                className="w-2 h-2"
                style={{ background: theme === 'dark' ? 'var(--ink-4)' : 'var(--ink)' }}
              />
              <span
                className="w-2 h-2"
                style={{ background: theme === 'dark' ? 'var(--nation)' : 'var(--ink-4)' }}
              />
            </span>
          </button>
        </div>
      </div>

      {/* ====================================================== folha 01 */}
      <AtlasHero
        nations={countriesList.length}
        groups={GN_GROUPS.length}
        isLocating={isLocating}
        onLocate={handleRequestLocation}
      />

      <main className="max-w-[1240px] mx-auto px-6 md:px-10 lg:px-14 pb-24">
        {/* ==================================================== folha 02 */}
        <Plate
          id="folha-02"
          sheet="02"
          eyebrow="Levantamento"
          title={
            <>
              Um grupo pequeno,
              <br />
              num bairro, toda semana.
            </>
          }
          className="pt-28"
        >
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-12 items-stretch">
            <div className="grid sm:grid-cols-2 bg-paper-raised border-t border-l border-rule-soft">
              <Note
                index="a"
                head="O que é"
                body="GN é Grupo às Nações. Adolescentes e jovens que se reúnem uma vez por semana, num bairro de Porto Velho, para ler a Bíblia, orar, louvar e conviver."
              />
              <Note
                index="b"
                head="Como funciona"
                body="Cada grupo tem um embaixador com nome e telefone, um dia fixo e um bairro. Você sabe quem procurar, quando ir e onde é antes de aparecer pela primeira vez."
              />
              <Note
                index="c"
                head="Por que nomes de países"
                body="Cada GN adota uma nação e carrega o nome e as cores da bandeira dela. O versículo que dá nome à igreja é Mateus 28:19."
                wide
              />
            </div>

            {/* Mesmo padding das notas ao lado: as duas colunas partem da
                mesma linha e a régua do cabeçalho fica na mesma altura. */}
            <div className="plate plate-corners p-6 sm:p-7 flex">
              <BibleVerseTicker />
            </div>
          </div>
        </Plate>

        {/* ==================================================== folha 03 */}
        <Plate
          id="folha-03"
          sheet="03"
          eyebrow="Índice dos grupos"
          title={<>Os {numeral(GN_GROUPS.length, 'm')} grupos</>}
          note={
            <>
              Filtre por categoria, nação, embaixador ou bairro. Com o GPS ligado, a
              lista se reordena do mais perto para o mais longe.
            </>
          }
          className="pt-32"
          right={
            <div className="flex gap-px bg-rule w-fit">
              {(['wizard', 'catalog'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  id={mode === 'wizard' ? 'switch-mode-wizard' : 'switch-mode-catalog'}
                  onClick={() => setViewMode(mode)}
                  className={`press px-5 py-3.5 cursor-pointer transition-colors ${
                    viewMode === mode
                      ? 'bg-ink text-paper'
                      : 'bg-paper-raised text-ink-3 hover:text-ink'
                  }`}
                >
                  <span
                    className={`legend-strong text-[9px] ${
                      viewMode === mode ? 'text-paper' : 'text-inherit'
                    }`}
                  >
                    {mode === 'wizard' ? 'Duas perguntas' : 'Lista completa'}
                  </span>
                </button>
              ))}
            </div>
          }
        >
          {/* Estado do GPS */}
          <AnimatePresence>
            {(userCoords || geoError) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: chartEase }}
                className="overflow-hidden mb-8"
              >
                <div
                  className="flex items-center gap-3 px-4 py-3 border-l-2"
                  style={{ borderColor: userCoords ? 'var(--bearing)' : 'var(--seal)' }}
                >
                  <span className="legend text-[8px]">
                    {userCoords ? 'Posição obtida' : 'GPS'}
                  </span>
                  <span className="text-[0.75rem] text-ink-2">
                    {userCoords
                      ? 'A lista está ordenada do mais perto para o mais longe.'
                      : `${geoError} Use os filtros abaixo.`}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* -------------------------------------------- duas perguntas */}
          {viewMode === 'wizard' && (
            <div className="plate plate-corners p-6 sm:p-9">
              {/* Progresso das perguntas */}
              <div className="flex items-center gap-3 mb-9">
                {[1, 2, 3].map((s) => (
                  <React.Fragment key={s}>
                    <span
                      className="figure text-[9px] font-semibold transition-colors duration-300"
                      style={{ color: step >= s ? 'var(--ink)' : 'var(--ink-4)' }}
                    >
                      {pad(s)}
                    </span>
                    {s < 3 && (
                      <span className="flex-1 h-px overflow-hidden bg-rule">
                        <motion.span
                          className="block h-full origin-left"
                          style={{ background: 'var(--nation)' }}
                          animate={{ scaleX: step > s ? 1 : 0 }}
                          transition={{ duration: 0.6, ease: chartEase }}
                        />
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="s1" {...stepAnim}>
                    <h3 className="font-plate-tight text-[1.35rem] text-ink mb-7">
                      Com quem você quer estar?
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-5 bg-paper-raised border-t border-l border-rule-soft">
                      {CATEGORIES.map((cat) => {
                        const count = categoryCounts[cat.key] ?? 0;

                        /* Categoria sem grupo não é clicável: melhor dizer
                           "em breve" do que abrir uma nação vazia. */
                        if (count === 0) {
                          return (
                            <div
                              key={cat.key}
                              className="cat-tile select-none border-b border-r border-rule-soft"
                              style={{ ['--tint' as string]: cat.ink, opacity: 0.5 }}
                            >
                              <span className="cat-tile__band" aria-hidden />
                              <span className="block px-4 pt-5 pb-6">
                                <span className="legend-strong text-[10px] block">{cat.key}</span>
                                <span className="text-[0.7rem] text-ink-3 block mt-2">
                                  {cat.note}
                                </span>
                                <span className="figure text-[0.65rem] text-ink-4 block mt-5">
                                  Em breve
                                </span>
                              </span>
                            </div>
                          );
                        }

                        return (
                          <button
                            key={cat.key}
                            type="button"
                            id={`wizard-cat-${cat.key.toLowerCase()}`}
                            onClick={() => {
                              setSelectedCategory(cat.key);
                              setWizardClosedIds([]);
                              setStep(2);
                            }}
                            style={{ ['--tint' as string]: cat.ink }}
                            className="cat-tile press text-left cursor-pointer border-b border-r border-rule-soft"
                          >
                            <span className="cat-tile__band" aria-hidden />
                            <span className="cat-tile__wash" aria-hidden />
                            <span className="relative block px-4 pt-5 pb-6">
                              <span
                                className="legend-strong text-[10px] block"
                                style={{ color: cat.ink }}
                              >
                                {cat.key}
                              </span>
                              <span className="text-[0.7rem] text-ink-3 block mt-2">
                                {cat.note}
                              </span>
                              <span className="mt-5 flex items-center justify-between gap-2">
                                <span className="figure text-[0.65rem] text-ink-3">
                                  {pad(count)} {count === 1 ? 'grupo' : 'grupos'}
                                </span>
                                <span
                                  className="cat-tile__arrow figure text-[0.75rem] leading-none"
                                  style={{ color: cat.ink }}
                                  aria-hidden
                                >
                                  →
                                </span>
                              </span>
                            </span>
                          </button>
                        );
                      })}

                      <div
                        className="cat-tile select-none border-b border-r border-rule-soft"
                        style={{ ['--tint' as string]: 'var(--ink-4)', opacity: 0.5 }}
                      >
                        <span className="cat-tile__band" aria-hidden />
                        <span className="block px-4 pt-5 pb-6">
                          <span className="legend-strong text-[10px] block">JOVEM</span>
                          <span className="text-[0.7rem] text-ink-3 block mt-2">Em breve</span>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="s2" {...stepAnim}>
                    <div className="flex items-center justify-between gap-4 mb-7">
                      <h3 className="font-plate-tight text-[1.35rem] text-ink">Qual nação?</h3>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="press legend text-[8px] hover:text-ink cursor-pointer inline-flex items-center gap-2 px-2.5 py-1.5 border"
                        style={{
                          color: selectedCategory ? categoryInk(selectedCategory) : undefined,
                          borderColor: selectedCategory
                            ? `color-mix(in oklab, ${categoryInk(selectedCategory)} 45%, transparent)`
                            : 'var(--rule)',
                        }}
                      >
                        ← {selectedCategory}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 bg-paper-raised border-t border-l border-rule-soft">
                      {wizardFilteredCountries.map((c, idx) => {
                        const groups = GN_GROUPS.filter(
                          (g) => g.country === c.name && g.category === selectedCategory
                        );
                        const ink = groups[0] ? nationInk(groups[0].theme) : 'var(--ink)';
                        return (
                          <motion.button
                            key={c.name}
                            type="button"
                            id={`wizard-country-${c.code}`}
                            onClick={() => {
                              setSelectedCountry(c.name);
                              setWizardClosedIds([]);
                              setStep(3);
                            }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.035, duration: 0.4, ease: chartEase }}
                            className="press group bg-paper-raised hover:bg-paper-sunk px-4 py-6 text-left cursor-pointer relative border-b border-r border-rule-soft"
                          >
                            {/* A bandeira de verdade, no desenho oficial */}
                            <Flag
                              code={c.code}
                              name={c.name}
                              colors={groups[0]?.theme.colors}
                              className="h-8 mb-5"
                            />
                            <span className="figure text-[9px] text-ink-4">{c.code}</span>
                            <span className="font-plate-tight text-[1.05rem] text-ink block mt-3 leading-tight">
                              {c.name}
                            </span>
                            <span className="figure text-[0.65rem] text-ink-3 block mt-2">
                              {pad(groups.length)} {groups.length === 1 ? 'grupo' : 'grupos'}
                            </span>
                            <span
                              className="absolute left-0 bottom-0 h-px w-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
                              style={{ background: ink }}
                            />
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="s3" {...stepAnim}>
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
                      <h3 className="font-plate-tight text-[1.35rem] text-ink">
                        {wizardFinalGroups.length === 0
                          ? 'Nenhum grupo com essa combinação'
                          : `${pad(wizardFinalGroups.length)} ${
                              wizardFinalGroups.length === 1 ? 'grupo' : 'grupos'
                            }`}
                      </h3>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="legend text-[8px] hover:text-ink cursor-pointer"
                        >
                          ← Nações
                        </button>
                        <button
                          type="button"
                          onClick={resetWizard}
                          className="legend text-[8px] hover:text-ink cursor-pointer"
                        >
                          Recomeçar
                        </button>
                      </div>
                    </div>

                    {wizardFinalGroups.length > 0 ? (
                      <div className="space-y-4">
                        {wizardFinalGroups.map((group, idx) => (
                          <GroupCard
                            key={group.id}
                            group={group}
                            distance={group.distance}
                            isOpen={!wizardClosedIds.includes(group.id)}
                            onToggle={() => toggleWizardCard(group.id)}
                            index={idx}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="py-8">
                        <p className="text-[0.875rem] text-ink-2 max-w-sm">
                          Troque a categoria ou abra a lista completa para ver as outras nações.
                        </p>
                        <button
                          type="button"
                          onClick={() => setViewMode('catalog')}
                          className="press mt-6 px-5 py-3.5 bg-ink text-paper cursor-pointer"
                        >
                          <span className="legend-strong text-[9px] text-paper">
                            Lista completa
                          </span>
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ------------------------------------------- lista completa */}
          {viewMode === 'catalog' && (
            <div>
              {/* Painel de busca: emoldurado e rotulado, para ler como
                  instrumento e não como texto de rodapé. */}
              <div className="border border-rule bg-paper-raised mb-8">
                <div className="flex items-center gap-4 px-5 sm:px-6 pt-5">
                  <span className="legend-strong text-[9px]">Buscar um grupo</span>
                  <span className="hairline flex-1" />
                  {filtersDirty && (
                    <button
                      type="button"
                      onClick={() => {
                        setCatalogCategory('ALL');
                        setCatalogCountry('ALL');
                        setCatalogDay('ALL');
                        setSearchQuery('');
                      }}
                      className="press shrink-0 inline-flex items-center gap-2 px-3 py-2 border border-rule bg-paper hover:border-ink-3 hover:text-ink text-ink-2 cursor-pointer transition-colors"
                    >
                      <X className="w-3 h-3" />
                      <span className="legend-strong text-[8px] text-inherit">Limpar</span>
                    </button>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 sm:p-6">
                  <label className="block">
                    <span className="legend text-[8px] block mb-2.5">Busca livre</span>
                    <span className="relative block">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-3 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Embaixador, bairro, cidade…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        data-filled={searchQuery.trim().length > 0}
                        className="field"
                      />
                    </span>
                  </label>

                  <label className="block">
                    <span className="legend text-[8px] block mb-2.5">Categoria</span>
                    <span className="relative block">
                      <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-3 pointer-events-none" />
                      <select
                        value={catalogCategory}
                        onChange={(e) => setCatalogCategory(e.target.value as 'ALL' | Category)}
                        data-filled={catalogCategory !== 'ALL'}
                        className="field"
                      >
                        <option value="ALL">Todas as categorias</option>
                        {CATEGORIES.map((c) => (
                          <option key={c.key} value={c.key}>
                            {c.key}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-3 pointer-events-none" />
                    </span>
                  </label>

                  <label className="block">
                    <span className="legend text-[8px] block mb-2.5">Dia da semana</span>
                    <span className="relative block">
                      <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-3 pointer-events-none" />
                      <select
                        value={catalogDay}
                        onChange={(e) => setCatalogDay(e.target.value as 'ALL' | Weekday)}
                        data-filled={catalogDay !== 'ALL'}
                        className="field"
                      >
                        <option value="ALL">Todos os dias</option>
                        {dayOptions.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-3 pointer-events-none" />
                    </span>
                  </label>

                  <label className="block">
                    <span className="legend text-[8px] block mb-2.5">Nação</span>
                    <span className="relative block">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-3 pointer-events-none" />
                      <select
                        value={catalogCountry}
                        onChange={(e) => setCatalogCountry(e.target.value)}
                        data-filled={catalogCountry !== 'ALL'}
                        className="field"
                      >
                        <option value="ALL">Todas as nações</option>
                        {countriesList.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-3 pointer-events-none" />
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-3.5 border-t border-rule-soft bg-paper-sunk">
                  <span className="figure text-[0.7rem] text-ink-2">
                    {pad(filteredCatalogGroups.length)}{' '}
                    {filteredCatalogGroups.length === 1 ? 'grupo encontrado' : 'grupos encontrados'}
                    {userCoords && ' · ordenados por distância'}
                  </span>
                  {filtersDirty && (
                    <span className="legend text-[8px]" style={{ color: 'var(--nation)' }}>
                      Filtro ativo
                    </span>
                  )}
                </div>
              </div>

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
                <div className="py-14 border-t border-rule">
                  <p className="font-plate-tight text-[1.25rem] text-ink">
                    Nenhum grupo com esses filtros.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCatalogCategory('ALL');
                      setCatalogCountry('ALL');
                      setSearchQuery('');
                    }}
                    className="press mt-6 px-5 py-3.5 bg-ink text-paper cursor-pointer"
                  >
                    <span className="legend-strong text-[9px] text-paper">Ver os {numeral(GN_GROUPS.length, 'm')}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </Plate>

        {/* ==================================================== folha 04 */}
        <Plate
          id="folha-04"
          sheet="04"
          eyebrow="Bandeiras"
          title={<>As {numeral(countriesList.length)} nações</>}
          note="Toque numa nação para ver os grupos dela. A faixa se desloca conforme você desce a página."
          className="pt-32"
        >
          <NationStrip nations={countriesList} onPick={pickNation} />
        </Plate>

        {/* ==================================================== folha 05 */}
        <Plate
          id="folha-05"
          sheet="05"
          eyebrow="Culto de adolescentes"
          title="Son Action"
          className="pt-32"
        >
          {/* Três colunas: o texto convida, o reel mostra como é, a coluna
              da direita responde para quem e onde — com o mapa embutido. */}
          <div className="grid lg:grid-cols-[1fr_minmax(0,300px)_1fr] gap-10 lg:gap-12 items-stretch">
            {/* ------------------------------------------- coluna: texto */}
            <div className="flex flex-col">
              <p className="font-plate text-[clamp(1.35rem,3.4vw,2rem)] leading-[1.25] text-ink max-w-[20ch]">
                Você não precisa viver essa fase sozinho.
              </p>
              <DrawnRule className="my-7 max-w-[240px]" />
              <p className="text-[0.9rem] text-ink-2 leading-relaxed max-w-[42ch]">
                Traga seus amigos. Se quiser ver como é antes de ir, o reel ao lado é de
                um dos cultos.
              </p>

              {/* A descrição do culto desce para o vão que sobrava no pé da
                  coluna, em vez de repetir sob o título. */}
              <div className="mt-10 lg:mt-auto lg:pt-12">
                <div className="hairline-dashed mb-5 max-w-[240px]" />
                <p className="text-[0.8125rem] text-ink-3 leading-relaxed max-w-[38ch]">
                  O culto de adolescentes da Igreja às Nações, em Porto Velho. Louvor,
                  palavra e gente da sua idade.
                </p>
              </div>

              {/* O espaçador vai fora do bloco que pinta o filete: com o
                  padding dentro, o bg-rule vazava como uma faixa cinza. */}
              <div className="mt-7">
                <div className="flex flex-wrap gap-px bg-rule w-fit">
                  <a
                    href="https://www.instagram.com/sonaction_/?igsi=NzZqejh0NXIxbnlp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="press inline-flex items-center gap-2.5 px-5 py-4 bg-ink text-paper hover:opacity-90"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span className="legend-strong text-[10px] text-paper">@sonaction_</span>
                  </a>
                  <a
                    href="https://www.instagram.com/reel/DcTxyuOszo8/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="press inline-flex items-center gap-2.5 px-5 py-4 bg-paper-raised hover:bg-paper-sunk"
                  >
                  <ExternalLink className="w-3.5 h-3.5 text-ink-3" />
                  <span className="legend-strong text-[10px]">Abrir no Instagram</span>
                  </a>
                </div>
              </div>
            </div>

            {/* -------------------------------------------- coluna: reel */}
            <div className="relative w-full max-w-[300px] mx-auto self-start">
              {/* Só carrega o iframe do Instagram quando pedido */}
              <div className="plate plate-corners overflow-hidden">
                {!showInstagramEmbed ? (
                  <div className="relative aspect-9/16 bg-black">
                    <img
                      src="/images/sonaction/sonaction-1.jpg"
                      alt="Culto da Son Action"
                      className="absolute inset-0 w-full h-full object-cover opacity-55"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/15" />

                    <div className="relative h-full flex flex-col justify-between p-5 text-white">
                      <div className="flex items-center justify-between">
                        <span className="figure text-[9px] tracking-widest">@sonaction_</span>
                        <span className="legend text-[8px] text-white/70">Reel</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowInstagramEmbed(true)}
                        className="press self-start flex items-center gap-3 cursor-pointer group"
                        aria-label="Carregar o reel do Instagram"
                      >
                        <span className="w-11 h-11 border border-white/60 group-hover:border-white flex items-center justify-center transition-colors">
                          <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                        </span>
                        <span className="legend-strong text-[9px] text-white text-left">
                          Carregar o reel
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-9/16 w-full bg-black">
                    <iframe
                      src="https://www.instagram.com/reel/DcTxyuOszo8/embed"
                      className="w-full h-full border-0"
                      allowFullScreen
                      title="Son Action — reel do Instagram"
                    />
                  </div>
                )}
              </div>
              {/* Fora do fluxo, para não somar altura à linha da grade */}
              <p className="absolute inset-x-0 top-full mt-4 legend text-[8px] text-center">
                Um dos cultos
              </p>
            </div>

            {/* --------------------------------- coluna: para quem e onde */}
            <div className="flex flex-col">
              <div className="flex items-center gap-3 h-4 mb-4">
                <span className="legend text-[8px] leading-none">Para quem</span>
                <span className="hairline flex-1" />
              </div>
              <p className="text-[0.875rem] text-ink-2 leading-relaxed max-w-[34ch]">
                Adolescentes e jovens de Porto Velho — com ou sem GN, sozinho ou com os
                amigos. Não precisa avisar antes.
              </p>

              <div className="flex items-center gap-3 h-4 mb-4 mt-9">
                <span className="legend text-[8px] leading-none">Onde é</span>
                <span className="hairline flex-1" />
              </div>

              {/* Mapa embutido: o visitante vê a esquina antes de sair de casa.
                  loading=lazy segura o iframe até ele chegar perto. */}
              {/* O mapa estica para ocupar a sobra da coluna: o rodapé com
                  o endereço fecha na mesma linha do pé do reel. */}
              <div className="plate overflow-hidden flex-1 min-h-[220px]">
                <iframe
                  src="https://www.google.com/maps?q=R.%20Raimundo%20Cantu%C3%A1ria%2C%202290%2C%20Mato%20Grosso%2C%20Porto%20Velho%20-%20RO%2C%2076804-416&z=16&output=embed"
                  title="Mapa da Igreja às Nações"
                  className="w-full h-full min-h-[220px] border-0 block"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>

              <a
                href="https://www.google.com/maps/search/?api=1&query=Igreja+%C3%A0s+Na%C3%A7%C3%B5es+R.+Raimundo+Cantu%C3%A1ria+2290+Mato+Grosso+Porto+Velho+RO"
                target="_blank"
                rel="noopener noreferrer"
                className="press group shrink-0 flex items-center justify-between gap-4 p-4 border border-rule border-t-0 bg-paper-raised hover:bg-paper-sunk"
              >
                <span className="flex items-start gap-2.5 min-w-0">
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-seal" />
                  <span className="text-[0.8125rem] text-ink-2 group-hover:text-ink transition-colors leading-relaxed">
                    R. Raimundo Cantuária, 2290 — Mato Grosso, Porto Velho
                  </span>
                </span>
                <ArrowUpRight className="w-4 h-4 shrink-0 text-ink-3 group-hover:text-ink transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </Plate>

        {/* ==================================================== folha 06 */}
        <Plate
          id="folha-06"
          sheet="06"
          eyebrow="Registro fotográfico"
          title="Como é por dentro"
          note="Cultos da Son Action e encontros de GN. Arraste para o lado."
          className="pt-32"
        >
          <div className="-mx-6 md:-mx-10 lg:-mx-14">
            <div className="no-bar overflow-x-auto snap-x snap-mandatory scroll-px-6 md:scroll-px-10 lg:scroll-px-14">
              <div className="flex gap-px bg-rule-soft px-6 md:px-10 lg:px-14 w-max">
                {CHRISTIAN_GALLERY_PHOTOS.map((item, idx) => (
                  <figure
                    key={item.src}
                    className="snap-start w-[268px] sm:w-[320px] shrink-0 bg-paper-raised"
                  >
                    <div className="relative aspect-4/5 overflow-hidden">
                      <img
                        src={item.src}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] ease-out hover:scale-[1.04]"
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="absolute top-3 left-3 figure text-[9px] text-white/90 mix-blend-difference">
                        {pad(idx + 1)}
                      </span>
                    </div>
                    <figcaption className="p-5">
                      <span className="legend text-[8px] block">{item.category}</span>
                      <h3 className="font-plate-tight text-[1.05rem] text-ink mt-2.5">
                        {item.title}
                      </h3>
                      <p className="text-[0.75rem] text-ink-3 leading-snug mt-1.5">
                        {item.description}
                      </p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </Plate>
      </main>

      {/* ======================================================= colofão */}
      <footer id="colofao" className="scroll-mt-24 border-t border-rule bg-paper-raised">
        <div className="max-w-[1240px] mx-auto px-6 md:px-10 lg:px-14 py-16">
          <motion.div {...enter} className="grid lg:grid-cols-[1.2fr_1fr] gap-12">
            <div>
              <div className="flex items-center gap-3">
                <img
                  src="/white_logo_ian.png"
                  alt="Igreja às Nações"
                  className="logo-mark h-8 w-auto object-contain shrink-0"
                  loading="lazy"
                />
                <div>
                  <span className="legend-strong text-[10px] block leading-none">
                    Igreja às Nações
                  </span>
                  <span className="legend text-[8px] block mt-1.5 leading-none">
                    Supervisão Resgate · Continente das Américas
                  </span>
                </div>
              </div>

              <div className="hairline my-8 max-w-[380px]" />

              {/* O endereço é um botão: emoldurado, rotulado e com a seta de
                  saída, para não passar por texto morto no rodapé. */}
              <a
                href="https://www.google.com/maps/search/?api=1&query=Igreja+%C3%A0s+Na%C3%A7%C3%B5es+R.+Raimundo+Cantu%C3%A1ria+2290+Mato+Grosso+Porto+Velho+RO"
                target="_blank"
                rel="noopener noreferrer"
                className="press group flex items-center justify-between gap-5 max-w-[440px] p-4 sm:p-5 border border-rule hover:border-ink-3 bg-paper hover:bg-paper-sunk"
              >
                <span className="flex items-start gap-3 min-w-0">
                  <MapPin className="w-4 h-4 text-seal shrink-0 mt-0.5" />
                  <span className="min-w-0">
                    <span className="legend-strong text-[9px] block" style={{ color: 'var(--seal)' }}>
                      Abrir a sede no mapa
                    </span>
                    <span className="block mt-2 text-[0.8125rem] text-ink-2 group-hover:text-ink transition-colors leading-relaxed">
                      R. Raimundo Cantuária, 2290 — Mato Grosso, Porto Velho — RO,
                      76804-416
                    </span>
                  </span>
                </span>
                <ArrowUpRight className="w-4 h-4 shrink-0 text-ink-3 group-hover:text-ink transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>

              <dl className="flex flex-wrap gap-x-10 gap-y-4 mt-9">
                <FooterField label="Nações">{pad(countriesList.length)}</FooterField>
                <FooterField label="Grupos">{pad(GN_GROUPS.length)}</FooterField>
                <FooterField label="Cidade">Porto Velho — RO</FooterField>
              </dl>
            </div>

            <div>
              <span className="legend text-[8px] block mb-5">Endereços</span>
              <div className="flex flex-col">
                <FooterLink href="https://asnacoes.com.br/" label="asnacoes.com.br" note="Site oficial" />
                <FooterLink
                  href="https://www.instagram.com/igrejaasnacoes?igsi=YXppbmp4cWd6bWFu"
                  label="@igrejaasnacoes"
                  note="Instagram da igreja"
                  icon
                />
                <FooterLink
                  href="https://www.instagram.com/sonaction_/?igsi=NzZqejh0NXIxbnlp"
                  label="@sonaction_"
                  note="Culto de adolescentes"
                  icon
                />
              </div>

              <div className="mt-9 flex items-center gap-2.5 text-ink-3">
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="text-[0.75rem]">
                  O contato de cada grupo está no registro dele, na folha 03.
                </span>
              </div>
            </div>
          </motion.div>

          <div className="hairline mt-14 mb-6" />

          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
            <span className="legend text-[8px]">© 2026 Igreja às Nações</span>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="legend text-[8px]">Feito por</span>
              {CREDITS.map((c) => (
                <Credit key={c.name} {...c} />
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ peças */

const stepAnim = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.4, ease: chartEase },
} as const;

function Note({
  index,
  head,
  body,
  wide,
}: {
  index: string;
  head: string;
  body: string;
  wide?: boolean;
}) {
  return (
    <div className={`bg-paper-raised p-6 sm:p-7 border-b border-r border-rule-soft ${wide ? 'sm:col-span-2' : ''}`}>
      <div className="flex items-center gap-3 h-4 mb-4">
        <span className="figure text-[9px] leading-none text-ink-4">{index}</span>
        <span className="hairline flex-1" />
      </div>
      <h3 className="legend-strong text-[10px] mb-3">{head}</h3>
      <p className="text-[0.8125rem] text-ink-2 leading-relaxed">{body}</p>
    </div>
  );
}

/* Quem assina a carta. Sem endereço, o nome fica sem link em vez de virar
   um mailto quebrado. */
const CREDITS: { name: string; email: string | null }[] = [
  { name: 'Miguel Casagrande', email: 'miguel.cg.contato@gmail.com' },
  { name: 'Luiz Henrique Jaques', email: 'Luizjaques23@gmail.com' },
];

function Credit({ name, email }: { name: string; email: string | null }) {
  if (!email) {
    return (
      <span className="legend text-[8px]" style={{ color: 'var(--seal)' }}>
        {name}
      </span>
    );
  }
  return (
    <a
      href={`mailto:${email}`}
      className="group inline-flex items-center gap-1.5 legend text-[8px]"
      style={{ color: 'var(--seal)' }}
      title={`Escrever para ${name} — ${email}`}
    >
      <Mail className="w-3 h-3 text-seal" />
      <span className="border-b border-transparent group-hover:border-current transition-colors">
        {name}
      </span>
    </a>
  );
}

function FooterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="legend text-[8px] mb-1.5">{label}</dt>
      <dd className="figure text-[0.7rem] text-ink">{children}</dd>
    </div>
  );
}

function FooterLink({
  href,
  label,
  note,
  icon,
}: {
  href: string;
  label: string;
  note: string;
  icon?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-baseline justify-between gap-6 py-4 border-b border-rule-soft hover:border-ink-3 transition-colors"
    >
      <span className="flex items-center gap-2 text-[0.875rem] font-medium text-ink">
        {icon && <Instagram className="w-3.5 h-3.5 text-ink-3" />}
        {label}
      </span>
      <span className="legend text-[8px] group-hover:text-ink transition-colors">{note}</span>
    </a>
  );
}
