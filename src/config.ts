export const CONFIG = {
  gameName: 'i CUBE TEST',
  tagline: 'THINK IN THREE DIMENSIONS.',
  roomSize: 6,
  wallThickness: 0.12,
  gridSpacing: 1.5,
  player: { radius: 0.34, eyeHeight: 1.25, height: 1.52, walkSpeed: 3, jogMultiplier:1.25, ladderSpeed: 2.4, ladderTraverseSpeed:1.25, turnSpeed: 1.8, turnAroundSpeed: 5.5 },
  camera: {
    fov: 70,
    minPitch: -82 * (Math.PI / 180),
    maxPitch: 82 * (Math.PI / 180),
    lookUpPitch: 88 * (Math.PI / 180),
    sensitivity: 0.0026,
    touchSensitivity: 0.0042,
    lookBlendSpeed: 10,
  },
  colors: { room: 0xf6f8fa, grid: 0xcdd3da, accent: 0x58a8ff, dark: 0x071529 },
  // Independent of normal jog and ladder speeds.
  jump: { verticalSpeed:6.2, forwardSpeed:2.4, ladderForwardSpeed:4.8, gravity:13 },
  answer: { maxAttempts: 2, pointOffset: [1.7, -2.86, 1.95] as const, pointRadius: 1.55 },
  reveal: { glowHoldMs: 850, flashInMs: 320, flashHoldMs: 180, flashOutMs: 680, resultDelayMs: 250 },
} as const;
