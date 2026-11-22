// Meridian Midnight: every tuning number and colour in one place.
// The museum floor is a fixed 1280x720 logical area; the renderer scales it
// to the window, so no rule below depends on the screen size.

export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display rate. */
export const STEP = 1 / 60;

export const THIEF = {
  radius: 13,
  speed: 235,
  /** Seconds Rook must stand at the diamond case to crack it. */
  crackSeconds: 1.6,
};

export const GUARD = {
  radius: 14,
  patrolSpeed: 72,
  chaseSpeed: 148,
  lockdownSpeed: 172,
  /** Half-angle of a guard's vision cone, in radians. */
  coneHalf: 1.05,
  coneRange: 265,
  /** Seconds of being seen before a guard starts chasing. */
  chaseExposure: 0.9,
  /** Seconds of being seen before a guard gets suspicious. */
  suspectExposure: 0.35,
  /** Seconds without sight before a chasing guard gives up. */
  loseSightSeconds: 2.6,
  pauseAtWaypoint: 1.4,
};

export const CAMERA = {
  coneHalf: 0.62,
  coneRange: 305,
  /** Degrees per second the camera head sweeps. */
  sweepSpeed: 0.55,
  /** Half of the sweep arc, in radians. */
  sweepHalf: 0.85,
};

export const ALARM = {
  /** Per second while any guard sees Rook. */
  guardRate: 42,
  /** Per second while any camera sees Rook. */
  cameraRate: 26,
  /** Flat jump for crossing a lit laser beam. */
  laserHit: 32,
  /** Per second while nobody sees Rook. */
  decayRate: 5,
  /** At this level every guard converges on Rook. */
  lockdownAt: 100,
  /** Alarm level that counts as "spooked" for the Ghost bonus. */
  ghostBelow: 50,
};

export const NIGHTS = 3;

export const LOOT_VALUES = {
  painting: 400,
  bust: 800,
  vase: 500,
  diamond: 2500,
};

export const PALETTE = {
  floorLight: '#3a3348',
  floorDark: '#332d40',
  floorEdge: '#2a2436',
  carpet: '#7a1f2b',
  carpetEdge: '#a83240',
  wall: '#1c1626',
  wallTop: '#2e2440',
  caseGlass: 'rgba(150, 200, 255, 0.10)',
  caseFrame: '#c9a227',
  gold: '#f2c94c',
  goldDeep: '#c9962e',
  diamond: '#9be8ff',
  thief: '#151019',
  thiefTrim: '#e8b23a',
  guard: '#2c4a7c',
  guardTrim: '#dfe8ff',
  coneGuard: 'rgba(242, 201, 76, 0.38)',
  coneGuardAlert: 'rgba(229, 83, 75, 0.42)',
  coneCamera: 'rgba(229, 83, 75, 0.30)',
  hud: 'rgba(10, 8, 16, 0.82)',
  text: '#f2ead8',
  muted: '#9a8fb0',
  alarmLow: '#58c98a',
  alarmMid: '#f2c94c',
  alarmHigh: '#e5534b',
  exit: '#58c98a',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'meridian-midnight.best';
