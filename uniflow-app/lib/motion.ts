export const MOTION = {
  fast: 150,
  normal: 250,
  slow: 320,
  stagger: 45,
  maxStagger: 180,
  pressScale: 0.97,
  splash: {
    hold: 500,
    reveal: 520,
    total: 1020,
  },
} as const;

export function staggerDelay(index: number): number {
  return Math.min(index * MOTION.stagger, MOTION.maxStagger);
}