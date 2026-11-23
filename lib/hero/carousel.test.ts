import test from "node:test";
import assert from "node:assert/strict";
import {
  canUpgradeTo4K,
  clampChapterIndex,
  computeProgressRatio,
  formatChapterNumber,
  getNextChapterIndex,
  getPrevChapterIndex,
} from "./carousel";

test("getNextChapterIndex and getPrevChapterIndex wrap cleanly across 6 chapters", () => {
  assert.equal(getNextChapterIndex(0, 6), 1);
  assert.equal(getNextChapterIndex(5, 6), 0);
  assert.equal(getPrevChapterIndex(0, 6), 5);
  assert.equal(getPrevChapterIndex(3, 6), 2);
});

test("clampChapterIndex bounds invalid indices", () => {
  assert.equal(clampChapterIndex(-2, 6), 0);
  assert.equal(clampChapterIndex(99, 6), 5);
  assert.equal(clampChapterIndex(2, 6), 2);
  assert.equal(clampChapterIndex(0, 0), 0);
});

test("computeProgressRatio clamps elapsed time between 0 and 1", () => {
  assert.equal(computeProgressRatio(-500, 8), 0);
  assert.equal(computeProgressRatio(4000, 8), 0.5);
  assert.equal(computeProgressRatio(12000, 8), 1);
});

test("formatChapterNumber zero-pads chapter indices", () => {
  assert.equal(formatChapterNumber(0), "01");
  assert.equal(formatChapterNumber(5), "06");
});

test("canUpgradeTo4K enforces downlink >= 10, width >= 1600, no saveData, no reducedMotion", () => {
  assert.equal(
    canUpgradeTo4K({
      viewportWidth: 1600,
      reducedMotion: false,
      connection: { downlink: 12, saveData: false },
    }),
    true
  );
  assert.equal(
    canUpgradeTo4K({
      viewportWidth: 1440,
      reducedMotion: false,
      connection: { downlink: 25, saveData: false },
    }),
    false
  );
  assert.equal(
    canUpgradeTo4K({
      viewportWidth: 1920,
      reducedMotion: true,
      connection: { downlink: 25, saveData: false },
    }),
    false
  );
  assert.equal(
    canUpgradeTo4K({
      viewportWidth: 1920,
      reducedMotion: false,
      connection: { downlink: 25, saveData: true },
    }),
    false
  );
  assert.equal(
    canUpgradeTo4K({
      viewportWidth: 1920,
      reducedMotion: false,
      connection: { downlink: 6, saveData: false },
    }),
    false
  );
});
