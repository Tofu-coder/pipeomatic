// Slow final approach, aspiration dwell, lift clearance, then horizontal travel.
// Quintic interpolation has zero velocity and acceleration at each mechanical stop.
const strokes = [
  { p: 0, x: 0, z: -72, liquid: 0 },
  { p: .06, x: 0, z: -72, liquid: 0 },
  { p: .16, x: 0, z: -12, liquid: 0 },
  { p: .21, x: 0, z: 0, liquid: 0 },
  { p: .25, x: 0, z: 0, liquid: 0 },
  { p: .32, x: 0, z: 0, liquid: 1 },
  { p: .35, x: 0, z: 0, liquid: 1 },
  { p: .44, x: 0, z: -72, liquid: 1 },
  { p: .47, x: 0, z: -72, liquid: 1 },
  { p: .61, x: 113, z: -72, liquid: 1 },
  { p: .64, x: 113, z: -72, liquid: 1 },
  { p: .71, x: 113, z: -12, liquid: 1 },
  { p: .76, x: 113, z: 0, liquid: 1 },
  { p: .79, x: 113, z: 0, liquid: 1 },
  { p: .85, x: 113, z: 0, liquid: 0 },
  { p: .88, x: 113, z: 0, liquid: 0 },
  { p: .97, x: 113, z: -72, liquid: 0 },
  { p: 1, x: 113, z: -72, liquid: 0 },
];
export function samplePipetteMotion(progress: number) {
  const p = Math.max(0, Math.min(1, progress));
  const i = strokes.findIndex((stroke) => stroke.p > p);
  const end = strokes[i < 0 ? strokes.length - 1 : i];
  const start = strokes[Math.max(0, (i < 0 ? strokes.length - 1 : i) - 1)];
  const t = Math.min(1, (p - start.p) / (end.p - start.p));
  const ease = t * t * t * (t * (t * 6 - 15) + 10);
  const mix = (a: number, b: number) => a + (b - a) * ease;
  return { x: mix(start.x, end.x), z: mix(start.z, end.z), liquid: mix(start.liquid, end.liquid) };
}
