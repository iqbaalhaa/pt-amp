import { test } from "node:test";
import assert from "node:assert/strict";
import { buildProductSpecRows, CONTACT_US } from "./product-specs";

test("katalog kosong: pakai grade statis, kolom tanpa data = Hubungi kami", () => {
  const rows = buildProductSpecRows([]);
  assert.deepEqual(
    rows.map((r) => [r.grade, r.packaging]),
    [
      ["Cinnamon Grade A", "Ball 40–60 kg"],
      ["Cinnamon Grade B", "Ball 40–60 kg"],
      ["Cinnamon Broken", "Sack 25 kg"],
    ]
  );
  for (const r of rows) {
    assert.equal(r.moisture, "< 14%");
    assert.equal(r.size, CONTACT_US);
    assert.equal(r.moq, CONTACT_US);
  }
});

test("produk dari database: nama, jenis & kadar air dipakai, sisanya Hubungi kami", () => {
  const rows = buildProductSpecRows([
    { id: "1", name: "Kulit Manis KA", type: "finished" },
    { id: "2", name: "Kulit Basah", type: null },
  ]);
  assert.equal(rows[0].key, "1");
  assert.equal(rows[0].grade, "Kulit Manis KA");
  assert.equal(rows[0].form, "Produk jadi");
  assert.equal(rows[1].form, CONTACT_US);
  for (const r of rows) {
    assert.equal(r.moisture, "< 14%");
    for (const v of [r.size, r.packaging, r.moq]) {
      assert.equal(v, CONTACT_US);
    }
  }
});
