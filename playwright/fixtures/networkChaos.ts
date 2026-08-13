import { test as base } from '@playwright/test';

// Fault injection for shaking out client-side request races.
//
// Uniform latency finds very little: Playwright's auto-waiting absorbs a
// slower-but-still-ordered backend. What breaks code is RESPONSE REORDERING -
// an earlier request resolving after a later one, so a stale closure wins and
// writes obsolete state. Reordering only happens when the spread between
// delays exceeds the natural spacing between requests, so the distribution is
// deliberately heavy tailed rather than uniform.
//
// Enable with PW_CHAOS=1. Every test records the seed it used as an
// annotation; replay a specific failure with PW_CHAOS_SEED=<that seed>.

const CHAOS_ENABLED = process.env.PW_CHAOS === '1';

// Only the app's own API traffic. Delaying bundles and fonts adds wall clock
// and load timeouts without producing any reordering worth finding.
const TARGET = '**/api/**';

type Band = { weight: number; min: number; max: number };

// Measured stage latency sits around 320ms, so the tail has to reach well past
// that for one response to overtake another.
const BANDS: Band[] = [
  // Most requests pass straight through. A few milliseconds of jitter would
  // not reorder anything, and holding every request open while it elapsed put
  // real load on the dev proxy.
  { weight: 70, min: 0, max: 0 },
  { weight: 20, min: 50, max: 400 }, // same order as real latency
  { weight: 10, min: 400, max: 2000 }, // the tail that causes overtaking
];

const TOTAL_WEIGHT = BANDS.reduce((sum, b) => sum + b.weight, 0);

// mulberry32 - small, fast, and good enough that a seed reproduces a run.
const makeRng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const pickDelay = (rng: () => number): number => {
  let roll = rng() * TOTAL_WEIGHT;
  for (const band of BANDS) {
    roll -= band.weight;
    if (roll <= 0) {
      return Math.floor(band.min + rng() * (band.max - band.min));
    }
  }
  return 0;
};

// Distinct per test so parallel workers scramble differently, but derived from
// the run seed so the whole suite replays from one env var.
const deriveSeed = (runSeed: number, testId: string): number => {
  let h = runSeed >>> 0;
  for (let i = 0; i < testId.length; i++) {
    h = (Math.imul(h ^ testId.charCodeAt(i), 0x01000193) + 1) >>> 0;
  }
  return h;
};

export type NetworkChaosFixture = {
  networkChaos: void;
};

export const test = base.extend<NetworkChaosFixture>({
  networkChaos: [
    async ({ page }, use, testInfo) => {
      if (!CHAOS_ENABLED) {
        await use(undefined);
        return;
      }

      const runSeed = process.env.PW_CHAOS_SEED
        ? Number(process.env.PW_CHAOS_SEED)
        : Math.floor(Math.random() * 0xffffffff);
      const seed = deriveSeed(
        runSeed,
        `${testInfo.titlePath.join(' > ')}#${testInfo.repeatEachIndex}`,
      );
      const rng = makeRng(seed);

      testInfo.annotations.push({
        type: 'chaos-seed',
        description: `PW_CHAOS_SEED=${runSeed} (test seed ${seed})`,
      });

      const delays: number[] = [];

      await page.route(TARGET, async (route) => {
        const delay = pickDelay(rng);
        delays.push(delay);
        if (delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
        // fallback rather than continue so other route handlers still apply
        await route.fallback();
      });

      await use(undefined);

      await page.unroute(TARGET);

      if (delays.length > 0) {
        const max = Math.max(...delays);
        const total = delays.reduce((a, b) => a + b, 0);
        testInfo.annotations.push({
          type: 'chaos-summary',
          description: `${delays.length} requests delayed, max ${max}ms, total ${total}ms`,
        });
      }
    },
    { auto: true },
  ],
});
