export const CFG = {
  arena: { width: 1280, height: 720, margin: 38, grid: 48, stars: 150 },
  colors: { bg:'#070914', panel:'#0b1020', cyan:'#55f6ff', blue:'#568bff', pink:'#ff4f9a', gold:'#ffd66b', white:'#e8f7ff', muted:'#8595b4', red:'#ff526d', green:'#72ffc4' },
  player: { radius: 13, speed: 275, accel: 900, drag: 0.84, hull: 5, fireRate: 0.22, bulletSpeed: 680, bulletDamage: 1, dashSpeed: 760, dashTime: 0.14, dashCooldown: 1.15, magnet: 92, invuln: 0.8 },
  enemies: { chaser: { hp:2, speed:78, radius:13, damage:1, score:10, xp:1 }, shooter:{ hp:3, speed:54, radius:15, damage:1, score:20, xp:2, range:260, fireRate:1.65 }, splitter:{ hp:4, speed:62, radius:17, damage:1, score:30, xp:3 }, mini:{ hp:1, speed:126, radius:8, damage:1, score:5, xp:1 }, boss:{ hp:90, speed:42, radius:48, damage:1, score:500, xp:24, fireRate:1.1 } },
  waves: { baseCount:5, countPerWave:2, spawnGap:0.82, waveDelay:2, speedPerWave:1.9, hpPerWave:0.16, bossEvery:5 },
  bullets: { playerLife:1.25, enemyLife:3.2, radius:4 },
  shards: { life:13, value:1, speed:280 },
  particles: { hit:7, explosion:20, life:0.55 },
  xpBase: 8,
};
