import { test } from "node:test";
import assert from "node:assert/strict";
import { parseUpahSettings, readUpahSettings } from "./upah-settings";

test("parse: kosong / null → null", () => {
  assert.equal(parseUpahSettings(null), null);
  assert.equal(parseUpahSettings(undefined), null);
  assert.equal(parseUpahSettings(""), null);
});

test("parse: JSON rusak atau bukan objek → null", () => {
  assert.equal(parseUpahSettings("{rusak"), null);
  assert.equal(parseUpahSettings("null"), null);
  assert.equal(parseUpahSettings("42"), null);
  assert.equal(parseUpahSettings('"teks"'), null);
});

test("parse: objek dikembalikan apa adanya", () => {
  const s = parseUpahSettings(
    JSON.stringify({ pemotonganPerKg: 2000, pemotonganRates: [{ id: "a", rate: 1 }] }),
  );
  assert.equal(s?.pemotonganPerKg, 2000);
  assert.deepEqual(s?.pemotonganRates, [{ id: "a", rate: 1 }]);
});

test("read: tanpa window → null", () => {
  assert.equal(readUpahSettings(), null);
});

test("read: dari localStorage", () => {
  const g = globalThis as { window?: unknown };
  g.window = {
    localStorage: { getItem: (k: string) => (k === "upahSettings" ? '{"pengikisanKa":7}' : null) },
  };
  try {
    assert.equal(readUpahSettings()?.pengikisanKa, 7);
  } finally {
    delete g.window;
  }
});
