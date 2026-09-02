/**
 * Engine de scroll da carta.
 *
 * O navegador continua sendo o dono da posição — nada de container com
 * `transform`, que quebraria `position: fixed`, âncoras e a barra do sistema.
 * O que fazemos é interceptar a roda e o teclado, guardar um alvo, e caminhar
 * até ele com interpolação a cada quadro. No toque o momentum nativo do
 * sistema já é melhor do que qualquer coisa que a gente escreva, então lá
 * ficamos de fora.
 *
 * Este módulo é só o endereço da engine. Quem guarda o alvo é o hook —
 * daí `seek` e `getTarget` serem funções que ele instala aqui, e não campos
 * de dados: duas cópias do mesmo número sempre acabam divergindo.
 */

type Engine = {
  enabled: boolean;
  /** Move o alvo da interpolação. `immediate` pula direto para lá. */
  seek: (y: number, immediate: boolean) => void;
  /** O alvo atual — para onde a página está indo, não onde ela está. */
  getTarget: () => number;
};

const engine: Engine = {
  enabled: false,
  seek: () => {},
  getTarget: () => (typeof window === 'undefined' ? 0 : window.scrollY),
};

export function registerEngine(e: Partial<Engine>) {
  Object.assign(engine, e);
}

export function isEngineOn() {
  return engine.enabled;
}

export function maxScroll() {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

/** Posição de destino — o alvo, não o quadro atual. */
export function currentTarget() {
  return engine.enabled ? engine.getTarget() : window.scrollY;
}

/** Manda a página para um Y absoluto, respeitando a engine ativa. */
export function scrollToY(y: number, immediate = false) {
  const clamped = Math.max(0, Math.min(y, maxScroll()));

  if (!engine.enabled) {
    window.scrollTo({ top: clamped, behavior: immediate ? 'auto' : 'smooth' });
    return;
  }

  engine.seek(clamped, immediate);
}

/** Manda a página para um elemento, com folga para o cabeçalho fixo. */
export function scrollToEl(el: Element | null, offset = 72) {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  scrollToY(top);
}

export function scrollToId(id: string, offset = 72) {
  scrollToEl(document.getElementById(id), offset);
}
