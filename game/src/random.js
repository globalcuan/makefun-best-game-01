export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
export const range = (rng, min, max) => min + rng() * (max - min);
export const pick = (rng, list) => list[Math.floor(rng() * list.length)];
export const unit = rng => { const a = rng() * Math.PI * 2; return { x: Math.cos(a), y: Math.sin(a) }; };
