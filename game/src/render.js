// Meridian Midnight: everything the player sees, drawn on one canvas.
// The room, the cones, the loot, the HUD and every screen, all in 2D.

import { ALARM, CAMERA, COIN, CRACK, FIELD, FONT, GUARD, PALETTE, SMOKE, TERMINAL } from './config.js';
import { SCREEN_BUSTED, SCREEN_CLEAR, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './world.js';
import { drawGemFrame, drawMuseum, drawSmokeFrame, museumPattern } from './sprites.js';

/** Draw a vision cone: a soft sector from (x, y) along `angle`. */
function drawCone(ctx, x, y, angle, half, range, colour) {
  const grad = ctx.createRadialGradient(x, y, 8, x, y, range);
  grad.addColorStop(0, colour);
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - half, angle + half);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = colour;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(angle - half) * range, y + Math.sin(angle - half) * range);
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(angle + half) * range, y + Math.sin(angle + half) * range);
  ctx.stroke();
}

function drawLoot(ctx, loot, time, sprites) {
  if (loot.taken) return;
  if (loot.kind === 'painting') {
    // Three framed paintings, picked by the loot's own art seed so the
    // same loot always hangs the same picture.
    const art = ['painting_a', 'painting_b', 'painting_c'][((loot.art % 3) + 3) % 3];
    drawMuseum(ctx, sprites, art, loot.x, loot.y, 4);
    return;
  }
  if (loot.kind === 'diamond') {
    drawGemFrame(ctx, sprites, loot.x, loot.y, time);
    return;
  }
  const name = loot.kind === 'bust' ? 'bust' : loot.kind === 'vase' ? 'vase' : 'idol';
  drawMuseum(ctx, sprites, name, loot.x, loot.y, 2);
}

function drawThrownCoins(ctx, world, sprites) {
  for (const coin of world.thrownCoins) {
    drawMuseum(ctx, sprites, 'coin', coin.x, coin.y, 1.5);
    ctx.strokeStyle = 'rgba(242, 201, 76, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, 10 + Math.sin(world.time * 8) * 2, 0, Math.PI * 2);
    ctx.stroke();
  }
}

/** Smoke clouds, drawn over the thief: a pixelfx cloud that hides him. */
function drawSmoke(ctx, world, sprites) {
  for (const cloud of world.smoke) {
    const fade = Math.min(1, cloud.life / 1.5);
    ctx.globalAlpha = fade;
    drawSmokeFrame(ctx, sprites, cloud.x, cloud.y, cloud.life);
    ctx.globalAlpha = 1;
  }
}

/**
 * The safe-crack dial, drawn around the diamond case while Rook stands at
 * it: a sweeping needle, a gold zone, and one pip per landed hit.
 */
function drawCrackDial(ctx, world) {
  const diamond = world.loot.find((l) => l.kind === 'diamond');
  if (!diamond || diamond.taken) return;
  const thief = world.thief;
  const d = Math.hypot(thief.x - diamond.x, thief.y - diamond.y);
  if (d >= CRACK.crackRange) return;
  const needle = ((world.time / CRACK.needlePeriod) % 1) * Math.PI * 2;
  const cx = diamond.x;
  const cy = diamond.y;
  ctx.fillStyle = 'rgba(10, 8, 16, 0.78)';
  ctx.beginPath();
  ctx.arc(cx, cy, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f2c94c';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx, cy, 40, world.crackZone, world.crackZone + CRACK.zoneArc);
  ctx.stroke();
  ctx.strokeStyle = '#f2ead8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(needle) * 38, cy + Math.sin(needle) * 38);
  ctx.stroke();
  for (let i = 0; i < CRACK.hitsNeeded; i += 1) {
    ctx.fillStyle = i < thief.crack ? '#f2c94c' : 'rgba(242, 234, 216, 0.25)';
    ctx.beginPath();
    ctx.arc(cx - 16 + i * 16, cy + 56, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGuard(ctx, guard, time, sprites) {
  const alerted = guard.state === 'chase' || guard.state === 'suspect';
  drawCone(ctx, guard.x, guard.y, guard.dir, GUARD.coneHalf, GUARD.coneRange, alerted ? PALETTE.coneGuardAlert : PALETTE.coneGuard);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(guard.x, guard.y + 10, 15, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  drawMuseum(ctx, sprites, 'guard_topdown', guard.x, guard.y, 2);
  // A short brim line over the sprite, so the facing stays readable.
  ctx.strokeStyle = '#101828';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(guard.x, guard.y);
  ctx.lineTo(guard.x + Math.cos(guard.dir) * 14, guard.y + Math.sin(guard.dir) * 14);
  ctx.stroke();
  if (alerted) {
    ctx.fillStyle = guard.state === 'chase' ? '#ff5a4e' : '#f2c94c';
    ctx.font = `bold 20px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(guard.state === 'chase' ? '!' : '?', guard.x, guard.y - 22 - Math.sin(time * 6) * 2);
  }
  if (guard.barkTimer > 0 && guard.bark) {
    ctx.font = `bold 13px ${FONT}`;
    ctx.textAlign = 'center';
    const w = ctx.measureText(guard.bark).width + 12;
    ctx.fillStyle = 'rgba(16, 24, 40, 0.85)';
    ctx.fillRect(guard.x - w / 2, guard.y - 46, w, 18);
    ctx.fillStyle = '#f2ead8';
    ctx.fillText(guard.bark, guard.x, guard.y - 33);
  }
}

function drawCamera(ctx, cam, down, sprites) {
  drawCone(ctx, cam.x, cam.y, cam.angle, CAMERA.coneHalf, CAMERA.coneRange, down ? PALETTE.coneCameraDown : PALETTE.coneCamera);
  drawMuseum(ctx, sprites, 'camera_dome', cam.x, cam.y, 1.25);
  if (down) {
    // The dome's lens stays red in the sprite; a grey dot marks it blind.
    ctx.fillStyle = 'rgba(140, 140, 150, 0.85)';
    ctx.beginPath();
    ctx.arc(cam.x, cam.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  // No OFFLINE label here: the grey cone and the HUD's CAMERAS DOWN badge
  // already say it, and a label under the top cameras would sit on the
  // objective line and under the bottom camera on the EXIT sign.
}

/** A security terminal on the wall: amber while live, green once hacked. */
function drawTerminal(ctx, terminal, time, sprites) {
  const hacked = terminal.hacked;
  drawMuseum(ctx, sprites, 'terminal', terminal.x, terminal.y, 1.75);
  if (!hacked && Math.sin(time * 4) > 0) {
    ctx.fillStyle = '#ff5a4e';
    ctx.beginPath();
    ctx.arc(terminal.x + 8, terminal.y + 8, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = hacked ? PALETTE.terminalHacked : PALETTE.muted;
  ctx.font = `bold 9px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText(hacked ? 'OFFLINE' : 'SEC-01', terminal.x, terminal.y + 30);
}

/** The uniform rack in the east gallery: a blue uniform on a hook, or an
 * empty hook once Rook is wearing it. */
function drawDisguiseRack(ctx, world, sprites) {
  const rack = world.disguiseRack;
  if (!rack.taken) {
    drawMuseum(ctx, sprites, 'rack_uniform', rack.x, rack.y, 2);
    ctx.fillStyle = '#c9a227';
    ctx.font = `bold 9px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('UNIFORM', rack.x, rack.y + 28);
    return;
  }
  ctx.fillStyle = '#241f2e';
  ctx.fillRect(rack.x - 3, rack.y - 22, 6, 44);
  ctx.fillStyle = '#c9a227';
  ctx.beginPath();
  ctx.arc(rack.x, rack.y - 22, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawThief(ctx, world, time, sprites) {
  const t = world.thief;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(t.x, t.y + 10, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // A disguised Rook wears guard navy — the player is still the one
  // with the gold collar.
  drawMuseum(ctx, sprites, world.disguised ? 'rook_disguised' : 'rook_topdown', t.x, t.y, 2);
  if (t.hack > 0) {
    ctx.strokeStyle = PALETTE.terminalHacked;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(t.x, t.y, 22, -Math.PI / 2, -Math.PI / 2 + (t.hack / TERMINAL.hackSeconds) * Math.PI * 2);
    ctx.stroke();
  }
}

function drawRoom(ctx, world, time, sprites) {
  // Parquet in the galleries, veined marble in the vault hall: the floors
  // are pixel-art tiles now, not one flat checkerboard.
  ctx.fillStyle = museumPattern(ctx, sprites, 'parquet_tile');
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  ctx.fillStyle = museumPattern(ctx, sprites, 'marble_tile');
  ctx.fillRect(420, 24, 440, 672);
  // The marble reads pale against the night; deepen the hall a little so
  // the gold trim and the room label sit on it.
  ctx.fillStyle = 'rgba(20, 16, 30, 0.22)';
  ctx.fillRect(420, 24, 440, 672);
  // The three rooms read apart: warm west gallery, cool east gallery.
  ctx.fillStyle = PALETTE.zoneWest;
  ctx.fillRect(24, 24, 396, 672);
  ctx.fillStyle = PALETTE.zoneEast;
  ctx.fillRect(860, 24, 396, 672);
  ctx.fillStyle = 'rgba(242, 234, 216, 0.55)';
  ctx.font = `bold 13px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('W E S T   G A L L E R Y', 222, 100);
  ctx.fillText('T H E   V A U L T   H A L L', 640, 100);
  ctx.fillText('E A S T   G A L L E R Y', 1058, 100);
  // Warm pools under the three chandeliers.
  for (const [lx, ly] of [[222, 140], [640, 140], [1058, 140]]) {
    const pool = ctx.createRadialGradient(lx, ly, 10, lx, ly, 190);
    pool.addColorStop(0, 'rgba(242, 201, 76, 0.07)');
    pool.addColorStop(1, 'rgba(242, 201, 76, 0)');
    ctx.fillStyle = pool;
    ctx.fillRect(lx - 190, ly - 190, 380, 380);
  }
  ctx.fillStyle = museumPattern(ctx, sprites, 'carpet_tile');
  ctx.fillRect(96, 470, 140, 70);
  ctx.fillRect(1044, 470, 140, 70);
  ctx.strokeStyle = 'rgba(242, 201, 76, 0.6)';
  ctx.lineWidth = 2;
  ctx.strokeRect(96, 470, 140, 70);
  ctx.strokeRect(1044, 470, 140, 70);
  // Red carpet from the entrance to the diamond case.
  ctx.fillStyle = museumPattern(ctx, sprites, 'carpet_tile');
  ctx.fillRect(600, 364, 80, 332);
  ctx.strokeStyle = PALETTE.carpetEdge;
  ctx.lineWidth = 3;
  ctx.strokeRect(600, 364, 80, 332);
  ctx.strokeStyle = 'rgba(242, 201, 76, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(606, 370, 68, 320);
  // Moonlight shafts from the high windows.
  const shaft = ctx.createLinearGradient(200, 0, 420, 500);
  shaft.addColorStop(0, 'rgba(155, 200, 255, 0.07)');
  shaft.addColorStop(1, 'rgba(155, 200, 255, 0)');
  ctx.fillStyle = shaft;
  ctx.beginPath();
  ctx.moveTo(180, 24);
  ctx.lineTo(340, 24);
  ctx.lineTo(520, 520);
  ctx.lineTo(360, 520);
  ctx.closePath();
  ctx.fill();
  const shaft2 = ctx.createLinearGradient(940, 0, 760, 500);
  shaft2.addColorStop(0, 'rgba(155, 200, 255, 0.06)');
  shaft2.addColorStop(1, 'rgba(155, 200, 255, 0)');
  ctx.fillStyle = shaft2;
  ctx.beginPath();
  ctx.moveTo(940, 24);
  ctx.lineTo(1100, 24);
  ctx.lineTo(920, 520);
  ctx.lineTo(760, 520);
  ctx.closePath();
  ctx.fill();
  // Patrol routes, dotted on the floor: the cones are what a guard sees,
  // the dots are where he walks — read them before you move.
  ctx.strokeStyle = 'rgba(242, 234, 216, 0.16)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 8]);
  for (const guard of world.guards) {
    ctx.beginPath();
    guard.waypoints.forEach(([wx, wy], i) => {
      if (i === 0) ctx.moveTo(wx, wy);
      else ctx.lineTo(wx, wy);
    });
    ctx.closePath();
    ctx.stroke();
  }
  ctx.setLineDash([]);
  // Walls with gold trim.
  ctx.fillStyle = PALETTE.wall;
  for (const s of world.solids) {
    if (s.y === 0 || s.y + s.h === FIELD.height || s.x === 0 || s.x + s.w === FIELD.width) {
      ctx.fillRect(s.x, s.y, s.w, s.h);
    }
  }
  ctx.fillStyle = PALETTE.wallTop;
  for (const s of world.solids) {
    if (s.y !== 0 && s.y + s.h !== FIELD.height && s.x !== 0 && s.x + s.w !== FIELD.width) {
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.fillStyle = '#c9a227';
      ctx.fillRect(s.x, s.y, s.w, 2);
      ctx.fillStyle = PALETTE.wallTop;
    }
  }
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, FIELD.width - 48, FIELD.height - 48);
  // Display cases: glass tops over dark pedestals (the 90x54 loot cases and
  // the 88x64 diamond case in the middle of the hall).
  for (const s of world.solids) {
    if ((s.w === 90 && s.h === 54) || (s.w === 88 && s.h === 64)) {
      ctx.fillStyle = '#241f2e';
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.fillStyle = PALETTE.caseGlass;
      ctx.fillRect(s.x + 3, s.y + 3, s.w - 6, s.h - 6);
      ctx.strokeStyle = PALETTE.caseFrame;
      ctx.lineWidth = 2;
      ctx.strokeRect(s.x + 3, s.y + 3, s.w - 6, s.h - 6);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(s.x + 10, s.y + s.h - 8);
      ctx.lineTo(s.x + 34, s.y + 8);
      ctx.stroke();
    }
  }
  // The diamond's case gets a velvet rope on two gold stanchions.
  ctx.strokeStyle = '#a83240';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(560, 392);
  ctx.quadraticCurveTo(640, 416, 720, 392);
  ctx.stroke();
  drawMuseum(ctx, sprites, 'stanchion', 560, 392, 1.5);
  drawMuseum(ctx, sprites, 'stanchion', 720, 392, 1.5);
  // Potted palms in the corners, and benches under the high north windows.
  for (const [px, py] of [[64, 640], [1216, 640], [64, 80], [1216, 80]]) {
    drawMuseum(ctx, sprites, 'plant', px, py, 2);
  }
  for (const bx of [222, 640, 1058]) {
    drawMuseum(ctx, sprites, 'bench', bx, 80, 2);
  }
  // EXIT door, glowing green at the bottom.
  const exitGlow = 0.55 + Math.sin(time * 2.5) * 0.2;
  ctx.fillStyle = `rgba(88, 201, 138, ${exitGlow})`;
  ctx.fillRect(612, 696, 56, 24);
  ctx.fillStyle = '#0c2416';
  ctx.font = `bold 13px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', 640, 713);
}

function drawHud(ctx, world) {
  ctx.fillStyle = PALETTE.hud;
  ctx.fillRect(0, 0, FIELD.width, 52);
  ctx.fillStyle = PALETTE.text;
  ctx.font = `bold 17px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.fillText(`NIGHT ${world.night}/${3}  ·  MERIDIAN MIDNIGHT`, 18, 33);
  // Alarm meter.
  const ax = 470;
  const aw = 340;
  ctx.font = `bold 13px ${FONT}`;
  ctx.fillStyle = world.alarm >= 70 ? PALETTE.alarmHigh : world.alarm >= 40 ? PALETTE.alarmMid : PALETTE.alarmLow;
  ctx.fillText('ALARM', ax, 20);
  ctx.fillStyle = '#241f2e';
  ctx.fillRect(ax, 26, aw, 14);
  const alarmColour = world.alarm >= 70 ? PALETTE.alarmHigh : world.alarm >= 40 ? PALETTE.alarmMid : PALETTE.alarmLow;
  ctx.fillStyle = alarmColour;
  ctx.fillRect(ax, 26, (aw * world.alarm) / 100, 14);
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(ax, 26, aw, 14);
  ctx.fillStyle = PALETTE.text;
  ctx.font = `bold 13px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.fillText(`${Math.floor(world.alarm)}%`, ax + aw + 10, 38);
  // Loot, coins and smoke left, and time.
  ctx.textAlign = 'right';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = `bold 18px ${FONT}`;
  ctx.fillText(`LOOT $${world.lootValue.toLocaleString('en-US')}  ·  COINS ${'●'.repeat(world.coins)}${'○'.repeat(COIN.count - world.coins)}  ·  SMOKE ${'●'.repeat(world.smokeBombs)}${'○'.repeat(SMOKE.count - world.smokeBombs)}`, 1262, 26);
  ctx.fillStyle = PALETTE.muted;
  ctx.font = `13px ${FONT}`;
  const mins = Math.floor(world.time / 60);
  const secs = Math.floor(world.time % 60);
  ctx.fillText(`${mins}:${String(secs).padStart(2, '0')}`, 1262, 44);
  if (world.camerasDown > 0) {
    ctx.fillStyle = PALETTE.terminalHacked;
    ctx.font = `bold 13px ${FONT}`;
    ctx.fillText(`CAMERAS DOWN ${Math.ceil(world.camerasDown)}s`, 1262, 88);
  }
  // Objective and messages.
  const diamond = world.loot.find((l) => l.kind === 'diamond');
  ctx.textAlign = 'left';
  ctx.font = `13px ${FONT}`;
  ctx.fillStyle = PALETTE.muted;
  const objective = diamond.taken ? 'The Star is yours — reach the green EXIT!' : 'Steal the Star of Meridian diamond, then reach the EXIT.';
  ctx.fillText(objective, 18, 70);
  if (world.disguised) {
    const w = ctx.measureText(objective).width;
    ctx.fillStyle = PALETTE.guardTrim;
    ctx.font = `bold 13px ${FONT}`;
    ctx.fillText(' · DISGUISED', 18 + w, 70);
  }
  if (world.messageTimer > 0 && world.message) {
    ctx.fillStyle = world.alarm >= 70 ? '#ff8a80' : PALETTE.gold;
    ctx.font = `bold 15px ${FONT}`;
    ctx.fillText(world.message, 18, 92);
  }
  ctx.fillStyle = PALETTE.muted;
  ctx.font = `12px ${FONT}`;
  ctx.textAlign = 'right';
  ctx.fillText('WASD / arrows move · click to walk · SPACE crack the case · C throw a coin · X smoke · M sound · P pause', 1262, 70);
}

function drawParticles(ctx, world) {
  for (const p of world.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.colour;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (const f of world.floaters) {
    ctx.globalAlpha = Math.max(0, f.life / f.max);
    ctx.fillStyle = PALETTE.gold;
    ctx.font = `bold 16px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;
}

function drawLasers(ctx, world, time) {
  for (const laser of world.lasers) {
    if (laser.lit) {
      ctx.strokeStyle = 'rgba(229, 83, 75, 0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(laser.x1, laser.y1);
      ctx.lineTo(laser.x2, laser.y2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(229, 83, 75, 0.25)';
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(laser.x1, laser.y1);
      ctx.lineTo(laser.x2, laser.y2);
      ctx.stroke();
      ctx.fillStyle = '#ff5a4e';
      ctx.beginPath();
      ctx.arc(laser.x1, laser.y1, 4, 0, Math.PI * 2);
      ctx.arc(laser.x2, laser.y2, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = 'rgba(229, 83, 75, 0.25)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(laser.x1, laser.y1);
      ctx.lineTo(laser.x2, laser.y2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
}

function overlay(ctx, colour, alpha) {
  ctx.fillStyle = colour;
  ctx.globalAlpha = alpha;
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  ctx.globalAlpha = 1;
}

function bigText(ctx, title, subtitle, hint) {
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.text;
  ctx.font = `bold 64px ${FONT}`;
  ctx.fillText(title, FIELD.width / 2, 300);
  ctx.fillStyle = PALETTE.gold;
  ctx.font = `20px ${FONT}`;
  ctx.fillText(subtitle, FIELD.width / 2, 340);
  ctx.fillStyle = PALETTE.muted;
  ctx.font = `16px ${FONT}`;
  ctx.fillText(hint, FIELD.width / 2, 400);
}

/** Draw the whole frame for the world's current screen. */
export function render(ctx, world, time, best, sprites) {
  ctx.clearRect(0, 0, FIELD.width, FIELD.height);
  drawRoom(ctx, world, time, sprites);
  drawLasers(ctx, world, time);
  for (const terminal of world.terminals) drawTerminal(ctx, terminal, time, sprites);
  for (const cam of world.cameras) drawCamera(ctx, cam, world.camerasDown > 0, sprites);
  for (const loot of world.loot) drawLoot(ctx, loot, time, sprites);
  drawDisguiseRack(ctx, world, sprites);
  for (const guard of world.guards) drawGuard(ctx, guard, time, sprites);
  drawThief(ctx, world, time, sprites);
  drawSmoke(ctx, world, sprites);
  drawThrownCoins(ctx, world, sprites);
  drawCrackDial(ctx, world);
  drawParticles(ctx, world);
  // Vignette: the night closes in at the edges of the frame.
  const vig = ctx.createRadialGradient(640, 386, 260, 640, 386, 720);
  vig.addColorStop(0, 'rgba(10, 8, 16, 0)');
  vig.addColorStop(1, 'rgba(10, 8, 16, 0.32)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  if (world.alarm >= 70 && world.status === SCREEN_PLAY) {
    const pulse = 0.10 + Math.sin(time * 5) * 0.05;
    ctx.strokeStyle = `rgba(229, 83, 75, ${pulse + 0.15})`;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, FIELD.width - 10, FIELD.height - 10);
  }
  if (world.lockdown > 0 && world.status === SCREEN_PLAY) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff5a4e';
    ctx.font = `bold 26px ${FONT}`;
    ctx.fillText('— LOCKDOWN —', FIELD.width / 2, 120);
  }
  drawHud(ctx, world);

  if (world.status === SCREEN_TITLE) {
    overlay(ctx, '#0a0810', 0.72);
    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.gold;
    ctx.font = `bold 72px ${FONT}`;
    ctx.fillText('MERIDIAN', FIELD.width / 2, 250);
    ctx.fillStyle = PALETTE.text;
    ctx.fillText('MIDNIGHT', FIELD.width / 2, 330);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `20px ${FONT}`;
    ctx.fillText('One thief. One diamond. Three nights in the Meridian Museum.', FIELD.width / 2, 375);
    ctx.fillStyle = PALETTE.text;
    ctx.font = `17px ${FONT}`;
    ctx.fillText('Dodge the cones, toss a coin, drop smoke, wear a guard’s uniform, hack a terminal, crack the case — and vanish.', FIELD.width / 2, 410);
    ctx.fillStyle = PALETTE.gold;
    ctx.font = `bold 20px ${FONT}`;
    ctx.fillText('Press ENTER to begin the heist', FIELD.width / 2, 470);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `15px ${FONT}`;
    ctx.fillText('WASD / arrows or click to move  ·  SPACE crack the case  ·  C throw a coin  ·  X drop smoke  ·  M sound  ·  P pause', FIELD.width / 2, 505);
    if (best > 0) {
      ctx.fillStyle = PALETTE.gold;
      ctx.font = `16px ${FONT}`;
      ctx.fillText(`Best haul so far: $${best.toLocaleString('en-US')}`, FIELD.width / 2, 540);
    }
  } else if (world.status === SCREEN_PAUSED) {
    overlay(ctx, '#0a0810', 0.6);
    bigText(ctx, 'PAUSED', 'The museum holds its breath.', 'Press P to keep moving');
  } else if (world.status === SCREEN_BUSTED) {
    overlay(ctx, '#1a0505', 0.62);
    bigText(ctx, 'BUSTED!', `A guard caught Rook with $${world.lootValue.toLocaleString('en-US')} of loot.`, 'Press ENTER to try this night again');
  } else if (world.status === SCREEN_CLEAR) {
    overlay(ctx, '#0a0810', 0.68);
    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.text;
    ctx.font = `bold 56px ${FONT}`;
    ctx.fillText(`NIGHT ${world.night} — CLEAN GETAWAY`, FIELD.width / 2, 260);
    ctx.fillStyle = PALETTE.gold;
    ctx.font = `20px ${FONT}`;
    ctx.fillText(`Loot $${world.lootValue.toLocaleString('en-US')}  ·  Time bonus $${world.nightBonus}  ·  Ghost bonus $${world.ghostBonus}`, FIELD.width / 2, 310);
    ctx.fillStyle = PALETTE.text;
    ctx.font = `bold 20px ${FONT}`;
    ctx.fillText(`Night total $${(world.lootValue + world.nightBonus + world.ghostBonus).toLocaleString('en-US')} — press ENTER for Night ${world.night + 1}`, FIELD.width / 2, 360);
  } else if (world.status === SCREEN_WIN) {
    overlay(ctx, '#0a0810', 0.7);
    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.gold;
    ctx.font = `bold 60px ${FONT}`;
    ctx.fillText('THE PERFECT HEIST', FIELD.width / 2, 260);
    ctx.fillStyle = PALETTE.text;
    ctx.font = `22px ${FONT}`;
    ctx.fillText('Three nights. Every case empty. The Star of Meridian is gone —', FIELD.width / 2, 310);
    ctx.fillText('and nobody ever saw Rook at all.', FIELD.width / 2, 342);
    ctx.fillStyle = PALETTE.gold;
    ctx.font = `bold 24px ${FONT}`;
    ctx.fillText(`Total haul $${world.score.toLocaleString('en-US')}`, FIELD.width / 2, 400);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `16px ${FONT}`;
    ctx.fillText('Press ENTER to run it all again', FIELD.width / 2, 445);
  }
}
