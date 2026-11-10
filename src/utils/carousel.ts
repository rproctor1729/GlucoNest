export function carouselIndex(index: number, count: number): number {
  if (!Number.isInteger(count) || count <= 0 || !Number.isFinite(index)) return 0;
  return ((Math.trunc(index) % count) + count) % count;
}

export function canRotateCarousel(state: {
  requested: boolean; hovered: boolean; visible: boolean; inView: boolean; ready: boolean;
}): boolean {
  return state.requested && !state.hovered && state.visible && state.inView && state.ready;
}

// React Bits' damped spring, substepped for consistent settling at different frame rates.
export function springFrame(position: number, velocity: number, target: number, seconds: number, reducedMotion = false) {
  if (reducedMotion) return { position: target, velocity: 0, settled: true };
  const dt = Math.min(.05, Math.max(0, seconds));
  const steps = Math.max(1, Math.ceil(dt * 240));
  const h = dt / steps;
  for (let step = 0; step < steps; step++) {
    velocity += (150 * (target - position) - 24 * velocity) * h;
    position += velocity * h;
  }
  const settled = Math.abs(target - position) < .0004 && Math.abs(velocity) < .004;
  return { position: settled ? target : position, velocity: settled ? 0 : velocity, settled };
}
