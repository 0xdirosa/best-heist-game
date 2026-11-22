// Meridian Midnight: the museum, its guards, cameras, lasers and loot.
// One fixed step of simulation, pure rules, no drawing and no input devices.

import { ALARM, CAMERA, FIELD, GUARD, LOOT_VALUES, NIGHTS, STEP, THIEF } from './config.js';
import { angleDiff, angleTo, clamp, dist, mulberry32 } from './random.js';

/** Screens the game can be on. */
export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_BUSTED = 'busted';
export const SCREEN_CLEAR = 'clear';
export const SCREEN_WIN = 'win';

/** True when the segment (x1,y1)-(x2,y2) touches the rectangle. */
export function segmentHitsRect(x1, y1, x2, y2, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let tmin = 0;
  let tmax = 1;
  if (dx === 0) {
    if (x1 < r.x || x1 > r.x + r.w) return false;
  } else {
    let t1 = (r.x - x1) / dx;
    let t2 = (r.x + r.w - x1) / dx;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }
  if (dy === 0) {
    if (y1 < r.y || y1 > r.y + r.h) return false;
  } else {
    let t1 = (r.y - y1) / dy;
    let t2 = (r.y + r.h - y1) / dy;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }
  return true;
}

/** True when nothing solid stands between two points. */
export function lineOfSight(x1, y1, x2, y2, solids) {
  for (let i = 0; i < solids.length; i += 1) {
    if (segmentHitsRect(x1, y1, x2, y2, solids[i])) return false;
  }
  return true;
}

/** Push a circle out of every rectangle it overlaps; returns true on a hit. */
export function resolveCircle(body, solids) {
  let hit = false;
  for (let i = 0; i < solids.length; i += 1) {
    const r = solids[i];
    const cx = clamp(body.x, r.x, r.x + r.w);
    const cy = clamp(body.y, r.y, r.y + r.h);
    const dx = body.x - cx;
    const dy = body.y - cy;
    const d2 = dx * dx + dy * dy;
    if (d2 >= body.radius * body.radius) continue;
    hit = true;
    if (d2 > 0.0001) {
      const d = Math.sqrt(d2);
      body.x = cx + (dx / d) * body.radius;
      body.y = cy + (dy / d) * body.radius;
    } else {
      body.y = r.y - body.radius;
    }
  }
  return hit;
}

/** The museum's solid geometry: outer walls, dividers, stubs and cases. */
export function buildSolids() {
  const solids = [
    { x: 0, y: 0, w: 1280, h: 24 },
    { x: 0, y: 696, w: 612, h: 24 },
    { x: 668, y: 696, w: 612, h: 24 },
    { x: 0, y: 0, w: 24, h: 720 },
    { x: 1256, y: 0, w: 24, h: 720 },
    { x: 420, y: 24, w: 24, h: 296 },
    { x: 420, y: 400, w: 24, h: 296 },
    { x: 836, y: 24, w: 24, h: 296 },
    { x: 836, y: 400, w: 24, h: 296 },
    { x: 560, y: 120, w: 160, h: 16 },
    { x: 560, y: 560, w: 160, h: 16 },
    { x: 200, y: 300, w: 16, h: 120 },
    { x: 1064, y: 300, w: 16, h: 120 },
    { x: 150, y: 200, w: 90, h: 54 },
    { x: 1040, y: 200, w: 90, h: 54 },
    { x: 150, y: 520, w: 90, h: 54 },
    { x: 1040, y: 520, w: 90, h: 54 },
    { x: 596, y: 300, w: 88, h: 64 },
  ];
  return solids;
}

/** Loot placed on the floor plan. `art` seeds each painting's miniature. */
export function buildLoot(rng) {
  return [
    { id: 'painting-a', kind: 'painting', name: 'Portrait of the Duchess', x: 78, y: 150, value: LOOT_VALUES.painting, taken: false, art: Math.floor(rng() * 100000) },
    { id: 'painting-b', kind: 'painting', name: 'The Gilded Valley', x: 1202, y: 150, value: LOOT_VALUES.painting, taken: false, art: Math.floor(rng() * 100000) },
    { id: 'bust', kind: 'bust', name: 'Golden Bust of Aurelius', x: 195, y: 227, value: LOOT_VALUES.bust, taken: false, art: 0 },
    { id: 'vase', kind: 'vase', name: 'Celadon Vase', x: 1085, y: 227, value: LOOT_VALUES.vase, taken: false, art: 0 },
    { id: 'diamond', kind: 'diamond', name: 'The Star of Meridian', x: 640, y: 332, value: LOOT_VALUES.diamond, taken: false, art: 0 },
    { id: 'relic', kind: 'relic', name: 'Jade Jaguar Idol', x: 1085, y: 547, value: 650, taken: false, art: 0 },
  ];
}

function makeGuard(waypoints, speedScale) {
  return {
    x: waypoints[0][0],
    y: waypoints[0][1],
    radius: GUARD.radius,
    dir: 0,
    waypoints,
    wp: 1,
    wait: 0,
    state: 'patrol',
    exposure: 0,
    loseTimer: 0,
    lastSeen: { x: waypoints[0][0], y: waypoints[0][1] },
    speedScale,
  };
}

function makeCamera(x, y, baseAngle, phase) {
  return { x, y, baseAngle, angle: baseAngle, phase, seeing: false };
}

/** A fresh world for one night. Night 1, 2 and 3 add guards, a camera and lasers. */
export function createWorld(night, seed) {
  const rng = mulberry32(seed);
  const guards = [
    makeGuard([[120, 120], [320, 120], [320, 560], [120, 560]], 1),
    makeGuard([[520, 120], [760, 120], [760, 580], [520, 580]], 1),
    makeGuard([[960, 120], [1160, 120], [1160, 560], [960, 560]], 1),
  ];
  const cameras = [
    makeCamera(48, 48, 0.7, 0),
    makeCamera(1232, 48, Math.PI - 0.7, 1.3),
    makeCamera(640, 48, Math.PI / 2, 2.1),
  ];
  const lasers = [];
  if (night >= 2) {
    guards.push(makeGuard([[640, 140], [640, 560]], 1.08));
    cameras.push(makeCamera(640, 672, -Math.PI / 2, 0.6));
    lasers.push({ x1: 432, y1: 320, x2: 432, y2: 400, phase: 0, cooldown: 0 });
    lasers.push({ x1: 848, y1: 320, x2: 848, y2: 400, phase: 1.7, cooldown: 0 });
  }
  if (night >= 3) {
    guards.push(makeGuard([[240, 360], [1040, 360]], 1.15));
    lasers.push({ x1: 640, y1: 136, x2: 640, y2: 284, phase: 0.9, cooldown: 0 });
  }
  return {
    night,
    seed,
    solids: buildSolids(),
    loot: buildLoot(rng),
    guards,
    cameras,
    lasers,
    thief: { x: 640, y: 660, radius: THIEF.radius, crack: 0, moving: false, face: -Math.PI / 2 },
    alarm: 0,
    alarmPeak: 0,
    lockdown: 0,
    time: 0,
    lootValue: 0,
    score: 0,
    status: SCREEN_TITLE,
    message: '',
    messageTimer: 0,
    particles: [],
    floaters: [],
    caughtBy: null,
    nightBonus: 0,
    ghostBonus: 0,
  };
}

/** Can `eye` see the thief: in range, inside the cone, line of sight clear. */
export function canSee(eye, range, halfAngle, world) {
  const t = world.thief;
  if (dist(eye.x, eye.y, t.x, t.y) > range) return false;
  if (angleDiff(eye.dir ?? eye.angle, angleTo(eye.x, eye.y, t.x, t.y)) > halfAngle) return false;
  return lineOfSight(eye.x, eye.y, t.x, t.y, world.solids);
}

function moveBody(body, dx, dy, world) {
  body.x += dx;
  resolveCircle(body, world.solids);
  body.y += dy;
  resolveCircle(body, world.solids);
  body.x = clamp(body.x, 24 + body.radius, FIELD.width - 24 - body.radius);
  body.y = clamp(body.y, 24 + body.radius, FIELD.height - 24 - body.radius);
}

function burst(world, x, y, colour, count) {
  for (let i = 0; i < count; i += 1) {
    const a = Math.random() * Math.PI * 2;
    const sp = 40 + Math.random() * 120;
    world.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.6, max: 0.6, colour, size: 2 + Math.random() * 3 });
  }
}

/** One fixed simulation step. `input` is {mx, my, tx, ty} from input.js. */
export function stepWorld(world, input, dt) {
  if (world.status !== SCREEN_PLAY) return;
  world.time += dt;
  const thief = world.thief;

  // --- Move the thief: keys steer, a mouse click sets a target to walk to.
  let mx = input.mx;
  let my = input.my;
  if (mx === 0 && my === 0 && input.tx !== null) {
    const dx = input.tx - thief.x;
    const dy = input.ty - thief.y;
    const d = Math.hypot(dx, dy);
    if (d > 6) {
      mx = dx / d;
      my = dy / d;
    } else {
      input.tx = null;
    }
  }
  const len = Math.hypot(mx, my);
  thief.moving = len > 0.01;
  if (thief.moving) {
    const nx = mx / len;
    const ny = my / len;
    thief.face = Math.atan2(ny, nx);
    moveBody(thief, nx * THIEF.speed * dt, ny * THIEF.speed * dt, world);
  }

  // --- Loot: touch to grab; the diamond needs a steady crack.
  const diamond = world.loot.find((l) => l.kind === 'diamond');
  let nearDiamond = false;
  for (const item of world.loot) {
    if (item.taken) continue;
    const d = dist(thief.x, thief.y, item.x, item.y);
    if (item.kind === 'diamond') {
      if (d < 52) {
        nearDiamond = true;
        thief.crack += dt;
        if (thief.crack >= THIEF.crackSeconds) {
          item.taken = true;
          world.lootValue += item.value;
          burst(world, item.x, item.y, '#9be8ff', 26);
          world.floaters.push({ x: item.x, y: item.y - 20, text: `+$${item.value}`, life: 1.4, max: 1.4 });
          world.message = 'The Star of Meridian is yours — get to the EXIT!';
          world.messageTimer = 3.5;
        }
      }
      continue;
    }
    if (d < 44) {
      item.taken = true;
      world.lootValue += item.value;
      burst(world, item.x, item.y, '#f2c94c', 18);
      world.floaters.push({ x: item.x, y: item.y - 20, text: `+$${item.value}`, life: 1.4, max: 1.4 });
    }
  }
  if (!nearDiamond) thief.crack = Math.max(0, thief.crack - dt * 1.5);

  // --- Cameras sweep and watch.
  let seenByCamera = false;
  for (const cam of world.cameras) {
    cam.angle = cam.baseAngle + Math.sin(world.time * CAMERA.sweepSpeed + cam.phase) * CAMERA.sweepHalf;
    cam.seeing = canSee({ x: cam.x, y: cam.y, angle: cam.angle }, CAMERA.coneRange, CAMERA.coneHalf, world);
    if (cam.seeing) seenByCamera = true;
  }

  // --- Guards patrol, suspect, chase.
  let seenByGuard = false;
  for (const guard of world.guards) {
    const sees = canSee({ x: guard.x, y: guard.y, dir: guard.dir }, GUARD.coneRange, GUARD.coneHalf, world);
    if (sees) {
      seenByGuard = true;
      guard.exposure += dt;
      guard.lastSeen = { x: thief.x, y: thief.y };
      guard.loseTimer = 0;
    } else {
      guard.exposure = Math.max(0, guard.exposure - dt * 0.8);
      if (guard.state === 'chase') guard.loseTimer += dt;
    }
    const speed = (world.lockdown > 0 ? GUARD.lockdownSpeed : guard.state === 'chase' ? GUARD.chaseSpeed : GUARD.patrolSpeed) * guard.speedScale;
    if (world.lockdown > 0 || guard.exposure >= GUARD.chaseExposure) {
      guard.state = 'chase';
    } else if (guard.exposure >= GUARD.suspectExposure && guard.state === 'patrol') {
      guard.state = 'suspect';
    }
    if (guard.state === 'chase' && guard.loseTimer > GUARD.loseSightSeconds && world.lockdown <= 0) {
      guard.state = 'suspect';
      guard.loseTimer = 0;
    }
    let tx;
    let ty;
    if (guard.state === 'chase') {
      tx = thief.x;
      ty = thief.y;
    } else if (guard.state === 'suspect') {
      tx = guard.lastSeen.x;
      ty = guard.lastSeen.y;
      if (dist(guard.x, guard.y, tx, ty) < 18) guard.state = 'return';
    } else if (guard.state === 'return') {
      const wp = guard.waypoints[guard.wp];
      tx = wp[0];
      ty = wp[1];
      if (dist(guard.x, guard.y, tx, ty) < 18) guard.state = 'patrol';
    } else {
      if (guard.wait > 0) {
        guard.wait -= dt;
        tx = guard.x;
        ty = guard.y;
      } else {
        const wp = guard.waypoints[guard.wp];
        tx = wp[0];
        ty = wp[1];
        if (dist(guard.x, guard.y, tx, ty) < 14) {
          guard.wp = (guard.wp + 1) % guard.waypoints.length;
          guard.wait = GUARD.pauseAtWaypoint;
        }
      }
    }
    const dx = tx - guard.x;
    const dy = ty - guard.y;
    const d = Math.hypot(dx, dy);
    if (d > 2 && guard.wait <= 0) {
      const nx = dx / d;
      const ny = dy / d;
      guard.dir = Math.atan2(ny, nx);
      moveBody(guard, nx * speed * dt, ny * speed * dt, world);
    } else if (guard.state === 'patrol' && guard.wait > 0) {
      guard.dir += dt * 0.4;
    }
    if (guard.state === 'chase' && dist(guard.x, guard.y, thief.x, thief.y) < guard.radius + thief.radius + 2) {
      world.status = SCREEN_BUSTED;
      world.caughtBy = 'guard';
      return;
    }
  }

  // --- Lasers blink; crossing a lit beam spikes the alarm.
  for (const laser of world.lasers) {
    laser.cooldown = Math.max(0, laser.cooldown - dt);
    const cycle = (world.time + laser.phase) % 3.5;
    const lit = cycle < 2.2;
    laser.lit = lit;
    if (!lit || laser.cooldown > 0) continue;
    const px = thief.x;
    const py = thief.y;
    const lx = laser.x2 - laser.x1;
    const ly = laser.y2 - laser.y1;
    const len2 = lx * lx + ly * ly;
    const t = clamp(((px - laser.x1) * lx + (py - laser.y1) * ly) / len2, 0, 1);
    const cx = laser.x1 + lx * t;
    const cy = laser.y1 + ly * t;
    if (dist(px, py, cx, cy) < thief.radius + 4) {
      world.alarm = Math.min(100, world.alarm + ALARM.laserHit);
      laser.cooldown = 0.8;
      world.message = 'Laser tripped!';
      world.messageTimer = 1.6;
    }
  }

  // --- Alarm rises while seen, falls while hidden; 100 means lockdown.
  if (seenByGuard) world.alarm += ALARM.guardRate * dt;
  if (seenByCamera) world.alarm += ALARM.cameraRate * dt;
  if (!seenByGuard && !seenByCamera) world.alarm -= ALARM.decayRate * dt;
  world.alarm = clamp(world.alarm, 0, 100);
  world.alarmPeak = Math.max(world.alarmPeak, world.alarm);
  if (world.alarm >= 100 && world.lockdown <= 0) {
    world.lockdown = 6;
    world.message = 'LOCKDOWN! Every guard is coming for you!';
    world.messageTimer = 3;
  }
  if (world.lockdown > 0) {
    world.lockdown -= dt;
    if (world.lockdown <= 0) world.alarm = 55;
  }

  // --- Escape: the exit opens once the diamond is taken.
  const escaped = diamond.taken && thief.x > 612 && thief.x < 668 && thief.y > 676;
  if (escaped) {
    world.nightBonus = Math.max(0, 1200 - Math.floor(world.time) * 10);
    world.ghostBonus = world.alarmPeak < ALARM.ghostBelow ? 500 : 0;
    world.score += world.nightBonus + world.ghostBonus;
    world.status = world.night >= NIGHTS ? SCREEN_WIN : SCREEN_CLEAR;
    return;
  }

  if (world.messageTimer > 0) world.messageTimer -= dt;

  for (const p of world.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.96;
    p.vy *= 0.96;
    p.life -= dt;
  }
  world.particles = world.particles.filter((p) => p.life > 0);
  for (const f of world.floaters) {
    f.y -= 26 * dt;
    f.life -= dt;
  }
  world.floaters = world.floaters.filter((f) => f.life > 0);
}

/** Total loot value still on the floor, for the HUD. */
export function remainingLoot(world) {
  return world.loot.filter((l) => !l.taken).reduce((sum, l) => sum + l.value, 0);
}

export { STEP };
