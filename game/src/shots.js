import { createWorld } from './world.js';
import { mulberry32, range, fromAngle } from './random.js';
import { CHASER, SHOOTER, SPLITTER, DASHER, ORBITER, BOSS } from './config.js';

export function createShotScene(name, seed, width, height) {
  const random = mulberry32(seed);
  const world = createWorld(random);
  world.width = width;
  world.height = height;
  world.time = 34.5;
  world.elapsed = 362;
  world.player.x = width * 0.5;
  world.player.y = height * 0.68;
  world.player.angle = -Math.PI / 2;
  world.player.hull = 67;
  world.player.trail = Array.from({ length: 9 }, (_, index) => ({ x: world.player.x + index * 7, y: world.player.y + index * 12, life: 0.3 - index * 0.025 }));

  if (name === 'start') {
    world.mode = 'title';
    world.wave = 3;
    populateAmbient(world, 8);
    return world;
  }

  if (name === 'play') {
    world.mode = 'playing';
    world.wave = 6;
    world.score = 28450;
    world.kills = 84;
    world.combo = 3.5;
    world.comboTimer = 2.4;
    world.level = 9;
    world.xp = 14;
    world.xpNeeded = 28;
    populateFight(world, 14);
    return world;
  }

  if (name === 'boss') {
    world.mode = 'playing';
    world.wave = 10;
    world.score = 67200;
    world.kills = 173;
    world.combo = 4.25;
    world.comboTimer = 2.1;
    world.level = 15;
    world.xp = 22;
    world.xpNeeded = 43;
    world.boss = { x: width * 0.5, y: height * 0.28, radius: BOSS.radius, health: BOSS.health * 0.6, maxHealth: BOSS.health, angle: 0.45, fireTimer: 1.1, aimedTimer: 0.7, summonTimer: 4, spiralTimer: 0.2, spiralAngle: 1.7, hitFlash: 0, phase: 1 };
    world.player.x = width * 0.54;
    world.player.y = height * 0.76;
    world.player.angle = -Math.PI / 2.4;
    world.player.dashTimer = 0.1;
    world.player.invulnerable = 0.15;
    world.player.muzzleFlash = 0.06;
    populateBossFire(world);
    return world;
  }

  world.mode = 'gameover';
  world.wave = 11;
  world.score = 91370;
  world.kills = 241;
  world.elapsed = 817;
  world.player.hull = 0;
  world.player.x = width * 0.5;
  world.player.y = height * 0.55;
  world.player.hitFlash = 0;
  populateWreckage(world);
  return world;
}

function populateAmbient(world, count) {
  const types = ['chaser', 'shooter', 'splitter', 'orbiter'];
  for (let index = 0; index < count; index += 1) {
    addEnemy(world, types[index % types.length], range(world.random, 80, world.width - 80), range(world.random, 90, world.height - 90));
  }
  populateEffects(world, 24);
  addShards(world, 10);
}

function populateFight(world, count) {
  const types = ['chaser', 'shooter', 'splitter', 'dasher', 'orbiter', 'chaser', 'splitter'];
  for (let index = 0; index < count; index += 1) {
    const x = range(world.random, 75, world.width - 75);
    const y = range(world.random, 75, world.height - 75);
    const enemy = addEnemy(world, types[index % types.length], x, y);
    enemy.hitFlash = index % 5 === 0 ? 0.08 : 0;
  }
  populateEffects(world, 56);
  addShards(world, 24);
  for (let index = 0; index < 12; index += 1) {
    const startX = range(world.random, 50, world.width - 50);
    const startY = range(world.random, 50, world.height - 50);
    const angle = Math.atan2(world.player.y - startY, world.player.x - startX);
    addBullet(world, startX, startY, angle, 300, false, '#ff687e');
  }
  for (let index = 0; index < 7; index += 1) {
    const startX = world.player.x + range(world.random, -90, 90);
    const startY = world.player.y - range(world.random, 110, 250);
    addBullet(world, startX, startY, -Math.PI / 2 + range(world.random, -0.2, 0.2), 620, true, '#9fffff');
  }
}

function populateBossFire(world) {
  for (let index = 0; index < 18; index += 1) {
    const angle = index * Math.PI * 2 / 18 + 0.25;
    const vector = fromAngle(angle, 235);
    world.bullets.push({ x: world.boss.x, y: world.boss.y, vx: vector.x, vy: vector.y, radius: 6, damage: 12, life: 4, friendly: false, color: '#ff62df', kind: 'boss' });
  }
  for (let index = 0; index < 5; index += 1) {
    const angle = -Math.PI / 2 + index * 0.18;
    addBullet(world, world.player.x, world.player.y, angle, 680, true, '#a6fbff');
  }
  populateEffects(world, 42);
  addShards(world, 12);
}

function populateWreckage(world) {
  populateEffects(world, 82);
  addShards(world, 19);
  for (let index = 0; index < 7; index += 1) {
    const x = range(world.random, 120, world.width - 120);
    const y = range(world.random, 120, world.height - 120);
    const enemy = addEnemy(world, ['chaser', 'splitter', 'dasher'][index % 3], x, y);
    enemy.health = enemy.maxHealth * 0.15;
  }
  world.shockwaves.push({ x: world.player.x, y: world.player.y, radius: 190, maxRadius: 230, life: 0.18, maxLife: 1, color: '#ff5877' });
  world.floaters.push({ x: world.player.x, y: world.player.y - 85, text: 'RUN ENDED', color: '#ff8fa3', life: 0.7, maxLife: 1 });
}

function populateEffects(world, count) {
  for (let index = 0; index < count; index += 1) {
    const x = range(world.random, 40, world.width - 40);
    const y = range(world.random, 40, world.height - 40);
    const angle = world.random() * Math.PI * 2;
    const speed = range(world.random, 20, 130);
    world.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, radius: range(world.random, 1.2, 3.8), color: ['#87faff', '#ff73c9', '#ffa862', '#b58dff'][index % 4], life: 0.7, maxLife: 0.7 });
  }
}

function addShards(world, count) {
  for (let index = 0; index < count; index += 1) {
    world.shards.push({ x: range(world.random, 35, world.width - 35), y: range(world.random, 35, world.height - 35), vx: range(world.random, -70, 70), vy: range(world.random, -70, 70), radius: 5, value: 1, life: 18, phase: world.random() * Math.PI * 2 });
  }
}

function addEnemy(world, type, x, y) {
  const definitions = { chaser: CHASER, shooter: SHOOTER, splitter: SPLITTER, dasher: DASHER, orbiter: ORBITER };
  const definition = definitions[type];
  const enemy = { id: `shot-${type}-${world.enemies.length}`, type, x, y, vx: range(world.random, -35, 35), vy: range(world.random, -35, 35), radius: definition.radius, health: definition.health, maxHealth: definition.health, speed: definition.speed, damage: definition.contactDamage || 12, score: definition.score, xp: definition.xp, color: definition.color, fireTimer: range(world.random, 0.2, 1.5), state: type === 'dasher' ? 'telegraph' : 'approach', stateTimer: 0.3, angle: world.random() * Math.PI * 2, hitFlash: 0, orbitDirection: world.random() < 0.5 ? -1 : 1, chargeDirection: { x: 0.6, y: 0.8 } };
  world.enemies.push(enemy);
  return enemy;
}

function addBullet(world, x, y, angle, speed, friendly, color) {
  const vector = fromAngle(angle, speed);
  world.bullets.push({ x, y, vx: vector.x, vy: vector.y, radius: friendly ? 4 : 6, damage: 10, life: 3, friendly, color, kind: 'shot', pierce: 0, hitIds: [] });
}
