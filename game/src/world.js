import { ARENA, PLAYER, DASH, WEAPONS, CHASER, SHOOTER, SPLITTER, DASHER, ORBITER, BOSS, WAVES, XP, COMBO, UPGRADES } from './config.js';
import { range, rangeInt, pick, fromAngle } from './random.js';

const ENEMY_TYPES = ['chaser', 'shooter', 'splitter', 'dasher', 'orbiter'];

export function createWorld(random = Math.random) {
  const world = {
    width: ARENA.width,
    height: ARENA.height,
    random,
    time: 0,
    mode: 'title',
    player: null,
    enemies: [],
    bullets: [],
    shards: [],
    particles: [],
    floaters: [],
    shockwaves: [],
    boss: null,
    wave: 0,
    waveBanner: 0,
    intermission: 0,
    spawnQueue: [],
    spawnTimer: 0,
    score: 0,
    kills: 0,
    combo: 0,
    comboTimer: 0,
    elapsed: 0,
    slowMotion: 0,
    shake: 0,
    lowHullPulse: 0,
    upgrades: [],
    level: 1,
    xp: 0,
    xpNeeded: XP.firstLevel,
    stats: { fireRate: 1, damage: 1, extraShot: 0, bulletSpeed: 1, moveSpeed: 1, dashRecharge: 1, magnet: 1, shardValue: 1, pierce: 0, bulletSize: 1 },
    stars: Array.from({ length: ARENA.starCount }, () => ({ x: random() * ARENA.width, y: random() * ARENA.height, size: 0.5 + random() * 1.8, phase: random() * Math.PI * 2 })),
    audio: null,
  };
  world.player = makePlayer(world);
  return world;
}

function makePlayer(world) {
  return { x: world.width / 2, y: world.height / 2, vx: 0, vy: 0, angle: -Math.PI / 2, hull: PLAYER.maxHull, maxHull: PLAYER.maxHull, fireTimer: 0, dashTimer: 0, dashCooldown: 0, dashDirection: { x: 0, y: -1 }, invulnerable: 0, muzzleFlash: 0, trail: [], hitFlash: 0 };
}

export function resizeWorld(world, width, height) {
  world.width = width;
  world.height = height;
  if (world.player && world.mode === 'title') {
    world.player.x = width / 2;
    world.player.y = height / 2;
  }
}

export function startGame(world, audio) {
  const fresh = createWorld(world.random);
  Object.assign(world, fresh);
  world.mode = 'playing';
  world.audio = audio;
  beginIntermission(world, 1);
  if (audio) {
    audio.startBass(1);
  }
}

export function setMode(world, mode) {
  world.mode = mode;
}

export function updateWorld(world, input, dt, audio) {
  world.audio = audio || world.audio;
  if (world.mode === 'title') {
    world.time += dt;
    updateAmbient(world, dt);
    return;
  }
  if (world.mode !== 'playing') {
    updateAmbient(world, dt * 0.35);
    return;
  }
  const scaledDelta = world.slowMotion > 0 ? dt * 0.42 : dt;
  world.time += scaledDelta;
  world.elapsed += scaledDelta;
  world.slowMotion = Math.max(0, world.slowMotion - dt);
  world.shake = Math.max(0, world.shake - dt * 26);
  world.lowHullPulse = Math.max(0, world.lowHullPulse - dt);
  updatePlayer(world, input, scaledDelta, audio);
  updateSpawning(world, scaledDelta, audio);
  updateEnemies(world, scaledDelta, audio);
  updateBullets(world, scaledDelta, audio);
  updateShards(world, scaledDelta, audio);
  updateEffects(world, scaledDelta);
  updateCombo(world, scaledDelta);
  updateWaveFlow(world, scaledDelta, audio);
  if (world.player.hull <= 0) {
    world.player.hull = 0;
    world.mode = 'gameover';
    if (audio) audio.stopBass();
  }
}

function updateAmbient(world, dt) {
  world.player.angle += dt * 0.12;
  updateEffects(world, dt);
}

function updatePlayer(world, input, dt, audio) {
  const player = world.player;
  const horizontal = Number(input.isDown('KeyD') || input.isDown('ArrowRight')) - Number(input.isDown('KeyA') || input.isDown('ArrowLeft'));
  const vertical = Number(input.isDown('KeyS') || input.isDown('ArrowDown')) - Number(input.isDown('KeyW') || input.isDown('ArrowUp'));
  const movementLength = Math.hypot(horizontal, vertical) || 1;
  const directionX = horizontal / movementLength;
  const directionY = vertical / movementLength;
  const speed = PLAYER.moveSpeed * world.stats.moveSpeed;
  player.vx += directionX * PLAYER.acceleration * dt;
  player.vy += directionY * PLAYER.acceleration * dt;
  const velocityLength = Math.hypot(player.vx, player.vy);
  if (velocityLength > speed) {
    player.vx = player.vx / velocityLength * speed;
    player.vy = player.vy / velocityLength * speed;
  }
  const friction = Math.pow(PLAYER.drag, dt * 60);
  player.vx *= friction;
  player.vy *= friction;
  player.x = clamp(player.x + player.vx * dt, PLAYER.radius, world.width - PLAYER.radius);
  player.y = clamp(player.y + player.vy * dt, PLAYER.radius, world.height - PLAYER.radius);
  const scaleX = world.width / (window.innerWidth || world.width);
  const scaleY = world.height / (window.innerHeight || world.height);
  const targetX = input.mouse.x * scaleX;
  const targetY = input.mouse.y * scaleY;
  player.angle = Math.atan2(targetY - player.y, targetX - player.x);
  player.invulnerable = Math.max(0, player.invulnerable - dt);
  player.dashCooldown = Math.max(0, player.dashCooldown - dt * world.stats.dashRecharge);
  player.dashTimer = Math.max(0, player.dashTimer - dt);
  player.fireTimer = Math.max(0, player.fireTimer - dt);
  player.muzzleFlash = Math.max(0, player.muzzleFlash - dt);
  player.hitFlash = Math.max(0, player.hitFlash - dt);
  player.trail.unshift({ x: player.x, y: player.y, life: 0.3 });
  player.trail = player.trail.slice(0, 12).map((point) => ({ ...point, life: point.life - dt }));
  player.trail = player.trail.filter((point) => point.life > 0);

  if ((input.wasPressed('ShiftLeft') || input.wasPressed('ShiftRight')) && player.dashCooldown <= 0) {
    let dashX = directionX;
    let dashY = directionY;
    if (!horizontal && !vertical) {
      dashX = Math.cos(player.angle);
      dashY = Math.sin(player.angle);
    }
    player.dashDirection = { x: dashX, y: dashY };
    player.dashTimer = DASH.duration;
    player.dashCooldown = DASH.cooldown;
    player.invulnerable = DASH.invulnerability;
    player.vx = dashX * DASH.speed;
    player.vy = dashY * DASH.speed;
    world.shake = Math.max(world.shake, 4);
    if (audio) audio.dash();
  }
  if (player.dashTimer > 0) {
    player.x = clamp(player.x + player.dashDirection.x * DASH.speed * dt, PLAYER.radius, world.width - PLAYER.radius);
    player.y = clamp(player.y + player.dashDirection.y * DASH.speed * dt, PLAYER.radius, world.height - PLAYER.radius);
  }
  if ((input.mouseDown || input.isDown('Space')) && player.fireTimer <= 0) {
    firePlayer(world, audio);
  }
}

function firePlayer(world, audio) {
  const player = world.player;
  const count = 1 + world.stats.extraShot;
  for (let shotIndex = 0; shotIndex < count; shotIndex += 1) {
    const centeredIndex = shotIndex - (count - 1) / 2;
    const angle = player.angle + centeredIndex * WEAPONS.spreadAngle;
    const vector = fromAngle(angle, WEAPONS.bulletSpeed * world.stats.bulletSpeed);
    world.bullets.push({ x: player.x + Math.cos(angle) * 23, y: player.y + Math.sin(angle) * 23, vx: vector.x, vy: vector.y, radius: WEAPONS.bulletRadius * world.stats.bulletSize, damage: WEAPONS.bulletDamage * world.stats.damage, life: WEAPONS.bulletLife, friendly: true, pierce: world.stats.pierce, hitIds: [] });
  }
  player.fireTimer = WEAPONS.fireInterval / world.stats.fireRate;
  player.muzzleFlash = WEAPONS.muzzleFlashTime;
  spawnParticles(world, player.x + Math.cos(player.angle) * 24, player.y + Math.sin(player.angle) * 24, '#aafaff', 3, 90);
  if (audio) audio.shoot();
}

function updateSpawning(world, dt, audio) {
  if (world.waveBanner > 0) {
    world.waveBanner = Math.max(0, world.waveBanner - dt);
  }
  if (world.intermission > 0) {
    world.intermission -= dt;
    if (world.intermission <= 0) {
      world.wave += 1;
      beginWave(world, audio);
    }
    return;
  }
  if (world.spawnQueue.length === 0) {
    return;
  }
  world.spawnTimer -= dt;
  if (world.spawnTimer > 0) {
    return;
  }
  const groupSize = Math.min(WAVES.maxGroupSize, world.spawnQueue.length, rangeInt(world.random, 1, WAVES.maxGroupSize));
  for (let index = 0; index < groupSize; index += 1) {
    spawnEnemy(world, world.spawnQueue.shift());
  }
  world.spawnTimer = WAVES.groupDelay;
}

function beginIntermission(world, nextWave) {
  world.intermission = WAVES.intermission;
  world.wave = nextWave - 1;
  world.waveBanner = 0;
}

function beginWave(world, audio) {
  world.waveBanner = 1.8;
  if (world.wave % 5 === 0) {
    world.boss = makeBoss(world);
    world.spawnQueue = [];
    if (audio) audio.bossWarning();
    return;
  }
  world.boss = null;
  const count = Math.floor(WAVES.firstWaveCount + world.wave * WAVES.countPerWave);
  const pool = enemyPoolForWave(world.wave);
  world.spawnQueue = Array.from({ length: count }, () => pick(world.random, pool));
  world.spawnTimer = 0.35;
}

function enemyPoolForWave(wave) {
  const pool = ['chaser', 'chaser', 'chaser', 'shooter'];
  if (wave >= 2) pool.push('splitter');
  if (wave >= 3) pool.push('dasher');
  if (wave >= 4) pool.push('orbiter');
  if (wave >= 7) pool.push('shooter', 'splitter', 'dasher');
  return pool;
}

function edgePosition(world) {
  const edge = rangeInt(world.random, 0, 3);
  if (edge === 0) return { x: -25, y: range(world.random, 30, world.height - 30) };
  if (edge === 1) return { x: world.width + 25, y: range(world.random, 30, world.height - 30) };
  if (edge === 2) return { x: range(world.random, 30, world.width - 30), y: -25 };
  return { x: range(world.random, 30, world.width - 30), y: world.height + 25 };
}

function spawnEnemy(world, type, position = edgePosition(world), extra = {}) {
  const configs = { chaser: CHASER, shooter: SHOOTER, splitter: SPLITTER, dasher: DASHER, orbiter: ORBITER, mini: { ...CHASER, radius: SPLITTER.miniRadius, speed: SPLITTER.miniSpeed, health: SPLITTER.miniHealth, score: 45, xp: 1, color: '#dba7ff' } };
  const config = configs[type];
  const scale = 1 + Math.max(0, world.wave - 1) * 0.075;
  world.enemies.push({ id: `${type}-${world.time}-${world.random()}`, type, x: position.x, y: position.y, vx: 0, vy: 0, radius: config.radius, health: config.health * scale, maxHealth: config.health * scale, speed: config.speed * (1 + Math.max(0, world.wave - 1) * 0.025), damage: config.contactDamage || 10, score: config.score, xp: config.xp, color: config.color, fireTimer: range(world.random, 0.3, 1.5), state: 'approach', stateTimer: range(world.random, 0.4, 1.2), angle: 0, hitFlash: 0, orbitDirection: world.random() < 0.5 ? -1 : 1, ...extra });
}

function makeBoss(world) {
  return { x: world.width / 2, y: world.height * 0.31, vx: 0, vy: 0, radius: BOSS.radius, health: BOSS.health * (1 + (world.wave / 5 - 1) * 0.4), maxHealth: BOSS.health * (1 + (world.wave / 5 - 1) * 0.4), angle: 0, fireTimer: 0.7, aimedTimer: 1.5, summonTimer: BOSS.summonInterval, spiralTimer: 0, spiralAngle: 0, hitFlash: 0, phase: 1, score: BOSS.score };
}

function updateEnemies(world, dt, audio) {
  for (const enemy of world.enemies) {
    enemy.fireTimer -= dt;
    enemy.stateTimer -= dt;
    enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
    const dx = world.player.x - enemy.x;
    const dy = world.player.y - enemy.y;
    const distance = Math.hypot(dx, dy) || 1;
    const towardX = dx / distance;
    const towardY = dy / distance;
    if (enemy.type === 'chaser' || enemy.type === 'mini' || enemy.type === 'splitter') {
      enemy.vx += towardX * enemy.speed * dt * 2.2;
      enemy.vy += towardY * enemy.speed * dt * 2.2;
    } else if (enemy.type === 'shooter') {
      const rangeDelta = distance - SHOOTER.preferredRange;
      const strafe = enemy.orbitDirection;
      enemy.vx += (towardX * clamp(rangeDelta, -90, 90) * 0.6 - towardY * strafe * 45) * dt;
      enemy.vy += (towardY * clamp(rangeDelta, -90, 90) * 0.6 + towardX * strafe * 45) * dt;
      if (enemy.fireTimer <= 0) {
        fireEnemy(world, enemy, towardX, towardY, SHOOTER.boltSpeed, SHOOTER.boltDamage, '#ffbb57', 6);
        enemy.fireTimer = SHOOTER.fireInterval * range(world.random, 0.85, 1.2);
      }
    } else if (enemy.type === 'orbiter') {
      const rangeDelta = distance - ORBITER.preferredRange;
      enemy.vx += (towardX * rangeDelta * 0.36 - towardY * enemy.orbitDirection * 62) * dt;
      enemy.vy += (towardY * rangeDelta * 0.36 + towardX * enemy.orbitDirection * 62) * dt;
      if (enemy.fireTimer <= 0) {
        fireEnemy(world, enemy, towardX, towardY, ORBITER.orbSpeed, ORBITER.orbDamage, '#55e8da', 9, 'orb');
        enemy.fireTimer = ORBITER.fireInterval;
      }
    } else if (enemy.type === 'dasher') {
      updateDasher(world, enemy, dt, towardX, towardY);
    }
    const velocity = Math.hypot(enemy.vx, enemy.vy);
    const maxSpeed = enemy.type === 'dasher' && enemy.state === 'charge' ? DASHER.chargeSpeed : enemy.speed;
    if (velocity > maxSpeed) {
      enemy.vx = enemy.vx / velocity * maxSpeed;
      enemy.vy = enemy.vy / velocity * maxSpeed;
    }
    enemy.x += enemy.vx * dt;
    enemy.y += enemy.vy * dt;
    enemy.vx *= Math.pow(0.92, dt * 60);
    enemy.vy *= Math.pow(0.92, dt * 60);
    enemy.angle = Math.atan2(enemy.vy, enemy.vx);
    collideEnemyPlayer(world, enemy, audio);
  }
  if (world.boss) updateBoss(world, dt, audio);
}

function updateDasher(world, enemy, dt, towardX, towardY) {
  if (enemy.state === 'approach' && enemy.stateTimer <= 0) {
    enemy.state = 'telegraph';
    enemy.stateTimer = DASHER.telegraphTime;
    enemy.chargeDirection = { x: towardX, y: towardY };
    enemy.vx = 0;
    enemy.vy = 0;
  } else if (enemy.state === 'telegraph' && enemy.stateTimer <= 0) {
    enemy.state = 'charge';
    enemy.stateTimer = DASHER.chargeTime;
    enemy.vx = enemy.chargeDirection.x * DASHER.chargeSpeed;
    enemy.vy = enemy.chargeDirection.y * DASHER.chargeSpeed;
  } else if (enemy.state === 'charge' && enemy.stateTimer <= 0) {
    enemy.state = 'approach';
    enemy.stateTimer = DASHER.pauseTime;
  }
}

function fireEnemy(world, enemy, directionX, directionY, speed, damage, color, radius, kind = 'bolt') {
  world.bullets.push({ x: enemy.x + directionX * enemy.radius, y: enemy.y + directionY * enemy.radius, vx: directionX * speed, vy: directionY * speed, radius, damage, life: 4, friendly: false, color, kind });
}

function updateBoss(world, dt, audio) {
  const boss = world.boss;
  boss.angle += dt * (boss.phase === 2 ? 0.8 : 0.38);
  boss.hitFlash = Math.max(0, boss.hitFlash - dt);
  boss.x += Math.sin(world.time * 0.55) * BOSS.moveSpeed * dt;
  boss.x = clamp(boss.x, boss.radius + 24, world.width - boss.radius - 24);
  boss.y = world.height * 0.3 + Math.sin(world.time * 0.8) * 34;
  boss.fireTimer -= dt;
  boss.aimedTimer -= dt;
  boss.summonTimer -= dt;
  if (boss.health < boss.maxHealth * 0.5) boss.phase = 2;
  if (boss.fireTimer <= 0) {
    fireRadial(world, boss, boss.phase === 2 ? 16 : 12, boss.phase === 2 ? 270 : 220, boss.phase === 2 ? 1 : 0);
    boss.fireTimer = boss.phase === 2 ? 0.85 : BOSS.radialInterval;
    if (audio) audio.explosion();
  }
  if (boss.aimedTimer <= 0) {
    fireSpread(world, boss);
    boss.aimedTimer = boss.phase === 2 ? 1.35 : BOSS.aimedInterval;
  }
  if (boss.phase === 2) {
    boss.spiralTimer -= dt;
    if (boss.spiralTimer <= 0) {
      const direction = fromAngle(boss.spiralAngle, 235);
      world.bullets.push({ x: boss.x, y: boss.y, vx: direction.x, vy: direction.y, radius: 6, damage: 11, life: 4, friendly: false, color: '#ff61e4', kind: 'spiral' });
      boss.spiralAngle += 0.34;
      boss.spiralTimer = BOSS.spiralInterval;
    }
  }
  if (boss.summonTimer <= 0) {
    for (let index = 0; index < 3; index += 1) {
      const angle = world.random() * Math.PI * 2;
      spawnEnemy(world, 'chaser', { x: boss.x + Math.cos(angle) * 120, y: boss.y + Math.sin(angle) * 100 });
    }
    boss.summonTimer = BOSS.summonInterval;
  }
}

function fireRadial(world, boss, count, speed, angleOffset) {
  const offset = world.time * angleOffset;
  for (let index = 0; index < count; index += 1) {
    const angle = index / count * Math.PI * 2 + offset;
    const vector = fromAngle(angle, speed);
    world.bullets.push({ x: boss.x, y: boss.y, vx: vector.x, vy: vector.y, radius: 6, damage: 12, life: 4.5, friendly: false, color: '#ff62df', kind: 'boss' });
  }
}

function fireSpread(world, boss) {
  const baseAngle = Math.atan2(world.player.y - boss.y, world.player.x - boss.x);
  for (let offset = -1; offset <= 1; offset += 1) {
    const vector = fromAngle(baseAngle + offset * 0.23, 340);
    world.bullets.push({ x: boss.x, y: boss.y, vx: vector.x, vy: vector.y, radius: 7, damage: 17, life: 4, friendly: false, color: '#ffaceb', kind: 'boss' });
  }
}

function updateBullets(world, dt, audio) {
  for (const bullet of world.bullets) {
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.life -= dt;
    if (bullet.friendly) {
      for (const enemy of world.enemies) {
        if (bullet.hitIds.includes(enemy.id)) continue;
        if (distanceSquared(bullet, enemy) <= (bullet.radius + enemy.radius) ** 2) {
          enemy.health -= bullet.damage;
          enemy.hitFlash = 0.12;
          bullet.hitIds.push(enemy.id);
          if (audio) audio.hit();
          spawnParticles(world, bullet.x, bullet.y, enemy.color, 4, 125);
          if (bullet.pierce <= 0) bullet.life = 0;
          else bullet.pierce -= 1;
          if (enemy.health <= 0) killEnemy(world, enemy, audio);
          break;
        }
      }
      if (world.boss && bullet.life > 0 && distanceSquared(bullet, world.boss) <= (bullet.radius + world.boss.radius) ** 2) {
        world.boss.health -= bullet.damage;
        world.boss.hitFlash = 0.12;
        bullet.life = bullet.pierce > 0 ? bullet.life : 0;
        if (bullet.pierce > 0) bullet.pierce -= 1;
        spawnParticles(world, bullet.x, bullet.y, '#ff72e4', 5, 145);
        if (world.boss.health <= 0) killBoss(world, audio);
      }
    } else if (world.player.invulnerable <= 0 && distanceSquared(bullet, world.player) <= (bullet.radius + PLAYER.radius) ** 2) {
      hurtPlayer(world, bullet.damage, audio);
      bullet.life = 0;
    }
  }
  world.bullets = world.bullets.filter((bullet) => bullet.life > 0 && bullet.x > -80 && bullet.x < world.width + 80 && bullet.y > -80 && bullet.y < world.height + 80);
}

function collideEnemyPlayer(world, enemy, audio) {
  if (world.player.invulnerable > 0) return;
  if (distanceSquared(enemy, world.player) <= (enemy.radius + PLAYER.radius) ** 2) {
    hurtPlayer(world, enemy.damage, audio);
    const dx = enemy.x - world.player.x;
    const dy = enemy.y - world.player.y;
    const distance = Math.hypot(dx, dy) || 1;
    enemy.vx += dx / distance * 180;
    enemy.vy += dy / distance * 180;
  }
}

function hurtPlayer(world, damage, audio) {
  world.player.hull -= damage;
  world.player.invulnerable = PLAYER.invulnerability;
  world.player.hitFlash = 0.25;
  world.slowMotion = PLAYER.hurtSlowTime;
  world.lowHullPulse = 0.55;
  world.shake = Math.max(world.shake, 13);
  spawnParticles(world, world.player.x, world.player.y, '#ff4e75', 14, 220);
  if (audio) audio.hurt();
}

function killEnemy(world, enemy, audio) {
  const index = world.enemies.indexOf(enemy);
  if (index < 0) return;
  world.enemies.splice(index, 1);
  world.kills += 1;
  world.combo = world.comboTimer > 0 ? Math.min(COMBO.maxMultiplier, world.combo + 0.25) : 1;
  world.comboTimer = COMBO.window;
  const multiplier = Math.max(1, Math.floor(world.combo));
  const points = enemy.score * multiplier;
  world.score += points;
  world.floaters.push({ x: enemy.x, y: enemy.y, text: `+${points}`, color: '#ffe48a', life: 1.05, maxLife: 1.05 });
  spawnShards(world, enemy.x, enemy.y, enemy.xp);
  spawnParticles(world, enemy.x, enemy.y, enemy.color, 17, 210);
  world.shockwaves.push({ x: enemy.x, y: enemy.y, radius: 8, maxRadius: enemy.radius * 3, life: 0.36, maxLife: 0.36, color: enemy.color });
  world.shake = Math.max(world.shake, enemy.radius > 20 ? 6 : 3);
  if (enemy.type === 'splitter') {
    spawnEnemy(world, 'mini', { x: enemy.x - 7, y: enemy.y }, { orbitDirection: -1 });
    spawnEnemy(world, 'mini', { x: enemy.x + 7, y: enemy.y }, { orbitDirection: 1 });
  }
  if (audio) audio.explosion();
}

function killBoss(world, audio) {
  const boss = world.boss;
  if (!boss) return;
  world.score += BOSS.score;
  world.kills += 1;
  world.floaters.push({ x: boss.x, y: boss.y, text: `VOIDMOTHER +${BOSS.score}`, color: '#ff9be9', life: 1.8, maxLife: 1.8 });
  spawnShards(world, boss.x, boss.y, BOSS.shardCount);
  spawnParticles(world, boss.x, boss.y, '#ff4ddd', 90, 390);
  world.shockwaves.push({ x: boss.x, y: boss.y, radius: 30, maxRadius: 410, life: 1.05, maxLife: 1.05, color: '#ff4ddd' });
  world.shake = 28;
  world.boss = null;
  world.bullets = world.bullets.filter((bullet) => bullet.friendly);
  if (audio) audio.explosion();
}

function spawnShards(world, x, y, count) {
  for (let index = 0; index < count; index += 1) {
    const angle = world.random() * Math.PI * 2;
    const speed = range(world.random, 35, 140);
    world.shards.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, radius: XP.shardRadius, value: world.stats.shardValue * XP.shardValue, life: 22, phase: world.random() * Math.PI * 2 });
  }
}

function updateShards(world, dt, audio) {
  for (const shard of world.shards) {
    shard.life -= dt;
    const dx = world.player.x - shard.x;
    const dy = world.player.y - shard.y;
    const distance = Math.hypot(dx, dy) || 1;
    if (distance < PLAYER.magnetRadius * world.stats.magnet) {
      shard.vx += dx / distance * XP.magnetSpeed * dt;
      shard.vy += dy / distance * XP.magnetSpeed * dt;
      const velocity = Math.hypot(shard.vx, shard.vy);
      if (velocity > XP.magnetSpeed) {
        shard.vx = shard.vx / velocity * XP.magnetSpeed;
        shard.vy = shard.vy / velocity * XP.magnetSpeed;
      }
    } else {
      shard.vx *= Math.pow(0.9, dt * 60);
      shard.vy *= Math.pow(0.9, dt * 60);
    }
    shard.x += shard.vx * dt;
    shard.y += shard.vy * dt;
    if (distance < PLAYER.radius + shard.radius + 4) {
      world.xp += shard.value;
      world.score += 5;
      shard.life = 0;
      if (audio) audio.pickup();
      while (world.xp >= world.xpNeeded) {
        world.xp -= world.xpNeeded;
        world.level += 1;
        world.xpNeeded = Math.floor(XP.firstLevel * Math.pow(XP.growth, world.level - 1));
        world.mode = 'levelup';
        world.upgrades = selectUpgrades(world);
        if (audio) audio.levelUp();
        break;
      }
    }
  }
  world.shards = world.shards.filter((shard) => shard.life > 0);
}

function selectUpgrades(world) {
  const choices = UPGRADES.slice();
  const result = [];
  while (result.length < 3 && choices.length > 0) {
    const index = Math.floor(world.random() * choices.length);
    result.push(choices.splice(index, 1)[0]);
  }
  return result;
}

export function applyUpgrade(world, index) {
  const upgrade = world.upgrades[index];
  if (!upgrade) return;
  const stats = world.stats;
  if (upgrade.id === 'fireRate') stats.fireRate *= 1.18;
  if (upgrade.id === 'damage') stats.damage *= 1.35;
  if (upgrade.id === 'extraShot') stats.extraShot = Math.min(4, stats.extraShot + 1);
  if (upgrade.id === 'bulletSpeed') stats.bulletSpeed *= 1.25;
  if (upgrade.id === 'moveSpeed') stats.moveSpeed *= 1.12;
  if (upgrade.id === 'dash') stats.dashRecharge *= 1.25;
  if (upgrade.id === 'magnet') stats.magnet *= 1.45;
  if (upgrade.id === 'hull') {
    world.player.maxHull += 25;
    world.player.hull = Math.min(world.player.maxHull, world.player.hull + 25);
  }
  if (upgrade.id === 'shardValue') stats.shardValue += 1;
  if (upgrade.id === 'pierce') stats.pierce = Math.min(4, stats.pierce + 1);
  if (upgrade.id === 'bulletSize') {
    stats.bulletSize *= 1.25;
    stats.damage *= 1.1;
  }
  world.mode = 'playing';
  world.upgrades = [];
}

function updateEffects(world, dt) {
  for (const particle of world.particles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= Math.pow(0.94, dt * 60);
    particle.vy *= Math.pow(0.94, dt * 60);
    particle.life -= dt;
  }
  world.particles = world.particles.filter((particle) => particle.life > 0);
  for (const floater of world.floaters) {
    floater.y -= 28 * dt;
    floater.life -= dt;
  }
  world.floaters = world.floaters.filter((floater) => floater.life > 0);
  for (const wave of world.shockwaves) {
    const progress = 1 - wave.life / wave.maxLife;
    wave.radius = wave.maxRadius * progress;
    wave.life -= dt;
  }
  world.shockwaves = world.shockwaves.filter((wave) => wave.life > 0);
}

function updateCombo(world, dt) {
  if (world.comboTimer > 0) {
    world.comboTimer -= dt;
    if (world.comboTimer <= 0) world.combo = 0;
  }
}

function updateWaveFlow(world, dt, audio) {
  if (world.intermission > 0 || world.spawnQueue.length > 0 || world.spawnTimer > 0) return;
  if (world.enemies.length === 0 && !world.boss) {
    beginIntermission(world, world.wave + 1);
    world.waveBanner = 0;
  }
  if (audio && world.wave > 0 && world.waveBanner > 0) audio.setBassWave(world.wave);
}

function spawnParticles(world, x, y, color, count, speed) {
  for (let index = 0; index < count; index += 1) {
    const angle = world.random() * Math.PI * 2;
    const velocity = range(world.random, speed * 0.22, speed);
    world.particles.push({ x, y, vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity, radius: range(world.random, 1, 3.8), color, life: range(world.random, 0.22, 0.72), maxLife: 0.72 });
  }
}

function distanceSquared(first, second) {
  return (first.x - second.x) ** 2 + (first.y - second.y) ** 2;
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}
