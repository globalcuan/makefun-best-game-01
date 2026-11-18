// Arena dimensions and world pacing.
export const ARENA = {
  width: 1600,
  height: 900,
  edgePadding: 54,
  gridSpacing: 80,
  starCount: 170,
};

// Player hull, movement, aim, and visual trail.
export const PLAYER = {
  radius: 17,
  maxHull: 100,
  moveSpeed: 320,
  acceleration: 1700,
  drag: 0.88,
  invulnerability: 0.82,
  hurtSlowTime: 0.16,
  magnetRadius: 165,
};

// Dash timing and defensive window.
export const DASH = {
  speed: 850,
  duration: 0.17,
  cooldown: 1.9,
  invulnerability: 0.24,
};

// Player weapon baseline.
export const WEAPONS = {
  fireInterval: 0.17,
  bulletSpeed: 760,
  bulletDamage: 24,
  bulletRadius: 4,
  bulletLife: 1.35,
  muzzleFlashTime: 0.075,
  spreadAngle: 0.13,
};

// Chasers pursue directly and collide with the hull.
export const CHASER = {
  radius: 18,
  speed: 115,
  health: 42,
  contactDamage: 16,
  score: 100,
  xp: 3,
  color: '#ff4f91',
};

// Shooters hold range, strafe, and fire aimed bolts.
export const SHOOTER = {
  radius: 20,
  speed: 82,
  health: 58,
  preferredRange: 310,
  fireInterval: 1.55,
  boltSpeed: 310,
  boltDamage: 12,
  score: 160,
  xp: 4,
  color: '#ffb84d',
};

// Splitters create two small minis on death.
export const SPLITTER = {
  radius: 22,
  speed: 86,
  health: 78,
  contactDamage: 19,
  miniRadius: 10,
  miniSpeed: 205,
  miniHealth: 20,
  score: 190,
  xp: 5,
  color: '#b87cff',
};

// Dashers telegraph and then charge in a straight line.
export const DASHER = {
  radius: 17,
  speed: 105,
  health: 48,
  contactDamage: 20,
  pauseTime: 0.78,
  telegraphTime: 0.48,
  chargeTime: 0.52,
  chargeSpeed: 460,
  score: 180,
  xp: 4,
  color: '#ff5b62',
};

// Orbiters circle at range and lob slow hostile orbs.
export const ORBITER = {
  radius: 19,
  speed: 92,
  health: 54,
  preferredRange: 245,
  fireInterval: 2.15,
  orbSpeed: 190,
  orbDamage: 15,
  score: 175,
  xp: 4,
  color: '#50e6d2',
};

// VOIDMOTHER boss behavior and rewards.
export const BOSS = {
  radius: 94,
  health: 2400,
  contactDamage: 30,
  moveSpeed: 72,
  radialInterval: 1.32,
  aimedInterval: 2.2,
  summonInterval: 6.5,
  spiralInterval: 0.12,
  score: 5000,
  shardCount: 28,
  color: '#ff3fd2',
};

// Wave intermissions and enemy population growth.
export const WAVES = {
  intermission: 2.2,
  groupDelay: 0.82,
  firstWaveCount: 5,
  countPerWave: 1.8,
  maxGroupSize: 3,
  spawnInterval: 0.2,
};

// XP progression and shard behavior.
export const XP = {
  firstLevel: 12,
  growth: 1.32,
  shardValue: 1,
  shardRadius: 5,
  magnetSpeed: 610,
  driftSpeed: 48,
};

// Kill streak score multiplier.
export const COMBO = {
  window: 3.1,
  maxMultiplier: 8,
};

// Shared palette for the void arena and UI.
export const COLORS = {
  background: '#070817',
  grid: '#293050',
  cyan: '#70f7ff',
  white: '#f4f7ff',
  muted: '#9ba6c9',
  red: '#ff496d',
  gold: '#ffd36b',
  purple: '#a474ff',
  panel: 'rgba(8, 12, 33, 0.86)',
};

// Upgrade cards offered at each level-up.
export const UPGRADES = [
  { id: 'fireRate', name: 'Rapid Conduit', detail: 'Fire 18% faster', color: '#72f7ff' },
  { id: 'damage', name: 'Heavy Payload', detail: 'Bullet damage +35%', color: '#ff8bb2' },
  { id: 'extraShot', name: 'Split Focus', detail: 'Fire one extra projectile', color: '#b78cff' },
  { id: 'bulletSpeed', name: 'Hot Vector', detail: 'Bullet speed +25%', color: '#ffd36b' },
  { id: 'moveSpeed', name: 'Afterburner', detail: 'Move speed +12%', color: '#71f4ad' },
  { id: 'dash', name: 'Phase Battery', detail: 'Dash recharges 25% faster', color: '#72bfff' },
  { id: 'magnet', name: 'Gravitic Bloom', detail: 'Shard magnet radius +45%', color: '#65e9db' },
  { id: 'hull', name: 'Reinforced Hull', detail: 'Max hull +25, heal 25', color: '#ff697f' },
  { id: 'shardValue', name: 'Bright Harvest', detail: 'Shards grant 1 extra XP', color: '#f5c975' },
  { id: 'pierce', name: 'Phase Lance', detail: 'Shots pierce one target', color: '#e995ff' },
  { id: 'bulletSize', name: 'Wide Beam', detail: 'Bullets grow and hit harder', color: '#ffa56b' },
];
