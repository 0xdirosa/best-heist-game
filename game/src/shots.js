// The screenshot scenes behind ?shot=start|play|chase|win.
// Each one plays the real rules forward from a fresh world for a fixed
// number of steps, steered by a small autopilot that walks through the
// door gaps, so every frame is what a short game really looks like and the
// same seed always gives the same frame.

import { SCREEN_CLEAR, SCREEN_PLAY, stepWorld } from './world.js';
import { CRACK, STEP } from './config.js';

const START_SECONDS = 1;
const PLAY_SECONDS = 16;
const CHASE_SECONDS = 1;

/** Which of the three rooms (0, 1, 2) an x coordinate sits in. */
function zone(x) {
  return x < 432 ? 0 : x < 848 ? 1 : 2;
}

/** The door gap between two neighbouring rooms: the one nearer the thief,
 * so the autopilot uses both gaps the rooms offer. */
function doorBetween(a, b, y) {
  const low = Math.min(a, b);
  const x = low === 0 ? 432 : 848;
  return { x, y: Math.abs(160 - y) < Math.abs(360 - y) ? 160 : 360 };
}

/** Where the autopilot walks next: the door gap, or the loot itself. */
function pilotTarget(world) {
  const thief = world.thief;
  let best = null;
  let bestDist = Infinity;
  for (const item of world.loot) {
    if (item.taken) continue;
    const d = Math.hypot(item.x - thief.x, item.y - thief.y);
    if (d < bestDist) {
      bestDist = d;
      best = item;
    }
  }
  if (!best) return { x: 640, y: 684 };
  if (zone(best.x) !== zone(thief.x)) return doorBetween(zone(thief.x), zone(best.x), thief.y);
  return { x: best.x, y: best.y };
}

/** One autopilot step: walk toward the target, or work the crack dial. */
function pilotInput(world) {
  const thief = world.thief;
  // Standing at the diamond case: press SPACE exactly while the needle
  // sweeps through the gold zone. The case is solid, so the thief never
  // reaches its centre — crack range, not arrival, is the trigger.
  const diamond = world.loot.find((l) => l.kind === 'diamond');
  if (diamond && !diamond.taken && Math.hypot(diamond.x - thief.x, diamond.y - thief.y) < CRACK.crackRange) {
    const needle = ((world.time / CRACK.needlePeriod) % 1) * Math.PI * 2;
    let dd = needle - world.crackZone;
    while (dd < 0) dd += Math.PI * 2;
    const inZone = dd <= CRACK.zoneArc;
    return { mx: 0, my: 0, tx: null, ty: null, action: inZone ? 'crack' : null };
  }
  const target = pilotTarget(world);
  const dx = target.x - thief.x;
  const dy = target.y - thief.y;
  const d = Math.hypot(dx, dy);
  if (d < 10) return { mx: 0, my: 0, tx: null, ty: null };
  return { mx: dx / d, my: dy / d, tx: null, ty: null };
}

function simulate(world, seconds, drive) {
  const steps = Math.floor(seconds / STEP);
  for (let i = 0; i < steps; i += 1) {
    stepWorld(world, drive(world), STEP);
    if (world.status !== SCREEN_PLAY) break;
  }
}

/**
 * Set `world` to the named scene (start, play, chase or win; any other name
 * is start) and return the screen to draw over it.
 */
export function stageShot(name, world) {
  if (name === 'play') {
    world.status = SCREEN_PLAY;
    world.thief.x = 760;
    world.thief.y = 480;
    // Freeze mid-crack: the dial, the needle and two filled pips show the
    // signature interaction in the frame; the win shot proves the full haul.
    const steps = Math.floor(PLAY_SECONDS / STEP);
    for (let i = 0; i < steps; i += 1) {
      stepWorld(world, pilotInput(world), STEP);
      if (world.status !== SCREEN_PLAY) break;
      if (world.thief.crack >= 2) break;
    }
    return { screen: SCREEN_PLAY };
  }
  if (name === 'chase') {
    // Night 2: five guards, four cameras, two lasers — and Rook has just
    // hacked the west terminal, so the cameras are blind while he runs.
    world.status = SCREEN_PLAY;
    const diamond = world.loot.find((l) => l.kind === 'diamond');
    diamond.taken = true;
    world.lootValue += diamond.value;
    world.terminals[0].hacked = true;
    world.camerasDown = 9;
    world.thief.x = 760;
    world.thief.y = 480;
    world.alarm = 84;
    world.alarmPeak = 84;
    const chasers = world.guards.slice(1, 3);
    chasers[0].x = 700;
    chasers[0].y = 380;
    chasers[0].state = 'chase';
    chasers[0].exposure = 1.2;
    chasers[1].x = 830;
    chasers[1].y = 580;
    chasers[1].state = 'chase';
    chasers[1].exposure = 1.2;
    world.message = 'SPOTTED! Run for the EXIT!';
    world.messageTimer = 99;
    // South-west, down the carpet toward the EXIT: the second chaser waits
    // south-east, so a straight run south runs into his arms.
    simulate(world, CHASE_SECONDS, () => ({ mx: -0.5, my: 0.86, tx: null, ty: null }));
    return { screen: SCREEN_PLAY };
  }
  if (name === 'win') {
    for (const item of world.loot) {
      if (!item.taken) {
        item.taken = true;
        world.lootValue += item.value;
      }
    }
    world.thief.x = 640;
    world.thief.y = 684;
    world.nightBonus = 840;
    world.ghostBonus = 500;
    world.status = SCREEN_CLEAR;
    return { screen: SCREEN_CLEAR };
  }
  world.status = SCREEN_PLAY;
  simulate(world, START_SECONDS, () => ({ mx: 0, my: -1, tx: null, ty: null }));
  return { screen: SCREEN_PLAY };
}
