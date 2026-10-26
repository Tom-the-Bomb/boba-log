import { dayFromParts, dayParts, daysInMonth } from "./date";

/** A fixed, fully synthetic year of drinks for the landing page. */
export const SAMPLE_YEAR = 2025;

export const SAMPLE_SHOPS = [
  { name: "Chagee", avatar: "/default-shops/chagee.webp" },
  { name: "Heytea", avatar: "/default-shops/heytea.webp" },
  { name: "Molly Tea", avatar: "/default-shops/molly-tea.webp" },
] as const;

const SHOP_WEIGHTS = [0.48, 0.31, 0.21];

// Small deterministic PRNG so the sample is identical on every visit.
function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSample() {
  const random = mulberry32(20250101);
  const counts = new Map<string, number>();
  const shopTotals = [0, 0, 0];

  for (let month = 0; month < 12; month++) {
    // Warmer months bring more drinks.
    const season = 0.55 + 0.45 * Math.sin(((month - 2) / 11) * Math.PI);
    for (let date = 1; date <= daysInMonth(SAMPLE_YEAR, month); date++) {
      const day = dayFromParts(SAMPLE_YEAR, month, date);
      const weekend = [5, 6].includes(dayParts(day).weekday) ? 1.6 : 1;
      let count = 0;
      while (
        count < 4 &&
        random() < 0.34 * season * weekend * (count ? 0.6 : 1)
      ) {
        count += 1;
      }
      if (count > 0) {
        counts.set(day, count);
        for (let i = 0; i < count; i++) {
          const pick = random();
          const shop =
            pick < SHOP_WEIGHTS[0]
              ? 0
              : pick < SHOP_WEIGHTS[0] + SHOP_WEIGHTS[1]
                ? 1
                : 2;
          shopTotals[shop] += 1;
        }
      }
    }
  }

  return { counts, shopTotals };
}

export const SAMPLE = buildSample();
