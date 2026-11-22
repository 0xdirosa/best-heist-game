// Meridian Midnight: everything the player sees, drawn on one canvas.
// The room, the cones, the loot, the HUD and every screen, all in 2D.

import { ALARM, CAMERA, FIELD, FONT, GUARD, PALETTE, TERMINAL } from './config.js';
import { SCREEN_BUSTED, SCREEN_CLEAR, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './world.js';
import { mulberry32 } from './random.js';

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

/** A tiny procedural painting, seeded so the same loot always looks the same. */
function drawMiniArt(ctx, x, y, w, h, seed) {
  const rng = mulberry32(seed);
  const skies = [['#2b4a6f', '#e8b23a'], ['#6f2b3a', '#f2c94c'], ['#1f4a3a', '#9be8ff'], ['#4a2b6f', '#e89a3a']];
  const [top, glow] = skies[Math.floor(rng() * skies.length)];
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, top);
  grad.addColorStop(1, '#14101e');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x + w * (0.25 + rng() * 0.5), y + h * (0.25 + rng() * 0.2), 5 + rng() * 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(10, 8, 16, 0.85)';
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x + w * (0.2 + rng() * 0.3), y + h * (0.35 + rng() * 0.25));
  ctx.lineTo(x + w * (0.5 + rng() * 0.3), y + h);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + w * 0.5, y + h);
  ctx.lineTo(x + w * (0.6 + rng() * 0.3), y + h * (0.45 + rng() * 0.2));
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();
}

function drawPainting(ctx, loot) {
  const w = 64;
  const h = 46;
  const x = loot.x - w / 2;
  const y = loot.y - h / 2;
  ctx.fillStyle = '#c9a227';
  ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
  ctx.fillStyle = '#241a10';
  ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
  drawMiniArt(ctx, x, y, w, h, loot.art);
}

function drawLoot(ctx, loot, time) {
  if (loot.taken) return;
  const pulse = 1 + Math.sin(time * 3 + loot.x) * 0.06;
  ctx.save();
  ctx.translate(loot.x, loot.y);
  ctx.scale(pulse, pulse);
  if (loot.kind === 'painting') {
    ctx.restore();
    drawPainting(ctx, loot);
    return;
  }
  if (loot.kind === 'bust') {
    ctx.fillStyle = '#8a6a1f';
    ctx.fillRect(-16, 10, 32, 8);
    ctx.fillStyle = '#f2c94c';
    ctx.beginPath();
    ctx.arc(0, -2, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c9962e';
    ctx.fillRect(-13, -16, 26, 8);
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath();
    ctx.arc(-4, -6, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (loot.kind === 'vase') {
    ctx.fillStyle = '#3f8f6f';
    ctx.beginPath();
    ctx.moveTo(-6, -16);
    ctx.bezierCurveTo(-14, -6, -12, 8, -5, 14);
    ctx.lineTo(5, 14);
    ctx.bezierCurveTo(12, 8, 14, -6, 6, -16);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#7fd0a8';
    ctx.fillRect(-8, -14, 16, 3);
  } else if (loot.kind === 'diamond') {
    const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 34);
    glow.addColorStop(0, 'rgba(155, 232, 255, 0.55)');
    glow.addColorStop(1, 'rgba(155, 232, 255, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#9be8ff';
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(13, -4);
    ctx.lineTo(9, 12);
    ctx.lineTo(-9, 12);
    ctx.lineTo(-13, -4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#e8fbff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-13, -4);
    ctx.lineTo(13, -4);
    ctx.moveTo(0, -16);
    ctx.lineTo(0, 12);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-4, -7, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#2f7d5a';
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7fd0a8';
    ctx.beginPath();
    ctx.arc(-4, -4, 4, 0, Math.PI * 2);
    ctx.arc(4, -4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2c94c';
    ctx.fillRect(-8, 6, 16, 4);
  }
  ctx.restore();
}

function drawGuard(ctx, guard, time) {
  const alerted = guard.state === 'chase' || guard.state === 'suspect';
  drawCone(ctx, guard.x, guard.y, guard.dir, GUARD.coneHalf, GUARD.coneRange, alerted ? PALETTE.coneGuardAlert : PALETTE.coneGuard);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(guard.x, guard.y + 10, 15, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.guard;
  ctx.beginPath();
  ctx.arc(guard.x, guard.y, guard.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.guardTrim;
  ctx.beginPath();
  ctx.arc(guard.x, guard.y, guard.radius - 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.guard;
  ctx.beginPath();
  ctx.arc(guard.x, guard.y - 2, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#101828';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(guard.x, guard.y);
  ctx.lineTo(guard.x + Math.cos(guard.dir) * 18, guard.y + Math.sin(guard.dir) * 18);
  ctx.stroke();
  if (alerted) {
    ctx.fillStyle = guard.state === 'chase' ? '#ff5a4e' : '#f2c94c';
    ctx.font = `bold 20px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(guard.state === 'chase' ? '!' : '?', guard.x, guard.y - 22 - Math.sin(time * 6) * 2);
  }
}

function drawCamera(ctx, cam, down) {
  drawCone(ctx, cam.x, cam.y, cam.angle, CAMERA.coneHalf, CAMERA.coneRange, down ? PALETTE.coneCameraDown : PALETTE.coneCamera);
  ctx.fillStyle = '#20242e';
  ctx.beginPath();
  ctx.arc(cam.x, cam.y, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = down ? '#8a8f98' : cam.seeing ? '#ff5a4e' : '#e5534b';
  ctx.beginPath();
  ctx.arc(cam.x + Math.cos(cam.angle) * 12, cam.y + Math.sin(cam.angle) * 12, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c9a227';
  ctx.beginPath();
  ctx.arc(cam.x, cam.y, 3, 0, Math.PI * 2);
  ctx.fill();
  // No OFFLINE label here: the grey cone and the HUD's CAMERAS DOWN badge
  // already say it, and a label under the top cameras would sit on the
  // objective line and under the bottom camera on the EXIT sign.
}

/** A security terminal on the wall: amber while live, green once hacked. */
function drawTerminal(ctx, terminal, time) {
  const hacked = terminal.hacked;
  ctx.fillStyle = PALETTE.terminal;
  ctx.fillRect(terminal.x - 14, terminal.y - 18, 28, 36);
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 2;
  ctx.strokeRect(terminal.x - 14, terminal.y - 18, 28, 36);
  ctx.fillStyle = hacked ? PALETTE.terminalHacked : PALETTE.terminalScreen;
  ctx.fillRect(terminal.x - 9, terminal.y - 13, 18, 12);
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

function drawThief(ctx, world, time) {
  const t = world.thief;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(t.x, t.y + 10, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.thief;
  ctx.beginPath();
  ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.thiefTrim;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(t.x, t.y, t.radius - 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = PALETTE.thief;
  ctx.beginPath();
  ctx.moveTo(t.x + Math.cos(t.face) * 16, t.y + Math.sin(t.face) * 16);
  ctx.lineTo(t.x + Math.cos(t.face + 2.5) * 10, t.y + Math.sin(t.face + 2.5) * 10);
  ctx.lineTo(t.x + Math.cos(t.face - 2.5) * 10, t.y + Math.sin(t.face - 2.5) * 10);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f2ead8';
  ctx.beginPath();
  ctx.arc(t.x + Math.cos(t.face) * 5, t.y + Math.sin(t.face) * 5, 3.5, 0, Math.PI * 2);
  ctx.fill();
  if (t.crack > 0 && !world.loot.find((l) => l.kind === 'diamond').taken) {
    ctx.strokeStyle = '#9be8ff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(t.x, t.y, 22, -Math.PI / 2, -Math.PI / 2 + (t.crack / 1.6) * Math.PI * 2);
    ctx.stroke();
  }
  if (t.hack > 0) {
    ctx.strokeStyle = PALETTE.terminalHacked;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(t.x, t.y, 22, -Math.PI / 2, -Math.PI / 2 + (t.hack / TERMINAL.hackSeconds) * Math.PI * 2);
    ctx.stroke();
  }
}

function drawRoom(ctx, world, time) {
  const rng = mulberry32(7);
  const tile = 64;
  for (let ty = 0; ty < FIELD.height / tile; ty += 1) {
    for (let tx = 0; tx < FIELD.width / tile; tx += 1) {
      const shade = (tx + ty) % 2 === 0 ? PALETTE.floorLight : PALETTE.floorDark;
      ctx.fillStyle = shade;
      ctx.fillRect(tx * tile, ty * tile, tile, tile);
      if (rng() < 0.12) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.fillRect(tx * tile + 8, ty * tile + 8, tile - 16, tile - 16);
      }
    }
  }
  ctx.strokeStyle = PALETTE.floorEdge;
  ctx.lineWidth = 1;
  for (let x = 0; x <= FIELD.width; x += tile) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, FIELD.height);
    ctx.stroke();
  }
  for (let y = 0; y <= FIELD.height; y += tile) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(FIELD.width, y);
    ctx.stroke();
  }
  // The three rooms read apart: warm west gallery, cool east gallery.
  ctx.fillStyle = PALETTE.zoneWest;
  ctx.fillRect(24, 24, 396, 672);
  ctx.fillStyle = PALETTE.zoneEast;
  ctx.fillRect(860, 24, 396, 672);
  ctx.fillStyle = 'rgba(242, 234, 216, 0.4)';
  ctx.font = `bold 13px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('W E S T   G A L L E R Y', 222, 100);
  ctx.fillText('T H E   V A U L T   H A L L', 640, 100);
  ctx.fillText('E A S T   G A L L E R Y', 1058, 100);
  // Red carpet from the entrance to the diamond case.
  ctx.fillStyle = PALETTE.carpet;
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
  // The diamond's case gets a velvet rope.
  ctx.strokeStyle = '#a83240';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(560, 392);
  ctx.quadraticCurveTo(640, 416, 720, 392);
  ctx.stroke();
  ctx.fillStyle = '#c9a227';
  ctx.beginPath();
  ctx.arc(560, 392, 5, 0, Math.PI * 2);
  ctx.arc(720, 392, 5, 0, Math.PI * 2);
  ctx.fill();
  // Potted palms in the corners.
  for (const [px, py] of [[64, 640], [1216, 640], [64, 80], [1216, 80]]) {
    ctx.fillStyle = '#3f5a3a';
    for (let i = 0; i < 5; i += 1) {
      const a = -Math.PI / 2 + (i - 2) * 0.45;
      ctx.beginPath();
      ctx.ellipse(px + Math.cos(a) * 16, py + Math.sin(a) * 16, 12, 5, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#7a4a21';
    ctx.fillRect(px - 9, py + 4, 18, 12);
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
  // Loot and time.
  ctx.textAlign = 'right';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = `bold 18px ${FONT}`;
  ctx.fillText(`LOOT $${world.lootValue.toLocaleString('en-US')}`, 1262, 26);
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
  if (world.messageTimer > 0 && world.message) {
    ctx.fillStyle = world.alarm >= 70 ? '#ff8a80' : PALETTE.gold;
    ctx.font = `bold 15px ${FONT}`;
    ctx.fillText(world.message, 18, 92);
  }
  ctx.fillStyle = PALETTE.muted;
  ctx.font = `12px ${FONT}`;
  ctx.textAlign = 'right';
  ctx.fillText('WASD / arrows move · click to walk · hack a terminal to blind the cameras · M sound · P pause', 1262, 70);
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
export function render(ctx, world, time, best) {
  ctx.clearRect(0, 0, FIELD.width, FIELD.height);
  drawRoom(ctx, world, time);
  drawLasers(ctx, world, time);
  for (const terminal of world.terminals) drawTerminal(ctx, terminal, time);
  for (const cam of world.cameras) drawCamera(ctx, cam, world.camerasDown > 0);
  for (const loot of world.loot) drawLoot(ctx, loot, time);
  for (const guard of world.guards) drawGuard(ctx, guard, time);
  drawThief(ctx, world, time);
  drawParticles(ctx, world);
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
    ctx.fillText('Dodge the guards’ cones, hack a terminal to blind the cameras, crack the case — and vanish.', FIELD.width / 2, 410);
    ctx.fillStyle = PALETTE.gold;
    ctx.font = `bold 20px ${FONT}`;
    ctx.fillText('Press ENTER to begin the heist', FIELD.width / 2, 470);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `15px ${FONT}`;
    ctx.fillText('WASD / arrows or click to move  ·  M sound  ·  P pause', FIELD.width / 2, 505);
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
