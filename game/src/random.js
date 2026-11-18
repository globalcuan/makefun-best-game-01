// Mulberry32 provides a compact deterministic generator for reproducible scenes.
export function mulberry32(seed) {
  let state = seed >>> 0;
  return function random() {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

// Return a random number between the supplied bounds.
export function range(random, minimum, maximum) {
  return minimum + (maximum - minimum) * random();
}

// Return an integer including both bounds.
export function rangeInt(random, minimum, maximum) {
  return Math.floor(range(random, minimum, maximum + 1));
}

// Select one item from a nonempty array.
export function pick(random, items) {
  return items[Math.floor(random() * items.length)];
}

// Return true with the requested probability.
export function chance(random, probability) {
  return random() < probability;
}

// Return a shuffled copy using Fisher-Yates.
export function shuffle(random, items) {
  const shuffled = items.slice();
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

// Convert an angle and optional magnitude into a direction vector.
export function fromAngle(angle, magnitude = 1) {
  return { x: Math.cos(angle) * magnitude, y: Math.sin(angle) * magnitude };
}
