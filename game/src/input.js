// Meridian Midnight: keyboard and mouse, turned into one movement input.
// Arrow keys and WASD move Rook; a mouse click sets a spot to walk to.

/** Fresh input state: held keys, a click target in field coordinates, or null. */
export function createInput() {
  return {
    mx: 0,
    my: 0,
    tx: null,
    ty: null,
    /** One-shot action for the next step: 'coin' or 'crack', consumed by the world. */
    action: null,
    keys: new Set(),
  };
}

/** Keys that move Rook, as (dx, dy) pairs. */
const MOVES = {
  ArrowUp: [0, -1],
  KeyW: [0, -1],
  ArrowDown: [0, 1],
  KeyS: [0, 1],
  ArrowLeft: [-1, 0],
  KeyA: [-1, 0],
  ArrowRight: [1, 0],
  KeyD: [1, 0],
};

function recompute(input) {
  let mx = 0;
  let my = 0;
  for (const code of input.keys) {
    const move = MOVES[code];
    if (move) {
      mx += move[0];
      my += move[1];
    }
  }
  input.mx = mx;
  input.my = my;
  if (mx !== 0 || my !== 0) {
    input.tx = null;
    input.ty = null;
  }
}

/**
 * Wire the canvas and window to the input state.
 * `onKey` sees every action key (Enter, P, M) after the movement keys update.
 */
export function bindInput(canvas, input, onKey) {
  window.addEventListener('keydown', (event) => {
    if (MOVES[event.code] || event.code === 'Space') event.preventDefault();
    if (event.repeat) return;
    input.keys.add(event.code);
    recompute(input);
    onKey(event.code);
  });
  window.addEventListener('keyup', (event) => {
    input.keys.delete(event.code);
    recompute(input);
  });
  window.addEventListener('blur', () => {
    input.keys.clear();
    recompute(input);
  });
  canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = 1280 / rect.width;
    const scaleY = 720 / rect.height;
    input.tx = (event.clientX - rect.left) * scaleX;
    input.ty = (event.clientY - rect.top) * scaleY;
  });
}
