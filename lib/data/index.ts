import { MockDataAdapter } from "./mockAdapter";
import type { DataAdapter } from "./types";

export function getDataAdapter(): DataAdapter {
  const mode = process.env.DATA_ADAPTER ?? "mock";
  if (mode === "mock" || !mode) {
    return new MockDataAdapter();
  }
  return new MockDataAdapter();
}

export * from "./types";
export {
  LAUNCH_CITIES,
  VENUE_SETTINGS,
  VENDOR_CATEGORIES,
  MOCK_HERO_SLIDES,
  MOCK_DECOR_PLATES,
  MOCK_EXPERIENCES,
  MOCK_VENUES,
  MOCK_VENDORS,
  MOCK_PROCESSION_STEPS,
  MOCK_REAL_WEDDINGS,
  MOCK_JOURNAL_DISPATCHES,
  MOCK_PARTNER_STATUS_SEED,
} from "./mockAdapter";
