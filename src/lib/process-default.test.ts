import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_PROCESS_STEPS, resolveProcessSteps } from "./process-default";

test("default: 5 langkah berurutan kebun → ekspor, tanpa foto", () => {
  assert.deepEqual(
    DEFAULT_PROCESS_STEPS.map((s) => s.title),
    ["Panen", "Pengeringan", "Sortir & Grading", "Pengemasan", "Pengiriman"]
  );
  assert.deepEqual(DEFAULT_PROCESS_STEPS.map((s) => s.order), [1, 2, 3, 4, 5]);
  for (const s of DEFAULT_PROCESS_STEPS) {
    assert.equal(s.image, null);
    assert.ok(s.icon);
  }
});

test("CMS kosong pakai default, CMS berisi dipakai apa adanya", () => {
  assert.equal(resolveProcessSteps([]), DEFAULT_PROCESS_STEPS);
  const cms = [{ id: "a", title: "Panen", description: "x", icon: null, image: "/uploads/a.jpg" }];
  assert.equal(resolveProcessSteps(cms), cms);
});
