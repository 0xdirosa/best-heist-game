// Meridian Midnight: boot, the fixed-step loop, screens and screenshot mode.
// Open game/index.html to play; open it with ?shot=start|play|chase|win
// (and &seed=N) to stage one deterministic frame for a screenshot.

import { BEST_KEY, FIELD, STEP } from './config.js';
import { createAudio } from './audio.js';
import { bindInput, createInput } from './input.js';
import { render } from './render.js';
import { stageShot } from './shots.js';
import { SCREEN_BUSTED, SCREEN_CLEAR, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN, createWorld, stepWorld } from './world.js';

const canvas = document.getElementById('game');
const statusLine = document.getElementById('status');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seed = Number(params.get('seed') || 1) || 1;

const audio = createAudio();
const input = createInput();
let world = createWorld(1, seed);
let best = 0;
try {
  best = Number(window.localStorage.getItem(BEST_KEY) || 0) || 0;
} catch {
  best = 0;
}
let accumulator = 0;
let lastTime = 0;
let stepCount = 0;

function saveBest() {
  if (world.score > best) {
    best = world.score;
    try {
      window.localStorage.setItem(BEST_KEY, String(best));
    } catch {
      // Private mode: the score just does not persist.
    }
  }
}

function announce(text) {
  if (statusLine) statusLine.textContent = text;
}

function beginNight(night) {
  const keepScore = world.score;
  world = createWorld(night, seed + night);
  world.score = keepScore;
  world.status = SCREEN_PLAY;
  announce(`Night ${night}: steal the Star of Meridian, then reach the exit.`);
}

function onKey(code) {
  audio.ensure();
  if (code === 'KeyM') {
    const muted = audio.toggleMute();
    announce(muted ? 'Sound off.' : 'Sound on.');
    return;
  }
  if (code === 'Enter' || code === 'NumpadEnter') {
    if (world.status === SCREEN_TITLE) {
      world.status = SCREEN_PLAY;
      announce('Night 1: steal the Star of Meridian, then reach the exit.');
    } else if (world.status === SCREEN_BUSTED) {
      beginNight(world.night);
    } else if (world.status === SCREEN_CLEAR) {
      beginNight(world.night + 1);
    } else if (world.status === SCREEN_WIN) {
      world.score = 0;
      beginNight(1);
    }
    return;
  }
  if (code === 'KeyP' && (world.status === SCREEN_PLAY || world.status === SCREEN_PAUSED)) {
    world.status = world.status === SCREEN_PLAY ? SCREEN_PAUSED : SCREEN_PLAY;
    announce(world.status === SCREEN_PAUSED ? 'Paused.' : 'Back to the heist.');
  }
}

bindInput(canvas, input, onKey);

function frame(now) {
  const dt = Math.min(0.1, (now - lastTime) / 1000 || 0);
  lastTime = now;
  if (world.status === SCREEN_PLAY) {
    accumulator += dt;
    while (accumulator >= STEP) {
      stepWorld(world, input, STEP);
      accumulator -= STEP;
      stepCount += 1;
      if (stepCount % 30 === 0 && world.thief.moving) audio.step();
      if (world.status !== SCREEN_PLAY) break;
    }
    audio.alarm(world.alarm >= 70);
    if (world.status === SCREEN_BUSTED) {
      audio.alarm(false);
      audio.busted();
      announce('Busted! A guard caught Rook. Press Enter to try this night again.');
    } else if (world.status === SCREEN_CLEAR || world.status === SCREEN_WIN) {
      audio.alarm(false);
      audio.win();
      saveBest();
      announce(world.status === SCREEN_WIN ? 'The perfect heist!' : `Night ${world.night} clear.`);
    }
  } else {
    audio.alarm(false);
  }
  render(ctx, world, now / 1000, best);
  window.requestAnimationFrame(frame);
}

if (shotName) {
  // Screenshot mode: stage one frame and draw it once, frozen.
  const staged = stageShot(shotName, world);
  world.status = staged.screen;
  render(ctx, world, 4.2, best);
  document.title = `Meridian Midnight — shot ${shotName}`;
} else {
  announce('Meridian Midnight. Press Enter to begin the heist.');
  window.requestAnimationFrame((now) => {
    lastTime = now;
    window.requestAnimationFrame(frame);
  });
}
