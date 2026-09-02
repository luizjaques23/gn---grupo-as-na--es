const WORDS = [
  'nenhuma', 'uma', 'duas', 'três', 'quatro', 'cinco', 'seis',
  'sete', 'oito', 'nove', 'dez', 'onze', 'doze',
];

const WORDS_M = [
  'nenhum', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis',
  'sete', 'oito', 'nove', 'dez', 'onze', 'doze',
];

/**
 * Número por extenso, para os títulos em Fraunces. Os dados de campo
 * continuam em algarismos — "08" numa tabela, "oito" numa frase.
 */
export function numeral(n: number, gender: 'f' | 'm' = 'f') {
  const list = gender === 'm' ? WORDS_M : WORDS;
  return list[n] ?? String(n);
}
