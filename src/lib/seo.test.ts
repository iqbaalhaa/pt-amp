import { test } from "node:test";
import assert from "node:assert/strict";
import { organizationJsonLd, pageMetadata, productsJsonLd, serializeJsonLd } from "./seo";

const BASE = "https://example.test";

test("organization: hanya field yang ada di CMS", () => {
  const org = organizationJsonLd(null, [], BASE);
  assert.equal(org["@type"], "Organization");
  assert.equal(org.logo, `${BASE}/logoAMP.png`);
  for (const k of ["email", "telephone", "address", "sameAs"]) assert.ok(!(k in org), k);
});

test("organization: kontak & sosial aktif", () => {
  const org = organizationJsonLd(
    { email: " a@b.co ", phone: "", whatsapp: "+62 1", address: "Padang" },
    [{ url: "https://ig.com/x", isActive: true }, { url: "https://fb.com/x", isActive: false }, { url: "#", isActive: true }],
    BASE
  );
  assert.equal(org.email, "a@b.co");
  assert.equal(org.telephone, "+62 1");
  assert.equal(org.address, "Padang");
  assert.deepEqual(org.sameAs, ["https://ig.com/x"]);
});

test("products: ItemList Product, gambar absolut", () => {
  const ld = productsJsonLd([{ name: "Grade A", description: "d", image: "/uploads/a.jpg" }, { name: "B", image: "https://cdn/x.png" }], BASE);
  assert.equal(ld.itemListElement.length, 2);
  assert.equal(ld.itemListElement[0].item.image, `${BASE}/uploads/a.jpg`);
  assert.equal(ld.itemListElement[1].item.image, "https://cdn/x.png");
  assert.equal(ld.itemListElement[1].position, 2);
});

test("serializeJsonLd: escape </script>, tetap JSON valid", () => {
  const out = serializeJsonLd({ name: "</script><b>" });
  assert.ok(!out.includes("<"));
  assert.deepEqual(JSON.parse(out), { name: "</script><b>" });
});

test("pageMetadata: title + og + canonical", () => {
  const m = pageMetadata("Produk", "desc", "/products");
  assert.equal(m.title, "Produk | PT AMP");
  assert.equal((m.openGraph as { url: string }).url, "/products");
  assert.deepEqual(m.alternates, { canonical: "/products" });
});
