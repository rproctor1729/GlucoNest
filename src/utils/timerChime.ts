// Plays the optional timer-finished chime. Keeps the AudioContext lifecycle in one place:
// resume before playing (some browsers start suspended), always close afterwards, and
// never throw. Callers can cancel early, for example when the modal closes.

export interface ChimeOscillator {
  frequency: { setValueAtTime(value: number, time: number): void };
  connect(node: unknown): void;
  start(): void;
  stop(time: number): void;
}

export interface ChimeGain {
  gain: { setValueAtTime(value: number, time: number): void };
  connect(node: unknown): void;
}

export interface ChimeAudioContext {
  readonly currentTime: number;
  readonly destination: unknown;
  readonly state?: string;
  resume(): Promise<void>;
  close(): Promise<void>;
  createOscillator(): ChimeOscillator;
  createGain(): ChimeGain;
}

export type ChimeStatus = 'played' | 'blocked' | 'unavailable' | 'error' | 'cancelled';

export interface TimerChime {
  status: Promise<ChimeStatus>;
  cancel(): Promise<void>;
}

const CHIME_DURATION_MS = 1300;

async function closeQuietly(context: ChimeAudioContext): Promise<void> {
  try {
    await context.close();
  } catch {
    // Already closed, or the browser refused. Nothing else to clean up.
  }
}

export function startTimerChime(createContext: () => ChimeAudioContext | null): TimerChime {
  let context: ChimeAudioContext | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let settled = false;
  let resolveStatus: (status: ChimeStatus) => void = () => undefined;

  const status = new Promise<ChimeStatus>((resolve) => {
    resolveStatus = resolve;
  });

  // Every outcome goes through here: clear the timer, close the context, report once.
  const settle = async (result: ChimeStatus): Promise<void> => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    const current = context;
    context = null;
    if (!settled) {
      settled = true;
      resolveStatus(result);
    }
    if (current) await closeQuietly(current);
  };

  const run = async () => {
    let created: ChimeAudioContext | null;
    try {
      created = createContext();
    } catch {
      await settle('unavailable');
      return;
    }
    if (!created) {
      await settle('unavailable');
      return;
    }
    context = created;

    try {
      if (created.state === 'suspended') await created.resume();
    } catch {
      // The browser needs a user gesture first. The chime is optional, so skip it quietly.
      await settle('blocked');
      return;
    }
    if (settled) return; // Cancelled while resuming.

    try {
      const oscillator = created.createOscillator();
      const gain = created.createGain();
      oscillator.connect(gain);
      gain.connect(created.destination);
      oscillator.frequency.setValueAtTime(587.33, created.currentTime);
      gain.gain.setValueAtTime(0.2, created.currentTime);
      oscillator.start();
      oscillator.stop(created.currentTime + 1.2);
    } catch {
      await settle('error');
      return;
    }

    timer = setTimeout(() => {
      void settle('played');
    }, CHIME_DURATION_MS);
  };

  void run();

  return {
    status,
    cancel: () => settle('cancelled'),
  };
}
