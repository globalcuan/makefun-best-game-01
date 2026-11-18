import { COLORS, PLAYER, DASH } from './config.js';

export function renderWorld(context, world, options = {}) {
  const width = world.width;
  const height = world.height;
  context.save();
  context.clearRect(0, 0, width, height);
  drawBackground(context, world);
  const shakeX = world.shake > 0 ? Math.sin(world.time * 91) * world.shake : 0;
  const shakeY = world.shake > 0 ? Math.cos(world.time * 83) * world.shake : 0;
  context.translate(shakeX, shakeY);
  drawShards(context, world);
  drawShockwaves(context, world);
  drawEnemies(context, world);
  drawBoss(context, world);
  drawBullets(context, world);
  drawParticles(context, world);
  drawPlayer(context, world);
  drawFloaters(context, world);
  context.restore();
  if (world.mode === 'playing' || world.mode === 'levelup' || world.mode === 'paused') {
    drawHud(context, world);
  }
  if (world.boss && ['playing', 'paused', 'levelup'].includes(world.mode)) {
    drawBossBar(context, world);
  }
  if (world.waveBanner > 0 && world.mode === 'playing') {
    drawWaveBanner(context, world);
  }
  drawScreenOverlay(context, world);
  if (world.mode === 'title') drawTitle(context, world);
  if (world.mode === 'paused') drawPause(context, world);
  if (world.mode === 'levelup') drawLevelUp(context, world);
  if (world.mode === 'gameover') drawGameOver(context, world);
  if (options.vignette !== false) drawVignette(context, world);
}

function drawBackground(context, world) {
  const gradient = context.createRadialGradient(world.width * 0.53, world.height * 0.42, 30, world.width * 0.5, world.height * 0.5, world.width * 0.72);
  gradient.addColorStop(0, '#11132d');
  gradient.addColorStop(0.55, '#0a0b1b');
  gradient.addColorStop(1, COLORS.background);
  context.fillStyle = gradient;
  context.fillRect(0, 0, world.width, world.height);
  const nebula = context.createRadialGradient(world.width * 0.7, world.height * 0.2, 0, world.width * 0.7, world.height * 0.2, world.width * 0.55);
  nebula.addColorStop(0, 'rgba(84, 31, 125, 0.16)');
  nebula.addColorStop(1, 'rgba(34, 59, 112, 0)');
  context.fillStyle = nebula;
  context.fillRect(0, 0, world.width, world.height);
  context.save();
  context.strokeStyle = 'rgba(99, 129, 199, 0.075)';
  context.lineWidth = 1;
  for (let x = 0; x <= world.width; x += 80) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, world.height);
    context.stroke();
  }
  for (let y = 0; y <= world.height; y += 80) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(world.width, y);
    context.stroke();
  }
  for (const star of world.stars) {
    const twinkle = 0.35 + (Math.sin(world.time * 1.6 + star.phase) + 1) * 0.23;
    context.globalAlpha = twinkle;
    context.fillStyle = '#bacfff';
    context.beginPath();
    context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

function drawPlayer(context, world) {
  const player = world.player;
  if (player.dashTimer > 0) {
    context.save();
    context.globalAlpha = Math.min(0.8, player.dashTimer / 0.17);
    context.strokeStyle = '#b3ffff';
    context.lineWidth = 3;
    context.shadowBlur = 20;
    context.shadowColor = '#66efff';
    context.beginPath();
    context.moveTo(player.x - player.dashDirection.x * 58, player.y - player.dashDirection.y * 58);
    context.lineTo(player.x - player.dashDirection.x * 18, player.y - player.dashDirection.y * 18);
    context.stroke();
    context.restore();
  }
  for (const point of player.trail) {
    context.globalAlpha = Math.max(0, point.life / 0.3) * 0.36;
    context.fillStyle = '#64efff';
    context.beginPath();
    context.arc(point.x, point.y, 3 + point.life * 17, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;
  context.save();
  context.translate(player.x, player.y);
  context.rotate(player.angle);
  context.shadowBlur = player.invulnerable > 0 ? 28 : 19;
  context.shadowColor = player.invulnerable > 0 ? '#b6ffff' : '#51eaff';
  context.fillStyle = player.hitFlash > 0 ? '#ffffff' : '#85f7ff';
  context.strokeStyle = '#e7ffff';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(22, 0);
  context.lineTo(-14, -13);
  context.lineTo(-8, 0);
  context.lineTo(-14, 13);
  context.closePath();
  context.fill();
  context.stroke();
  context.shadowBlur = 0;
  context.fillStyle = '#203a63';
  context.beginPath();
  context.moveTo(5, 0);
  context.lineTo(-8, -5);
  context.lineTo(-5, 0);
  context.lineTo(-8, 5);
  context.closePath();
  context.fill();
  if (player.muzzleFlash > 0) {
    context.globalAlpha = player.muzzleFlash / 0.075;
    context.fillStyle = '#fff7bd';
    context.shadowBlur = 24;
    context.shadowColor = '#9ffaff';
    context.beginPath();
    context.arc(27, 0, 12, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
  context.globalAlpha = 1;
}

function drawEnemies(context, world) {
  for (const enemy of world.enemies) {
    context.save();
    context.translate(enemy.x, enemy.y);
    context.rotate(enemy.angle || 0);
    context.shadowBlur = enemy.hitFlash > 0 ? 30 : 15;
    context.shadowColor = enemy.color;
    context.fillStyle = enemy.hitFlash > 0 ? '#ffffff' : `${enemy.color}99`;
    context.strokeStyle = enemy.color;
    context.lineWidth = 2;
    if (enemy.type === 'chaser' || enemy.type === 'mini') {
      polygon(context, 3, enemy.radius, -Math.PI / 2);
      context.fill();
      context.stroke();
      context.shadowBlur = 0;
      context.fillStyle = '#fff0fa';
      context.beginPath();
      context.arc(enemy.radius * 0.25, 0, Math.max(2.2, enemy.radius * 0.16), 0, Math.PI * 2);
      context.fill();
    } else if (enemy.type === 'shooter') {
      context.rotate(Math.PI / 4);
      context.fillRect(-enemy.radius * 0.72, -enemy.radius * 0.72, enemy.radius * 1.44, enemy.radius * 1.44);
      context.strokeRect(-enemy.radius * 0.72, -enemy.radius * 0.72, enemy.radius * 1.44, enemy.radius * 1.44);
      context.rotate(-Math.PI / 4);
      context.shadowBlur = 0;
      context.strokeStyle = '#fff1cb';
      context.beginPath();
      context.arc(0, 0, enemy.radius * 0.38, 0, Math.PI * 2);
      context.stroke();
    } else if (enemy.type === 'splitter') {
      polygon(context, 5, enemy.radius, -Math.PI / 2);
      context.fill();
      context.stroke();
      context.shadowBlur = 0;
      polygon(context, 5, enemy.radius * 0.44, -Math.PI / 2);
      context.strokeStyle = '#f5dcff';
      context.stroke();
    } else if (enemy.type === 'dasher') {
      polygon(context, 3, enemy.radius * 1.2, 0);
      context.fill();
      context.stroke();
      context.shadowBlur = 0;
      context.strokeStyle = '#ffe1e1';
      context.beginPath();
      context.moveTo(-enemy.radius * 0.62, 0);
      context.lineTo(enemy.radius * 0.68, 0);
      context.stroke();
      if (enemy.state === 'telegraph') {
        context.globalAlpha = 0.35 + (Math.sin(world.time * 34) + 1) * 0.28;
        context.strokeStyle = '#ff5368';
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(enemy.chargeDirection.x * 180, enemy.chargeDirection.y * 180);
        context.stroke();
      }
    } else {
      polygon(context, 4, enemy.radius, Math.PI / 4);
      context.fill();
      context.stroke();
      context.shadowBlur = 0;
      context.strokeStyle = '#d7fffb';
      context.beginPath();
      context.moveTo(-enemy.radius * 0.45, 0);
      context.lineTo(enemy.radius * 0.45, 0);
      context.moveTo(0, -enemy.radius * 0.45);
      context.lineTo(0, enemy.radius * 0.45);
      context.stroke();
    }
    context.restore();
    if (enemy.health < enemy.maxHealth) drawTinyHealth(context, enemy);
  }
}

function drawBoss(context, world) {
  const boss = world.boss;
  if (!boss) return;
  context.save();
  context.translate(boss.x, boss.y);
  context.rotate(boss.angle);
  context.strokeStyle = 'rgba(255, 70, 221, 0.48)';
  context.lineWidth = 2;
  context.shadowBlur = 22;
  context.shadowColor = '#ff44d6';
  context.beginPath();
  context.ellipse(0, 0, boss.radius * 1.45, boss.radius * 0.66, world.time * 0.38, 0, Math.PI * 2);
  context.stroke();
  context.rotate(-boss.angle * 1.6);
  context.strokeStyle = '#ff9ae9';
  context.lineWidth = 3;
  context.beginPath();
  context.arc(0, 0, boss.radius * 1.15, world.time * 0.8, world.time * 0.8 + Math.PI * 1.45);
  context.stroke();
  context.rotate(boss.angle * 0.6);
  context.fillStyle = boss.hitFlash > 0 ? '#fff' : 'rgba(225, 60, 204, 0.24)';
  context.strokeStyle = '#ff5ee0';
  context.lineWidth = 4;
  context.shadowBlur = boss.phase === 2 ? 35 : 24;
  context.shadowColor = '#ff37d2';
  polygon(context, 7, boss.radius, -Math.PI / 2);
  context.fill();
  context.stroke();
  context.shadowBlur = 0;
  for (let index = 0; index < 7; index += 1) {
    const angle = index * Math.PI * 2 / 7;
    context.fillStyle = '#ff9aeb';
    context.beginPath();
    context.arc(Math.cos(angle) * boss.radius * 0.58, Math.sin(angle) * boss.radius * 0.58, 5, 0, Math.PI * 2);
    context.fill();
  }
  const pulse = 1 + Math.sin(world.time * 5) * 0.13;
  const core = context.createRadialGradient(0, 0, 3, 0, 0, 29 * pulse);
  core.addColorStop(0, '#fff7ff');
  core.addColorStop(0.25, '#ff8de8');
  core.addColorStop(1, 'rgba(255, 41, 207, 0)');
  context.fillStyle = core;
  context.beginPath();
  context.arc(0, 0, 30 * pulse, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawBullets(context, world) {
  for (const bullet of world.bullets) {
    const color = bullet.friendly ? '#a6fbff' : (bullet.color || '#ff648a');
    context.save();
    context.strokeStyle = color;
    context.fillStyle = color;
    context.shadowBlur = bullet.friendly ? 16 : 13;
    context.shadowColor = color;
    context.lineWidth = bullet.radius * 1.15;
    context.beginPath();
    context.moveTo(bullet.x - bullet.vx * 0.035, bullet.y - bullet.vy * 0.035);
    context.lineTo(bullet.x, bullet.y);
    context.stroke();
    context.beginPath();
    context.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }
}

function drawShards(context, world) {
  for (const shard of world.shards) {
    const shimmer = 0.72 + Math.sin(world.time * 8 + shard.phase) * 0.24;
    context.save();
    context.translate(shard.x, shard.y);
    context.rotate(world.time * 0.8 + shard.phase);
    context.globalAlpha = shimmer;
    context.shadowBlur = 13;
    context.shadowColor = '#69f7ff';
    context.fillStyle = '#98ffff';
    context.strokeStyle = '#e5ffff';
    context.beginPath();
    context.moveTo(0, -shard.radius * 1.5);
    context.lineTo(shard.radius, 0);
    context.lineTo(0, shard.radius * 1.5);
    context.lineTo(-shard.radius, 0);
    context.closePath();
    context.fill();
    context.stroke();
    context.restore();
  }
}

function drawParticles(context, world) {
  for (const particle of world.particles) {
    context.globalAlpha = Math.max(0, particle.life / particle.maxLife);
    context.fillStyle = particle.color;
    context.shadowBlur = 7;
    context.shadowColor = particle.color;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;
  context.shadowBlur = 0;
}

function drawShockwaves(context, world) {
  for (const wave of world.shockwaves) {
    context.globalAlpha = Math.max(0, wave.life / wave.maxLife);
    context.strokeStyle = wave.color;
    context.lineWidth = 3 + wave.life / wave.maxLife * 4;
    context.shadowBlur = 18;
    context.shadowColor = wave.color;
    context.beginPath();
    context.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
    context.stroke();
  }
  context.globalAlpha = 1;
  context.shadowBlur = 0;
}

function drawFloaters(context, world) {
  context.textAlign = 'center';
  context.font = '700 17px system-ui, sans-serif';
  for (const floater of world.floaters) {
    context.globalAlpha = Math.min(1, floater.life / 0.3);
    context.fillStyle = floater.color;
    context.shadowBlur = 12;
    context.shadowColor = floater.color;
    context.fillText(floater.text, floater.x, floater.y);
  }
  context.globalAlpha = 1;
  context.shadowBlur = 0;
}

function drawTinyHealth(context, enemy) {
  const width = enemy.radius * 2;
  context.fillStyle = 'rgba(3, 6, 18, 0.8)';
  context.fillRect(enemy.x - width / 2, enemy.y - enemy.radius - 10, width, 3);
  context.fillStyle = enemy.color;
  context.fillRect(enemy.x - width / 2, enemy.y - enemy.radius - 10, width * Math.max(0, enemy.health / enemy.maxHealth), 3);
}

function drawHud(context, world) {
  context.save();
  context.fillStyle = 'rgba(5, 8, 24, 0.72)';
  roundedRect(context, 24, 22, 326, 110, 14);
  context.fill();
  context.fillStyle = COLORS.white;
  context.font = '700 13px system-ui, sans-serif';
  context.textAlign = 'left';
  context.fillText('HULL', 42, 47);
  context.fillStyle = '#24304b';
  roundedRect(context, 93, 34, 230, 14, 7);
  context.fill();
  const hullRatio = Math.max(0, world.player.hull / world.player.maxHull);
  const hullGradient = context.createLinearGradient(93, 0, 323, 0);
  hullGradient.addColorStop(0, hullRatio < 0.3 ? '#ff3e65' : '#50e0cf');
  hullGradient.addColorStop(1, hullRatio < 0.3 ? '#ff995d' : '#8dffbd');
  context.fillStyle = hullGradient;
  roundedRect(context, 93, 34, 230 * hullRatio, 14, 7);
  context.fill();
  context.fillStyle = COLORS.white;
  context.font = '700 12px system-ui, sans-serif';
  context.fillText(`${Math.ceil(world.player.hull)} / ${world.player.maxHull}`, 98, 46);
  context.fillStyle = COLORS.muted;
  context.fillText(`LV ${world.level}`, 42, 76);
  context.fillStyle = '#253050';
  roundedRect(context, 93, 64, 230, 10, 5);
  context.fill();
  context.fillStyle = '#66efff';
  roundedRect(context, 93, 64, 230 * Math.min(1, world.xp / world.xpNeeded), 10, 5);
  context.fill();
  context.textAlign = 'right';
  context.fillStyle = '#e4faff';
  context.font = '800 22px system-ui, sans-serif';
  context.fillText(world.score.toLocaleString(), world.width - 30, 52);
  context.fillStyle = COLORS.muted;
  context.font = '700 12px system-ui, sans-serif';
  context.fillText('SCORE', world.width - 30, 29);
  context.textAlign = 'right';
  context.font = '700 15px system-ui, sans-serif';
  context.fillStyle = '#f5e7ff';
  context.fillText(`WAVE ${Math.max(1, world.wave)}`, world.width - 30, 78);
  const combo = world.combo > 0 ? `×${world.combo.toFixed(1)}` : '—';
  context.fillStyle = world.combo > 1 ? '#ffe27d' : COLORS.muted;
  context.fillText(`COMBO ${combo}`, world.width - 30, 101);
  drawDashPip(context, world);
  context.restore();
}

function drawDashPip(context, world) {
  const ready = world.player.dashCooldown <= 0;
  const ratio = ready ? 1 : 1 - world.player.dashCooldown / DASH.cooldown;
  const x = 40;
  const y = world.height - 44;
  context.save();
  context.strokeStyle = ready ? '#8cfbff' : '#42506e';
  context.fillStyle = ready ? 'rgba(88, 244, 255, 0.25)' : 'rgba(20, 28, 49, 0.8)';
  context.shadowBlur = ready ? 15 : 0;
  context.shadowColor = '#56eeff';
  context.beginPath();
  context.arc(x, y, 13, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
  context.strokeStyle = ready ? '#8cfbff' : '#6e7a9b';
  context.lineWidth = 3;
  context.stroke();
  context.beginPath();
  context.arc(x, y, 8, 0, Math.PI * 2);
  context.fill();
  context.shadowBlur = 0;
  context.fillStyle = '#c8faff';
  context.font = '700 11px system-ui, sans-serif';
  context.textAlign = 'left';
  context.fillText('SHIFT  DASH', 62, y + 4);
  context.restore();
}

function drawBossBar(context, world) {
  const boss = world.boss;
  const width = Math.min(660, world.width - 100);
  const x = (world.width - width) / 2;
  const y = 26;
  context.save();
  context.textAlign = 'center';
  context.fillStyle = '#ffd7f7';
  context.font = '900 15px system-ui, sans-serif';
  context.shadowBlur = 12;
  context.shadowColor = '#ff39d3';
  context.fillText('VOIDMOTHER', world.width / 2, y + 14);
  context.shadowBlur = 0;
  context.fillStyle = 'rgba(9, 6, 25, 0.88)';
  roundedRect(context, x, y + 22, width, 15, 8);
  context.fill();
  const gradient = context.createLinearGradient(x, 0, x + width, 0);
  gradient.addColorStop(0, '#b52cff');
  gradient.addColorStop(1, '#ff54ce');
  context.fillStyle = gradient;
  roundedRect(context, x + 2, y + 24, (width - 4) * Math.max(0, boss.health / boss.maxHealth), 11, 6);
  context.fill();
  context.restore();
}

function drawWaveBanner(context, world) {
  context.save();
  context.globalAlpha = Math.min(1, world.waveBanner * 1.7);
  context.textAlign = 'center';
  context.font = '900 40px system-ui, sans-serif';
  context.fillStyle = '#d9faff';
  context.shadowBlur = 22;
  context.shadowColor = '#6af4ff';
  const label = world.wave % 5 === 0 ? 'VOIDMOTHER' : `WAVE ${world.wave}`;
  context.fillText(label, world.width / 2, world.height * 0.22);
  context.restore();
}

function drawTitle(context, world) {
  panel(context, world.width * 0.5 - 330, world.height * 0.5 - 188, 660, 376);
  context.textAlign = 'center';
  context.fillStyle = '#f4fdff';
  context.font = '950 62px system-ui, sans-serif';
  context.shadowBlur = 27;
  context.shadowColor = '#52e9ff';
  context.fillText('VOID HARVEST', world.width / 2, world.height / 2 - 85);
  context.shadowBlur = 0;
  context.fillStyle = '#b3c3e9';
  context.font = '700 15px system-ui, sans-serif';
  context.fillText('A NEON TWIN-STICK SURVIVAL RUN', world.width / 2, world.height / 2 - 50);
  context.fillStyle = '#80f4ff';
  context.font = '700 17px system-ui, sans-serif';
  context.fillText('CLICK OR PRESS ENTER TO DESCEND', world.width / 2, world.height / 2 + 23);
  context.fillStyle = '#b6bfd9';
  context.font = '500 14px system-ui, sans-serif';
  context.fillText('WASD / ARROWS MOVE     MOUSE AIM     HOLD CLICK / SPACE FIRE', world.width / 2, world.height / 2 + 78);
  context.fillText('SHIFT DASH     P / ESC PAUSE     M MUTE', world.width / 2, world.height / 2 + 104);
  context.fillStyle = '#7485b1';
  context.font = '600 12px system-ui, sans-serif';
  context.fillText('THE VOID IS HUNGRY. KEEP MOVING.', world.width / 2, world.height / 2 + 146);
}

function drawPause(context, world) {
  panel(context, world.width / 2 - 220, world.height / 2 - 105, 440, 210);
  context.textAlign = 'center';
  context.fillStyle = '#ecfbff';
  context.font = '900 38px system-ui, sans-serif';
  context.fillText('PAUSED', world.width / 2, world.height / 2 - 15);
  context.fillStyle = COLORS.muted;
  context.font = '600 15px system-ui, sans-serif';
  context.fillText('PRESS P OR ESC TO RESUME', world.width / 2, world.height / 2 + 34);
}

function drawLevelUp(context, world) {
  context.fillStyle = 'rgba(4, 6, 20, 0.78)';
  context.fillRect(0, 0, world.width, world.height);
  context.textAlign = 'center';
  context.fillStyle = '#f5ffff';
  context.shadowBlur = 22;
  context.shadowColor = '#66efff';
  context.font = '950 38px system-ui, sans-serif';
  context.fillText('LEVEL UP', world.width / 2, world.height * 0.26);
  context.shadowBlur = 0;
  context.fillStyle = '#afc1dc';
  context.font = '600 14px system-ui, sans-serif';
  context.fillText('CHOOSE AN UPGRADE', world.width / 2, world.height * 0.26 + 27);
  const cardWidth = 270;
  const cardHeight = 210;
  const gap = 22;
  const startX = (world.width - (cardWidth * 3 + gap * 2)) / 2;
  world.upgrades.forEach((upgrade, index) => {
    const x = startX + index * (cardWidth + gap);
    const y = world.height * 0.39;
    context.save();
    context.fillStyle = 'rgba(17, 24, 52, 0.96)';
    context.strokeStyle = upgrade.color;
    context.lineWidth = 2;
    context.shadowBlur = 15;
    context.shadowColor = upgrade.color;
    roundedRect(context, x, y, cardWidth, cardHeight, 14);
    context.fill();
    context.stroke();
    context.shadowBlur = 0;
    context.textAlign = 'center';
    context.fillStyle = upgrade.color;
    context.font = '900 18px system-ui, sans-serif';
    context.fillText(`${index + 1}`, x + cardWidth / 2, y + 37);
    context.fillStyle = '#f1f6ff';
    context.font = '800 18px system-ui, sans-serif';
    wrapText(context, upgrade.name, x + cardWidth / 2, y + 87, cardWidth - 34, 22);
    context.fillStyle = '#aebcda';
    context.font = '500 14px system-ui, sans-serif';
    wrapText(context, upgrade.detail, x + cardWidth / 2, y + 140, cardWidth - 35, 20);
    context.restore();
  });
}

function drawGameOver(context, world) {
  context.fillStyle = 'rgba(8, 4, 17, 0.76)';
  context.fillRect(0, 0, world.width, world.height);
  panel(context, world.width / 2 - 300, world.height / 2 - 220, 600, 440);
  context.textAlign = 'center';
  context.fillStyle = '#ff7190';
  context.shadowBlur = 22;
  context.shadowColor = '#ff376f';
  context.font = '950 46px system-ui, sans-serif';
  context.fillText('RUN ENDED', world.width / 2, world.height / 2 - 132);
  context.shadowBlur = 0;
  context.fillStyle = '#eaf5ff';
  context.font = '800 17px system-ui, sans-serif';
  context.fillText('FINAL SCORE', world.width / 2, world.height / 2 - 82);
  context.fillStyle = '#fff3a5';
  context.font = '950 42px system-ui, sans-serif';
  context.fillText(world.score.toLocaleString(), world.width / 2, world.height / 2 - 34);
  context.fillStyle = '#b9c6e4';
  context.font = '700 16px system-ui, sans-serif';
  context.fillText(`WAVE ${Math.max(1, world.wave)}     •     ${world.kills} KILLS     •     ${formatTime(world.elapsed)}`, world.width / 2, world.height / 2 + 18);
  context.fillStyle = '#86f4ff';
  context.font = '800 16px system-ui, sans-serif';
  context.fillText('PRESS R OR ENTER TO RUN IT BACK', world.width / 2, world.height / 2 + 98);
}

function drawScreenOverlay(context, world) {
  if (world.player.hull / world.player.maxHull < 0.3 || world.lowHullPulse > 0) {
    const strength = Math.max(world.lowHullPulse / 0.55, 1 - world.player.hull / world.player.maxHull) * 0.36;
    const gradient = context.createRadialGradient(world.width / 2, world.height / 2, world.height * 0.2, world.width / 2, world.height / 2, world.width * 0.68);
    gradient.addColorStop(0, 'rgba(255, 24, 64, 0)');
    gradient.addColorStop(1, `rgba(255, 25, 62, ${strength})`);
    context.fillStyle = gradient;
    context.fillRect(0, 0, world.width, world.height);
  }
}

function drawVignette(context, world) {
  const gradient = context.createRadialGradient(world.width / 2, world.height / 2, world.height * 0.34, world.width / 2, world.height / 2, world.width * 0.75);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, 'rgba(0, 0, 12, 0.54)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, world.width, world.height);
}

function panel(context, x, y, width, height) {
  context.save();
  context.fillStyle = 'rgba(8, 12, 31, 0.9)';
  context.strokeStyle = 'rgba(106, 224, 255, 0.42)';
  context.lineWidth = 1.5;
  context.shadowBlur = 28;
  context.shadowColor = 'rgba(45, 211, 255, 0.18)';
  roundedRect(context, x, y, width, height, 20);
  context.fill();
  context.stroke();
  context.restore();
}

function roundedRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

function polygon(context, sides, radius, rotation = 0) {
  context.beginPath();
  for (let index = 0; index < sides; index += 1) {
    const angle = rotation + index * Math.PI * 2 / sides;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.closePath();
}

function wrapText(context, text, centerX, y, maximumWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let lineY = y;
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > maximumWidth && line) {
      context.fillText(line, centerX, lineY);
      line = word;
      lineY += lineHeight;
    } else {
      line = candidate;
    }
  }
  if (line) context.fillText(line, centerX, lineY);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remaining}`;
}
