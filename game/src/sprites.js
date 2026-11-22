// Meridian Midnight v6: sprite sheets.
// The museum set is drawn as code with pxl (game/pxl/museum.px.js); the
// smoke and the spinning Star are pixelfx sheets, exported with
// `node tools/render.mjs <id> --sheet` and recolored ice-blue for the gem.
// The frame rects are baked in here (copied from each sheet's JSON) so the
// game never has to fetch JSON at runtime; the PNGs load as Images and
// main.js waits for them before the first frame is drawn.
// The pixelfx frames are side-view sheets with a floor strip at the bottom:
// the smoke is cropped to its pivot height (156 of 176) and the gem to
// 56 of 64, so only the cloud and the gem reach the top-down frame.

const MUSEUM_FRAMES = {
  parquet_tile: [0, 0, 16, 16],
  marble_tile: [17, 0, 16, 16],
  carpet_tile: [34, 0, 16, 16],
  guard_topdown: [51, 0, 18, 18],
  rook_topdown: [70, 0, 18, 18],
  rook_disguised: [0, 19, 18, 18],
  painting_a: [19, 19, 16, 12],
  painting_b: [36, 19, 16, 12],
  painting_c: [53, 19, 16, 12],
  bust: [70, 19, 18, 18],
  vase: [0, 38, 18, 18],
  idol: [19, 38, 18, 18],
  terminal: [38, 38, 16, 20],
  rack_uniform: [55, 38, 18, 18],
  camera_dome: [74, 38, 18, 18],
  coin: [0, 59, 12, 12],
  plant: [13, 59, 18, 18],
  bench: [32, 59, 24, 12],
  stanchion: [57, 59, 8, 16],
};

// pixelfx smoke-bomb: 151 frames, 30 fps, 5 s one-shot, 11 columns,
// frame 260x176, pivot (130, 156) — the floor strip starts at y 156.
const SMOKE = { file: 'assets/smoke-bomb.png', frameW: 260, frameH: 176, cropH: 156, cols: 11, frames: 151, seconds: 5 };
// pixelfx gem-spin, recolored ice: 72 frames, 30 fps, 2.4 s loop,
// 9 columns, frame 64x64, pivot (32, 56) — the floor strip starts at y 56.
const GEM = { file: 'assets/gem-spin.png', frameW: 64, frameH: 64, cropH: 56, cols: 9, frames: 72, loopSeconds: 2.4 };

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Load the three sheets; throws when the museum sheet fails, because
 * the characters and the loot would have nothing to draw with. */
export async function loadSprites() {
  const [museum, smoke, gem] = await Promise.all([
    loadImage('assets/museum.png'),
    loadImage(SMOKE.file),
    loadImage(GEM.file),
  ]);
  if (!museum) throw new Error('museum sprite sheet failed to load');
  return { museum, smoke, gem, patterns: new Map() };
}

/** Draw one museum sprite, centred on (cx, cy), at `scale` times its
 * pixel size. Pixel art stays crisp: the canvas is not smoothed here. */
export function drawMuseum(ctx, sprites, name, cx, cy, scale) {
  const f = MUSEUM_FRAMES[name];
  if (!f) return;
  const w = f[2] * scale;
  const h = f[3] * scale;
  ctx.drawImage(sprites.museum, f[0], f[1], f[2], f[3], cx - w / 2, cy - h / 2, w, h);
}

/** A repeating floor pattern from one tile sprite, cached per sheet.
 * The tile is pre-scaled 2x (32 px) so the planks read as a floor, not
 * as a dense brick wall. */
export function museumPattern(ctx, sprites, name) {
  const cached = sprites.patterns.get(name);
  if (cached) return cached;
  const f = MUSEUM_FRAMES[name];
  const tile = document.createElement('canvas');
  tile.width = f[2] * 2;
  tile.height = f[3] * 2;
  const tctx = tile.getContext('2d');
  tctx.imageSmoothingEnabled = false;
  tctx.drawImage(sprites.museum, f[0], f[1], f[2], f[3], 0, 0, f[2] * 2, f[3] * 2);
  const pattern = ctx.createPattern(tile, 'repeat');
  sprites.patterns.set(name, pattern);
  return pattern;
}

/** One frame of the smoke sheet for a cloud with `life` seconds left
 * (5 at the drop, 0 when it clears), drawn centred on the cloud. The
 * visible cloud at full size is about 190 px across, the cloud's radius. */
export function drawSmokeFrame(ctx, sprites, x, y, life) {
  if (!sprites.smoke) return;
  const idx = Math.max(0, Math.min(SMOKE.frames - 1, Math.floor((1 - life / SMOKE.seconds) * SMOKE.frames)));
  const col = idx % SMOKE.cols;
  const row = Math.floor(idx / SMOKE.cols);
  const scale = 0.95;
  const w = SMOKE.frameW * scale;
  const h = SMOKE.cropH * scale;
  ctx.drawImage(
    sprites.smoke,
    col * SMOKE.frameW, row * SMOKE.frameH, SMOKE.frameW, SMOKE.cropH,
    x - w / 2, y - h / 2, w, h,
  );
}

/** One frame of the spinning Star, looping every 2.4 s, drawn centred
 * on the diamond case. */
export function drawGemFrame(ctx, sprites, x, y, time) {
  if (!sprites.gem) return;
  const idx = Math.floor(((time % GEM.loopSeconds) / GEM.loopSeconds) * GEM.frames) % GEM.frames;
  const col = idx % GEM.cols;
  const row = Math.floor(idx / GEM.cols);
  const w = 80;
  const h = (GEM.cropH / GEM.frameW) * w;
  ctx.drawImage(
    sprites.gem,
    col * GEM.frameW, row * GEM.frameH, GEM.frameW, GEM.cropH,
    x - w / 2, y - h / 2, w, h,
  );
}
